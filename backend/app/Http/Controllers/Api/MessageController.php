<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\User;
use App\Events\MessageSent;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class MessageController extends Controller
{
    public function conversations(): JsonResponse
    {
        $userId        = (string) Auth::id();
        $conversations = Message::conversationsList($userId);

        $formatted = $conversations->map(function ($message) use ($userId) {
            $otherUser = (string) $message->sender_id === $userId
                ? $message->receiver
                : $message->sender;

            if (!$otherUser) return null;

            $unreadCount = Message::betweenUsers($userId, (string) $otherUser->id)
                ->where('receiver_id', $userId)
                ->unread()
                ->count();

            return [
                'user' => [
                    'id'        => $otherUser->id,
                    'name'      => $otherUser->name,
                    'username'  => $otherUser->username,
                    'avatar'    => $otherUser->avatar,
                    'is_online' => $otherUser->is_online,
                ],
                'last_message' => [
                    'content'    => $message->content,
                    'sender_id'  => $message->sender_id,
                    'created_at' => $message->created_at,
                    'is_read'    => $message->is_read,
                ],
                'unread_count' => $unreadCount,
            ];
        })->filter()->values();

        return response()->json($formatted);
    }

    public function conversation($id): JsonResponse
    {
        $currentUserId = (string) Auth::id();
        $user = User::findOrFail($id);

        if ($currentUserId === (string) $user->id) {
            return response()->json(['message' => 'Cannot message yourself'], 422);
        }

        $messages = Message::conversation($currentUserId, (string) $user->id);

        // Mark messages from this user as read
        Message::where('sender_id', (string) $user->id)
            ->where('receiver_id', $currentUserId)
            ->where('is_read', false)
            ->update(['is_read' => true, 'read_at' => now()]);

        return response()->json([
            'user' => [
                'id'        => (string) $user->id,
                'name'      => $user->name,
                'username'  => $user->username,
                'avatar'    => $user->avatar,
                'is_online' => $user->is_online,
            ],
            'messages' => $messages,
        ]);
    }

    /**
     * Send a message to another user.
     * The receiver is identified via the route parameter.
     * Route should be: POST /api/messages/{user}
     */
    public function send(Request $request, User $user): JsonResponse
    {
        $request->validate(['content' => 'required|string|max:2000']);

        $sender = Auth::user();

        if ((string) $sender->id === (string) $user->id) {
            return response()->json(['message' => 'Cannot message yourself'], 422);
        }

        $message = Message::create([
            'sender_id'   => (string) $sender->id,
            'receiver_id' => (string) $user->id,   // <-- now properly set from route model binding
            'content'     => $request->content,
            'is_read'     => false,
        ]);

        $message->load(['sender', 'receiver']);

        broadcast(new MessageSent($message))->toOthers();
        $user->notify(new \App\Notifications\MessageReceived($sender, $message));

        return response()->json([
            'message' => 'Message sent successfully',
            'data'    => $message,
        ], 201);
    }

    public function markAsRead(Message $message): JsonResponse
    {
        if ((string) $message->receiver_id !== (string) Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $message->markAsRead();
        return response()->json(['message' => 'Message marked as read']);
    }

    public function delete(Message $message): JsonResponse
    {
        $userId = (string) Auth::id();

        if ((string) $message->sender_id !== $userId && (string) $message->receiver_id !== $userId) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $message->delete();
        return response()->json(['message' => 'Message deleted successfully']);
    }

    public function unreadCount(): JsonResponse
    {
        return response()->json(['unread_count' => Auth::user()->unreadMessagesCount()]);
    }

    public function markAllAsRead(User $user): JsonResponse
    {
        Message::where('sender_id', (string) $user->id)
            ->where('receiver_id', (string) Auth::id())
            ->unread()
            ->update(['is_read' => true, 'read_at' => now()]);

        return response()->json(['message' => 'All messages marked as read']);
    }
}