<?php

use App\Jobs\Live\BroadcastLiveAggregateSnapshot;
use App\Models\Quest\Quest;
use App\Models\Quest\QuestParticipant;
use App\Models\Quest\QuestSession;
use App\Models\Quest\QuestTask;
use App\Models\Quiz\Question;
use App\Models\Quiz\Quiz;
use App\Models\Quiz\QuizParticipant;
use App\Models\Quiz\QuizSession;
use App\Models\User;
use App\Services\Live\LiveSessionService;
use App\Services\Live\ParticipantTokenService;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;

uses(DatabaseTransactions::class);

beforeEach(function () {
    config([
        'broadcasting.default' => 'null',
        'cache.default' => 'array',
        'queue.default' => 'sync',
    ]);
});

function liveTestUser(): User
{
    return User::create([
        'first_name' => 'Live',
        'last_name' => 'Host',
        'email' => 'live-host-' . str()->uuid() . '@example.test',
        'email_verified_at' => now(),
        'is_verified' => true,
        'password' => Hash::make('password'),
    ]);
}

it('issues hashed participant tokens and validates the raw header token', function () {
    $user = liveTestUser();
    $quest = Quest::create([
        'title' => 'Live Quest',
        'creator_id' => $user->id,
        'is_published' => true,
        'visibility' => 'public',
        'join_link' => 'quest-token-test',
        'join_code' => '123456',
    ]);
    $session = QuestSession::create([
        'quest_id' => $quest->id,
        'title' => 'Token Session',
        'session_id' => 'QUEST-TOKEN-TEST',
        'public_channel_key' => 'questtokenkey',
        'running_status' => true,
        'start_datetime' => now(),
        'end_datetime' => now()->addHour(),
        'timezone' => 'UTC',
    ]);
    $participant = QuestParticipant::create([
        'quest_id' => $quest->id,
        'quest_session_id' => $session->id,
        'is_anonymous' => true,
        'anonymous_details' => ['name' => 'Ada'],
        'start_time' => now(),
        'status' => 'In Progress',
    ]);

    $tokens = app(ParticipantTokenService::class);
    $rawToken = $tokens->issue($participant, $session);
    $participant->refresh();

    $request = Request::create('/', 'POST', server: ['HTTP_X_PARTICIPANT_TOKEN' => $rawToken]);
    $badRequest = Request::create('/', 'POST', server: ['HTTP_X_PARTICIPANT_TOKEN' => 'wrong']);

    expect($participant->participant_token_hash)->not->toBe($rawToken)
        ->and($participant->participant_token_hash)->toHaveLength(64)
        ->and($tokens->validateRequest($request, $participant))->toBeTrue()
        ->and($tokens->validateRequest($badRequest, $participant))->toBeFalse();
});

it('lets a quest owner read state and change the current task', function () {
    $user = liveTestUser();
    Sanctum::actingAs($user);

    $quest = Quest::create([
        'title' => 'State Quest',
        'creator_id' => $user->id,
        'is_published' => true,
        'visibility' => 'public',
    ]);
    $task = QuestTask::create([
        'quest_id' => $quest->id,
        'title' => 'Task 1',
        'task_type' => 'quick_form',
        'task_data' => ['questions' => []],
    ]);
    $session = QuestSession::create([
        'quest_id' => $quest->id,
        'title' => 'State Session',
        'session_id' => 'QUEST-STATE-TEST',
        'running_status' => true,
        'start_datetime' => now(),
        'end_datetime' => now()->addHour(),
        'timezone' => 'UTC',
    ]);

    $this->getJson("/api/v1/quest-sessions/{$session->id}/state")
        ->assertOk()
        ->assertJsonPath('data.state.module', LiveSessionService::MODULE_QUEST)
        ->assertJsonPath('data.state.session_id', $session->id)
        ->assertJsonStructure(['data' => ['state' => ['public_channel_key', 'public_channel']]]);

    $this->postJson("/api/v1/quest-sessions/{$session->id}/change-task", [
        'task_id' => $task->id,
        'timer_state' => ['status' => 'running', 'remaining_seconds' => 30],
    ])
        ->assertOk()
        ->assertJsonPath('data.state.current_task_id', $task->id);

    expect($session->refresh()->current_task_id)->toBe($task->id);
});

it('authorizes private quest host broadcast channels only for the owner', function () {
    config([
        'broadcasting.default' => 'reverb',
        'broadcasting.connections.reverb.key' => 'local',
        'broadcasting.connections.reverb.secret' => 'local-secret',
        'broadcasting.connections.reverb.app_id' => 'local',
    ]);

    $owner = liveTestUser();
    $otherUser = liveTestUser();
    $quest = Quest::create([
        'title' => 'Private Channel Quest',
        'creator_id' => $owner->id,
        'is_published' => true,
        'visibility' => 'public',
    ]);
    $session = QuestSession::create([
        'quest_id' => $quest->id,
        'title' => 'Private Channel Session',
        'session_id' => 'QUEST-PRIVATE-CHANNEL-TEST',
        'running_status' => true,
        'start_datetime' => now(),
        'end_datetime' => now()->addHour(),
        'timezone' => 'UTC',
    ]);

    Sanctum::actingAs($owner);
    $this->postJson('/broadcasting/auth', [
        'socket_id' => '123.456',
        'channel_name' => "private-host.quest.{$session->id}",
    ])
        ->assertOk()
        ->assertJsonStructure(['auth']);

    Sanctum::actingAs($otherUser);
    $this->postJson('/broadcasting/auth', [
        'socket_id' => '123.456',
        'channel_name' => "private-host.quest.{$session->id}",
    ])->assertForbidden();
});

it('lets a quiz owner read state and change the current question', function () {
    $user = liveTestUser();
    Sanctum::actingAs($user);

    $quiz = Quiz::create([
        'title' => 'State Quiz',
        'user_id' => $user->id,
        'is_published' => true,
        'visibility' => 'public',
    ]);
    $question = Question::create([
        'quiz_id' => $quiz->id,
        'question_text' => 'One?',
        'question_type' => 'quiz_single_choice',
        'visibility' => 'public',
        'options' => ['choices' => ['A', 'B'], 'correct_answer' => 0],
    ]);
    $session = QuizSession::create([
        'quiz_id' => $quiz->id,
        'title' => 'Quiz State Session',
        'session_id' => 'QUIZ-STATE-TEST',
        'running_status' => true,
        'start_datetime' => now(),
        'end_datetime' => now()->addHour(),
        'timezone' => 'UTC',
        'is_host_live' => true,
    ]);

    $this->getJson("/api/v1/quiz-sessions/{$session->id}/state")
        ->assertOk()
        ->assertJsonPath('data.state.module', LiveSessionService::MODULE_QUIZ)
        ->assertJsonPath('data.state.session_id', $session->id);

    $this->postJson("/api/v1/quiz-sessions/{$session->id}/change-question", [
        'question_id' => $question->id,
        'timer_state' => ['status' => 'running', 'remaining_seconds' => 20],
    ])
        ->assertOk()
        ->assertJsonPath('data.state.current_question_id', $question->id);

    expect($session->refresh()->current_question_id)->toBe($question->id);
});

it('authorizes private quiz host broadcast channels only for the owner', function () {
    config([
        'broadcasting.default' => 'reverb',
        'broadcasting.connections.reverb.key' => 'local',
        'broadcasting.connections.reverb.secret' => 'local-secret',
        'broadcasting.connections.reverb.app_id' => 'local',
    ]);

    $owner = liveTestUser();
    $otherUser = liveTestUser();
    $quiz = Quiz::create([
        'title' => 'Private Channel Quiz',
        'user_id' => $owner->id,
        'is_published' => true,
        'visibility' => 'public',
    ]);
    $session = QuizSession::create([
        'quiz_id' => $quiz->id,
        'title' => 'Private Channel Quiz Session',
        'session_id' => 'QUIZ-PRIVATE-CHANNEL-TEST',
        'running_status' => true,
        'start_datetime' => now(),
        'end_datetime' => now()->addHour(),
        'timezone' => 'UTC',
        'is_host_live' => true,
    ]);

    Sanctum::actingAs($owner);
    $this->postJson('/broadcasting/auth', [
        'socket_id' => '123.456',
        'channel_name' => "private-host.quiz.{$session->id}",
    ])
        ->assertOk()
        ->assertJsonStructure(['auth']);

    Sanctum::actingAs($otherUser);
    $this->postJson('/broadcasting/auth', [
        'socket_id' => '123.456',
        'channel_name' => "private-host.quiz.{$session->id}",
    ])->assertForbidden();
});

it('requires participant tokens for anonymous quest answers and coalesces aggregate jobs', function () {
    Queue::fake();

    $user = liveTestUser();
    $quest = Quest::create([
        'title' => 'Answer Quest',
        'creator_id' => $user->id,
        'is_published' => true,
        'visibility' => 'public',
    ]);
    $task = QuestTask::create([
        'quest_id' => $quest->id,
        'title' => 'Poll',
        'task_type' => 'quick_form',
        'task_data' => ['questions' => []],
    ]);
    $session = QuestSession::create([
        'quest_id' => $quest->id,
        'title' => 'Answer Session',
        'session_id' => 'QUEST-ANSWER-TEST',
        'public_channel_key' => 'questanswerkey',
        'running_status' => true,
        'start_datetime' => now(),
        'end_datetime' => now()->addHour(),
        'timezone' => 'UTC',
    ]);
    $participant = QuestParticipant::create([
        'quest_id' => $quest->id,
        'quest_session_id' => $session->id,
        'is_anonymous' => true,
        'anonymous_details' => ['name' => 'Grace'],
        'start_time' => now(),
        'status' => 'In Progress',
    ]);
    $token = app(ParticipantTokenService::class)->issue($participant, $session);

    $payload = [
        'task_id' => $task->id,
        'completion_data' => ['selected_option' => 'A'],
    ];

    $this->postJson("/api/v1/quest-attempts/{$participant->id}/answer", $payload)
        ->assertUnauthorized();

    $this->withHeader(ParticipantTokenService::HEADER, $token)
        ->postJson("/api/v1/quest-attempts/{$participant->id}/answer", $payload)
        ->assertOk();

    $this->withHeader(ParticipantTokenService::HEADER, $token)
        ->postJson("/api/v1/quest-attempts/{$participant->id}/answer", $payload)
        ->assertOk();

    Queue::assertPushed(BroadcastLiveAggregateSnapshot::class, 1);
});

it('requires and revokes participant tokens when anonymous quest attempts complete', function () {
    $user = liveTestUser();
    $quest = Quest::create([
        'title' => 'Complete Quest',
        'creator_id' => $user->id,
        'is_published' => true,
        'visibility' => 'public',
    ]);
    $session = QuestSession::create([
        'quest_id' => $quest->id,
        'title' => 'Complete Quest Session',
        'session_id' => 'QUEST-COMPLETE-TEST',
        'public_channel_key' => 'questcompletekey',
        'running_status' => true,
        'start_datetime' => now(),
        'end_datetime' => now()->addHour(),
        'timezone' => 'UTC',
    ]);
    $participant = QuestParticipant::create([
        'quest_id' => $quest->id,
        'quest_session_id' => $session->id,
        'is_anonymous' => true,
        'anonymous_details' => ['name' => 'Dorothy'],
        'start_time' => now(),
        'status' => 'In Progress',
    ]);
    $token = app(ParticipantTokenService::class)->issue($participant, $session);

    $payload = ['status' => 'Completed'];

    $this->putJson("/api/v1/quest-attempts/{$participant->id}/status", $payload)
        ->assertUnauthorized();

    $this->withHeader(ParticipantTokenService::HEADER, $token)
        ->putJson("/api/v1/quest-attempts/{$participant->id}/status", $payload)
        ->assertOk();

    $participant->refresh();

    expect($participant->status)->toBe('Completed')
        ->and($participant->end_time)->not->toBeNull()
        ->and($participant->participant_token_revoked_at)->not->toBeNull();
});

it('requires participant tokens for anonymous quiz answers and coalesces aggregate jobs', function () {
    Queue::fake();

    $user = liveTestUser();
    $quiz = Quiz::create([
        'title' => 'Answer Quiz',
        'user_id' => $user->id,
        'is_published' => true,
        'visibility' => 'public',
    ]);
    $question = Question::create([
        'quiz_id' => $quiz->id,
        'question_text' => 'Pick one',
        'question_type' => 'quiz_single_choice',
        'visibility' => 'public',
        'options' => ['choices' => ['A', 'B'], 'correct_answer' => 0],
    ]);
    $session = QuizSession::create([
        'quiz_id' => $quiz->id,
        'title' => 'Answer Quiz Session',
        'session_id' => 'QUIZ-ANSWER-TEST',
        'public_channel_key' => 'quizanswerkey',
        'running_status' => true,
        'start_datetime' => now(),
        'end_datetime' => now()->addHour(),
        'timezone' => 'UTC',
        'is_host_live' => true,
    ]);
    $participant = QuizParticipant::create([
        'quiz_id' => $quiz->id,
        'quiz_session_id' => $session->id,
        'is_anonymous' => true,
        'anonymous_details' => ['name' => 'Katherine'],
        'start_time' => now(),
        'score' => 0,
        'status' => 'In Progress',
    ]);
    $token = app(ParticipantTokenService::class)->issue($participant, $session);

    $payload = [
        'question_id' => $question->id,
        'answer_data' => ['selected_option' => 'A'],
        'time_taken_seconds' => 3,
    ];

    $this->postJson("/api/v1/quiz-attempts/{$participant->id}/answer", $payload)
        ->assertUnauthorized();

    $this->withHeader(ParticipantTokenService::HEADER, $token)
        ->postJson("/api/v1/quiz-attempts/{$participant->id}/answer", $payload)
        ->assertOk();

    $this->withHeader(ParticipantTokenService::HEADER, $token)
        ->postJson("/api/v1/quiz-attempts/{$participant->id}/answer", $payload)
        ->assertOk();

    Queue::assertPushed(BroadcastLiveAggregateSnapshot::class, 1);
});

it('requires and revokes participant tokens when anonymous quiz attempts complete', function () {
    $user = liveTestUser();
    $quiz = Quiz::create([
        'title' => 'Complete Quiz',
        'user_id' => $user->id,
        'is_published' => true,
        'visibility' => 'public',
    ]);
    $session = QuizSession::create([
        'quiz_id' => $quiz->id,
        'title' => 'Complete Quiz Session',
        'session_id' => 'QUIZ-COMPLETE-TEST',
        'public_channel_key' => 'quizcompletekey',
        'running_status' => true,
        'start_datetime' => now(),
        'end_datetime' => now()->addHour(),
        'timezone' => 'UTC',
        'is_host_live' => true,
    ]);
    $participant = QuizParticipant::create([
        'quiz_id' => $quiz->id,
        'quiz_session_id' => $session->id,
        'is_anonymous' => true,
        'anonymous_details' => ['name' => 'Mary'],
        'start_time' => now(),
        'score' => 0,
        'status' => 'In Progress',
    ]);
    $token = app(ParticipantTokenService::class)->issue($participant, $session);

    $payload = ['status' => 'Completed'];

    $this->putJson("/api/v1/quiz-attempts/{$participant->id}/status", $payload)
        ->assertUnauthorized();

    $this->withHeader(ParticipantTokenService::HEADER, $token)
        ->putJson("/api/v1/quiz-attempts/{$participant->id}/status", $payload)
        ->assertOk();

    $participant->refresh();

    expect($participant->status)->toBe('Completed')
        ->and($participant->end_time)->not->toBeNull()
        ->and($participant->participant_token_revoked_at)->not->toBeNull();
});
