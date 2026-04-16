<?php

namespace App\Models\Quiz;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class BankQuestion extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = 'quiz_bank_questions';

    protected $fillable = [
        'q_bank_category_id',
        'owner_id',
        'question_text',
        'question_type',
        'time_limit_seconds',
        'points',
        'is_ai_generated',
        'source_content_url',
        'visibility',
        'options',
    ];

    protected $casts = [
        'is_ai_generated' => 'boolean',
        'options' => 'array',
        'time_limit_seconds' => 'integer',
        'points' => 'integer',
    ];

    public function getSourceContentUrlAttribute($url)
    {
        return $url ? url($url) : null;
    }

    public function category()
    {
        return $this->belongsTo(QuestionBankCategory::class, 'q_bank_category_id');
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }
}

