<?php

namespace App\Models\Quiz;

use Illuminate\Database\Eloquent\Model;

class UserQuizAnswer extends Model
{
    protected $fillable = [
        'quiz_participant_id',
        'question_id',
        'answer_data',
        'time_taken_seconds',
    ];

    protected $casts = [
        'answer_data' => 'array',
        'time_taken_seconds' => 'integer',
    ];

    public function quizParticipant()
    {
        return $this->belongsTo(QuizParticipant::class);
    }

    public function question()
    {
        return $this->belongsTo(Question::class);
    }

    // public function getAnswerDataAttribute($value)
    // {
    //     return json_decode($value, true);
    // }

    // public function setAnswerDataAttribute($value)
    // {
    //     $this->attributes['answer_data'] = json_encode($value);
    // }

    // public function getTimeTakenSecondsAttribute($value)
    // {
    //     return (int) $value;
    // }

    // public function setTimeTakenSecondsAttribute($value)
    // {
    //     $this->attributes['time_taken_seconds'] = (int) $value;
    // }

    public function scopeQuizParticipantId($query, $quizParticipantId)
    {
        return $query->where('quiz_participant_id', $quizParticipantId);
    }

    public function scopeQuestionId($query, $questionId)
    {
        return $query->where('question_id', $questionId);
    }

    public function scopeTimeTakenSeconds($query, $timeTakenSeconds)
    {
        return $query->where('time_taken_seconds', $timeTakenSeconds);
    }

    public function scopeAnswerData($query, $answerData)
    {
        return $query->where('answer_data', 'like', '%' . $answerData . '%');
    }

    public function scopeCreatedAt($query, $createdAt)
    {
        return $query->whereDate('created_at', $createdAt);
    }

    public function scopeUpdatedAt($query, $updatedAt)
    {
        return $query->whereDate('updated_at', $updatedAt);
    }

    public function scopeCreatedBetween($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    public function scopeUpdatedBetween($query, $startDate, $endDate)
    {
        return $query->whereBetween('updated_at', [$startDate, $endDate]);
    }

    public function scopeOrderByCreatedAt($query, $direction = 'asc')
    {
        return $query->orderBy('created_at', $direction);
    }

    public function scopeOrderByUpdatedAt($query, $direction = 'asc')
    {
        return $query->orderBy('updated_at', $direction);
    }

    public function scopeOrderByTimeTakenSeconds($query, $direction = 'asc')
    {
        return $query->orderBy('time_taken_seconds', $direction);
    }

    public function scopeOrderByAnswerData($query, $direction = 'asc')
    {
        return $query->orderBy('answer_data', $direction);
    }

    public function scopeOrderByQuestionId($query, $direction = 'asc')
    {
        return $query->orderBy('question_id', $direction);
    }

    public function scopeOrderByQuizParticipantId($query, $direction = 'asc')
    {
        return $query->orderBy('quiz_participant_id', $direction);
    }

    public function scopeOrderById($query, $direction = 'asc')
    {
        return $query->orderBy('id', $direction);
    }

    public function scopeLimit($query, $limit)
    {
        return $query->limit($limit);
    }

    public function scopeOffset($query, $offset)
    {
        return $query->offset($offset);
    }

    public function scopePaginate($query, $perPage = 15)
    {
        return $query->paginate($perPage);
    }

    public function scopeWithTrashed($query)
    {
        return $query->withTrashed();
    }

    public function scopeOnlyTrashed($query)
    {
        return $query->onlyTrashed();
    }

    public function scopeRestore($query)
    {
        return $query->restore();
    }

    public function scopeForceDelete($query)
    {
        return $query->forceDelete();
    }
}
