<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Illuminate\Http\Client\Response;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\RequestException;

class PaystackService
{
    private string $secretKey;
    private string $publicKey;
    private string $baseUrl;

    public function __construct()
    {
        $this->secretKey = config('services.paystack.secret_key');
        $this->publicKey = config('services.paystack.public_key');
        $this->baseUrl   = 'https://api.paystack.co';
    }

    /**
     * ---------------------------------------------------------
     * Core HTTP Client
     * Centralizes all API communication
     * ---------------------------------------------------------
     */

    private function client(): PendingRequest
    {
        return Http::withToken($this->secretKey)
            ->acceptJson()
            ->baseUrl($this->baseUrl)
            ->timeout(30)
            ->retry(3, 200);
    }

    /**
     * Handle API response uniformly
     */
    private function handleResponse(Response $response): array
    {
        try {
            $response->throw();
        } catch (RequestException $e) {
            $message = $response->json('message')
                ?? $e->getMessage()
                ?? 'Paystack API request failed';

            throw new \Exception($message, $response->status());
        }

        return $response->json('data') ?? [];
    }

    /**
     * ---------------------------------------------------------
     * Transactions
     * ---------------------------------------------------------
     */

    /**
     * Initialize a payment transaction
     */
    public function initializeTransaction(array $data): array
    {
        $reference = $data['reference'] ?? $this->generateReference();

        /** @var Response $response */
        $response = $this->client()->post('/transaction/initialize', [
            'email'        => $data['email'],
            'amount'       => $data['amount'] * 100, // Convert to kobo
            'reference'    => $reference,
            'callback_url' => $data['callback_url'] 
                ?? config('app.url') . '/api/payment/callback',
            'metadata'     => $data['metadata'] ?? [],
            'channels'     => $data['channels'] ?? [
                'card',
                'bank',
                'ussd',
                'qr',
                'mobile_money',
                'bank_transfer'
            ],
        ]);

        return $this->handleResponse($response);
    }

    /**
     * Verify a payment transaction
     */
    public function verifyTransaction(string $reference): array
    {
        /** @var Response $response */
        $response = $this->client()
            ->get("/transaction/verify/{$reference}");

        return $this->handleResponse($response);
    }

    /**
     * Get a single transaction
     */
    public function getTransaction(string $reference): array
    {
        /** @var Response $response */
        $response = $this->client()
            ->get("/transaction/{$reference}");

        return $this->handleResponse($response);
    }

    /**
     * List transactions
     */
    public function listTransactions(
        int $perPage = 50,
        int $page = 1
    ): array {
        /** @var Response $response */
        $response = $this->client()->get('/transaction', [
            'perPage' => $perPage,
            'page'    => $page,
        ]);

        return $this->handleResponse($response);
    }

    /**
     * ---------------------------------------------------------
     * Plans & Subscriptions
     * ---------------------------------------------------------
     */

    /**
     * Create subscription plan
     */
    public function createPlan(array $data): array
    {
        /** @var Response $response */
        $response = $this->client()->post('/plan', [
            'name'        => $data['name'],
            'interval'    => $data['interval'], // daily, weekly, monthly, yearly
            'amount'      => $data['amount'] * 100,
            'description' => $data['description'] ?? null,
        ]);

        return $this->handleResponse($response);
    }

    /**
     * Create subscription
     */
    public function createSubscription(array $data): array
    {
        /** @var Response $response */
        $response = $this->client()->post('/subscription', [
            'customer'      => $data['customer_code'],
            'plan'          => $data['plan_code'],
            'authorization' => $data['authorization_code'],
        ]);

        return $this->handleResponse($response);
    }

    /**
     * Disable subscription
     */
    public function disableSubscription(
        string $code,
        string $token
    ): array {
        /** @var Response $response */
        $response = $this->client()->post(
            '/subscription/disable',
            [
                'code'  => $code,
                'token' => $token,
            ]
        );

        return $this->handleResponse($response);
    }

    /**
     * ---------------------------------------------------------
     * Utilities
     * ---------------------------------------------------------
     */

    /**
     * Generate unique payment reference
     */
    public function generateReference(): string
    {
        return 'PAY_' .
            strtoupper(Str::random(10)) .
            '_' .
            time();
    }

    /**
     * Get public key (frontend use)
     */
    public function getPublicKey(): string
    {
        return $this->publicKey;
    }

    /**
     * Validate Paystack webhook signature
     */
    public function validateWebhook(
        string $payload,
        string $signature
    ): bool {
        $computed = hash_hmac(
            'sha512',
            $payload,
            $this->secretKey
        );

        return hash_equals($computed, $signature);
    }
}