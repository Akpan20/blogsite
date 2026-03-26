<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SearchController extends Controller
{
    public function search(Request $request): JsonResponse
    {
        $request->validate([
            'q'        => 'required|string|min:2',
            'category' => 'nullable|string',
            'author'   => 'nullable|string',
            'date_from'=> 'nullable|date',
            'date_to'  => 'nullable|date',
            'sort'     => 'nullable|in:relevance,date,views',
            'per_page' => 'nullable|integer|min:1|max:50',
        ]);

        $searchTerm = $request->q;

        $query = Post::where('published', true)
            ->with(['user'])
            ->where(function ($q) use ($searchTerm) {
                // MongoDB uses regexp instead of LIKE
                $q->where('title', 'regexp', "/{$searchTerm}/i")
                  ->orWhere('excerpt', 'regexp', "/{$searchTerm}/i")
                  ->orWhere('content', 'regexp', "/{$searchTerm}/i")
                  ->orWhere('meta_description', 'regexp', "/{$searchTerm}/i");
            });

        if ($request->has('category')) {
            $query->where('category_id', $request->category);
        }

        if ($request->has('author')) {
            $query->where('user_id', $request->author);
        }

        if ($request->has('date_from')) {
            $query->where('created_at', '>=', new \DateTime($request->date_from));
        }

        if ($request->has('date_to')) {
            $query->where('created_at', '<=', new \DateTime($request->date_to));
        }

        // Sort — orderByRaw not supported in MongoDB
        switch ($request->get('sort', 'relevance')) {
            case 'date':
                $query->orderByDesc('created_at');
                break;
            case 'views':
                $query->orderByDesc('views_count');
                break;
            default:
                // relevance: title matches first, then by date
                $query->orderByDesc('created_at');
        }

        $results = $query->paginate($request->get('per_page', 10));

        return response()->json([
            'query'      => $searchTerm,
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

    public function suggestions(Request $request): JsonResponse
    {
        $request->validate([
            'q'     => 'required|string|min:2',
            'limit' => 'nullable|integer|min:1|max:10',
        ]);

        $searchTerm = $request->q;

        $suggestions = Post::where('published', true)
            ->where('title', 'regexp', "/{$searchTerm}/i")
            ->limit($request->get('limit', 5))
            ->get(['_id', 'title', 'slug']);

        return response()->json($suggestions);
    }

    public function popular(): JsonResponse
    {
        $popular = Post::where('published', true)
            ->orderByDesc('views_count')
            ->limit(10)
            ->pluck('title');

        return response()->json($popular);
    }
}