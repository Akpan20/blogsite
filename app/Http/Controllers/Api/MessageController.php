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
    /**
     * Get conversations list
     */
    public function conversations(): JsonResponse
    {
        $userId = Auth::id();
        
        $conversations = Message::conversationsList($userId);

        // Format conversations with last message and unread count
        $formatted = $conversations->map(function ($message) use ($userId) {
            $otherUser = $message->sender_id === $userId 
                ? $message->receiver 
                : $message->sender;

            $unreadCount = Message::betweenUsers($userId, $otherUser->id)
                ->where('receiver_id', $userId)
                ->unread()
                ->count();

            return [
                'user' => [
                    'id' => $otherUser->id,
                    'name' => $otherUser->name,
                    'username' => $otherUser->username,
                    'avatar' => $otherUser->avatar,
                    'is_online' => $otherUser->is_online,
                ],
                'last_message' => [
                    'content' => $message->content,
                    'sender_id' => $message->sender_id,
                    'created_at' => $message->created_at,
                    'is_read' => $message->is_read,
                ],
                'unread_count' => $unreadCount,
            ];
        });

        return response()->json($formatted);
    }

    /**
     * Get conversation with a specific user
     */
    public function conversation(User $user): JsonResponse
    {
        $currentUserId = Auth::id();

        if ($currentUserId === $user->id) {
            return response()->json([
                'message' => 'Cannot message yourself',
            ], 422);
        }

        $messages = Message::conversation($currentUserId, $user->id);

        // Mark messages as read
        Message::where('sender_id', $user->id)
            ->where('receiver_id', $currentUserId)
            ->unread()
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'avatar' => $user->avatar,
                'is_online' => $user->is_online,
            ],
            'messages' => $messages,
        ]);
    }

    /**
     * Send a message
     */
    public function send(Request $request, User $receiver): JsonResponse
    {
        $request->validate([
            'content' => 'required|string|max:2000',
        ]);

        $sender = Auth::user();

        if ($sender->id === $receiver->id) {
            return response()->json([
                'message' => 'Cannot message yourself',
            ], 422);
        }

        $message = Message::create([
            'sender_id' => $sender->id,
            'receiver_id' => $receiver->id,
            'content' => $request->content,
        ]);

        $message->load(['sender', 'receiver']);

        // Broadcast message via WebSocket
        broadcast(new MessageSent($message))->toOthers();

        // Send notification
        $receiver->notify(new \App\Notifications\MessageReceived($sender, $message));

        return response()->json([
            'message' => 'Message sent successfully',
            'data' => $message,
        ], 201);
    }

    /**
     * Mark message as read
     */
    public function markAsRead(Message $message): JsonResponse
    {
        if ($message->receiver_id !== Auth::id()) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        $message->markAsRead();

        return response()->json([
            'message' => 'Message marked as read',
        ]);
    }

    /**
     * Delete message
     */
    public function delete(Message $message): JsonResponse
    {
        if ($message->sender_id !== Auth::id() && $message->receiver_id !== Auth::id()) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        $message->delete();

        return response()->json([
            'message' => 'Message deleted successfully',
        ]);
    }

    /**
     * Get unread messages count
     */
    public function unreadCount(): JsonResponse
    {
        $count = Auth::user()->unreadMessagesCount();

        return response()->json([
            'unread_count' => $count,
        ]);
    }

    /**
     * Mark all messages from a user as read
     */
    public function markAllAsRead(User $user): JsonResponse
    {
        Message::where('sender_id', $user->id)
            ->where('receiver_id', Auth::id())
            ->unread()
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        return response()->json([
            'message' => 'All messages marked as read',
        ]);
    }
}