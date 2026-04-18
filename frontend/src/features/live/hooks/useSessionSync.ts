"use client";

import { useCallback, useEffect, useState } from "react";
import { bindEchoConnection } from "@/lib/echo";
import { getSessionState } from "@/features/live/services/liveSessionApi";
import type { LiveModule, SessionSnapshot } from "@/features/live/types";

type UseSessionSyncOptions = {
	module: LiveModule;
	sessionId: number | string | null | undefined;
	participantToken?: string | null;
	onSync?: (snapshot: SessionSnapshot) => void;
	pollMs?: number;
};

export function useSessionSync({
	module,
	sessionId,
	participantToken,
	onSync,
	pollMs,
}: UseSessionSyncOptions) {
	const [snapshot, setSnapshot] = useState<SessionSnapshot | null>(null);
	const [isSyncing, setIsSyncing] = useState(false);
	const [error, setError] = useState<unknown>(null);

	const sync = useCallback(async () => {
		if (!sessionId) return null;

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
		document.addEventListener("visibilitychange", handleVisibility);

		return () => {
			unbindConnected();
			document.removeEventListener("visibilitychange", handleVisibility);
		};
	}, [sessionId, sync]);

	useEffect(() => {
		if (!sessionId || !pollMs || pollMs <= 0) return;

		const interval = window.setInterval(() => {
			void sync();
		}, pollMs);

		return () => window.clearInterval(interval);
	}, [pollMs, sessionId, sync]);

	return { snapshot, isSyncing, error, sync };
}
