<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Resources\NotificationResource;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        // Laravel's DatabaseNotification model works with MongoDB
        // as long as the notifications collection uses the MongoDB driver.
        // Ensure DatabaseNotification extends MongoDB\Laravel\Eloquent\Model
        // or that your User model uses the MongoDB-compatible HasNotifications trait.
        $notifications = $user->notifications()
            ->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 20));

        return response()->json([
            'data' => NotificationResource::collection($notifications),
            'meta' => [
                'total'        => $notifications->total(),
                'per_page'     => $notifications->perPage(),
                'current_page' => $notifications->currentPage(),
                'last_page'    => $notifications->lastPage(),
            ],
        ]);
    }

    public function unread(Request $request): JsonResponse
    {
        $user = $request->user();

        $notifications = $user->unreadNotifications()
            ->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 20));

        return response()->json([
            'data' => NotificationResource::collection($notifications),
            'meta' => [
                'total'        => $notifications->total(),
                // Re-query for accurate unread count — avoids stale paginator state
                'unread_count' => $user->unreadNotifications()->count(),
                'per_page'     => $notifications->perPage(),
                'current_page' => $notifications->currentPage(),
                'last_page'    => $notifications->lastPage(),
            ],
        ]);
    }

    public function show(string $id, Request $request): JsonResponse
    {
        $user = $request->user();

        // MongoDB notification IDs are UUIDs stored as strings — no cast needed
        $notification = $user->notifications()
            ->where('id', $id)
            ->firstOrFail();

        return response()->json(['data' => new NotificationResource($notification)]);
    }

    public function markAsRead(string $id, Request $request): JsonResponse
    {
        $user = $request->user();

        $notification = $user->notifications()
            ->where('id', $id)
            ->firstOrFail();

        if ($notification->read_at === null) {
            $notification->markAsRead();
        }

        return response()->json([
            'message' => 'Notification marked as read.',
            'data'    => new NotificationResource($notification),
        ]);
    }

    public function markAllRead(Request $request): JsonResponse
    {
        $request->user()->unreadNotifications->markAsRead();

        return response()->json(['message' => 'All notifications marked as read.']);
    }

    public function markAsUnread(string $id, Request $request): JsonResponse
    {
        $user = $request->user();

        $notification = $user->notifications()
            ->where('id', $id)
            ->firstOrFail();

        // Directly nullify read_at — markAsUnread() doesn't exist in Laravel core
        $notification->read_at = null;
        $notification->save();

        return response()->json([
            'message' => 'Notification marked as unread.',
            'data'    => new NotificationResource($notification),
        ]);
    }

    public function destroy(string $id, Request $request): JsonResponse
    {
        $user = $request->user();

        $notification = $user->notifications()
            ->where('id', $id)
            ->firstOrFail();

        $notification->delete();

        return response()->json(['message' => 'Notification deleted.']);
    }

    public function destroyAll(Request $request): JsonResponse
    {
        $user  = $request->user();
        $query = $user->notifications();

        if ($request->type === 'read') {
            // whereNotNull / whereNull work identically in laravel-mongodb
            $query->whereNotNull('read_at');
        } elseif ($request->type === 'unread') {
            $query->whereNull('read_at');
        }

        $count = $query->count();
        $query->delete();

        return response()->json(['message' => "{$count} notifications deleted."]);
    }
}