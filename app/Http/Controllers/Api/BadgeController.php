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
    /**
     * Get all available badges
     */
    public function index(): JsonResponse
    {
        $badges = Badge::orderBy('points', 'desc')->get();

        return response()->json($badges);
    }

    /**
     * Get user's badges
     */
    public function userBadges($identifier): JsonResponse
    {
        $user = is_numeric($identifier)
            ? User::findOrFail($identifier)
            : User::where('username', $identifier)->firstOrFail();

        $badges = $user->badges;

        return response()->json($badges);
    }

    /**
     * Check and award badges for current user
     */
    public function checkBadges(): JsonResponse
    {
        $user = Auth::user();
        
        $beforeCount = $user->badges()->count();
        $user->checkAndAwardBadges();
        $afterCount = $user->badges()->count();

        $newBadgesCount = $afterCount - $beforeCount;

        return response()->json([
            'message' => $newBadgesCount > 0 
                ? "Congratulations! You earned {$newBadgesCount} new badge(s)!" 
                : 'No new badges earned yet. Keep going!',
            'new_badges_count' => $newBadgesCount,
            'total_badges' => $afterCount,
            'badges' => $user->badges,
        ]);
    }

    /**
     * Get leaderboard (users with most badges/reputation)
     */
    public function leaderboard(Request $request): JsonResponse
    {
        $type = $request->get('type', 'reputation'); // reputation or badges

        if ($type === 'badges') {
            $users = User::withCount('badges')
                ->orderBy('badges_count', 'desc')
                ->limit(50)
                ->get(['id', 'name', 'username', 'avatar', 'reputation_points'])
                ->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'username' => $user->username,
                        'avatar' => $user->avatar,
                        'reputation_points' => $user->reputation_points,
                        'badges_count' => $user->badges_count,
                    ];
                });
        } else {
            $users = User::orderBy('reputation_points', 'desc')
                ->limit(50)
                ->get(['id', 'name', 'username', 'avatar', 'reputation_points'])
                ->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'username' => $user->username,
                        'avatar' => $user->avatar,
                        'reputation_points' => $user->reputation_points,
                        'badges_count' => $user->badges()->count(),
                    ];
                });
        }

        return response()->json($users);
    }

    /**
     * Seed predefined badges (admin only)
     */
    public function seed(): JsonResponse
    {
        Badge::seed();

        return response()->json([
            'message' => 'Badges seeded successfully',
            'count' => Badge::count(),
        ]);
    }
}