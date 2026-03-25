<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property string $title
 * @property string $slug
 * @property string $content
 * @property string|null $excerpt
 * @property string $status
 * @property int $user_id
 * @property int|null $category_id
 * @property string|null $meta_title
 * @property string|null $meta_description
 * @property string|null $meta_keywords
 * @property string|null $og_image
 * @property string|null $canonical_url
 * @property string|null $featured_image
 * @property string|null $featured_image_alt
 * @property bool $index
 * @property bool $follow
 * @property bool $is_featured
 * @property bool $is_sticky
 * @property int $featured_order
 * @property bool $is_premium
 * @property string|null $premium_tier
 * @property int $views_count
 * @property int $likes_count
 * @property int $comments_count
 * @property int $shares_count
 * @property int|null $reading_time
 * @property bool $published
 * @property \Illuminate\Support\Carbon|null $published_at
 * @property \Illuminate\Support\Carbon|null $scheduled_at
 * @property \Illuminate\Support\Carbon|null $last_modified_at
 * @property string $template
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Comment> $comments
 * @property-read \App\Models\User $user
 * @property-read \App\Models\Category|null $category
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Tag> $tags
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Series> $series
 * @property-read string $url
 * @property-read string $status_label
 * @mixin \Eloquent
 */
class Post extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'excerpt',
        'content',
        'user_id',
        'category_id',
        'status',
        'published',
        'is_featured',
        'is_sticky',
        'featured_order',
        'reading_time',
        'meta_title',
        'meta_description',
        'meta_keywords',
        'canonical_url',
        'og_image',
        'featured_image',
        'featured_image_alt',
        'published_at',
        'scheduled_at',
        'last_modified_at',
        'template',
        'index',
        'follow',
        'views_count',
        'likes_count',
        'comments_count',
        'shares_count',
        'is_premium',
        'premium_tier',
    ];

    protected $casts = [
        'published_at' => 'datetime',
        'scheduled_at' => 'datetime',
        'last_modified_at' => 'datetime',
        'published' => 'boolean',
        'is_featured' => 'boolean',
        'is_sticky' => 'boolean',
        'index' => 'boolean',
        'follow' => 'boolean',
        'is_premium' => 'boolean',
        'views_count' => 'integer',
        'likes_count' => 'integer',
        'comments_count' => 'integer',
        'shares_count' => 'integer',
        'reading_time' => 'integer',
        'featured_order' => 'integer',
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

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'post_tag')
            ->withTimestamps();
    }

    public function series(): BelongsToMany
    {
        return $this->belongsToMany(Series::class, 'post_series')
            ->withPivot('order')
            ->withTimestamps()
            ->orderByPivot('order');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    public function views(): HasMany
    {
        return $this->hasMany(View::class);
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
        return match($this->status) {
            'published' => 'Published',
            'draft' => 'Draft',
            'scheduled' => 'Scheduled',
            default => 'Unknown',
        };
    }

    public function getFirstImageAttribute()
    {
        // Use regex to find the first <img> tag src in the content
        preg_match('/<img.+src=["\']([^" text=\']+)["\']/', $this->content, $matches);
        
        return $matches[1] ?? asset('default-og-image.jpg');
    }

    // ============================================
    // SCOPES
    // ============================================

    // FIXED: Now works with 'published' column in your database
    public function scopePublished($query)
    {
        return $query->where('status', 'published')
            ->where('published', 1);
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
        return $query->where('is_featured', true)
            ->orderBy('featured_order');
    }

    public function scopeSticky($query)
    {
        return $query->where('is_sticky', true);
    }

    public function scopePremium($query, $tier = null)
    {
        $query = $query->where('is_premium', true);
        
        if ($tier) {
            $query->where('premium_tier', $tier);
        }
        
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

    public function scopeByTag($query, $tagId)
    {
        return $query->whereHas('tags', function ($q) use ($tagId) {
            $q->where('tags.id', $tagId);
        });
    }

    public function scopeBySeries($query, $seriesId)
    {
        return $query->whereHas('series', function ($q) use ($seriesId) {
            $q->where('series.id', $seriesId);
        });
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
        return $query->published()
            ->latest('created_at')
            ->limit($limit);
    }

    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('title', 'like', "%{$search}%")
              ->orWhere('content', 'like', "%{$search}%")
              ->orWhere('excerpt', 'like', "%{$search}%");
        });
    }

    // ============================================
    // STATUS METHODS
    // ============================================

    public function isPublished(): bool
    {
        return $this->status === 'published' && $this->published == 1;
    }

    public function isDraft(): bool
    {
        return $this->status === 'draft';
    }

    public function isScheduled(): bool
    {
        return $this->status === 'scheduled' && 
               $this->scheduled_at && 
               $this->scheduled_at->isFuture();
    }

    // FIXED: Now sets both 'published' and 'published_at'
    public function publish(): void
    {
        $this->update([
            'status' => 'published',
            'published' => 1,
            'published_at' => now(),
        ]);
    }

    // FIXED: Now clears both 'published' and 'published_at'
    public function unpublish(): void
    {
        $this->update([
            'status' => 'draft',
            'published' => 0,
            'published_at' => null,
        ]);
    }

    public function schedule(\DateTime $date): void
    {
        $this->update([
            'status' => 'scheduled',
            'scheduled_at' => $date,
        ]);
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
        $wordCount = str_word_count(strip_tags($this->content));
        $minutes = ceil($wordCount / 200); // Average reading speed: 200 words/minute
        
        return max(1, $minutes);
    }

    public function syncTags(array $tagIds): void
    {
        $this->tags()->sync($tagIds);
    }

    public function syncTagsFromString(string $tagsString): void
    {
        $tagIds = Tag::syncFromString($tagsString);
        $this->syncTags($tagIds);
    }

    public function getRelatedPosts(int $limit = 5)
    {
        return Post::published()
            ->where('id', '!=', $this->id)
            ->where(function ($query) {
                $query->where('category_id', $this->category_id)
                    ->orWhereHas('tags', function ($q) {
                        $q->whereIn('tags.id', $this->tags->pluck('id'));
                    });
            })
            ->withCount(['tags' => function ($q) {
                $q->whereIn('tags.id', $this->tags->pluck('id'));
            }])
            ->orderByDesc('tags_count')
            ->orderByDesc('views_count')
            ->limit($limit)
            ->get();
    }

    public function getSeriesInfo()
    {
        $series = $this->series()->first();
        
        if (!$series) {
            return null;
        }

        return [
            'series' => $series,
            'next' => $series->getNextPost($this),
            'previous' => $series->getPreviousPost($this),
            'progress' => $series->getProgress($this),
        ];
    }

    // ============================================
    // BOOT METHOD
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

            // ADDED: Auto-sync published field with status
            if ($post->status === 'published' && !isset($post->published)) {
                $post->published = 1;
                if (!isset($post->published_at)) {
                    $post->published_at = now();
                }
            }
        });

        static::updating(function ($post) {
            if ($post->isDirty('title') && empty($post->slug)) {
                $post->slug = Str::slug($post->title);
            }
            
            if ($post->isDirty('content')) {
                $post->reading_time = $post->calculateReadingTime();
                $post->last_modified_at = now();
            }

            // ADDED: Auto-sync published field when status changes
            if ($post->isDirty('status')) {
                if ($post->status === 'published') {
                    $post->published = 1;
                    if (!$post->published_at) {
                        $post->published_at = now();
                    }
                } else {
                    $post->published = 0;
                }
            }
        });
    }
}