<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Resource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class ResourceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Resource::where('is_published', true);

        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'regexp', "/{$search}/i")
                  ->orWhere('excerpt', 'regexp', "/{$search}/i")
                  ->orWhere('content', 'regexp', "/{$search}/i");
            });
        }

        $resources = $query->orderByDesc('created_at')
            ->get(['_id', 'title', 'excerpt', 'category', 'icon', 'slug', 'created_at']);

        return response()->json($resources);
    }

    public function show(string $slug): JsonResponse
    {
        $resource = Resource::where('slug', $slug)->where('is_published', true)->first();

        if (!$resource) {
            return response()->json(['message' => 'Resource not found.'], 404);
        }

        return response()->json($resource);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'title'        => 'required|string|min:5|max:150',
            'excerpt'      => 'required|string|max:300',
            'content'      => 'required|string|min:100',
            'category'     => 'required|string|in:Growth,Monetization,Content,Community,Tools',
            'icon'         => 'required|string|in:BookOpen,Video,Lightbulb,Rss',
            'is_published' => 'boolean',
        ]);

        $slug         = Str::slug($request->slug ?? $request->title);
        $originalSlug = $slug;
        $count        = 1;

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

    public function update(Request $request, string $id): JsonResponse
    {
        $resource = Resource::findOrFail($id);

        $request->validate([
            'title'        => 'sometimes|string|min:5|max:150',
            'excerpt'      => 'sometimes|string|max:300',
            'content'      => 'sometimes|string|min:100',
            'category'     => 'sometimes|string|in:Growth,Monetization,Content,Community,Tools',
            'icon'         => 'sometimes|string|in:BookOpen,Video,Lightbulb,Rss',
            'is_published' => 'boolean',
        ]);

        // Check slug uniqueness manually
        if ($request->filled('slug') && $request->slug !== $resource->slug) {
            if (Resource::where('slug', $request->slug)->exists()) {
                return response()->json(['errors' => ['slug' => ['Slug already taken.']]], 422);
            }
        }

        $resource->update($request->only([
            'title', 'excerpt', 'content', 'category', 'icon', 'slug', 'is_published',
        ]));

        return response()->json($resource);
    }

    public function destroy(string $id): JsonResponse
    {
        Resource::findOrFail($id)->delete();
        return response()->json(['message' => 'Resource deleted successfully.']);
    }

    public function categories(): JsonResponse
    {
        $categories = Resource::where('is_published', true)
            ->pluck('category')
            ->unique()
            ->sort()
            ->values();

        return response()->json($categories);
    }
}