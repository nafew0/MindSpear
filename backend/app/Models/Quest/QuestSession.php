<?php

namespace App\Models\Quest;

use Illuminate\Database\Eloquent\Model;

class QuestSession extends Model
{
    protected $fillable = [
        'quest_id',
        'title',
        'running_status',
        'session_id',
        'start_datetime',
        'end_datetime',
        'timezone',
    ];

    protected $casts = [
        'running_status' => 'boolean',
        'start_datetime' => 'datetime',
        'end_datetime' => 'datetime',
    ];

    public function quest()
    {
        return $this->belongsTo(Quest::class);
    }

    public function participants()
    {
        return $this->hasMany(QuestParticipant::class);
    }

    public function scopeIsActive($query)
    {
        $now = now()->setTimezone($this->timezone);

        return $query->whereBetween($now, [$this->start_datetime, $this->end_datetime]);
    }

    public function scopeQuestId($query, $questId)
    {
        return $query->where('quest_id', $questId);
    }

    public function scopeSessionId($query, $sessionId)
    {
        return $query->where('session_id', $sessionId);
    }

    public function scopeRunningStatus($query, $status)
    {
        return $query->where('running_status', $status);
    }
}
