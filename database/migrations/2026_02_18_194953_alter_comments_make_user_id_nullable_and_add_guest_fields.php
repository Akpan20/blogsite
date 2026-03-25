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
            $table->foreignId('user_id')
                  ->nullable()
                  ->change();

            // Add guest fields if they don't exist
            if (!Schema::hasColumn('comments', 'name')) {
                $table->string('name')->nullable()->after('content');
            }
            if (!Schema::hasColumn('comments', 'email')) {
                $table->string('email')->nullable()->after('name');
            }
            if (!Schema::hasColumn('comments', 'approved')) {
                $table->boolean('approved')->default(false)->after('email');
            }
        });
    }

    public function down(): void
    {
        Schema::table('comments', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable(false)->change();

            // Optional: drop added columns if needed
            $table->dropColumn(['name', 'email', 'approved']);
        });
    }
};