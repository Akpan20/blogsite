<?php

namespace App\Events;

use App\Models\Comment;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CommentReactionUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public int $commentId;
    public int $postId;
    public array $reactionsCount;
    public ?string $userReaction;

    public function __construct(Comment $comment)
    {
        $this->commentId = $comment->id;
        $this->postId = $comment->post_id;
        $this->reactionsCount = $comment->reactions_count;
        $this->userReaction = $comment->user_reaction;
    }

    public function broadcastOn(): Channel
    {
        return new Channel('post.' . $this->postId);
    }

    public function broadcastWith(): array
    {
        return [
            'comment_id' => $this->commentId,
            'reactions_count' => $this->reactionsCount,
            'user_reaction' => $this->userReaction,
        ];
    }

    public function broadcastAs(): string
    {
        return 'comment.reaction.updated';
    }
}