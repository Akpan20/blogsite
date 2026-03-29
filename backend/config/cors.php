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
        'http://localhost:5173',
        'http://localhost:5174',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:5174',
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
        'X-XSRF-TOKEN',
    ],

    'max_age' => 86400,

    'supports_credentials' => true,

];