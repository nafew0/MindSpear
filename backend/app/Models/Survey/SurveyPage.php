<?php

namespace App\Models\Survey;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SurveyPage extends Model
{
    use SoftDeletes;

    protected $table = 'survey_pages';

    protected $fillable = [
        'survey_id',
        'page_number',
        'title',
        'description',
        'has_conditional_logic',
        'conditional_parent_type',
        'conditional_question_id',
        // sections removed
        'conditional_page_id',
        'conditional_value',
        'conditional_operator',
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    protected $casts = [
        'title' => 'string',
        'description' => 'string',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    public function survey()
    {
        return $this->belongsTo(Survey::class);
    }

    // Sections removed

    public function questions()
    {
        return $this->hasMany(SurveyQuestion::class, 'page_id');
    }

    public function pages()
    {
        return $this->hasMany(SurveyPage::class, 'survey_id');
    }

    // Sections removed

    public function surveyQuestions()
    {
        return $this->hasMany(SurveyQuestion::class, 'page_id');
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

    public function scopeOrdered($query)
    {
        return $query->orderBy('page_number');
    }

    public function scopeWithQuestions($query)
    {
        return $query->with('surveyQuestions');
    }

    public function scopeWithSurvey($query)
    {
        return $query->with('survey');
    }

    public function scopeFilterByTitle($query, $title)
    {
        return $query->where('title', 'like', '%' . $title . '%');
    }

    public function scopeFilterByDescription($query, $description)
    {
        return $query->where('description', 'like', '%' . $description . '%');
    }

    public function scopeFilterByPaginate($query, $perPage = 15)
    {
        return $query->paginate($perPage);
    }

    public function scopeFilterByPageNumber($query, $pageNumber)
    {
        return $query->where('page_number', $pageNumber);
    }

    public function scopeFilterBySurveyId($query, $surveyId)
    {
        return $query->where('survey_id', $surveyId);
    }

    public function scopeFilterByDeleted($query, $deleted = false)
    {
        if ($deleted) {
            return $query->whereNotNull('deleted_at');
        }

        return $query->whereNull('deleted_at');
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

    public function scopeWithSurveyQuestions($query)
    {
        return $query->with('surveyQuestions');
    }

    public function scopeWithSurveyAndQuestions($query)
    {
        return $query->with(['survey', 'surveyQuestions']);
    }

    public function scopeWithSurveyAndQuestionsPaginated($query, $perPage = 15)
    {
        return $query->with(['survey', 'surveyQuestions'])->paginate($perPage);
    }

    public function scopeWithSurveyAndQuestionsOrdered($query)
    {
        return $query->with(['survey', 'surveyQuestions'])->orderBy('page_number');
    }

    public function scopeWithSurveyAndQuestionsFiltered($query, $filters)
    {
        if (isset($filters['title'])) {
            $query->filterByTitle($filters['title']);
        }
        if (isset($filters['description'])) {
            $query->filterByDescription($filters['description']);
        }
        if (isset($filters['page_number'])) {
            $query->filterByPageNumber($filters['page_number']);
        }
        if (isset($filters['survey_id'])) {
            $query->filterBySurveyId($filters['survey_id']);
        }
        if (isset($filters['deleted'])) {
            $query->filterByDeleted($filters['deleted']);
        }

        return $query;
    }

    public function scopeWithSurveyAndQuestionsFilteredPaginated($query, $filters, $perPage = 15)
    {
        $query = $this->scopeWithSurveyAndQuestionsFiltered($query, $filters);

        return $query->paginate($perPage);
    }

    public function scopeWithSurveyAndQuestionsOrderedPaginated($query, $perPage = 15)
    {
        return $query->with(['survey', 'surveyQuestions'])->orderBy('page_number')->paginate($perPage);
    }

    public function scopeWithSurveyAndQuestionsActive($query)
    {
        return $query->with(['survey', 'surveyQuestions'])->whereNull('deleted_at');
    }

    public function scopeWithSurveyAndQuestionsInactive($query)
    {
        return $query->with(['survey', 'surveyQuestions'])->whereNotNull('deleted_at');
    }

    public function scopeWithSurveyAndQuestionsBySurvey($query, $surveyId)
    {
        return $query->with(['survey', 'surveyQuestions'])->where('survey_id', $surveyId);
    }

    public function scopeWithSurveyAndQuestionsByPageNumber($query, $pageNumber)
    {
        return $query->with(['survey', 'surveyQuestions'])->where('page_number', $pageNumber);
    }

    public function scopeWithSurveyAndQuestionsByTitle($query, $title)
    {
        return $query->with(['survey', 'surveyQuestions'])->where('title', 'like', '%' . $title . '%');
    }

    public function scopeWithSurveyAndQuestionsByDescription($query, $description)
    {
        return $query->with(['survey', 'surveyQuestions'])->where('description', 'like', '%' . $description . '%');
    }

    public function scopeWithSurveyAndQuestionsByDeleted($query, $deleted = false)
    {
        if ($deleted) {
            return $query->with(['survey', 'surveyQuestions'])->whereNotNull('deleted_at');
        }

        return $query->with(['survey', 'surveyQuestions'])->whereNull('deleted_at');
    }

    public function scopeWithSurveyAndQuestionsByPaginate($query, $perPage = 15)
    {
        return $query->with(['survey', 'surveyQuestions'])->paginate($perPage);
    }

    public function scopeWithSurveyAndQuestionsBySurveyId($query, $surveyId)
    {
        return $query->with(['survey', 'surveyQuestions'])->where('survey_id', $surveyId);
    }

    public function scopeWithSurveyAndQuestionsByPageId($query, $pageId)
    {
        return $query->with(['survey', 'surveyQuestions'])->where('id', $pageId);
    }

    public function scopeWithSurveyAndQuestionsByTitleAndDescription($query, $title, $description)
    {
        return $query->with(['survey', 'surveyQuestions'])
            ->where('title', 'like', '%' . $title . '%')
            ->orWhere('description', 'like', '%' . $description . '%');
    }

    public function scopeWithSurveyAndQuestionsByTitleOrDescription($query, $title, $description)
    {
        return $query->with(['survey', 'surveyQuestions'])
            ->where('title', 'like', '%' . $title . '%')
            ->orWhere('description', 'like', '%' . $description . '%');
    }

    public function scopeWithSurveyAndQuestionsByTitleAndPageNumber($query, $title, $pageNumber)
    {
        return $query->with(['survey', 'surveyQuestions'])
            ->where('title', 'like', '%' . $title . '%')
            ->where('page_number', $pageNumber);
    }

    public function scopeWithSurveyAndQuestionsByDescriptionAndPageNumber($query, $description, $pageNumber)
    {
        return $query->with(['survey', 'surveyQuestions'])
            ->where('description', 'like', '%' . $description . '%')
            ->where('page_number', $pageNumber);
    }

    public function scopeWithSurveyAndQuestionsByTitleOrPageNumber($query, $title, $pageNumber)
    {
        return $query->with(['survey', 'surveyQuestions'])
            ->where('title', 'like', '%' . $title . '%')
            ->orWhere('page_number', $pageNumber);
    }

    public function scopeWithSurveyAndQuestionsByDescriptionOrPageNumber($query, $description, $pageNumber)
    {
        return $query->with(['survey', 'surveyQuestions'])
            ->where('description', 'like', '%' . $description . '%')
            ->orWhere('page_number', $pageNumber);
    }

    public function scopeWithSurveyAndQuestionsByTitleAndSurveyId($query, $title, $surveyId)
    {
        return $query->with(['survey', 'surveyQuestions'])
            ->where('title', 'like', '%' . $title . '%')
            ->where('survey_id', $surveyId);
    }

    public function scopeWithSurveyAndQuestionsByDescriptionAndSurveyId($query, $description, $surveyId)
    {
        return $query->with(['survey', 'surveyQuestions'])
            ->where('description', 'like', '%' . $description . '%')
            ->where('survey_id', $surveyId);
    }

    public function scopeWithSurveyAndQuestionsByTitleOrSurveyId($query, $title, $surveyId)
    {
        return $query->with(['survey', 'surveyQuestions'])
            ->where('title', 'like', '%' . $title . '%')
            ->orWhere('survey_id', $surveyId);
    }

    public function scopeWithSurveyAndQuestionsByDescriptionOrSurveyId($query, $description, $surveyId)
    {
        return $query->with(['survey', 'surveyQuestions'])
            ->where('description', 'like', '%' . $description . '%')
            ->orWhere('survey_id', $surveyId);
    }

    public function scopeWithSurveyAndQuestionsByPageIdAndSurveyId($query, $pageId, $surveyId)
    {
        return $query->with(['survey', 'surveyQuestions'])
            ->where('id', $pageId)
            ->where('survey_id', $surveyId);
    }

    public function scopeWithSurveyAndQuestionsByPageIdOrSurveyId($query, $pageId, $surveyId)
    {
        return $query->with(['survey', 'surveyQuestions'])
            ->where('id', $pageId)
            ->orWhere('survey_id', $surveyId);
    }

    public function scopeWithSurveyAndQuestionsByPageIdAndTitle($query, $pageId, $title)
    {
        return $query->with(['survey', 'surveyQuestions'])
            ->where('id', $pageId)
            ->where('title', 'like', '%' . $title . '%');
    }

    public function scopeWithSurveyAndQuestionsByPageIdAndDescription($query, $pageId, $description)
    {
        return $query->with(['survey', 'surveyQuestions'])
            ->where('id', $pageId)
            ->where('description', 'like', '%' . $description . '%');
    }

    public function scopeWithSurveyAndQuestionsByPageIdOrTitle($query, $pageId, $title)
    {
        return $query->with(['survey', 'surveyQuestions'])
            ->where('id', $pageId)
            ->orWhere('title', 'like', '%' . $title . '%');
    }
}
