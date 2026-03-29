<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use MongoDB\Laravel\Relations\BelongsTo;

class Message extends Model
{
    use SoftDeletes;

    protected $connection = 'mongodb';
    protected $collection = 'messages';

    protected $fillable = [
        'sender_id',
        'receiver_id',
        'content',
        'is_read',
        'read_at',
    ];

    protected $casts = [
        'is_read'    => 'boolean',
        'read_at'    => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function receiver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }

    public function markAsRead(): void
    {
        if (!$this->is_read) {
            $this->update([
                'is_read' => true,
                'read_at' => now(),
            ]);
        }
    }

    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    public function scopeBetweenUsers($query, string $userId1, string $userId2)
    {
        return $query->where(function ($q) use ($userId1, $userId2) {
            $q->where(function ($q2) use ($userId1, $userId2) {
                $q2->where('sender_id', $userId1)
                   ->where('receiver_id', $userId2);
            })->orWhere(function ($q2) use ($userId1, $userId2) {
                $q2->where('sender_id', $userId2)
                   ->where('receiver_id', $userId1);
            });
        });
    }

    public static function conversation(string $userId1, string $userId2, int $limit = 50)
    {
        return self::betweenUsers($userId1, $userId2)
            ->with(['sender', 'receiver'])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->reverse()
            ->values();
    }

    public static function conversationsList(string $userId)
    {
        $fields = ['_id', 'name', 'username', 'avatar', 'is_online'];

        return self::where('sender_id', $userId)
            ->orWhere('receiver_id', $userId)
            ->with([
                'sender'   => fn($q) => $q->select($fields),
                'receiver' => fn($q) => $q->select($fields),
            ])
            ->orderBy('created_at', 'desc')
            ->get()
            ->groupBy(function ($message) use ($userId) {
                return (string) $message->sender_id === $userId
                    ? (string) $message->receiver_id
                    : (string) $message->sender_id;
            })
            ->filter(function ($messages) use ($userId) {
                $msg = $messages->first();
                return (string) $msg->sender_id === $userId
                    ? $msg->receiver
                    : $msg->sender;
            })
            ->map(fn($messages) => $messages->first())
            ->values();
    }
}