import type { LiveModule } from "@/features/live/types";

type Handler = (payload: unknown) => void;

const memory = new Map<string, unknown>();

const keyFor = (module: LiveModule | "legacy", event: string) =>
	`mindspear:live:${module}:${event}`;

export function publishLiveEvent(
	module: LiveModule | "legacy",
	event: string,
	payload: unknown = {}
): void {
	const key = keyFor(module, event);
	memory.set(key, payload);

	if (typeof window === "undefined") return;
	window.dispatchEvent(new CustomEvent(key, { detail: payload }));
}

export function getLastLiveEvent<T = unknown>(
	module: LiveModule | "legacy",
	event: string
): T | null {
	return (memory.get(keyFor(module, event)) as T | undefined) ?? null;
}

export function onLiveEvent(
	module: LiveModule | "legacy",
	event: string,
	handler: Handler
): () => void {
	const key = keyFor(module, event);
	const listener = (customEvent: Event) => {
		handler((customEvent as CustomEvent).detail);
	};

	if (typeof window === "undefined") return () => {};
	window.addEventListener(key, listener);

	return () => window.removeEventListener(key, listener);
}

export function onceLiveEvent<T = unknown>(
	module: LiveModule | "legacy",
	event: string,
	timeoutMs = 500
): Promise<T | null> {
	const existing = getLastLiveEvent<T>(module, event);
	if (existing) return Promise.resolve(existing);

	return new Promise((resolve) => {
		const timeout = window.setTimeout(() => {
			unsubscribe();
			resolve(null);
		}, timeoutMs);
		const unsubscribe = onLiveEvent(module, event, (payload) => {
			window.clearTimeout(timeout);
			unsubscribe();
			resolve(payload as T);
		});
	});
}
