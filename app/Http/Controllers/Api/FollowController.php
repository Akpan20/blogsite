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

        if ($currentUser->id === $user->id) {
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

        return response()->json([
            'message' => 'Successfully followed user',
            'is_following' => true,
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

        return response()->json([
            'message' => 'Successfully unfollowed user',
            'is_following' => false,
            'followers_count' => $user->followers_count,
        ]);
    }

    /**
     * Toggle follow status
     */
    public function toggle(User $user): JsonResponse
    {
        $currentUser = Auth::user();

        if ($currentUser->id === $user->id) {
            return response()->json([
                'message' => 'You cannot follow yourself',
            ], 422);
        }

        if ($currentUser->isFollowing($user)) {
            $currentUser->unfollow($user);
            $message = 'Successfully unfollowed user';
            $isFollowing = false;
        } else {
            $currentUser->follow($user);
            $message = 'Successfully followed user';
            $isFollowing = true;
        }

        return response()->json([
            'message' => $message,
            'is_following' => $isFollowing,
            'followers_count' => $user->followers_count,
        ]);
    }

    /**
     * Get suggested users to follow
     */
    public function suggestions(): JsonResponse
    {
        $currentUser = Auth::user();

        // Get users that current user's following are following
        $suggestions = User::whereHas('followers', function ($query) use ($currentUser) {
            $query->whereIn('follower_id', $currentUser->following()->pluck('users.id'));
        })
        ->whereNotIn('id', $currentUser->following()->pluck('users.id'))
        ->where('id', '!=', $currentUser->id)
        ->select('id', 'name', 'username', 'avatar', 'bio', 'reputation_points')
        ->withCount('followers')
        ->orderBy('followers_count', 'desc')
        ->limit(10)
        ->get();

        // If not enough suggestions, add users with high reputation
        if ($suggestions->count() < 10) {
            $additional = User::whereNotIn('id', $currentUser->following()->pluck('users.id'))
                ->where('id', '!=', $currentUser->id)
                ->whereNotIn('id', $suggestions->pluck('id'))
                ->orderBy('reputation_points', 'desc')
                ->select('id', 'name', 'username', 'avatar', 'bio', 'reputation_points')
                ->limit(10 - $suggestions->count())
                ->get();

            $suggestions = $suggestions->concat($additional);
        }

        return response()->json($suggestions);
    }
}