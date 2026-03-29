<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;           // Change base class
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property string $_id
 * @property string $user_id
 * @property string $plan
 * @property string|null $paystack_subscription_code
 * @property string|null $paystack_authorization_code
 * @property string $reference
 * @property float $amount
 * @property string|null $starts_at
 * @property string|null $ends_at
 * @property string $status
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\User $user
 */
class Subscription extends Model
{
    // Optional: specify the MongoDB collection name (defaults to 'subscriptions')
    // protected $collection = 'subscriptions';

    protected $fillable = [
        'user_id',
        'plan',
        'paystack_subscription_code',
        'paystack_authorization_code',
        'paystack_email_token',       // added if you need it
        'reference',
        'amount',
        'starts_at',
        'ends_at',
        'status',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'amount'    => 'float',
        'starts_at' => 'datetime',
        'ends_at'   => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user that owns the subscription.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Determine if the subscription is currently active.
     */
    public function isActive(): bool
    {
        return $this->status === 'active'
            && $this->ends_at?->isFuture();
    }
}