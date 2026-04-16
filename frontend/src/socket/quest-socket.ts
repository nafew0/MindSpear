"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { io, Socket } from "socket.io-client";

const SOCKET_URL =
	process.env.NEXT_PUBLIC_SOCKET_URL || "https://quest.bdren.net.bd";
const SOCKET_PATH = process.env.NEXT_PUBLIC_SOCKET_PATH || "/socket.io";

let socket: Socket | null = null;
let pending: Promise<Socket> | null = null;

// Persist the active quest so we can auto-rejoin after reconnects
type QuestSession = {
	questId: any;
	userId: string;
	questTitle?: string;
	userName?: string;
	isCreator?: boolean; // true => will emit startQuest; false => joinQuest
};
let currentQuest: QuestSession | null = null;

export const setCurrentQuest = (session: QuestSession | null) => {
	currentQuest = session;
	try {
		if (session)
			localStorage.setItem("quest.session", JSON.stringify(session));
		else localStorage.removeItem("quest.session");
	} catch {}
};

const loadCurrentQuest = (): QuestSession | null => {
	try {
		return JSON.parse(localStorage.getItem("quest.session") || "null");
	} catch {
		return null;
	}
};

export const connectSocket = async (): Promise<Socket> => {
	if (socket?.connected) return socket!;
	if (pending) return pending;

	if (typeof window === "undefined") {
		throw new Error("connectSocket must be called on the client");
	}

	if (!currentQuest) currentQuest = loadCurrentQuest();
	const auth = currentQuest
		? { userId: currentQuest.userId, userName: currentQuest.userName }
		: {};

	socket = io(SOCKET_URL, {
		path: SOCKET_PATH,
		transports: ["websocket", "polling"],
		reconnection: true,
		reconnectionAttempts: Infinity,
		reconnectionDelay: 500,
		reconnectionDelayMax: 15_000,
		timeout: 10_000,
		autoConnect: true,
		withCredentials: true,
		auth,
	});
	// console.log(socket, "socket222");

	const tryRejoin = () => {
		if (!currentQuest) return;
		const { questId, userId, questTitle, userName, isCreator } =
			currentQuest;
		if (isCreator) {
			socket!.emit("startQuest", questId, userId, questTitle, userName);
		} else {
			socket!.emit("joinQuest", questId, userId, questTitle, userName);
		}
	};

	// Ensure we reconnect when tab becomes visible or network returns
	const onFocus = () => {
		if (socket && !socket.connected) socket.connect();
	};
	const onOnline = () => {
		if (socket && !socket.connected) socket.connect();
	};
	window.addEventListener("online", onOnline);
	document.addEventListener("visibilitychange", () => {
		if (document.visibilityState === "visible") onFocus();
	});

	pending = new Promise<Socket>((resolve, reject) => {
		const cleanup = () => {
			pending = null;
			socket?.off("connect", onConnect);
			socket?.off("reconnect", onReconnect as any);
			socket?.off("connect_error", onError as any);
		};

		const onConnect = () => {
			tryRejoin();
			cleanup();
			resolve(socket!);
		};
		const onReconnect = () => {
			tryRejoin(); // auto-rejoin on any reconnect
		};
		const onError = (err: any) => {
			cleanup();
			socket?.disconnect();
			socket = null;
			reject(err);
		};

		socket!.once("connect", onConnect);
		socket!.on("reconnect", onReconnect);
		socket!.once("connect_error", onError);
	});

	return pending!;
};

export const disconnectSocket = () => {
	pending = null;
	if (!socket) return;
	socket.disconnect();
	// console.log(socket, "socket222");
	socket = null;
};

export const getSocket = () => socket;

/****************************************
 		QUEST SOCKET EVENTS
*****************************************/

/**
 * Create Quest (host only)
 */
export async function emitCreateQuest(params: {
	questId: string;
	userId: string;
	questTitle: string;
	userName: string;
	scoringParams?: any;
}) {
	const s = await connectSocket();
	s.emit(
		"createQuest",
		params.questId,
		params.userId,
		params.questTitle,
		params.userName,
		params.scoringParams
	);
}

/**
 * Wait once for questCreated confirmation
 */
export async function waitForQuestCreatedOnce(): Promise<any> {
	const s = await connectSocket();
	return new Promise((resolve) => {
		s.off("questCreated");
		s.once("questCreated", (payload: any) => resolve(payload));
	});
}

/**
 * Join Quest (participant only)
 */
export async function emitJoinQuest(params: {
	questId: any;
	userId: string | null;
	userName: string | null;
	questTitle?: string | null;
}) {
	const s = await connectSocket();
	s.emit(
		"joinQuest",
		params.questId,
		params.userId,
		params.questTitle,
		params.userName
	);
}

/**
 * Listen once for questJoined (confirmation to participant)
 */
export async function waitForQuestJoinedOnce(): Promise<any> {
	const s = await connectSocket();
	return new Promise((resolve) => {
		s.off("questJoined");
		s.once("questJoined", (payload: any) => resolve(payload));
	});
}

// socket file (keep your imports & existing code)
const JOIN_CACHE_KEY = (questId: string) => `quest:joined:${questId}`;
export function cacheJoin(questId: string, payload: any) {
	const payloadData = {
		questId: payload?.questId,
		currentQuestion: {
			questionId: payload?.currentQuestion?.questionId,
			questiQsenStartTime: payload?.currentQuestion?.questiQsenStartTime,
			questiQsenTime: payload?.currentQuestion?.questiQsenTime,
			questiQsenLateStartTime:
				payload?.currentQuestion?.questiQsenLateStartTime,
		},
	};
	try {
		localStorage.setItem(
			JOIN_CACHE_KEY(String(questId)),
			JSON.stringify(payloadData)
		);
	} catch {}
}
export function getCachedJoin(questId: string) {
	try {
		const raw = localStorage.getItem(JOIN_CACHE_KEY(String(questId)));
		return raw ? JSON.parse(raw) : null;
	} catch {
		return null;
	}
}
export function clearCachedJoin(questId: string) {
	try {
		localStorage.removeItem(JOIN_CACHE_KEY(String(questId)));
	} catch {}
}

export async function waitForQuestJoinedOnce22(
	questId?: string,
	timeoutMs = 15000
): Promise<any> {
	const s = await connectSocket();

	// Instant replay if we already have it
	if (questId) {
		const cached = getCachedJoin(questId);
		if (cached) return cached;
	}

	return new Promise((resolve, reject) => {
		const onJoin = (payload: any) => {
			// If caller asked for specific quest, ignore others
			if (questId && String(payload?.questId) !== String(questId)) return;

			if (questId) cacheJoin(String(questId), payload);
			s.off("questJoined", onJoin); // remove only THIS listener
			clearTimeout(timer);
			resolve(payload);
		};

		const timer = setTimeout(() => {
			s.off("questJoined", onJoin);
			reject(new Error("Timed out waiting for questJoined"));
		}, timeoutMs);

		s.on("questJoined", onJoin); // no s.off("questJoined") here
	});
}

/**
 * Listen for participantJoinedQuest (broadcast to host + others)
 */
export async function waitForParticipantJoinedQuest(
	callback: (payload: any) => void
) {
	const s = await connectSocket();
	s.off("participantJoinedQuest").on("participantJoinedQuest", callback);
}

export async function emitStartQuest(params: {
	questId: any;
	userId: string | null;
	userName: string | null;
	questTitle?: string | null;
}) {
	const s = await connectSocket();
	s.emit(
		"startQuest",
		params.questId,
		params.userId,
		params.questTitle,
		params.userName
	);
}

/**
 * Wait once for questStarted (confirmation to starter)
 */
export async function waitForQuestStartedOnce(): Promise<any> {
	const s = await connectSocket();
	return new Promise((resolve) => {
		s.off("questStarted");
		s.once("questStarted", (payload: any) => resolve(payload));
	});
}

/**
 * Listen for questStartedAll (broadcast to all participants)
 */
export async function waitForQuestStartedAll(callback: (payload: any) => void) {
	const s = await connectSocket();
	s.off("questStartedAll").on("questStartedAll", callback);
}

/**
 * Submit Task (participant only)
 */
export async function emitSubmitTask(params: {
	userId: string;
	questionId: string;
	userName: string;
	questionTitle: string;
	questionType: string;
	selectedOption: any;
	optionType: string;
}) {
	const s = await connectSocket();
	s.emit(
		"submitTask",
		params.userId,
		params.questionId,
		params.userName,
		params.questionTitle,
		params.questionType,
		params.selectedOption,
		params.optionType
	);
}
export async function emitsubmitTaskWithRanking(params: {
	userId: string;
	questionId: string;
	userName: string;
	questionTitle: string;
	questionType: string;
	selectedOption: any;
	optionType: string;
}) {
	const s = await connectSocket();
	s.emit(
		"submitTaskWithRanking",
		params.userId,
		params.questionId,
		params.userName,
		params.questionTitle,
		params.questionType,
		params.selectedOption,
		params.optionType
	);
}

/**
 * Submit Task (participant only)
 */
export async function emitRankShortAndScaleSubmitTask(params: {
	userId: string;
	questionId: string;
	userName: string;
	questionTitle: string;
	questionType: string;
	selectedOption: any;
	optionType: string;
}) {
	const s = await connectSocket();
	s.emit(
		"submitTaskWithRanking",
		params.userId,
		params.questionId,
		params.userName,
		params.questionTitle,
		params.questionType,
		params.selectedOption,
		params.optionType
	);
}
export async function waitForRankShortAndScaleSubmitTask(): Promise<any> {
	const s = await connectSocket();
	return new Promise((resolve) => {
		s.off("rankingSubmittedToQuestCreator");
		s.once("rankingSubmittedToQuestCreator", (payload: any) =>
			resolve(payload)
		);
	});
}

/**
 * Listen for answer processed confirmation (back to participant)
 */

export async function waitForRankingScoresAnswerProcessedQuestOnce(): Promise<any> {
	const s = await connectSocket();
	return new Promise((resolve) => {
		s.off("userRankingScores");
		s.once("userRankingScores", (payload: any) => resolve(payload));
	});
}

export async function waitForRankingScoresAnswerProcessedQuestOnce22(
	callback: (payload: any) => void
) {
	const s = await connectSocket();
	s.off("rankingSubmittedToQuestCreator").on(
		"rankingSubmittedToQuestCreator",
		callback
	);
}
/**
 * Listen for answer processed confirmation (back to participant)
 */
export async function waitForAnswerProcessedQuestOnce(): Promise<any> {
	const s = await connectSocket();
	return new Promise((resolve) => {
		s.off("answerProcessedQuest");
		s.once("answerProcessedQuest", (payload: any) => resolve(payload));
	});
}

/**
 * Listen for aggregated answers submitted to quest creator
 */
export async function answerSubmittedToQuestCreator(
	callback: (payload: any) => void
) {
	const s = await connectSocket();
	s.off("answerSubmittedToQuestCreator").on(
		"answerSubmittedToQuestCreator",
		callback
	);
}

/**
 * Complete Quest (participant only)
 */
export async function emitCompleteQuest(params: {
	questId: string;
	userId: string;
	questTitle?: string;
	userName?: string;
}) {
	const s = await connectSocket();
	s.emit(
		"completeQuest",
		params.questId,
		params.userId,
		params.questTitle,
		params.userName
	);
}

export async function waitForQuestCompletedOnce(): Promise<any> {
	const s = await connectSocket();
	return new Promise((resolve) => {
		s.off("questCompleted");
		s.once("questCompleted", (payload: any) => resolve(payload));
	});
}

export async function waitForQuestCompletedAll(
	callback: (payload: any) => void
) {
	const s = await connectSocket();
	s.off("questCompletedAll").on("questCompletedAll", callback);
}

/**
 * Leave Quest (participant only)
 */
export async function emitLeaveQuest(params: {
	questId: string;
	userId: string;
	questTitle?: string;
	userName?: string;
}) {
	const s = await connectSocket();
	s.emit(
		"leaveQuest",
		params.questId,
		params.userId,
		params.questTitle,
		params.userName
	);
}

export async function waitForParticipantLeftQuestOnce(): Promise<any> {
	const s = await connectSocket();
	return new Promise((resolve) => {
		s.off("participantLeftQuest");
		s.once("participantLeftQuest", (payload: any) => resolve(payload));
	});
}

export async function waitForParticipantLeftQuestAll(
	callback: (payload: any) => void
) {
	const s = await connectSocket();
	s.off("participantLeftQuestAll").on("participantLeftQuestAll", callback);
}

/**
 * Abandon Quest (participant only)
 */
export async function emitAbandonQuest(params: {
	questId: string;
	userId: string;
	questTitle?: string;
	userName?: string;
}) {
	const s = await connectSocket();
	s.emit(
		"abandonQuest",
		params.questId,
		params.userId,
		params.questTitle,
		params.userName
	);
}

export async function waitForParticipantAbandonedQuestOnce(): Promise<any> {
	const s = await connectSocket();
	return new Promise((resolve) => {
		s.off("participantAbandonedQuest");
		s.once("participantAbandonedQuest", (payload: any) => resolve(payload));
	});
}

export async function waitForParticipantAbandonedQuestAll(
	callback: (payload: any) => void
) {
	const s = await connectSocket();
	s.off("participantAbandonedQuestAll").on(
		"participantAbandonedQuestAll",
		callback
	);
}

/**
 * Quest Leaderboard Update
 */
export async function emitQuestLeaderboard(params: {
	questId: string;
	userId: string;
	questTitle?: string;
	userName?: string;
	leaderboardData: any;
}) {
	const s = await connectSocket();
	s.emit(
		"questLeaderboard",
		params.questId,
		params.userId,
		params.questTitle,
		params.userName,
		params.leaderboardData
	);
}

export async function waitForLeaderboardUpdatedQuestAll(
	callback: (payload: any) => void
) {
	const s = await connectSocket();
	s.off("leaderboardUpdatedQuestAll").on(
		"leaderboardUpdatedQuestAll",
		callback
	);
}

/**
 * Change Question (host only)
 */
export async function emitChangeQuestionQuest(params: {
	questId: string | number;
	questionId: string | number;
	questTitle: string;
	questionTitle: string;
	questiQsenStartTime: string;
	questiQsenTime: string;
	questiQsenLateStartTime: any;
}) {
	const s = await connectSocket();
	s.emit(
		"changeQuestionQuest",
		params.questId,
		params.questionId,
		params.questTitle,
		params.questionTitle,
		params.questiQsenStartTime,
		params.questiQsenTime,
		params.questiQsenLateStartTime,
		(res: any) => {
			if (res?.ok) {
				//console.log("✅ Success:", res);
				// e.g., toast.success(res.message)
			} else {
				console.warn("❌ Failed:", res?.code, res?.message);
				// e.g., toast.error(res?.message || "Failed")
			}
		}
	);
}

export async function waitForQuestionChangedQuestAll(
	callback: (payload: any) => void
) {
	const s = await connectSocket();
	s.off("questionChangedQuestAll").on("questionChangedQuestAll", callback);
}

export async function waitForQuestionChangedQuestAllDataGet(): Promise<any> {
	const s = await connectSocket();
	return new Promise((resolve) => {
		s.off("questionChangedQuestAll");
		s.once("questionChangedQuestAll", (payload: any) => resolve(payload));
	});
}

export async function waitForQuestionChangedQuestSingle(): Promise<any> {
	const s = await connectSocket();
	return new Promise((resolve) => {
		s.off("questionChangedQuest");
		s.once("questionChangedQuest", (payload: any) => resolve(payload));
	});
}

/**
 * End Quest (host only)
 */
export async function emitEndQuest(params: { questId: any; questTitle?: any }) {
	const s = await connectSocket();
	s.emit("endQuest", params.questId, params.questTitle);
}

export async function waitForQuestEndedAll(callback: (payload: any) => void) {
	const s = await connectSocket();
	s.off("questEndedAll").on("questEndedAll", callback);
}

export async function waitForQuestionChangedAll(callback: {
	(payload: any): void;
	(arg0: any): void;
}) {
	const s = await connectSocket();
	s.off("questionChangedQuestAll").on("questionChangedQuestAll", (payload) =>
		callback(payload)
	);
}
export async function waitForQuestionChangedSingle(callback: {
	(payload: any): void;
	(arg0: any): void;
}) {
	const s = await connectSocket();
	s.off("questionChanged").on("questionChanged", (payload) =>
		callback(payload)
	);
}

export async function submitAnswer(params: {
	userid: any;
	questionId: any;
	userName: any;
	questionTitle: any;
	questionType: any;
	selectedOption: any;
	option: any;
}) {
	const s = await connectSocket();
	s.emit(
		"submitAnswer",
		params.userid,
		params.questionId,
		params.userName,
		params.questionTitle,
		params.questionType,
		params.selectedOption,
		params.option
	);
}

export const emitLeaveQuiz = (data: {
	quizId: any;
	userId: any;
	quizTitle: any;
	userName: any;
}) => {
	return new Promise((resolve, reject) => {
		if (!socket) {
			reject(new Error("Socket not connected"));
			return;
		}

		socket.emit(
			"leaveQuiz",
			data.quizId,
			data.userId,
			data.quizTitle,
			data.userName,
			(response: any) => {
				if (response.error) {
					reject(response.error);
				} else {
					resolve(response);
				}
			}
		);
	});
};

// Add listener for leave confirmation
export const waitForParticipantLeft = (callback: {
	(payload: { userId: string }): void;
	(...args: any[]): void;
}) => {
	if (!socket) {
		console.error("Socket not connected");
		return;
	}

	socket.on("participantLeft", callback);
};

export async function emitsubmitTaskForQuickForm(params: {
	userId: string;
	questionId: string;
	userName: string;
	questionTitle: string;
	questionType: string;
	quickFormData: any;
	optionType: string;
}) {
	const s = await connectSocket();
	s.emit(
		"submitTaskForQuickForm",
		params.userId,
		params.questionId,
		params.userName,
		params.questionTitle,
		params.questionType,
		params.quickFormData,
		params.optionType
	);
}

export async function waitAnswerSubmittedToQuestCreatorQuickForm(callback: {
	(payload: any): void;
	(arg0: any): void;
}) {
	const s = await connectSocket();
	s.off("answerSubmittedToQuestCreatorQuickForm").on(
		"answerSubmittedToQuestCreatorQuickForm",
		(payload) => callback(payload)
	);
}
