<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            if (!Schema::hasColumn('posts', 'title')) {
                $table->string('title')->after('id');
            }
            if (!Schema::hasColumn('posts', 'slug')) {
                $table->string('slug')->unique()->after('title');
            }
            if (!Schema::hasColumn('posts', 'content')) {
                $table->longText('content')->after('slug');
            }
            if (!Schema::hasColumn('posts', 'excerpt')) {
                $table->text('excerpt')->nullable()->after('content');
            }
            if (!Schema::hasColumn('posts', 'status')) {
                $table->enum('status', ['draft', 'published'])->default('draft')->after('excerpt');
            }
            if (!Schema::hasColumn('posts', 'user_id')) {
                $table->foreignId('user_id')->constrained()->onDelete('cascade')->after('status');
            }
        });
    }

    public function down(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->dropColumn(['title', 'slug', 'content', 'excerpt', 'status', 'user_id']);
        });
    }
};