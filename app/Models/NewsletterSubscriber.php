<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property string $email
 * @property string $token
 * @property bool $is_confirmed
 * @property \Illuminate\Support\Carbon|null $confirmed_at
 * @property string $status
 * @property string|null $ip_address
 * @property string|null $source
 * @property array<array-key, mixed>|null $preferences
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NewsletterSubscriber active()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NewsletterSubscriber newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NewsletterSubscriber newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NewsletterSubscriber query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NewsletterSubscriber unconfirmed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NewsletterSubscriber whereConfirmedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NewsletterSubscriber whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NewsletterSubscriber whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NewsletterSubscriber whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NewsletterSubscriber whereIpAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NewsletterSubscriber whereIsConfirmed($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NewsletterSubscriber wherePreferences($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NewsletterSubscriber whereSource($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NewsletterSubscriber whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NewsletterSubscriber whereToken($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|NewsletterSubscriber whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class NewsletterSubscriber extends Model
{
    use HasFactory;

    protected $fillable = [
        'email',
        'token',
        'is_confirmed',
        'confirmed_at',
        'status',
        'ip_address',
        'source',
        'preferences',
    ];

    protected $casts = [
        'is_confirmed' => 'boolean',
        'confirmed_at' => 'datetime',
        'preferences' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $hidden = [
        'token',
    ];

    /**
     * Generate unique confirmation token
     */
    public static function generateToken(): string
    {
        return Str::random(64);
    }

    /**
     * Confirm subscription
     */
    public function confirm(): void
    {
        $this->update([
            'is_confirmed' => true,
            'confirmed_at' => now(),
            'status' => 'active',
        ]);
    }

    /**
     * Unsubscribe
     */
    public function unsubscribe(): void
    {
        $this->update([
            'status' => 'unsubscribed',
        ]);
    }

    /**
     * Check if subscriber is active
     */
    public function isActive(): bool
    {
        return $this->status === 'active' && $this->is_confirmed;
    }

    /**
     * Scope for active subscribers
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active')
                     ->where('is_confirmed', true);
    }

    /**
     * Scope for unconfirmed subscribers
     */
    public function scopeUnconfirmed($query)
    {
        return $query->where('is_confirmed', false);
    }
}