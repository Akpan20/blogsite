<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaystackWebhookController extends Controller
{
    /**
     * Handle incoming Paystack webhook events.
     *
     * @param  Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function handle(Request $request)
    {
        $secret = config('services.paystack.secret_key');

        // Verify signature using raw payload (required for HMAC)
        $payload = $request->getContent();
        $computedHash = hash_hmac('sha512', $payload, $secret);
        $paystackSignature = $request->header('x-paystack-signature');

        if (! $paystackSignature || $computedHash !== $paystackSignature) {
            Log::warning('Paystack webhook: Signature verification failed', [
                'computed' => $computedHash,
                'received' => $paystackSignature,
                'ip'       => $request->ip(),
            ]);

            return response()->json(['message' => 'Invalid signature'], 401);
        }

        // Parse JSON payload
        $eventData = $request->json()->all();

        if (! isset($eventData['event']) || ! isset($eventData['data'])) {
            Log::error('Paystack webhook: Malformed payload', ['payload' => $eventData]);
            return response()->json(['status' => 'ok']);
        }

        $event = $eventData['event'];
        $data  = $eventData['data'];

        Log::info('Paystack webhook received', [
            'event' => $event,
            'reference' => data_get($data, 'reference'),
        ]);

        // Process known events
        match ($event) {
            'charge.success' => $this->handleChargeSuccess($data),
            'subscription.create' => $this->handleSubscriptionCreate($data),
            'subscription.disable' => $this->handleSubscriptionDisable($data),
            'invoice.update' => $this->handleInvoiceUpdate($data),
            'invoice.payment_failed' => $this->handleInvoicePaymentFailed($data),
            default => Log::notice('Paystack webhook: Unhandled event', ['event' => $event]),
        };

        // Always acknowledge with 200 to prevent Paystack retries
        return response()->json(['status' => 'ok']);
    }

    /**
     * Handle successful charge (one-time or subscription initial/renewal)
     */
    protected function handleChargeSuccess(array $data): void
    {
        $subscriptionCode = data_get($data, 'subscription.subscription_code');
        $reference = data_get($data, 'reference');
        $amountKobo = data_get($data, 'amount', 0);
        $email = data_get($data, 'customer.email');
        $amountNgn = $amountKobo / 100;

        $user = User::where('email', $email)->first();
        if (!$user) {
            Log::error('User not found for payment', ['email' => $email, 'ref' => $reference]);
            return;
        }

        // 1. ALWAYS record the payment for Earnings tracking
        $payment = Payment::updateOrCreate(
            ['reference' => $reference], 
            [
                'user_id'   => $user->id,
                'amount'    => $amountNgn,
                'currency'  => data_get($data, 'currency', 'NGN'),
                'status'    => 'success',
                'paid_at'   => now(),
                // Link to subscription if it exists
                'subscription_id' => Subscription::where('paystack_subscription_code', $subscriptionCode)->value('id'),
            ]
        );

        // 2. Update Subscription status if applicable
        if ($subscriptionCode) {
            $subscription = Subscription::where('paystack_subscription_code', $subscriptionCode)->first();
            if ($subscription) {
                $intervalDays = $subscription->plan === 'pro' ? 365 : 30;
                $subscription->update([
                    'status'  => 'active',
                    'ends_at' => now()->addDays($intervalDays),
                ]);
            }
        }

        Log::info('Payment & Subscription processed', ['ref' => $reference, 'user' => $user->id]);
    }

    /**
     * Handle initial subscription creation event
     */
    protected function handleSubscriptionCreate(array $data): void
    {
        $subscriptionCode = data_get($data, 'subscription_code');
        $email = data_get($data, 'customer.email');
        $planCode = data_get($data, 'plan.plan_code');

        $user = User::where('email', $email)->first();

        if ($user && $subscriptionCode) {
            // Optional: Update or create subscription record if not already done in initialize
            Subscription::updateOrCreate(
                ['paystack_subscription_code' => $subscriptionCode],
                [
                    'user_id' => $user->id,
                    'plan'    => $this->mapPlanCodeToInternal($planCode),
                    'status'  => 'active',
                    'starts_at' => now(),
                    // ends_at will be updated on first charge.success
                ]
            );

            Log::info('Subscription created via webhook', [
                'subscription_code' => $subscriptionCode,
                'user_id'           => $user->id,
            ]);
        }
    }

    /**
     * Handle subscription disable/cancellation
     */
    protected function handleSubscriptionDisable(array $data): void
    {
        $subscriptionCode = data_get($data, 'subscription_code');

        if ($subscriptionCode) {
            $updated = Subscription::where('paystack_subscription_code', $subscriptionCode)
                ->update(['status' => 'cancelled']);

            if ($updated) {
                Log::info('Subscription cancelled via webhook', ['subscription_code' => $subscriptionCode]);
            }
        }
    }

    /**
     * Handle recurring invoice updates (sometimes used for renewals)
     */
    protected function handleInvoiceUpdate(array $data): void
    {
        if ($subscriptionCode = data_get($data, 'subscription.subscription_code')) {
            // Reuse charge success logic for renewals
            $this->handleChargeSuccess($data);
        }
    }

    /**
     * Log failed recurring payments
     */
    protected function handleInvoicePaymentFailed(array $data): void
    {
        Log::warning('Paystack recurring payment failed', [
            'subscription_code' => data_get($data, 'subscription.subscription_code'),
            'reference'         => data_get($data, 'reference'),
            'reason'            => data_get($data, 'reason') ?? 'Unknown',
        ]);

        // Optional: notify user or admin
    }

    /**
     * Map Paystack plan code to internal plan name (customize as needed)
     */
    protected function mapPlanCodeToInternal(string $planCode): string
    {
        return match ($planCode) {
            'PLN_BASIC_CODE' => 'basic',
            'PLN_PRO_CODE'   => 'pro',
            default          => 'unknown',
        };
    }
}