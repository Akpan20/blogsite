<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Auth\Authenticatable;
use Illuminate\Auth\MustVerifyEmail as MustVerifyEmailTrait;
use Illuminate\Auth\Passwords\CanResetPassword;
use Illuminate\Contracts\Auth\Access\Authorizable as AuthorizableContract;
use Illuminate\Contracts\Auth\CanResetPassword as CanResetPasswordContract;
use Illuminate\Foundation\Auth\Access\Authorizable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Laravel\Sanctum\HasApiTokens;
use MongoDB\Laravel\Eloquent\Model;
use MongoDB\Laravel\Relations\HasMany;
use MongoDB\Laravel\Relations\BelongsToMany;
use App\Models\UserSubscription;
use App\Models\PaymentTransaction;
use Illuminate\Support\Str;

class User extends Model implements
    \Illuminate\Contracts\Auth\Authenticatable,
    AuthorizableContract,
    CanResetPasswordContract,
    MustVerifyEmail
{
    use Authenticatable,
        Authorizable,
        CanResetPassword,
        MustVerifyEmailTrait,
        HasApiTokens,
        HasFactory,
        Notifiable;

    protected $connection = 'mongodb';
    protected $collection = 'users';

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
        'last_seen_at'      => 'datetime',
        'password'          => 'hashed',
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
    // RELATIONSHIPS
    // ============================================

    /**
     * Get the access tokens that belong to model.
     *
     * @return \MongoDB\Laravel\Relations\HasMany
     */
    public function tokens()
    {
        return $this->hasMany(PersonalAccessToken::class, 'tokenable_id', '_id')
            ->where('tokenable_type', static::class);
    }

    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    public function sentMessages(): HasMany
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    public function receivedMessages(): HasMany
    {
        return $this->hasMany(Message::class, 'receiver_id');
    }

    public function activities(): HasMany
    {
        return $this->hasMany(Activity::class);
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(UserSubscription::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(PaymentTransaction::class);
    }

    // MongoDB doesn't support belongsToMany with pivot tables the same way
    // Use a different approach for follows
    public function following(): HasMany
    {
        return $this->hasMany(Follow::class, 'follower_id');
    }

    public function followers(): HasMany
    {
        return $this->hasMany(Follow::class, 'following_id');
    }

    public function badges(): BelongsToMany
    {
        return $this->belongsToMany(Badge::class, 'badge_user')
            ->withPivot('awarded_at');
    }

    // ============================================
    // FOLLOW HELPERS
    // ============================================

    public function isFollowing(User $user): bool
    {
        return Follow::where('follower_id', $this->id)
            ->where('following_id', $user->id)
            ->exists();
    }

    public function isFollowedBy(User $user): bool
    {
        return Follow::where('following_id', $this->id)
            ->where('follower_id', $user->id)
            ->exists();
    }

    public function follow(User $user): void
    {
        if (!$this->isFollowing($user) && $this->id !== $user->id) {
            Follow::create([
                'follower_id'  => $this->id,
                'following_id' => $user->id,
            ]);
            Activity::userFollowed($this, $user);
            $user->notify(new \App\Notifications\UserFollowed($this));
        }
    }

    public function unfollow(User $user): void
    {
        Follow::where('follower_id', $this->id)
            ->where('following_id', $user->id)
            ->delete();
    }

    // ============================================
    // COMPUTED ATTRIBUTES
    // ============================================

    public function getFollowersCountAttribute(): int
    {
        return Follow::where('following_id', $this->id)->count();
    }

    public function getFollowingCountAttribute(): int
    {
        return Follow::where('follower_id', $this->id)->count();
    }

    public function getPostsCountAttribute(): int
    {
        return Post::where('user_id', $this->id)->count();
    }

    public function getIsOnlineAttribute(): bool
    {
        return $this->last_seen_at && $this->last_seen_at->gt(now()->subMinutes(5));
    }

    // ============================================
    // OTHER METHODS
    // ============================================

    public function hasBadge(string $slug): bool
    {
        return $this->badges()->where('slug', $slug)->exists();
    }

    public function unreadMessagesCount(): int
    {
        return $this->receivedMessages()->where('read_at', null)->count();
    }

    public function addReputation(int $points): void
    {
        $this->increment('reputation_points', $points);
    }

    public function updateLastSeen(): void
    {
        $this->update(['last_seen_at' => now()]);
    }

    public function activeSubscription()
    {
        return $this->hasOne(UserSubscription::class)
            ->where('payment_status', 'completed')
            ->where(function ($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->whereNull('cancelled_at')
            ->latest();
    }

    public function feed(int $limit = 20)
    {
        return Activity::feedForUser($this, $limit);
    }

    public function checkAndAwardBadges(): void
    {
        $badges = Badge::all();
        foreach ($badges as $badge) {
            if ($this->meetsBadgeCriteria($badge) && !$this->hasBadge($badge->slug)) {
                $badge->awardTo($this);
            }
        }
    }

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
                    if (Post::where('user_id', $this->id)->sum('views_count') < $value) return false;
                    break;
            }
        }
        return true;
    }
}