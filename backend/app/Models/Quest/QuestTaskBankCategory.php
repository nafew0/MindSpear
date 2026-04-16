<?php

namespace App\Models\Quest;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class QuestTaskBankCategory extends Model
{
    protected $table = 'quest_task_bank_categories';

    protected $fillable = [
        'name', 'description', 'is_parent', 'parent_category_id', 'created_by',
    ];

    public function parentCategory()
    {
        return $this->belongsTo(QuestTaskBankCategory::class, 'parent_category_id');
    }

    public function subCategories()
    {
        return $this->hasMany(QuestTaskBankCategory::class, 'parent_category_id');
    }

    public function tasks()
    {
        return $this->hasMany(BankTask::class, 'q_bank_category_id');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
