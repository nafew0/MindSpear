<?php

namespace App\Http\Controllers\api\v1\Survey;

use App\Http\Controllers\api\v1\ApiBaseController;
use App\Http\Requests\Survey\SurveyPage\UpdateMultipleRequest;
use App\Http\Requests\Survey\SurveyPage\StoreMultipleRequest;
use App\Http\Requests\Survey\SurveyPage\StoreRequest;
use App\Http\Requests\Survey\SurveyPage\UpdateRequest;
use App\Models\Survey\Survey;
use App\Models\Survey\SurveyPage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SurveyPageController extends ApiBaseController
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = SurveyPage::query();

            $pages = $query->with(['survey', 'questions'])
                ->orderBy('page_number')
                ->filterByPaginate($request->per_page);

            return $this->okResponse(['pages' => $pages], __('Survey pages retrieved successfully'));
        } catch (\Exception $e) {
            Log::error('Failed to retrieve survey pages: ' . $e->getMessage(), [
                'exception' => $e,
            ]);

            return $this->serverErrorResponse([], __('Failed to retrieve survey pages'));
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreRequest $request): JsonResponse
    {
        try {
            $validatedData = $request->validated();

            // Validate survey exists
            $survey = Survey::find($validatedData['survey_id']);

            if (! $survey) {
                return $this->notFoundResponse([], __('Survey not found'));
            }

            // Ensure page_number is unique within the survey by incrementing if needed
            $surveyId = $validatedData['survey_id'];
            $pageNumber = $validatedData['page_number'];

            // Increment page number until it is unique for this survey
            while (
                SurveyPage::where('survey_id', $surveyId)
                    ->where('page_number', $pageNumber)
                    ->exists()
            ) {
                $pageNumber++;
            }

            $validatedData['page_number'] = $pageNumber;

            $page = SurveyPage::create($validatedData);

            return $this->createdResponse(['page' => $page], __('Survey page created successfully'));
        } catch (\Exception $e) {
            Log::error('Survey page creation failed: ' . $e->getMessage(), [
                'request' => $request->all(),
                'exception' => $e,
            ]);

            return $this->serverErrorResponse(['error' => $e->getMessage()], __('An error occurred while creating the survey page'));
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id): JsonResponse
    {
        try {
            $page = SurveyPage::with([
                'survey',
                'questions' => function ($query) {
                    $query->orderBy('serial_number');
                },
            ])->find($id);

            if (! $page) {
                return $this->notFoundResponse([], __('Survey page not found'));
            }

            return $this->okResponse(['page' => $page], __('Survey page retrieved successfully'));
        } catch (\Exception $e) {
            Log::error('Failed to retrieve survey page: ' . $e->getMessage(), [
                'id' => $id,
                'exception' => $e,
            ]);

            return $this->serverErrorResponse([], __('Failed to retrieve survey page'));
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateRequest $request, $id): JsonResponse
    {
        try {
            $page = SurveyPage::find($id);

            if (! $page) {
                return $this->notFoundResponse([], __('Survey page not found'));
            }

            $validatedData = $request->validated();
            $page->update($validatedData);

            return $this->okResponse(['page' => $page], __('Survey page updated successfully'));
        } catch (\Exception $e) {
            Log::error('Survey page update failed: ' . $e->getMessage(), [
                'id' => $id,
                'request' => $request->all(),
                'exception' => $e,
            ]);

            return $this->serverErrorResponse(['error' => $e->getMessage()], __('An error occurred while updating the survey page'));
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id): JsonResponse
    {
        try {
            $page = SurveyPage::find($id);

            if (! $page) {
                return $this->notFoundResponse([], __('Survey page not found'));
            }

            $page->delete();

            return $this->okResponse([], __('Survey page deleted successfully'));
        } catch (\Exception $e) {
            Log::error('Survey page deletion failed: ' . $e->getMessage(), [
                'id' => $id,
                'exception' => $e,
            ]);

            return $this->serverErrorResponse(['error' => $e->getMessage()], __('An error occurred while deleting the survey page'));
        }
    }

    /**
     * Store multiple survey pages.
     */
    public function storeMultiple(StoreMultipleRequest $request): JsonResponse
    {
        try {
            $data = $request->validated();
            $surveyPages = [];

            foreach ($data['pages'] as $pageData) {
                $surveyPages[] = $pageData;
            }

            $createdSurveyPages = SurveyPage::insert($surveyPages);

            return $this->createdResponse(['survey_pages' => $surveyPages], __('Multiple survey pages created successfully.'));
        } catch (\Exception $e) {
            // Log the exception for debugging purposes
            Log::error('Error creating multiple survey pages: ' . $e->getMessage(), [
                'request' => $request->all(),
                'exception' => $e,
            ]);

            return $this->serverErrorResponse(['error' => $e->getMessage()], __('Failed to create multiple survey pages.'));
        }
    }

    /**
     * Update multiple survey pages.
     */
    public function updateMultiple(UpdateMultipleRequest $request): JsonResponse
    {
        try {
            $data = $request->validated();
            $updatedSurveyPages = [];

            foreach ($data['pages'] as $pageData) {
                $surveyPage = SurveyPage::find($pageData['id']);

                if ($surveyPage) {
                    $surveyPage->update($pageData);
                    $updatedSurveyPages[] = $surveyPage;
                }
            }

            return $this->okResponse(['survey_pages' => $updatedSurveyPages], __('Multiple survey pages updated successfully.'));
        } catch (\Exception $e) {
            Log::error('Error updating multiple survey pages: ' . $e->getMessage(), [
                'request' => $request->all(),
                'exception' => $e,
            ]);

            return $this->serverErrorResponse(['error' => $e->getMessage()], __('Failed to update multiple survey pages.'));
        }
    }

    /**
     * Delete multiple survey pages.
     */
    public function destroyMultiple(Request $request): JsonResponse
    {
        try {
            $ids = $request->input('ids');

            if (empty($ids)) {
                return $this->badRequestResponse([], __('No survey page IDs provided.'));
            }

            $deletedCount = SurveyPage::whereIn('id', $ids)->delete();

            return $this->okResponse(['deleted_count' => $deletedCount], __('Multiple survey pages deleted successfully.'));
        } catch (\Exception $e) {
            Log::error('Error deleting multiple survey pages: ' . $e->getMessage(), [
                'request' => $request->all(),
                'exception' => $e,
            ]);

            return $this->serverErrorResponse(['error' => $e->getMessage()], __('Failed to delete multiple survey pages.'));
        }
    }

    /**
     * Restore a soft-deleted survey page.
     */
    public function restore($id): JsonResponse
    {
        try {
            $surveyPage = SurveyPage::withTrashed()->find($id);

            if (! $surveyPage) {
                return $this->notFoundResponse([], __('Survey page not found.'));
            }

            $surveyPage->restore();

            return $this->okResponse(['survey_page' => $surveyPage], __('Survey page restored successfully.'));
        } catch (\Exception $e) {
            Log::error('Error restoring survey page: ' . $e->getMessage(), [
                'request' => request()->all(),
                'exception' => $e,
            ]);

            return $this->serverErrorResponse(['error' => $e->getMessage()], __('Failed to restore survey page.'));
        }
    }

    /**
     * Restore multiple soft-deleted survey pages.
     */
    public function restoreMultiple(Request $request): JsonResponse
    {
        try {
            $ids = $request->input('ids');

            if (empty($ids)) {
                return $this->badRequestResponse([], __('No survey page IDs provided.'));
            }

            $restoredCount = SurveyPage::withTrashed()->whereIn('id', $ids)->restore();

            return $this->okResponse(['restored_count' => $restoredCount], __('Multiple survey pages restored successfully.'));
        } catch (\Exception $e) {
            Log::error('Error restoring multiple survey pages: ' . $e->getMessage(), [
                'request' => $request->all(),
                'exception' => $e,
            ]);

            return $this->serverErrorResponse(['error' => $e->getMessage()], __('Failed to restore multiple survey pages.'));
        }
    }

    /**
     * Get survey pages by survey ID.
     */
    public function getBySurvey($surveyId): JsonResponse
    {
        try {
            $surveyPages = SurveyPage::where('survey_id', $surveyId)->with(['survey', 'questions'])->get();

            if ($surveyPages->isEmpty()) {
                return $this->notFoundResponse([], __('No survey pages found for this survey.'));
            }

            return $this->okResponse(['survey_pages' => $surveyPages], __('Survey pages retrieved successfully.'));
        } catch (\Exception $e) {
            Log::error('Error retrieving survey pages by survey ID: ' . $e->getMessage(), [
                'survey_id' => $surveyId,
                'exception' => $e,
            ]);

            return $this->serverErrorResponse(['error' => $e->getMessage()], __('Failed to retrieve survey pages.'));
        }
    }
}
