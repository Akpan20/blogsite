<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('comments', function (Blueprint $table) {
            // Make user_id nullable
            $table->foreignId('user_id')->nullable()->change();

            // Add guest fields if they don't exist
            if (!Schema::hasColumn('comments', 'name')) {
                $table->string('name')->nullable();
            }
            if (!Schema::hasColumn('comments', 'email')) {
                $table->string('email')->nullable();
            }
            if (!Schema::hasColumn('comments', 'approved')) {
                $table->boolean('approved')->default(false);
            }

            // Optional: add index on approved for faster moderation queries
            if (!Schema::hasColumn('comments', 'approved')) {
                $table->index('approved');
            }
        });
    }

    public function down(): void
    {
        Schema::table('comments', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable(false)->change();

            $columns = ['name', 'email', 'approved'];
            foreach ($columns as $column) {
                if (Schema::hasColumn('comments', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};