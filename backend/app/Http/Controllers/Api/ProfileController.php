<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Follow;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use MongoDB\BSON\ObjectId;

class ProfileController extends Controller
{
    /**
     * Display a user's public profile.
     */
    public function show($identifier): JsonResponse
    {
        $user = $this->findUserByIdentifier($identifier);

        if (!$user) {
            return response()->json(['message' => 'User profile not found'], 404);
        }

        $user->load(['badges', 'posts' => function ($query) {
            $query->where('status', 'published')
                  ->orderBy('created_at', 'desc')
                  ->limit(5);
        }]);

        return response()->json($this->formatProfile($user));
    }

    /**
     * Update the authenticated user's profile.
     */
    public function update(Request $request): JsonResponse
    {
        $user = Auth::user();

        $validated = $request->validate([
            'name'     => 'sometimes|string|max:255',
            'username' => 'sometimes|string|max:100|unique:users,username,' . $user->id . ',_id',
            'bio'      => 'nullable|string|max:500',
            'location' => 'nullable|string|max:100',
            'website'  => 'nullable|url|max:255',
            'twitter'  => 'nullable|string|max:100',
            'github'   => 'nullable|string|max:100',
            'linkedin' => 'nullable|string|max:100',
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Profile updated successfully',
            'user'    => $user->only(['id', 'name', 'username', 'email', 'avatar', 'bio', 'location', 'website', 'twitter', 'github', 'linkedin']),
        ]);
    }

    /**
     * Upload a new avatar for the authenticated user.
     */
    public function uploadAvatar(Request $request): JsonResponse
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $user = Auth::user();

        // Delete old avatar if exists
        if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
            Storage::disk('public')->delete($user->avatar);
        }

        $path = $request->file('avatar')->store('avatars', 'public');
        $user->update(['avatar' => $path]);

        return response()->json([
            'message'    => 'Avatar uploaded successfully',
            'avatar_url' => Storage::url($path),
        ]);
    }

    /**
     * Get a user's followers.
     */
    public function followers($identifier): JsonResponse
    {
        $user = $this->findUserByIdentifier($identifier);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        return $this->paginatedFollowers($user, 'following_id');
    }

    /**
     * Get a user's following list.
     */
    public function following($identifier): JsonResponse
    {
        $user = $this->findUserByIdentifier($identifier);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        return $this->paginatedFollowers($user, 'follower_id');
    }

    /**
     * Get a user's published posts.
     */
    public function posts($identifier): JsonResponse
    {
        $user = $this->findUserByIdentifier($identifier);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $posts = $user->posts()
            ->where('status', 'published')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json($posts);
    }

    /**
     * Get a user's activity feed.
     */
    public function activity($identifier): JsonResponse
    {
        $user = $this->findUserByIdentifier($identifier);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        $activities = $user->activities()
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($activities);
    }

    /**
     * Search users by name, username, or bio.
     */
    public function search(Request $request): JsonResponse
    {
        $query = trim($request->get('q', ''));

        if (empty($query)) {
            return response()->json([]);
        }

        $users = User::where(function ($q) use ($query) {
                $q->where('name', 'regexp', "/{$query}/i")
                  ->orWhere('username', 'regexp', "/{$query}/i")
                  ->orWhere('bio', 'regexp', "/{$query}/i");
            })
            ->limit(20)
            ->get(['_id', 'name', 'username', 'avatar', 'bio', 'reputation_points']);

        return response()->json($users);
    }

    // ============================================
    // HELPERS
    // ============================================

    /**
     * Find user by username or ObjectId.
     */
    protected function findUserByIdentifier(string $identifier): ?User
    {
        // If it's a valid 24-char hex string, try finding by ID first
        if (preg_match('/^[a-f\d]{24}$/i', $identifier)) {
            $user = User::find($identifier);
            if ($user) return $user;
        }

        // Otherwise, fallback to username
        return User::where('username', $identifier)->first();
    }

    /**
     * Format profile data for JSON response.
     */
    protected function formatProfile(User $user): array
    {
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
            'badges'       => $user->badges,
            'recent_posts' => $user->posts,
            'is_online'    => $user->is_online,
            'last_seen_at' => $user->last_seen_at,
            'member_since' => $user->created_at,
        ];

        // Add relationship data if viewer is authenticated and not viewing own profile
        if (Auth::check() && (string) Auth::id() !== (string) $user->id) {
            $current = Auth::user();
            $profile['relationship'] = [
                'is_following'   => $current->isFollowing($user),
                'is_followed_by' => $current->isFollowedBy($user),
            ];
        }

        return $profile;
    }

    /**
     * Return paginated followers/following with user details.
     */
    protected function paginatedFollowers(User $user, string $idField): JsonResponse
    {
        $follows = Follow::where($idField, (string) $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        $ids = $follows->pluck($idField === 'following_id' ? 'follower_id' : 'following_id')->toArray();

        $users = User::whereIn('_id', $ids)
            ->get(['_id', 'name', 'username', 'avatar', 'bio', 'reputation_points']);

        return response()->json([
            'data'         => $users,
            'current_page' => $follows->currentPage(),
            'last_page'    => $follows->lastPage(),
            'total'        => $follows->total(),
        ]);
    }
}