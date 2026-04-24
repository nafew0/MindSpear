"use client";

import Echo from "laravel-echo";
import Pusher from "pusher-js";
import { env } from "@/config/env";

type EchoConnectionState = "initialized" | "connected" | "disconnected" | "unavailable";

let echoInstance: Echo<"reverb"> | null = null;
let echoAuthToken: string | null = null;

const browserWindow = () =>
	typeof window === "undefined" ? null : (window as Window & { Pusher?: typeof Pusher });

export function getBackendOrigin(): string {
	if (env.apiBaseUrl) {
		try {
			const parsed = new URL(env.apiBaseUrl);
			return parsed.origin;
		} catch {
			return env.apiBaseUrl.replace(/\/api\/v\d+\/?$/, "").replace(/\/$/, "");
		}
	}

	return "";
}

export function getBroadcastAuthEndpoint(): string {
	const origin = getBackendOrigin();
	return origin ? `${origin}/broadcasting/auth` : "/broadcasting/auth";
}

export function getEcho(): Echo<"reverb"> {
	if (typeof window === "undefined") {
		throw new Error("Echo can only be initialized in the browser.");
	}

	const authToken = window.localStorage.getItem("auth_token");
	if (echoInstance && echoAuthToken === authToken) return echoInstance;
	if (echoInstance) destroyEcho();

	const win = browserWindow();
	if (win) win.Pusher = Pusher;

	const scheme = env.reverbScheme || "http";
	const port = Number(env.reverbPort || (scheme === "https" ? 443 : 80));
	const appKey = env.reverbAppKey;

	if (!appKey) {
		throw new Error(
			"Missing NEXT_PUBLIC_REVERB_APP_KEY. Copy REVERB_APP_KEY from backend/.env into frontend/.env and restart the frontend dev server."
		);
	}

	echoInstance = new Echo({
		broadcaster: "reverb",
		Pusher,
		key: appKey,
		wsHost: env.reverbHost || window.location.hostname,
		wsPort: port,
		wssPort: port,
		forceTLS: scheme === "https",
		enabledTransports: ["ws", "wss"],
		disableStats: true,
		authEndpoint: getBroadcastAuthEndpoint(),
		auth: {
			headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
		},
	});
	echoAuthToken = authToken;

	return echoInstance;
}

export function destroyEcho(): void {
	if (!echoInstance) return;
	echoInstance.disconnect();
	echoInstance = null;
	echoAuthToken = null;
}

export function bindEchoConnection(
	event: string,
	callback: (...args: unknown[]) => void
): () => void {
	if (typeof window === "undefined") return () => {};

	const echo = getEcho();
	const connection = echo.connector.pusher.connection;
	connection.bind(event, callback);

	return () => {
		connection.unbind(event, callback);
	};
}

export function getEchoConnectionState(): EchoConnectionState {
	if (typeof window === "undefined") return "unavailable";
	if (!echoInstance) return "initialized";

	const state = echoInstance.connector.pusher.connection.state;
	if (state === "connected") return "connected";
	if (state === "disconnected" || state === "unavailable" || state === "failed") {
		return "disconnected";
	}

	return "initialized";
}
