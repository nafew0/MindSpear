<?php

namespace App\Models\Survey;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SurveyQuestion extends Model
{
    use SoftDeletes;

    protected $table = 'survey_questions';

    protected $fillable = [
        'survey_id',
        'page_id',
        'owner_id',
        'serial_number',
        'question_text',
        'question_type',
        'options',
        'is_required',
        'has_conditional_logic',
        'conditional_parent_type',
        'conditional_question_id',
        'conditional_page_id',
        'conditional_value',
        'conditional_operator',
        // sections removed
        'display_type',
        'display_conditions',
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    protected $casts = [
        'options' => 'array',
        'is_required' => 'boolean',
        'conditional_parent_id' => 'integer',
        'conditional_value' => 'string',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
        'survey_id' => 'integer',
        'page_id' => 'integer',
        'serial_number' => 'integer',
        'owner_id' => 'integer',
        'question_text' => 'string',
        'question_type' => 'string',
        'conditional_operator' => 'string',
        'display_conditions' => 'array',
    ];

    // Relationships
    public function survey()
    {
        return $this->belongsTo(Survey::class);
    }

    public function page()
    {
        return $this->belongsTo(SurveyPage::class);
    }

    // Sections removed

    public function answers()
    {
        return $this->hasMany(SurveyQuestionAnswer::class, 'question_id');
    }

    // Bank category is tracked on survey bank questions, not on attached questions

    public function owner()
    {
        return $this->belongsTo(\App\Models\User::class, 'owner_id');
    }

    // Conditional logic relationships
    public function conditionalQuestion()
    {
        return $this->belongsTo(SurveyQuestion::class, 'conditional_question_id');
    }

    // Sections removed

    public function conditionalParentPage()
    {
        return $this->belongsTo(SurveyPage::class, 'conditional_page_id');
    }

    // Questions that depend on this question (children)
    public function childQuestions()
    {
        return $this->hasMany(SurveyQuestion::class, 'conditional_question_id');
    }

    // Sections that depend on this question
    // Sections removed

    // Pages that depend on this question
    public function conditionalPages()
    {
        return $this->hasMany(SurveyPage::class, 'conditional_question_id');
    }

    // Responses that are currently on this question
    public function currentResponses()
    {
        return $this->hasMany(SurveyResponse::class, 'current_question_id');
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

    public function scopeBySurvey($query, $surveyId)
    {
        return $query->where('survey_id', $surveyId);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('question_type', $type);
    }

    public function scopeBySerialNumber($query, $serialNumber)
    {
        return $query->where('serial_number', $serialNumber);
    }

    public function scopeByConditionalParent($query, $parentId)
    {
        return $query->where('conditional_parent_id', $parentId);
    }

    public function scopeByConditionalValue($query, $value)
    {
        return $query->where('conditional_value', $value);
    }

    public function scopeWithOptions($query)
    {
        return $query->whereNotNull('options');
    }

    public function scopeRequired($query)
    {
        return $query->where('is_required', true);
    }

    public function scopeOptional($query)
    {
        return $query->where('is_required', false);
    }

    public function scopeWithTimestamps($query)
    {
        return $query->whereNotNull('created_at')->whereNotNull('updated_at');
    }

    public function scopeWithSoftDeletes($query)
    {
        return $query->whereNotNull('deleted_at');
    }

    public function scopeWithoutSoftDeletes($query)
    {
        return $query->whereNull('deleted_at');
    }

    public function scopeWithSurvey($query)
    {
        return $query->with('survey');
    }

    public function scopeWithConditionalParent($query)
    {
        return $query->with('conditionalParent');
    }

    public function scopeWithConditionalChildren($query)
    {
        return $query->with('conditionalChildren');
    }

    public function scopeWithAllRelations($query)
    {
        return $query->with(['survey', 'conditionalParent', 'conditionalChildren']);
    }

    public function scopeWithAllAttributes($query)
    {
        return $query->select($this->fillable);
    }

    public function scopeWithAllCasts($query)
    {
        return $query->select(array_keys($this->casts));
    }

    public function scopeWithAllScopes($query)
    {
        return $query->active()
            ->withSurvey()
            ->withConditionalParent()
            ->withConditionalChildren()
            ->withAllAttributes()
            ->withAllCasts();
    }

    public function scopeWithAll($query)
    {
        return $query->withAllRelations()
            ->withAllAttributes()
            ->withAllCasts()
            ->withAllScopes();
    }

    public function scopeWithAllData($query)
    {
        return $query->withAll()
            ->get();
    }

    public function scopeWithAllDataPaginated($query, $perPage = 15)
    {
        return $query->withAll()
            ->paginate($perPage);
    }

    public function scopeSearchByText($query, $text)
    {
        return $query->where('question_text', 'like', '%' . $text . '%');
    }

    public function scopeFilterByType($query, $type)
    {
        return $query->where('question_type', $type);
    }

    public function scopeFilterByIsRequired($query, $isRequired)
    {
        return $query->where('is_required', $isRequired);
    }

    public function scopeFilterByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('created_at', [$startDate, $endDate])
            ->orWhereBetween('updated_at', [$startDate, $endDate]);
    }

    public function scopeFilterByPaginate($query, $perPage = 15)
    {
        return $query->paginate($perPage);
    }

    public function scopeOrderBySerialNumber($query, $direction = 'asc')
    {
        return $query->orderBy('serial_number', $direction);
    }

    public function scopeOrderByCreatedAt($query, $direction = 'asc')
    {
        return $query->orderBy('created_at', $direction);
    }

    public function scopeOrderByUpdatedAt($query, $direction = 'asc')
    {
        return $query->orderBy('updated_at', $direction);
    }

    public function scopeOrderByQuestionText($query, $direction = 'asc')
    {
        return $query->orderBy('question_text', $direction);
    }

    public function scopeOrderByQuestionType($query, $direction = 'asc')
    {
        return $query->orderBy('question_type', $direction);
    }

    public function scopeOrderByIsRequired($query, $direction = 'asc')
    {
        return $query->orderBy('is_required', $direction);
    }

    public function scopeOrderBySerialNumberAndCreatedAt($query, $serialDirection = 'asc', $createdDirection = 'asc')
    {
        return $query->orderBy('serial_number', $serialDirection)
            ->orderBy('created_at', $createdDirection);
    }

    public function scopeOrderBySerialNumberAndUpdatedAt($query, $serialDirection = 'asc', $updatedDirection = 'asc')
    {
        return $query->orderBy('serial_number', $serialDirection)
            ->orderBy('updated_at', $updatedDirection);
    }

    public function scopeOrderByQuestionTypeAndCreatedAt($query, $typeDirection = 'asc', $createdDirection = 'asc')
    {
        return $query->orderBy('question_type', $typeDirection)
            ->orderBy('created_at', $createdDirection);
    }

    public function scopeOrderByQuestionTypeAndUpdatedAt($query, $typeDirection = 'asc', $updatedDirection = 'asc')
    {
        return $query->orderBy('question_type', $typeDirection)
            ->orderBy('updated_at', $updatedDirection);
    }

    public function scopeOrderByIsRequiredAndCreatedAt($query, $requiredDirection = 'asc', $createdDirection = 'asc')
    {
        return $query->orderBy('is_required', $requiredDirection)
            ->orderBy('created_at', $createdDirection);
    }

    public function scopeOrderByIsRequiredAndUpdatedAt($query, $requiredDirection = 'asc', $updatedDirection = 'asc')
    {
        return $query->orderBy('is_required', $requiredDirection)
            ->orderBy('updated_at', $updatedDirection);
    }
}
