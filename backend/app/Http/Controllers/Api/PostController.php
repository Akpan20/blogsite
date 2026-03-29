<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class PostController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Post::where('user_id', (string) Auth::id());

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'regexp', "/{$search}/i")
                  ->orWhere('content', 'regexp', "/{$search}/i")
                  ->orWhere('excerpt', 'regexp', "/{$search}/i");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $posts = $query->with(['category', 'tags'])
            ->latest()
            ->paginate($request->input('per_page', 15));

        return response()->json($posts);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'content'     => 'required|string|min:300',
            'excerpt'     => 'nullable|string|max:500',
            'status'      => 'required|in:draft,published',
            'category_id' => 'nullable|string',
            'tag_ids'     => 'nullable|array',
            'series_ids'  => 'nullable|array',
            'is_premium'  => 'boolean',
            'premium_tier'=> 'nullable|string|in:basic,premium,pro',
        ]);

        // Check slug uniqueness manually
        $slug = $request->input('slug', \Str::slug($request->title));
        if (Post::where('slug', $slug)->exists()) {
            return response()->json(['errors' => ['slug' => ['Slug already taken.']]], 422);
        }
        $validated['slug'] = $slug;

        $post = Post::create([
            ...$validated,
            'user_id' => (string) Auth::id(),
        ]);

        if (!empty($validated['tag_ids'])) {
            $post->tags()->detach();
            foreach ($validated['tag_ids'] as $id) {
                $post->tags()->attach($id);
            }
        }

        if (!empty($validated['series_ids'])) {
            foreach ($validated['series_ids'] as $id) {
                $post->series()->attach($id);
            }
        }

        $post->load(['category', 'tags', 'series']);

        return response()->json($post, 201);
    }

    public function show($postIdOrSlug): JsonResponse
    {
        $post = Post::where('slug', $postIdOrSlug)->first()
            ?? Post::find($postIdOrSlug);

        if (!$post) abort(404);

        $post->load(['user', 'category', 'tags', 'series']);

        return response()->json([
            'id'              => $post->id,
            'title'           => $post->title,
            'content'         => $post->content,
            'excerpt'         => $post->excerpt,
            'slug'            => $post->slug,
            'status'          => $post->status,
            'is_premium'      => $post->is_premium,
            'premium_tier'    => $post->premium_tier,
            'reading_time'    => $post->reading_time,
            'views_count'     => $post->views_count,
            'likes_count'     => $post->likes_count,
            'comments_count'  => $post->comments_count,
            'created_at'      => $post->created_at,
            'updated_at'      => $post->updated_at,
            'published_at'    => $post->published_at,
            'featured_image'  => $post->featured_image,
            'author'          => [
                'id'       => $post->user?->id,
                'name'     => $post->user?->name,
                'username' => $post->user?->username,
                'avatar'   => $post->user?->avatar,
                'bio'      => $post->user?->bio,
            ],
            'category'        => $post->category,
            'tags'            => $post->tags,
            'series'          => $post->series,
            'series_id'       => $post->series->first()?->id,
            'meta_title'      => $post->meta_title,
            'meta_description'=> $post->meta_description,
            'og_image'        => $post->og_image,
        ]);
    }

    public function featured(Request $request)
    {
        $posts = Post::where('status', 'published')
            ->where('is_featured', true)
            ->with('category')
            ->orderBy('featured_order')
            ->limit($request->get('limit', 3))
            ->get();

        return response()->json($posts->map(fn($post) => [
            'id'             => $post->id,
            'title'          => $post->title,
            'slug'           => $post->slug,
            'excerpt'        => $post->excerpt,
            'featured_image' => $post->featured_image,
            'category'       => $post->category ? [
                'id'    => $post->category->id,
                'name'  => $post->category->name,
                'color' => $post->category->color,
            ] : null,
        ]));
    }

    public function reorderFeatured(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'posts'                  => 'required|array|min:1',
            'posts.*.id'             => 'required|string',
            'posts.*.featured_order' => 'required|integer|min:1',
        ]);

        try {
            foreach ($validated['posts'] as $item) {
                Post::where('_id', $item['id'])->update([
                    'featured_order' => $item['featured_order'],
                    'is_featured'    => true,
                ]);
            }

            return response()->json([
                'message'       => 'Featured order updated successfully',
                'updated_count' => count($validated['posts']),
            ]);
        } catch (\Exception $e) {
            \Log::error('Reorder featured posts failed', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Failed to update featured order'], 500);
        }
    }

    public function update(Request $request, Post $post): JsonResponse
    {
        $this->authorizePost($post);

        $validated = $request->validate([
            'title'       => 'sometimes|required|string|max:255',
            'content'     => 'sometimes|required|string|min:300',
            'excerpt'     => 'nullable|string|max:500',
            'status'      => 'sometimes|required|in:draft,published',
            'category_id' => 'nullable|string',
            'tag_ids'     => 'nullable|array',
            'series_ids'  => 'nullable|array',
            'is_premium'  => 'boolean',
            'premium_tier'=> 'nullable|string|in:basic,premium,pro',
        ]);

        // Check slug uniqueness manually if changed
        if ($request->filled('slug') && $request->slug !== $post->slug) {
            if (Post::where('slug', $request->slug)->where('_id', '!=', $post->id)->exists()) {
                return response()->json(['errors' => ['slug' => ['Slug already taken.']]], 422);
            }
            $validated['slug'] = $request->slug;
        }

        $post->update($validated);

        if (isset($validated['tag_ids'])) {
            $post->tags()->detach();
            foreach ($validated['tag_ids'] as $id) {
                $post->tags()->attach($id);
            }
        }

        if (isset($validated['series_ids'])) {
            $post->series()->detach();
            foreach ($validated['series_ids'] as $id) {
                $post->series()->attach($id);
            }
        }

        $post->load(['category', 'tags', 'series']);

        return response()->json($post);
    }

    public function checkSlug(Request $request)
    {
        $slug      = $request->slug;
        $excludeId = $request->exclude;

        $query = Post::where('slug', $slug);
        if ($excludeId) {
            $query->where('_id', '!=', $excludeId);
        }

        return response()->json(['available' => !$query->exists()]);
    }

    public function destroy(Post $post): JsonResponse
    {
        $this->authorizePost($post);
        $post->delete();
        return response()->json(['message' => 'Post deleted successfully']);
    }

    public function trending(Request $request): JsonResponse
    {
        $posts = Post::published()
            ->where('created_at', '>=', now()->subDays($request->input('days', 7)))
            ->orderByDesc('views_count')
            ->orderByDesc('likes_count')
            ->orderByDesc('comments_count')
            ->with(['user', 'category'])
            ->limit($request->input('limit', 5))
            ->get();

        return response()->json($posts);
    }

    public function search(Request $request): JsonResponse
    {
        $query = Post::published()->with(['user', 'category', 'tags']);

        if ($request->filled('query')) {
            $term = $request->query;
            $query->where(function ($q) use ($term) {
                $q->where('title', 'regexp', "/{$term}/i")
                  ->orWhere('content', 'regexp', "/{$term}/i")
                  ->orWhere('excerpt', 'regexp', "/{$term}/i");
            });
        }

        if ($request->filled('categoryId')) {
            $query->where('category_id', $request->categoryId);
        }

        // Tag filter — MongoDB safe
        if ($request->filled('tagIds')) {
            $tagIds = is_array($request->tagIds)
                ? $request->tagIds
                : explode(',', $request->tagIds);

            // Get post IDs that have these tags via post_tag collection
            $postIds = \DB::connection('mongodb')
                ->collection('post_tag')
                ->whereIn('tag_id', $tagIds)
                ->pluck('post_id')
                ->toArray();

            $query->whereIn('_id', $postIds);
        }

        if ($request->filled('dateFrom')) {
            $query->where('published_at', '>=', new \DateTime($request->dateFrom));
        }
        if ($request->filled('dateTo')) {
            $query->where('published_at', '<=', new \DateTime($request->dateTo));
        }

        if ($request->filled('authorId')) {
            $query->where('user_id', $request->authorId);
        }

        if ($request->filled('readingTimeMin')) {
            $query->where('reading_time', '>=', (int) $request->readingTimeMin);
        }
        if ($request->filled('readingTimeMax')) {
            $query->where('reading_time', '<=', (int) $request->readingTimeMax);
        }

        // Sorting — orderByRaw not supported in MongoDB
        switch ($request->input('sortBy', 'date')) {
            case 'views':    $query->orderByDesc('views_count'); break;
            case 'likes':    $query->orderByDesc('likes_count'); break;
            case 'comments': $query->orderByDesc('comments_count'); break;
            default:         $query->orderByDesc('published_at'); break;
        }

        $results = $query->paginate($request->input('per_page', 15));

        return response()->json([
            'query'      => $request->query,
            'total'      => $results->total(),
            'results'    => $results->items(),
            'pagination' => [
                'current_page' => $results->currentPage(),
                'last_page'    => $results->lastPage(),
                'per_page'     => $results->perPage(),
                'total'        => $results->total(),
            ],
        ]);
    }

    public function related(Post $post)
    {
        $related = Post::where('category_id', $post->category_id)
            ->where('_id', '!=', $post->id)
            ->where('status', 'published')
            ->with(['user', 'category'])
            ->latest()
            ->limit(3)
            ->get();

        return response()->json($related);
    }

    public function trackView(Post $post): JsonResponse
    {
        $post->incrementViews();
        return response()->json(['views_count' => $post->views_count]);
    }

    private function authorizePost(Post $post): void
    {
        if ((string) $post->user_id !== (string) Auth::id()) {
            abort(403, 'Unauthorized');
        }
    }
}