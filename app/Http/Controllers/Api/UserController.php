<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class UserController extends Controller
{
    /**
     * Get the authenticated user.
     */
    public function show(): \Illuminate\Http\JsonResponse
    {
        return response()->json(Auth::user());
    }

    /**
     * Update the authenticated user's profile information.
     */
    public function updateProfile(Request $request): \Illuminate\Http\JsonResponse
    {
        /** @var User $user */
        $user = Auth::user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'min:2', 'max:255'],
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Profile updated successfully',
            'user'    => $user->refresh(), // or $user->fresh()
        ]);
    }

    /**
     * Update the authenticated user's password.
     */
    public function updatePassword(Request $request): \Illuminate\Http\JsonResponse
    {
        /** @var User $user */
        $user = Auth::user();

        $validated = $request->validate([
            'current_password' => ['required', 'current_password:api'],
            'password'         => ['required', 'confirmed', Password::defaults()],
        ]);

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        // Optional: force logout from other devices
        // Auth::guard('web')->logoutOtherDevices($validated['password']);

        return response()->json([
            'message' => 'Password updated successfully',
        ]);
    }

    /**
     * Update the authenticated user's notification preferences.
     *
     * Requires migration: $table->json('preferences')->nullable();
     */
    public function updateNotifications(Request $request): \Illuminate\Http\JsonResponse
    {
        /** @var User $user */
        $user = Auth::user();

        $validated = $request->validate([
            'email_notifications'    => ['boolean'],
            'new_comment_alerts'     => ['boolean'],
            'subscription_updates'   => ['boolean'],
            // Add more preferences as needed
        ]);

        $current = $user->preferences ?? [];

        $user->update([
            'preferences' => array_merge($current, $validated),
        ]);

        return response()->json([
            'message'     => 'Notification preferences saved',
            'preferences' => $user->preferences,
        ]);
    }

    public function earnings()
    {
        $userId = Auth::id();
        if (!$userId) return response()->json(['message' => 'Unauthenticated.'], 401);

        $totalEarnings = Payment::where('user_id', $userId)
            ->where('status', 'success')
            ->sum('amount') / 100;

        $monthlyEarnings = Payment::where('user_id', $userId)
            ->where('status', 'success')
            ->whereMonth('paid_at', now()->month)
            ->whereYear('paid_at', now()->year)
            ->sum('amount') / 100;

        $recentPayments = Payment::where('user_id', $userId)
            ->where('status', 'success')
            ->latest('paid_at')
            ->take(5)
            ->get(['amount', 'currency', 'paid_at']);

        return response()->json([
            'total_earnings' => round($totalEarnings, 2),
            'monthly_earnings' => round($monthlyEarnings, 2),
            'recent_payments' => $recentPayments,
        ]);
    }

    public function suggestions(Request $request)
    {
        $limit = $request->input('limit', 5);
        $currentUserId = Auth::id();
        
        // Get users that current user is NOT following
        $suggestedUsers = User::where('id', '!=', $currentUserId)
            ->whereNotIn('id', function($query) use ($currentUserId) {
                $query->select('following_id')
                    ->from('follows')
                    ->where('follower_id', $currentUserId);
            })
            ->withCount(['followers', 'posts'])
            ->orderByDesc('followers_count')
            ->orderByDesc('posts_count')
            ->limit($limit)
            ->get(['id', 'name', 'username', 'avatar', 'bio', 'reputation_points']);
        
        return response()->json($suggestedUsers);
    }
}