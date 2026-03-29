<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use MongoDB\Laravel\Relations\BelongsTo;
use MongoDB\Laravel\Relations\HasMany;
use Illuminate\Support\Facades\Auth;

class Comment extends Model
{
    use SoftDeletes;

    protected $connection = 'mongodb';
    protected $collection = 'comments';

    protected $fillable = [
        'user_id',
        'post_id',
        'parent_id',
        'content',
        'is_edited',
        'edited_at',
        'name',
        'email',
        'approved',
    ];

    protected $casts = [
        'is_edited'  => 'boolean',
        'edited_at'  => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'approved'   => 'boolean',
    ];

    protected $with = ['user', 'reactions'];

    protected $appends = ['reactions_count', 'replies_count', 'user_reaction'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Comment::class, 'parent_id');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(Comment::class, 'parent_id')->orderBy('created_at', 'asc');
    }

    public function reactions(): HasMany
    {
        return $this->hasMany(CommentReaction::class);
    }

    public function getReactionsCountAttribute(): array
    {
        return $this->reactions()
            ->get()
            ->groupBy('type')
            ->map(fn($group) => $group->count())
            ->toArray();
        // Note: MongoDB doesn't support selectRaw groupBy the same way
        // so we load and group in PHP instead
    }

    public function getRepliesCountAttribute(): int
    {
        return $this->replies()->count();
    }

    public function getUserReactionAttribute(): ?string
    {
        if (!Auth::check()) return null;

        $reaction = $this->reactions()
            ->where('user_id', Auth::id())
            ->first();

        return $reaction?->type;
    }

    public function scopeRootComments($query)
    {
        return $query->whereNull('parent_id');
    }

    public function scopeWithReplies($query)
    {
        return $query->with(['replies' => function ($q) {
            $q->with(['user', 'reactions']);
        }]);
    }
}