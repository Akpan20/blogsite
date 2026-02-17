<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $user_id
 * @property string $plan
 * @property string|null $paystack_subscription_code
 * @property string|null $paystack_authorization_code
 * @property string $reference
 * @property numeric $amount
 * @property string|null $starts_at
 * @property string|null $ends_at
 * @property string $status
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Subscription newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Subscription newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Subscription query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Subscription whereAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Subscription whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Subscription whereEndsAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Subscription whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Subscription wherePaystackAuthorizationCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Subscription wherePaystackSubscriptionCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Subscription wherePlan($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Subscription whereReference($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Subscription whereStartsAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Subscription whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Subscription whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Subscription whereUserId($value)
 * @mixin \Eloquent
 */
class Subscription extends Model
{
    protected $fillable = [
        'user_id',
        'plan',
        'paystack_subscription_code',
        'paystack_email_token',
        'reference',
        'amount',
        'starts_at',
        'ends_at',
        'status',
    ];

    protected $dates = [
        'starts_at',
        'ends_at',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function isActive(): bool
    {
        return $this->status === 'active'
            && $this->ends_at?->isFuture();
    }
}
