<?php

namespace App\Http\Controllers\api\v1\Quiz;

use App\Http\Controllers\api\v1\ApiBaseController;
use App\Http\Requests\Quiz\QuestionBankCategory\StoreRequest;
use App\Http\Requests\Quiz\QuestionBankCategory\UpdateRequest;
use App\Models\Quiz\QuestionBankCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class QuestionBankCategoryController extends ApiBaseController
{
    /**
     * Display a listing of the question bank categories.
     */
    public function index(Request $request): JsonResponse
    {
        $query = QuestionBankCategory::with([
            'parentCategory',
            'subCategories',
            'createdBy' => function ($q) {
                $q->select('id', 'first_name', 'last_name', 'email', 'profile_picture');
            },
        ])->where('created_by', auth()->id());

        if ($request->has('is_parent')) {
            $query->filterByParent($request->boolean('is_parent'));
        }

        if ($request->has('created_by')) {
            $query->filterByCreatedBy($request->input('created_by'));
        }

        if ($request->filled('search')) {
            $query->search($request->input('search'));
        }

        $query->sort(
            $request->input('sort_by', 'created_at'),
            $request->input('sort_direction', 'desc')
        );

        $categories = $query->paginateCategories($request->input('per_page', 15));

        return $this->okResponse(['categories' => $categories], __('Successfully retrieved question bank categories.'));
    }

    /**
     * Store a newly created question bank category in storage.
     */
    public function store(StoreRequest $request): JsonResponse
    {
        try {
            $validatedData = $request->validated();
            $validatedData['created_by'] = auth()->id();

            $category = QuestionBankCategory::create($validatedData);

            return $this->createdResponse(
                ['category' => $category],
                __('Question bank category created successfully.')
            );
        } catch (\Exception $e) {
            Log::error('Error creating question bank category: ' . $e->getMessage(), [
                'user_id' => auth()->id(),
                'data' => $request->all(),
            ]);

            return $this->serverErrorResponse(['error' => $e->getMessage()], __('Failed to create question bank category.'));
        }
    }

    /**
     * Display the specified question bank category.
     */
    public function show(int $id): JsonResponse
    {
        $category = QuestionBankCategory::with([
            'parentCategory',
            'subCategories',
            'createdBy' => function ($q) {
                $q->select('id', 'first_name', 'last_name', 'email', 'profile_picture');
            },
        ])->where('created_by', auth()->id())->find($id);

        if (! $category) {
            return $this->notFoundResponse([], __('Question bank category not found.'));
        }

        return $this->okResponse(['category' => $category], __('Successfully retrieved question bank category.'));
    }

    /**
     * Update the specified question bank category in storage.
     */
    public function update(UpdateRequest $request, int $id): JsonResponse
    {
        try {
            $category = QuestionBankCategory::where('created_by', auth()->id())->find($id);

            if (! $category) {
                return $this->notFoundResponse([], __('Question bank category not found.'));
            }

            $validatedData = $request->validated();

            $category->update($validatedData);

            return $this->okResponse(['category' => $category], __('Question bank category updated successfully.'));
        } catch (\Exception $e) {
            Log::error('Error updating question bank category: ' . $e->getMessage(), [
                'user_id' => auth()->id(),
                'data' => $request->all(),
            ]);

            return $this->serverErrorResponse(['error' => $e->getMessage()], __('Failed to update question bank category.'));
        }
    }

    /**
     * Remove the specified question bank category from storage.
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $category = QuestionBankCategory::where('created_by', auth()->id())->find($id);

            if (! $category) {
                return $this->notFoundResponse([], __('Question bank category not found.'));
            }

            $category->delete();

            return $this->okResponse([], __('Question bank category deleted successfully.'));
        } catch (\Exception $e) {
            Log::error('Error deleting question bank category: ' . $e->getMessage(), [
                'user_id' => auth()->id(),
                'category_id' => $id,
            ]);

            return $this->serverErrorResponse(['error' => $e->getMessage()], __('Failed to delete question bank category.'));
        }
    }
}
