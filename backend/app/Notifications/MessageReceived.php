<?php

namespace App\Notifications;

use App\Models\User;
use App\Models\Message;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class MessageReceived extends Notification implements ShouldQueue
{
    use Queueable;

    protected User $sender;
    protected Message $message;

    public function __construct(User $sender, Message $message)
    {
        $this->sender = $sender;
        $this->message = $message;
    }

    public function via($notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('New message from ' . $this->sender->name)
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('You have a new message from ' . $this->sender->name . ':')
            ->line('"' . substr($this->message->content, 0, 100) . '..."')
            ->action('Read Message', url('/messages/' . $this->sender->username))
            ->line('Reply directly from your inbox!');
    }

    public function toArray($notifiable): array
    {
        return [
            'type' => 'message_received',
            'sender_id' => $this->sender->id,
            'sender_name' => $this->sender->name,
            'sender_username' => $this->sender->username,
            'sender_avatar' => $this->sender->avatar,
            'message_id' => $this->message->id,
            'message_preview' => substr($this->message->content, 0, 100),
            'message' => 'New message from ' . $this->sender->name,
        ];
    }
}