<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── Tags table ───────────────────────────────────────────────
        Schema::create('tags', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->nullable(); // nullable for MongoDB-safe unique index
            $table->text('description')->nullable();
            $table->string('color', 7)->default('#10B981'); // Hex color for UI
            $table->timestamps();

            // Unique index for slug
            $table->unique('slug', 'unique_slug', null, ['sparse' => true]);
        });

        // ── Pivot table for post-tag relationship ─────────────────────
        Schema::create('post_tag', function (Blueprint $table) {
            $table->foreignId('post_id')->nullable();
            $table->foreignId('tag_id')->nullable();
            $table->timestamps();

            // Composite uniqueness replacement for MongoDB
            $table->unique(['post_id', 'tag_id'], 'unique_post_tag');

            $table->index('tag_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('post_tag');
        Schema::dropIfExists('tags');
    }
};