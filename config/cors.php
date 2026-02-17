<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => [
        'api/*',
        'sanctum/csrf-cookie',
        'login',
        'logout',
        'register',
        'password/*',
        'email/*',
        'user',
        'projects',
        'projects/*',
        'contact',
    ],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://localhost:3000',      // React dev server
        'http://localhost:3001',      // Alternative React port
        'http://127.0.0.1:3000',      // Alternative localhost
        'http://localhost:8000',      // Laravel serve
        'http://127.0.0.1:8000',      // Alternative Laravel
    ],

    'allowed_origins_patterns' => [
        // Add patterns if you need wildcard support
        // '/^http:\/\/localhost:\d+$/', // Any localhost port
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [
        'Authorization',
        'Content-Type',
        'X-Requested-With',
    ],

    'max_age' => 0,

    'supports_credentials' => true, // Important for cookies/sessions

];