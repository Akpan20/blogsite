<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionPlan;
use App\Services\SubscriptionService;
use App\Services\PaystackService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SubscriptionController extends Controller
{
    public function __construct(
        private SubscriptionService $subscriptionService,
        private PaystackService $paystackService
    ) {}

    public function plans(): JsonResponse
    {
        $plans = SubscriptionPlan::where('is_active', true)
            ->orderBy('price')
            ->get();

        return response()->json($plans);
    }

    public function currentSubscription(Request $request): JsonResponse
    {
        $subscription = $this->subscriptionService->getUserActiveSubscription($request->user());

        return response()->json([
            'subscription'            => $subscription,
            'has_active_subscription' => $subscription !== null,
        ]);
    }

    public function subscribe(Request $request): JsonResponse
    {
        $request->validate([
            'plan_id' => 'required',
        ]);

        $plan = SubscriptionPlan::findOrFail($request->plan_id);

        $activeSubscription = $this->subscriptionService->getUserActiveSubscription($request->user());
        if ($activeSubscription) {
            return response()->json(['message' => 'You already have an active subscription'], 400);
        }

        if ($plan->isFree()) {
            return response()->json(['message' => 'Free plan does not require payment'], 400);
        }

        try {
            $paymentData = $this->subscriptionService->initializeSubscription($request->user(), $plan);
            return response()->json([
                'message' => 'Payment initialized successfully',
                'data'    => $paymentData,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to initialize payment',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }

    public function verifyPayment(Request $request): JsonResponse
    {
        $request->validate(['reference' => 'required|string']);

        try {
            $result = $this->subscriptionService->verifyAndActivateSubscription($request->reference);
            return response()->json([
                'message'      => 'Subscription activated successfully',
                'subscription' => $result['subscription'],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Payment verification failed',
                'error'   => $e->getMessage(),
            ], 400);
        }
    }

    public function cancel(Request $request): JsonResponse
    {
        $subscription = $this->subscriptionService->getUserActiveSubscription($request->user());

        if (!$subscription) {
            return response()->json(['message' => 'No active subscription found'], 404);
        }

        $this->subscriptionService->cancelSubscription($subscription);

        return response()->json(['message' => 'Subscription cancelled successfully']);
    }

    public function history(Request $request): JsonResponse
    {
        $subscriptions = $request->user()
            ->subscriptions()
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json($subscriptions);
    }

    public function transactions(Request $request): JsonResponse
    {
        $transactions = $request->user()
            ->transactions()
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json($transactions);
    }

    public function paystackConfig(): JsonResponse
    {
        return response()->json([
            'public_key' => $this->paystackService->getPublicKey(),
        ]);
    }
}