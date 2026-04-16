<?php

namespace App\Models\Quest;

use Illuminate\Database\Eloquent\Model;

class QuestTaskCompletion extends Model
{
    protected $table = 'quest_task_completions';

    protected $fillable = [
        'participant_id',
        'task_id',
        'status',
        'completed_at',
        'completion_data',
        'created_at',
        'updated_at',
    ];

    protected $casts = [
        'completed_at' => 'datetime',
        'completion_data' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function participant()
    {
        return $this->belongsTo(QuestParticipant::class, 'participant_id');
    }

    public function task()
    {
        return $this->belongsTo(QuestTask::class, 'task_id');
    }

    public function scopeByParticipantId($query, $participantId)
    {
        return $query->where('participant_id', $participantId);
    }

    public function scopeByTaskId($query, $taskId)
    {
        return $query->where('task_id', $taskId);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'Completed');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'Pending');
    }

    public function scopeSkipped($query)
    {
        return $query->where('status', 'Skipped');
    }

    public function scopeWithCompletionData($query)
    {
        return $query->whereNotNull('completion_data');
    }

    public function scopeWithoutCompletionData($query)
    {
        return $query->whereNull('completion_data');
    }

    public function scopeOrderByCompletedAt($query, $direction = 'desc')
    {
        return $query->orderBy('completed_at', $direction);
    }

    public function scopeOrderByCreatedAt($query, $direction = 'desc')
    {
        return $query->orderBy('created_at', $direction);
    }

    public function scopeOrderByUpdatedAt($query, $direction = 'desc')
    {
        return $query->orderBy('updated_at', $direction);
    }

    public function scopeSearch($query, $searchTerm)
    {
        return $query->where('completion_data', 'like', '%' . $searchTerm . '%');
    }

    public function scopeSortBy($query, $sortBy, $direction = 'asc')
    {
        return $query->orderBy($sortBy, $direction);
    }

    public function scopePaginate($query, $perPage = 15)
    {
        return $query->paginate($perPage);
    }

    public function scopeWithParticipant($query)
    {
        return $query->with('participant');
    }

    public function scopeWithTask($query)
    {
        return $query->with('task');
    }

    public function scopeWithParticipantAndTask($query)
    {
        return $query->with(['participant', 'task']);
    }
}
