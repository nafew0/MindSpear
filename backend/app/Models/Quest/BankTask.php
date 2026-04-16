<?php

namespace App\Models\Quest;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class BankTask extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = 'quest_bank_tasks';

    protected $fillable = [
        'q_bank_category_id',
        'owner_id',
        'title',
        'description',
        'task_type',
        'task_data',
        'is_required',
        'visibility',
    ];

    protected $casts = [
        'task_data' => 'array',
        'is_required' => 'boolean',
    ];

    public function category()
    {
        return $this->belongsTo(QuestTaskBankCategory::class, 'q_bank_category_id');
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }
}

