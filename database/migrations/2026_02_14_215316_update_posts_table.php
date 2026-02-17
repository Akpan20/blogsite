<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            // Category relationship
            if (!Schema::hasColumn('posts', 'category_id')) {
                $table->foreignId('category_id')->nullable()->after('user_id')->constrained()->onDelete('set null');
            }
            
            // Content organization
            if (!Schema::hasColumn('posts', 'is_featured')) {
                $table->boolean('is_featured')->default(false)->after('status');
            }
            if (!Schema::hasColumn('posts', 'is_sticky')) {
                $table->boolean('is_sticky')->default(false)->after('is_featured');
            }
            if (!Schema::hasColumn('posts', 'featured_order')) {
                $table->integer('featured_order')->default(0)->after('is_sticky');
            }
            
            // Reading time
            if (!Schema::hasColumn('posts', 'reading_time')) {
                $table->integer('reading_time')->nullable()->after('content');
            }
            
            // Engagement tracking (views_count already exists, skip it)
            if (!Schema::hasColumn('posts', 'likes_count')) {
                $table->integer('likes_count')->default(0);
            }
            if (!Schema::hasColumn('posts', 'comments_count')) {
                $table->integer('comments_count')->default(0);
            }
            if (!Schema::hasColumn('posts', 'shares_count')) {
                $table->integer('shares_count')->default(0);
            }
            
            // SEO
            if (!Schema::hasColumn('posts', 'meta_title')) {
                $table->string('meta_title')->nullable();
            }
            if (!Schema::hasColumn('posts', 'meta_description')) {
                $table->text('meta_description')->nullable();
            }
            if (!Schema::hasColumn('posts', 'meta_keywords')) {
                $table->string('meta_keywords')->nullable();
            }
            if (!Schema::hasColumn('posts', 'canonical_url')) {
                $table->string('canonical_url')->nullable();
            }
            
            // Featured image
            if (!Schema::hasColumn('posts', 'featured_image')) {
                $table->string('featured_image')->nullable();
            }
            if (!Schema::hasColumn('posts', 'featured_image_alt')) {
                $table->string('featured_image_alt')->nullable();
            }
            
            // Publishing
            if (!Schema::hasColumn('posts', 'scheduled_at')) {
                $table->timestamp('scheduled_at')->nullable();
            }
            if (!Schema::hasColumn('posts', 'last_modified_at')) {
                $table->timestamp('last_modified_at')->nullable();
            }
            
            // Template
            if (!Schema::hasColumn('posts', 'template')) {
                $table->string('template')->default('default');
            }
        });
    }

    public function down(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            if (Schema::hasColumn('posts', 'category_id')) {
                $table->dropForeign(['category_id']);
            }
            
            $columns = [
                'category_id', 'is_featured', 'is_sticky', 'featured_order',
                'reading_time', 'likes_count', 'comments_count',
                'shares_count', 'meta_title', 'meta_description', 'meta_keywords',
                'canonical_url', 'featured_image', 'featured_image_alt',
                'scheduled_at', 'last_modified_at', 'template',
            ];

            foreach ($columns as $column) {
                if (Schema::hasColumn('posts', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};