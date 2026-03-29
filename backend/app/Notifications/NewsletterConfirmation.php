<?php

namespace App\Notifications;

use App\Models\NewsletterSubscriber;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewsletterConfirmation extends Notification implements ShouldQueue
{
    use Queueable;

    protected NewsletterSubscriber $subscriber;

    public function __construct(NewsletterSubscriber $subscriber)
    {
        $this->subscriber = $subscriber;
    }

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        $confirmUrl = url('/newsletter/confirm/' . $this->subscriber->token);

        return (new MailMessage)
            ->subject('Confirm Your Newsletter Subscription')
            ->greeting('Hello!')
            ->line('Thank you for subscribing to our newsletter.')
            ->line('Please confirm your email address by clicking the button below:')
            ->action('Confirm Subscription', $confirmUrl)
            ->line('If you did not subscribe to our newsletter, no further action is required.')
            ->salutation('Best regards, ' . config('app.name'));
    }
}