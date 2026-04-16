<?php

namespace App\Models\Survey;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class SurveyResponse extends Model
{
    protected $table = 'survey_responses';

    protected $fillable = [
        'survey_id',
        'respondent_id',
        'is_anonymous',
        'anonymous_details',
        'start_time',
        'end_time',
        'submitted_at',
        'status',
        'current_page_id',
        // sections removed
        'progress_data',
    ];

    protected $casts = [
        'is_anonymous' => 'boolean',
        'anonymous_details' => 'array',
        'start_time' => 'datetime',
        'end_time' => 'datetime',
        'submitted_at' => 'datetime',
        'progress_data' => 'array',
    ];

    // Relationships
    public function survey()
    {
        return $this->belongsTo(Survey::class);
    }

    public function respondent()
    {
        return $this->belongsTo(User::class, 'respondent_id');
    }

    public function answers()
    {
        return $this->hasMany(SurveyQuestionAnswer::class, 'response_id');
    }

    // Backward-compatible alias used by some controllers
    public function questionAnswers()
    {
        return $this->answers();
    }

    public function currentPage()
    {
        return $this->belongsTo(SurveyPage::class, 'current_page_id');
    }

    // Sections removed

    // Helper method to get all answers with their questions
    public function answersWithQuestions()
    {
        return $this->answers()->with('question');
    }

    // Helper method to get percentage of completion
    public function completionPercentage()
    {
        if ($this->status === 'Completed') {
            return 100;
        }

        // You can implement logic based on progress_data
        return 0;
    }

    // Scopes
    public function scopeSurveyId($query, $surveyId)
    {
        return $query->where('survey_id', $surveyId);
    }

    public function scopeRespondentId($query, $respondentId)
    {
        return $query->where('respondent_id', $respondentId);
    }

    public function scopeStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeIsAnonymous($query, $isAnonymous)
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

    public function scopeSurveyIdNotNull($query)
    {
        return $query->whereNotNull('survey_id');
    }

    public function scopeOrderByColumn($query, $column, $direction = 'asc')
    {
        return $query->orderBy($column, $direction);
    }
}
