<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\View;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class AnalyticsController extends Controller
{
    public function overview()
    {
        $userId = (string) Auth::id();

        // Get user's post IDs
        $postIds = Post::where('user_id', $userId)
            ->pluck('_id')
            ->map(fn($id) => (string) $id)
            ->toArray();

        // Total views
        $totalViews = View::whereIn('post_id', $postIds)->count();

        // Unique visitors - FIXED: Use proper MongoDB distinct + count
        $uniqueVisitors = View::whereIn('post_id', $postIds)
            ->distinct('ip_address')
            ->count();   // Remove the column name here

        // Views this month
        $viewsThisMonth = View::whereIn('post_id', $postIds)
            ->whereBetween('created_at', [
                now()->startOfMonth()->toDateTimeString(),
                now()->endOfMonth()->toDateTimeString(),
            ])
            ->count();

        // Top 5 posts by views - FIXED: Avoid withCount (unreliable on MongoDB)
        $topPosts = Post::where('user_id', $userId)
            ->with('views')                    // Load relation if needed
            ->get(['_id', 'title'])
            ->map(function ($post) {
                return [
                    'id'          => (string) $post->_id,
                    'title'       => $post->title,
                    'views_count' => $post->views->count(),   // Count in PHP
                ];
            })
            ->sortByDesc('views_count')
            ->take(5)
            ->values();

        return response()->json([
            'total_views'      => $totalViews,
            'unique_visitors'  => $uniqueVisitors,
            'views_this_month' => $viewsThisMonth,
            'top_posts'        => $topPosts,
        ]);
    }

    public function viewsOverTime(Request $request)
    {
        $userId = (string) Auth::id();
        $days   = (int) $request->input('days', 30);

        $postIds = Post::where('user_id', $userId)
            ->pluck('_id')
            ->map(fn($id) => (string) $id)
            ->toArray();

        $since = now()->subDays($days);

        $views = View::whereIn('post_id', $postIds)
            ->where('created_at', '>=', $since)
            ->get(['created_at']);

        $grouped = $views->groupBy(
            fn($v) => Carbon::parse($v->created_at)->format('Y-m-d')
        );

        $data = [];
        for ($i = $days; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $data[] = [
                'date'  => $date,
                'views' => $grouped->get($date)?->count() ?? 0,
            ];
        }

        return response()->json($data);
    }
}