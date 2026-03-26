<?php
namespace App\Models\Sanctum;

use Laravel\Sanctum\PersonalAccessToken as SanctumPersonalAccessToken;

class PersonalAccessToken extends SanctumPersonalAccessToken
{
    // ✅ Force MongoDB connection
    protected $connection = 'mongodb';
    
    // ✅ MongoDB collection name (Sanctum expects this table)
    protected $table = 'personal_access_tokens';
    
    // ✅ MongoDB uses string _id, not auto-incrementing integer
    protected $keyType = 'string';
    public $incrementing = false;
    
    // ✅ Proper casting for MongoDB
    protected $casts = [
        'abilities' => 'array',
        'last_used_at' => 'datetime',
        'expires_at' => 'datetime',
    ];
    
    // ✅ Ensure MongoDB-compatible date handling
    protected function serializeDate(\DateTimeInterface $date): string
    {
        return $date->format('Y-m-d\TH:i:s\Z');
    }
}