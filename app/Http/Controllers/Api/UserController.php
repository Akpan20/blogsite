<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Payment;
use App\Models\Follow;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class UserController extends Controller
{
    public function show(): \Illuminate\Http\JsonResponse
    {
        return response()->json(Auth::user());
    }

    public function updateProfile(Request $request): \Illuminate\Http\JsonResponse
    {
        $user = Auth::user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'min:2', 'max:255'],
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Profile updated successfully',
            'user'    => $user->fresh(),
        ]);
    }

    public function updatePassword(Request $request): \Illuminate\Http\JsonResponse
    {
        $user = Auth::user();

        $validated = $request->validate([
            'current_password' => ['required', 'current_password:api'],
            'password'         => ['required', 'confirmed', Password::defaults()],
        ]);

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        return response()->json(['message' => 'Password updated successfully']);
    }

    public function updateNotifications(Request $request): \Illuminate\Http\JsonResponse
    {
        $user = Auth::user();

        $validated = $request->validate([
            'email_notifications'  => ['boolean'],
            'new_comment_alerts'   => ['boolean'],
            'subscription_updates' => ['boolean'],
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

        // MongoDB doesn't support whereMonth/whereYear — filter in PHP
        $payments = Payment::where('user_id', $userId)
            ->where('status', 'success')
            ->get(['amount', 'currency', 'paid_at']);

        $totalEarnings = $payments->sum('amount') / 100;

        $monthlyEarnings = $payments->filter(function ($p) {
            return $p->paid_at &&
                $p->paid_at->month === now()->month &&
                $p->paid_at->year === now()->year;
        })->sum('amount') / 100;

        $recentPayments = $payments->sortByDesc('paid_at')->take(5)->values();

        return response()->json([
            'total_earnings'   => round($totalEarnings, 2),
            'monthly_earnings' => round($monthlyEarnings, 2),
            'recent_payments'  => $recentPayments,
        ]);
    }

    public function suggestions(Request $request)
    {
        $limit         = $request->input('limit', 5);
        $currentUserId = (string) Auth::id();

        // Get IDs of users already followed
        $followingIds = Follow::where('follower_id', $currentUserId)
            ->pluck('following_id')
            ->map(fn($id) => (string) $id)
            ->toArray();

        $followingIds[] = $currentUserId;

        $suggestedUsers = User::whereNotIn('_id', $followingIds)
            ->orderByDesc('reputation_points')
            ->limit($limit)
            ->get(['_id', 'name', 'username', 'avatar', 'bio', 'reputation_points']);

        return response()->json($suggestedUsers);
    }
}