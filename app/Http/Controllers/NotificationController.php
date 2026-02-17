<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Resources\NotificationResource;

class NotificationController extends Controller
{
    /**
     * Get a paginated list of all notifications for the authenticated user.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $notifications = $user->notifications()
            ->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 20));

        return response()->json([
            'data' => NotificationResource::collection($notifications),
            'meta' => [
                'total' => $notifications->total(),
                'per_page' => $notifications->perPage(),
                'current_page' => $notifications->currentPage(),
                'last_page' => $notifications->lastPage(),
            ],
        ]);
    }

    /**
     * Get a paginated list of unread notifications.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function unread(Request $request): JsonResponse
    {
        $user = $request->user();

        $notifications = $user->unreadNotifications()
            ->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 20));

        return response()->json([
            'data' => NotificationResource::collection($notifications),
            'meta' => [
                'total' => $notifications->total(),
                'unread_count' => $user->unreadNotifications()->count(),
                'per_page' => $notifications->perPage(),
                'current_page' => $notifications->currentPage(),
                'last_page' => $notifications->lastPage(),
            ],
        ]);
    }

    /**
     * Get a single notification by ID.
     *
     * @param string $id
     * @param Request $request
     * @return JsonResponse
     */
    public function show(string $id, Request $request): JsonResponse
    {
        $user = $request->user();

        $notification = $user->notifications()
            ->where('id', $id)
            ->firstOrFail();

        return response()->json([
            'data' => new NotificationResource($notification),
        ]);
    }

    /**
     * Mark a specific notification as read.
     *
     * @param string $id
     * @param Request $request
     * @return JsonResponse
     */
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
            'data' => new NotificationResource($notification),
        ]);
    }

    /**
     * Mark all unread notifications as read.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function markAllRead(Request $request): JsonResponse
    {
        $user = $request->user();

        $user->unreadNotifications->markAsRead();

        return response()->json([
            'message' => 'All notifications marked as read.',
        ]);
    }

    /**
     * Mark a specific notification as unread.
     *
     * @param string $id
     * @param Request $request
     * @return JsonResponse
     */
    public function markAsUnread(string $id, Request $request): JsonResponse
    {
        $user = $request->user();

        $notification = $user->notifications()
            ->where('id', $id)
            ->firstOrFail();

        $notification->read_at = null;
        $notification->save();

        return response()->json([
            'message' => 'Notification marked as unread.',
            'data' => new NotificationResource($notification),
        ]);
    }

    /**
     * Delete a specific notification.
     *
     * @param string $id
     * @param Request $request
     * @return JsonResponse
     */
    public function destroy(string $id, Request $request): JsonResponse
    {
        $user = $request->user();

        $notification = $user->notifications()
            ->where('id', $id)
            ->firstOrFail();

        $notification->delete();

        return response()->json([
            'message' => 'Notification deleted.',
        ]);
    }

    /**
     * Delete all notifications (or optionally only read notifications).
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function destroyAll(Request $request): JsonResponse
    {
        $user = $request->user();

        // By default, delete all notifications.
        $query = $user->notifications();

        // Allow filtering: ?type=read or ?type=unread
        if ($request->type === 'read') {
            $query->whereNotNull('read_at');
        } elseif ($request->type === 'unread') {
            $query->whereNull('read_at');
        }

        $count = $query->count();
        $query->delete();

        return response()->json([
            'message' => "{$count} notifications deleted.",
        ]);
    }
}