<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;
use MongoDB\Laravel\Relations\BelongsTo;
use MongoDB\Laravel\Relations\BelongsToMany;
use MongoDB\Laravel\Relations\HasMany;
use Illuminate\Support\Str;

class Post extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'posts';

    protected $fillable = [
        'title', 'slug', 'excerpt', 'content', 'user_id', 'category_id',
        'status', 'published', 'is_featured', 'is_sticky', 'featured_order',
        'reading_time', 'meta_title', 'meta_description', 'meta_keywords',
        'canonical_url', 'og_image', 'featured_image', 'featured_image_alt',
        'published_at', 'scheduled_at', 'last_modified_at', 'template',
        'index', 'follow', 'views_count', 'likes_count', 'comments_count',
        'shares_count', 'is_premium', 'premium_tier',
    ];

    protected $casts = [
        'published_at'     => 'datetime',
        'scheduled_at'     => 'datetime',
        'last_modified_at' => 'datetime',
        'published'        => 'boolean',
        'is_featured'      => 'boolean',
        'is_sticky'        => 'boolean',
        'index'            => 'boolean',
        'follow'           => 'boolean',
        'is_premium'       => 'boolean',
        'views_count'      => 'integer',
        'likes_count'      => 'integer',
        'comments_count'   => 'integer',
        'shares_count'     => 'integer',
        'reading_time'     => 'integer',
        'featured_order'   => 'integer',
    ];

    protected $appends = ['url', 'status_label'];

    // ============================================
    // RELATIONSHIPS
    // ============================================

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    public function views(): HasMany
    {
        return $this->hasMany(View::class);
    }

    // MongoDB BelongsToMany via pivot collections
    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'post_tag')->withTimestamps();
    }

    public function series(): BelongsToMany
    {
        return $this->belongsToMany(Series::class, 'post_series')
            ->withPivot('order')
            ->withTimestamps();
    }

    // ============================================
    // ACCESSORS
    // ============================================

    public function getUrlAttribute(): string
    {
        return route('posts.show', $this->slug);
    }

    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'published' => 'Published',
            'draft'     => 'Draft',
            'scheduled' => 'Scheduled',
            default     => 'Unknown',
        };
    }

    public function getFirstImageAttribute(): string
    {
        preg_match('/<img.+src=["\']([^"\']+)["\']/', $this->content ?? '', $matches);
        return $matches[1] ?? asset('default-og-image.jpg');
    }

    // ============================================
    // SCOPES
    // ============================================

    public function scopePublished($query)
    {
        return $query->where('status', 'published')->where('published', true);
    }

    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    public function scopeScheduled($query)
    {
        return $query->where('status', 'scheduled')
            ->whereNotNull('scheduled_at')
            ->where('scheduled_at', '>', now());
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true)->orderBy('featured_order');
    }

    public function scopeSticky($query)
    {
        return $query->where('is_sticky', true);
    }

    public function scopePremium($query, $tier = null)
    {
        $query = $query->where('is_premium', true);
        if ($tier) $query->where('premium_tier', $tier);
        return $query;
    }

    public function scopeFree($query)
    {
        return $query->where('is_premium', false);
    }

    public function scopeByCategory($query, $categoryId)
    {
        return $query->where('category_id', $categoryId);
    }

    public function scopePopular($query, $days = 30)
    {
        return $query->where('created_at', '>=', now()->subDays($days))
            ->orderByDesc('views_count');
    }

    public function scopeTrending($query, $days = 7)
    {
        return $query->where('created_at', '>=', now()->subDays($days))
            ->orderByDesc('likes_count')
            ->orderByDesc('comments_count')
            ->orderByDesc('views_count');
    }

    public function scopeRecent($query, $limit = 10)
    {
        return $query->published()->latest('created_at')->limit($limit);
    }

    public function scopeSearch($query, $search)
    {
        // MongoDB uses regex for LIKE-style search
        return $query->where(function ($q) use ($search) {
            $q->where('title', 'regexp', "/{$search}/i")
              ->orWhere('content', 'regexp', "/{$search}/i")
              ->orWhere('excerpt', 'regexp', "/{$search}/i");
        });
    }

    // ============================================
    // STATUS METHODS
    // ============================================

    public function isPublished(): bool
    {
        return $this->status === 'published' && $this->published;
    }

    public function isDraft(): bool
    {
        return $this->status === 'draft';
    }

    public function isScheduled(): bool
    {
        return $this->status === 'scheduled'
            && $this->scheduled_at
            && $this->scheduled_at->isFuture();
    }

    public function publish(): void
    {
        $this->update([
            'status'       => 'published',
            'published'    => true,
            'published_at' => now(),
        ]);
    }

    public function unpublish(): void
    {
        $this->update([
            'status'       => 'draft',
            'published'    => false,
            'published_at' => null,
        ]);
    }

    public function schedule(\DateTime $date): void
    {
        $this->update(['status' => 'scheduled', 'scheduled_at' => $date]);
    }

    // ============================================
    // HELPER METHODS
    // ============================================

    public function incrementViews(): void
    {
        $this->increment('views_count');
    }

    public function calculateReadingTime(): int
    {
        $wordCount = str_word_count(strip_tags($this->content ?? ''));
        return max(1, ceil($wordCount / 200));
    }

    public function syncTags(array $tagIds): void
    {
        $this->tags()->sync($tagIds);
    }

    public function getRelatedPosts(int $limit = 5)
    {
        $tagIds = $this->tags()->pluck('_id')->toArray();

        return Post::published()
            ->where('_id', '!=', $this->id)
            ->where(function ($query) use ($tagIds) {
                $query->where('category_id', $this->category_id)
                      ->orWhereIn('tag_ids', $tagIds); // store tag IDs on post for easy querying
            })
            ->orderByDesc('views_count')
            ->limit($limit)
            ->get();
    }

    public function getSeriesInfo(): ?array
    {
        $series = $this->series()->first();
        if (!$series) return null;

        return [
            'series'   => $series,
            'next'     => $series->getNextPost($this),
            'previous' => $series->getPreviousPost($this),
            'progress' => $series->getProgress($this),
        ];
    }

    // ============================================
    // BOOT
    // ============================================

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($post) {
            if (empty($post->slug)) {
                $post->slug = Str::slug($post->title);
            }
            if (empty($post->reading_time)) {
                $post->reading_time = $post->calculateReadingTime();
            }
            if ($post->status === 'published' && !isset($post->published)) {
                $post->published    = true;
                $post->published_at = $post->published_at ?? now();
            }
        });

        static::updating(function ($post) {
            if ($post->isDirty('content')) {
                $post->reading_time    = $post->calculateReadingTime();
                $post->last_modified_at = now();
            }
            if ($post->isDirty('status')) {
                if ($post->status === 'published') {
                    $post->published    = true;
                    $post->published_at = $post->published_at ?? now();
                } else {
                    $post->published = false;
                }
            }
        });
    }
}