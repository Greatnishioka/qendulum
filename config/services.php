<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'arxiv' => [
        'url' => env('ARXIV_API_URL', 'https://export.arxiv.org/api/query'),
        'cache_ttl_seconds' => (int) env('ARXIV_CACHE_TTL_SECONDS', 600),
        'min_interval_seconds' => (int) env('ARXIV_MIN_INTERVAL_SECONDS', 3),
        'default_max_results' => (int) env('ARXIV_DEFAULT_MAX_RESULTS', 10),
    ],

];
