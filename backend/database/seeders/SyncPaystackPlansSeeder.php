<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\SubscriptionPlan;

class SyncPaystackPlansSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Free',
                'slug' => 'free',
                'description' => 'Basic access to public content',
                'price' => 0,
                'billing_period' => 'lifetime',
                'paystack_plan_code' => null,
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
                'name' => 'Basic Monthly',
                'slug' => 'basic-monthly',
                'description' => 'Monthly access to premium content',
                'price' => 2000,
                'billing_period' => 'monthly',
                'paystack_plan_code' => 'PLN_v1ntiglqjgxitzu',
                'features' => [
                    'All free features',
                    'Access to premium articles',
                    'Ad-free experience',
                    'Priority support',
                ],
                'max_premium_posts' => null,
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'Premium',
                'slug' => 'premium',
                'description' => 'Monthly premium subscription',
                'price' => 2500,
                'billing_period' => 'monthly',
                'paystack_plan_code' => 'PLN_rj3izat8c420sx1',
                'features' => [
                    'All free features',
                    'Unlimited premium articles',
                    'Ad-free experience',
                    'Early access to content',
                    'Download articles',
                ],
                'max_premium_posts' => null,
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 3,
            ],
            [
                'name' => 'Pro',
                'slug' => 'pro',
                'description' => 'Annual Pro subscription with best value',
                'price' => 5000,
                'billing_period' => 'yearly',
                'paystack_plan_code' => 'PLN_4341n37k40rwhg6',
                'features' => [
                    'All premium features',
                    'Exclusive content',
                    'Direct messaging',
                    'Monthly Q&A sessions',
                    'Priority email support',
                ],
                'max_premium_posts' => null,
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 4,
            ],
            [
                'name' => 'Pro Yearly',
                'slug' => 'pro-yearly',
                'description' => 'Premium annual subscription - Save big!',
                'price' => 15000,
                'billing_period' => 'yearly',
                'paystack_plan_code' => 'PLN_zpqsx4br25pufqe',
                'features' => [
                    'All Pro features',
                    'Exclusive annual content',
                    'VIP support',
                    'Quarterly webinars',
                    'Save 50% vs monthly premium',
                ],
                'max_premium_posts' => null,
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 5,
            ],
            [
                'name' => 'Premium Yearly',
                'slug' => 'premium-yearly',
                'description' => 'Ultimate annual plan with maximum value',
                'price' => 24000,
                'billing_period' => 'yearly',
                'paystack_plan_code' => 'PLN_zuw8nlhh5bqftik',
                'features' => [
                    'Everything in Pro Yearly',
                    'Lifetime archive access',
                    '1-on-1 monthly calls',
                    'Exclusive masterclasses',
                    'Certificate of completion',
                    'Save 20% vs Pro Yearly',
                ],
                'max_premium_posts' => null,
                'is_active' => true,
                'is_featured' => true,
                'sort_order' => 6,
            ],
        ];

        foreach ($plans as $planData) {
            SubscriptionPlan::updateOrCreate(
                ['slug' => $planData['slug']],
                $planData
            );
        }

        $this->command->info('✓ Plans synced with Paystack successfully');
        $this->command->newLine();
        $this->command->info('📊 Plan Summary:');
        $this->command->info('  • Free: ₦0 (lifetime)');
        $this->command->info('  • Basic Monthly: ₦2,000/month');
        $this->command->info('  • Premium: ₦2,500/month');
        $this->command->info('  • Pro: ₦5,000/year');
        $this->command->info('  • Pro Yearly: ₦15,000/year');
        $this->command->info('  • Premium Yearly: ₦24,000/year');
    }
}