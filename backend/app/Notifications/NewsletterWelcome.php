<?php

namespace App\Notifications;

use App\Models\NewsletterSubscriber;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewsletterWelcome extends Notification implements ShouldQueue
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
        $unsubscribeUrl = url('/newsletter/unsubscribe/' . $this->subscriber->token);
        $preferencesUrl = url('/newsletter/preferences/' . $this->subscriber->token);

        return (new MailMessage)
            ->subject('Welcome to Our Newsletter! 🎉')
            ->greeting('Welcome aboard!')
            ->line('Thank you for confirming your subscription to our newsletter.')
            ->line('You will now receive our latest articles, updates, and exclusive content directly in your inbox.')
            ->line('We promise to send you only valuable content and never spam.')
            ->action('Visit Our Blog', url('/'))
            ->line('You can update your preferences or unsubscribe at any time:')
            ->line('[Update Preferences](' . $preferencesUrl . ') | [Unsubscribe](' . $unsubscribeUrl . ')')
            ->salutation('Happy reading! ' . config('app.name'));
    }
}