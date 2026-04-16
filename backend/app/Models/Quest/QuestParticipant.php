<?php

namespace App\Models\Quest;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class QuestParticipant extends Model
{
    protected $table = 'quest_participants';

    protected $fillable = [
        'quest_id',
        'quest_session_id',
        'user_id',
        'is_anonymous',
        'anonymous_details',
        'start_time',
        'end_time',
        'status',
        'created_at',
        'updated_at',
    ];

    protected $casts = [
        'is_anonymous' => 'boolean',
        'anonymous_details' => 'array',
        'start_time' => 'datetime',
        'end_time' => 'datetime',
    ];

    public function quest()
    {
        return $this->belongsTo(Quest::class, 'quest_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function taskCompletions()
    {
        return $this->hasMany(QuestTaskCompletion::class, 'participant_id');
    }

    public function questSession()
    {
        return $this->belongsTo(QuestSession::class, 'quest_session_id');
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'In Progress');
    }

    public function scopeQuestId($query, $questId)
    {
        return $query->where('quest_id', $questId);
    }

    public function scopeQuestIdNotNull($query)
    {
        return $query->whereNotNull('quest_id');
    }

    public function scopeRespondentId($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeSearch($query, $searchTerm)
    {
        return $query->where('anonymous_details', 'like', '%' . $searchTerm . '%');
    }

    public function scopeSortBy($query, $sortBy, $direction = 'asc')
    {
        return $query->orderBy($sortBy, $direction);
    }

    public function scopeOrderByColumn($query, $column, $direction = 'asc')
    {
        return $query->orderBy($column, $direction);
    }

    public function scopeInProgress($query)
    {
        return $query->where('status', 'In Progress');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'Completed');
    }

    public function scopeFailed($query)
    {
        return $query->where('status', 'Failed');
    }

    public function scopeUserCurrentAttempts($query, $userId)
    {
        return $query->where('user_id', $userId)
            ->where('status', 'In Progress');
    }

    public function scopeUserAttemptHistory($query, $userId)
    {
        return $query->where('user_id', $userId)
            ->whereIn('status', ['Completed', 'Failed'])
            ->orderBy('end_time', 'desc');
    }

    public function scopeByJoinLink($query, $joinLink)
    {
        return $query->where('join_link', $joinLink);
    }

    public function scopeByJoinCode($query, $joinCode)
    {
        return $query->where('join_code', $joinCode);
    }

    public function scopeByAttemptId($query, $attemptId)
    {
        return $query->where('id', $attemptId);
    }

    public function scopeByUserId($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeByStartTime($query, $startTime)
    {
        return $query->where('start_time', '>=', $startTime);
    }

    public function scopeByEndTime($query, $endTime)
    {
        return $query->where('end_time', '<=', $endTime);
    }

    public function scopeByAnonymous($query, $isAnonymous)
    {
        return $query->where('is_anonymous', $isAnonymous);
    }

    public function scopeByAnonymousDetails($query, $details)
    {
        return $query->where('anonymous_details', 'like', '%' . $details . '%');
    }

    public function scopeByCreatedAt($query, $createdAt)
    {
        return $query->where('created_at', '>=', $createdAt);
    }

    public function scopeByUpdatedAt($query, $updatedAt)
    {
        return $query->where('updated_at', '>=', $updatedAt);
    }

    public function scopeByJoinLinkOrCode($query, $joinLink, $joinCode)
    {
        return $query->where(function ($q) use ($joinLink, $joinCode) {
            $q->where('join_link', $joinLink)
                ->orWhere('join_code', $joinCode);
        });
    }
}
