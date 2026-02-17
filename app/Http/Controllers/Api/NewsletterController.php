<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NewsletterSubscriber;
use App\Notifications\NewsletterConfirmation;
use App\Notifications\NewsletterWelcome;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Notification;

class NewsletterController extends Controller
{
    /**
     * Subscribe to newsletter
     */
    public function subscribe(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email|max:255',
            'source' => 'nullable|string|in:footer,popup,post,sidebar',
        ]);

        // Check if already subscribed
        $subscriber = NewsletterSubscriber::where('email', $request->email)->first();

        if ($subscriber) {
            if ($subscriber->status === 'unsubscribed') {
                // Reactivate subscription
                $subscriber->update([
                    'status' => 'active',
                    'token' => NewsletterSubscriber::generateToken(),
                    'is_confirmed' => false,
                    'source' => $request->source ?? 'unknown',
                ]);
            } elseif (!$subscriber->is_confirmed) {
                // Resend confirmation
                $subscriber->update([
                    'token' => NewsletterSubscriber::generateToken(),
                ]);
            } else {
                return response()->json([
                    'message' => 'You are already subscribed to our newsletter.',
                ], 409);
            }
        } else {
            // Create new subscriber
            $subscriber = NewsletterSubscriber::create([
                'email' => $request->email,
                'token' => NewsletterSubscriber::generateToken(),
                'ip_address' => $request->ip(),
                'source' => $request->source ?? 'unknown',
            ]);
        }

        // Send confirmation email
        try {
            Notification::route('mail', $subscriber->email)
                ->notify(new NewsletterConfirmation($subscriber));
        } catch (\Exception $e) {
            \Log::error('Newsletter confirmation email failed: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Please check your email to confirm your subscription.',
        ], 201);
    }

    /**
     * Confirm subscription
     */
    public function confirm(Request $request, string $token): JsonResponse
    {
        $subscriber = NewsletterSubscriber::where('token', $token)->first();

        if (!$subscriber) {
            return response()->json([
                'message' => 'Invalid confirmation token.',
            ], 404);
        }

        if ($subscriber->is_confirmed) {
            return response()->json([
                'message' => 'Your subscription is already confirmed.',
            ], 200);
        }

        $subscriber->confirm();

        // Send welcome email
        try {
            Notification::route('mail', $subscriber->email)
                ->notify(new NewsletterWelcome($subscriber));
        } catch (\Exception $e) {
            \Log::error('Newsletter welcome email failed: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Thank you! Your subscription has been confirmed.',
        ]);
    }

    /**
     * Unsubscribe from newsletter
     */
    public function unsubscribe(Request $request, string $token): JsonResponse
    {
        $subscriber = NewsletterSubscriber::where('token', $token)->first();

        if (!$subscriber) {
            return response()->json([
                'message' => 'Invalid unsubscribe token.',
            ], 404);
        }

        if ($subscriber->status === 'unsubscribed') {
            return response()->json([
                'message' => 'You are already unsubscribed.',
            ], 200);
        }

        $subscriber->unsubscribe();

        return response()->json([
            'message' => 'You have been successfully unsubscribed from our newsletter.',
        ]);
    }

    /**
     * Update preferences
     */
    public function updatePreferences(Request $request, string $token): JsonResponse
    {
        $request->validate([
            'preferences' => 'required|array',
        ]);

        $subscriber = NewsletterSubscriber::where('token', $token)->first();

        if (!$subscriber) {
            return response()->json([
                'message' => 'Invalid token.',
            ], 404);
        }

        $subscriber->update([
            'preferences' => $request->preferences,
        ]);

        return response()->json([
            'message' => 'Your preferences have been updated.',
        ]);
    }

    /**
     * Get subscriber count (public)
     */
    public function count(): JsonResponse
    {
        $count = NewsletterSubscriber::active()->count();

        return response()->json([
            'count' => $count,
        ]);
    }

    /**
     * Get all subscribers (admin only)
     */
    public function index(Request $request): JsonResponse
    {
        $subscribers = NewsletterSubscriber::query()
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($request->confirmed !== null, function ($query) use ($request) {
                $query->where('is_confirmed', $request->confirmed);
            })
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 20));

        return response()->json($subscribers);
    }
}