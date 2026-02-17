<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Str;

class Series extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'description',
        'cover_image',
        'user_id',
        'is_published',
        'is_featured',
        'posts_count',
        'meta_title',
        'meta_description',
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'is_featured' => 'boolean',
        'posts_count' => 'integer',
    ];

    protected $appends = ['url'];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function posts(): BelongsToMany
    {
        return $this->belongsToMany(Post::class, 'post_series')
            ->withPivot('order')
            ->withTimestamps()
            ->orderByPivot('order');
    }

    // Accessors
    public function getUrlAttribute(): string
    {
        return route('series.show', $this->slug);
    }

    // Scopes
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

    public function scopeWithPublishedPosts($query)
    {
        return $query->with(['posts' => function ($q) {
            $q->published()->orderByPivot('order');
        }]);
    }

    // Methods
    public function addPost(Post $post, int $order = null): void
    {
        if ($order === null) {
            $order = $this->posts()->count() + 1;
        }

        $this->posts()->attach($post->id, ['order' => $order]);
        $this->increment('posts_count');
    }

    public function removePost(Post $post): void
    {
        $this->posts()->detach($post->id);
        $this->decrement('posts_count');
        
        // Reorder remaining posts
        $this->reorderPosts();
    }

    public function reorderPosts(): void
    {
        $posts = $this->posts()->orderByPivot('order')->get();
        
        foreach ($posts as $index => $post) {
            $this->posts()->updateExistingPivot($post->id, [
                'order' => $index + 1
            ]);
        }
    }

    public function getNextPost(Post $currentPost): ?Post
    {
        $currentOrder = $this->posts()
            ->where('post_id', $currentPost->id)
            ->first()
            ?->pivot
            ?->order;

        if (!$currentOrder) {
            return null;
        }

        return $this->posts()
            ->wherePivot('order', '>', $currentOrder)
            ->published()
            ->first();
    }

    public function getPreviousPost(Post $currentPost): ?Post
    {
        $currentOrder = $this->posts()
            ->where('post_id', $currentPost->id)
            ->first()
            ?->pivot
            ?->order;

        if (!$currentOrder) {
            return null;
        }

        return $this->posts()
            ->wherePivot('order', '<', $currentOrder)
            ->published()
            ->orderByPivot('order', 'desc')
            ->first();
    }

    public function getProgress(Post $currentPost): array
    {
        $totalPosts = $this->posts()->published()->count();
        $currentOrder = $this->posts()
            ->where('post_id', $currentPost->id)
            ->first()
            ?->pivot
            ?->order ?? 0;

        return [
            'current' => $currentOrder,
            'total' => $totalPosts,
            'percentage' => $totalPosts > 0 ? round(($currentOrder / $totalPosts) * 100) : 0,
        ];
    }

    // Auto-generate slug and update count
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