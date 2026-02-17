<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use App\Models\UserSubscription;
use App\Models\PaymentTransaction;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property \Illuminate\Support\Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $remember_token
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property string|null $preferences
 * @property string $role
 * @property int $is_active
 * @property string|null $username
 * @property string|null $avatar
 * @property string|null $bio
 * @property string|null $location
 * @property string|null $website
 * @property string|null $twitter
 * @property string|null $github
 * @property string|null $linkedin
 * @property int $reputation_points
 * @property \Illuminate\Support\Carbon|null $last_seen_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Activity> $activities
 * @property-read int|null $activities_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Badge> $badges
 * @property-read int|null $badges_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Comment> $comments
 * @property-read int|null $comments_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, User> $followers
 * @property-read int $followers_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, User> $following
 * @property-read int $following_count
 * @property-read bool $is_online
 * @property-read int|null $posts_count
 * @property-read \Illuminate\Notifications\DatabaseNotificationCollection<int, \Illuminate\Notifications\DatabaseNotification> $notifications
 * @property-read int|null $notifications_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Post> $posts
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Message> $receivedMessages
 * @property-read int|null $received_messages_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Message> $sentMessages
 * @property-read int|null $sent_messages_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Laravel\Sanctum\PersonalAccessToken> $tokens
 * @property-read int|null $tokens_count
 * @method static \Database\Factories\UserFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereAvatar($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereBio($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereEmailVerifiedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereGithub($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereLastSeenAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereLinkedin($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereLocation($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User wherePassword($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User wherePreferences($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereRememberToken($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereReputationPoints($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereRole($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereTwitter($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereUsername($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|User whereWebsite($value)
 * @mixin \Eloquent
 */
class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'username',
        'avatar',
        'bio',
        'location',
        'website',
        'twitter',
        'github',
        'linkedin',
        'reputation_points',
        'last_seen_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'last_seen_at' => 'datetime',
        'password' => 'hashed',
        'reputation_points' => 'integer',
    ];

    protected $appends = [
        'followers_count',
        'following_count',
        'posts_count',
        'is_online',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($user) {
            if (!$user->username) {
                $user->username = Str::slug($user->name) . '-' . Str::random(5);
            }
        });
    }

    // ============================================
    // POSTS RELATIONSHIP
    // ============================================

    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    // ============================================
    // FOLLOW RELATIONSHIPS
    // ============================================

    /**
     * Users that this user is following
     */
    public function following(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'follows', 'follower_id', 'following_id')
            ->withTimestamps();
    }

    /**
     * Users that are following this user
     */
    public function followers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'follows', 'following_id', 'follower_id')
            ->withTimestamps();
    }

    /**
     * Check if user is following another user
     */
    public function isFollowing(User $user): bool
    {
        return $this->following()->where('following_id', $user->id)->exists();
    }

    /**
     * Check if user is followed by another user
     */
    public function isFollowedBy(User $user): bool
    {
        return $this->followers()->where('follower_id', $user->id)->exists();
    }

    /**
     * Follow a user
     */
    public function follow(User $user): void
    {
        if (!$this->isFollowing($user) && $this->id !== $user->id) {
            $this->following()->attach($user->id);
            
            // Create activity
            Activity::userFollowed($this, $user);
            
            // Send notification
            $user->notify(new \App\Notifications\UserFollowed($this));
        }
    }

    /**
     * Unfollow a user
     */
    public function unfollow(User $user): void
    {
        $this->following()->detach($user->id);
    }

    // ============================================
    // BADGE RELATIONSHIPS
    // ============================================

    public function badges(): BelongsToMany
    {
        return $this->belongsToMany(Badge::class, 'badge_user')
            ->withPivot('awarded_at')
            ->orderByPivot('awarded_at', 'desc');
    }

    /**
     * Check if user has a badge
     */
    public function hasBadge(string $slug): bool
    {
        return $this->badges()->where('slug', $slug)->exists();
    }

    // ============================================
    // MESSAGES RELATIONSHIPS
    // ============================================

    public function sentMessages(): HasMany
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    public function receivedMessages(): HasMany
    {
        return $this->hasMany(Message::class, 'receiver_id');
    }

    /**
     * Get unread messages count
     */
    public function unreadMessagesCount(): int
    {
        return $this->receivedMessages()->unread()->count();
    }

    // ============================================
    // ACTIVITIES
    // ============================================

    public function activities(): HasMany
    {
        return $this->hasMany(Activity::class);
    }

    /**
     * Get user's activity feed
     */
    public function feed(int $limit = 20)
    {
        return Activity::feedForUser($this, $limit);
    }

    // ============================================
    // COMPUTED ATTRIBUTES
    // ============================================

    public function getFollowersCountAttribute(): int
    {
        return $this->followers()->count();
    }

    public function getFollowingCountAttribute(): int
    {
        return $this->following()->count();
    }

    public function getPostsCountAttribute(): int
    {
        return $this->posts()->count();
    }

    public function getIsOnlineAttribute(): bool
    {
        return $this->last_seen_at && $this->last_seen_at->gt(now()->subMinutes(5));
    }

    // ============================================
    // REPUTATION & BADGES
    // ============================================

    /**
     * Add reputation points
     */
    public function addReputation(int $points): void
    {
        $this->increment('reputation_points', $points);
    }

    /**
     * Check and award badges based on user's achievements
     */
    public function checkAndAwardBadges(): void
    {
        $badges = Badge::all();

        foreach ($badges as $badge) {
            if ($this->meetsBadgeCriteria($badge) && !$this->hasBadge($badge->slug)) {
                $badge->awardTo($this);
            }
        }
    }

    /**
     * Check if user meets badge criteria
     */
    private function meetsBadgeCriteria(Badge $badge): bool
    {
        $criteria = $badge->criteria ?? [];

        foreach ($criteria as $key => $value) {
            switch ($key) {
                case 'posts_count':
                    if ($this->posts_count < $value) return false;
                    break;
                case 'followers_count':
                    if ($this->followers_count < $value) return false;
                    break;
                case 'comments_count':
                    if ($this->comments()->count() < $value) return false;
                    break;
                case 'total_views':
                    if ($this->posts()->sum('views_count') < $value) return false;
                    break;
                case 'user_id':
                    if (is_array($value) && isset($value[0]) && $value[0] === '<=') {
                        if ($this->id > $value[1]) return false;
                    }
                    break;
            }
        }

        return true;
    }

    /**
     * Update last seen timestamp
     */
    public function updateLastSeen(): void
    {
        $this->update(['last_seen_at' => now()]);
    }

    public function subscriptions()
    {
        return $this->hasMany(UserSubscription::class);
    }

    public function transactions()
    {
        return $this->hasMany(PaymentTransaction::class);
    }

    public function activeSubscription()
    {
        return $this->hasOne(UserSubscription::class)
            ->where('payment_status', 'completed')
            ->where(function($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->whereNull('cancelled_at')
            ->latest();
    }
}