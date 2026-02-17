<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionPlan;
use App\Services\SubscriptionService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SubscriptionAdminController extends Controller
{
    public function __construct(
        private SubscriptionService $subscriptionService
    ) {
        $this->middleware('admin');
    }

    /**
     * Get subscription analytics
     */
    public function analytics(): JsonResponse
    {
        $analytics = $this->subscriptionService->getSubscriptionAnalytics();

        return response()->json($analytics);
    }

    /**
     * Create or update subscription plan
     */
    public function storePlan(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|unique:subscription_plans,slug,' . $request->id,
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'billing_period' => 'required|in:monthly,yearly,lifetime',
            'features' => 'nullable|array',
            'max_premium_posts' => 'nullable|integer',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'sort_order' => 'nullable|integer',
        ]);

        $plan = SubscriptionPlan::updateOrCreate(
            ['id' => $request->id],
            $validated
        );

        return response()->json([
            'message' => 'Subscription plan saved successfully',
            'plan' => $plan,
        ]);
    }

    /**
     * Delete subscription plan
     */
    public function deletePlan(SubscriptionPlan $plan): JsonResponse
    {
        // Check if plan has active subscriptions
        $activeCount = $plan->activeSubscriptions()->count();
        
        if ($activeCount > 0) {
            return response()->json([
                'message' => "Cannot delete plan with {$activeCount} active subscriptions",
            ], 400);
        }

        $plan->delete();

        return response()->json([
            'message' => 'Subscription plan deleted successfully',
        ]);
    }

    /**
     * Get all plans (including inactive)
     */
    public function allPlans(): JsonResponse
    {
        $plans = SubscriptionPlan::withCount('activeSubscriptions')
            ->orderBy('sort_order')
            ->orderBy('price')
            ->get();

        return response()->json($plans);
    }

    /**
     * Get revenue report
     */
    public function revenueReport(Request $request): JsonResponse
    {
        $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        $query = \App\Models\PaymentTransaction::where('status', 'success');

        if ($request->start_date) {
            $query->whereDate('paid_at', '>=', $request->start_date);
        }

        if ($request->end_date) {
            $query->whereDate('paid_at', '<=', $request->end_date);
        }

        $transactions = $query->with(['user:id,name,email', 'subscription.plan:id,name'])
            ->orderBy('paid_at', 'desc')
            ->paginate(50);

        $totalRevenue = $query->sum('amount');

        return response()->json([
            'transactions' => $transactions,
            'total_revenue' => $totalRevenue,
        ]);
    }
}