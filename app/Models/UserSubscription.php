<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

/**
 * @property-read \App\Models\SubscriptionPlan|null $plan
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\PaymentTransaction> $transactions
 * @property-read int|null $transactions_count
 * @property-read \App\Models\User|null $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserSubscription newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserSubscription newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserSubscription query()
 * @mixin \Eloquent
 */
class UserSubscription extends Model
{
    use HasFactory;

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
        'amount_paid' => 'decimal:2',
        'starts_at' => 'datetime',
        'expires_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'auto_renew' => 'boolean',
        'payment_metadata' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function plan()
    {
        return $this->belongsTo(SubscriptionPlan::class, 'subscription_plan_id');
    }

    public function transactions()
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
            'yearly' => $this->expires_at->addYear(),
            default => null,
        };

        $this->update([
            'expires_at' => $newExpiryDate,
        ]);

        return true;
    }
}