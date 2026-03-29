<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('comments', function (Blueprint $table) {
            $table->id();

            // Allow NULL for guest comments
            $table->foreignId('user_id')
                  ->nullable()                          // ← Key change: nullable
                  ->constrained('users')
                  ->onDelete('cascade');

            $table->foreignId('post_id')
                  ->constrained('posts')
                  ->onDelete('cascade');

            $table->foreignId('parent_id')
                  ->nullable()
                  ->constrained('comments')
                  ->onDelete('cascade');

            $table->text('content');

            // Guest-specific fields (optional but recommended)
            $table->string('name')->nullable();           // Guest name
            $table->string('email')->nullable();          // Guest email (optional)

            $table->boolean('is_edited')->default(false);
            $table->timestamp('edited_at')->nullable();

            $table->boolean('approved')->default(false);  // For moderation if needed

            $table->timestamps();
            $table->softDeletes();

            $table->index(['post_id', 'created_at']);
            $table->index('parent_id');
        });

        Schema::create('comment_reactions', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                  ->constrained('users')
                  ->onDelete('cascade');

            $table->foreignId('comment_id')
                  ->constrained('comments')
                  ->onDelete('cascade');

            $table->string('type'); // like, love, laugh, wow, sad, angry

            $table->timestamps();

            $table->unique(['user_id', 'comment_id']);
            $table->index('comment_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('comment_reactions');
        Schema::dropIfExists('comments');
    }
};