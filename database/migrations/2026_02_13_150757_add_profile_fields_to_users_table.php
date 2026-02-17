<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'username')) {
                $table->string('username')->unique()->nullable()->after('email');
            }
            if (!Schema::hasColumn('users', 'bio')) {
                $table->text('bio')->nullable()->after('username');
            }
            if (!Schema::hasColumn('users', 'avatar')) {
                $table->string('avatar')->nullable()->after('bio');
            }
            if (!Schema::hasColumn('users', 'location')) {
                $table->string('location')->nullable()->after('avatar');
            }
            if (!Schema::hasColumn('users', 'website')) {
                $table->string('website')->nullable()->after('location');
            }
            if (!Schema::hasColumn('users', 'twitter')) {
                $table->string('twitter')->nullable()->after('website');
            }
            if (!Schema::hasColumn('users', 'github')) {
                $table->string('github')->nullable()->after('twitter');
            }
            if (!Schema::hasColumn('users', 'linkedin')) {
                $table->string('linkedin')->nullable()->after('github');
            }
            if (!Schema::hasColumn('users', 'reputation_points')) {
                $table->integer('reputation_points')->default(0)->after('linkedin');
            }
            if (!Schema::hasColumn('users', 'is_online')) {
                $table->boolean('is_online')->default(false)->after('reputation_points');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'username', 'bio', 'avatar', 'location', 'website',
                'twitter', 'github', 'linkedin', 'reputation_points', 'is_online'
            ]);
        });
    }
};