<?php

namespace App\Models\Quest;

use Illuminate\Database\Eloquent\Model;

class QuestTaskDependency extends Model
{
    protected $table = 'quest_task_dependencies';

    protected $fillable = [
        'task_id',
        'prerequisite_task_id',
    ];

    public function task()
    {
        return $this->belongsTo(QuestTask::class, 'task_id');
    }

    public function prerequisiteTask()
    {
        return $this->belongsTo(QuestTask::class, 'prerequisite_task_id');
    }
}
