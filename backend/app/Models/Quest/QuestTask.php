<?php

namespace App\Models\Quest;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class QuestTask extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = 'quest_tasks';

    protected $fillable = [
        'quest_id',
        'owner_id',
        'title',
        'description',
        'task_type',
        'serial_number',
        'task_data',
        'is_required',
        'deleted_at',
        'created_at',
        'updated_at',
    ];

    protected $casts = [
        'task_data' => 'array',
        'is_required' => 'boolean',
        'deleted_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'owner_id' => 'integer',
    ];

    protected $hidden = [
        'deleted_at',
    ];

    public function quest()
    {
        return $this->belongsTo(Quest::class);
    }

    public function prerequisites()
    {
        return $this->belongsToMany(QuestTask::class, 'quest_task_dependencies', 'task_id', 'prerequisite_task_id')
            ->withTimestamps();
    }

    public function dependents()
    {
        return $this->belongsToMany(QuestTask::class, 'quest_task_dependencies', 'prerequisite_task_id', 'task_id')
            ->withTimestamps();
    }

    public function completions()
    {
        return $this->hasMany(QuestTaskCompletion::class, 'task_id');
    }

    // Bank category tracked on quest bank tasks, not on attached tasks

    public function owner()
    {
        return $this->belongsTo(\App\Models\User::class, 'owner_id');
    }

    public function scopePublished($query)
    {
        return $query->whereNull('deleted_at');
    }

    public function scopeArchived($query)
    {
        return $query->whereNotNull('deleted_at');
    }

    public function scopeQuestId($query, $questId)
    {
        return $query->where('quest_id', $questId);
    }

    public function scopeActive($query)
    {
        return $query->whereNull('deleted_at')
            ->whereHas('quest', function ($q) {
                $q->whereNull('deleted_at')
                    ->where(function ($q) {
                        $q->whereNull('end_datetime')
                            ->orWhere('end_datetime', '>', now());
                    });
            });
    }

    public function scopeVisibleToUser($query, $user)
    {
        return $query->whereHas('quest', function ($q) use ($user) {
            $q->where(function ($q) use ($user) {
                $q->where('visibility', 'public')
                    ->orWhere('creator_id', $user->id)
                    ->orWhereHas('participants', function ($q) use ($user) {
                        $q->where('user_id', $user->id);
                    });
            });
        });
    }

    public function scopeWithQuest($query)
    {
        return $query->with('quest');
    }

    public function scopeWithPrerequisites($query)
    {
        return $query->with('prerequisites');
    }

    public function scopeWithDependents($query)
    {
        return $query->with('dependents');
    }

    public function scopeWithTimestamps($query)
    {
        return $query->withTimestamps();
    }

    public function scopeWithSoftDeletes($query)
    {
        return $query->withTrashed();
    }

    public function scopeWithCreator($query)
    {
        return $query->with('quest.creator');
    }

    public function scopeWithoutSoftDeletes($query)
    {
        return $query->withoutTrashed();
    }

    public function scopeCompleted($query)
    {
        return $query->whereNotNull('end_datetime')
            ->where('end_datetime', '<=', now());
    }

    public function scopeDraft($query)
    {
        return $query->whereNull('end_datetime')
            ->orWhere('end_datetime', '>', now());
    }

    public function scopeWithDescription($query)
    {
        return $query->with('description');
    }

    public function scopeWithTaskType($query)
    {
        return $query->with('task_type');
    }

    public function scopeWithSerialNumber($query)
    {
        return $query->with('serial_number');
    }

    public function scopeWithTaskData($query)
    {
        return $query->with('task_data');
    }

    public function scopeWithIsRequired($query)
    {
        return $query->with('is_required');
    }

    public function scopeWithDeletedAt($query)
    {
        return $query->with('deleted_at');
    }

    public function scopeWithCreatedAt($query)
    {
        return $query->with('created_at');
    }

    public function scopeWithUpdatedAt($query)
    {
        return $query->with('updated_at');
    }

    public function scopeSearch($query, $searchTerm)
    {
        return $query->where('title', 'like', '%' . $searchTerm . '%')
            ->orWhere('description', 'like', '%' . $searchTerm . '%');
    }

    public function scopeSortBy($query, $sortBy, $sortOrder = 'asc')
    {
        return $query->orderBy($sortBy, $sortOrder);
    }

    public function scopeOrderByCreatedAt($query, $direction = 'desc')
    {
        return $query->orderBy('created_at', $direction);
    }

    public function scopeOrderByUpdatedAt($query, $direction = 'desc')
    {
        return $query->orderBy('updated_at', $direction);
    }

    public function scopeOrderBySerialNumber($query, $direction = 'asc')
    {
        return $query->orderBy('serial_number', $direction);
    }

    public function scopeOrderByTitle($query, $direction = 'asc')
    {
        return $query->orderBy('title', $direction);
    }

    public function scopeOrderByTaskType($query, $direction = 'asc')
    {
        return $query->orderBy('task_type', $direction);
    }

    public function scopeOrderByIsRequired($query, $direction = 'asc')
    {
        return $query->orderBy('is_required', $direction);
    }

    public function scopeOrderByTaskData($query, $direction = 'asc')
    {
        return $query->orderBy('task_data', $direction);
    }

    public function scopeOrderByDescription($query, $direction = 'asc')
    {
        return $query->orderBy('description', $direction);
    }

    public function scopeOrderByDeletedAt($query, $direction = 'asc')
    {
        return $query->orderBy('deleted_at', $direction);
    }

    public function scopeOrderByEndDatetime($query, $direction = 'asc')
    {
        return $query->orderBy('end_datetime', $direction);
    }

    public function scopeOrderByStartDatetime($query, $direction = 'asc')
    {
        return $query->orderBy('start_datetime', $direction);
    }

    public function scopeOrderByJoinLink($query, $direction = 'asc')
    {
        return $query->orderBy('join_link', $direction);
    }

    public function scopeOrderByJoinCode($query, $direction = 'asc')
    {
        return $query->orderBy('join_code', $direction);
    }

    public function scopeOrderByVisibility($query, $direction = 'asc')
    {
        return $query->orderBy('visibility', $direction);
    }

    public function scopeOrderByCreatorId($query, $direction = 'asc')
    {
        return $query->orderBy('creator_id', $direction);
    }

    public function scopeOrderByIsPublished($query, $direction = 'asc')
    {
        return $query->orderBy('is_published', $direction);
    }

    public function scopeOrderByTimezone($query, $direction = 'asc')
    {
        return $query->orderBy('timezone', $direction);
    }

    public function scopeOrderBySequentialProgression($query, $direction = 'asc')
    {
        return $query->orderBy('sequential_progression', $direction);
    }
}
