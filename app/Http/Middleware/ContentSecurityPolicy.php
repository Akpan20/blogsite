<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ContentSecurityPolicy
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Build CSP directives
        $directives = [
            "default-src 'self'",
            
            // Allow Paystack scripts and inline scripts
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.paystack.co https://*.paystack.co https://checkout.paystack.com",
            
            // Allow inline styles
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            
            // Allow images from any HTTPS source
            "img-src 'self' data: https: blob:",
            
            // Allow fonts
            "font-src 'self' data: https://fonts.gstatic.com",
            
            // Allow API connections to Paystack
            "connect-src 'self' https://api.paystack.co https://*.paystack.co ws: wss:",
            
            // Allow Paystack checkout iframe
            "frame-src 'self' https://checkout.paystack.com https://*.paystack.co",
            
            // Prevent loading plugins
            "object-src 'none'",
            
            // Restrict base URIs
            "base-uri 'self'",
            
            // Restrict form submissions
            "form-action 'self'",
            
            // Prevent being framed by other sites
            "frame-ancestors 'self'",
        ];

        // Add upgrade-insecure-requests in production
        if (config('app.env') === 'production') {
            $directives[] = 'upgrade-insecure-requests';
        }

        // Set CSP header
        $response->headers->set(
            'Content-Security-Policy',
            implode('; ', $directives)
        );

        // Additional security headers
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
        $response->headers->set('X-XSS-Protection', '1; mode=block');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');

        return $response;
    }
}