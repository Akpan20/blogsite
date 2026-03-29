<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Services\SubscriptionService;
use Symfony\Component\HttpFoundation\Response;

class CheckPremiumAccess
{
    public function __construct(
        private SubscriptionService $subscriptionService
    ) {}

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, string $tier = 'premium'): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Authentication required',
            ], 401);
        }

        if (!$this->subscriptionService->hasAccessToPremiumContent($user, $tier)) {
            return response()->json([
                'message' => 'Premium subscription required',
                'required_tier' => $tier,
            ], 403);
        }

        return $next($request);
    }
}