<?php

namespace App\Models;

use Laravel\Sanctum\PersonalAccessToken as SanctumPersonalAccessToken;
use MongoDB\Laravel\Eloquent\DocumentModel;

class PersonalAccessToken extends SanctumPersonalAccessToken
{
    use DocumentModel;

    protected $connection = 'mongodb';
    protected $table      = 'personal_access_tokens';

    protected $primaryKey = '_id';
    protected $keyType    = 'string';
    public $incrementing  = false;

    protected $fillable = [
        'tokenable_type', 'tokenable_id', 'name', 'token',
        'abilities', 'last_used_at', 'expires_at'
    ];

    protected $casts = [
        'abilities'     => 'array',
        'last_used_at'  => 'datetime',
        'expires_at'    => 'datetime',
    ];
}