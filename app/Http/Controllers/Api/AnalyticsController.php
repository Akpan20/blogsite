<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\View;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    public function overview()
    {
        $userId = Auth::id();

        // Total views (all posts by this user)
        $totalViews = View::whereIn('post_id', Post::where('user_id', $userId)->select('id'))->count();

        // Approx unique visitors (distinct IPs over all time — rough estimate)
        $uniqueVisitors = View::whereIn('post_id', Post::where('user_id', $userId)->select('id'))
            ->distinct('ip_address')
            ->count('ip_address');

        // Views this month
        $viewsThisMonth = View::whereIn('post_id', Post::where('user_id', $userId)->select('id'))
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        // Top 5 posts by views
        $topPosts = Post::where('user_id', $userId)
            ->withCount('views')
            ->orderByDesc('views_count')
            ->take(5)
            ->get(['id', 'title', 'views_count']);

        return response()->json([
            'total_views' => $totalViews,
            'unique_visitors' => $uniqueVisitors,
            'views_this_month' => $viewsThisMonth,
            'top_posts' => $topPosts,
        ]);
    }

    public function viewsOverTime(Request $request)
    {
        $userId = Auth::id();

        $days = $request->input('days', 30); // default last 30 days

        $views = View::whereIn('post_id', Post::where('user_id', $userId)->select('id'))
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as views'))
            ->groupBy('date')
            ->orderBy('date')
            ->where('created_at', '>=', now()->subDays($days))
            ->get();

        // Fill missing dates with 0
        $data = [];
        for ($i = $days; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $data[] = [
                'date' => $date,
                'views' => $views->firstWhere('date', $date)?->views ?? 0,
            ];
        }

        return response()->json($data);
    }
}