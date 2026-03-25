<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;
use MongoDB\Laravel\Relations\BelongsTo;

class CommentReaction extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'comment_reactions';

    protected $fillable = [
        'user_id',
        'comment_id',
        'type',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public const TYPES = [
        'like', 'love', 'laugh', 'wow', 'sad', 'angry',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function comment(): BelongsTo
    {
        return $this->belongsTo(Comment::class);
    }
}