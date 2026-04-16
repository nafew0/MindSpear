<?php

namespace App\Http\Controllers\api\v1\Survey;

use App\Http\Controllers\api\v1\ApiBaseController;
use App\Http\Requests\Survey\SurveyQuestion\UpdateMultipleRequest;
use App\Http\Requests\Survey\SurveyQuestion\StoreMultipleRequest;
use App\Http\Requests\Survey\SurveyQuestion\StoreRequest;
use App\Http\Requests\Survey\SurveyQuestion\UpdateRequest;
use App\Models\Survey\SurveyQuestion;
use App\Models\Survey\BankQuestion as SurveyBankQuestion;
use App\Http\Requests\Survey\Question\CloneToBankRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SurveyQuestionController extends ApiBaseController
{
    /**
     * Display a listing of the Survey Questions.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = SurveyQuestion::query();

            $questions = $query->with(['survey', 'page', 'answers'])
                ->orderBy('serial_number')
                ->paginate($request->get('per_page', 15));

            return $this->okResponse(['questions' => $questions], __('Survey questions retrieved successfully'));
        } catch (\Exception $e) {
            Log::error('Failed to retrieve survey questions: ' . $e->getMessage(), [
                'exception' => $e,
            ]);

            return $this->serverErrorResponse([], __('Failed to retrieve survey questions'));
        }
    }

    /**
     * List my bank survey questions, optionally filtered by category.
     */
    public function my(Request $request): JsonResponse
    {
        try {
            $query = SurveyBankQuestion::query()
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

            return $this->okResponse(['questions' => $items], __('My bank survey questions retrieved successfully.'));
        } catch (\Exception $e) {
            Log::error('Failed to retrieve my survey questions: ' . $e->getMessage());

            return $this->serverErrorResponse([], __('Failed to retrieve my survey questions'));
        }
    }

    /**
     * Public bank: list all public survey bank questions across users.
     */
    public function publicBank(Request $request): JsonResponse
    {
        try {
            $query = SurveyBankQuestion::query()
                ->where('visibility', 'public')
                ->with(['category', 'owner']);

            if ($request->filled('q_bank_category_id')) {
                $query->where('q_bank_category_id', $request->integer('q_bank_category_id'));
            }
            if ($request->filled('search')) {
                $query->where('question_text', 'like', '%' . $request->input('search') . '%');
            }

            $perPage = min($request->integer('per_page', 15), 100);
            $items = $query->orderByDesc('id')->paginate($perPage);

            return $this->okResponse(['questions' => $items], __('Public bank survey questions retrieved successfully.'));
        } catch (\Exception $e) {
            Log::error('Failed to retrieve public survey questions: ' . $e->getMessage());

            return $this->serverErrorResponse([], __('Failed to retrieve public survey questions'));
        }
    }

    /**
     * Display the specified Survey Question.
     */
    public function show(int $id): JsonResponse
    {
        try {
            $question = SurveyQuestion::with([
                'survey',
                'page',
                'answers',
                'conditionalQuestion',
                'conditionalParentPage',
                'childQuestions',
            ])->find($id);

            if (! $question) {
                return $this->notFoundResponse([], __('Survey question not found'));
            }

            return $this->okResponse(['question' => $question], __('Survey question retrieved successfully'));
        } catch (\Exception $e) {
            Log::error('Failed to retrieve survey question: ' . $e->getMessage(), [
                'id' => $id,
                'exception' => $e,
            ]);

            return $this->serverErrorResponse([], __('Failed to retrieve survey question'));
        }
    }

    /**
     * Store a newly created Survey Question in storage.
     */
    public function store(StoreRequest $request): JsonResponse
    {
        try {
            $validatedData = $request->validated();

            // Assign owner
            $validatedData['owner_id'] = auth()->id();

            $question = SurveyQuestion::create($validatedData);

            return $this->createdResponse(['question' => $question], __('Survey question created successfully'));
        } catch (\Exception $e) {
            Log::error('Survey question creation failed: ' . $e->getMessage(), [
                'request' => $request->all(),
                'exception' => $e,
            ]);

            return $this->serverErrorResponse(['error' => $e->getMessage()], __('An error occurred while creating the survey question'));
        }
    }

    /**
     * Store a newly created Survey Questions in storage.
     */
    public function storeMultiple(StoreMultipleRequest $request): JsonResponse
    {
        try {
            $validatedData = $request->validated();

            // Create multiple survey questions - need to format the data correctly
            $questions = [];

            foreach ($validatedData['questions'] as $questionData) {
                $questionData['owner_id'] = auth()->id();
                $question = SurveyQuestion::create($questionData);
                $questions[] = $question;
            }

            return $this->createdResponse(['questions' => $questions], __('Survey questions created successfully.'));
        } catch (\Exception $e) {
            // Log the error with request data
            Log::error('Error creating multiple survey questions: ' . $e->getMessage(), [
                'request' => $request->all(),
                'exception' => $e,
            ]);

            return $this->serverErrorResponse([], __('Failed to create survey questions. Please try again later.'));
        }
    }

    /**
     * Update multiple Survey Questions in storage.
     */
    public function updateMultiple(UpdateMultipleRequest $request): JsonResponse
    {
        try {
            $validatedData = $request->validated();

            // Check if 'questions' key exists and is an array
            if (! isset($validatedData['questions']) || ! is_array($validatedData['questions'])) {
                return $this->badRequestResponse([], __('Invalid request format. Questions must be provided in an array.'));
            }

            $updatedQuestions = [];

            foreach ($validatedData['questions'] as $questionData) {
                // Skip if no ID provided
                if (! isset($questionData['id'])) {
                    continue;
                }

                $question = SurveyQuestion::find($questionData['id']);

                // Skip if question not found
                if (! $question) {
                    continue;
                }

                // Update only the fields that are present in the request (except id)
                $updateData = array_filter($questionData, function ($key) {
                    return $key !== 'id';
                }, ARRAY_FILTER_USE_KEY);

                $question->update($updateData);
                $updatedQuestions[] = $question;
            }

            return $this->okResponse(
                ['questions' => $updatedQuestions],
                __('Survey questions updated successfully.')
            );
        } catch (\Exception $e) {
            Log::error('Error updating multiple survey questions: ' . $e->getMessage(), [
                'request' => $request->all(),
                'exception' => $e,
            ]);

            return $this->serverErrorResponse([], __('Failed to update survey questions. Please try again later.'));
        }
    }

    /**
     * Update the specified Survey Question in storage.
     */
    public function update(UpdateRequest $request, int $id): JsonResponse
    {
        try {
            $question = SurveyQuestion::find($id);

            if (! $question) {
                return $this->notFoundResponse([], __('Survey question not found'));
            }

            // // Survey-attached questions are immutable
            // if (! is_null($question->survey_id)) {
            //     return $this->forbiddenResponse([], __('Survey questions are immutable. Edit a bank copy instead.'));
            // }

            $validatedData = $request->validated();
            $question->update($validatedData);

            return $this->okResponse(['question' => $question], __('Survey question updated successfully'));
        } catch (\Exception $e) {
            Log::error('Survey question update failed: ' . $e->getMessage(), [
                'id' => $id,
                'request' => $request->all(),
                'exception' => $e,
            ]);

            return $this->serverErrorResponse(['error' => $e->getMessage()], __('An error occurred while updating the survey question'));
        }
    }

    /**
     * Remove the specified Survey Questions from storage.
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $question = SurveyQuestion::find($id);

            if (! $question) {
                return $this->notFoundResponse([], __('Survey question not found'));
            }

            // if (! is_null($question->survey_id)) {
            //     return $this->forbiddenResponse([], __('Survey questions cannot be deleted.'));
            // }

            $question->delete();

            return $this->okResponse([], __('Survey question deleted successfully'));
        } catch (\Exception $e) {
            Log::error('Survey question deletion failed: ' . $e->getMessage(), [
                'id' => $id,
                'exception' => $e,
            ]);

            return $this->serverErrorResponse(['error' => $e->getMessage()], __('An error occurred while deleting the survey question'));
        }
    }

    /**
     * Clone a public Survey Question into the user's bank/category.
     */
    public function cloneToMyBank(CloneToBankRequest $request): JsonResponse
    {
        try {
            $data = $request->validated();
            $source = SurveyQuestion::find($data['question_id']);

            if (! $source || ($source->visibility ?? 'private') !== 'public') {
                return $this->forbiddenResponse([], __('Only public questions can be cloned.'));
            }

            $categoryId = $data['q_bank_category_id'] ?? null;
            if (! $categoryId) {
                $rootCategory = \App\Models\Survey\SurveyQuestionBankCategory::firstOrCreate(
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
                $categoryId = $rootCategory->id;
            }

            $clone = SurveyBankQuestion::create([
                'q_bank_category_id' => $categoryId,
                'owner_id' => auth()->id(),
                'question_text' => $source->question_text,
                'question_type' => $source->question_type,
                'options' => $source->options,
                'is_required' => $source->is_required,
                'display_type' => $source->display_type,
                'visibility' => 'private',
            ]);

            return $this->createdResponse(['question' => $clone], __('Survey question cloned to your bank.'));
        } catch (\Exception $e) {
            Log::error('Error cloning survey question: ' . $e->getMessage());

            return $this->serverErrorResponse([], __('Failed to clone survey question.'));
        }
    }

    /**
     * Destroy multiple Survey Questions from storage.
     */
    public function destroyMultiple(Request $request): JsonResponse
    {
        try {
            $ids = $request->input('ids', []);

            if (empty($ids)) {
                return $this->badRequestResponse([], __('No survey question IDs provided.'));
            }

            $questions = SurveyQuestion::whereIn('id', $ids)->get();

            if ($questions->isEmpty()) {
                return $this->notFoundResponse([], __('No survey questions found for the provided IDs.'));
            }

            foreach ($questions as $question) {
                // if (! is_null($question->survey_id)) {
                //     return $this->forbiddenResponse([], __('One or more survey questions cannot be deleted.'));
                // }
                $question->delete();
            }

            return $this->okResponse([], __('Survey questions deleted successfully.'));
        } catch (\Exception $e) {
            // Log the error with request data
            Log::error(
                'Error deleting multiple survey questions: ' . $e->getMessage(),
                [
                    'request' => $request->all(),
                    'exception' => $e,
                ]
            );

            return $this->serverErrorResponse([], __('Failed to delete survey questions. Please try again later.'));
        }
    }

    /**
     * Restore the specified Survey Question.
     */
    public function restore(int $id): JsonResponse
    {
        try {
            $question = SurveyQuestion::withTrashed()->find($id);

            if (! $question) {
                return $this->notFoundResponse([], __('Survey question not found.'));
            }

            // if (! is_null($question->survey_id)) {
            //     return $this->forbiddenResponse([], __('Survey questions cannot be restored once deleted.'));
            // }

            $question->restore();

            return $this->okResponse(['question' => $question], __('Survey question restored successfully.'));
        } catch (\Exception $e) {
            // Log the error with request data
            Log::error('Error restoring survey question: ' . $e->getMessage(), [
                'id' => $id,
                'exception' => $e,
            ]);

            return $this->serverErrorResponse([], __('Failed to restore survey question. Please try again later.'));
        }
    }

    /**
     * Restore multiple Survey Questions.
     */
    public function restoreMultiple(Request $request): JsonResponse
    {
        try {
            $ids = $request->input('ids', []);
            $questionList = [];

            if (empty($ids)) {
                return $this->badRequestResponse([], __('No survey question IDs provided.'));
            }

            $questions = SurveyQuestion::onlyTrashed()->whereIn('id', $ids)->get();

            if ($questions->isEmpty()) {
                return $this->notFoundResponse([], __('No survey questions found for the provided IDs.'));
            }

            foreach ($questions as $question) {
                // if (! is_null($question->survey_id)) {
                //     return $this->forbiddenResponse([], __('One or more survey questions cannot be restored.'));
                // }
                $question->restore();
                $questionList[] = $question;
            }

            return $this->okResponse(['question' => $questionList], __('Survey questions restored successfully.'));
        } catch (\Exception $e) {
            // Log the error with request data
            Log::error(
                'Error restoring multiple survey questions: ' . $e->getMessage(),
                [
                    'request' => $request->all(),
                    'exception' => $e,
                ]
            );

            return $this->serverErrorResponse([], __('Failed to restore survey questions. Please try again later.'));
        }
    }

    /**
     * Copy a survey question into the authenticated user's bank.
     */
    public function addToBank(\App\Http\Requests\Survey\SurveyQuestion\CopyToBankRequest $request, int $id): JsonResponse
    {
        try {
            $source = SurveyQuestion::find($id);
            if (! $source) {
                return $this->notFoundResponse([], __('Survey question not found.'));
            }

            $data = $request->validated();
            $categoryId = $data['q_bank_category_id'] ?? null;
            if (! $categoryId) {
                $rootCategory = \App\Models\Survey\SurveyQuestionBankCategory::firstOrCreate(
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
                $categoryId = $rootCategory->id;
            }

            $bank = SurveyBankQuestion::create([
                'q_bank_category_id' => $categoryId,
                'owner_id' => auth()->id(),
                'question_text' => $source->question_text,
                'question_type' => $source->question_type,
                'options' => $source->options,
                'is_required' => $source->is_required,
                'display_type' => $source->display_type,
                'visibility' => 'private',
            ]);

            return $this->createdResponse(['question' => $bank], __('Survey question copied to your bank.'));
        } catch (\Exception $e) {
            Log::error('Error copying survey question to bank: ' . $e->getMessage());

            return $this->serverErrorResponse([], __('Failed to copy survey question to bank.'));
        }
    }
}
