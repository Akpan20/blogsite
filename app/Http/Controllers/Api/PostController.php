<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class PostController extends Controller
{
    /**
     * Get all posts for authenticated user
     */
    public function index(Request $request): JsonResponse
    {
        $query = Post::where('user_id', Auth::id());

        \Log::info('Current Auth ID: ' . (Auth::id() ?? 'null'));

        // Add filters if needed
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $posts = $query->with(['category:id,name', 'tags:id,name'])
            ->latest()
            ->paginate($request->input('per_page', 15));

        return response()->json($posts);
    }

    /**
     * Create a new post
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:posts',
            'content' => 'required|string|min:300',
            'excerpt' => 'nullable|string|max:500',
            'status' => 'required|in:draft,published',
            'category_id' => 'nullable|exists:categories,id',
            'tag_ids' => 'nullable|array',
            'tag_ids.*' => 'exists:tags,id',
            'series_ids' => 'nullable|array',
            'series_ids.*' => 'exists:series,id',
            'is_premium' => 'boolean',
            'premium_tier' => 'nullable|string|in:basic,premium,pro',
        ]);

        $post = Post::create([
            ...$validated,
            'user_id' => Auth::id(),
        ]);

        // Sync tags if provided
        if (isset($validated['tag_ids'])) {
            $post->tags()->sync($validated['tag_ids']);
        }

        // Sync series if provided
        if (isset($validated['series_ids'])) {
            foreach ($validated['series_ids'] as $seriesId) {
                $post->series()->attach($seriesId);
            }
        }

        $post->load(['category', 'tags', 'series']);

        return response()->json($post, 201);
    }

    /**
     * Display the specified post (by ID or slug)
     */
    public function show($postIdOrSlug): JsonResponse
    {
        // Find by ID if numeric, otherwise by slug
        if (is_numeric($postIdOrSlug)) {
            $post = Post::findOrFail($postIdOrSlug);
        } else {
            $post = Post::where('slug', $postIdOrSlug)->firstOrFail();
        }
        
        $post->load([
            'user:id,name,email,username,avatar,bio',
            'category:id,name,slug',
            'tags:id,name,slug',
            'series:id,title,slug'
        ]);

        return response()->json([
            'id' => $post->id,
            'title' => $post->title,
            'content' => $post->content,
            'excerpt' => $post->excerpt,
            'slug' => $post->slug,
            'status' => $post->status,
            'is_premium' => $post->is_premium,
            'premium_tier' => $post->premium_tier,
            'reading_time' => $post->reading_time,
            'views_count' => $post->views_count,
            'likes_count' => $post->likes_count,
            'comments_count' => $post->comments_count,
            'created_at' => $post->created_at,
            'updated_at' => $post->updated_at,
            'published_at' => $post->published_at,
            'author' => [
                'id' => $post->user->id,
                'name' => $post->user->name,
                'username' => $post->user->username,
                'avatar' => $post->user->avatar,
                'bio' => $post->user->bio,
            ],
            'category' => $post->category,
            'tags' => $post->tags,
            'series' => $post->series,
            'series_id' => $post->series->first()?->id,
            'meta_title' => $post->meta_title,
            'meta_description' => $post->meta_description,
            'og_image' => $post->og_image,
        ]);
    }

    /**
     * Update an existing post
     */
    public function update(Request $request, Post $post): JsonResponse
    {
        $this->authorizePost($post);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'slug' => 'sometimes|required|string|max:255|unique:posts,slug,' . $post->id,
            'content' => 'sometimes|required|string|min:300',
            'excerpt' => 'nullable|string|max:500',
            'status' => 'sometimes|required|in:draft,published',
            'category_id' => 'nullable|exists:categories,id',
            'tag_ids' => 'nullable|array',
            'tag_ids.*' => 'exists:tags,id',
            'series_ids' => 'nullable|array',
            'series_ids.*' => 'exists:series,id',
            'is_premium' => 'boolean',
            'premium_tier' => 'nullable|string|in:basic,premium,pro',
        ]);

        $post->update($validated);

        // Sync tags if provided
        if (isset($validated['tag_ids'])) {
            $post->tags()->sync($validated['tag_ids']);
        }

        // Sync series if provided
        if (isset($validated['series_ids'])) {
            $existingSeriesIds = $post->series()->pluck('series.id')->toArray();
            $post->series()->detach($existingSeriesIds);
            
            foreach ($validated['series_ids'] as $seriesId) {
                $post->series()->attach($seriesId);
            }
        }

        $post->load(['category', 'tags', 'series']);

        return response()->json($post);
    }

    public function checkSlug(Request $request)
    {
        $slug = $request->slug;
        $excludeId = $request->exclude;

        $query = Post::where('slug', $slug);
        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        $exists = $query->exists();

        return response()->json(['available' => !$exists]);
    }

    /**
     * Delete a post
     */
    public function destroy(Post $post): JsonResponse
    {
        $this->authorizePost($post);
        $post->delete();
        return response()->json(['message' => 'Post deleted successfully'], 200);
    }

    public function trending(Request $request): JsonResponse
    {
        $limit = $request->input('limit', 5);
        $days = $request->input('days', 7);
        
        $posts = Post::published()
            ->where('created_at', '>=', now()->subDays($days))
            ->orderByDesc('views_count')
            ->orderByDesc('likes_count')
            ->orderByDesc('comments_count')
            ->with(['user:id,name,username', 'category:id,name'])
            ->limit($limit)
            ->get();
        
        return response()->json($posts);
    }

    /**
     * Search posts with advanced filters
     */
    public function search(Request $request): JsonResponse
    {
        $query = Post::published()
            ->with(['user:id,name,username', 'category:id,name', 'tags:id,name,slug']);

        // Full-text search
        if ($request->filled('query')) {
            $searchTerm = $request->query;
            $query->where(function ($q) use ($searchTerm) {
                $q->where('title', 'like', "%{$searchTerm}%")
                  ->orWhere('content', 'like', "%{$searchTerm}%")
                  ->orWhere('excerpt', 'like', "%{$searchTerm}%");
            });
        }

        // Category filter
        if ($request->filled('categoryId')) {
            $query->where('category_id', $request->categoryId);
        }

        // Tag filter
        if ($request->filled('tagIds')) {
            $tagIds = is_array($request->tagIds) ? $request->tagIds : explode(',', $request->tagIds);
            $query->whereHas('tags', function ($q) use ($tagIds) {
                $q->whereIn('tags.id', $tagIds);
            });
        }

        // Date range
        if ($request->filled('dateFrom')) {
            $query->where('published_at', '>=', $request->dateFrom);
        }
        if ($request->filled('dateTo')) {
            $query->where('published_at', '<=', $request->dateTo);
        }

        // Author filter
        if ($request->filled('authorId')) {
            $query->where('user_id', $request->authorId);
        }

        // Reading time range
        if ($request->filled('readingTimeMin')) {
            $query->where('reading_time', '>=', $request->readingTimeMin);
        }
        if ($request->filled('readingTimeMax')) {
            $query->where('reading_time', '<=', $request->readingTimeMax);
        }

        // Sorting
        $sortBy = $request->input('sortBy', 'date');
        $sortOrder = $request->input('sortOrder', 'desc');

        switch ($sortBy) {
            case 'views':
                $query->orderBy('views_count', $sortOrder);
                break;
            case 'likes':
                $query->orderBy('likes_count', $sortOrder);
                break;
            case 'comments':
                $query->orderBy('comments_count', $sortOrder);
                break;
            case 'date':
                $query->orderBy('published_at', $sortOrder);
                break;
            case 'relevance':
            default:
                // For relevance, prioritize title matches
                if ($request->filled('query')) {
                    $query->orderByRaw("CASE WHEN title LIKE ? THEN 1 ELSE 2 END", ["%{$request->query}%"]);
                }
                $query->orderBy('published_at', 'desc');
                break;
        }

        $results = $query->paginate($request->input('per_page', 15));

        return response()->json([
            'query' => $request->query,
            'total' => $results->total(),
            'results' => $results->items(),
            'pagination' => [
                'current_page' => $results->currentPage(),
                'last_page' => $results->lastPage(),
                'per_page' => $results->perPage(),
                'total' => $results->total(),
            ],
        ]);
    }

    /**
     * Get related posts
     */
    public function related(Post $post, Request $request): JsonResponse
    {
        $limit = $request->input('limit', 5);
        $related = $post->getRelatedPosts($limit);

        return response()->json($related);
    }

    /**
     * Track post view
     */
    public function trackView(Post $post): JsonResponse
    {
        $post->incrementViews();

        return response()->json(['views_count' => $post->views_count]);
    }

    /**
     * Authorize post ownership
     */
    private function authorizePost(Post $post): void
    {
        if ($post->user_id !== Auth::id()) {
            abort(403, 'Unauthorized');
        }
    }
}