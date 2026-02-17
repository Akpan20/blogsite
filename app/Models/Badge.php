<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property string $description
 * @property string|null $icon
 * @property string $color
 * @property int $points
 * @property array<array-key, mixed>|null $criteria
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Badge newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Badge newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Badge query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Badge whereColor($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Badge whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Badge whereCriteria($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Badge whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Badge whereIcon($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Badge whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Badge whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Badge wherePoints($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Badge whereSlug($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Badge whereUpdatedAt($value)
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\User> $users
 * @property-read int|null $users_count
 * @mixin \Eloquent
 */
class Badge extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'icon',
        'color',
        'points',
        'criteria',
    ];

    protected $casts = [
        'criteria' => 'array',
        'points' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Users who have earned this badge
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class)
            ->withTimestamps('awarded_at');
    }

    /**
     * Predefined badges
     */
    public static function seed(): void
    {
        $badges = [
            [
                'name' => 'First Post',
                'slug' => 'first-post',
                'description' => 'Created your first post',
                'icon' => '📝',
                'color' => 'blue',
                'points' => 10,
                'criteria' => ['posts_count' => 1],
            ],
            [
                'name' => 'Prolific Writer',
                'slug' => 'prolific-writer',
                'description' => 'Published 10 posts',
                'icon' => '✍️',
                'color' => 'purple',
                'points' => 50,
                'criteria' => ['posts_count' => 10],
            ],
            [
                'name' => 'Popular',
                'slug' => 'popular',
                'description' => 'Got 100 followers',
                'icon' => '⭐',
                'color' => 'yellow',
                'points' => 100,
                'criteria' => ['followers_count' => 100],
            ],
            [
                'name' => 'Conversationalist',
                'slug' => 'conversationalist',
                'description' => 'Posted 50 comments',
                'icon' => '💬',
                'color' => 'green',
                'points' => 30,
                'criteria' => ['comments_count' => 50],
            ],
            [
                'name' => 'Early Adopter',
                'slug' => 'early-adopter',
                'description' => 'One of the first 100 users',
                'icon' => '🎖️',
                'color' => 'gold',
                'points' => 25,
                'criteria' => ['user_id' => ['<=', 100]],
            ],
            [
                'name' => 'Influencer',
                'slug' => 'influencer',
                'description' => 'Your posts got 1000 total views',
                'icon' => '🔥',
                'color' => 'red',
                'points' => 150,
                'criteria' => ['total_views' => 1000],
            ],
        ];

        foreach ($badges as $badge) {
            self::updateOrCreate(
                ['slug' => $badge['slug']],
                $badge
            );
        }
    }

    /**
     * Award badge to user
     */
    public function awardTo(User $user): void
    {
        if (!$user->badges()->where('badge_id', $this->id)->exists()) {
            $user->badges()->attach($this->id, [
                'awarded_at' => now(),
            ]);

            // Add reputation points
            $user->increment('reputation_points', $this->points);

            // Create activity
            Activity::create([
                'user_id' => $user->id,
                'type' => Activity::TYPE_BADGE_EARNED,
                'subject_type' => self::class,
                'subject_id' => $this->id,
                'data' => [
                    'badge_name' => $this->name,
                    'badge_icon' => $this->icon,
                ],
            ]);
        }
    }
}