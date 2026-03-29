<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();

            // ── Core fields ─────────────────────────────────────────────
            $table->string('name');
            $table->string('slug')->nullable(); // nullable for MongoDB-safe unique index
            $table->text('description')->nullable();
            $table->string('color', 7)->default('#3B82F6');
            $table->string('icon')->nullable();
            $table->foreignId('parent_id')->nullable(); // MongoDB doesn't enforce FKs
            $table->integer('order')->default(0);
            $table->boolean('is_featured')->default(false);
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->softDeletes();
            $table->timestamps();

            // ── Indexes ───────────────────────────────────────────────
            // Unique slug index (sparse to allow null)
            $table->unique('slug', 'unique_slug', null, ['sparse' => true]);

            // Other useful indexes
            $table->index('parent_id');
            $table->index('is_featured');
            $table->index(['is_featured', 'order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};