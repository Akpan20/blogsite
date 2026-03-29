<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CommentDeleted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public int $commentId;
    public int $postId;

    public function __construct(int $commentId, int $postId)
    {
        $this->commentId = $commentId;
        $this->postId = $postId;
    }

    public function broadcastOn(): Channel
    {
        return new Channel('post.' . $this->postId);
    }

    public function broadcastWith(): array
    {
        return [
            'comment_id' => $this->commentId,
        ];
    }

    public function broadcastAs(): string
    {
        return 'comment.deleted';
    }
}