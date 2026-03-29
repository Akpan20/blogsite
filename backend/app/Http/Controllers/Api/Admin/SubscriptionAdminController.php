<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionPlan;
use App\Services\SubscriptionService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

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
        // Handle unique validation for MongoDB
        $uniqueRule = Rule::unique('subscription_plans', 'slug');
        
        if ($request->id && $request->id !== 'null') {
            // For updates, ignore the current record
            $uniqueRule->ignore($request->id, '_id');
        }
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => ['required', 'string', $uniqueRule],
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'billing_period' => 'required|in:monthly,yearly,lifetime',
            'features' => 'nullable|array',
            'max_premium_posts' => 'nullable|integer',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'sort_order' => 'nullable|integer',
        ]);

        // Handle MongoDB document
        if ($request->id && $request->id !== 'null') {
            // Update existing plan - use the model's find method which handles MongoDB IDs
            $plan = SubscriptionPlan::find($request->id);
            
            if ($plan) {
                $plan->update($validated);
            } else {
                return response()->json(['message' => 'Plan not found'], 404);
            }
        } else {
            // Create new plan
            $plan = SubscriptionPlan::create($validated);
        }

        // Convert MongoDB document to array with string ID
        $planData = $plan->toArray();
        $planData['id'] = (string) $plan->_id;

        return response()->json([
            'message' => 'Subscription plan saved successfully',
            'plan' => $planData,
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

        // Convert MongoDB documents to array with string IDs
        $plansArray = $plans->map(function ($plan) {
            $planData = $plan->toArray();
            $planData['id'] = (string) $plan->_id;
            return $planData;
        });

        return response()->json($plansArray);
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

        // For MongoDB, use paginate method which is supported by jenssegers/mongodb
        $perPage = $request->get('per_page', 50);
        $transactions = $query->with(['user:id,name,email', 'subscription.plan:id,name'])
            ->orderBy('paid_at', 'desc')
            ->paginate($perPage);

        $totalRevenue = $query->sum('amount');

        // Convert transactions to array with string IDs while preserving pagination structure
        $transactions->getCollection()->transform(function ($transaction) {
            $transactionData = $transaction->toArray();
            $transactionData['id'] = (string) $transaction->_id;
            
            // Handle nested MongoDB IDs
            if (isset($transactionData['user']) && isset($transactionData['user']['_id'])) {
                $transactionData['user']['id'] = (string) $transactionData['user']['_id'];
                unset($transactionData['user']['_id']);
            }
            
            if (isset($transactionData['subscription']) && isset($transactionData['subscription']['_id'])) {
                $transactionData['subscription']['id'] = (string) $transactionData['subscription']['_id'];
                unset($transactionData['subscription']['_id']);
            }
            
            if (isset($transactionData['subscription']['plan']) && isset($transactionData['subscription']['plan']['_id'])) {
                $transactionData['subscription']['plan']['id'] = (string) $transactionData['subscription']['plan']['_id'];
                unset($transactionData['subscription']['plan']['_id']);
            }
            
            return $transactionData;
        });

        return response()->json([
            'transactions' => $transactions,
            'total_revenue' => $totalRevenue,
        ]);
    }
}