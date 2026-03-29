<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use MongoDB\Laravel\Eloquent\Model;
use MongoDB\Laravel\Relations\BelongsToMany;
use Illuminate\Support\Str;

class Tag extends Model
{
    use HasFactory;

    protected $connection = 'mongodb';
    protected $collection = 'tags';

    protected $fillable = [
        'name',
        'slug',
        'description',
        'color',
        'usage_count',
    ];

    protected $casts = [
        'usage_count' => 'integer',
        'created_at'  => 'datetime',
        'updated_at'  => 'datetime',
    ];

    // ============================================
    // RELATIONSHIPS
    // ============================================

    public function posts(): BelongsToMany
    {
        return $this->belongsToMany(Post::class, 'post_tag')
            ->withTimestamps();
    }

    // ============================================
    // SCOPES
    // Fixed: withCount/having not supported in MongoDB
    // Use stored usage_count field instead
    // ============================================

    public function scopePopular($query, int $limit = 10)
    {
        return $query->where('usage_count', '>', 0)
            ->orderByDesc('usage_count')
            ->limit($limit);
    }

    public function scopeCloud($query, int $limit = 50)
    {
        return $query->where('usage_count', '>', 0)
            ->orderByDesc('usage_count')
            ->limit($limit);
    }

    public function scopeWithPostsCount($query)
    {
        // No-op in MongoDB — usage_count is stored directly on the tag
        // Just return the query as-is so calling code doesn't break
        return $query;
    }

    public function scopePublished($query)
    {
        // Return tags that have at least one post (usage_count > 0)
        return $query->where('usage_count', '>', 0);
    }

    public function scopeSearch($query, string $term)
    {
        // MongoDB uses regexp instead of LIKE
        return $query->where('name', 'regexp', '/' . $term . '/i');
    }

    // ============================================
    // METHODS
    // ============================================

    public static function findOrCreateByName(string $name): self
    {
        $slug = Str::slug($name);

        return static::firstOrCreate(
            ['slug' => $slug],
            ['name' => $name, 'usage_count' => 0]
        );
    }

    public static function syncFromString(string $tagsString): array
    {
        $tagNames = array_filter(
            array_map('trim', explode(',', $tagsString))
        );

        $tags = [];
        foreach ($tagNames as $name) {
            $tags[] = static::findOrCreateByName($name);
        }

        return collect($tags)->pluck('id')->toArray();
    }

    /**
     * Increment usage count when attached to a post
     */
    public function incrementUsage(): void
    {
        $this->increment('usage_count');
    }

    /**
     * Decrement usage count when detached from a post
     */
    public function decrementUsage(): void
    {
        if ($this->usage_count > 0) {
            $this->decrement('usage_count');
        }
    }

    // ============================================
    // BOOT
    // ============================================

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($tag) {
            if (empty($tag->slug)) {
                $tag->slug = Str::slug($tag->name);
            }
            // Ensure usage_count defaults to 0
            if (!isset($tag->usage_count)) {
                $tag->usage_count = 0;
            }
        });

        static::updating(function ($tag) {
            if ($tag->isDirty('name') && empty($tag->slug)) {
                $tag->slug = Str::slug($tag->name);
            }
        });
    }
}