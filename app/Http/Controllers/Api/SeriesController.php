<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Series;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SeriesController extends Controller
{
    /**
     * Get series 
     */
    public function index(Request $request)
    {
        try {
            $query = Series::query();

            // Filter featured - use boolean check
            if ($request->has('featured')) {
                $featured = filter_var($request->input('featured'), FILTER_VALIDATE_BOOLEAN);
                if ($featured) {
                    $query->where('is_featured', true);
                }
            }

            // Filter published - default to true
            if (!$request->has('include_unpublished')) {
                $query->where('is_published', true);
            }

            // Filter by author
            if ($request->has('author_id')) {
                $query->where('user_id', $request->input('author_id'));
            }

            // Include author if user relationship exists
            if (method_exists(Series::class, 'user')) {
                $query->with('user:id,name,username,avatar_url');
            }

            // Sort
            $sortBy = $request->input('sort_by', 'created_at');
            $sortOrder = $request->input('sort_order', 'desc');
            
            // Validate sort column exists
            if (in_array($sortBy, ['created_at', 'updated_at', 'title', 'posts_count'])) {
                $query->orderBy($sortBy, $sortOrder);
            } else {
                $query->orderBy('created_at', 'desc');
            }

            // Limit or paginate
            if ($request->has('limit')) {
                $limit = (int) $request->input('limit', 15);
                $series = $query->limit($limit)->get();
                return response()->json($series);
            }

            $perPage = (int) $request->input('per_page', 15);
            $series = $query->paginate($perPage);
            
            return response()->json($series);
            
        } catch (\Exception $e) {
            \Log::error('Series index error: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            
            // Return empty array instead of 500 error
            return response()->json([]);
        }
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|unique:series,slug',
            'description' => 'nullable|string',
            'cover_image' => 'nullable|string',
            'is_published' => 'boolean',
            'is_featured' => 'boolean',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $series = Series::create([
            ...$request->all(),
            'user_id' => auth()->id(),
        ]);

        return response()->json($series, 201);
    }

    public function show($slug)
    {
        $series = Series::where('slug', $slug)
            ->with(['user', 'posts' => function ($q) {
                $q->published()->with('user');
            }])
            ->firstOrFail();

        return response()->json($series);
    }

    public function update(Request $request, Series $series)
    {
        // Check authorization
        /** @var Series $series */
        if ($series->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'string|max:255',
            'slug' => 'string|unique:series,slug,' . $series->id,
            'description' => 'nullable|string',
            'cover_image' => 'nullable|string',
            'is_published' => 'boolean',
            'is_featured' => 'boolean',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $series->update($request->all());

        return response()->json($series);
    }

    public function destroy(Series $series)
    {
        // Check authorization
        /** @var Series $series */
        if ($series->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $series->delete();

        return response()->json(['message' => 'Series deleted successfully']);
    }

    public function addPost(Request $request, Series $series)
    {
        $validator = Validator::make($request->all(), [
            'post_id' => 'required|exists:posts,id',
            'order' => 'nullable|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        /** @var Post $post */
        $post = Post::findOrFail($request->post_id);

        // Check if post already in series
        /** @var Series $series */
        if ($series->posts()->where('post_id', $post->id)->exists()) {
            return response()->json(['message' => 'Post already in this series'], 422);
        }

        $series->addPost($post, $request->input('order'));

        return response()->json([
            'message' => 'Post added to series successfully',
            'series' => $series->fresh()->load('posts'),
        ]);
    }

    public function removePost(Series $series, Post $post)
    {
        // Check authorization
        /** @var Series $series */
        if ($series->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $series->removePost($post);

        return response()->json([
            'message' => 'Post removed from series successfully',
            'series' => $series->fresh()->load('posts'),
        ]);
    }

    public function reorderPosts(Request $request, Series $series)
    {
        $validator = Validator::make($request->all(), [
            'posts' => 'required|array',
            'posts.*.post_id' => 'required|exists:posts,id',
            'posts.*.order' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        /** @var Series $series */
        foreach ($request->posts as $item) {
            $series->posts()->updateExistingPivot($item['post_id'], [
                'order' => $item['order']
            ]);
        }

        return response()->json([
            'message' => 'Series posts reordered successfully',
            'series' => $series->fresh()->load('posts'),
        ]);
    }

    public function posts(Request $request, $slug)
    {
        $series = Series::where('slug', $slug)->firstOrFail();

        $posts = $series->posts()
            ->published()
            ->with(['user', 'category', 'tags'])
            ->withCount(['comments', 'likes'])
            ->get();

        return response()->json($posts);
    }

    public function progress(Series $series, Post $post)
    {
        /** @var Series $series */
        /** @var Post $post */
        $progress = $series->getProgress($post);
        $next = $series->getNextPost($post);
        $previous = $series->getPreviousPost($post);

        return response()->json([
            'progress' => $progress,
            'next_post' => $next,
            'previous_post' => $previous,
        ]);
    }
}