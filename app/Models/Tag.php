<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use MongoDB\Laravel\Eloquent\Model;                     // <-- Change base class
use MongoDB\Laravel\Relations\BelongsToMany;            // <-- Use MongoDB relationship
use Illuminate\Support\Str;

class Tag extends Model
{
    use HasFactory;

    // Optional: set the collection name (defaults to 'tags')
    // protected $collection = 'tags';

    protected $fillable = [
        'name',
        'slug',
        'description',
        'color',
    ];

    /**
     * The posts that belong to this tag.
     */
    public function posts(): BelongsToMany
    {
        return $this->belongsToMany(Post::class, 'post_tag')
            ->withTimestamps();
    }

    // Scopes
    public function scopePopular($query, $limit = 10)
    {
        return $query->withCount(['posts' => function ($q) {
                $q->where('status', 'published');
            }])
            ->having('posts_count', '>', 0)
            ->orderByDesc('posts_count')
            ->limit($limit);
    }

    public function scopeWithPostsCount($query)
    {
        return $query->withCount(['posts' => function ($q) {
            $q->where('status', 'published');
        }]);
    }

    public function scopePublished($query)
    {
        return $query->whereHas('posts', function ($q) {
            $q->where('status', 'published');
        });
    }

    // Methods
    public static function findOrCreateByName(string $name): self
    {
        $slug = Str::slug($name);
        
        return static::firstOrCreate(
            ['slug' => $slug],
            ['name' => $name]
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

    // Auto-generate slug
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($tag) {
            if (empty($tag->slug)) {
                $tag->slug = Str::slug($tag->name);
            }
        });

        static::updating(function ($tag) {
            if ($tag->isDirty('name') && empty($tag->slug)) {
                $tag->slug = Str::slug($tag->name);
            }
        });
    }
}