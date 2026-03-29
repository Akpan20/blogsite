<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SubscriptionPlan;

class SubscriptionPlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Free',
                'slug' => 'free',
                'description' => 'Basic access to our content',
                'price' => 0,
                'billing_period' => 'monthly',
                'features' => [
                    'Access to free articles',
                    'Basic commenting',
                    'Community access',
                ],
                'max_premium_posts' => 0,
                'is_active' => true,
                'is_featured' => false,
                'sort_order' => 1,
            ],
            [
                'name' => 'Premium',
                'slug' => 'premium',
                'description' => 'Full access to all premium content',
                'price' => 2500,
                'billing_period' => 'monthly',
                'features' => [
                    'Unlimited premium articles',
                    'Ad-free experience',
                    'Priority commenting',
                    'Exclusive newsletters',
                    'Early access to new content',
                ],
                'max_premium_posts' => null,
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'Pro',
                'slug' => 'pro',
                'description' => 'Everything in Premium plus exclusive benefits',
                'price' => 5000,
                'billing_period' => 'monthly',
                'features' => [
                    'All Premium features',
                    'Direct messaging with authors',
                    'Exclusive webinars and events',
                    'Downloadable resources',
                    'Pro member badge',
                    'Voting on future content',
                ],
                'max_premium_posts' => null,
                'is_active' => true,
                'is_featured' => false,
                'sort_order' => 3,
            ],
            [
                'name' => 'Premium Yearly',
                'slug' => 'premium-yearly',
                'description' => 'Premium plan with 20% savings',
                'price' => 24000, // 2 months free
                'billing_period' => 'yearly',
                'features' => [
                    'All Premium features',
                    '2 months free (save 20%)',
                    'Annual content summary report',
                ],
                'max_premium_posts' => null,
                'is_active' => true,
                'is_featured' => false,
                'sort_order' => 4,
            ],
        ];

        foreach ($plans as $plan) {
            SubscriptionPlan::updateOrCreate(
                ['slug' => $plan['slug']],
                $plan
            );
        }

        $this->command->info('Subscription plans seeded successfully!');
    }
}