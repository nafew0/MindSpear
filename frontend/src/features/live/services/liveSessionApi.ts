import { api } from "@/lib/axios";
import type { ApiEnvelope, LiveModule, SessionSnapshot, TimerState } from "@/features/live/types";

type StateResponse = {
	state: SessionSnapshot;
};

const stateEndpoint = (module: LiveModule, sessionId: number | string) =>
	module === "quest"
		? `/quest-sessions/${sessionId}/state`
		: `/quiz-sessions/${sessionId}/state`;

const endLiveEndpoint = (module: LiveModule, sessionId: number | string) =>
	module === "quest"
		? `/quests/end-host-live/${sessionId}`
		: `/quizes/end-host-live/${sessionId}`;

export async function getSessionState(
	module: LiveModule,
	sessionId: number | string,
	participantToken?: string | null
): Promise<SessionSnapshot> {
	const response = await api.get<StateResponse>(stateEndpoint(module, sessionId), {
		headers: participantToken ? { "X-Participant-Token": participantToken } : undefined,
	});

	return response.data.state;
}

export async function changeQuestTask(
	sessionId: number | string,
	taskId: number | string,
	timerState?: TimerState
): Promise<SessionSnapshot> {
	const response = await api.post<StateResponse>(
		`/quest-sessions/${sessionId}/change-task`,
		{
			task_id: Number(taskId),
			timer_state: timerState ?? null,
		}
	);

	return response.data.state;
}

export async function changeQuizQuestion(
	sessionId: number | string,
	questionId: number | string,
	timerState?: TimerState
): Promise<SessionSnapshot> {
	const response = await api.post<StateResponse>(
		`/quiz-sessions/${sessionId}/change-question`,
		{
			question_id: Number(questionId),
			timer_state: timerState ?? null,
		}
	);

	return response.data.state;
}

export async function endLiveSession(
	module: LiveModule,
	sessionId: number | string
): Promise<ApiEnvelope<unknown>> {
	return api.post<unknown>(endLiveEndpoint(module, sessionId), {});
}

export function unwrapLiveResponse<T>(response: ApiEnvelope<T> | { data: T }): T {
	return response.data;
}
