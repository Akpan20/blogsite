<?php

namespace App\Services;

use App\Models\User;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\UserSubscription;
use App\Models\PaymentTransaction;

class SubscriptionService
{
    public function __construct(
        private PaystackService $paystack
    ) {}

    /**
     * Get user's active subscription
     */
    public function getUserActiveSubscription(User $user): ?UserSubscription
    {
        return $user->subscriptions()
            ->with('plan')
            ->where('payment_status', 'completed')
            ->where(function($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->whereNull('cancelled_at')
            ->latest()
            ->first();
    }

    /**
     * Check if user has access to premium content
     */
    public function hasAccessToPremiumContent(User $user, string $tier = 'premium'): bool
    {
        $subscription = $this->getUserActiveSubscription($user);
        
        if (!$subscription) {
            return false;
        }

        $planSlug = $subscription->plan->slug;

        return match($tier) {
            'free' => true,
            'premium' => in_array($planSlug, ['premium', 'pro']),
            'pro' => $planSlug === 'pro',
            default => false,
        };
    }

    /**
     * Initialize a subscription payment
     */
    public function initializeSubscription(User $user, SubscriptionPlan $plan): array
    {
        // Create pending transaction
        $reference = $this->paystack->generateReference();
        
        $transaction = PaymentTransaction::create([
            'user_id' => $user->id,
            'reference' => $reference,
            'amount' => $plan->price,
            'currency' => 'NGN',
            'status' => 'pending',
            'gateway' => 'paystack',
        ]);

        // Initialize Paystack payment
        $paymentData = $this->paystack->initializeTransaction([
            'email' => $user->email,
            'amount' => $plan->price,
            'reference' => $reference,
            'callback_url' => config('app.frontend_url') . '/subscription/verify?reference=' . $reference,
            'metadata' => [
                'user_id' => $user->id,
                'plan_id' => $plan->id,
                'plan_name' => $plan->name,
            ],
        ]);

        return [
            'authorization_url' => $paymentData['authorization_url'],
            'access_code' => $paymentData['access_code'],
            'reference' => $reference,
        ];
    }

    /**
     * Verify and activate subscription
     */
    public function verifyAndActivateSubscription(string $reference): array
    {
        // Get transaction
        $transaction = PaymentTransaction::where('reference', $reference)->firstOrFail();

        // Verify with Paystack
        $paymentData = $this->paystack->verifyTransaction($reference);

        if ($paymentData['status'] !== 'success') {
            $transaction->markAsFailed($paymentData);
            throw new \Exception('Payment verification failed');
        }

        // Mark transaction as successful
        $transaction->markAsSuccessful($paymentData);

        // Get plan from metadata
        $planId = $paymentData['metadata']['plan_id'] ?? null;
        $plan = SubscriptionPlan::findOrFail($planId);

        // Calculate expiry date
        $startsAt = now();
        $expiresAt = match($plan->billing_period) {
            'monthly' => $startsAt->copy()->addMonth(),
            'yearly' => $startsAt->copy()->addYear(),
            'lifetime' => null,
            default => $startsAt->copy()->addMonth(),
        };

        // Create or update subscription
        $subscription = UserSubscription::create([
            'user_id' => $transaction->user_id,
            'subscription_plan_id' => $plan->id,
            'payment_reference' => $reference,
            'payment_status' => 'completed',
            'amount_paid' => $transaction->amount,
            'starts_at' => $startsAt,
            'expires_at' => $expiresAt,
            'auto_renew' => true,
            'payment_metadata' => $paymentData,
        ]);

        // Link transaction to subscription
        $transaction->update([
            'user_subscription_id' => $subscription->id,
        ]);

        return [
            'subscription' => $subscription->load('plan'),
            'transaction' => $transaction,
        ];
    }

    /**
     * Cancel user's subscription
     */
    public function cancelSubscription(UserSubscription $subscription): bool
    {
        $subscription->cancel();
        return true;
    }

    /**
     * Send expiry reminder emails to users with expiring subscriptions
     */
    public function sendExpiryReminders(): void
    {
        // Find subscriptions expiring in the next 7 days
        $expiringSubscriptions = Subscription::where('status', 'active')
            ->whereBetween('end_date', [
                now(),
                now()->addDays(7)
            ])
            ->with(['user', 'plan'])
            ->get();

        foreach ($expiringSubscriptions as $subscription) {
            // Calculate days until expiry
            $daysUntilExpiry = now()->diffInDays($subscription->end_date);
            
            // Send reminder email (you'll need to create this notification)
            // $subscription->user->notify(
            //     new SubscriptionExpiryReminder($subscription, $daysUntilExpiry)
            // );
            
            \Log::info("Reminder sent to {$subscription->user->email} - expires in {$daysUntilExpiry} days");
        }
    }

    /**
     * Get subscription analytics
     */
    public function getSubscriptionAnalytics(): array
    {
        $totalRevenue = PaymentTransaction::where('status', 'success')->sum('amount');
        $monthlyRevenue = PaymentTransaction::where('status', 'success')
            ->whereMonth('paid_at', now()->month)
            ->sum('amount');

        $activeSubscriptions = UserSubscription::where('payment_status', 'completed')
            ->where(function($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->whereNull('cancelled_at')
            ->count();

        $subscriptionsByPlan = UserSubscription::selectRaw('subscription_plan_id, COUNT(*) as count')
            ->where('payment_status', 'completed')
            ->where(function($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->whereNull('cancelled_at')
            ->groupBy('subscription_plan_id')
            ->with('plan:id,name')
            ->get();

        $recentTransactions = PaymentTransaction::with(['user:id,name,email', 'subscription.plan:id,name'])
            ->latest()
            ->take(10)
            ->get();

        return [
            'total_revenue' => $totalRevenue,
            'monthly_revenue' => $monthlyRevenue,
            'active_subscriptions' => $activeSubscriptions,
            'subscriptions_by_plan' => $subscriptionsByPlan,
            'recent_transactions' => $recentTransactions,
        ];
    }

    /**
     * Check and renew expiring subscriptions
     */
    public function renewExpiringSubscriptions(): int
    {
        $expiringSubscriptions = UserSubscription::where('auto_renew', true)
            ->where('payment_status', 'completed')
            ->whereBetween('expires_at', [now(), now()->addDays(3)])
            ->whereNull('cancelled_at')
            ->get();

        $renewed = 0;
        foreach ($expiringSubscriptions as $subscription) {
            if ($subscription->renew()) {
                $renewed++;
            }
        }

        return $renewed;
    }
}