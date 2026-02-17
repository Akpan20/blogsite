<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    /**
     * Get user profile by username or ID
     */
    public function show($identifier): JsonResponse
    {
        $user = is_numeric($identifier)
            ? User::findOrFail($identifier)
            : User::where('username', $identifier)->firstOrFail();

        $user->load(['badges', 'posts' => function ($query) {
            $query->where('status', 'published')  // Changed from 'published' to 'status'
                  ->orderBy('created_at', 'desc')
                  ->limit(5);
        }]);

        $profile = [
            'id' => $user->id,
            'name' => $user->name,
            'username' => $user->username,
            'email' => $user->email,
            'avatar' => $user->avatar,
            'bio' => $user->bio,
            'location' => $user->location,
            'website' => $user->website,
            'social' => [
                'twitter' => $user->twitter,
                'github' => $user->github,
                'linkedin' => $user->linkedin,
            ],
            'stats' => [
                'reputation_points' => $user->reputation_points ?? 0,
                'posts_count' => $user->posts_count ?? 0,
                'followers_count' => $user->followers_count ?? 0,
                'following_count' => $user->following_count ?? 0,
                'comments_count' => $user->comments()->count(),
            ],
            'badges' => $user->badges,
            'recent_posts' => $user->posts,
            'is_online' => $user->is_online,
            'last_seen_at' => $user->last_seen_at,
            'member_since' => $user->created_at,
        ];

        // Add relationship status if viewing another user's profile
        if (Auth::check() && Auth::id() !== $user->id) {
            $currentUser = Auth::user();
            $profile['relationship'] = [
                'is_following' => $currentUser->isFollowing($user),
                'is_followed_by' => $currentUser->isFollowedBy($user),
            ];
        }

        return response()->json($profile);
    }

    /**
     * Update authenticated user's profile
     */
    public function update(Request $request): JsonResponse
    {
        $user = Auth::user();

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'username' => 'sometimes|string|max:50|unique:users,username,' . $user->id,
            'bio' => 'nullable|string|max:500',
            'location' => 'nullable|string|max:100',
            'website' => 'nullable|url|max:255',
            'twitter' => 'nullable|string|max:100',
            'github' => 'nullable|string|max:100',
            'linkedin' => 'nullable|string|max:100',
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user,
        ]);
    }

    /**
     * Upload avatar
     */
    public function uploadAvatar(Request $request): JsonResponse
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $user = Auth::user();

        // Delete old avatar if exists
        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }

        // Store new avatar
        $path = $request->file('avatar')->store('avatars', 'public');

        $user->update(['avatar' => $path]);

        return response()->json([
            'message' => 'Avatar uploaded successfully',
            'avatar_url' => Storage::url($path),
        ]);
    }

    /**
     * Get user's followers
     */
    public function followers($identifier): JsonResponse
    {
        $user = is_numeric($identifier)
            ? User::findOrFail($identifier)
            : User::where('username', $identifier)->firstOrFail();

        $followers = $user->followers()
            ->select('users.id', 'users.name', 'users.username', 'users.avatar', 'users.bio', 'users.reputation_points')
            ->withPivot('created_at')
            ->orderBy('follows.created_at', 'desc')
            ->paginate(20);

        return response()->json($followers);
    }

    /**
     * Get users that user is following
     */
    public function following($identifier): JsonResponse
    {
        $user = is_numeric($identifier)
            ? User::findOrFail($identifier)
            : User::where('username', $identifier)->firstOrFail();

        $following = $user->following()
            ->select('users.id', 'users.name', 'users.username', 'users.avatar', 'users.bio', 'users.reputation_points')
            ->withPivot('created_at')
            ->orderBy('follows.created_at', 'desc')
            ->paginate(20);

        return response()->json($following);
    }

    /**
     * Get user's posts
     */
    public function posts($identifier): JsonResponse
    {
        $user = is_numeric($identifier)
            ? User::findOrFail($identifier)
            : User::where('username', $identifier)->firstOrFail();

        $posts = $user->posts()
            ->where('status', 'published')  // Changed from 'published' to 'status'
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json($posts);
    }

    /**
     * Get user's activity
     */
    public function activity($identifier): JsonResponse
    {
        $user = is_numeric($identifier)
            ? User::findOrFail($identifier)
            : User::where('username', $identifier)->firstOrFail();

        $activities = $user->activities()
            ->with(['subject'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($activities);
    }

    /**
     * Search users
     */
    public function search(Request $request): JsonResponse
    {
        $query = $request->get('q');

        $users = User::where('name', 'LIKE', "%{$query}%")
            ->orWhere('username', 'LIKE', "%{$query}%")
            ->orWhere('bio', 'LIKE', "%{$query}%")
            ->select('id', 'name', 'username', 'avatar', 'bio', 'reputation_points')
            ->limit(20)
            ->get();

        return response()->json($users);
    }
}