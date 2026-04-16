<?php

namespace App\Http\Controllers\api\v1\Survey;

use App\Http\Controllers\api\v1\ApiBaseController;
use App\Http\Requests\Survey\QuestionBankCategory\StoreRequest;
use App\Http\Requests\Survey\QuestionBankCategory\UpdateRequest;
use App\Models\Survey\SurveyQuestionBankCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class SurveyQuestionBankCategoryController extends ApiBaseController
{
    public function index(Request $request): JsonResponse
    {
        $query = SurveyQuestionBankCategory::query()->with([
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

        return $this->okResponse(['categories' => $categories], __('Survey question bank categories retrieved successfully'));
    }

    public function store(StoreRequest $request): JsonResponse
    {
        try {
            $data = $request->validated();
            $data['created_by'] = auth()->id();
            $category = SurveyQuestionBankCategory::create($data);
            return $this->createdResponse(['category' => $category], __('Survey question bank category created successfully'));
        } catch (\Throwable $e) {
            Log::error('Create survey bank category failed', ['e' => $e]);
            return $this->serverErrorResponse(['error' => $e->getMessage()], __('Failed to create survey question bank category'));
        }
    }

    public function show(int $id): JsonResponse
    {
        $category = SurveyQuestionBankCategory::with([
                'parentCategory',
                'subCategories',
                'createdBy' => function ($q) {
                    $q->select('id', 'first_name', 'last_name', 'email', 'profile_picture');
                },
            ])
            ->where('created_by', auth()->id())
            ->find($id);
        if (! $category) {
            return $this->notFoundResponse([], __('Category not found'));
        }
        return $this->okResponse(['category' => $category], __('Survey question bank category retrieved successfully'));
    }

    public function update(UpdateRequest $request, int $id): JsonResponse
    {
        try {
            $category = SurveyQuestionBankCategory::where('created_by', auth()->id())->find($id);
            if (! $category) {
                return $this->notFoundResponse([], __('Category not found'));
            }
            $category->update($request->validated());
            return $this->okResponse(['category' => $category], __('Survey question bank category updated successfully'));
        } catch (\Throwable $e) {
            Log::error('Update survey bank category failed', ['e' => $e]);
            return $this->serverErrorResponse(['error' => $e->getMessage()], __('Failed to update survey question bank category'));
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $category = SurveyQuestionBankCategory::where('created_by', auth()->id())->find($id);
            if (! $category) {
                return $this->notFoundResponse([], __('Category not found'));
            }
            $category->delete();
            return $this->okResponse([], __('Survey question bank category deleted successfully'));
        } catch (\Throwable $e) {
            Log::error('Delete survey bank category failed', ['e' => $e]);
            return $this->serverErrorResponse(['error' => $e->getMessage()], __('Failed to delete survey question bank category'));
        }
    }
}
