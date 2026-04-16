<?php

namespace App\Models\Quiz;

use Illuminate\Database\Eloquent\Model;

class QuizSession extends Model
{
    protected $fillable = [
        'quiz_id',
        'title',
        'running_status',
        'public_channel_key',
        'current_question_id',
        'timer_state',
        'session_id',
        'start_datetime',
        'end_datetime',
        'timezone',
        'is_host_live',
        'join_link',
        'join_code',
        'quiztime_mode',
        'quiz_mode',
    ];

    protected $casts = [
        'running_status' => 'boolean',
        'timer_state' => 'array',
        'start_datetime' => 'datetime',
        'end_datetime' => 'datetime',
        'is_host_live' => 'boolean',
        'quiztime_mode' => 'boolean',
    ];

    public function quiz()
    {
        return $this->belongsTo(Quiz::class);
    }

    public function participants()
    {
        return $this->hasMany(QuizParticipant::class);
    }

    public function currentQuestion()
    {
        return $this->belongsTo(Question::class, 'current_question_id');
    }

    // Accessor and Query Scopes
    public function getJoinCodeAttribute($value)
    {
        return 'Q' . $value;
    }

    public function scopeIsActive($query)
    {
        $now = now()->setTimezone($this->timezone);

        return $query->whereBetween($now, [$this->start_datetime, $this->end_datetime]);
    }

    public function scopeQuizId($query, $quizId)
    {
        return $query->where('quiz_id', $quizId);
    }

    public function scopeSessionId($query, $sessionId)
    {
        return $query->where('session_id', $sessionId);
    }

    public function scopeRunningStatus($query, $status)
    {
        return $query->where('running_status', $status);
    }

    public function scopeIsHostLive($query, $isHostLive)
    {
        return $query->where('is_host_live', $isHostLive);
    }

    public function scopeQuiztimeMode($query, $quiztimeMode)
    {
        return $query->where('quiztime_mode', $quiztimeMode);
    }

    public function scopeQuizMode($query, $quizMode)
    {
        return $query->where('quiz_mode', $quizMode);
    }

    public function scopeLive($query)
    {
        return $query->where('running_status', true)
            ->orWhere(function ($q) {
                $q->where('running_status', 1);
            });
    }

    public function scopeCompleted($query)
    {
        return $query->where('end_datetime', '<=', now());
    }

    public function scopeUpcoming($query)
    {
        return $query->where('start_datetime', '>', now());
    }
}
