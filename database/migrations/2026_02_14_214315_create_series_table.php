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
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('cover_image')->nullable();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->boolean('is_published')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->integer('posts_count')->default(0);
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->timestamps();
            
            $table->index('slug');
            $table->index('user_id');
            $table->index('is_published');
            $table->index('is_featured');
        });

        // Pivot table for post-series relationship
        Schema::create('post_series', function (Blueprint $table) {
            $table->foreignId('post_id')->constrained()->onDelete('cascade');
            $table->foreignId('series_id')->constrained()->onDelete('cascade');
            $table->integer('order')->default(0); // Order within the series
            $table->timestamps();
            
            $table->primary(['post_id', 'series_id']);
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