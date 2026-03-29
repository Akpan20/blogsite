<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('subscription_id')->nullable()->constrained();
            $table->string('reference')->unique();
            $table->integer('amount');          // stored in kobo (e.g., 150000 = ₦1,500)
            $table->string('currency', 3)->default('NGN');
            $table->string('status');           // 'success', 'failed', 'pending'
            $table->timestamp('paid_at');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('payments');
    }
};