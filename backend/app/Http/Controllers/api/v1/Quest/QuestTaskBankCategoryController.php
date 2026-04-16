<?php

namespace App\Http\Controllers\api\v1\Quest;

use App\Http\Controllers\api\v1\ApiBaseController;
use App\Models\Quest\QuestTaskBankCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class QuestTaskBankCategoryController extends ApiBaseController
{
    public function index(Request $request): JsonResponse
    {
        $query = QuestTaskBankCategory::query()->with([
                'parentCategory',
                'subCategories',
                'createdBy' => function ($q) {
                    $q->select('id', 'first_name', 'last_name', 'email', 'profile_picture');
                },
            ])
            ->where('created_by', auth()->id());
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }
        if ($request->has('is_parent')) {
            $query->where('is_parent', (bool) $request->boolean('is_parent'));
        }
        $perPage = min((int) $request->input('per_page', 15), 100);
        $categories = $query->orderBy('id', 'desc')->paginate($perPage);
        return $this->okResponse(['categories' => $categories], __('Quest task bank categories retrieved successfully'));
    }
}
