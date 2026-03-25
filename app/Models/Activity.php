<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;
use MongoDB\Laravel\Relations\BelongsTo;

class Activity extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'activities';

    protected $fillable = [
        'user_id',
        'type',
        'subject_type',
        'subject_id',
        'data',
    ];

    protected $casts = [
        'data'       => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public const TYPE_POST_CREATED  = 'post_created';
    public const TYPE_COMMENT_ADDED = 'comment_added';
    public const TYPE_USER_FOLLOWED = 'user_followed';
    public const TYPE_BADGE_EARNED  = 'badge_earned';
    public const TYPE_POST_LIKED    = 'post_liked';

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // MongoDB doesn't support MorphTo the same way
    // Use manual resolution instead
    public function getSubjectAttribute()
    {
        if (!$this->subject_type || !$this->subject_id) return null;

        $class = $this->subject_type;
        return $class::find($this->subject_id);
    }

    public static function postCreated(User $user, Post $post): self
    {
        return self::create([
            'user_id'      => $user->id,
            'type'         => self::TYPE_POST_CREATED,
            'subject_type' => Post::class,
            'subject_id'   => $post->id,
            'data'         => ['post_title' => $post->title],
        ]);
    }

    public static function commentAdded(User $user, Comment $comment): self
    {
        return self::create([
            'user_id'      => $user->id,
            'type'         => self::TYPE_COMMENT_ADDED,
            'subject_type' => Comment::class,
            'subject_id'   => $comment->id,
            'data'         => [
                'comment_content' => substr($comment->content, 0, 100),
                'post_id'         => $comment->post_id,
            ],
        ]);
    }

    public static function userFollowed(User $follower, User $following): self
    {
        return self::create([
            'user_id'      => $follower->id,
            'type'         => self::TYPE_USER_FOLLOWED,
            'subject_type' => User::class,
            'subject_id'   => $following->id,
            'data'         => ['followed_user_name' => $following->name],
        ]);
    }

    public static function feedForUser(User $user, int $limit = 20)
    {
        $followingIds = Follow::where('follower_id', $user->id)
            ->pluck('following_id')
            ->toArray();

        $followingIds[] = $user->id;

        return self::whereIn('user_id', $followingIds)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }
}