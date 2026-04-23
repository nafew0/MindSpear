"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { bindEchoConnection } from "@/lib/echo";
import { getSessionState } from "@/features/live/services/liveSessionApi";
import type { LiveModule, SessionSnapshot } from "@/features/live/types";

type UseSessionSyncOptions = {
	module: LiveModule;
	sessionId: number | string | null | undefined;
	participantToken?: string | null;
	onSync?: (snapshot: SessionSnapshot) => void;
};

export function useSessionSync({
	module,
	sessionId,
	participantToken,
	onSync,
}: UseSessionSyncOptions) {
	const [snapshot, setSnapshot] = useState<SessionSnapshot | null>(null);
	const [isSyncing, setIsSyncing] = useState(false);
	const [error, setError] = useState<unknown>(null);
	const inFlightRef = useRef(false);

	const sync = useCallback(async () => {
		if (!sessionId) return null;
		if (inFlightRef.current) return null;

		inFlightRef.current = true;
		setIsSyncing(true);
		try {
			const nextSnapshot = await getSessionState(module, sessionId, participantToken);
			setSnapshot(nextSnapshot);
			setError(null);
			onSync?.(nextSnapshot);
			return nextSnapshot;
		} catch (syncError) {
			setError(syncError);
			return null;
		} finally {
			inFlightRef.current = false;
			setIsSyncing(false);
		}
	}, [module, onSync, participantToken, sessionId]);

	useEffect(() => {
		void sync();
	}, [sync]);

	useEffect(() => {
		if (!sessionId) return;

		const unbindConnected = bindEchoConnection("connected", () => {
			void sync();
		});

		const handleVisibility = () => {
			if (document.visibilityState === "visible") void sync();
		};
		const handleWindowActive = () => {
			void sync();
		};

		document.addEventListener("visibilitychange", handleVisibility);
		window.addEventListener("focus", handleWindowActive);
		window.addEventListener("pageshow", handleWindowActive);
		window.addEventListener("online", handleWindowActive);

		return () => {
			unbindConnected();
			document.removeEventListener("visibilitychange", handleVisibility);
			window.removeEventListener("focus", handleWindowActive);
			window.removeEventListener("pageshow", handleWindowActive);
			window.removeEventListener("online", handleWindowActive);
		};
	}, [sessionId, sync]);

	return { snapshot, isSyncing, error, sync };
}
