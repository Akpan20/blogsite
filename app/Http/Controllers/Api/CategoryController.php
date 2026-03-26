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
                $query->where('parent_id', (string) $request->parent_id);
            }
        }

        if ($request->boolean('featured')) {
            $query->featured();
        }

        // 🔥 No withCount anymore — just fetch
        $categories = $query->ordered()->get();

        return response()->json($categories);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'             => 'required|string|max:255',
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
            $data = $request->all();
            $data['posts_count'] = 0; // 🔥 initialize counter

            $category = Category::create($data);
            $category->load('parent');

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
            ->with(['children' => fn($q) => $q->ordered()])
            ->firstOrFail();

        return response()->json($category);
    }

    public function update(Request $request, Category $category)
    {
        $validator = Validator::make($request->all(), [
            'name'             => 'string|max:255',
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
                    'errors' => ['parent_id' => ['Circular reference detected']],
                ], 422);
            }
        }

        try {
            $category->update($request->all());
            $category->load('parent', 'children');

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

    public function tree()
    {
        // 🔥 ONE query only
        $categories = Category::ordered()->get();

        return response()->json($this->buildTreeEfficient($categories));
    }

    protected function buildTreeEfficient($categories)
    {
        $grouped = $categories->groupBy('parent_id');

        $build = function ($parentId) use (&$build, $grouped) {
            return ($grouped[$parentId] ?? collect())->map(function ($cat) use ($build) {
                return [
                    'id'          => (string) $cat->_id,
                    'name'        => $cat->name,
                    'slug'        => $cat->slug,
                    'color'       => $cat->color,
                    'icon'        => $cat->icon,
                    'posts_count' => $cat->posts_count,
                    'children'    => $build((string) $cat->_id),
                ];
            });
        };

        return $build(null);
    }

    public function posts(Request $request, $slug)
    {
        $category = Category::where('slug', $slug)->firstOrFail();

        $posts = $category->posts()
            ->published()
            ->with(['user', 'tags'])
            ->latest('published_at')
            ->paginate($request->input('per_page', 15));

        return response()->json($posts);
    }
}