<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Badge;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class BadgeController extends Controller
{
    public function index(): JsonResponse
    {
        $badges = Badge::orderBy('points', 'desc')->get();
        return response()->json($badges);
    }

    public function userBadges($identifier): JsonResponse
    {
        // _id in MongoDB is an ObjectId — numeric check still works for username routing
        $user = is_numeric($identifier)
            ? User::findOrFail($identifier)
            : User::where('username', $identifier)->firstOrFail();

        return response()->json($user->badges);
    }

    public function checkBadges(): JsonResponse
    {
        $user = Auth::user();

        $beforeCount = $user->badges()->count();
        $user->checkAndAwardBadges();
        $afterCount = $user->badges()->count();

        $newBadgesCount = $afterCount - $beforeCount;

        return response()->json([
            'message'          => $newBadgesCount > 0
                ? "Congratulations! You earned {$newBadgesCount} new badge(s)!"
                : 'No new badges earned yet. Keep going!',
            'new_badges_count' => $newBadgesCount,
            'total_badges'     => $afterCount,
            'badges'           => $user->badges,
        ]);
    }

    public function leaderboard(Request $request): JsonResponse
    {
        $type = $request->get('type', 'reputation');

        if ($type === 'badges') {
            // withCount works in laravel-mongodb via a $lookup aggregation
            $users = User::withCount('badges')
                ->orderBy('badges_count', 'desc')
                ->limit(50)
                ->get(['_id', 'name', 'username', 'avatar', 'reputation_points'])
                ->map(fn($user) => [
                    'id'               => (string) $user->_id,
                    'name'             => $user->name,
                    'username'         => $user->username,
                    'avatar'           => $user->avatar,
                    'reputation_points'=> $user->reputation_points,
                    'badges_count'     => $user->badges_count,
                ]);
        } else {
            // For the reputation leaderboard, badges_count is loaded per-user.
            // To avoid N+1, eager-load badges and count in PHP.
            $users = User::orderBy('reputation_points', 'desc')
                ->limit(50)
                ->get(['_id', 'name', 'username', 'avatar', 'reputation_points'])
                ->map(fn($user) => [
                    'id'               => (string) $user->_id,
                    'name'             => $user->name,
                    'username'         => $user->username,
                    'avatar'           => $user->avatar,
                    'reputation_points'=> $user->reputation_points,
                    // badges() relation works fine in MongoDB via embedsMany / hasMany
                    'badges_count'     => $user->badges()->count(),
                ]);
        }

        return response()->json($users);
    }

    public function seed(): JsonResponse
    {
        Badge::seed();
        return response()->json([
            'message' => 'Badges seeded successfully',
            'count'   => Badge::count(),
        ]);
    }
}