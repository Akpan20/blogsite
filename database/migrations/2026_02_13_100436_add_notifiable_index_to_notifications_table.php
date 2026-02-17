<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // For SQLite: just try to add the index – it will silently ignore if it already exists (SQLite behavior)
        // Or use try-catch for safety
        try {
            Schema::table('notifications', function (Blueprint $table) {
                $table->index(['notifiable_type', 'notifiable_id'], 'notifications_notifiable_type_notifiable_id_index');
            });
        } catch (\Illuminate\Database\QueryException $e) {
            // Ignore if the error is "index already exists" (SQLite error code 1 + message match)
            if (str_contains($e->getMessage(), 'index') && str_contains($e->getMessage(), 'already exists')) {
                // Index already there – safe to continue
            } else {
                throw $e; // re-throw other real errors
            }
        }
    }

    public function down(): void
    {
        Schema::table('notifications', function (Blueprint $table) {
            $table->dropIndex('notifications_notifiable_type_notifiable_id_index');
        });
    }
};