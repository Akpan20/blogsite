<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;
use MongoDB\Laravel\Relations\BelongsTo;
use MongoDB\Laravel\Relations\HasMany;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\SoftDeletes;

class Category extends Model
{
    use SoftDeletes;

    protected $connection = 'mongodb';
    protected $collection = 'categories';    

    protected $fillable = [
        'name',
        'slug',
        'description',
        'color',
        'icon',
        'parent_id',
        'order',
        'is_featured',
        'meta_title',
        'meta_description',
    ];

    protected $casts = [
        'is_featured' => 'boolean',
        'order'       => 'integer',
    ];

    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Category::class, 'parent_id')->orderBy('order');
    }

    public function getPostsCountAttribute(): int
    {
        return $this->posts()->where('status', 'published')->count();
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('order')->orderBy('name');
    }

    public function scopeRoot($query)
    {
        return $query->whereNull('parent_id');
    }

    public function hasChildren(): bool
    {
        return $this->children()->count() > 0;
    }

    public function getAncestors(): \Illuminate\Support\Collection
    {
        $ancestors = collect();
        $category  = $this;
        $visited   = collect([$this->id]);

        while ($category->parent) {
            if ($visited->contains($category->parent->id)) break;
            $ancestors->push($category->parent);
            $visited->push($category->parent->id);
            $category = $category->parent;
        }

        return $ancestors->reverse();
    }

    public function getDescendants(int $maxDepth = 10, int $currentDepth = 0): \Illuminate\Support\Collection
    {
        $descendants = collect();

        if ($currentDepth >= $maxDepth) return $descendants;

        foreach ($this->children as $child) {
            $descendants->push($child);
            $descendants = $descendants->merge(
                $child->getDescendants($maxDepth, $currentDepth + 1)
            );
        }

        return $descendants;
    }

    public function wouldCreateCircularReference(?string $newParentId): bool
    {
        if ($newParentId === null) return false;
        if ($newParentId === (string) $this->id) return true;

        $descendantIds = $this->getDescendants()->pluck('id')->map(fn($id) => (string) $id);
        return $descendantIds->contains((string) $newParentId);
    }

    protected function generateUniqueSlug(string $name, ?string $excludeId = null): string
    {
        $slug         = Str::slug($name);
        $originalSlug = $slug;
        $counter      = 1;

        while (true) {
            $query = static::where('slug', $slug);
            if ($excludeId) $query->where('_id', '!=', $excludeId);
            if (!$query->exists()) return $slug;

            $slug = $originalSlug . '-' . $counter++;
            if ($counter > 1000) throw new \Exception('Unable to generate unique slug');
        }
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($category) {
            if (empty($category->slug)) {
                $category->slug = $category->generateUniqueSlug($category->name);
            }
            if ($category->order === null) {
                $maxOrder       = static::where('parent_id', $category->parent_id)->max('order') ?? 0;
                $category->order = $maxOrder + 1;
            }
        });

        static::updating(function ($category) {
            if ($category->isDirty('name') && !$category->isDirty('slug')) {
                $category->slug = $category->generateUniqueSlug($category->name, $category->id);
            }
            if ($category->isDirty('parent_id') && $category->wouldCreateCircularReference($category->parent_id)) {
                throw new \Exception('Setting this parent would create a circular reference');
            }
        });

        static::deleting(function ($category) {
            foreach ($category->getDescendants() as $descendant) {
                $descendant->delete();
            }
        });
    }
}