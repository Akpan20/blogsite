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
        'posts_count', // 🔥 persisted counter
    ];

    protected $attributes = [
        'posts_count' => 0,
    ];

    protected $casts = [
        'is_featured' => 'boolean',
        'order'       => 'integer',
    ];

    // Relationships
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

    // Scopes
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

    // Utility Methods
    public function canSetParent(?string $parentId): bool
    {
        return !$this->wouldCreateCircularReference($parentId);
    }

    public function wouldCreateCircularReference(?string $newParentId): bool
    {
        if ($newParentId === null) return false;
        if ($newParentId === (string) $this->_id) return true;

        $descendantIds = $this->getDescendants()->pluck('_id')->map(fn($id) => (string) $id);
        return $descendantIds->contains((string) $newParentId);
    }

    public function getDescendants(int $maxDepth = 10, int $depth = 0)
    {
        if ($depth >= $maxDepth) return collect();

        return $this->children->flatMap(function ($child) use ($maxDepth, $depth) {
            return collect([$child])->merge(
                $child->getDescendants($maxDepth, $depth + 1)
            );
        });
    }

    protected function generateUniqueSlug(string $name, ?string $excludeId = null): string
    {
        $slug = Str::slug($name);
        $original = $slug;
        $counter = 1;

        while (true) {
            $query = static::where('slug', $slug);
            if ($excludeId) {
                $query->where('_id', '!=', $excludeId);
            }

            if (!$query->exists()) return $slug;

            $slug = $original . '-' . $counter++;
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
                $maxOrder = static::where('parent_id', $category->parent_id)->max('order') ?? 0;
                $category->order = $maxOrder + 1;
            }
        });

        static::updating(function ($category) {
            if ($category->isDirty('name') && !$category->isDirty('slug')) {
                $category->slug = $category->generateUniqueSlug(
                    $category->name,
                    (string) $category->_id
                );
            }

            if ($category->isDirty('parent_id') &&
                $category->wouldCreateCircularReference($category->parent_id)) {
                throw new \Exception('Circular reference detected');
            }
        });

        static::deleting(function ($category) {
            foreach ($category->getDescendants() as $descendant) {
                $descendant->delete();
            }
        });
    }
}