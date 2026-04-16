<?php

namespace App\Http\Controllers\api\v1\Survey;

use App\Http\Controllers\api\v1\ApiBaseController;
use App\Http\Requests\Survey\SurveyAttempt\JoinRequest;
use App\Http\Requests\Survey\SurveyAttempt\RecordAnswerRequest;
use App\Http\Requests\Survey\SurveyAttempt\StartAttemptRequest;
use App\Http\Requests\Survey\SurveyAttempt\SubmitSurveyByJoinLinkRequest;
use App\Http\Requests\Survey\SurveyAttempt\SubmitSurveyRequest;
use App\Http\Requests\Survey\SurveyAttempt\UpdateStatusRequest;
use App\Models\Survey\Survey;
use App\Models\Survey\SurveyQuestion;
use App\Models\Survey\SurveyQuestionAnswer;
use App\Models\Survey\SurveyResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class SurveyAttemptController extends ApiBaseController
{
    /**
     * Start a new survey attempt (backward-compatible endpoint).
     */
    public function startAttempt(StartAttemptRequest $request, int $surveyId): JsonResponse
    {
        try {
            $validated = $request->validated();
            $survey = Survey::find($surveyId);

            if (! $survey) {
                return $this->notFoundResponse([], __('Survey not found'));
            }

            $availabilityResponse = $this->validateSurveyAvailability($survey);
            if ($availabilityResponse) {
                return $availabilityResponse;
            }

            $userId = $validated['user_id'] ?? Auth::guard('api')->id();

            if ($userId) {
                $attempt = SurveyResponse::respondentId($userId)
                    ->surveyId($surveyId)
                    ->status('In Progress')
                    ->first();

                if ($attempt) {
                    return $this->badRequestResponse([], __('You already have an active attempt for this survey'));
                }
            }

            DB::beginTransaction();

            $attempt = SurveyResponse::create([
                'survey_id' => $surveyId,
                'respondent_id' => $userId,
                'is_anonymous' => ! $userId,
                'anonymous_details' => ! $userId ? ($validated['anonymous_details'] ?? null) : null,
                'start_time' => now(),
                'end_time' => null,
                'submitted_at' => null,
                'status' => 'In Progress',
            ]);

            DB::commit();

            return $this->okResponse(
                ['attempt' => $attempt],
                __('Survey attempt started successfully')
            );
        } catch (\Exception $e) {
            if (DB::transactionLevel() > 0) {
                DB::rollBack();
            }
            Log::error('Error starting survey attempt: ' . $e->getMessage());

            return $this->serverErrorResponse(
                [],
                __('An error occurred while starting the survey attempt')
            );
        }
    }

    /**
     * Public one-shot submission endpoint (Google Form style).
     */
    public function submit(SubmitSurveyRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();
            $survey = Survey::where('id', $validated['survey_id'])
                ->where('is_published', true)
                ->whereNull('deleted_at')
                ->first();

            if (! $survey) {
                return $this->notFoundResponse([], __('Survey not found or not available.'));
            }

            if (($survey->visibility ?? 'public') === 'private') {
                return $this->forbiddenResponse([], __('This survey is not publicly submittable.'));
            }

            $availabilityResponse = $this->validateSurveyAvailability($survey);
            if ($availabilityResponse) {
                return $availabilityResponse;
            }

            $invalidQuestionIds = $this->getInvalidQuestionIds($survey->id, $validated['responses']);
            if (! empty($invalidQuestionIds)) {
                return $this->unprocessableResponse(
                    ['invalid_question_ids' => $invalidQuestionIds],
                    __('Some questions do not belong to this survey')
                );
            }

            DB::beginTransaction();

            $attempt = $this->persistSubmission($survey, $validated);

            DB::commit();

            return $this->createdResponse(
                [
                    'attempt' => $this->formatAttemptResult($attempt),
                ],
                __('Survey submitted successfully')
            );
        } catch (\Exception $e) {
            if (DB::transactionLevel() > 0) {
                DB::rollBack();
            }
            Log::error('Error submitting survey: ' . $e->getMessage());

            return $this->serverErrorResponse(
                [],
                __('An error occurred while submitting the survey')
            );
        }
    }

    /**
     * Public one-shot submission endpoint via join link.
     */
    public function submitByJoinLink(SubmitSurveyByJoinLinkRequest $request, string $joinLink): JsonResponse
    {
        try {
            $validated = $request->validated();
            $survey = $this->getActiveSurveyByJoinLink($joinLink);

            if (! $survey) {
                return $this->notFoundResponse([], __('Survey not found or not available.'));
            }

            $availabilityResponse = $this->validateSurveyAvailability($survey);
            if ($availabilityResponse) {
                return $availabilityResponse;
            }

            $invalidQuestionIds = $this->getInvalidQuestionIds($survey->id, $validated['responses']);
            if (! empty($invalidQuestionIds)) {
                return $this->unprocessableResponse(
                    ['invalid_question_ids' => $invalidQuestionIds],
                    __('Some questions do not belong to this survey')
                );
            }

            DB::beginTransaction();

            $attempt = $this->persistSubmission($survey, $validated);

            DB::commit();

            return $this->createdResponse(
                [
                    'attempt' => $this->formatAttemptResult($attempt),
                ],
                __('Survey submitted successfully')
            );
        } catch (\Exception $e) {
            if (DB::transactionLevel() > 0) {
                DB::rollBack();
            }
            Log::error('Error submitting survey by join link: ' . $e->getMessage());

            return $this->serverErrorResponse(
                [],
                __('An error occurred while submitting the survey')
            );
        }
    }

    /**
     * Record single answer for an active attempt (backward-compatible endpoint).
     */
    public function recordAnswer(RecordAnswerRequest $request, int $attemptId): JsonResponse
    {
        try {
            $validated = $request->validated();
            $attempt = SurveyResponse::find($attemptId);

            if (! $attempt) {
                return $this->notFoundResponse([], __('Survey attempt not found'));
            }

            if (strtolower($attempt->status) !== 'in progress') {
                return $this->badRequestResponse([], __('This survey attempt is no longer active'));
            }

            $question = SurveyQuestion::query()
                ->where('id', $validated['question_id'])
                ->where('survey_id', $attempt->survey_id)
                ->whereNull('deleted_at')
                ->first();

            if (! $question) {
                return $this->unprocessableResponse([], __('This question does not belong to the selected survey'));
            }

            DB::beginTransaction();

            $answer = SurveyQuestionAnswer::updateOrCreate(
                [
                    'response_id' => $attemptId,
                    'question_id' => $validated['question_id'],
                ],
                [
                    'answer_data' => $this->buildAnswerPayload($request, $validated),
                ]
            );

            DB::commit();

            return $this->okResponse(
                ['answer' => $answer],
                __('Answer recorded successfully')
            );
        } catch (\Exception $e) {
            if (DB::transactionLevel() > 0) {
                DB::rollBack();
            }
            Log::error('Error recording answer: ' . $e->getMessage());

            return $this->serverErrorResponse(
                [],
                __('An error occurred while recording the answer')
            );
        }
    }

    /**
     * Status update of attempt.
     */
    public function updateStatus(UpdateStatusRequest $request, int $attemptId): JsonResponse
    {
        try {
            $validated = $request->validated();
            $attempt = SurveyResponse::with(['survey', 'respondent'])
                ->find($attemptId);

            if (! $attempt) {
                return $this->notFoundResponse([], __('Survey attempt not found'));
            }

            if (strtolower($attempt->status) !== 'in progress') {
                return $this->badRequestResponse(
                    [],
                    __('Cannot update status of a completed or abandoned attempt')
                );
            }

            DB::beginTransaction();

            $status = $validated['status'];
            $endTime = isset($validated['end_time'])
                ? Carbon::parse($validated['end_time'])
                : now();

            if ($status === 'Completed') {
                $attempt->end_time = $endTime;
                $attempt->submitted_at = $endTime;
            }

            if ($status === 'Abandoned') {
                $attempt->end_time = $endTime;
            }

            $attempt->status = $status;
            $attempt->save();

            DB::commit();

            return $this->okResponse(
                ['attempt' => $attempt],
                __('Survey attempt status updated successfully')
            );
        } catch (\Exception $e) {
            if (DB::transactionLevel() > 0) {
                DB::rollBack();
            }
            Log::error('Error updating survey status: ' . $e->getMessage());

            return $this->serverErrorResponse(
                [],
                __('An error occurred while updating the survey status')
            );
        }
    }

    /**
     * Get attempt details.
     */
    public function getAttemptDetails(int $attemptId): JsonResponse
    {
        try {
            $attempt = SurveyResponse::with(['survey', 'respondent', 'answers.question'])
                ->find($attemptId);

            if (! $attempt) {
                return $this->notFoundResponse([], __('Survey attempt not found'));
            }

            return $this->okResponse(
                ['attempt' => $attempt],
                __('Survey attempt details retrieved successfully')
            );
        } catch (\Exception $e) {
            Log::error('Error getting attempt details: ' . $e->getMessage());

            return $this->serverErrorResponse(
                [],
                __('An error occurred while retrieving the survey attempt details')
            );
        }
    }

    /**
     * Get current user attempts.
     */
    public function getUserCurrentAttempts(): JsonResponse
    {
        try {
            $userId = Auth::guard('api')->id();

            if (! $userId) {
                return $this->unauthorizedResponse([], __('You need to be logged in to view current attempts'));
            }

            $attempts = SurveyResponse::with(['survey', 'answers.question'])
                ->respondentId($userId)
                ->status('In Progress')
                ->get();

            if ($attempts->isEmpty()) {
                return $this->notFoundResponse([], __('No current survey attempts found'));
            }

            return $this->okResponse(
                ['attempts' => $attempts],
                __('Current survey attempts retrieved successfully')
            );
        } catch (\Exception $e) {
            Log::error('Error getting user attempts: ' . $e->getMessage());

            return $this->serverErrorResponse(
                [],
                __('An error occurred while retrieving your survey attempts')
            );
        }
    }

    /**
     * Get user attempt history.
     */
    public function getUserAttemptHistory(Request $request): JsonResponse
    {
        try {
            $userId = Auth::guard('api')->id();

            if (! $userId) {
                return $this->unauthorizedResponse([], __('You need to be logged in to view attempt history'));
            }

            $attempts = SurveyResponse::with(['survey', 'answers.question'])
                ->respondentId($userId)
                ->surveyIdNotNull();

            $attempts = $attempts->orderByColumn(
                $request->input('order_by', 'created_at'),
                $request->input('order_direction', 'desc')
            );

            $attempts = $attempts->paginate($request->input('per_page', 10));

            return $this->okResponse(
                ['attempts' => $attempts],
                __('Survey attempt history retrieved successfully')
            );
        } catch (\Exception $e) {
            Log::error('Error getting user attempt history: ' . $e->getMessage());

            return $this->serverErrorResponse(
                [],
                __('An error occurred while retrieving your survey attempt history')
            );
        }
    }

    /**
     * Get survey details by join link.
     */
    public function getSurveyDetailsByJoinLink(string $joinLink): JsonResponse
    {
        try {
            $survey = Survey::with([
                'pages' => function ($query) {
                    $query->orderBy('page_number');
                },
                'pages.surveyQuestions' => function ($query) {
                    $query->orderBy('serial_number');
                },
            ])
                ->where('join_link', $joinLink)
                ->where('is_published', true)
                ->whereNull('deleted_at')
                ->first();

            if (! $survey) {
                return $this->notFoundResponse([], __('Survey not found or not available.'));
            }

            $validationResponse = $this->validateSurveyAvailability($survey);
            if ($validationResponse) {
                return $validationResponse;
            }

            return $this->okResponse(
                ['survey' => $survey],
                __('Survey details retrieved successfully.')
            );
        } catch (\Exception $e) {
            Log::error('Error retrieving survey details: ' . $e->getMessage());

            return $this->serverErrorResponse(
                [],
                __('Failed to retrieve survey details. Please try again.')
            );
        }
    }

    /**
     * Join a survey using join link.
     */
    public function join(JoinRequest $request, string $joinLink): JsonResponse
    {
        try {
            $survey = $this->getActiveSurveyByJoinLink($joinLink);

            if (! $survey) {
                return $this->notFoundResponse([], __('Survey not found or not available.'));
            }

            $validationResponse = $this->validateSurveyAvailability($survey);
            if ($validationResponse) {
                return $validationResponse;
            }

            $userId = Auth::guard('api')->id();

            if ($survey->logged_in_users_only && ! $userId) {
                return $this->unauthorizedResponse(
                    [],
                    __('You need to be logged in to join this survey.')
                );
            }

            $existingAttempt = $this->checkExistingAttempt($survey, $userId);

            if ($existingAttempt) {
                return $existingAttempt;
            }

            $anonymousName = $request->input('anonymous_name');

            if (! $userId && ! $anonymousName) {
                return $this->badRequestResponse(
                    [],
                    __('Anonymous name is required for anonymous users.')
                );
            }

            if (! $userId) {
                $anonymousName = $this->generateUniqueAnonymousName($survey, $anonymousName);
            }

            DB::beginTransaction();

            $attempt = $this->createNewAttempt(
                $survey,
                $userId,
                $anonymousName,
                $request->input('anonymous_email')
            );

            DB::commit();

            return $this->createdResponse(
                [
                    'survey' => $survey,
                    'attempt' => $attempt,
                ],
                __('Survey attempt started successfully.')
            );
        } catch (\Exception $e) {
            if (DB::transactionLevel() > 0) {
                DB::rollBack();
            }
            Log::error('Survey join and attempt failed: ' . $e->getMessage());

            return $this->serverErrorResponse(
                [],
                __('Failed to join Survey. Please try again.')
            );
        }
    }

    /**
     * Update survey attempt status by join link.
     */
    public function updateStatusByJoinLink(UpdateStatusRequest $request, string $joinLink): JsonResponse
    {
        try {
            $survey = $this->getActiveSurveyByJoinLink($joinLink);

            if (! $survey) {
                return $this->notFoundResponse([], __('Survey not found or not available.'));
            }

            $validationResponse = $this->validateSurveyAvailability($survey);

            if ($validationResponse) {
                return $validationResponse;
            }

            $userId = Auth::guard('api')->id();

            if (! $userId) {
                return $this->unauthorizedResponse(
                    [],
                    __('You need to be logged in to update the survey status.')
                );
            }

            $attempt = SurveyResponse::where('survey_id', $survey->id)
                ->where('respondent_id', $userId)
                ->where('status', 'In Progress')
                ->first();

            if (! $attempt) {
                return $this->notFoundResponse([], __('No active attempt found for this survey.'));
            }

            DB::beginTransaction();

            $status = $request->status;
            $endTime = $request->filled('end_time')
                ? Carbon::parse($request->input('end_time'))
                : now();

            if ($status === 'Completed') {
                $attempt->end_time = $endTime;
                $attempt->submitted_at = $endTime;
            }

            if ($status === 'Abandoned') {
                $attempt->end_time = $endTime;
            }

            $attempt->status = $status;
            $attempt->save();

            DB::commit();

            return $this->okResponse(
                ['attempt' => $attempt],
                __('Survey attempt status updated successfully.')
            );
        } catch (\Exception $e) {
            if (DB::transactionLevel() > 0) {
                DB::rollBack();
            }
            Log::error('Error updating survey attempt status: ' . $e->getMessage());

            return $this->serverErrorResponse(
                [],
                __('Failed to update survey attempt status. Please try again.')
            );
        }
    }

    /**
     * Get attempt result by attempt ID.
     */
    public function getAttemptResult(int $attemptId): JsonResponse
    {
        try {
            $attempt = SurveyResponse::with(['survey', 'respondent', 'answers.question'])
                ->find($attemptId);

            if (! $attempt) {
                return $this->notFoundResponse([], __('Survey attempt not found'));
            }

            return $this->okResponse(
                ['attempt' => $this->formatAttemptResult($attempt)],
                __('Survey attempt result retrieved successfully')
            );
        } catch (\Exception $e) {
            Log::error('Error getting attempt result: ' . $e->getMessage());

            return $this->serverErrorResponse(
                [],
                __('An error occurred while retrieving the survey attempt result')
            );
        }
    }

    /**
     * Get survey submissions list.
     */
    public function getSurveyLeaderboard(Request $request, int $surveyId): JsonResponse
    {
        try {
            $survey = Survey::find($surveyId);

            if (! $survey) {
                return $this->notFoundResponse([], __('Survey not found'));
            }

            $attempts = SurveyResponse::with(['respondent', 'answers.question'])
                ->where('survey_id', $surveyId)
                ->where('status', 'Completed')
                ->orderByDesc('submitted_at')
                ->orderByDesc('id')
                ->paginate((int) $request->input('per_page', 20));

            $attempts->setCollection(
                $attempts->getCollection()->map(function (SurveyResponse $attempt) {
                    return $this->formatAttemptResult($attempt);
                })
            );

            return $this->okResponse(
                [
                    'survey' => [
                        'id' => $survey->id,
                        'title' => $survey->title,
                    ],
                    'results' => $attempts,
                ],
                __('Survey results retrieved successfully')
            );
        } catch (\Exception $e) {
            Log::error('Error getting survey results: ' . $e->getMessage());

            return $this->serverErrorResponse(
                [],
                __('An error occurred while retrieving the survey results')
            );
        }
    }

    /**
     * Get active survey by join link.
     */
    protected function getActiveSurveyByJoinLink(string $joinLink): ?Survey
    {
        return Survey::where('join_link', $joinLink)
            ->where('is_published', true)
            ->whereNull('deleted_at')
            ->first();
    }

    /**
     * Validate survey availability.
     */
    protected function validateSurveyAvailability(Survey $survey): ?JsonResponse
    {
        $now = now();

        if (! is_null($survey->open_datetime) && $now < $survey->open_datetime) {
            return $this->forbiddenResponse([], __('This survey is not open yet.'));
        }

        if (! is_null($survey->close_datetime) && $now > $survey->close_datetime) {
            return $this->forbiddenResponse([], __('This survey has already closed.'));
        }

        return null;
    }

    /**
     * Check for existing in-progress attempt.
     */
    protected function checkExistingAttempt(Survey $survey, ?int $userId): ?JsonResponse
    {
        if (! $userId) {
            return null;
        }

        $existingAttempt = SurveyResponse::where('survey_id', $survey->id)
            ->where('respondent_id', $userId)
            ->where('status', 'In Progress')
            ->first();

        if ($existingAttempt) {
            return $this->okResponse([
                'survey' => $survey,
                'attempt' => $existingAttempt,
            ], __('You already have an active attempt for this survey.'));
        }

        return null;
    }

    /**
     * Generate unique anonymous name.
     */
    protected function generateUniqueAnonymousName(Survey $survey, string $anonymousName): string
    {
        $baseName = $anonymousName;
        $counter = 1;

        while (SurveyResponse::where('survey_id', $survey->id)
            ->where('is_anonymous', true)
            ->whereJsonContains('anonymous_details->name', $anonymousName)
            ->exists()) {
            $anonymousName = $baseName . '_' . $counter;
            $counter++;
        }

        return $anonymousName;
    }

    /**
     * Create new survey attempt.
     */
    protected function createNewAttempt(
        Survey $survey,
        ?int $userId,
        ?string $anonymousName,
        ?string $anonymousEmail
    ): SurveyResponse {
        return SurveyResponse::create([
            'survey_id' => $survey->id,
            'respondent_id' => $userId,
            'is_anonymous' => ! $userId,
            'anonymous_details' => ! $userId ? [
                'name' => $anonymousName,
                'email' => $anonymousEmail,
            ] : null,
            'start_time' => now(),
            'end_time' => null,
            'submitted_at' => null,
            'status' => 'In Progress',
        ]);
    }

    /**
     * Persist one-shot submission.
     */
    protected function persistSubmission(Survey $survey, array $validated): SurveyResponse
    {
        $submittedAt = isset($validated['submitted_at'])
            ? Carbon::parse($validated['submitted_at'])
            : now();

        $userId = Auth::guard('api')->id();

        $attempt = SurveyResponse::create([
            'survey_id' => $survey->id,
            'respondent_id' => $userId,
            'is_anonymous' => ! $userId,
            'anonymous_details' => ! $userId ? ($validated['anonymous_details'] ?? null) : null,
            'start_time' => $submittedAt,
            'end_time' => $submittedAt,
            'submitted_at' => $submittedAt,
            'status' => 'Completed',
        ]);

        $responses = collect($validated['responses'])
            ->unique('question_id')
            ->values()
            ->map(function (array $response) {
                return [
                    'question_id' => (int) $response['question_id'],
                    'answer_data' => [
                        'answer' => $response['answer'],
                    ],
                ];
            })
            ->all();

        $attempt->answers()->createMany($responses);

        return $attempt->load(['survey', 'respondent', 'answers.question']);
    }

    /**
     * Get invalid question IDs for the selected survey.
     */
    protected function getInvalidQuestionIds(int $surveyId, array $responses): array
    {
        $questionIds = collect($responses)
            ->pluck('question_id')
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values();

        $validQuestionIds = SurveyQuestion::query()
            ->where('survey_id', $surveyId)
            ->whereNull('deleted_at')
            ->whereIn('id', $questionIds)
            ->pluck('id')
            ->map(fn ($id) => (int) $id)
            ->all();

        return $questionIds
            ->reject(fn ($id) => in_array($id, $validQuestionIds, true))
            ->values()
            ->all();
    }

    /**
     * Normalize answer payload for backward-compatible single-answer API.
     */
    protected function buildAnswerPayload(Request $request, array $validated): array
    {
        if ($request->has('answer')) {
            return ['answer' => $request->input('answer')];
        }

        $answerData = $validated['answer_data'] ?? null;

        if (is_array($answerData)) {
            return $answerData;
        }

        return ['answer' => $answerData];
    }

    /**
     * Format attempt with plain responses.
     */
    protected function formatAttemptResult(SurveyResponse $attempt): array
    {
        $submittedAt = $attempt->submitted_at ?? $attempt->end_time;

        return [
            'attempt_id' => $attempt->id,
            'survey_id' => $attempt->survey_id,
            'status' => $attempt->status,
            'submitted_at' => $submittedAt ? $submittedAt->toISOString() : null,
            'is_anonymous' => (bool) $attempt->is_anonymous,
            'anonymous_details' => $attempt->is_anonymous ? $attempt->anonymous_details : null,
            'respondent' => $attempt->is_anonymous ? null : $attempt->respondent,
            'responses' => $attempt->answers->map(function (SurveyQuestionAnswer $answer) {
                return [
                    'question_id' => $answer->question_id,
                    'question_text' => $answer->question?->question_text,
                    'question_type' => $answer->question?->question_type,
                    'answer' => $answer->answer_data['answer'] ?? $answer->answer_data,
                ];
            })->values()->all(),
        ];
    }
}
