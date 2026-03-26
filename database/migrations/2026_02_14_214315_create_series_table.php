<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('series', function (Blueprint $table) {
            $table->id();

            // ── Core fields ─────────────────────────────────────────────
            $table->string('title');
            $table->string('slug')->nullable(); // nullable for MongoDB-safe unique index
            $table->text('description')->nullable();
            $table->string('cover_image')->nullable();
            $table->foreignId('user_id')->nullable(); // MongoDB doesn't enforce FK
            $table->boolean('is_published')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->integer('posts_count')->default(0);
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->timestamps();

            // ── Indexes ───────────────────────────────────────────────
            $table->unique('slug', 'unique_slug', null, ['sparse' => true]);
            $table->index('user_id');
            $table->index('is_published');
            $table->index('is_featured');
        });

        // Pivot table for post-series relationship
        Schema::create('post_series', function (Blueprint $table) {
            $table->foreignId('post_id')->nullable();
            $table->foreignId('series_id')->nullable();
            $table->integer('order')->default(0); // Order within the series
            $table->timestamps();

            // Composite primary key alternative for MongoDB
            $table->unique(['post_id', 'series_id'], 'unique_post_series');

            $table->index('series_id');
            $table->index('order');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('post_series');
        Schema::dropIfExists('series');
    }
};