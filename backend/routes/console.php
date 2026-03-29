<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Services\SubscriptionService;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule subscription renewals daily
Schedule::call(function (SubscriptionService $subscriptionService) {
    $subscriptionService->renewExpiringSubscriptions();
})->daily()->name('renew-expiring-subscriptions');

// Send expiry reminders every day at 9 AM
Schedule::call(function (SubscriptionService $subscriptionService) {
    $subscriptionService->sendExpiryReminders();
})->dailyAt('09:00')->name('send-expiry-reminders');