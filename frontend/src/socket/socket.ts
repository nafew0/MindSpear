"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "https://quest.bdren.net.bd";
const SOCKET_PATH = process.env.NEXT_PUBLIC_SOCKET_PATH || "/socket.io";

let socket: Socket | null = null;
let pending: Promise<Socket> | null = null;

type QuizSession = {
	quizId: any;
	userId: string;
	quizTitle?: string;
	userName?: string;
	isCreator?: boolean;
};
let currentQuiz: QuizSession | null = null;

export const setCurrentQuiz = (session: QuizSession | null) => {
	currentQuiz = session;
	try {
		if (session)
			localStorage.setItem("quiz.session", JSON.stringify(session));
		else localStorage.removeItem("quiz.session");
	} catch {}
};

const loadCurrentQuiz = (): QuizSession | null => {
	try {
		return JSON.parse(localStorage.getItem("quiz.session") || "null");
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

	if (!currentQuiz) currentQuiz = loadCurrentQuiz();
	const auth = currentQuiz
		? { userId: currentQuiz.userId, userName: currentQuiz.userName }
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

	const tryRejoin = () => {
		if (!currentQuiz) return;
		const { quizId, userId, quizTitle, userName, isCreator } = currentQuiz;
		if (isCreator) {
			socket!.emit("startQuiz", quizId, userId, quizTitle, userName);
		} else {
			socket!.emit("joinQuiz", quizId, userId, quizTitle, userName);
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
			tryRejoin();
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
	socket = null;
};

export const getSocket = () => socket;
//
// ===================== QUIZ EVENTS =====================
//

/**
 * Create Quiz (host only)
 */
export async function emitCreateQuiz(params: {
	quizId: string;
	userId: string;
	quizTitle: string;
	userName: string;
	scoringParams?: any;
}) {
	const s = await connectSocket();
	// Backend expects multiple args
	s.emit(
		"createQuiz",
		params.quizId,
		params.userId,
		params.quizTitle,
		params.userName,
		params.scoringParams
	);
}

/**
 * Listen once for quizCreated host
 */
export async function waitForQuizCreatedOnce(): Promise<any> {
	const s = await connectSocket();
	return new Promise((resolve) => {
		s.off("quizCreated");
		s.once("quizCreated", (payload: any) => resolve(payload));
	});
}

/**
 * Join Quiz (participant only)
 */
export async function emitJoinQuiz(params: {
	quizId: string | any;
	userId: string;
	userName: string;
	quizTitle?: string;
}) {
	const s = await connectSocket();
	// Backend expects multiple args
	s.emit(
		"joinQuiz",
		params.quizId,
		params.userId,
		params.quizTitle,
		params.userName
	);
}

/**
 * Listen once for quizJoined (confirmation to participant)
 */
export async function waitForQuizJoineOnce(): Promise<any> {
	const s = await connectSocket();
	return new Promise((resolve) => {
		s.off("quizJoined");
		s.once("quizJoined", (payload: any) => resolve(payload));
	});
}

const JOIN_CACHE_KEY = (questId: string) => `quiz:joined:${questId}`;
// export function cacheJoin(questId: string, payload: any) {

// 	console.log(payload, "payloadpayloadpayload");

// 	const payloadData = {
// 		questId: payload?.questId,
// 		currentQuestion: {
// 			questionId: payload?.currentQuestion?.questionId,
// 			questiQsenStartTime: payload?.currentQuestion?.quizQsenStartTime,
// 			questiQsenTime: payload?.currentQuestion?.quizQsenTime,
// 			questiQsenLateStartTime:
// 				payload?.currentQuestion?.quizQsenLateStartTime,
// 		},
// 	};
// 	try {
// 		localStorage.setItem(
// 			JOIN_CACHE_KEY(String(questId)),
// 			JSON.stringify(payloadData)
// 		);
// 	} catch {}
// }

export function cacheJoin(questId: string, payload: any) {
	if (!payload) return;

	const correctPayload = {
		quizId: payload.quizId ?? payload.questId,

		currentQuestion: {
			questionId:
				payload?.currentQuestion?.questionId ??
				payload?.questionId ??
				null,

			quizQsenStartTime:
				payload?.currentQuestion?.quizQsenStartTime ??
				payload?.quizQsenStartTime ??
				null,

			quizQsenTime:
				payload?.currentQuestion?.quizQsenTime ??
				payload?.quizQsenTime ??
				null,

			quizQsenLateStartTime:
				payload?.currentQuestion?.quizQsenLateStartTime ??
				payload?.quizQsenLateStartTime ??
				null,
		},
	};

	localStorage.setItem(
		JOIN_CACHE_KEY(String(questId)),
		JSON.stringify(correctPayload)
	);

	//console.log("🔥 Saved to cache →", correctPayload);
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
/**
 *  (user)
 */
export async function waitForQuizJoinedOnce(
	quizId?: string | any,
	timeoutMs = 15000
): Promise<any> {
	const s = await connectSocket();

	console.log(quizId, "quizId");

	// Instant replay if we already have it
	if (quizId) {
		const cached = getCachedJoin(quizId);
		if (cached) {
			return cached;
		}
	}

	return new Promise((resolve, reject) => {
		const onJoin = (payload: any) => {
			// If caller asked for specific quest, ignore others
			if (quizId && String(payload?.quizId) !== String(quizId)) return;
			cacheJoin(String(quizId), payload);

			s.off("quizJoined", onJoin);
			clearTimeout(timer);
			resolve(payload);
		};

		const timer = setTimeout(() => {
			s.off("quizJoined", onJoin);
			reject(new Error("Timed out waiting for quizJoined"));
		}, timeoutMs);

		s.on("quizJoined", onJoin);
	});
}

/**
 * Listen for participantJoined (broadcast to host + others)
 */
export async function waitForParticipantJoined(
	callback: (payload: any) => void
) {
	const s = await connectSocket();
	// Allow multiple joins
	s.off("participantJoinedQuiz").on("participantJoinedQuiz", (payload: any) =>
		callback(payload)
	);
}

/**
 * Start Quiz (host only)
 */
export async function emitStartQuiz(params: {
	quizId: string;
	quizTitle?: string;
}) {
	const s = await connectSocket();
	s.emit("startQuiz", params.quizId, params.quizTitle);
}

// export async function waitForQuizStartedOnce(): Promise<any> {
// 	const s = await connectSocket();
// 	return new Promise((resolve) => {
// 		s.off("quizStarted");
// 		s.once("quizStarted", (payload: any) => resolve(payload));
// 	});
// }

// export async function emitQuizStart(params: {
// 	quizId: any;
// 	quizTitle?: any;
// 	userId?: any
// 	userName?: any
// }) {
// 	const s = await connectSocket();
// 	// Backend expects multiple args
// 	s.emit("startQuiz", params.quizId, params.quizTitle);
// }

/**
 * Start Quiz (host only)
 */

export async function emitQuizStart(params: {
	quizId: any;
	userId: string | null;
	userName: string | null;
	quizTitle?: string | null;
}) {
	const s = await connectSocket();
	s.emit(
		"startQuiz",
		params.quizId,
		params.userId,
		params.quizTitle,
		params.userName
	);
}
/**
 * (host only and user)
 */
export async function waitForQuizStartedAll(callback: (payload: any) => void) {
	const s = await connectSocket();
	// Allow multiple joins
	s.off("quizStartedAll").on("quizStartedAll", (payload: any) =>
		callback(payload)
	);
}
/**
 *  (host only)
 */
export async function waitForQuizStartedOnce(): Promise<any> {
	const s = await connectSocket();
	return new Promise((resolve) => {
		s.off("quizStarted");
		s.once("quizStarted", (payload: any) => resolve(payload));
	});
}
/**
 *  (host only)
 */
// Question Change Listener
export async function emitChangeQuestion(params: {
	quizId: string | number;
	questionId: string | number;
	quizTitle: string;
	questionTitle: string;
	quizQsenStartTime: string;
	quizQsenTime: string;
	quizQsenLateStartTime: any;
}) {
	const s = await connectSocket();
	s.emit(
		"changeQuestionQuiz",
		params.quizId,
		params.questionId,
		params.quizTitle,
		params.questionTitle,
		params.quizQsenStartTime,
		params.quizQsenTime,
		params.quizQsenLateStartTime,
		(res: any) => {
			if (res?.ok) {
				//console.log("✅ Success:", res);
			} else {
				console.warn("❌ Failed:", res?.code, res?.message);
			}
		}
	);
}

/**
 *  (host only and user)
 */
export async function waitForQuestionChangedQuizSingle(): Promise<any> {
	const s = await connectSocket();
	return new Promise((resolve) => {
		s.off("questionChangedQuiz");
		s.once("questionChangedQuiz", (payload: any) => resolve(payload));
	});
}
/**
 *  (host only and user)
 */
export async function waitForQuestionChangedQuizAll(
	callback: (payload: any) => void
) {
	const s = await connectSocket();
	s.off("questionChangedQuizAll").on("questionChangedQuizAll", callback);
}

/**
 * Leave Quiz (Participant)
 */
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

export async function waitForParticipantLeftAll(callback: {
	(payload: { userId: string }): void;
	(arg0: any): void;
}) {
	const s = await connectSocket();
	s.off("participantLeftAll").on("participantLeftAll", (payload) =>
		callback(payload)
	);
}

/**
 *  (host only and user)
 */
// Question Change Listener
export async function submitAnswer(params: {
	userid: any;
	questionId: any;
	userName: any;
	questionTitle: any;
	questionType: any;
	selectedOption: any;
	option: any;
}) {
	console.log(params, "params");

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

export async function answerSubmittedToCreator(
	callback: (payload: any) => void
) {
	const s = await connectSocket();
	// Allow multiple joins
	s.off("answerSubmittedToQuizCreator").on(
		"answerSubmittedToQuizCreator",
		(payload: any) => callback(payload)
	);
}
/**
 *  (user)
 */
export async function waitForAnswerProcessedQuizOnce(): Promise<any> {
	const s = await connectSocket();
	return new Promise((resolve) => {
		s.off("answerProcessedQuiz");
		s.once("answerProcessedQuiz", (payload: any) => resolve(payload));
	});
}
/**
 *  (host only and user)
 */
// Question Change Listener
export async function submitCompleteQuiz(params: {
	quizId: any;
	userid: any;
	quizTitle: any;
	userName: any;
}) {
	const s = await connectSocket();
	s.emit(
		"completeQuiz",
		params.quizId,
		params.userid,
		params.quizTitle,
		params.userName
	);
}
/**
 *  (host only and user)
 */
export async function userQuizCompleted(callback: (payload: any) => void) {
	const s = await connectSocket();
	// Allow multiple joins
	s.off("quizCompleted").on("quizCompleted", (payload: any) =>
		callback(payload)
	);
}
/**
 *  (host only and user)
 */
export async function userQuizCompletedAll(callback: (payload: any) => void) {
	const s = await connectSocket();
	// Allow multiple joins
	s.off("quizCompletedAll").on("quizCompletedAll", (payload: any) =>
		callback(payload)
	);
}
/**
 *  (user)
 */
export async function waitForQuestCompletedAll(
	callback: (payload: any) => void
) {
	const s = await connectSocket();
	s.off("quizCompletedAll").on("questCompletedAll", callback);
}
/**
 *  (host only and user)
 */
export async function waitForQuizEndedAll(callback: (payload: any) => void) {
	const s = await connectSocket();
	s.off("quizEndedAll").on("quizEndedAll", callback);
}
/**
 *  (host only and user)
 */
export async function emitEndQuiz(params: { quizId: any; quizTitle?: any }) {
	const s = await connectSocket();
	s.emit("endQuiz", params.quizId, params.quizTitle);
}
