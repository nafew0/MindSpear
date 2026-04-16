<?php

namespace App\Events\Live;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LiveBroadcastEvent implements ShouldBroadcastNow
{
    use Dispatchable;
    use SerializesModels;

    public function __construct(
        private readonly string $channelName,
        private readonly string $eventName,
        private readonly array $payload,
        private readonly bool $private = false,
    ) {}

    public function broadcastOn(): Channel|PrivateChannel
    {
        return $this->private
            ? new PrivateChannel($this->channelName)
            : new Channel($this->channelName);
    }

    public function broadcastAs(): string
    {
        return $this->eventName;
    }

    public function broadcastWith(): array
    {
        return $this->payload;
    }
}
