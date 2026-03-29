<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;
use MongoDB\Laravel\Relations\BelongsToMany;

class Badge extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'badges';

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
        'criteria'   => 'array',
        'points'     => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'badge_user')
            ->withPivot('awarded_at');
    }

    public function awardTo(User $user): void
    {
        if (!$user->badges()->where('badge_id', $this->id)->exists()) {
            $user->badges()->attach($this->id, [
                'awarded_at' => now(),
            ]);

            $user->increment('reputation_points', $this->points);

            Activity::create([
                'user_id'      => $user->id,
                'type'         => Activity::TYPE_BADGE_EARNED,
                'subject_type' => self::class,
                'subject_id'   => $this->id,
                'data'         => [
                    'badge_name' => $this->name,
                    'badge_icon' => $this->icon,
                ],
            ]);
        }
    }

    public static function seed(): void
    {
        $badges = [
            [
                'name'        => 'First Post',
                'slug'        => 'first-post',
                'description' => 'Created your first post',
                'icon'        => '📝',
                'color'       => 'blue',
                'points'      => 10,
                'criteria'    => ['posts_count' => 1],
            ],
            [
                'name'        => 'Prolific Writer',
                'slug'        => 'prolific-writer',
                'description' => 'Published 10 posts',
                'icon'        => '✍️',
                'color'       => 'purple',
                'points'      => 50,
                'criteria'    => ['posts_count' => 10],
            ],
            [
                'name'        => 'Popular',
                'slug'        => 'popular',
                'description' => 'Got 100 followers',
                'icon'        => '⭐',
                'color'       => 'yellow',
                'points'      => 100,
                'criteria'    => ['followers_count' => 100],
            ],
            [
                'name'        => 'Conversationalist',
                'slug'        => 'conversationalist',
                'description' => 'Posted 50 comments',
                'icon'        => '💬',
                'color'       => 'green',
                'points'      => 30,
                'criteria'    => ['comments_count' => 50],
            ],
            [
                'name'        => 'Early Adopter',
                'slug'        => 'early-adopter',
                'description' => 'One of the first 100 users',
                'icon'        => '🎖️',
                'color'       => 'gold',
                'points'      => 25,
                'criteria'    => ['user_id' => ['<=', 100]],
            ],
            [
                'name'        => 'Influencer',
                'slug'        => 'influencer',
                'description' => 'Your posts got 1000 total views',
                'icon'        => '🔥',
                'color'       => 'red',
                'points'      => 150,
                'criteria'    => ['total_views' => 1000],
            ],
        ];

        foreach ($badges as $badge) {
            self::updateOrCreate(['slug' => $badge['slug']], $badge);
        }
    }
}