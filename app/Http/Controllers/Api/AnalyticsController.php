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

        // Collect post IDs belonging to the user
        $postIds = Post::where('user_id', $userId)
            ->pluck('_id')
            ->map(fn($id) => (string) $id)
            ->toArray();

        // Total views
        $totalViews = View::whereIn('post_id', $postIds)->count();

        // Approximate unique visitors by distinct IP
        // MongoDB supports distinct(), but laravel-mongodb exposes it differently:
        $uniqueVisitors = View::whereIn('post_id', $postIds)
            ->distinct('ip_address')
            ->count('ip_address');

        // Views this month using whereBetween (avoids SQL MONTH/YEAR functions)
        $viewsThisMonth = View::whereIn('post_id', $postIds)
            ->whereBetween('created_at', [
                now()->startOfMonth(),
                now()->endOfMonth(),
            ])
            ->count();

        // Top 5 posts by views — withCount uses $lookup in laravel-mongodb
        $topPosts = Post::where('user_id', $userId)
            ->withCount('views')
            ->orderBy('views_count', 'desc')
            ->limit(5)
            ->get(['_id', 'title', 'views_count'])
            ->map(fn($post) => [
                'id'          => (string) $post->_id,
                'title'       => $post->title,
                'views_count' => $post->views_count,
            ]);

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

        // Fetch raw records and group by date in PHP —
        // avoids DB::raw('DATE(...)') which is MySQL-only
        $views = View::whereIn('post_id', $postIds)
            ->where('created_at', '>=', $since)
            ->get(['created_at']);

        $grouped = $views->groupBy(
            fn($v) => Carbon::parse($v->created_at)->format('Y-m-d')
        );

        $data = [];
        for ($i = $days; $i >= 0; $i--) {
            $date   = now()->subDays($i)->format('Y-m-d');
            $data[] = [
                'date'  => $date,
                'views' => isset($grouped[$date]) ? $grouped[$date]->count() : 0,
            ];
        }

        return response()->json($data);
    }
}