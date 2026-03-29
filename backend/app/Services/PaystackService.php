<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Illuminate\Http\Client\Response;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\RequestException;
use Carbon\Carbon;

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
     * Convert amount to MongoDB compatible format
     */
    private function formatAmountForMongoDB(float|int $amount): array
    {
        return [
            'value' => $amount,
            'currency' => 'NGN', // or get from config
            'in_kobo' => $amount * 100,
        ];
    }

    /**
     * Convert date to MongoDB compatible format (Carbon instance)
     * This will be automatically converted to MongoDB Date by the package
     */
    private function toMongoDateTime(?string $dateString): ?Carbon
    {
        if (!$dateString) {
            return null;
        }
        
        try {
            return Carbon::parse($dateString);
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Prepare data for MongoDB storage
     * Uses Carbon dates which will be automatically converted by jenssegers/mongodb
     */
    public function prepareForMongoDB(array $data): array
    {
        // Convert standard dates to Carbon instances (MongoDB will handle conversion)
        $dateFields = ['created_at', 'updated_at', 'paid_at', 'expires_at', 'transaction_date'];
        foreach ($dateFields as $field) {
            if (isset($data[$field]) && is_string($data[$field])) {
                $data[$field] = $this->toMongoDateTime($data[$field]);
            }
        }
        
        // Handle nested objects
        if (isset($data['metadata']) && is_array($data['metadata'])) {
            $data['metadata'] = $this->prepareForMongoDB($data['metadata']);
        }
        
        if (isset($data['customer']) && is_array($data['customer'])) {
            $data['customer'] = $this->prepareForMongoDB($data['customer']);
        }
        
        if (isset($data['authorization']) && is_array($data['authorization'])) {
            $data['authorization'] = $this->prepareForMongoDB($data['authorization']);
        }
        
        // Convert amount to structured format
        if (isset($data['amount']) && is_numeric($data['amount'])) {
            $amount = $data['amount'];
            $data['amount'] = $this->formatAmountForMongoDB($amount);
            // Keep original for backward compatibility
            $data['amount_raw'] = $amount;
        }
        
        return $data;
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
            'metadata'     => $this->prepareMetadataForPaystack($data['metadata'] ?? []),
            'channels'     => $data['channels'] ?? [
                'card',
                'bank',
                'ussd',
                'qr',
                'mobile_money',
                'bank_transfer'
            ],
        ]);

        $responseData = $this->handleResponse($response);
        
        // Add MongoDB compatible timestamps
        $responseData['created_at'] = Carbon::now();
        $responseData['reference'] = $reference;
        
        return $responseData;
    }

    /**
     * Verify a payment transaction
     */
    public function verifyTransaction(string $reference): array
    {
        /** @var Response $response */
        $response = $this->client()
            ->get("/transaction/verify/{$reference}");

        $data = $this->handleResponse($response);
        
        // Prepare data for MongoDB storage
        if (!empty($data)) {
            $data = $this->prepareForMongoDB($data);
        }
        
        return $data;
    }

    /**
     * Get a single transaction
     */
    public function getTransaction(string $reference): array
    {
        /** @var Response $response */
        $response = $this->client()
            ->get("/transaction/{$reference}");

        $data = $this->handleResponse($response);
        
        // Prepare data for MongoDB storage
        if (!empty($data)) {
            $data = $this->prepareForMongoDB($data);
        }
        
        return $data;
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

        $data = $this->handleResponse($response);
        
        // Prepare each transaction for MongoDB storage
        if (isset($data['data']) && is_array($data['data'])) {
            $data['data'] = array_map(
                [$this, 'prepareForMongoDB'],
                $data['data']
            );
        }
        
        return $data;
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

        $planData = $this->handleResponse($response);
        
        // Add MongoDB compatible structure
        if (!empty($planData)) {
            $planData = $this->prepareForMongoDB($planData);
            $planData['plan_code'] = $planData['plan_code'] ?? $planData['code'] ?? null;
            $planData['created_at'] = Carbon::now();
        }
        
        return $planData;
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

        $subscriptionData = $this->handleResponse($response);
        
        // Prepare for MongoDB storage
        if (!empty($subscriptionData)) {
            $subscriptionData = $this->prepareForMongoDB($subscriptionData);
            $subscriptionData['customer_code'] = $data['customer_code'];
            $subscriptionData['plan_code'] = $data['plan_code'];
            $subscriptionData['authorization_code'] = $data['authorization_code'];
            $subscriptionData['created_at'] = Carbon::now();
            $subscriptionData['status'] = 'active';
        }
        
        return $subscriptionData;
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

        $data = $this->handleResponse($response);
        
        // Add MongoDB compatible data
        if (!empty($data)) {
            $data['disabled_at'] = Carbon::now();
            $data['subscription_code'] = $code;
            $data['status'] = 'cancelled';
        }
        
        return $data;
    }

    /**
     * Get subscription details
     */
    public function getSubscription(string $code): array
    {
        /** @var Response $response */
        $response = $this->client()->get("/subscription/{$code}");
        
        $data = $this->handleResponse($response);
        
        // Prepare for MongoDB storage
        if (!empty($data)) {
            $data = $this->prepareForMongoDB($data);
        }
        
        return $data;
    }

    /**
     * List subscriptions
     */
    public function listSubscriptions(
        int $perPage = 50,
        int $page = 1,
        ?string $customer = null
    ): array {
        $params = [
            'perPage' => $perPage,
            'page'    => $page,
        ];
        
        if ($customer) {
            $params['customer'] = $customer;
        }
        
        /** @var Response $response */
        $response = $this->client()->get('/subscription', $params);
        
        $data = $this->handleResponse($response);
        
        // Prepare each subscription for MongoDB storage
        if (isset($data['data']) && is_array($data['data'])) {
            $data['data'] = array_map(
                [$this, 'prepareForMongoDB'],
                $data['data']
            );
        }
        
        return $data;
    }

    /**
     * ---------------------------------------------------------
     * Customers
     * ---------------------------------------------------------
     */

    /**
     * Create customer
     */
    public function createCustomer(array $data): array
    {
        /** @var Response $response */
        $response = $this->client()->post('/customer', [
            'email' => $data['email'],
            'first_name' => $data['first_name'] ?? null,
            'last_name' => $data['last_name'] ?? null,
            'phone' => $data['phone'] ?? null,
            'metadata' => $this->prepareMetadataForPaystack($data['metadata'] ?? []),
        ]);

        $customerData = $this->handleResponse($response);
        
        // Prepare for MongoDB storage
        if (!empty($customerData)) {
            $customerData = $this->prepareForMongoDB($customerData);
            $customerData['created_at'] = Carbon::now();
        }
        
        return $customerData;
    }

    /**
     * Get customer
     */
    public function getCustomer(string $code): array
    {
        /** @var Response $response */
        $response = $this->client()->get("/customer/{$code}");
        
        $data = $this->handleResponse($response);
        
        // Prepare for MongoDB storage
        if (!empty($data)) {
            $data = $this->prepareForMongoDB($data);
        }
        
        return $data;
    }

    /**
     * List customers
     */
    public function listCustomers(int $perPage = 50, int $page = 1): array
    {
        /** @var Response $response */
        $response = $this->client()->get('/customer', [
            'perPage' => $perPage,
            'page'    => $page,
        ]);
        
        $data = $this->handleResponse($response);
        
        // Prepare each customer for MongoDB storage
        if (isset($data['data']) && is_array($data['data'])) {
            $data['data'] = array_map(
                [$this, 'prepareForMongoDB'],
                $data['data']
            );
        }
        
        return $data;
    }

    /**
     * ---------------------------------------------------------
     * Utilities
     * ---------------------------------------------------------
     */

    /**
     * Generate unique payment reference with MongoDB compatibility
     */
    public function generateReference(): string
    {
        return 'PAY_' .
            strtoupper(Str::random(10)) .
            '_' .
            Carbon::now()->timestamp;
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

    /**
     * Prepare metadata for Paystack API (removes MongoDB specific types)
     */
    private function prepareMetadataForPaystack(array $metadata): array
    {
        $cleanMetadata = [];
        
        foreach ($metadata as $key => $value) {
            if ($value instanceof Carbon) {
                $cleanMetadata[$key] = $value->format('Y-m-d H:i:s');
            } elseif (is_array($value)) {
                $cleanMetadata[$key] = $this->prepareMetadataForPaystack($value);
            } else {
                $cleanMetadata[$key] = $value;
            }
        }
        
        return $cleanMetadata;
    }

    /**
     * Convert Carbon date to formatted string for API responses
     */
    public function formatDateForResponse($date): ?string
    {
        if ($date instanceof Carbon) {
            return $date->format('Y-m-d H:i:s');
        }
        
        if (is_string($date)) {
            return $date;
        }
        
        return null;
    }

    /**
     * Get formatted transaction amount for display
     */
    public function formatAmountForDisplay(array $amountData): string
    {
        $value = $amountData['value'] ?? $amountData['amount_raw'] ?? 0;
        $currency = $amountData['currency'] ?? 'NGN';
        
        return number_format($value, 2) . ' ' . $currency;
    }

    /**
     * Get transaction amount in kobo (for Paystack API)
     */
    public function toKobo(float $amount): int
    {
        return (int) ($amount * 100);
    }

    /**
     * Convert kobo to naira
     */
    public function fromKobo(int $kobo): float
    {
        return $kobo / 100;
    }
}