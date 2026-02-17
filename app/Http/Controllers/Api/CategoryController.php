<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $query = Category::query();

        // Filter by parent
        if ($request->has('parent_id')) {
            if ($request->parent_id === 'null') {
                $query->root();
            } else {
                $query->where('parent_id', $request->parent_id);
            }
        }

        // Filter featured
        if ($request->boolean('featured')) {
            $query->featured();
        }

        // FIXED: Always use withCount instead of relying on accessor
        if ($request->boolean('with_posts_count')) {
            $query->withPostsCount();
        }

        // Include children
        if ($request->boolean('with_children')) {
            $query->with(['children' => function ($q) use ($request) {
                $q->ordered();
                // Recursively load posts count for children too
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
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|unique:categories,slug',
            'description' => 'nullable|string',
            'color' => 'nullable|string|size:7|regex:/^#[0-9A-Fa-f]{6}$/',
            'icon' => 'nullable|string|max:50',
            'parent_id' => 'nullable|exists:categories,id',
            'order' => 'nullable|integer|min:0',
            'is_featured' => 'boolean',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // FIXED: Wrap in transaction for data consistency
        try {
            $category = DB::transaction(function () use ($request) {
                return Category::create($request->all());
            });

            // Load relationships for response
            $category->load('parent');
            if ($request->boolean('with_posts_count')) {
                $category->loadCount(['posts' => function ($q) {
                    $q->published();
                }]);
            }

            return response()->json($category, 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create category',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($slug)
    {
        $category = Category::where('slug', $slug)
            ->with(['children' => function ($q) {
                $q->ordered()->withPostsCount();
            }])
            ->withPostsCount()
            ->firstOrFail();

        return response()->json($category);
    }

    public function update(Request $request, Category $category)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'string|max:255',
            'slug' => 'string|unique:categories,slug,' . $category->id,
            'description' => 'nullable|string',
            'color' => 'nullable|string|size:7|regex:/^#[0-9A-Fa-f]{6}$/',
            'icon' => 'nullable|string|max:50',
            'parent_id' => 'nullable|exists:categories,id',
            'order' => 'nullable|integer|min:0',
            'is_featured' => 'boolean',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // FIXED: Enhanced circular reference prevention
        if ($request->has('parent_id')) {
            // Prevent setting itself as parent
            if ($request->parent_id == $category->id) {
                return response()->json([
                    'errors' => ['parent_id' => ['Category cannot be its own parent']]
                ], 422);
            }

            // NEW: Prevent circular references through descendants
            if ($request->parent_id !== null && 
                !$category->canSetParent($request->parent_id)) {
                return response()->json([
                    'errors' => ['parent_id' => ['This would create a circular reference in the category hierarchy']]
                ], 422);
            }
        }

        // FIXED: Wrap in transaction
        try {
            DB::transaction(function () use ($request, $category) {
                $category->update($request->all());
            });

            $category->load('parent', 'children');
            if ($request->boolean('with_posts_count')) {
                $category->loadCount(['posts' => function ($q) {
                    $q->published();
                }]);
            }

            return response()->json($category);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update category',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy(Category $category)
    {
        // FIXED: Use transaction-safe delete method
        try {
            $category->safeDelete();
            return response()->json(['message' => 'Category deleted successfully']);
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage()
            ], 422);
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
        // FIXED: Always load posts count properly
        $query = Category::root()
            ->with(['children' => function ($q) {
                $q->ordered()->withPostsCount();
                // Load nested children
                $q->with(['children' => function ($nested) {
                    $nested->ordered()->withPostsCount();
                }]);
            }])
            ->ordered();

        if ($request->boolean('with_posts_count')) {
            $query->withPostsCount();
        }

        $categories = $query->get();

        return response()->json($this->buildTree($categories));
    }

    public function reorder(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'categories' => 'required|array',
            'categories.*.id' => 'required|exists:categories,id',
            'categories.*.order' => 'required|integer|min:0',
            'categories.*.parent_id' => 'nullable|exists:categories,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // FIXED: Validate no circular references before applying changes
        foreach ($request->categories as $item) {
            if (isset($item['parent_id'])) {
                $category = Category::find($item['id']);
                if (!$category->canSetParent($item['parent_id'])) {
                    return response()->json([
                        'errors' => ['categories' => ["Category {$category->name} would create a circular reference"]]
                    ], 422);
                }
            }
        }

        // FIXED: Use transaction for atomic updates
        try {
            DB::transaction(function () use ($request) {
                foreach ($request->categories as $item) {
                    $updateData = ['order' => $item['order']];
                    
                    // Update parent_id if provided
                    if (isset($item['parent_id'])) {
                        $updateData['parent_id'] = $item['parent_id'];
                    }
                    
                    Category::where('id', $item['id'])->update($updateData);
                }
            });

            return response()->json(['message' => 'Categories reordered successfully']);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to reorder categories',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // NEW: Force delete endpoint for admin use
    public function forceDestroy(Category $category)
    {
        try {
            DB::transaction(function () use ($category) {
                // Delete all posts in this category and descendants
                $allCategories = collect([$category])->merge($category->getDescendants());
                
                foreach ($allCategories as $cat) {
                    $cat->posts()->delete();
                }

                // Force delete category and descendants
                $category->forceDelete();
            });

            return response()->json(['message' => 'Category permanently deleted']);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete category',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // NEW: Restore soft-deleted category
    public function restore($id)
    {
        $category = Category::onlyTrashed()->findOrFail($id);
        
        try {
            $category->restore();
            return response()->json([
                'message' => 'Category restored successfully',
                'category' => $category->fresh()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to restore category',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // NEW: Get category path/breadcrumb
    public function breadcrumb($slug)
    {
        $category = Category::where('slug', $slug)->firstOrFail();
        
        return response()->json([
            'path' => $category->getPath(),
            'ancestors' => $category->getAncestors(),
            'category' => $category
        ]);
    }

    protected function buildTree($categories)
    {
        return $categories->map(function ($category) {
            $data = [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'color' => $category->color,
                'icon' => $category->icon,
            ];

            // Include posts_count if it was loaded
            if ($category->relationLoaded('posts')) {
                $data['posts_count'] = $category->posts_count;
            } elseif (isset($category->posts_count)) {
                $data['posts_count'] = $category->posts_count;
            }

            // Recursively build children
            if ($category->relationLoaded('children') && $category->children->isNotEmpty()) {
                $data['children'] = $this->buildTree($category->children);
            }

            return $data;
        });
    }
}