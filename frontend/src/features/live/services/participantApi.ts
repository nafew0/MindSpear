import axios, { AxiosInstance } from "axios";
import { apiConfig } from "@/config/api";
import type { ApiEnvelope, LiveModule } from "@/features/live/types";

const participantClient: AxiosInstance = axios.create({
	baseURL: apiConfig.baseURL,
	headers: apiConfig.jsonHeaders,
	timeout: apiConfig.timeoutMs,
});

const tokenHeaders = (participantToken: string) => ({
	"X-Participant-Token": participantToken,
});

export async function submitParticipantAnswer(
	module: LiveModule,
	attemptId: number | string,
	itemId: number | string,
	answerData: Record<string, unknown>,
	participantToken: string,
	timeTakenSeconds = 0
): Promise<ApiEnvelope<unknown>> {
	const endpoint =
		module === "quest"
			? `/quest-attempts/${attemptId}/answer`
			: `/quiz-attempts/${attemptId}/answer`;
	const payload =
		module === "quest"
			? {
					task_id: Number(itemId),
					completion_data: answerData,
					time_taken_seconds: timeTakenSeconds,
				}
			: {
					question_id: Number(itemId),
					answer_data: answerData,
					time_taken_seconds: timeTakenSeconds,
				};

	const response = await participantClient.post<ApiEnvelope<unknown>>(endpoint, payload, {
		headers: tokenHeaders(participantToken),
	});

	return response.data;
}

export async function completeParticipantAttempt(
	module: LiveModule,
	attemptId: number | string,
	participantToken: string
): Promise<ApiEnvelope<unknown>> {
	const endpoint =
		module === "quest"
			? `/quest-attempts/${attemptId}/status`
			: `/quiz-attempts/${attemptId}/status`;
	const response = await participantClient.put<ApiEnvelope<unknown>>(
		endpoint,
		{ status: "Completed" },
		{ headers: tokenHeaders(participantToken) }
	);

	return response.data;
}

export function createParticipantHeaders(participantToken?: string | null) {
	return participantToken ? tokenHeaders(participantToken) : {};
}
