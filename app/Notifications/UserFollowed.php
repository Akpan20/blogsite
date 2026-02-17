<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class UserFollowed extends Notification implements ShouldQueue
{
    use Queueable;

    protected User $follower;

    public function __construct(User $follower)
    {
        $this->follower = $follower;
    }

    public function via($notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject($this->follower->name . ' followed you!')
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line($this->follower->name . ' started following you.')
            ->action('View Profile', url('/profile/' . $this->follower->username))
            ->line('Keep creating great content!');
    }

    public function toArray($notifiable): array
    {
        return [
            'type' => 'user_followed',
            'follower_id' => $this->follower->id,
            'follower_name' => $this->follower->name,
            'follower_username' => $this->follower->username,
            'follower_avatar' => $this->follower->avatar,
            'message' => $this->follower->name . ' started following you',
        ];
    }
}