<?php

namespace App\Events;

use App\Models\Comment;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CommentUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Comment $comment;

    public function __construct(Comment $comment)
    {
        $this->comment = $comment->load(['user', 'reactions']);
    }

    public function broadcastOn(): Channel
    {
        return new Channel('post.' . $this->comment->post_id);
    }

    public function broadcastWith(): array
    {
        return [
            'comment' => [
                'id' => $this->comment->id,
                'post_id' => $this->comment->post_id,
                'parent_id' => $this->comment->parent_id,
                'content' => $this->comment->content,
                'is_edited' => $this->comment->is_edited,
                'edited_at' => $this->comment->edited_at,
                'created_at' => $this->comment->created_at,
                'user' => [
                    'id' => $this->comment->user->id,
                    'name' => $this->comment->user->name,
                    'email' => $this->comment->user->email,
                ],
                'reactions_count' => $this->comment->reactions_count,
                'replies_count' => $this->comment->replies_count,
                'user_reaction' => $this->comment->user_reaction,
            ],
        ];
    }

    public function broadcastAs(): string
    {
        return 'comment.updated';
    }
}