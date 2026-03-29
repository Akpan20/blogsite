<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use MongoDB\Laravel\Eloquent\Model;                     // <-- Change base class
use MongoDB\Laravel\Relations\BelongsTo;                // <-- Use MongoDB relationships
use MongoDB\Laravel\Relations\HasMany;
use Carbon\Carbon;

class UserSubscription extends Model
{
    use HasFactory;

    // Optional: set collection name (defaults to 'user_subscriptions')
    // protected $collection = 'user_subscriptions';

    protected $fillable = [
        'user_id',
        'subscription_plan_id',
        'payment_reference',
        'payment_status',
        'amount_paid',
        'starts_at',
        'expires_at',
        'cancelled_at',
        'auto_renew',
        'payment_metadata',
    ];

    protected $casts = [
        'amount_paid' => 'float',                        // Use float for monetary values
        'starts_at'   => 'datetime',
        'expires_at'  => 'datetime',
        'cancelled_at'=> 'datetime',
        'auto_renew'  => 'boolean',
        'payment_metadata' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(SubscriptionPlan::class, 'subscription_plan_id');
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(PaymentTransaction::class);
    }

    public function isActive(): bool
    {
        return $this->payment_status === 'completed' 
            && ($this->expires_at === null || $this->expires_at->isFuture())
            && $this->cancelled_at === null;
    }

    public function isExpired(): bool
    {
        return $this->expires_at !== null && $this->expires_at->isPast();
    }

    public function isCancelled(): bool
    {
        return $this->cancelled_at !== null;
    }

    public function daysRemaining(): int
    {
        if ($this->expires_at === null) {
            return -1; // Lifetime
        }
        
        return max(0, Carbon::now()->diffInDays($this->expires_at, false));
    }

    public function cancel()
    {
        $this->update([
            'cancelled_at' => now(),
            'auto_renew' => false,
        ]);
    }

    public function renew()
    {
        if (!$this->auto_renew) {
            return false;
        }

        $newExpiryDate = match($this->plan->billing_period) {
            'monthly' => $this->expires_at->addMonth(),
            'yearly'  => $this->expires_at->addYear(),
            default   => null,
        };

        $this->update([
            'expires_at' => $newExpiryDate,
        ]);

        return true;
    }
}