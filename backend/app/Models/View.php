<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;                     // <-- Change base class

class View extends Model
{
    // Optional: collection name (defaults to 'views')
    // protected $collection = 'views';

    // If you want to store only specific fields, you can add them to $fillable
    protected $fillable = [
        'post_id',
        'ip_address',
        'user_agent',
    ];
}