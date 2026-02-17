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

    /**
     * Get all subscription plans
     */
    public function plans(): JsonResponse
    {
        $plans = SubscriptionPlan::where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('price')
            ->get();

        return response()->json($plans);
    }

    /**
     * Get user's current subscription
     */
    public function currentSubscription(Request $request): JsonResponse
    {
        $subscription = $this->subscriptionService->getUserActiveSubscription($request->user());

        return response()->json([
            'subscription' => $subscription,
            'has_active_subscription' => $subscription !== null,
        ]);
    }

    /**
     * Initialize subscription payment
     */
    public function subscribe(Request $request): JsonResponse
    {
        $request->validate([
            'plan_id' => 'required|exists:subscription_plans,id',
        ]);

        $plan = SubscriptionPlan::findOrFail($request->plan_id);

        // Check if user already has an active subscription
        $activeSubscription = $this->subscriptionService->getUserActiveSubscription($request->user());
        if ($activeSubscription) {
            return response()->json([
                'message' => 'You already have an active subscription',
            ], 400);
        }

        // Handle free plan
        if ($plan->isFree()) {
            return response()->json([
                'message' => 'Free plan does not require payment',
            ], 400);
        }

        try {
            $paymentData = $this->subscriptionService->initializeSubscription($request->user(), $plan);

            return response()->json([
                'message' => 'Payment initialized successfully',
                'data' => $paymentData,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to initialize payment',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Verify subscription payment
     */
    public function verifyPayment(Request $request): JsonResponse
    {
        $request->validate([
            'reference' => 'required|string',
        ]);

        try {
            $result = $this->subscriptionService->verifyAndActivateSubscription($request->reference);

            return response()->json([
                'message' => 'Subscription activated successfully',
                'subscription' => $result['subscription'],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Payment verification failed',
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Cancel subscription
     */
    public function cancel(Request $request): JsonResponse
    {
        $subscription = $this->subscriptionService->getUserActiveSubscription($request->user());

        if (!$subscription) {
            return response()->json([
                'message' => 'No active subscription found',
            ], 404);
        }

        $this->subscriptionService->cancelSubscription($subscription);

        return response()->json([
            'message' => 'Subscription cancelled successfully',
        ]);
    }

    /**
     * Get subscription history
     */
    public function history(Request $request): JsonResponse
    {
        $subscriptions = $request->user()
            ->subscriptions()
            ->with('plan')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json($subscriptions);
    }

    /**
     * Get payment transactions
     */
    public function transactions(Request $request): JsonResponse
    {
        $transactions = $request->user()
            ->transactions()
            ->with('subscription.plan')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json($transactions);
    }

    /**
     * Webhook handler for Paystack
     */
    public function webhook(Request $request): JsonResponse
    {
        // Validate webhook signature
        $signature = $request->header('x-paystack-signature');
        $payload = $request->getContent();

        if (!$this->paystackService->validateWebhook($payload, $signature)) {
            return response()->json(['message' => 'Invalid signature'], 400);
        }

        $event = $request->input('event');
        $data = $request->input('data');

        try {
            switch ($event) {
                case 'charge.success':
                    $this->handleSuccessfulCharge($data);
                    break;
                
                case 'subscription.create':
                    $this->handleSubscriptionCreated($data);
                    break;
                
                case 'subscription.disable':
                    $this->handleSubscriptionDisabled($data);
                    break;
            }

            return response()->json(['message' => 'Webhook processed']);
        } catch (\Exception $e) {
            \Log::error('Webhook processing failed: ' . $e->getMessage());
            return response()->json(['message' => 'Webhook processing failed'], 500);
        }
    }

    private function handleSuccessfulCharge(array $data): void
    {
        // Handle successful payment
        $reference = $data['reference'] ?? null;
        
        if ($reference) {
            try {
                $this->subscriptionService->verifyAndActivateSubscription($reference);
            } catch (\Exception $e) {
                \Log::error('Failed to activate subscription: ' . $e->getMessage());
            }
        }
    }

    private function handleSubscriptionCreated(array $data): void
    {
        // Handle new subscription creation
        \Log::info('Subscription created', $data);
    }

    private function handleSubscriptionDisabled(array $data): void
    {
        // Handle subscription cancellation
        \Log::info('Subscription disabled', $data);
    }

    /**
     * Get Paystack public key
     */
    public function paystackConfig(): JsonResponse
    {
        return response()->json([
            'public_key' => $this->paystackService->getPublicKey(),
        ]);
    }
}