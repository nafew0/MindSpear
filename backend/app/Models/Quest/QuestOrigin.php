<?php

namespace App\Models\Quest;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class QuestOrigin extends Model
{
    protected $table = 'quest_origins';

    protected $fillable = [
        'quest_id',
        'origin_id',
    ];

    public function quest()
    {
        return $this->belongsTo(Quest::class, 'quest_id');
    }

    public function origin()
    {
        return $this->belongsTo(User::class, 'origin_id');
    }
}
