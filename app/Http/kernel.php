'api' => [
    \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
    'throttle:api',           // 60/min global
    'throttle:api.strict',    // 10/min strict
    \Illuminate\Routing\Middleware\SubstituteBindings::class,
    'premium' => \App\Http\Middleware\CheckPremiumAccess::class,
    \App\Http\Middleware\ContentSecurityPolicy::class,
],