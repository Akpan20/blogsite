<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

class Resource extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'resources';

    protected $fillable = [
        'title', 'excerpt', 'content',
        'category', 'icon', 'slug', 'is_published',
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'created_at'   => 'datetime',
        'updated_at'   => 'datetime',
    ];

    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }
}