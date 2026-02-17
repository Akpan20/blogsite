<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/**
 * @property int $id
 * @property int $user_id
 * @property string $type
 * @property string|null $subject_type
 * @property int|null $subject_id
 * @property array<array-key, mixed>|null $data
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read Model|\Eloquent|null $subject
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Activity newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Activity newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Activity query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Activity whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Activity whereData($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Activity whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Activity whereSubjectId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Activity whereSubjectType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Activity whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Activity whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Activity whereUserId($value)
 * @mixin \Eloquent
 */
class Activity extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'subject_type',
        'subject_id',
        'data',
    ];

    protected $casts = [
        'data' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user who performed the activity
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the subject of the activity (polymorphic)
     */
    public function subject(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Activity types
     */
    public const TYPE_POST_CREATED = 'post_created';
    public const TYPE_COMMENT_ADDED = 'comment_added';
    public const TYPE_USER_FOLLOWED = 'user_followed';
    public const TYPE_BADGE_EARNED = 'badge_earned';
    public const TYPE_POST_LIKED = 'post_liked';

    /**
     * Create activity for post creation
     */
    public static function postCreated(User $user, Post $post): self
    {
        return self::create([
            'user_id' => $user->id,
            'type' => self::TYPE_POST_CREATED,
            'subject_type' => Post::class,
            'subject_id' => $post->id,
            'data' => [
                'post_title' => $post->title,
            ],
        ]);
    }

    /**
     * Create activity for comment
     */
    public static function commentAdded(User $user, Comment $comment): self
    {
        return self::create([
            'user_id' => $user->id,
            'type' => self::TYPE_COMMENT_ADDED,
            'subject_type' => Comment::class,
            'subject_id' => $comment->id,
            'data' => [
                'comment_content' => substr($comment->content, 0, 100),
                'post_id' => $comment->post_id,
            ],
        ]);
    }

    /**
     * Create activity for following a user
     */
    public static function userFollowed(User $follower, User $following): self
    {
        return self::create([
            'user_id' => $follower->id,
            'type' => self::TYPE_USER_FOLLOWED,
            'subject_type' => User::class,
            'subject_id' => $following->id,
            'data' => [
                'followed_user_name' => $following->name,
            ],
        ]);
    }

    /**
     * Get activities for user's feed (from followed users)
     */
    public static function feedForUser(User $user, int $limit = 20)
    {
        $followingIds = $user->following()->pluck('users.id')->toArray();
        $followingIds[] = $user->id; // Include own activities

        return self::with(['user', 'subject'])
            ->whereIn('user_id', $followingIds)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }
}