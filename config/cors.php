<?php

return [

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
        // Local development
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:8000',
        'http://127.0.0.1:8000',

        // Production
        'https://blogsite-rh5v.onrender.com',
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [
        'Authorization',
        'Content-Type',
        'X-Requested-With',
        'X-XSRF-TOKEN',              // ← add this, Sanctum needs it exposed
    ],

    'max_age' => 86400,              // cache preflight for 24h, reduces OPTIONS requests

    'supports_credentials' => true,

];