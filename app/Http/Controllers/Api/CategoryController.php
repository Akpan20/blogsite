<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $query = Category::query();

        if ($request->has('parent_id')) {
            if ($request->parent_id === 'null') {
                $query->root();
            } else {
                // Cast to string — MongoDB _id comparisons must be strings
                $query->where('parent_id', (string) $request->parent_id);
            }
        }

        if ($request->boolean('featured')) {
            $query->featured();
        }

        if ($request->boolean('with_posts_count')) {
            $query->withPostsCount();
        }

        if ($request->boolean('with_children')) {
            $query->with(['children' => function ($q) use ($request) {
                $q->ordered();
                if ($request->boolean('with_posts_count')) {
                    $q->withPostsCount();
                }
            }]);
        }

        $categories = $query->ordered()->get();

        return response()->json($categories);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'             => 'required|string|max:255',
            // unique validation works with laravel-mongodb out of the box
            'slug'             => 'nullable|string|unique:categories,slug',
            'description'      => 'nullable|string',
            'color'            => 'nullable|string|size:7|regex:/^#[0-9A-Fa-f]{6}$/',
            'icon'             => 'nullable|string|max:50',
            'parent_id'        => 'nullable|exists:categories,_id',
            'order'            => 'nullable|integer|min:0',
            'is_featured'      => 'boolean',
            'meta_title'       => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            // MongoDB does not support multi-document transactions unless
            // running a replica set. Wrap only if your setup supports it;
            // otherwise create directly.
            $category = Category::create($request->all());

            $category->load('parent');

            if ($request->boolean('with_posts_count')) {
                // loadCount uses $lookup aggregation in laravel-mongodb
                $category->loadCount(['posts' => fn($q) => $q->published()]);
            }

            return response()->json($category, 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create category',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    public function show($slug)
    {
        $category = Category::where('slug', $slug)
            ->with(['children' => fn($q) => $q->ordered()->withPostsCount()])
            ->withPostsCount()
            ->firstOrFail();

        return response()->json($category);
    }

    public function update(Request $request, Category $category)
    {
        $validator = Validator::make($request->all(), [
            'name'             => 'string|max:255',
            // Exclude current doc by _id instead of id
            'slug'             => 'string|unique:categories,slug,' . (string) $category->_id . ',_id',
            'description'      => 'nullable|string',
            'color'            => 'nullable|string|size:7|regex:/^#[0-9A-Fa-f]{6}$/',
            'icon'             => 'nullable|string|max:50',
            'parent_id'        => 'nullable|exists:categories,_id',
            'order'            => 'nullable|integer|min:0',
            'is_featured'      => 'boolean',
            'meta_title'       => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if ($request->has('parent_id')) {
            if ((string) $request->parent_id === (string) $category->_id) {
                return response()->json([
                    'errors' => ['parent_id' => ['Category cannot be its own parent']],
                ], 422);
            }

            if ($request->parent_id !== null && !$category->canSetParent($request->parent_id)) {
                return response()->json([
                    'errors' => ['parent_id' => ['This would create a circular reference in the category hierarchy']],
                ], 422);
            }
        }

        try {
            $category->update($request->all());
            $category->load('parent', 'children');

            if ($request->boolean('with_posts_count')) {
                $category->loadCount(['posts' => fn($q) => $q->published()]);
            }

            return response()->json($category);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update category',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy(Category $category)
    {
        try {
            $category->safeDelete();
            return response()->json(['message' => 'Category deleted successfully']);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function posts(Request $request, $slug)
    {
        $category = Category::where('slug', $slug)->firstOrFail();

        $posts = $category->posts()
            ->published()
            ->with(['user', 'tags'])
            ->withCount(['comments', 'likes'])
            ->latest('published_at')
            ->paginate($request->input('per_page', 15));

        return response()->json($posts);
    }

    public function tree(Request $request)
    {
        $query = Category::root()
            ->with(['children' => function ($q) {
                $q->ordered()->withPostsCount()
                  ->with(['children' => fn($nested) => $nested->ordered()->withPostsCount()]);
            }])
            ->ordered();

        if ($request->boolean('with_posts_count')) {
            $query->withPostsCount();
        }

        return response()->json($this->buildTree($query->get()));
    }

    public function reorder(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'categories'            => 'required|array',
            'categories.*.id'       => 'required|exists:categories,_id',
            'categories.*.order'    => 'required|integer|min:0',
            'categories.*.parent_id'=> 'nullable|exists:categories,_id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Validate circular references before writing anything
        foreach ($request->categories as $item) {
            if (!empty($item['parent_id'])) {
                $category = Category::find($item['id']);
                if (!$category || !$category->canSetParent($item['parent_id'])) {
                    return response()->json([
                        'errors' => ['categories' => ["Category {$category->name} would create a circular reference"]],
                    ], 422);
                }
            }
        }

        try {
            foreach ($request->categories as $item) {
                $updateData = ['order' => $item['order']];

                if (isset($item['parent_id'])) {
                    $updateData['parent_id'] = $item['parent_id'];
                }

                // Use _id for MongoDB document lookup
                Category::where('_id', $item['id'])->update($updateData);
            }

            return response()->json(['message' => 'Categories reordered successfully']);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to reorder categories',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    public function forceDestroy(Category $category)
    {
        try {
            $allCategories = collect([$category])->merge($category->getDescendants());

            foreach ($allCategories as $cat) {
                $cat->posts()->delete();
            }

            // forceDelete works with laravel-mongodb's SoftDeletes trait
            $category->forceDelete();

            return response()->json(['message' => 'Category permanently deleted']);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete category',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    public function restore($id)
    {
        // onlyTrashed() works with laravel-mongodb's SoftDeletes
        $category = Category::onlyTrashed()->findOrFail($id);

        try {
            $category->restore();
            return response()->json([
                'message'  => 'Category restored successfully',
                'category' => $category->fresh(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to restore category',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    public function breadcrumb($slug)
    {
        $category = Category::where('slug', $slug)->firstOrFail();

        return response()->json([
            'path'      => $category->getPath(),
            'ancestors' => $category->getAncestors(),
            'category'  => $category,
        ]);
    }

    protected function buildTree($categories)
    {
        return $categories->map(function ($category) {
            $data = [
                // Expose _id as string for consistency with frontend
                'id'    => (string) $category->_id,
                'name'  => $category->name,
                'slug'  => $category->slug,
                'color' => $category->color,
                'icon'  => $category->icon,
            ];

            if ($category->relationLoaded('posts')) {
                $data['posts_count'] = $category->posts_count;
            } elseif (isset($category->posts_count)) {
                $data['posts_count'] = $category->posts_count;
            }

            if ($category->relationLoaded('children') && $category->children->isNotEmpty()) {
                $data['children'] = $this->buildTree($category->children);
            }

            return $data;
        });
    }
}