<?php

namespace App\Listeners;

use App\Models\Log\EmailLog;
use Illuminate\Mail\Events\MessageSent;

class LogEmailSent
{
    public function handle(MessageSent $event): void
    {
        // Recipients (supports Symfony Address objects and strings)
        $to = null;
        if (method_exists($event->message, 'getTo')) {
            $recipients = $event->message->getTo() ?? [];
            if (is_array($recipients) && ! empty($recipients)) {
                $to = collect($recipients)
                    ->map(function ($address) {
                        if (is_string($address)) {
                            return $address;
                        }
                        if (is_object($address)) {
                            if (method_exists($address, 'getAddress')) {
                                return $address->getAddress();
                            }
                            if (method_exists($address, '__toString')) {
                                return (string) $address;
                            }
                        }
                        return (string) $address;
                    })
                    ->implode(',');
            }
        }

        // Subject (if available)
        $subject = null;
        if (method_exists($event->message, 'getSubject')) {
            $subject = $event->message->getSubject();
        }

        // Best-effort Message-ID extraction (Symfony Mailer)
        $messageId = null;
        if (method_exists($event->message, 'getHeaders')) {
            try {
                $headers = $event->message->getHeaders();
                if (method_exists($headers, 'has') && $headers->has('Message-ID')) {
                    $messageIdHeader = $headers->get('Message-ID');
                    if (is_object($messageIdHeader) && method_exists($messageIdHeader, 'getBodyAsString')) {
                        $messageId = $messageIdHeader->getBodyAsString();
                    } else {
                        $messageId = (string) $messageIdHeader;
                    }
                } elseif (method_exists($headers, 'getHeaderBody')) {
                    $messageId = $headers->getHeaderBody('Message-ID');
                }
            } catch (\Throwable $e) {
                // ignore header parsing issues
            }
        }

        // Determine originating mailable/notification class if present
        $mailable = null;
        if (isset($event->data['mailable']) && is_object($event->data['mailable'])) {
            $mailable = get_class($event->data['mailable']);
        } elseif (isset($event->data['__laravel_notification']) && is_object($event->data['__laravel_notification'])) {
            $mailable = get_class($event->data['__laravel_notification']);
        }

        EmailLog::create([
            'to' => $to,
            'subject' => $subject,
            'mailable' => $mailable,
            'status' => 'sent',
            'message_id' => $messageId,
            'sent_at' => now(),
        ]);
    }
}
