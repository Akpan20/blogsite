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
    public function handle(Request $request)
    {
        $secret    = config('services.paystack.secret_key');
        $payload   = $request->getContent();
        $computed  = hash_hmac('sha512', $payload, $secret);
        $signature = $request->header('x-paystack-signature');

        if (!$signature || $computed !== $signature) {
            Log::warning('Paystack webhook: Signature verification failed');
            return response()->json(['message' => 'Invalid signature'], 401);
        }

        $eventData = $request->json()->all();

        if (!isset($eventData['event'], $eventData['data'])) {
            return response()->json(['status' => 'ok']);
        }

        match ($eventData['event']) {
            'charge.success'          => $this->handleChargeSuccess($eventData['data']),
            'subscription.create'     => $this->handleSubscriptionCreate($eventData['data']),
            'subscription.disable'    => $this->handleSubscriptionDisable($eventData['data']),
            'invoice.update'          => $this->handleInvoiceUpdate($eventData['data']),
            'invoice.payment_failed'  => $this->handleInvoicePaymentFailed($eventData['data']),
            default => Log::notice('Paystack webhook: Unhandled event', ['event' => $eventData['event']]),
        };

        return response()->json(['status' => 'ok']);
    }

    protected function handleChargeSuccess(array $data): void
    {
        $subscriptionCode = data_get($data, 'subscription.subscription_code');
        $reference        = data_get($data, 'reference');
        $email            = data_get($data, 'customer.email');
        $amountNgn        = data_get($data, 'amount', 0) / 100;

        $user = User::where('email', $email)->first();
        if (!$user) {
            Log::error('User not found for payment', ['email' => $email, 'ref' => $reference]);
            return;
        }

        // updateOrCreate is MongoDB safe when used with simple fields
        Payment::where('reference', $reference)->first()
            ? Payment::where('reference', $reference)->update([
                'status'  => 'success',
                'paid_at' => now(),
            ])
            : Payment::create([
                'user_id'   => (string) $user->id,
                'reference' => $reference,
                'amount'    => $amountNgn,
                'currency'  => data_get($data, 'currency', 'NGN'),
                'status'    => 'success',
                'paid_at'   => now(),
            ]);

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
    }

    protected function handleSubscriptionCreate(array $data): void
    {
        $subscriptionCode = data_get($data, 'subscription_code');
        $email            = data_get($data, 'customer.email');
        $planCode         = data_get($data, 'plan.plan_code');

        $user = User::where('email', $email)->first();

        if ($user && $subscriptionCode) {
            $existing = Subscription::where('paystack_subscription_code', $subscriptionCode)->first();

            if ($existing) {
                $existing->update(['status' => 'active', 'starts_at' => now()]);
            } else {
                Subscription::create([
                    'paystack_subscription_code' => $subscriptionCode,
                    'user_id'    => (string) $user->id,
                    'plan'       => $this->mapPlanCodeToInternal($planCode),
                    'status'     => 'active',
                    'starts_at'  => now(),
                ]);
            }
        }
    }

    protected function handleSubscriptionDisable(array $data): void
    {
        $code = data_get($data, 'subscription_code');
        if ($code) {
            Subscription::where('paystack_subscription_code', $code)
                ->update(['status' => 'cancelled']);
        }
    }

    protected function handleInvoiceUpdate(array $data): void
    {
        if (data_get($data, 'subscription.subscription_code')) {
            $this->handleChargeSuccess($data);
        }
    }

    protected function handleInvoicePaymentFailed(array $data): void
    {
        Log::warning('Paystack recurring payment failed', [
            'subscription_code' => data_get($data, 'subscription.subscription_code'),
            'reference'         => data_get($data, 'reference'),
        ]);
    }

    protected function mapPlanCodeToInternal(string $planCode): string
    {
        return match ($planCode) {
            'PLN_BASIC_CODE' => 'basic',
            'PLN_PRO_CODE'   => 'pro',
            default          => 'unknown',
        };
    }
}