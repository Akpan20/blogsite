<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Resource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ResourceController extends Controller
{
    /**
     * List all published resources (with optional search/filter)
     */
    public function index(Request $request): JsonResponse
    {
        $resources = Resource::query()
            ->where('is_published', true)
            ->when($request->category, function ($query, $category) {
                $query->where('category', $category);
            })
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('excerpt', 'like', "%{$search}%")
                      ->orWhere('content', 'like', "%{$search}%");
                });
            })
            ->orderBy('created_at', 'desc')
            ->get(['id', 'title', 'excerpt', 'category', 'icon', 'slug', 'created_at']);

        return response()->json($resources);
    }

    /**
     * Show a single resource by slug
     */
    public function show(string $slug): JsonResponse
    {
        $resource = Resource::where('slug', $slug)
            ->where('is_published', true)
            ->first();

        if (!$resource) {
            return response()->json([
                'message' => 'Resource not found.',
            ], 404);
        }

        return response()->json($resource);
    }

    /**
     * Create a new resource (admin only)
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'title'        => 'required|string|min:5|max:150',
            'excerpt'      => 'required|string|max:300',
            'content'      => 'required|string|min:100',
            'category'     => 'required|string|in:Growth,Monetization,Content,Community,Tools',
            'icon'         => 'required|string|in:BookOpen,Video,Lightbulb,Rss',
            'slug'         => 'nullable|string|unique:resources,slug|regex:/^[a-z0-9-]+$/',
            'is_published' => 'boolean',
        ]);

        $slug = $request->slug ?? \Str::slug($request->title);

        // Ensure slug uniqueness
        $originalSlug = $slug;
        $count = 1;
        while (Resource::where('slug', $slug)->exists()) {
            $slug = "{$originalSlug}-{$count}";
            $count++;
        }

        $resource = Resource::create([
            'title'        => $request->title,
            'excerpt'      => $request->excerpt,
            'content'      => $request->content,
            'category'     => $request->category,
            'icon'         => $request->icon,
            'slug'         => $slug,
            'is_published' => $request->boolean('is_published', false),
        ]);

        return response()->json($resource, 201);
    }

    /**
     * Update an existing resource (admin only)
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $resource = Resource::findOrFail($id);

        $request->validate([
            'title'        => 'sometimes|string|min:5|max:150',
            'excerpt'      => 'sometimes|string|max:300',
            'content'      => 'sometimes|string|min:100',
            'category'     => 'sometimes|string|in:Growth,Monetization,Content,Community,Tools',
            'icon'         => 'sometimes|string|in:BookOpen,Video,Lightbulb,Rss',
            'slug'         => "sometimes|string|unique:resources,slug,{$id}|regex:/^[a-z0-9-]+$/",
            'is_published' => 'boolean',
        ]);

        $resource->update($request->only([
            'title',
            'excerpt',
            'content',
            'category',
            'icon',
            'slug',
            'is_published',
        ]));

        return response()->json($resource);
    }

    /**
     * Delete a resource (admin only)
     */
    public function destroy(int $id): JsonResponse
    {
        $resource = Resource::findOrFail($id);
        $resource->delete();

        return response()->json([
            'message' => 'Resource deleted successfully.',
        ]);
    }

    /**
     * List all unique categories (for filter dropdowns)
     */
    public function categories(): JsonResponse
    {
        $categories = Resource::where('is_published', true)
            ->distinct()
            ->pluck('category')
            ->sort()
            ->values();

        return response()->json($categories);
    }
}