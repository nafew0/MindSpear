<?php

namespace App\Jobs\Live;

use App\Services\Live\LiveAggregateService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class BroadcastLiveAggregateSnapshot implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly string $module,
        public readonly int $sessionId,
        public readonly int $itemId,
    ) {}

    public function handle(LiveAggregateService $aggregates): void
    {
        $aggregates->broadcastSnapshot($this->module, $this->sessionId, $this->itemId);
    }
}
