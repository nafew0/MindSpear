<?php

namespace App\Http\Controllers\api\v1\Survey;

use App\Http\Controllers\api\v1\ApiBaseController;
use App\Http\Requests\Survey\Survey\StoreRequest;
use App\Http\Requests\Survey\Survey\UpdateRequest;
use App\Models\Survey\Survey;
use App\Models\Survey\SurveyQuestionAnswer;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class SurveyController extends ApiBaseController
{
    protected function ensureSurveyOwner(Survey $survey): ?JsonResponse
    {
        if ($survey->creator_id !== auth()->id()) {
            return $this->forbiddenResponse([], __('You are not allowed to access this survey.'));
        }

        return null;
    }
    /**
     * Get all surveys.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            // Only return surveys owned by the authenticated user
            $surveys = Survey::with(['creator'])
                ->where('creator_id', auth()->id());

            // Apply filters with scopes
            if ($request->has('published')) {
                $surveys->published();
            }

            if ($request->has('unpublished')) {
                $surveys->unpublished();
            }

            if ($request->has('active')) {
                $surveys->active();
            }

            if ($request->has('upcoming')) {
                $surveys->upcoming();
            }

            if ($request->has('past')) {
                $surveys->past();
            }

            if ($request->has('with_creator')) {
                $surveys->withCreator();
            }

            if ($request->has('with_questions')) {
                $surveys->withQuestions();
            }

            if ($request->has('with_responses')) {
                $surveys->withResponses();
            }

            if ($request->has('search')) {
                $surveys->search($request->input('search'));
            }

            if ($request->has(['start_date', 'end_date'])) {
                $surveys->filterByDateRange(
                    $request->input('start_date'),
                    $request->input('end_date')
                );
            }

            if ($request->has('creator_id')) {
                $surveys->filterByCreator($request->input('creator_id'));
            }

            if ($request->has('is_published')) {
                $surveys->filterByPublishedStatus($request->input('is_published'));
            }

            if ($request->has('join_link')) {
                $surveys->filterByJoinLink($request->input('join_link'));
            }

            if ($request->has('title')) {
                $surveys->filterByTitle($request->input('title'));
            }

            if ($request->has('description')) {
                $surveys->filterByDescription($request->input('description'));
            }

            if ($request->has('has_conditional_branching')) {
                $surveys->filterByConditionalBranching($request->input('has_conditional_branching'));
            }

            $surveys->orderBy(
                $request->input('order_by', 'created_at'),
                $request->input('order_direction', 'desc')
            );

            $surveys = $surveys->filterByPaginate($request->input('per_page'));

            return $this->okResponse(['surveys' => $surveys], __('Surveys retrieved successfully'));
        } catch (\Exception $e) {
            Log::error('Survey retrieval failed: ' . $e->getMessage(), [
                'request' => $request->all(),
                'exception' => $e,
            ]);

            return $this->serverErrorResponse(['error' => $e->getMessage()], __('An error occurred while retrieving surveys'));
        }
    }

    /**
     * Store a new survey.
     */
    public function store(StoreRequest $request): JsonResponse
    {
        try {
            $validatedData = $request->validated();

            $result = DB::transaction(function () use ($validatedData) {
                $survey = Survey::create($validatedData);

                // Create a default page for the new survey
                $page = $survey->pages()->create([
                    'page_number' => 1,
                    'title' => 'Page 1',
                    'description' => null,
                ]);

                return [
                    'survey' => $survey,
                    'page' => $page,
                ];
            });

            return $this->createdResponse($result, __('Survey created successfully'));
        } catch (\Exception $e) {
            Log::error('Survey creation failed: ' . $e->getMessage(), [
                'request' => $request->all(),
                'exception' => $e,
            ]);

            return $this->serverErrorResponse(['error' => $e->getMessage()], __('An error occurred while creating the survey'));
        }
    }

    /**
     * Show a specific survey.
     */
    public function show($id): JsonResponse
    {
        try {
            $survey = Survey::with([
                'creator',
                'pages' => function ($query) {
                    $query->orderBy('page_number');
                },
                'pages.questions' => function ($query) {
                    $query->orderBy('serial_number');
                },
            ])->find($id);

            if (! $survey) {
                return $this->notFoundResponse([], __('Survey not found'));
            }

            if ($response = $this->ensureSurveyOwner($survey)) {
                return $response;
            }

            return $this->okResponse(['survey' => $survey], __('Survey retrieved successfully'));
        } catch (\Exception $e) {
            Log::error('Failed to retrieve survey: ' . $e->getMessage(), [
                'id' => $id,
                'exception' => $e,
            ]);

            return $this->serverErrorResponse(['error' => $e->getMessage()], __('Failed to retrieve survey'));
        }
    }

    /**
     * Update a specific survey.
     */
    public function update(UpdateRequest $request, $id): JsonResponse
    {
        try {
            $survey = Survey::find($id);

            if (! $survey) {
                return $this->notFoundResponse([], __('Survey not found'));
            }

            if ($response = $this->ensureSurveyOwner($survey)) {
                return $response;
            }

            $validatedData = $request->validated();

            $survey->update($validatedData);

            return $this->okResponse(['survey' => $survey], __('Survey updated successfully'));
        } catch (\Exception $e) {
            Log::error('Survey update failed: ' . $e->getMessage(), [
                'request' => $request->all(),
                'exception' => $e,
            ]);

            return $this->serverErrorResponse(['error' => $e->getMessage()], __('An error occurred while updating the survey'));
        }
    }

    /**
     * Delete a specific survey.
     */
    public function destroy($id): JsonResponse
    {
        try {
            $survey = Survey::find($id);

            if (! $survey) {
                return $this->notFoundResponse([], __('Survey not found'));
            }

            if ($response = $this->ensureSurveyOwner($survey)) {
                return $response;
            }

            DB::transaction(function () use ($survey) {
                // Collect all question IDs (including soft-deleted) to clear answers
                $questionIds = $survey->questions()->withTrashed()->pluck('id');

                if ($questionIds->isNotEmpty()) {
                    // Answers table doesn't use soft deletes; a simple delete is enough
                    SurveyQuestionAnswer::whereIn('question_id', $questionIds)->delete();
                }

                // Remove responses for this survey
                $survey->responses()->delete();

                // Force delete related questions/pages to avoid FK SET NULL on non-null columns
                $survey->questions()->withTrashed()->get()->each->forceDelete();
                $survey->pages()->withTrashed()->get()->each->forceDelete();

                // Finally, delete the survey
                $survey->delete();
            });

            return $this->okResponse([], __('Survey deleted successfully'));
        } catch (\Exception $e) {
            Log::error('Survey deletion failed: ' . $e->getMessage(), [
                'id' => $id,
                'exception' => $e,
            ]);

            return $this->serverErrorResponse(['error' => $e->getMessage()], __('An error occurred while deleting the survey'));
        }
    }

    /**
     * Copy a public survey into the authenticated user's library.
     */
    public function addMyLibrary($id): JsonResponse
    {
        DB::beginTransaction();

        try {
            $survey = Survey::with(['pages', 'questions'])->find($id);

            if (! $survey) {
                return $this->notFoundResponse([], __('Survey not found'));
            }

            if (($survey->visibility ?? 'private') !== 'public') {
                return $this->forbiddenResponse([], __('Only public surveys can be copied.'));
            }

            // Duplicate the survey
            $newSurvey = $survey->replicate();
            $newSurvey->title = $survey->title . ' (Copy)';
            $newSurvey->creator_id = Auth::guard('api')->id();
            $this->setOriginOwnerInfoForSurvey($newSurvey, $survey);
            $newSurvey->push();

            $pageIdMap = [];
            $newPages = [];
            foreach ($survey->pages as $page) {
                $newPage = $page->replicate();
                $newPage->survey_id = $newSurvey->id;
                $newPage->push();
                $pageIdMap[$page->id] = $newPage->id;
                $newPages[$page->id] = $newPage;
            }

            $questionIdMap = [];
            $newQuestions = [];
            foreach ($survey->questions as $question) {
                $newQuestion = $question->replicate();
                $newQuestion->survey_id = $newSurvey->id;
                if (! is_null($question->page_id)) {
                    $newQuestion->page_id = $pageIdMap[$question->page_id] ?? null;
                }
                $newQuestion->push();
                $questionIdMap[$question->id] = $newQuestion->id;
                $newQuestions[$question->id] = $newQuestion;
            }

            // Update conditional references now that IDs are mapped
            foreach ($survey->pages as $page) {
                $newPage = $newPages[$page->id] ?? null;
                if (! $newPage) {
                    continue;
                }

                $updates = [];
                if (! is_null($page->conditional_page_id)) {
                    $updates['conditional_page_id'] = $pageIdMap[$page->conditional_page_id] ?? null;
                }
                if (! is_null($page->conditional_question_id)) {
                    $updates['conditional_question_id'] = $questionIdMap[$page->conditional_question_id] ?? null;
                }

                if (! empty($updates)) {
                    $newPage->update($updates);
                }
            }

            foreach ($survey->questions as $question) {
                $newQuestion = $newQuestions[$question->id] ?? null;
                if (! $newQuestion) {
                    continue;
                }

                $updates = [];
                if (! is_null($question->conditional_page_id)) {
                    $updates['conditional_page_id'] = $pageIdMap[$question->conditional_page_id] ?? null;
                }
                if (! is_null($question->conditional_question_id)) {
                    $updates['conditional_question_id'] = $questionIdMap[$question->conditional_question_id] ?? null;
                }

                if (! empty($updates)) {
                    $newQuestion->update($updates);
                }
            }

            DB::commit();

            return $this->createdResponse(
                [
                    'survey' => $newSurvey,
                    'pages' => $newSurvey->pages,
                    'questions' => $newSurvey->questions,
                ],
                __('Survey copied successfully.')
            );
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error copying public survey: ' . $e->getMessage(), [
                'id' => $id,
                'exception' => $e,
            ]);

            return $this->serverErrorResponse([], __('Failed to copy survey. Please try again later.'));
        }
    }

    /**
     * Display a listing of public surveys.
     */
    public function publicIndex(Request $request): JsonResponse
    {
        $surveys = Survey::with(['creator'])
            ->published()
            ->public()
            ->where('creator_id', '!=', auth()->id());

        $searchTerm = $request->input('search');
        if ($searchTerm !== null && $searchTerm !== '') {
            $normalizedSearch = strtolower($searchTerm);
            $surveys->where(function ($query) use ($normalizedSearch) {
                $query->whereRaw('LOWER(title) LIKE ?', ['%' . $normalizedSearch . '%'])
                    ->orWhereRaw('LOWER(description) LIKE ?', ['%' . $normalizedSearch . '%']);
            });
        }

        // Filter by visibility
        if ($request->has('visibility')) {
            $surveys->public($request->input('visibility'));
        }
        // Filter by published status
        if ($request->has('is_published')) {
            $surveys->published($request->input('is_published'));
        }

        $surveys = $surveys->paginate($request->input('per_page', 10));

        return $this->okResponse(['surveys' => $surveys], __('Public surveys retrieved successfully.'));
    }

    /**
     * Display the specified public survey.
     */
    public function publicShow($id): JsonResponse
    {
        $survey = Survey::with([
            'creator',
            'pages' => function ($query) {
                $query->orderBy('page_number');
            },
            'pages.questions' => function ($query) {
                $query->orderBy('serial_number');
            },
        ])
            ->public()
            ->where('is_published', true)
            ->whereDate('close_datetime', '>=', today())
            ->whereNull('deleted_at')
            ->find($id);

        if (! $survey) {
            return $this->notFoundResponse([], __('Survey not found'));
        }

        // Transform the survey structure
        $transformedSurvey = $this->transformSurveyConditionalLogic($survey);

        return $this->okResponse(['survey' => $transformedSurvey], __('Public survey retrieved successfully.'));
    }

    private function setOriginOwnerInfoForSurvey(Survey $target, Survey $source): void
    {
        $originOwner = $source->creator;
        $originOwnerName = $originOwner?->full_name ? trim((string) $originOwner->full_name) : null;
        if ($originOwnerName === '') {
            $originOwnerName = null;
        }

        $originOwnerProfilePicture = $originOwner?->profile_picture;
        if ($originOwnerProfilePicture === '') {
            $originOwnerProfilePicture = null;
        }

        $target->origin_owner_id = $originOwner?->id;
        $target->origin_owner_name = $originOwnerName;
        $target->origin_owner_profile_picture = $originOwnerProfilePicture;
    }

    public function checkSurveyById($id): JsonResponse
    {
        return $this->checkSurveyByField('id', $id);
    }

    public function checkSurveyByJoinLink($joinLink): JsonResponse
    {
        return $this->checkSurveyByField('join_link', $joinLink);
    }

    protected function checkSurveyByField($field, $value): JsonResponse
    {
        $survey = Survey::where($field, $value)->select(['id', 'title', 'open_datetime', 'close_datetime', 'is_published'])
            ->first();

        if (! $survey) {
            return $this->notFoundResponse([], __('Survey not found.'));
        }

        if (! $survey->is_published || ! $survey->open_datetime || ! $survey->close_datetime) {
            return $this->forbiddenResponse([], __('This survey is not currently live.'));
        }

        $now = now();

        if ($now->lt($survey->open_datetime)) {
            return $this->forbiddenResponse(['open' => $survey->open_datetime], __('The survey has not started yet.'));
        }

        if ($now->gt($survey->close_datetime)) {
            return $this->forbiddenResponse(['close' => $survey->close_datetime], __('The survey has already ended.'));
        }

        return $this->okResponse(['survey' => $survey], __('Survey is currently live.'));
    }

    /**
     * Transform survey structure to include conditional logic details.
     */
    protected function transformSurveyConditionalLogic($survey)
    {
        $pages = $survey->pages->map(function ($page) {
            $pageArray = $page->toArray();
            // sections removed; attach questions directly to page
            $pageArray['questions'] = $page->questions->map(function ($question) use ($page) {
                $questionArray = $question->toArray();

                if ($question->has_conditional_logic) {
                    $questionArray['conditional_parent'] = $this->buildConditionalParentObject(
                        $question,
                        $page
                    );
                }

                if (! empty($question->display_conditions)) {
                    $questionArray['display_conditions'] = $this->transformDisplayConditions(
                        $question->display_conditions,
                        $page
                    );
                }

                return $questionArray;
            })->toArray();

            return $pageArray;
        })->toArray();

        $surveyArray = $survey->toArray();
        $surveyArray['pages'] = $pages;

        return $surveyArray;
    }

    /**
     * Build the conditional_parent object for a question.
     */
    protected function buildConditionalParentObject($question, $page)
    {
        $parentType = $question->conditional_parent_type;
        $parentObject = [
            'type' => $parentType,
            'operator' => $question->conditional_operator,
            'value' => $question->conditional_value,
        ];

        switch ($parentType) {
            case 'question':
                // Find the parent question (on same page)
                $parentQuestion = null;
                foreach ($page->questions as $q) {
                    if ($q->id == $question->conditional_question_id) {
                        $parentQuestion = $q;
                        break;
                    }
                }

                if ($parentQuestion) {
                    $parentObject['question'] = [
                        'id' => $parentQuestion->id,
                        'serial_number' => $parentQuestion->serial_number,
                        'question_text' => $parentQuestion->question_text,
                    ];
                }
                break;

                // 'section' type removed

            case 'page':
                $parentObject['page'] = [
                    'id' => $page->id,
                    'page_number' => $page->page_number,
                    'title' => $page->title,
                    'description' => $page->description,
                ];
                break;
        }

        return $parentObject;
    }

    /**
     * Transform display conditions to include parent objects.
     */
    protected function transformDisplayConditions($displayConditions, $page)
    {
        if (! is_array($displayConditions) || empty($displayConditions['conditions'])) {
            return $displayConditions;
        }

        $transformedConditions = array_map(function ($condition) use ($page) {
            if (isset($condition['parent_type'])) {
                $condition['type'] = $condition['parent_type'];
                unset($condition['parent_type']);

                // Add the parent object based on type
                switch ($condition['type']) {
                    case 'question':
                        $parentQuestion = null;
                        foreach ($page->questions as $question) {
                            if ($question->id == $condition['parent_id']) {
                                $parentQuestion = $question;
                                break;
                            }
                        }

                        if ($parentQuestion) {
                            $condition['question'] = [
                                'id' => $parentQuestion->id,
                                'serial_number' => $parentQuestion->serial_number,
                                'question_text' => $parentQuestion->question_text,
                            ];
                        }
                        break;

                        // 'section' type removed

                    case 'page':
                        $condition['page'] = [
                            'id' => $page->id,
                            'page_number' => $page->page_number,
                            'title' => $page->title,
                            'description' => $page->description,
                        ];
                        break;
                }

                unset($condition['parent_id']);
            }

            return $condition;
        }, $displayConditions['conditions']);

        $displayConditions['conditions'] = $transformedConditions;

        return $displayConditions;
    }
}
