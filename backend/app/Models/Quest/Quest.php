<?php

namespace App\Models\Quest;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Quest extends Model
{
    use HasFactory;
    use SoftDeletes;

    public const STATUS_NOT_STARTED = 'Not Started';
    public const STATUS_INITIATED = 'Initiated';
    public const STATUS_RUNNING = 'Running';
    public const STATUS_ENDED = 'Ended';

    protected $fillable = [
        'title',
        'description',
        'creator_id',
        'origin_owner_id',
        'origin_owner_name',
        'origin_owner_profile_picture',
        'is_published',
        'start_datetime',
        'end_datetime',
        'visibility',
        'join_link',
        'join_code',
        'sequential_progression',
        'status',
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'start_datetime' => 'datetime',
        'end_datetime' => 'datetime',
        'sequential_progression' => 'boolean',
        'status' => 'string',
        'origin_owner_id' => 'integer',
    ];

    protected $hidden = [
        'deleted_at',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    public function tasks()
    {
        return $this->hasMany(QuestTask::class);
    }

    public function participants()
    {
        return $this->hasMany(QuestParticipant::class);
    }

    public function sessions()
    {
        return $this->hasMany(QuestSession::class);
    }

    // Accessor and Query Scopes
    public function getJoinCodeAttribute($value)
    {
        return 'T' . $value;
    }

    public function scopeArchived($query)
    {
        return $query->whereNotNull('deleted_at');
    }

    public function scopePublished($query, $isPublished = true)
    {
        return $query->where('is_published', $isPublished);
    }

    public function scopePublic($query, $visibility = 'public')
    {
        return $query->where('visibility', $visibility);
    }

    public function scopeActive($query)
    {
        return $query->whereNull('deleted_at')
            ->where(function ($q) {
                $q->whereNull('end_datetime')
                    ->orWhere('end_datetime', '>', now());
            });
    }

    public function scopeVisibleToUser($query, User $user)
    {
        return $query->where(function ($q) use ($user) {
            $q->where('visibility', 'public')
                ->orWhere('creator_id', $user->id)
                ->orWhereHas('participants', function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                });
        });
    }

    public function scopeWithTasks($query)
    {
        return $query->with('tasks');
    }

    public function scopeWithParticipants($query)
    {
        return $query->with('participants');
    }

    public function scopeWithCreator($query)
    {
        return $query->with('creator');
    }

    public function scopeWithTimestamps($query)
    {
        return $query->withTimestamps();
    }

    public function scopeWithSoftDeletes($query)
    {
        return $query->withTrashed();
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
        return $query->where('is_published', false)
            ->whereNull('deleted_at');
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

    public function scopePaginate($query, $perPage = 10)
    {
        return $query->paginate($perPage);
    }

    public function scopeForQuest($query, $questId)
    {
        return $query->find($questId);
    }
}
