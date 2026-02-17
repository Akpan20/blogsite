<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\UserSubscription> $activeSubscriptions
 * @property-read int|null $active_subscriptions_count
 * @property-read string $billing_cycle
 * @property-read string $formatted_price
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\UserSubscription> $subscriptions
 * @property-read int|null $subscriptions_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SubscriptionPlan newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SubscriptionPlan newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|SubscriptionPlan query()
 * @mixin \Eloquent
 */
class SubscriptionPlan extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'price',
        'billing_period',
        'features',
        'max_premium_posts',
        'is_active',
        'is_featured',
        'sort_order',
    ];

    protected $casts = [
        'features' => 'array',
        'price' => 'decimal:2',
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
    ];

    public function subscriptions()
    {
        return $this->hasMany(UserSubscription::class);
    }

    public function activeSubscriptions()
    {
        return $this->hasMany(UserSubscription::class)
            ->where('payment_status', 'completed')
            ->where('expires_at', '>', now())
            ->whereNull('cancelled_at');
    }

    public function isFree(): bool
    {
        return $this->price == 0;
    }

    public function getFormattedPriceAttribute(): string
    {
        return '₦' . number_format($this->price, 2);
    }

    public function getBillingCycleAttribute(): string
    {
        return match($this->billing_period) {
            'monthly' => 'per month',
            'yearly' => 'per year',
            'lifetime' => 'one-time',
            default => '',
        };
    }
}