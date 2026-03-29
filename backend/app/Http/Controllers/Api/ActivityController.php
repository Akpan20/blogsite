<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class ActivityController extends Controller
{
    public function feed(Request $request): JsonResponse
    {
        $user       = Auth::user();
        $limit      = $request->get('limit', 20);
        $activities = $user->feed($limit);

        return response()->json($activities);
    }

    public function userActivities(Request $request): JsonResponse
    {
        $user = Auth::user();

        $activities = $user->activities()
            ->with(['subject'])
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 20));

        return response()->json($activities);
    }

    public function global(Request $request): JsonResponse
    {
        $activities = Activity::with(['user', 'subject'])
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 20));

        return response()->json($activities);
    }

    public function trending(): JsonResponse
    {
        // withCount with a callback sub-query is not supported in MongoDB.
        // Fetch recent activities and sort by a stored engagement field instead,
        // or compute engagement in PHP if the dataset is manageable.
        $activities = Activity::with(['user', 'subject'])
            ->where('created_at', '>=', now()->subDays(7))
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get();

        // If your Activity model stores an 'engagement_count' field that is
        // incremented on each interaction, sort by it here:
        // ->orderBy('engagement_count', 'desc')

        return response()->json($activities);
    }
}