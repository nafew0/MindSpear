<?php

namespace App\Models\Quiz;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class QuestionBankCategory extends Model
{
    protected $table = 'quiz_q_bank_categories';

    protected $fillable = [
        'name',
        'description',
        'is_parent',
        'color_code',
        'parent_category_id',
        'created_by',
    ];

    public function parentCategory()
    {
        return $this->belongsTo(QuestionBankCategory::class, 'parent_category_id');
    }

    public function subCategories()
    {
        return $this->hasMany(QuestionBankCategory::class, 'parent_category_id');
    }

    // A category now directly owns bank questions
    public function questions()
    {
        return $this->hasMany(BankQuestion::class, 'q_bank_category_id');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopeParentCategories($query)
    {
        return $query->where('is_parent', true);
    }

    public function scopeChildCategories($query)
    {
        return $query->where('is_parent', false);
    }

    public function scopeWithParentCategory($query)
    {
        return $query->with('parentCategory');
    }

    public function scopeWithSubCategories($query)
    {
        return $query->with('subCategories');
    }

    public function scopeWithQuestions($query)
    {
        return $query->with('questions');
    }

    public function scopeWithCreatedBy($query)
    {
        return $query->with('createdBy');
    }

    public function scopeSearch($query, $searchTerm)
    {
        return $query->where('name', 'like', '%' . $searchTerm . '%')
            ->orWhere('description', 'like', '%' . $searchTerm . '%');
    }

    public function scopeFilterByParent($query, $isParent)
    {
        return $query->where('is_parent', $isParent);
    }

    public function scopeFilterByCreatedBy($query, $userId)
    {
        return $query->where('created_by', $userId);
    }

    public function scopeSort($query, $column = 'created_at', $direction = 'desc')
    {
        $allowed = ['name', 'created_at', 'updated_at'];

        if (in_array($column, $allowed)) {
            return $query->orderBy($column, $direction);
        }

        return $query;
    }

    public function scopePaginateCategories($query, $perPage = 15)
    {
        return $query->paginate($perPage);
    }

    public function scopeGetAllCategories($query)
    {
        return $query->get();
    }

    public function scopeGetCategoryById($query, $id)
    {
        return $query->find($id);
    }

    public function scopeCreateCategory($query, $data)
    {
        return $query->create($data);
    }

    public function scopeUpdateCategory($query, $id, $data)
    {
        $category = $query->find($id);

        if ($category) {
            $category->update($data);

            return $category;
        }

        return null;
    }

    public function scopeDeleteCategory($query, $id)
    {
        $category = $query->find($id);

        if ($category) {
            return $category->delete();
        }

        return false;
    }
}
