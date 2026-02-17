<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->string('meta_title')->nullable()->after('title');
            $table->text('meta_description')->nullable()->after('meta_title');
            $table->string('meta_keywords')->nullable()->after('meta_description');
            $table->string('og_image')->nullable()->after('meta_keywords');
            $table->string('canonical_url')->nullable()->after('og_image');
            $table->boolean('index')->default(true)->after('canonical_url');
            $table->boolean('follow')->default(true)->after('index');
            $table->integer('views_count')->default(0)->after('follow');
            
            $table->index('views_count');
        });
    }

    public function down(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->dropColumn([
                'meta_title',
                'meta_description',
                'meta_keywords',
                'og_image',
                'canonical_url',
                'index',
                'follow',
                'views_count',
            ]);
        });
    }
};