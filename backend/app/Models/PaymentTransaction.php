<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;
use MongoDB\Laravel\Relations\BelongsTo;

class PaymentTransaction extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'payment_transactions';

    protected $fillable = [
        'user_id', 'user_subscription_id', 'reference', 'amount',
        'currency', 'status', 'payment_method', 'gateway',
        'gateway_response', 'paid_at',
    ];

    protected $casts = [
        'amount'           => 'decimal:2',
        'gateway_response' => 'array',
        'paid_at'          => 'datetime',
        'created_at'       => 'datetime',
        'updated_at'       => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(UserSubscription::class, 'user_subscription_id');
    }

    public function isSuccessful(): bool { return $this->status === 'success'; }
    public function isPending(): bool    { return $this->status === 'pending'; }
    public function isFailed(): bool     { return $this->status === 'failed'; }

    public function markAsSuccessful(array $gatewayResponse = []): void
    {
        $this->update([
            'status'           => 'success',
            'gateway_response' => $gatewayResponse,
            'paid_at'          => now(),
        ]);
    }

    public function markAsFailed(array $gatewayResponse = []): void
    {
        $this->update([
            'status'           => 'failed',
            'gateway_response' => $gatewayResponse,
        ]);
    }
}