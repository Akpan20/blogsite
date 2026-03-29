<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use MongoDB\Laravel\Eloquent\Model;               // <-- Change base class
use MongoDB\Laravel\Relations\HasMany;            // <-- Use MongoDB relationships

/**
 * @property string $_id
 * @property string $name
 * @property string $slug
 * @property string|null $description
 * @property float $price
 * @property string $billing_period
 * @property array $features
 * @property int $max_premium_posts
 * @property bool $is_active
 * @property bool $is_featured
 * @property int $sort_order
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\UserSubscription> $subscriptions
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\UserSubscription> $activeSubscriptions
 * @property-read string $formatted_price
 * @property-read string $billing_cycle
 */
class SubscriptionPlan extends Model
{
    use HasFactory;

    // Optional: specify collection name (defaults to 'subscription_plans')
    // protected $collection = 'subscription_plans';

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
        'features' => 'array',           // MongoDB stores arrays natively
        'price' => 'float',              // Use float for monetary values
        'is_active' => 'boolean',
        'is_featured' => 'boolean',
        'sort_order' => 'integer',
    ];

    /**
     * Get the user subscriptions for this plan.
     */
    public function subscriptions(): HasMany
    {
        return $this->hasMany(UserSubscription::class);
    }

    /**
     * Get the active subscriptions for this plan.
     */
    public function activeSubscriptions(): HasMany
    {
        return $this->hasMany(UserSubscription::class)
            ->where('payment_status', 'completed')
            ->where('expires_at', '>', now())
            ->whereNull('cancelled_at');
    }

    /**
     * Determine if this plan is free.
     */
    public function isFree(): bool
    {
        return $this->price == 0;
    }

    /**
     * Accessor for formatted price.
     */
    public function getFormattedPriceAttribute(): string
    {
        return '₦' . number_format((float) $this->price, 2);
    }

    /**
     * Accessor for billing cycle text.
     */
    public function getBillingCycleAttribute(): string
    {
        return match ($this->billing_period) {
            'monthly' => 'per month',
            'yearly'  => 'per year',
            'lifetime'=> 'one-time',
            default   => '',
        };
    }
}