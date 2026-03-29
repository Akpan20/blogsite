<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;
use Illuminate\Support\Str;

class NewsletterSubscriber extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'newsletter_subscribers';

    protected $fillable = [
        'email', 'token', 'is_confirmed', 'confirmed_at',
        'status', 'ip_address', 'source', 'preferences',
    ];

    protected $casts = [
        'is_confirmed' => 'boolean',
        'confirmed_at' => 'datetime',
        'preferences'  => 'array',
        'created_at'   => 'datetime',
        'updated_at'   => 'datetime',
    ];

    protected $hidden = ['token'];

    public static function generateToken(): string
    {
        return Str::random(64);
    }

    public function confirm(): void
    {
        $this->update([
            'is_confirmed' => true,
            'confirmed_at' => now(),
            'status'       => 'active',
        ]);
    }

    public function unsubscribe(): void
    {
        $this->update(['status' => 'unsubscribed']);
    }

    public function isActive(): bool
    {
        return $this->status === 'active' && $this->is_confirmed;
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active')->where('is_confirmed', true);
    }

    public function scopeUnconfirmed($query)
    {
        return $query->where('is_confirmed', false);
    }
}