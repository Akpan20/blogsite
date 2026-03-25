<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;
use MongoDB\Laravel\Relations\BelongsTo;
use MongoDB\Laravel\Relations\BelongsToMany;
use Illuminate\Support\Str;

class Series extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'series';

    protected $fillable = [
        'title', 'slug', 'description', 'cover_image', 'user_id',
        'is_published', 'is_featured', 'posts_count',
        'meta_title', 'meta_description',
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'is_featured'  => 'boolean',
        'posts_count'  => 'integer',
    ];

    protected $appends = ['url'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function posts(): BelongsToMany
    {
        return $this->belongsToMany(Post::class, 'post_series')
            ->withPivot('order')
            ->withTimestamps();
    }

    public function getUrlAttribute(): string
    {
        return route('series.show', $this->slug);
    }

    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeByAuthor($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function addPost(Post $post, ?int $order = null): void
    {
        $order ??= $this->posts()->count() + 1;
        $this->posts()->attach($post->id, ['order' => $order]);
        $this->increment('posts_count');
    }

    public function removePost(Post $post): void
    {
        $this->posts()->detach($post->id);
        $this->decrement('posts_count');
        $this->reorderPosts();
    }

    public function reorderPosts(): void
    {
        $posts = $this->posts()->orderBy('pivot_order')->get();
        foreach ($posts as $index => $post) {
            $this->posts()->updateExistingPivot($post->id, ['order' => $index + 1]);
        }
    }

    public function getNextPost(Post $currentPost): ?Post
    {
        $pivot = $this->posts()->where('post_id', $currentPost->id)->first()?->pivot;
        if (!$pivot) return null;

        return $this->posts()
            ->wherePivot('order', '>', $pivot->order)
            ->where('status', 'published')
            ->orderBy('pivot_order')
            ->first();
    }

    public function getPreviousPost(Post $currentPost): ?Post
    {
        $pivot = $this->posts()->where('post_id', $currentPost->id)->first()?->pivot;
        if (!$pivot) return null;

        return $this->posts()
            ->wherePivot('order', '<', $pivot->order)
            ->where('status', 'published')
            ->orderByDesc('pivot_order')
            ->first();
    }

    public function getProgress(Post $currentPost): array
    {
        $total        = $this->posts()->where('status', 'published')->count();
        $currentOrder = $this->posts()->where('post_id', $currentPost->id)->first()?->pivot?->order ?? 0;

        return [
            'current'    => $currentOrder,
            'total'      => $total,
            'percentage' => $total > 0 ? round(($currentOrder / $total) * 100) : 0,
        ];
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($series) {
            if (empty($series->slug)) {
                $series->slug = Str::slug($series->title);
            }
        });

        static::updating(function ($series) {
            if ($series->isDirty('title') && empty($series->slug)) {
                $series->slug = Str::slug($series->title);
            }
        });

        static::deleting(function ($series) {
            $series->posts()->detach();
        });
    }
}