<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Follow;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    public function show($identifier): JsonResponse
    {
        // MongoDB uses _id (string), not numeric id
        $user = User::where('username', $identifier)->first()
            ?? User::find($identifier);

        if (!$user) abort(404);

        $user->load(['badges', 'posts' => function ($query) {
            $query->where('status', 'published')
                  ->orderBy('created_at', 'desc')
                  ->limit(5);
        }]);

        $profile = [
            'id'         => $user->id,
            'name'       => $user->name,
            'username'   => $user->username,
            'email'      => $user->email,
            'avatar'     => $user->avatar,
            'bio'        => $user->bio,
            'location'   => $user->location,
            'website'    => $user->website,
            'social'     => [
                'twitter'  => $user->twitter,
                'github'   => $user->github,
                'linkedin' => $user->linkedin,
            ],
            'stats' => [
                'reputation_points' => $user->reputation_points ?? 0,
                'posts_count'       => $user->posts_count ?? 0,
                'followers_count'   => $user->followers_count ?? 0,
                'following_count'   => $user->following_count ?? 0,
                'comments_count'    => $user->comments()->count(),
            ],
            'badges'      => $user->badges,
            'recent_posts'=> $user->posts,
            'is_online'   => $user->is_online,
            'last_seen_at'=> $user->last_seen_at,
            'member_since'=> $user->created_at,
        ];

        if (Auth::check() && (string) Auth::id() !== (string) $user->id) {
            $currentUser            = Auth::user();
            $profile['relationship'] = [
                'is_following'   => $currentUser->isFollowing($user),
                'is_followed_by' => $currentUser->isFollowedBy($user),
            ];
        }

        return response()->json($profile);
    }

    public function update(Request $request): JsonResponse
    {
        $user = Auth::user();

        $validated = $request->validate([
            'name'     => 'sometimes|string|max:255',
            'bio'      => 'nullable|string|max:500',
            'location' => 'nullable|string|max:100',
            'website'  => 'nullable|url|max:255',
            'twitter'  => 'nullable|string|max:100',
            'github'   => 'nullable|string|max:100',
            'linkedin' => 'nullable|string|max:100',
        ]);

        // Check username uniqueness manually
        if ($request->filled('username') && $request->username !== $user->username) {
            if (User::where('username', $request->username)->exists()) {
                return response()->json(['errors' => ['username' => ['Username already taken.']]], 422);
            }
            $validated['username'] = $request->username;
        }

        $user->update($validated);

        return response()->json([
            'message' => 'Profile updated successfully',
            'user'    => $user,
        ]);
    }

    public function uploadAvatar(Request $request): JsonResponse
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $user = Auth::user();

        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }

        $path = $request->file('avatar')->store('avatars', 'public');
        $user->update(['avatar' => $path]);

        return response()->json([
            'message'    => 'Avatar uploaded successfully',
            'avatar_url' => Storage::url($path),
        ]);
    }

    public function followers($identifier): JsonResponse
    {
        $user = User::where('username', $identifier)->first()
            ?? User::find($identifier);

        if (!$user) abort(404);

        // MongoDB doesn't support pivot select/orderBy on BelongsToMany
        // Query Follow model directly instead
        $follows = Follow::where('following_id', (string) $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        $followerIds = $follows->pluck('follower_id')->toArray();
        $followers   = User::whereIn('_id', $followerIds)
            ->get(['_id', 'name', 'username', 'avatar', 'bio', 'reputation_points']);

        return response()->json([
            'data'         => $followers,
            'current_page' => $follows->currentPage(),
            'last_page'    => $follows->lastPage(),
            'total'        => $follows->total(),
        ]);
    }

    public function following($identifier): JsonResponse
    {
        $user = User::where('username', $identifier)->first()
            ?? User::find($identifier);

        if (!$user) abort(404);

        $follows = Follow::where('follower_id', (string) $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        $followingIds = $follows->pluck('following_id')->toArray();
        $following    = User::whereIn('_id', $followingIds)
            ->get(['_id', 'name', 'username', 'avatar', 'bio', 'reputation_points']);

        return response()->json([
            'data'         => $following,
            'current_page' => $follows->currentPage(),
            'last_page'    => $follows->lastPage(),
            'total'        => $follows->total(),
        ]);
    }

    public function posts($identifier): JsonResponse
    {
        $user = User::where('username', $identifier)->first()
            ?? User::find($identifier);

        if (!$user) abort(404);

        $posts = $user->posts()
            ->where('status', 'published')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json($posts);
    }

    public function activity($identifier): JsonResponse
    {
        $user = User::where('username', $identifier)->first()
            ?? User::find($identifier);

        if (!$user) abort(404);

        $activities = $user->activities()
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($activities);
    }

    public function search(Request $request): JsonResponse
    {
        $query = $request->get('q', '');

        // MongoDB uses regexp instead of LIKE
        $users = User::where(function ($q) use ($query) {
                $q->where('name', 'regexp', "/{$query}/i")
                  ->orWhere('username', 'regexp', "/{$query}/i")
                  ->orWhere('bio', 'regexp', "/{$query}/i");
            })
            ->limit(20)
            ->get(['_id', 'name', 'username', 'avatar', 'bio', 'reputation_points']);

        return response()->json($users);
    }
}