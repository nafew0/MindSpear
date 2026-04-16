<?php

namespace App\Http\Controllers\api\v1\Survey;

use App\Http\Controllers\api\v1\ApiBaseController;
use App\Http\Requests\Survey\SurveyQuestionBank\StoreRequest;
use App\Http\Requests\Survey\SurveyQuestionBank\UpdateRequest;
use App\Http\Requests\Survey\SurveyQuestionBank\UseInSurveyRequest;
use App\Models\Survey\BankQuestion;
use App\Models\Survey\SurveyQuestion;
use App\Models\Survey\SurveyQuestionBankCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SurveyQuestionBankController extends ApiBaseController
{
    public function my(Request $request): JsonResponse
    {
        $query = BankQuestion::query()
            ->where('owner_id', auth()->id())
            ->with(['category']);

        if ($request->filled('q_bank_category_id')) {
            $query->where('q_bank_category_id', $request->integer('q_bank_category_id'));
        }
        if ($request->filled('visibility')) {
            $query->where('visibility', $request->input('visibility'));
        }
        if ($request->filled('search')) {
            $query->where('question_text', 'like', '%' . $request->input('search') . '%');
        }

        $perPage = min($request->integer('per_page', 15), 100);
        $items = $query->orderByDesc('id')->paginate($perPage);

        return $this->okResponse(['questions' => $items], __('My survey bank questions retrieved successfully.'));
    }

    public function public(Request $request): JsonResponse
    {
        $query = BankQuestion::query()
            ->where('visibility', 'public')
            ->with([
                'category',
                'owner' => function ($q) {
                    $q->select('id', 'first_name', 'last_name', 'email', 'profile_picture');
                },
            ]);

        if ($request->filled('q_bank_category_id')) {
            $query->where('q_bank_category_id', $request->integer('q_bank_category_id'));
        }
        if ($request->filled('search')) {
            $query->where('question_text', 'like', '%' . $request->input('search') . '%');
        }

        $perPage = min($request->integer('per_page', 15), 100);
        $items = $query->orderByDesc('id')->paginate($perPage);

        return $this->okResponse(['questions' => $items], __('Public survey bank questions retrieved successfully.'));
    }

    public function store(StoreRequest $request): JsonResponse
    {
        DB::beginTransaction();
        try {
            $data = $request->validated();
            $data['owner_id'] = auth()->id();

            if (empty($data['q_bank_category_id'])) {
                $rootCategory = SurveyQuestionBankCategory::firstOrCreate(
                    [
                        'name' => 'My Question Bank',
                        'created_by' => auth()->id(),
                        'parent_category_id' => null,
                    ],
                    [
                        'description' => null,
                        'is_parent' => true,
                    ]
                );
                $data['q_bank_category_id'] = $rootCategory->id;
            }

            $question = BankQuestion::create($data);
            DB::commit();
            return $this->createdResponse(['question' => $question], __('Survey bank question created successfully.'));
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating survey bank question: ' . $e->getMessage());
            return $this->serverErrorResponse([], __('Failed to create survey bank question.'));
        }
    }

    public function show(int $id): JsonResponse
    {
        $question = BankQuestion::with(['category', 'owner'])->withTrashed()->find($id);
        if (! $question) {
            return $this->notFoundResponse([], __('Survey bank question not found.'));
        }
        return $this->okResponse(['question' => $question], __('Survey bank question retrieved successfully.'));
    }

    public function update(UpdateRequest $request, int $id): JsonResponse
    {
        DB::beginTransaction();
        try {
            $question = BankQuestion::find($id);
            if (! $question) {
                return $this->notFoundResponse([], __('Survey bank question not found.'));
            }
            if ($question->owner_id !== auth()->id()) {
                return $this->forbiddenResponse([], __('You do not have permission to modify this bank question.'));
            }

            $data = $request->validated();
            $question->update($data);
            DB::commit();
            return $this->okResponse(['question' => $question], __('Survey bank question updated successfully.'));
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error updating survey bank question: ' . $e->getMessage());
            return $this->serverErrorResponse([], __('Failed to update survey bank question.'));
        }
    }

    public function destroy(int $id): JsonResponse
    {
        DB::beginTransaction();
        try {
            $question = BankQuestion::find($id);
            if (! $question) {
                return $this->notFoundResponse([], __('Survey bank question not found.'));
            }
            if ($question->owner_id !== auth()->id()) {
                return $this->forbiddenResponse([], __('You do not have permission to delete this bank question.'));
            }

            $question->delete();
            DB::commit();
            return $this->okResponse([], __('Survey bank question deleted successfully.'));
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error deleting survey bank question: ' . $e->getMessage());
            return $this->serverErrorResponse([], __('Failed to delete survey bank question.'));
        }
    }

    public function restore(int $id): JsonResponse
    {
        DB::beginTransaction();
        try {
            $question = BankQuestion::withTrashed()->find($id);
            if (! $question) {
                return $this->notFoundResponse([], __('Survey bank question not found.'));
            }
            if ($question->owner_id !== auth()->id()) {
                return $this->forbiddenResponse([], __('You do not have permission to restore this bank question.'));
            }
            $question->restore();
            DB::commit();
            return $this->okResponse([], __('Survey bank question restored successfully.'));
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error restoring survey bank question: ' . $e->getMessage());
            return $this->serverErrorResponse([], __('Failed to restore survey bank question.'));
        }
    }

    public function useInSurvey(UseInSurveyRequest $request, int $id): JsonResponse
    {
        DB::beginTransaction();
        try {
            $bank = BankQuestion::find($id);
            if (! $bank) {
                return $this->notFoundResponse([], __('Survey bank question not found.'));
            }
            $data = $request->validated();
            $attached = SurveyQuestion::create([
                'survey_id' => $data['survey_id'],
                'page_id' => $data['page_id'] ?? null,
                'owner_id' => $bank->owner_id,
                'serial_number' => $data['serial_number'] ?? null,
                'question_text' => $bank->question_text,
                'question_type' => $bank->question_type,
                'options' => $bank->options,
                'is_required' => $bank->is_required,
                'display_type' => $bank->display_type,
            ]);
            DB::commit();
            return $this->createdResponse(['question' => $attached], __('Question added to survey from bank.'));
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error using bank question in survey: ' . $e->getMessage());
            return $this->serverErrorResponse([], __('Failed to add question to survey.'));
        }
    }
}
