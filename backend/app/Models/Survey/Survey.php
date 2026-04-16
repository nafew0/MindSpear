<?php

namespace App\Models\Survey;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class Survey extends Model
{
    protected $table = 'surveys';

    protected $fillable = [
        'title',
        'description',
        'creator_id',
        'origin_owner_id',
        'origin_owner_name',
        'origin_owner_profile_picture',
        'open_datetime',
        'close_datetime',
        'is_published',
        'join_link',
        'visibility',
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'open_datetime' => 'datetime',
        'close_datetime' => 'datetime',
        'join_link' => 'string',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
        'origin_owner_id' => 'integer',
    ];

    // Relationships
    public function creator()
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    public function pages()
    {
        return $this->hasMany(SurveyPage::class);
    }

    // Sections removed

    public function questions()
    {
        return $this->hasMany(SurveyQuestion::class);
    }

    public function responses()
    {
        return $this->hasMany(SurveyResponse::class);
    }

    public function publishedResponses()
    {
        return $this->responses()->where('status', 'Completed');
    }

    // Scopes
    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    public function scopeUnpublished($query)
    {
        return $query->where('is_published', false);
    }

    public function scopeActive($query)
    {
        return $query->where('open_datetime', '<=', now())
            ->where('close_datetime', '>=', now());
    }

    public function scopeUpcoming($query)
    {
        return $query->where('open_datetime', '>', now());
    }

    public function scopePast($query)
    {
        return $query->where('close_datetime', '<', now());
    }

    public function scopeWithCreator($query)
    {
        return $query->with('creator');
    }

    public function scopeWithQuestions($query)
    {
        return $query->with('surveyQuestions');
    }

    public function scopeWithResponses($query)
    {
        return $query->with('surveyResponses');
    }

    public function scopeSearch($query, $term)
    {
        return $query->whereRaw('LOWER(title) LIKE ?', ['%' . strtolower($term) . '%'])
            ->orWhereRaw('LOWER(description) LIKE ?', ['%' . strtolower($term) . '%']);
    }

    public function scopeFilterByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('open_datetime', [$startDate, $endDate])
            ->orWhereBetween('close_datetime', [$startDate, $endDate]);
    }

    public function scopeFilterByCreator($query, $creatorId)
    {
        return $query->where('creator_id', $creatorId);
    }

    public function scopeFilterByPublishedStatus($query, $isPublished)
    {
        return $query->where('is_published', $isPublished);
    }

    public function scopeFilterByJoinLink($query, $joinLink)
    {
        return $query->where('join_link', $joinLink);
    }

    public function scopeFilterByTitle($query, $title)
    {
        return $query->whereRaw('LOWER(title) LIKE ?', ['%' . strtolower($title) . '%']);
    }

    public function scopeFilterByDescription($query, $description)
    {
        return $query->whereRaw('LOWER(description) LIKE ?', ['%' . strtolower($description) . '%']);
    }

    public function scopeFilterByPaginate($query, $perPage = 15)
    {
        return $query->paginate($perPage);
    }

    public function scopePublic($query)
    {
        return $query->where('visibility', 'public');
    }

    public function scopePrivate($query)
    {
        return $query->where('visibility', 'private');
    }
}
