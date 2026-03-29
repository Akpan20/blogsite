<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->api(prepend: [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ]);

        // Register middleware aliases
        $middleware->alias([
            'premium' => \App\Http\Middleware\CheckPremiumAccess::class,
            'admin' => \App\Http\Middleware\CheckAdminAccess::class,
        ]);

        // Enable API throttling
        $middleware->throttleApi();
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (\Illuminate\Auth\AuthenticationException $e, \Illuminate\Http\Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }
        });
    })

    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->api(prepend: [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ]);

        $middleware->alias([
            'premium' => \App\Http\Middleware\CheckPremiumAccess::class,
            'admin'   => \App\Http\Middleware\CheckAdminAccess::class,
            'auth'    => \App\Http\Middleware\Authenticate::class,
        ]);

        $middleware->throttleApi();
    })

    ->withMiddleware(function (Middleware $middleware): void {

        // Trust Render's load balancer proxy
        $middleware->trustProxies(at: '*');

        $middleware->api(prepend: [
            \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        ]);

        $middleware->alias([
            'premium' => \App\Http\Middleware\CheckPremiumAccess::class,
            'admin'   => \App\Http\Middleware\CheckAdminAccess::class,
            'auth'    => \App\Http\Middleware\Authenticate::class,
        ]);

        $middleware->throttleApi();
    })

    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (\Illuminate\Auth\AuthenticationException $e, \Illuminate\Http\Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json(['message' => 'Unauthenticated.'], 401);
            }
        });

        // Temporary - log full trace for RuntimeException
        $exceptions->render(function (\RuntimeException $e, \Illuminate\Http\Request $request) {
            return response()->json([
                'message' => $e->getMessage(),
                'trace'   => collect($e->getTrace())->take(5)->map(fn($t) => [
                    'file' => $t['file'] ?? '',
                    'line' => $t['line'] ?? '',
                    'function' => $t['function'] ?? '',
                ]),
            ], 500);
        });
    })
    
    ->create();