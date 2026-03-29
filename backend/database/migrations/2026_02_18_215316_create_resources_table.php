<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('resources', function (Blueprint $table) {
            $table->id();

            // ── Core fields ─────────────────────────────────────────────
            $table->string('title');
            $table->string('excerpt', 300)->nullable();
            $table->longText('content')->nullable();
            $table->string('category')->nullable();
            $table->string('icon')->default('BookOpen');
            $table->string('slug')->nullable(); // nullable to avoid unique index conflicts
            $table->boolean('is_published')->default(false);
            $table->timestamps();

            // ── Indexes ───────────────────────────────────────────────
            $table->unique('slug', 'unique_slug', null, ['sparse' => true]);
            $table->index('category');
            $table->index('is_published');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('resources');
    }
};