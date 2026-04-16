<?php

namespace App\Models\Survey;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class BankQuestion extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = 'survey_bank_questions';

    protected $fillable = [
        'q_bank_category_id',
        'owner_id',
        'question_text',
        'question_type',
        'options',
        'is_required',
        'visibility',
        'display_type',
        'display_conditions',
    ];

    protected $casts = [
        'options' => 'array',
        'is_required' => 'boolean',
        'display_conditions' => 'array',
    ];

    public function category()
    {
        return $this->belongsTo(SurveyQuestionBankCategory::class, 'q_bank_category_id');
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }
}

