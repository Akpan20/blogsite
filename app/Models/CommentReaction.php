<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $user_id
 * @property int $comment_id
 * @property string $type
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Comment $comment
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CommentReaction newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CommentReaction newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CommentReaction query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CommentReaction whereCommentId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CommentReaction whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CommentReaction whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CommentReaction whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CommentReaction whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|CommentReaction whereUserId($value)
 * @mixin \Eloquent
 */
class CommentReaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'comment_id',
        'type',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Available reaction types
     */
    public const TYPES = [
        'like',
        'love',
        'laugh',
        'wow',
        'sad',
        'angry',
    ];

    /**
     * Get the user that owns the reaction
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the comment that owns the reaction
     */
    public function comment(): BelongsTo
    {
        return $this->belongsTo(Comment::class);
    }
}