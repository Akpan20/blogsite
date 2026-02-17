<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class ActivityController extends Controller
{
    /**
     * Get authenticated user's activity feed
     */
    public function feed(Request $request): JsonResponse
    {
        $user = Auth::user();
        $limit = $request->get('limit', 20);

        $activities = $user->feed($limit);

        return response()->json($activities);
    }

    /**
     * Get user's own activities
     */
    public function userActivities(Request $request): JsonResponse
    {
        $user = Auth::user();

        $activities = $user->activities()
            ->with(['subject'])
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 20));

        return response()->json($activities);
    }

    /**
     * Get global activity (for discovery)
     */
    public function global(Request $request): JsonResponse
    {
        $activities = Activity::with(['user', 'subject'])
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 20));

        return response()->json($activities);
    }

    /**
     * Get trending activities (most engaged)
     */
    public function trending(): JsonResponse
    {
        // Get activities from last 7 days, ordered by engagement
        $activities = Activity::with(['user', 'subject'])
            ->where('created_at', '>=', now()->subDays(7))
            ->withCount(['subject as engagement' => function ($query) {
                // Count comments for posts, reactions for comments, etc.
            }])
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get();

        return response()->json($activities);
    }
}