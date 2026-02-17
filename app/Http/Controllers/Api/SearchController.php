<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SearchController extends Controller
{
    /**
     * Search posts with filters
     */
    public function search(Request $request): JsonResponse
    {
        $request->validate([
            'q' => 'required|string|min:2',
            'category' => 'nullable|string',
            'author' => 'nullable|integer',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date',
            'sort' => 'nullable|in:relevance,date,views,comments',
            'per_page' => 'nullable|integer|min:1|max:50',
        ]);

        $query = Post::query()
            ->with(['user:id,name,email'])
            ->where('published', true);

        // Full-text search
        $searchTerm = $request->q;
        $query->where(function ($q) use ($searchTerm) {
            $q->where('title', 'LIKE', "%{$searchTerm}%")
              ->orWhere('content', 'LIKE', "%{$searchTerm}%")
              ->orWhere('excerpt', 'LIKE', "%{$searchTerm}%")
              ->orWhere('meta_description', 'LIKE', "%{$searchTerm}%");
        });

        // Filter by category
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        // Filter by author
        if ($request->has('author')) {
            $query->where('user_id', $request->author);
        }

        // Filter by date range
        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Sort results
        switch ($request->get('sort', 'relevance')) {
            case 'date':
                $query->orderBy('created_at', 'desc');
                break;
            case 'views':
                $query->orderBy('views_count', 'desc');
                break;
            case 'comments':
                $query->withCount('comments')
                      ->orderBy('comments_count', 'desc');
                break;
            default: // relevance
                // Title matches are more relevant than content matches
                $query->orderByRaw("
                    CASE 
                        WHEN title LIKE ? THEN 1
                        WHEN excerpt LIKE ? THEN 2
                        WHEN content LIKE ? THEN 3
                        ELSE 4
                    END
                ", ["%{$searchTerm}%", "%{$searchTerm}%", "%{$searchTerm}%"])
                ->orderBy('created_at', 'desc');
        }

        $results = $query->paginate($request->get('per_page', 10));

        // Add search metadata
        return response()->json([
            'query' => $searchTerm,
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
     * Get search suggestions (autocomplete)
     */
    public function suggestions(Request $request): JsonResponse
    {
        $request->validate([
            'q' => 'required|string|min:2',
            'limit' => 'nullable|integer|min:1|max:10',
        ]);

        $searchTerm = $request->q;
        $limit = $request->get('limit', 5);

        $suggestions = Post::where('published', true)
            ->where('title', 'LIKE', "%{$searchTerm}%")
            ->select('id', 'title', 'slug')
            ->limit($limit)
            ->get();

        return response()->json($suggestions);
    }

    /**
     * Get popular search terms
     */
    public function popular(): JsonResponse
    {
        // This would typically use a search_logs table
        // For now, return most viewed posts
        $popular = Post::where('published', true)
            ->orderBy('views_count', 'desc')
            ->limit(10)
            ->pluck('title');

        return response()->json($popular);
    }

    /**
     * Get related posts
     */
    public function related(Post $post): JsonResponse
    {
        // Find posts with similar titles or same category
        $related = Post::where('published', true)
            ->where('id', '!=', $post->id)
            ->where(function ($query) use ($post) {
                // Same category
                if ($post->category) {
                    $query->where('category', $post->category);
                }
                
                // Or similar keywords in title
                $keywords = explode(' ', $post->title);
                foreach ($keywords as $keyword) {
                    if (strlen($keyword) > 3) {
                        $query->orWhere('title', 'LIKE', "%{$keyword}%");
                    }
                }
            })
            ->with(['user:id,name'])
            ->limit(6)
            ->get();

        return response()->json($related);
    }
}