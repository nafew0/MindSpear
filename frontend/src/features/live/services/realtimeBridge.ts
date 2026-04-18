import { publishLiveEvent, onLiveEvent, onceLiveEvent, getLastLiveEvent } from "./liveEventBus";
import {
	changeQuestTask,
	changeQuizQuestion,
} from "@/features/live/services/liveSessionApi";
import type { TimerState } from "@/features/live/types";

type AnyPayload = Record<string, unknown>;
type Callback = (payload: any) => void;

let currentQuest: AnyPayload | null = null;
let currentQuiz: AnyPayload | null = null;

const bridgeSocket = {
	id: "reverb-bridge",
	connected: true,
	connect() {
		this.connected = true;
		publishLiveEvent("legacy", "connected", { connected: true });
		return this;
	},
	disconnect() {
		this.connected = false;
		publishLiveEvent("legacy", "disconnect", { connected: false });
		return this;
	},
	on(event: string, callback: Callback) {
		return onLiveEvent("legacy", event, callback);
	},
	off(_event?: string) {
		return this;
	},
	emit(event: string, payload?: unknown) {
		publishLiveEvent("legacy", event, payload ?? {});
		return true;
	},
};

const sessionStorageKey = (key: string) => `mindspear:legacy:${key}`;

const resolveSoon = async <T = AnyPayload>(payload: T | null = null): Promise<T> =>
	((payload ?? ({ ok: true } as T)) as T);

const publishLegacy = (event: string, payload: unknown = {}) => {
	publishLiveEvent("legacy", event, payload);
};

const listenLegacy = (event: string, callback: Callback) => onLiveEvent("legacy", event, callback);

const onceLegacy = <T = AnyPayload>(event: string, timeoutMs?: number) =>
	onceLiveEvent<T>("legacy", event, timeoutMs ?? 500);

const queryParam = (key: string): string | null => {
	if (typeof window === "undefined") return null;
	return new URLSearchParams(window.location.search).get(key);
};

const timerStateFromPayload = (payload: AnyPayload): TimerState => {
	const timeValue = Number(
		payload.questiQsenTime ??
			payload.quizQsenTime ??
			payload.time_limit ??
			payload.duration_seconds ??
			0
	);

	return {
		status: "running",
		start_time:
			typeof payload.questiQsenStartTime === "string"
				? payload.questiQsenStartTime
				: typeof payload.quizQsenStartTime === "string"
					? payload.quizQsenStartTime
					: new Date().toISOString(),
		duration_seconds: Number.isFinite(timeValue) ? timeValue : 0,
		remaining_seconds: Number.isFinite(timeValue) ? timeValue : 0,
	};
};

export const connectSocket = async () => bridgeSocket.connect();
export const disconnectSocket = () => bridgeSocket.disconnect();
export const getSocket = () => bridgeSocket;

export const setCurrentQuest = (session: AnyPayload | null) => {
	currentQuest = session;
	publishLegacy("quest:current", session ?? {});
};

export const setCurrentQuiz = (session: AnyPayload | null) => {
	currentQuiz = session;
	publishLegacy("quiz:current", session ?? {});
};

export async function emitCreateQuest(params: AnyPayload) {
	currentQuest = params;
	publishLegacy("quest:created", params);
	return resolveSoon(params);
}

export async function emitCreateQuiz(params: AnyPayload) {
	currentQuiz = params;
	publishLegacy("quiz:created", params);
	return resolveSoon(params);
}

export const waitForQuestCreatedOnce = () =>
	resolveSoon(getLastLiveEvent("legacy", "quest:created") ?? currentQuest);
export const waitForQuizCreatedOnce = () =>
	resolveSoon(getLastLiveEvent("legacy", "quiz:created") ?? currentQuiz);

export async function emitJoinQuest(params: AnyPayload) {
	publishLegacy("quest:joined", params);
	return resolveSoon(params);
}

export async function emitJoinQuiz(params: AnyPayload) {
	publishLegacy("quiz:joined", params);
	return resolveSoon(params);
}

export const waitForQuestJoinedOnce = (): Promise<any> =>
	onceLegacy<any>("quest:joined");
export const waitForQuestJoinedOnceWithTimeout = (
	_questId?: string | null,
	timeoutMs?: number
): Promise<any> => onceLegacy<any>("quest:joined", timeoutMs);
export const waitForQuizJoinedOnce = (
	_quizId?: string | null,
	timeoutMs?: number
): Promise<any> => onceLegacy<any>("quiz:joined", timeoutMs);

export const waitForParticipantJoinedQuest = (callback: Callback) =>
	listenLegacy("participant.joined.quest", callback);
export const waitForParticipantJoined = (callback: Callback) =>
	listenLegacy("participant.joined.quiz", callback);

export async function emitStartQuest(params: AnyPayload) {
	publishLegacy("quest:started", params);
	return resolveSoon(params);
}

export async function emitStartQuiz(params: AnyPayload) {
	publishLegacy("quiz:started", params);
	return resolveSoon(params);
}

export const emitQuizStart = emitStartQuiz;
export const waitForQuestStartedOnce = () => resolveSoon(getLastLiveEvent("legacy", "quest:started"));
export const waitForQuizStartedOnce = () => resolveSoon(getLastLiveEvent("legacy", "quiz:started"));
export const waitForQuestStartedAll = (callback: Callback) => listenLegacy("quest:started", callback);
export const waitForQuizStartedAll = (callback: Callback) => listenLegacy("quiz:started", callback);

export async function emitChangeQuestionQuest(params: AnyPayload) {
	const sessionId = params.sessionId ?? params.session_id ?? queryParam("sid");
	const taskId = params.questionId ?? params.task_id ?? params.current_task_id;

	if (sessionId && taskId) {
		const state = await changeQuestTask(
			String(sessionId),
			String(taskId),
			timerStateFromPayload(params)
		);
		const payload = {
			...params,
			session_id: state.session_id,
			public_channel_key: state.public_channel_key,
			questionId: state.current_task_id ?? taskId,
			task_id: state.current_task_id ?? taskId,
		};
		publishLegacy("quest:task.changed", payload);
		return payload;
	}

	publishLegacy("quest:task.changed", params);
	return resolveSoon(params);
}

export async function emitChangeQuestion(params: AnyPayload) {
	const sessionId = params.sessionId ?? params.session_id ?? queryParam("sid");
	const questionId =
		params.questionId ?? params.question_id ?? params.current_question_id;

	if (sessionId && questionId) {
		const state = await changeQuizQuestion(
			String(sessionId),
			String(questionId),
			timerStateFromPayload(params)
		);
		const payload = {
			...params,
			session_id: state.session_id,
			public_channel_key: state.public_channel_key,
			questionId: state.current_question_id ?? questionId,
			question_id: state.current_question_id ?? questionId,
		};
		publishLegacy("quiz:question.changed", payload);
		return payload;
	}

	publishLegacy("quiz:question.changed", params);
	return resolveSoon(params);
}

export const waitForQuestionChangedQuestAll = (callback: Callback) =>
	listenLegacy("quest:task.changed", callback);
export const waitForQuestionChangedQuestAllDataGet = (): Promise<any> =>
	onceLegacy<any>("quest:task.changed");
export const waitForQuestionChangedQuestSingle = () =>
	resolveSoon<any>(getLastLiveEvent("legacy", "quest:task.changed"));
export const waitForQuestionChangedQuizAll = (callback: Callback) =>
	listenLegacy("quiz:question.changed", callback);
export const waitForQuestionChangedQuizSingle = () =>
	resolveSoon<any>(getLastLiveEvent("legacy", "quiz:question.changed"));
export const waitForQuestionChangedAll = (callback: Callback) =>
	listenLegacy("quest:task.changed", callback);
export const waitForQuestionChangedSingle = (callback?: Callback) =>
	callback ? listenLegacy("quest:task.changed", callback) : onceLegacy<any>("quest:task.changed");

export async function emitSubmitTask(params: AnyPayload) {
	publishLegacy("quest:answer.submitted", params);
	return resolveSoon(params);
}

export const emitsubmitTaskWithRanking = emitSubmitTask;
export const emitRankShortAndScaleSubmitTask = emitSubmitTask;
export const emitsubmitTaskForQuickForm = emitSubmitTask;
export const submitAnswer = async (params: AnyPayload) => {
	publishLegacy("quiz:answer.submitted", params);
	return resolveSoon(params);
};

export const waitForAnswerProcessedQuestOnce = () => resolveSoon();
export const waitForAnswerProcessedQuizOnce = () => resolveSoon();
export const waitForRankShortAndScaleSubmitTask = () => resolveSoon();
export const waitForRankingScoresAnswerProcessedQuestOnce = (callback?: Callback) =>
	callback ? listenLegacy("quest:ranking.updated", callback) : resolveSoon();
export const waitForRankingScoresAnswerProcessedQuestOnce22 = (callback?: Callback) =>
	callback ? listenLegacy("quest:ranking.updated", callback) : resolveSoon();
export const answerSubmittedToQuestCreator = (callback: Callback) =>
	listenLegacy("quest:answer.submitted", callback);
export const answerSubmittedToCreator = (callback: Callback) =>
	listenLegacy("quiz:answer.submitted", callback);
export const waitAnswerSubmittedToQuestCreatorQuickForm = (callback: Callback) =>
	listenLegacy("quest:answer.submitted", callback);

export async function emitCompleteQuest(params: AnyPayload) {
	publishLegacy("quest:completed", params);
	return resolveSoon(params);
}

export async function submitCompleteQuiz(params: AnyPayload) {
	publishLegacy("quiz:completed", params);
	return resolveSoon(params);
}

export const waitForQuestCompletedOnce = () => onceLegacy("quest:completed");
export const waitForQuestCompletedAll = (callback: Callback) => listenLegacy("quest:completed", callback);
export const userQuizCompleted = (callback: Callback) => listenLegacy("quiz:completed", callback);
export const userQuizCompletedAll = (callback: Callback) => listenLegacy("quiz:completed", callback);

export async function emitLeaveQuest(params: AnyPayload) {
	publishLegacy("quest:left", params);
	return resolveSoon(params);
}

export async function emitLeaveQuiz(params: AnyPayload) {
	publishLegacy("quiz:left", params);
	return resolveSoon(params);
}

export const waitForParticipantLeftQuestOnce = () => onceLegacy("quest:left");
export const waitForParticipantLeftQuestAll = (callback: Callback) => listenLegacy("quest:left", callback);
export const waitForParticipantLeft = (callback: Callback) => listenLegacy("quiz:left", callback);
export const waitForParticipantLeftAll = (callback: Callback) => listenLegacy("quiz:left", callback);

export async function emitAbandonQuest(params: AnyPayload) {
	publishLegacy("quest:abandoned", params);
	return resolveSoon(params);
}

export const waitForParticipantAbandonedQuestOnce = () => onceLegacy("quest:abandoned");
export const waitForParticipantAbandonedQuestAll = (callback: Callback) =>
	listenLegacy("quest:abandoned", callback);

export async function emitQuestLeaderboard(params: AnyPayload) {
	publishLegacy("quest:leaderboard.updated", params);
	return resolveSoon(params);
}

export const waitForLeaderboardUpdatedQuestAll = (callback: Callback) =>
	listenLegacy("quest:leaderboard.updated", callback);

export async function emitEndQuest(params: AnyPayload) {
	publishLegacy("quest:ended", params);
	return resolveSoon(params);
}

export async function emitEndQuiz(params: AnyPayload) {
	publishLegacy("quiz:ended", params);
	return resolveSoon(params);
}

export const waitForQuestEndedAll = (callback: Callback) => listenLegacy("quest:ended", callback);
export const waitForQuizEndedAll = (callback: Callback) => listenLegacy("quiz:ended", callback);

export function cacheJoin(id: string, payload: unknown) {
	if (typeof window === "undefined") return;
	window.sessionStorage.setItem(sessionStorageKey(`joined:${id}`), JSON.stringify(payload));
}

export function getCachedJoin(id: string) {
	if (typeof window === "undefined") return null;
	const value = window.sessionStorage.getItem(sessionStorageKey(`joined:${id}`));
	if (!value) return null;

	try {
		return JSON.parse(value);
	} catch {
		return null;
	}
}

export function clearCachedJoin(id: string) {
	if (typeof window === "undefined") return;
	window.sessionStorage.removeItem(sessionStorageKey(`joined:${id}`));
}
