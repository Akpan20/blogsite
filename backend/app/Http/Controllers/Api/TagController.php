<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Str;
use App\Models\Tag;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TagController extends Controller
{
    public function index(Request $request)
    {
        $query = Tag::query();

        if ($request->boolean('popular')) {
            $limit = $request->input('limit', 10);
            $query->orderByDesc('usage_count')->limit($limit);
        } else {
            $query->orderBy('name');
        }

        if ($request->has('search')) {
            $query->where('name', 'regexp', '/' . $request->search . '/i');
        }

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
            'name'        => 'required|string|max:255',
            'slug'        => 'nullable|string',
            'description' => 'nullable|string',
            'color'       => 'nullable|string|size:7',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data         = $request->only(['name', 'description', 'color']);
        $data['slug'] = $request->filled('slug')
            ? $request->slug
            : Str::slug($request->name);

        // Check slug uniqueness manually (MongoDB doesn't support unique validation via rules)
        if (Tag::where('slug', $data['slug'])->exists()) {
            return response()->json(['errors' => ['slug' => ['Slug already taken.']]], 422);
        }

        $tag = Tag::firstOrCreate(['slug' => $data['slug']], $data);

        return response()->json($tag, 201);
    }

    public function show($slug)
    {
        $tag = Tag::where('slug', $slug)->firstOrFail();

        // Count published posts for this tag
        $tag->posts_count = Post::where('status', 'published')
            ->whereIn('_id', $tag->posts()->pluck('_id')->toArray())
            ->count();

        return response()->json($tag);
    }

    public function update(Request $request, Tag $tag)
    {
        $validator = Validator::make($request->all(), [
            'name'        => 'string|max:255',
            'description' => 'nullable|string',
            'color'       => 'nullable|string|size:7',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Check slug uniqueness if slug is being changed
        if ($request->filled('slug') && $request->slug !== $tag->slug) {
            if (Tag::where('slug', $request->slug)->exists()) {
                return response()->json(['errors' => ['slug' => ['Slug already taken.']]], 422);
            }
        }

        $tag->update($request->all());

        return response()->json($tag);
    }

    public function destroy(Tag $tag)
    {
        // MongoDB safe detach
        $tag->posts()->detach();
        $tag->delete();

        return response()->json(['message' => 'Tag deleted successfully']);
    }

    public function posts(Request $request, $slug)
    {
        $tag = Tag::where('slug', $slug)->firstOrFail();

        $posts = $tag->posts()
            ->where('status', 'published')
            ->with(['user', 'category', 'tags'])
            ->latest('published_at')
            ->paginate($request->input('per_page', 15));

        return response()->json($posts);
    }

    /**
     * Get tag cloud with weighted font sizes
     * Fixed: withCount + subquery not supported in MongoDB
     */
    public function cloud(Request $request)
    {
        $limit = $request->input('limit', 50);

        // Use usage_count stored on the tag directly
        $tags = Tag::where('usage_count', '>', 0)
            ->orderByDesc('usage_count')
            ->limit((int) $limit)
            ->get(['_id', 'name', 'slug', 'color', 'usage_count']);

        return response()->json($tags);
    }

    /**
     * Get tag suggestions for autocomplete
     * Fixed: 'like' → 'regexp' for MongoDB
     */
    public function suggestions(Request $request)
    {
        $query = $request->input('query', '');

        $tags = Tag::where('name', 'regexp', '/' . $query . '/i')
            ->orderByDesc('usage_count')
            ->limit(10)
            ->get(['_id', 'name', 'slug', 'color', 'usage_count']);

        return response()->json($tags);
    }

    /**
     * Merge two tags
     * Fixed: syncWithoutDetaching → manual attach loop
     */
    public function merge(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'source_tag_id' => 'required',
            'target_tag_id' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $sourceTag = Tag::findOrFail($request->source_tag_id);
        $targetTag = Tag::findOrFail($request->target_tag_id);

        // Get all posts from source tag
        $postIds = $sourceTag->posts()->pluck('_id')->toArray();

        // Attach to target tag — skip if already attached
        foreach ($postIds as $postId) {
            $alreadyAttached = \DB::connection('mongodb')
                ->collection('post_tag')
                ->where('post_id', (string) $postId)
                ->where('tag_id', (string) $targetTag->id)
                ->exists();

            if (!$alreadyAttached) {
                $targetTag->posts()->attach($postId);
            }
        }

        $sourceTag->delete();

        return response()->json([
            'message'    => 'Tags merged successfully',
            'target_tag' => $targetTag->fresh(),
        ]);
    }
}