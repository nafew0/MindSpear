<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\api\v1\ApiBaseController;
use App\Models\Quest\Quest;
use App\Models\Quiz\BankQuestion;
use App\Models\Quiz\Quiz;
use App\Models\Survey\Survey;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class DashboardController extends ApiBaseController
{
    /**
     * Get the count of quizzes, surveys, and quests for the authenticated user.
     */
    public function dashboard(): JsonResponse
    {
        $userId = Auth::guard('api')->id();

        // Quizzes count
        $allQuizzesCount = Quiz::where('user_id', $userId)->count();
        $liveQuizzesCount = Quiz::where('user_id', $userId)
            ->whereHas('sessions', function ($query) {
                $query->live();
            })->count();

        $completedQuizzesCount = Quiz::where('user_id', $userId)
            ->whereHas('sessions', function ($query) {
                $query->completed();
            })->count();

        $upcomingQuizzesCount = Quiz::where('user_id', $userId)
            ->whereHas('sessions', function ($query) {
                $query->upcoming();
            })->count();

        // Surveys count
        $allSurveysCount = Survey::where('creator_id', $userId)->count();
        $liveSurveysCount = Survey::where('creator_id', $userId)->where('is_published', true)->where('open_datetime', '<=', now())->where('close_datetime', '>=', now())->count();
        $completedSurveysCount = Survey::where('creator_id', $userId)->where('close_datetime', '<=', now())->count();
        $upcomingSurveysCount = Survey::where('creator_id', $userId)->where('open_datetime', '>', now())->count();

        // Quests count
        $allQuestsCount = Quest::where('creator_id', $userId)->count();
        $liveQuestsCount = Quest::where('creator_id', $userId)
            ->whereHas('sessions', function ($query) {
                $query->where('running_status', true);
            })->count();

        $completedQuestsCount = Quest::where('creator_id', $userId)
            ->whereHas('sessions', function ($query) {
                $query->where('end_datetime', '<=', now());
            })->count();

        $upcomingQuestsCount = Quest::where('creator_id', $userId)
            ->whereHas('sessions', function ($query) {
                $query->where('start_datetime', '>', now());
            })->count();

        // Question Bank count
        $totalQuestionBanksCount = BankQuestion::where('owner_id', $userId)->count();


        return $this->okResponse([
            'total_quiz_count' => $allQuizzesCount,
            'total_survey_count' => $allSurveysCount,
            'total_quest_count' => $allQuestsCount,
            'total_question_bank_count' => $totalQuestionBanksCount,
            'quizzes_count' => [
                'live' => $liveQuizzesCount,
                'completed' => $completedQuizzesCount,
                'upcoming' => $upcomingQuizzesCount,
            ],
            'surveys_count' => [
                'live' => $liveSurveysCount,
                'completed' => $completedSurveysCount,
                'upcoming' => $upcomingSurveysCount,
            ],
            'quests_count' => [
                'live' => $liveQuestsCount,
                'completed' => $completedQuestsCount,
                'upcoming' => $upcomingQuestsCount,
            ],
        ], __('Quizzes count retrieved successfully.'));
    }
}
