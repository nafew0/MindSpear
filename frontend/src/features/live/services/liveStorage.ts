import type { LiveModule, ParticipantTokenBundle } from "@/features/live/types";

const prefix = "mindspear:live";

const keyFor = (module: LiveModule, sessionId: number | string, key: string) =>
	`${prefix}:${module}:${sessionId}:${key}`;

export function storeParticipantTokenBundle(bundle: ParticipantTokenBundle): void {
	if (typeof window === "undefined") return;

	window.sessionStorage.setItem(
		keyFor(bundle.module, bundle.sessionId, "participant_token"),
		bundle.participantToken
	);
	window.sessionStorage.setItem(
		keyFor(bundle.module, bundle.sessionId, "attempt_id"),
		String(bundle.attemptId)
	);
	window.sessionStorage.setItem(
		keyFor(bundle.module, bundle.sessionId, "public_channel_key"),
		bundle.publicChannelKey
	);
}

export function getParticipantToken(module: LiveModule, sessionId: number | string | null): string | null {
	if (typeof window === "undefined" || !sessionId) return null;
	return window.sessionStorage.getItem(keyFor(module, sessionId, "participant_token"));
}

export function getStoredAttemptId(module: LiveModule, sessionId: number | string | null): number | null {
	if (typeof window === "undefined" || !sessionId) return null;
	const value = window.sessionStorage.getItem(keyFor(module, sessionId, "attempt_id"));
	return value ? Number(value) : null;
}

export function getStoredPublicChannelKey(
	module: LiveModule,
	sessionId: number | string | null
): string | null {
	if (typeof window === "undefined" || !sessionId) return null;
	return window.sessionStorage.getItem(keyFor(module, sessionId, "public_channel_key"));
}

export function clearLiveSessionStorage(module?: LiveModule, sessionId?: number | string): void {
	if (typeof window === "undefined") return;

	const namespace = sessionId && module ? `${prefix}:${module}:${sessionId}:` : prefix;
	Object.keys(window.sessionStorage).forEach((key) => {
		if (key.startsWith(namespace)) window.sessionStorage.removeItem(key);
	});
}

export function clearLegacyLiveStorage(): void {
	if (typeof window === "undefined") return;

	const legacyKeys = [
		"quest.session",
		"quiz.session",
		"quiz_currentQuestion",
		"quiz_questions",
		"quiz_questionsId",
		"leaderboardState",
		"userTimeSet",
		"currentId",
	];

	legacyKeys.forEach((key) => window.localStorage.removeItem(key));
	Object.keys(window.localStorage).forEach((key) => {
		if (
			key.startsWith("timer_") ||
			key.startsWith("attempt-") ||
			key.startsWith("timeExpired_") ||
			key.startsWith("quest:joined:") ||
			key.startsWith("quiz:joined:")
		) {
			window.localStorage.removeItem(key);
		}
	});
}
