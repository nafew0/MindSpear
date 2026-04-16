<?php

namespace App\Models\Survey;

use Illuminate\Database\Eloquent\Model;

class SurveyQuestionAnswer extends Model
{
    protected $table = 'survey_question_answers';

    protected $fillable = [
        'response_id',
        'question_id',
        'answer_data',
        'is_validated',
        'validation_notes',
        'created_at',
        'updated_at',
    ];

    protected $casts = [
        'answer_data' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships
    public function response()
    {
        return $this->belongsTo(SurveyResponse::class, 'response_id');
    }

    public function question()
    {
        return $this->belongsTo(SurveyQuestion::class, 'question_id');
    }

    // Helper method to get the survey through relationships
    public function survey()
    {
        return $this->question->survey;
    }

    // Helper method to get the page through relationships
    public function page()
    {
        return $this->question->page;
    }

    // Helper method to get the section through relationships
    public function section()
    {
        return $this->question->section;
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->whereNull('deleted_at');
    }

    public function scopeInactive($query)
    {
        return $query->whereNotNull('deleted_at');
    }

    public function scopeByResponse($query, $responseId)
    {
        return $query->where('response_id', $responseId);
    }

    public function scopeByQuestion($query, $questionId)
    {
        return $query->where('question_id', $questionId);
    }

    public function scopeByValidationStatus($query, $isValidated)
    {
        return $query->where('is_validated', $isValidated);
    }

    public function scopeByValidationNotes($query, $notes)
    {
        return $query->where('validation_notes', 'like', '%' . $notes . '%');
    }
}
