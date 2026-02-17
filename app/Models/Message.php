<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property int $id
 * @property int $sender_id
 * @property int $receiver_id
 * @property string $content
 * @property bool $is_read
 * @property \Illuminate\Support\Carbon|null $read_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @property-read \App\Models\User $receiver
 * @property-read \App\Models\User $sender
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Message betweenUsers(int $userId1, int $userId2)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Message newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Message newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Message onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Message query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Message unread()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Message whereContent($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Message whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Message whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Message whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Message whereIsRead($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Message whereReadAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Message whereReceiverId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Message whereSenderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Message whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Message withTrashed(bool $withTrashed = true)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Message withoutTrashed()
 * @mixin \Eloquent
 */
class Message extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'sender_id',
        'receiver_id',
        'content',
        'is_read',
        'read_at',
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'read_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the sender
     */
    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    /**
     * Get the receiver
     */
    public function receiver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }

    /**
     * Mark message as read
     */
    public function markAsRead(): void
    {
        if (!$this->is_read) {
            $this->update([
                'is_read' => true,
                'read_at' => now(),
            ]);
        }
    }

    /**
     * Scope unread messages
     */
    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    /**
     * Scope messages between two users
     */
    public function scopeBetweenUsers($query, int $userId1, int $userId2)
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

    /**
     * Get conversation between two users
     */
    public static function conversation(int $userId1, int $userId2, int $limit = 50)
    {
        return self::betweenUsers($userId1, $userId2)
            ->with(['sender:id,name,avatar', 'receiver:id,name,avatar'])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->reverse()
            ->values();
    }

    /**
     * Get user's conversations list
     */
    public static function conversationsList(int $userId)
    {
        return self::where('sender_id', $userId)
            ->orWhere('receiver_id', $userId)
            ->with(['sender', 'receiver'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->groupBy(function ($message) use ($userId) {
                return $message->sender_id === $userId 
                    ? $message->receiver_id 
                    : $message->sender_id;
            })
            ->map(function ($messages) {
                return $messages->first();
            })
            ->values();
    }
}