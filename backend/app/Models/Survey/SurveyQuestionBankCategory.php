<?php

namespace App\Models\Survey;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class SurveyQuestionBankCategory extends Model
{
    protected $table = 'survey_q_bank_categories';

    protected $fillable = [
        'name', 'description', 'is_parent', 'parent_category_id', 'created_by',
    ];

    public function parentCategory()
    {
        return $this->belongsTo(SurveyQuestionBankCategory::class, 'parent_category_id');
    }

    public function subCategories()
    {
        return $this->hasMany(SurveyQuestionBankCategory::class, 'parent_category_id');
    }

    public function banks()
    {
        return $this->hasMany(SurveyQuestionBank::class, 'survey_q_bank_category_id');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}

