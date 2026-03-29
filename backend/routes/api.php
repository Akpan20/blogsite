<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\CommentController;
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
use App\Http\Controllers\Api\ResourceController;
use App\Http\Controllers\Api\UploadController;

// ────────────────────────────────────────────────
// PUBLIC ROUTES ─ No authentication required
// ────────────────────────────────────────────────

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

Route::get('/api/debug', function () {
    try {
        DB::connection('mongodb')->command(['ping' => 1]);
        return response()->json([
            'mongodb'     => 'connected ✅',
            'ext_version' => phpversion('mongodb'),
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'error'       => $e->getMessage(),
            'ext_version' => phpversion('mongodb'),
        ], 500);
    }
});

// Posts (public) — static routes BEFORE wildcards
Route::get('/posts/check-slug',         [PostController::class, 'checkSlug']);
Route::get('/featured-posts',           [PostController::class, 'featured']);
Route::get('/posts/trending',           [PostController::class, 'trending']);
Route::get('/posts/{post}',             [PostController::class, 'show'])->name('posts.show');
Route::get('/posts/{post}/related',     [PostController::class, 'related']);
Route::get('/posts/{post}/meta',        [SEOController::class, 'getPostMeta']);
Route::post('/posts/{post}/track-view', [SEOController::class, 'trackView']);
Route::get('/posts/{post}/comments',    [CommentController::class, 'index']);

Route::post('/comments/guest', [CommentController::class, 'guestStore']);

// Search
Route::get('/search',               [SearchController::class, 'search']);
Route::get('/search/suggestions',   [SearchController::class, 'suggestions']);
Route::get('/search/popular',       [SearchController::class, 'popular']);

// Categories — static routes BEFORE wildcards
Route::get('/categories',               [CategoryController::class, 'index']);
Route::get('/categories/tree',          [CategoryController::class, 'tree']);
Route::get('/categories/{slug}',        [CategoryController::class, 'show']);
Route::get('/categories/{slug}/posts',  [CategoryController::class, 'posts']);

// Tags — static routes BEFORE wildcards
Route::get('/tags',                 [TagController::class, 'index']);
Route::get('/tags/cloud',           [TagController::class, 'cloud']);
Route::get('/tags/suggestions',     [TagController::class, 'suggestions']);
Route::get('/tags/{slug}',          [TagController::class, 'show']);
Route::get('/tags/{slug}/posts',    [TagController::class, 'posts']);

// Series — static routes BEFORE wildcards
Route::get('/series',               [SeriesController::class, 'index']);
Route::get('/series/{slug}',        [SeriesController::class, 'show']);
Route::get('/series/{slug}/posts',  [SeriesController::class, 'posts']);

// Resources — static routes BEFORE wildcards
Route::get('/resources',            [ResourceController::class, 'index']);
Route::get('/resources/categories', [ResourceController::class, 'categories']);
Route::get('/resources/{slug}',     [ResourceController::class, 'show']);

// Subscriptions
Route::get('/subscription/plans',           [SubscriptionController::class, 'plans']);
Route::get('/subscription/paystack-config', [SubscriptionController::class, 'paystackConfig']);

// Newsletter — static routes BEFORE wildcards
Route::post('/newsletter/subscribe',                [NewsletterController::class, 'subscribe']);
Route::get('/newsletter/count',                     [NewsletterController::class, 'count']);
Route::get('/newsletter/confirm/{token}',           [NewsletterController::class, 'confirm']);
Route::get('/newsletter/unsubscribe/{token}',       [NewsletterController::class, 'unsubscribe']);
Route::post('/newsletter/preferences/{token}',      [NewsletterController::class, 'updatePreferences']);

// Badges & Leaderboards — static routes BEFORE wildcards
Route::get('/badges',               [BadgeController::class, 'index']);
Route::get('/badges/leaderboard',   [BadgeController::class, 'leaderboard']);

// Activity
Route::get('/activity/global',      [ActivityController::class, 'global']);
Route::get('/activity/trending',    [ActivityController::class, 'trending']);

// SEO
Route::get('/sitemap.xml',  [SEOController::class, 'sitemap']);
Route::get('/robots.txt',   [SEOController::class, 'robots']);

// Public user profiles — static routes BEFORE wildcards
Route::get('/users/search',                     [ProfileController::class, 'search']);
Route::get('/users/{identifier}',               [ProfileController::class, 'show']);
Route::get('/users/{identifier}/followers',     [ProfileController::class, 'followers']);
Route::get('/users/{identifier}/following',     [ProfileController::class, 'following']);
Route::get('/users/{identifier}/posts',         [ProfileController::class, 'posts']);
Route::get('/users/{identifier}/activity',      [ProfileController::class, 'activity']);
Route::get('/users/{identifier}/badges',        [BadgeController::class, 'userBadges']);

// ────────────────────────────────────────────────
// PROTECTED ROUTES ─ Require Sanctum authentication
// ────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    
    Broadcast::routes(['middleware' => ['auth:sanctum']]);

    // Auth
    Route::post('/logout',     [AuthController::class, 'logout']);
    Route::post('/logout-all', [AuthController::class, 'logoutAll']);

    // User
    Route::prefix('user')->group(function () {
        Route::get('/',                 [UserController::class, 'show']);
        Route::put('/profile',          [UserController::class, 'updateProfile']);
        Route::put('/password',         [UserController::class, 'updatePassword']);
        Route::put('/notifications',    [UserController::class, 'updateNotifications']);
        Route::delete('/',              [UserController::class, 'destroy']);
    });

    Route::get('/users/suggestions', [UserController::class, 'suggestions']);

    Route::put('/profile',          [ProfileController::class, 'update']);
    Route::post('/profile/avatar',  [ProfileController::class, 'uploadAvatar']);

    // Media / Upload
    Route::post('/upload-image',    [UploadController::class, 'uploadImage']);
    Route::post('/media/upload',    [UploadController::class, 'uploadImage']);
    Route::get('/media',            [UploadController::class, 'index']);
    Route::delete('/media',         [UploadController::class, 'destroy']);

    // Posts (management) — static routes BEFORE wildcards
    Route::get('/posts',                        [PostController::class, 'index']);
    Route::post('/posts',                       [PostController::class, 'store']);
    Route::post('/posts/featured/reorder',      [PostController::class, 'reorderFeatured']);
    Route::put('/posts/{post}',                 [PostController::class, 'update']);
    Route::delete('/posts/{post}',              [PostController::class, 'destroy']);

    // Comments (authenticated)
    Route::post('/posts/{post}/comments',       [CommentController::class, 'store']);
    Route::get('/comments/{comment}',           [CommentController::class, 'show']);
    Route::put('/comments/{comment}',           [CommentController::class, 'update']);
    Route::delete('/comments/{comment}',        [CommentController::class, 'destroy']);
    Route::get('/comments/{comment}/replies',   [CommentController::class, 'getReplies']);
    Route::post('/comments/{comment}/reactions',[CommentController::class, 'toggleReaction']);
    Route::get('/comments/{comment}/reactions', [CommentController::class, 'getReactions']);

    // Subscriptions & Payments
    Route::prefix('subscription')->group(function () {
        Route::get('/current',      [SubscriptionController::class, 'currentSubscription']);
        Route::post('/subscribe',   [SubscriptionController::class, 'subscribe']);
        Route::post('/verify',      [SubscriptionController::class, 'verifyPayment']);
        Route::post('/cancel',      [SubscriptionController::class, 'cancel']);
        Route::get('/history',      [SubscriptionController::class, 'history']);
        Route::get('/transactions', [SubscriptionController::class, 'transactions']);
    });

    Route::post('/paystack/webhook', [PaystackWebhookController::class, 'handle']);

    // Analytics & Earnings
    Route::prefix('analytics')->group(function () {
        Route::get('/overview',         [AnalyticsController::class, 'overview']);
        Route::get('/views-over-time',  [AnalyticsController::class, 'viewsOverTime']);
    });

    Route::prefix('earnings')->group(function () {
        Route::get('/',         [UserController::class, 'earnings']);
        Route::get('/overview', [EarningsController::class, 'overview']);
        Route::get('/stats',    [EarningsController::class, 'statistics']);
    });

    Route::get('/newsletter/subscribers', [NewsletterController::class, 'index']);

    // Follow
    Route::post('/users/{user}/follow',         [FollowController::class, 'follow']);
    Route::delete('/users/{user}/unfollow',     [FollowController::class, 'unfollow']);
    Route::post('/users/{user}/toggle-follow',  [FollowController::class, 'toggle']);
    Route::get('/follow/suggestions',           [FollowController::class, 'suggestions']);

    // Activity
    Route::get('/activity/feed', [ActivityController::class, 'feed']);
    Route::get('/activity/me',   [ActivityController::class, 'userActivities']);

    Route::prefix('messages')->group(function () {
        Route::get('/conversations',            [MessageController::class, 'conversations']);
        Route::get('/unread-count',             [MessageController::class, 'unreadCount']);
        Route::get('/{user}',                   [MessageController::class, 'conversation']);
        Route::post('/{user}',                  [MessageController::class, 'send']);
        Route::post('/{user}/mark-all-read',    [MessageController::class, 'markAllAsRead']);
        Route::patch('/{message}/read',         [MessageController::class, 'markAsRead']);
        Route::delete('/{message}',             [MessageController::class, 'delete']);
    });

    // Badges
    Route::post('/badges/check', [BadgeController::class, 'checkBadges']);

    // Notifications — static routes BEFORE wildcards
    Route::prefix('notifications')->group(function () {
        Route::get('/',                     [NotificationController::class, 'index']);
        Route::get('/unread',               [NotificationController::class, 'unread']);
        Route::post('/mark-all-read',       [NotificationController::class, 'markAllRead']);
        Route::delete('/',                  [NotificationController::class, 'destroyAll']);
        Route::get('/{id}',                 [NotificationController::class, 'show']);
        Route::put('/{id}/read',            [NotificationController::class, 'markAsRead']);
        Route::put('/{id}/unread',          [NotificationController::class, 'markAsUnread']);
        Route::delete('/{id}',              [NotificationController::class, 'destroy']);
    });

    // Premium content
    Route::middleware('premium')->get('/posts/{post}/premium-content', [PostController::class, 'premiumContent']);
});

// ────────────────────────────────────────────────
// ADMIN ROUTES ─ Require admin middleware
// ────────────────────────────────────────────────
Route::prefix('admin')
    ->middleware(['auth:sanctum', 'admin', 'throttle:api.strict'])
    ->group(function () {

        Route::prefix('subscription')->group(function () {
            Route::get('/analytics',        [SubscriptionAdminController::class, 'analytics']);
            Route::get('/plans',            [SubscriptionAdminController::class, 'allPlans']);
            Route::post('/plans',           [SubscriptionAdminController::class, 'storePlan']);
            Route::delete('/plans/{plan}',  [SubscriptionAdminController::class, 'deletePlan']);
            Route::get('/revenue-report',   [SubscriptionAdminController::class, 'revenueReport']);
        });

        Route::post('/badges/seed', [BadgeController::class, 'seed']);

        Route::prefix('resources')->group(function () {
            Route::post('/',        [ResourceController::class, 'store']);
            Route::put('/{id}',     [ResourceController::class, 'update']);
            Route::delete('/{id}',  [ResourceController::class, 'destroy']);
        });
    });