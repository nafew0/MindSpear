<?php

namespace App\Models\Quiz;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class QuizOrigin extends Model
{
    protected $table = 'quiz_origins';

    protected $fillable = [
        'quiz_id',
        'origin_id',
    ];

    public function quiz()
    {
        return $this->belongsTo(Quiz::class, 'quiz_id');
    }

    public function origin()
    {
        return $this->belongsTo(User::class, 'origin_id');
    }
}
