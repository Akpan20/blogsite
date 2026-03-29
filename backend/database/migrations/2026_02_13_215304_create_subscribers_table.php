<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('newsletter_subscribers', function (Blueprint $table) {
            $table->id();

            // ── Core fields ─────────────────────────────────────────────
            $table->string('email')->nullable();
            $table->string('token')->nullable();

            // ── Status & confirmation ───────────────────────────────────
            $table->boolean('is_confirmed')->default(false);
            $table->timestamp('confirmed_at')->nullable();
            $table->string('status')->default('active'); // active, unsubscribed

            // ── Tracking ───────────────────────────────────────────────
            $table->ipAddress('ip_address')->nullable();
            $table->string('source')->nullable(); // footer, popup, post
            $table->json('preferences')->nullable();

            $table->timestamps();

            // ── Indexes ───────────────────────────────────────────────
            // Sparse unique indexes to avoid conflicts with nullable fields
            $table->unique('email', 'unique_email', null, ['sparse' => true]);
            $table->unique('token', 'unique_token', null, ['sparse' => true]);

            // Additional normal indexes
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('newsletter_subscribers');
    }
};