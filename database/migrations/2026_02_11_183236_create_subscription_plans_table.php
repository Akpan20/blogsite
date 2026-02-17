<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subscription_plans', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Free, Premium, Pro
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2)->default(0);
            $table->enum('billing_period', ['monthly', 'yearly', 'lifetime'])->default('monthly');
            $table->json('features')->nullable(); // Array of features
            $table->integer('max_premium_posts')->nullable(); // null = unlimited
            $table->boolean('is_active')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('user_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('subscription_plan_id')->constrained()->onDelete('cascade');
            $table->string('payment_reference')->unique()->nullable();
            $table->string('payment_status')->default('pending'); // pending, completed, failed, cancelled
            $table->decimal('amount_paid', 10, 2);
            $table->timestamp('starts_at');
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->boolean('auto_renew')->default(true);
            $table->json('payment_metadata')->nullable();
            $table->timestamps();
            
            $table->index(['user_id', 'expires_at']);
        });

        Schema::create('payment_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_subscription_id')->nullable()->constrained()->onDelete('set null');
            $table->string('reference')->unique();
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3)->default('NGN');
            $table->string('status'); // pending, success, failed
            $table->string('payment_method')->nullable(); // card, bank_transfer, etc.
            $table->string('gateway')->default('paystack');
            $table->json('gateway_response')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });

        // Add premium flag to posts
        Schema::table('posts', function (Blueprint $table) {
            $table->boolean('is_premium')->default(false)->after('published_at');
            $table->enum('premium_tier', ['free', 'premium', 'pro'])->default('free')->after('is_premium');
        });
    }

    public function down(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->dropColumn(['is_premium', 'premium_tier']);
        });
        
        Schema::dropIfExists('payment_transactions');
        Schema::dropIfExists('user_subscriptions');
        Schema::dropIfExists('subscription_plans');
    }
};