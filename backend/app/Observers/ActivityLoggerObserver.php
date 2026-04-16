<?php

namespace App\Observers;

use App\Models\Log\ActivityLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Request;

class ActivityLoggerObserver
{
    public function created(Model $model): void
    {
        $this->log($model, 'created');
    }

    public function updated(Model $model): void
    {
        $changes = [
            'attributes' => $model->getChanges(),
            'original' => $model->getOriginal(),
        ];
        $this->log($model, 'updated', $changes);
    }

    public function deleted(Model $model): void
    {
        $this->log($model, 'deleted');
    }

    public function restored(Model $model): void
    {
        $this->log($model, 'restored');
    }

    protected function log(Model $model, string $event, array $changes = null): void
    {
        ActivityLog::create([
            'user_id' => optional(auth()->user())->id,
            'subject_type' => get_class($model),
            'subject_id' => $model->getKey(),
            'event' => $event,
            'changes' => $changes,
            'ip' => Request::ip(),
            'user_agent' => Request::userAgent(),
        ]);
    }
}

