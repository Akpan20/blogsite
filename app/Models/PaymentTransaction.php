<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property-read \App\Models\UserSubscription|null $subscription
 * @property-read \App\Models\User|null $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PaymentTransaction newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PaymentTransaction newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|PaymentTransaction query()
 * @mixin \Eloquent
 */
class PaymentTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'user_subscription_id',
        'reference',
        'amount',
        'currency',
        'status',
        'payment_method',
        'gateway',
        'gateway_response',
        'paid_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'gateway_response' => 'array',
        'paid_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function subscription()
    {
        return $this->belongsTo(UserSubscription::class, 'user_subscription_id');
    }

    public function isSuccessful(): bool
    {
        return $this->status === 'success';
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isFailed(): bool
    {
        return $this->status === 'failed';
    }

    public function markAsSuccessful(array $gatewayResponse = [])
    {
        $this->update([
            'status' => 'success',
            'gateway_response' => $gatewayResponse,
            'paid_at' => now(),
        ]);
    }

    public function markAsFailed(array $gatewayResponse = [])
    {
        $this->update([
            'status' => 'failed',
            'gateway_response' => $gatewayResponse,
        ]);
    }
}