<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class Category extends Model
{
    use HasFactory, SoftDeletes;

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
        'order' => 'integer',
    ];

    // FIXED: Removed posts_count from appends to prevent N+1 queries
    // Load it explicitly using withPostsCount() scope when needed
    // protected $appends = ['posts_count'];

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

    // Accessors
    // FIXED: Check if posts_count was eager loaded before querying
    public function getPostsCountAttribute(): int
    {
        // If posts_count was eager loaded via withCount(), use it
        if (array_key_exists('posts_count', $this->attributes)) {
            return (int) $this->attributes['posts_count'];
        }

        // Otherwise, query (but this should be avoided in loops)
        return $this->posts()->published()->count();
    }

    public function getUrlAttribute(): string
    {
        return route('categories.show', $this->slug);
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

    public function scopeWithPostsCount($query)
    {
        return $query->withCount(['posts' => function ($q) {
            $q->published();
        }]);
    }

    // Methods
    public function isParent(): bool
    {
        return $this->children()->exists();
    }

    public function hasChildren(): bool
    {
        return $this->children()->count() > 0;
    }

    public function getAncestors(): \Illuminate\Support\Collection
    {
        $ancestors = collect();
        $category = $this;
        $visited = collect([$this->id]); // Track visited to prevent infinite loops

        while ($category->parent) {
            // FIXED: Prevent infinite loops in case of data corruption
            if ($visited->contains($category->parent->id)) {
                \Log::error("Circular reference detected in category ancestors", [
                    'category_id' => $this->id,
                    'circular_id' => $category->parent->id
                ]);
                break;
            }

            $ancestors->push($category->parent);
            $visited->push($category->parent->id);
            $category = $category->parent;
        }

        return $ancestors->reverse();
    }

    // FIXED: Added depth limit and circular reference protection
    public function getDescendants(int $maxDepth = 10, int $currentDepth = 0): \Illuminate\Support\Collection
    {
        $descendants = collect();

        // Prevent infinite recursion
        if ($currentDepth >= $maxDepth) {
            \Log::warning("Max depth reached for category descendants", [
                'category_id' => $this->id,
                'max_depth' => $maxDepth
            ]);
            return $descendants;
        }

        foreach ($this->children as $child) {
            $descendants->push($child);
            $descendants = $descendants->merge(
                $child->getDescendants($maxDepth, $currentDepth + 1)
            );
        }

        return $descendants;
    }

    // NEW: Check if setting a parent would create a circular reference
    public function wouldCreateCircularReference(?int $newParentId): bool
    {
        if ($newParentId === null) {
            return false;
        }

        // Can't be its own parent
        if ($newParentId === $this->id) {
            return true;
        }

        // Check if the new parent is a descendant of this category
        $descendantIds = $this->getDescendants()->pluck('id');
        return $descendantIds->contains($newParentId);
    }

    // NEW: Validate parent assignment
    public function canSetParent(?int $parentId): bool
    {
        return !$this->wouldCreateCircularReference($parentId);
    }

    // NEW: Get full category path (breadcrumb)
    public function getPath(string $separator = ' > '): string
    {
        $ancestors = $this->getAncestors();
        $ancestors->push($this);
        return $ancestors->pluck('name')->implode($separator);
    }

    // NEW: Safe delete with transaction
    public function safeDelete(): bool
    {
        return DB::transaction(function () {
            // Check if category has posts
            if ($this->posts()->exists()) {
                throw new \Exception('Cannot delete category with existing posts. Please reassign or delete the posts first.');
            }

            // Move children to parent or root
            if ($this->hasChildren()) {
                $this->children()->update([
                    'parent_id' => $this->parent_id
                ]);
            }

            return $this->delete();
        });
    }

    // FIXED: Generate unique slug with incremental suffix
    protected function generateUniqueSlug(string $name, ?int $excludeId = null): string
    {
        $slug = Str::slug($name);
        $originalSlug = $slug;
        $counter = 1;

        while (true) {
            $query = static::where('slug', $slug);
            
            if ($excludeId) {
                $query->where('id', '!=', $excludeId);
            }

            if (!$query->exists()) {
                return $slug;
            }

            $slug = $originalSlug . '-' . $counter;
            $counter++;

            // Prevent infinite loop
            if ($counter > 1000) {
                throw new \Exception('Unable to generate unique slug');
            }
        }
    }

    // Auto-generate slug and validate
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($category) {
            // FIXED: Generate unique slug
            if (empty($category->slug)) {
                $category->slug = $category->generateUniqueSlug($category->name);
            }

            // Set default order if not provided
            if ($category->order === null) {
                $maxOrder = static::where('parent_id', $category->parent_id)
                    ->max('order') ?? 0;
                $category->order = $maxOrder + 1;
            }
        });

        static::updating(function ($category) {
            // FIXED: Generate unique slug on name change
            if ($category->isDirty('name') && !$category->isDirty('slug')) {
                $category->slug = $category->generateUniqueSlug(
                    $category->name,
                    $category->id
                );
            }

            // NEW: Validate parent assignment to prevent circular references
            if ($category->isDirty('parent_id')) {
                if (!$category->canSetParent($category->parent_id)) {
                    throw new \Exception('Setting this parent would create a circular reference');
                }
            }
        });

        // NEW: Cascade soft delete to descendants (optional)
        static::deleting(function ($category) {
            if ($category->isForceDeleting()) {
                // Force delete descendants
                foreach ($category->getDescendants() as $descendant) {
                    $descendant->forceDelete();
                }
            } else {
                // Soft delete descendants
                foreach ($category->getDescendants() as $descendant) {
                    $descendant->delete();
                }
            }
        });

        // NEW: Restore descendants when restoring
        static::restoring(function ($category) {
            foreach ($category->children()->onlyTrashed()->get() as $child) {
                $child->restore();
            }
        });
    }
}