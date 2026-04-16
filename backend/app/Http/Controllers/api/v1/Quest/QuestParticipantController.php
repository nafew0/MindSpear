<?php

namespace App\Http\Controllers\api\v1\Quest;

use App\Http\Controllers\api\v1\ApiBaseController;
use App\Models\Quest\QuestParticipant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class QuestParticipantController extends ApiBaseController
{
    /**
     * Display a listing of the quest participants.
     */
    public function index(Request $request): JsonResponse
    {
        $questParticipants = QuestParticipant::with(['quest', 'user']);

        if ($request->has('quest_id')) {
            $questParticipants = $questParticipants->where('quest_id', $request->input('quest_id'));
        }

        if ($request->has('user_id')) {
            $questParticipants = $questParticipants->where('user_id', $request->input('user_id'));
        }

        if ($request->has('status')) {
            $questParticipants = $questParticipants->where('status', $request->input('status'));
        }

        if ($request->has('is_anonymous')) {
            $questParticipants = $questParticipants->where('is_anonymous', $request->input('is_anonymous'));
        }

        if ($request->has('start_time')) {
            $questParticipants = $questParticipants->where('start_time', '>=', $request->input('start_time'));
        }

        if ($request->has('end_time')) {
            $questParticipants = $questParticipants->where('end_time', '<=', $request->input('end_time'));
        }

        if ($request->has('score')) {
            $questParticipants = $questParticipants->where('score', '>=', $request->input('score'));
        }

        // You might want to add pagination here
        $questParticipants = $questParticipants->paginate($request->input('per_page', 10));

        // Return the paginated results
        return $this->okResponse(['quest_participants' => $questParticipants], __('Quest Participants fetched successfully.'));
    }

    /**
     * Show the details of a specific quest participant.
     */
    public function show($id): JsonResponse
    {
        $questParticipant = QuestParticipant::with(['quest', 'user'])->find($id);

        if (! $questParticipant) {
            return $this->notFoundResponse([], __('Quest Participant not found.'));
        }

        return $this->okResponse(['quest_participant' => $questParticipant], __('Quest Participant fetched successfully.'));
    }

    /**
     * Delete a specific quest participant.
     */
    public function destroy($id)
    {
        // Implement the logic to delete a specific quest participant by ID
    }
}
