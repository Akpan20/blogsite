<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('posts', function (Blueprint $table) {

            // ── Core ──────────────────────────────────────────────────────
            $table->id();
            $table->foreignId('user_id')
                  ->constrained()
                  ->onDelete('cascade');
            $table->foreignId('category_id')
                  ->nullable()
                  ->constrained()
                  ->onDelete('set null');

            // ── Content ───────────────────────────────────────────────────
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('excerpt')->nullable();
            $table->longText('content');
            $table->integer('reading_time')->nullable();
            $table->string('template')->default('default');

            // ── Status & Publishing ───────────────────────────────────────
            $table->enum('status', ['draft', 'published', 'scheduled'])->default('draft');
            $table->boolean('published')->default(false);
            $table->timestamp('published_at')->nullable();
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamp('last_modified_at')->nullable();

            // ── Visibility flags ──────────────────────────────────────────
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_sticky')->default(false);
            $table->integer('featured_order')->default(0);

            // ── Premium ───────────────────────────────────────────────────
            $table->boolean('is_premium')->default(false);
            $table->string('premium_tier')->nullable();

            // ── SEO ───────────────────────────────────────────────────────
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->string('meta_keywords')->nullable();
            $table->string('canonical_url')->nullable();
            $table->string('og_image')->nullable();
            $table->boolean('index')->default(true);
            $table->boolean('follow')->default(true);

            // ── Media ─────────────────────────────────────────────────────
            $table->string('featured_image')->nullable();
            $table->string('featured_image_alt')->nullable();

            // ── Engagement counters ───────────────────────────────────────
            $table->unsignedInteger('views_count')->default(0);
            $table->unsignedInteger('likes_count')->default(0);
            $table->unsignedInteger('comments_count')->default(0);
            $table->unsignedInteger('shares_count')->default(0);

            $table->timestamps();

            // ── Indexes ───────────────────────────────────────────────────
            $table->index('status');
            $table->index('published');
            $table->index('user_id');
            $table->index('category_id');
            $table->index('is_featured');
            $table->index('is_sticky');
            $table->index('published_at');
            $table->index('scheduled_at');
            $table->index('views_count');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};