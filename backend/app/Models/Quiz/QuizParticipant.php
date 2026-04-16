<?php

namespace App\Models\Quiz;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class QuizParticipant extends Model
{
    protected $fillable = [
        'quiz_id',
        'user_id',
        'quiz_session_id',
        'is_anonymous',
        'anonymous_details',
        'start_time',
        'end_time',
        'score',
        'status',
    ];

    protected $casts = [
        'is_anonymous' => 'boolean',
        'anonymous_details' => 'array',
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'score' => 'integer',
        'status' => 'string',
    ];

    protected $appends = ['total_score'];

    public function quiz()
    {
        return $this->belongsTo(Quiz::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function userQuizAnswers()
    {
        return $this->hasMany(UserQuizAnswer::class);
    }

    public function quizSession()
    {
        return $this->belongsTo(QuizSession::class, 'quiz_session_id');
    }

    public function getStatusAttribute($value)
    {
        return $value === 'In Progress' ? 'In Progress' : ($value === 'Completed' ? 'Completed' : 'Abandoned');
    }

    public function getTotalScoreAttribute()
    {
        if (! $this->relationLoaded('quiz') || ! $this->quiz) {
            return 0;
        }

        return $this->quiz->questions
            ->whereNotNull('question_type') // Filter invalid questions
            ->sum('points');
    }

    public function scopeStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeQuizId($query, $quizId)
    {
        return $query->where('quiz_id', $quizId);
    }

    public function scopeQuizIdNull($query)
    {
        return $query->whereNull('quiz_id');
    }

    public function scopeQuizIdNotNull($query)
    {
        return $query->whereNotNull('quiz_id');
    }

    public function scopeUserId($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeUserIdNull($query)
    {
        return $query->whereNull('quiz_id');
    }

    public function scopeUserIdNotNull($query)
    {
        return $query->whereNotNull('quiz_id');
    }

    public function scopeAnonymous($query, $isAnonymous)
    {
        return $query->where('is_anonymous', $isAnonymous);
    }

    public function scopeStartTime($query, $startTime)
    {
        return $query->where('start_time', '>=', $startTime);
    }

    public function scopeEndTime($query, $endTime)
    {
        return $query->where('end_time', '<=', $endTime);
    }

    public function scopeScore($query, $score)
    {
        return $query->where('score', '>=', $score);
    }

    public function scopeOrderByColumn($query, $column = 'created_at', $direction = 'desc')
    {
        $sortable = ['id', 'created_at', 'updated_at'];

        $column = in_array($column, $sortable) ? $column : 'created_at';
        $direction = in_array(strtolower($direction), ['asc', 'desc']) ? $direction : 'desc';

        return $query->orderBy($column, $direction);
    }

    public function scopeOrderByCreatedAt($query, $direction = 'desc')
    {
        return $query->scopeOrderByColumn('created_at', $direction);
    }

    public function scopeAnonymousDetails($query, $anonymousDetails)
    {
        return $query->where('anonymous_details', 'LIKE', '%' . $anonymousDetails . '%');
    }
}
