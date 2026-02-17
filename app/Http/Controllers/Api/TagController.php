<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Str;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TagController extends Controller
{
    public function index(Request $request)
    {
        $query = Tag::query();

        // Get popular tags
        if ($request->boolean('popular')) {
            $limit = $request->input('limit', 10);
            $query->popular($limit);
        } else {
            $query->withPostsCount()->orderBy('name');
        }

        // Search tags
        if ($request->has('search')) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%");
        }

        // Paginate or get all
        if ($request->boolean('paginate')) {
            $tags = $query->paginate($request->input('per_page', 50));
        } else {
            $tags = $query->get();
        }

        return response()->json($tags);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|unique:tags,slug',
            'description' => 'nullable|string',
            'color' => 'nullable|string|size:7',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Prepare data
        $data = $request->only(['name', 'description', 'color']);
        
        // If slug is provided, use it; otherwise generate from name
        if ($request->filled('slug')) {
            $data['slug'] = $request->slug;
        } else {
            $data['slug'] = Str::slug($request->name);
        }

        // Find existing tag by slug or create a new one
        $tag = Tag::firstOrCreate(
            ['slug' => $data['slug']],
            $data
        );

        return response()->json($tag, 201);
    }

    public function show($slug)
    {
        $tag = Tag::where('slug', $slug)
            ->withPostsCount()
            ->firstOrFail();

        return response()->json($tag);
    }

    public function update(Request $request, Tag $tag)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'string|max:255',
            'slug' => 'string|unique:tags,slug,' . $tag->id,
            'description' => 'nullable|string',
            'color' => 'nullable|string|size:7',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $tag->update($request->all());

        return response()->json($tag);
    }

    public function destroy(Tag $tag)
    {
        // Detach from all posts
        $tag->posts()->detach();
        $tag->delete();

        return response()->json(['message' => 'Tag deleted successfully']);
    }

    public function posts(Request $request, $slug)
    {
        $tag = Tag::where('slug', $slug)->firstOrFail();

        $posts = $tag->posts()
            ->published()
            ->with(['user', 'category', 'tags'])
            ->withCount(['comments', 'likes'])
            ->latest('published_at')
            ->paginate($request->input('per_page', 15));

        return response()->json($posts);
    }

    /**
     * Get tag cloud with weighted font sizes
     */
    public function cloud(Request $request)
    {
        $limit = $request->input('limit', 50);

        $tags = Tag::query()
            ->withCount(['posts as posts_count' => function ($q) {
                $q->published();
            }])
            ->where('posts_count', '>', 0)
            ->orderByDesc('posts_count')
            ->limit($limit)
            ->get(['id', 'name', 'slug', 'color', 'posts_count']);

        return response()->json($tags);
    }

    /**
     * Get tag suggestions for autocomplete
     */
    public function suggestions(Request $request)
    {
        $query = $request->input('query', '');

        $tags = Tag::where('name', 'like', "%{$query}%")
            ->withCount(['posts' => function ($q) {
                $q->where('status', 'published');
            }])
            ->orderByDesc('posts_count')
            ->limit(10)
            ->get();

        return response()->json($tags);
    }

    public function merge(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'source_tag_id' => 'required|exists:tags,id',
            'target_tag_id' => 'required|exists:tags,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $sourceTag = Tag::findOrFail($request->source_tag_id);
        $targetTag = Tag::findOrFail($request->target_tag_id);

        // Get all posts from source tag
        $postIds = $sourceTag->posts()->pluck('post_id');

        // Attach to target tag (will skip duplicates due to unique constraint)
        foreach ($postIds as $postId) {
            $targetTag->posts()->syncWithoutDetaching($postId);
        }

        // Delete source tag
        $sourceTag->delete();

        return response()->json([
            'message' => 'Tags merged successfully',
            'target_tag' => $targetTag->fresh()->load('posts'),
        ]);
    }
}