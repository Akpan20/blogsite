<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class FollowController extends Controller
{
    /**
     * Follow a user
     */
    public function follow(User $user): JsonResponse
    {
        $currentUser = Auth::user();

        if ((string) $currentUser->_id === (string) $user->_id) {
            return response()->json([
                'message' => 'You cannot follow yourself',
            ], 422);
        }

        if ($currentUser->isFollowing($user)) {
            return response()->json([
                'message' => 'You are already following this user',
            ], 409);
        }

        $currentUser->follow($user);

        $user->refresh();

        return response()->json([
            'message'         => 'Successfully followed user',
            'is_following'    => true,
            'followers_count' => $user->followers_count,
        ]);
    }

    /**
     * Unfollow a user
     */
    public function unfollow(User $user): JsonResponse
    {
        $currentUser = Auth::user();

        if (!$currentUser->isFollowing($user)) {
            return response()->json([
                'message' => 'You are not following this user',
            ], 409);
        }

        $currentUser->unfollow($user);

        $user->refresh();

        return response()->json([
            'message'         => 'Successfully unfollowed user',
            'is_following'    => false,
            'followers_count' => $user->followers_count,
        ]);
    }

    /**
     * Toggle follow status
     */
    public function toggle(User $user): JsonResponse
    {
        $currentUser = Auth::user();

        if ((string) $currentUser->_id === (string) $user->_id) {
            return response()->json([
                'message' => 'You cannot follow yourself',
            ], 422);
        }

        if ($currentUser->isFollowing($user)) {
            $currentUser->unfollow($user);
            $message     = 'Successfully unfollowed user';
            $isFollowing = false;
        } else {
            $currentUser->follow($user);
            $message     = 'Successfully followed user';
            $isFollowing = true;
        }

        $user->refresh();

        return response()->json([
            'message'         => $message,
            'is_following'    => $isFollowing,
            'followers_count' => $user->followers_count,
        ]);
    }

    /**
     * Get suggested users to follow
     */
    public function suggestions(): JsonResponse
    {
        $currentUser = Auth::user();

        // Collect ObjectIds of users the current user already follows
        $followingIds = $currentUser->following()
            ->pluck('_id')
            ->map(fn($id) => (string) $id)
            ->toArray();

        // Friends-of-friends: users followed by people the current user follows
        $suggestions = User::whereIn(
                'followers.follower_id',            // embedded or referenced field
                $followingIds
            )
            ->whereNotIn('_id', $followingIds)
            ->where('_id', '!=', (string) $currentUser->_id)
            ->select('_id', 'name', 'username', 'avatar', 'bio', 'reputation_points')
            ->withCount('followers')
            ->orderBy('followers_count', 'desc')
            ->limit(10)
            ->get();

        // Backfill with high-reputation users if fewer than 10 results
        if ($suggestions->count() < 10) {
            $excludeIds = array_merge(
                $followingIds,
                $suggestions->pluck('_id')->map(fn($id) => (string) $id)->toArray(),
                [(string) $currentUser->_id]
            );

            $additional = User::whereNotIn('_id', $excludeIds)
                ->orderBy('reputation_points', 'desc')
                ->select('_id', 'name', 'username', 'avatar', 'bio', 'reputation_points')
                ->limit(10 - $suggestions->count())
                ->get();

            $suggestions = $suggestions->concat($additional);
        }

        return response()->json($suggestions);
    }
}