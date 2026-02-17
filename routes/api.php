<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SubscriptionController;
use App\Http\Controllers\Api\PaystackWebhookController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\EarningsController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\NewsletterController;
use App\Http\Controllers\Api\SEOController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\FollowController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\ActivityController;
use App\Http\Controllers\Api\BadgeController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\Api\Admin\SubscriptionAdminController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\TagController;
use App\Http\Controllers\Api\SeriesController;

// ────────────────────────────────────────────────
// PUBLIC ROUTES (No Authentication)
// ────────────────────────────────────────────────

// Authentication
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/login', fn() => response()->json(['message' => 'Unauthenticated.'], 401))->name('login');

// Posts
Route::middleware('auth:sanctum')->group(function () {
    Route::get('posts', [PostController::class, 'index']);
    Route::get('/posts/check-slug', [PostController::class, 'checkSlug']);
    Route::get('posts/trending', [PostController::class, 'trending']);
    Route::post('posts/featured/reorder', [PostController::class, 'reorderFeatured']);
    Route::get('posts/{post}', [PostController::class, 'show'])->name('posts.show');
    Route::get('posts/{post}/related', [PostController::class, 'related']);
    Route::get('posts/{post}/meta', [SEOController::class, 'getPostMeta']);
    Route::post('posts/{post}/track-view', [SEOController::class, 'trackView']);
});

// Comments
Route::post('comments/guest', [CommentController::class, 'guestStore']);

// Subscriptions
Route::get('subscription/plans', [SubscriptionController::class, 'plans']);
Route::get('subscription/paystack-config', [SubscriptionController::class, 'paystackConfig']);
Route::post('subscription/webhook', [SubscriptionController::class, 'webhook']);

// Search
Route::get('search', [SearchController::class, 'search']);
Route::get('search/suggestions', [SearchController::class, 'suggestions']);
Route::get('search/popular', [SearchController::class, 'popular']);

// SEO
Route::get('sitemap.xml', [SEOController::class, 'sitemap']);
Route::get('robots.txt', [SEOController::class, 'robots']);

// Newsletter
Route::post('newsletter/subscribe', [NewsletterController::class, 'subscribe']);
Route::get('newsletter/confirm/{token}', [NewsletterController::class, 'confirm']);
Route::get('newsletter/unsubscribe/{token}', [NewsletterController::class, 'unsubscribe']);
Route::post('newsletter/preferences/{token}', [NewsletterController::class, 'updatePreferences']);
Route::get('newsletter/count', [NewsletterController::class, 'count']);

// Badges
Route::get('badges', [BadgeController::class, 'index']);
Route::get('badges/leaderboard', [BadgeController::class, 'leaderboard']);

// Activity
Route::get('activity/global', [ActivityController::class, 'global']);
Route::get('activity/trending', [ActivityController::class, 'trending']);

// Category routes
Route::middleware('throttle:60,1')->group(function () {
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::get('/categories/tree', [CategoryController::class, 'tree']);
    Route::post('/categories/reorder', [CategoryController::class, 'reorder']);
    Route::get('/categories/{slug}', [CategoryController::class, 'show']);
    Route::put('/categories/{category}', [CategoryController::class, 'update']);
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);
    Route::get('/categories/{slug}/posts', [CategoryController::class, 'posts']);
    Route::post('categories/{id}/restore', [CategoryController::class, 'restore']);
    Route::delete('categories/{id}/force', [CategoryController::class, 'forceDestroy']);
    Route::get('categories/{slug}/breadcrumb', [CategoryController::class, 'breadcrumb']);
});

// Tag routes
Route::get('/tags', [TagController::class, 'index']);
Route::post('/tags', [TagController::class, 'store']);
Route::get('/tags/cloud', [TagController::class, 'cloud']);
Route::get('/tags/suggestions', [TagController::class, 'suggestions']);
Route::post('/tags/merge', [TagController::class, 'merge']);
Route::get('/tags/{slug}', [TagController::class, 'show']);
Route::put('/tags/{tag}', [TagController::class, 'update']);
Route::delete('/tags/{tag}', [TagController::class, 'destroy']);
Route::get('/tags/{slug}/posts', [TagController::class, 'posts']);

// Series routes
Route::get('/series', [SeriesController::class, 'index']);
Route::post('/series', [SeriesController::class, 'store']);
Route::get('/series/{slug}', [SeriesController::class, 'show']);
Route::put('/series/{series}', [SeriesController::class, 'update']);
Route::delete('/series/{series}', [SeriesController::class, 'destroy']);
Route::post('/series/{series}/posts', [SeriesController::class, 'addPost']);
Route::delete('/series/{series}/posts/{post}', [SeriesController::class, 'removePost']);
Route::post('/series/{series}/reorder', [SeriesController::class, 'reorderPosts']);
Route::get('/series/{slug}/posts', [SeriesController::class, 'posts']);
Route::get('/series/{series}/posts/{post}/progress', [SeriesController::class, 'progress']);

// ────────────────────────────────────────────────
// PROTECTED ROUTES (Require Authentication)
// ────────────────────────────────────────────────

Route::middleware('auth:sanctum')->group(function () {
    
    // Authentication
    Route::post('logout', [AuthController::class, 'logout']);
    Route::post('logout-all', [AuthController::class, 'logoutAll']);

    // User Profile & Settings
    Route::prefix('user')->group(function () {
        Route::get('/', [UserController::class, 'show']);
        Route::put('profile', [UserController::class, 'updateProfile']);
        Route::put('password', [UserController::class, 'updatePassword']);
        Route::put('notifications', [UserController::class, 'updateNotifications']);
        Route::delete('/', [UserController::class, 'destroy']);
    });

    Route::get('users/suggestions', [UserController::class, 'suggestions']);

    Route::put('profile', [ProfileController::class, 'update']);
    Route::post('profile/avatar', [ProfileController::class, 'uploadAvatar']);

    // Posts Management
    Route::post('posts', [PostController::class, 'store']);
    Route::put('posts/{post}', [PostController::class, 'update']);
    Route::delete('posts/{post}', [PostController::class, 'destroy']);

    // Comments
    Route::get('posts/{post}/comments', [CommentController::class, 'index']);
    Route::post('posts/{post}/comments', [CommentController::class, 'store']);
    Route::get('comments/{comment}', [CommentController::class, 'show']);
    Route::put('comments/{comment}', [CommentController::class, 'update']);
    Route::delete('comments/{comment}', [CommentController::class, 'destroy']);
    Route::get('comments/{comment}/replies', [CommentController::class, 'getReplies']);
    
    // Comment Reactions
    Route::post('comments/{comment}/reactions', [CommentController::class, 'toggleReaction']);
    Route::get('comments/{comment}/reactions', [CommentController::class, 'getReactions']);

    // Subscriptions
    Route::prefix('subscription')->group(function () {
        Route::get('current', [SubscriptionController::class, 'currentSubscription']);
        Route::post('subscribe', [SubscriptionController::class, 'subscribe']);
        Route::post('verify', [SubscriptionController::class, 'verifyPayment']);
        Route::post('cancel', [SubscriptionController::class, 'cancel']);
        Route::get('history', [SubscriptionController::class, 'history']);
        Route::get('transactions', [SubscriptionController::class, 'transactions']);
    });

    // Paystack webhook (auth session)
    Route::post('paystack/webhook', [PaystackWebhookController::class, 'handle']);

    // Analytics & Earnings
    Route::prefix('analytics')->group(function () {
        Route::get('overview', [AnalyticsController::class, 'overview']);
        Route::get('views-over-time', [AnalyticsController::class, 'viewsOverTime']);
    });

    Route::prefix('earnings')->group(function () {
        Route::get('/', [UserController::class, 'earnings']);
        Route::get('overview', [EarningsController::class, 'overview']);
        Route::get('stats', [EarningsController::class, 'statistics']);
    });

    // Newsletter Management
    Route::get('newsletter/subscribers', [NewsletterController::class, 'index']);

    // Follow System
    Route::post('users/{user}/follow', [FollowController::class, 'follow']);
    Route::delete('users/{user}/unfollow', [FollowController::class, 'unfollow']);
    Route::post('users/{user}/toggle-follow', [FollowController::class, 'toggle']);
    Route::get('follow/suggestions', [FollowController::class, 'suggestions']);

    // Activity Feed
    Route::get('activity/feed', [ActivityController::class, 'feed']);
    Route::get('activity/me', [ActivityController::class, 'userActivities']);

    // Messaging
    Route::prefix('messages')->group(function () {
        Route::get('/', [MessageController::class, 'conversations']);
        Route::get('unread-count', [MessageController::class, 'unreadCount']);
        Route::get('{user}', [MessageController::class, 'conversation']);
        Route::post('{user}', [MessageController::class, 'send']);
        Route::put('{message}/read', [MessageController::class, 'markAsRead']);
        Route::delete('{message}', [MessageController::class, 'delete']);
        Route::post('{user}/mark-all-read', [MessageController::class, 'markAllAsRead']);
    });

    // Badges
    Route::post('badges/check', [BadgeController::class, 'checkBadges']);

    // Notifications
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::get('unread', [NotificationController::class, 'unread']);
        Route::get('{id}', [NotificationController::class, 'show']);
        Route::put('{id}/read', [NotificationController::class, 'markAsRead']);
        Route::put('{id}/unread', [NotificationController::class, 'markAsUnread']);
        Route::post('mark-all-read', [NotificationController::class, 'markAllRead']);
        Route::delete('{id}', [NotificationController::class, 'destroy']);
        Route::delete('/', [NotificationController::class, 'destroyAll']);
    });

    // Premium Content
    Route::middleware('premium')->group(function () {
        Route::get('posts/{post}/premium-content', [PostController::class, 'premiumContent']);
    });

    // Admin Routes
    Route::prefix('admin')
        ->middleware(['admin', 'throttle:api.strict'])
        ->group(function () {
            Route::prefix('subscription')->group(function () {
                Route::get('analytics', [SubscriptionAdminController::class, 'analytics']);
                Route::get('plans', [SubscriptionAdminController::class, 'allPlans']);
                Route::post('plans', [SubscriptionAdminController::class, 'storePlan']);
                Route::delete('plans/{plan}', [SubscriptionAdminController::class, 'deletePlan']);
                Route::get('revenue-report', [SubscriptionAdminController::class, 'revenueReport']);
            });

            Route::post('badges/seed', [BadgeController::class, 'seed']);
        });
});

// ────────────────────────────────────────────────
// PUBLIC PROFILES (Place static before dynamic)
// ────────────────────────────────────────────────
Route::get('users/search', [ProfileController::class, 'search']);

// Move wildcard identifier to the very end of the public section 
// so it doesn't intercept 'suggestions' or other static strings
Route::get('users/{identifier}', [ProfileController::class, 'show']);
Route::get('users/{identifier}/followers', [ProfileController::class, 'followers']);
Route::get('users/{identifier}/following', [ProfileController::class, 'following']);
Route::get('users/{identifier}/posts', [ProfileController::class, 'posts']);
Route::get('users/{identifier}/activity', [ProfileController::class, 'activity']);
Route::get('users/{identifier}/badges', [BadgeController::class, 'userBadges']);