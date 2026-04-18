/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { connectSocket, waitForQuestCompletedAll } from "@/features/live/services/realtimeBridge";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import { toast } from "react-toastify";

type QuizTiming = {
	id: number | string;
	quiztime_mode: boolean; // false => time_limit (seconds), true => duration (minutes)
	time_limit?: number; // seconds
	duration?: number; // minutes
	open_datetime?: string; // ISO (optional)
	close_datetime?: string; // ISO (optional)
};

type QuizTimerProps = {
	data?: any;
	onExpire?: () => void | Promise<void>;
	onTimeUpdate?: (remaining: number, elapsed: number, total: number) => void;
	persistKey?: string;
	autoStart?: boolean;
	/** 🔕 Throttle parent updates: only notify every N seconds (default 5). */
	tickIntervalSec?: number;
};

/** Current time helpers */
export const getCurrentTime = (): Date => new Date();
export const nowISO = () => new Date().toISOString();
export const nowUnixSeconds = () => Math.floor(Date.now() / 1000);

/** Format seconds -> mm:ss */
const mmss = (totalSec: number) => {
	const m = Math.floor(totalSec / 60);
	const s = totalSec % 60;
	return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const clampToClose = (endTs: number, closeIso?: string) => {
	if (!closeIso) return endTs;
	const closeTs = new Date(closeIso).getTime();
	return Math.min(endTs, closeTs);
};

/* ------------------- 🔐 Local cache helpers (ADD) ------------------- */
const readTimerCache = (key: string) => {
	try {
		const raw = localStorage.getItem(key);
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		if (typeof parsed?.remaining !== "number") return null;
		return Math.max(0, Math.floor(parsed.remaining));
	} catch {
		return null;
	}
};

const writeTimerCache = (key: string, remaining: number, total: number) => {
	try {
		localStorage.setItem(
			key,
			JSON.stringify({
				remaining: Math.max(0, Math.floor(remaining)),
				total,
				savedAt: Date.now(),
			})
		);
	} catch {}
};

const removeTimerCache = (key: string) => {
	try {
		localStorage.removeItem(key);
	} catch {}
};
/* ------------------------------------------------------------------- */

function QuizTimer({
	data,
	onExpire,
	persistKey = "quiz-global",
	autoStart = true,
	onTimeUpdate,
	tickIntervalSec = 5, // 👈 default throttle to 5s to avoid page re-render storms
}: QuizTimerProps) {
	console.log(data, "datadatadatadatadatadatadata");

	const hasData = !!data;
	const safeData: QuizTiming = hasData
		? (data as QuizTiming)
		: { id: "__no-data__", quiztime_mode: false, time_limit: 30 };

	const {
		id,
		quiztime_mode,
		time_limit = 0,
		duration,
		close_datetime,
	} = safeData;

	const [isReady, setIsReady] = useState(false);
	const [perItemDone, setPerItemDone] = useState(false);
	const [globalEndAt, setGlobalEndAt] = useState<number | null>(null);

	// 🔒 Keep latest callbacks without changing render identity
	const onExpireRef = useRef(onExpire);
	const onTimeUpdateRef = useRef(onTimeUpdate);
	useEffect(() => {
		onExpireRef.current = onExpire;
	}, [onExpire]);
	useEffect(() => {
		onTimeUpdateRef.current = onTimeUpdate;
	}, [onTimeUpdate]);

	// 🔕 Throttle emission to parent
	const lastEmittedSecondRef = useRef<number | null>(null);

	const clearQuestionDataFromStorage = () => {
		if (typeof window !== "undefined") {
			localStorage.removeItem("quiz_currentQuestion");
			localStorage.removeItem("quiz_questions");
			localStorage.removeItem("quiz_questionsId");
			const keys = Object.keys(localStorage);
			keys.forEach((key) => {
				if (key.startsWith("attempt-")) {
					localStorage.removeItem(key);
				}
			});
		}
	};

	useEffect(() => {
		connectSocket()
			.then(async (s) => {
				//console.log("Socket Connected:", s.id);
				waitForQuestCompletedAll((payload) => {
					//console.log("000000000", payload);
					toast.success(`${payload?.message}`);
					clearQuestionDataFromStorage();
				});
			})
			.catch((err) => {
				console.error("Socket Connection failed:", err);
			});
	}, []);

	useEffect(() => {
		if (!hasData) {
			setIsReady(true);
			return;
		}

		if (!quiztime_mode) {
			setPerItemDone(false);
			setIsReady(true);
			return;
		}

		// Global mode init
		const durSec = Math.max(0, Math.floor((duration ?? 0) * 60));
		const now = Date.now();
		let endTs = now + durSec * 1000;
		endTs = clampToClose(endTs, close_datetime);

		setGlobalEndAt(endTs);
		setIsReady(true);
	}, [hasData, quiztime_mode, duration, close_datetime]);

	// Fire onExpire immediately if global already passed
	useEffect(() => {
		if (!isReady || !hasData) return;
		if (
			quiztime_mode &&
			globalEndAt !== null &&
			Date.now() >= globalEndAt
		) {
			onExpireRef.current?.();
		}
	}, [isReady, hasData, quiztime_mode, globalEndAt]);

	const isGlobal = quiztime_mode === true;

	/* ------------- 🔑 Build per-item cache key + detect navigation ------------- */
	const isBrowser = typeof window !== "undefined";
	// per-item হলে প্রতিটি প্রশ্নের জন্য আলাদা cache key
	const perItemKey = !isGlobal
		? `attempt-timer:${persistKey}:${id}:${time_limit}`
		: null;

	// এই ট্যাবে আগের key (reload-এ টিকে থাকে)
	const prevKeyInSession = isBrowser
		? sessionStorage.getItem("attempt_timer_prev_key")
		: null;

	// prev key != current key => অন্য প্রশ্নে গেছি (navigation)
	const isNavigation =
		isBrowser && perItemKey
			? !!prevKeyInSession && prevKeyInSession !== perItemKey
			: false;

	// প্রশ্ন বদলানো/প্রবেশের সাথে সাথে সেশন-কি আপডেট
	useEffect(() => {
		if (!isBrowser || !perItemKey) return;
		sessionStorage.setItem("attempt_timer_prev_key", perItemKey);
	}, [isBrowser, perItemKey]);

	/* ------------------- ⏱️ Compute durations (with cache) ------------------- */
	const { totalSeconds, initialRemaining } = useMemo(() => {
		if (!hasData) return { totalSeconds: 0, initialRemaining: 0 };
		if (isGlobal) {
			const durSec = Math.max(0, Math.floor((duration ?? 0) * 60));
			if (globalEndAt == null)
				return { totalSeconds: durSec, initialRemaining: durSec };
			const nowSec = Math.floor(Date.now() / 1000);
			const endSec = Math.floor(globalEndAt / 1000);
			const remain = Math.max(0, Math.min(durSec, endSec - nowSec));
			return { totalSeconds: durSec, initialRemaining: remain };
		} else {
			const tl = Math.max(0, Math.floor(time_limit));
			// Navigation হলে fresh start; Reload হলে cache থেকে resume
			let resumeFrom = tl;
			if (isBrowser && perItemKey && !isNavigation) {
				const cached = readTimerCache(perItemKey);
				if (typeof cached === "number") {
					resumeFrom = Math.max(0, Math.min(tl, cached));
				}
			}
			return {
				totalSeconds: tl,
				initialRemaining: perItemDone ? 0 : resumeFrom,
			};
		}
	}, [
		hasData,
		isGlobal,
		duration,
		globalEndAt,
		time_limit,
		perItemDone,
		isBrowser,
		perItemKey,
		isNavigation,
	]);

	// Key governs restart behavior (তোমার আগের লজিকই রাখা হয়েছে)
	const timerKey = isGlobal
		? `global-${persistKey}`
		: `per-item-${id}-${time_limit}`;

	// ---- Color stages (as lib expects) ----
	type ColorFormatStrict = { 0: `#${string}` } & {
		1: `#${string}`;
	} & `#${string}`[];
	type ColorsTimeStrict = { 0: number } & { 1: number } & number[];

	const colors: ColorFormatStrict = [
		"#16a34a", // green
		"#f59e0b", // amber
		"#ef4444", // red
		"#9ca3af", // sds
	] as string[] as ColorFormatStrict;

	const colorsTime: ColorsTimeStrict = [
		totalSeconds, // green until total
		Math.max(1, Math.ceil(totalSeconds * 0.5)), // amber last half
		Math.max(10, Math.ceil(totalSeconds * 0.2)), // red last 20% (>=10s)
		0,
	] as number[] as ColorsTimeStrict;

	const renderTime = ({ remainingTime }: { remainingTime: number }) => (
		<div className="flex flex-col items-center justify-center">
			<div className="text-xs uppercase tracking-wide opacity-70">
				Remaining
			</div>
			<div className="text-2xl font-semibold">
				{mmss(Math.max(0, remainingTime))}
			</div>
		</div>
	);

	if (!isReady) {
		return (
			<div className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
				<span className="animate-pulse">Loading timer…</span>
			</div>
		);
	}
	if (!hasData) {
		return (
			<div className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
				<span>Timer data not provided.</span>
			</div>
		);
	}

	const shouldPlay =
		autoStart &&
		(!isGlobal
			? !perItemDone && initialRemaining > 0
			: initialRemaining > 0);

	return (
		<div className="inline-flex flex-col items-center gap-2">
			<CountdownCircleTimer
				key={timerKey}
				isPlaying={shouldPlay}
				duration={totalSeconds}
				initialRemainingTime={initialRemaining}
				updateInterval={1}
				trailColor="#eee"
				colors={colors}
				size={140}
				colorsTime={colorsTime}
				isSmoothColorTransition={true}
				onUpdate={(remainingTime: number) => {
					// remainingTime is clamped to >= 0 by the lib
					const remaining = Math.max(0, remainingTime);
					const elapsed = Math.max(0, totalSeconds - remaining);

					// 🔕 Throttle: only notify the parent every tickIntervalSec seconds
					const sec = Math.floor(remaining);
					if (tickIntervalSec > 1) {
						const last = lastEmittedSecondRef.current;
						if (
							last === null ||
							Math.abs(sec - last) >= tickIntervalSec
						) {
							lastEmittedSecondRef.current = sec;
							onTimeUpdateRef.current?.(
								remaining,
								elapsed,
								totalSeconds
							);
						}
					} else {
						onTimeUpdateRef.current?.(
							remaining,
							elapsed,
							totalSeconds
						);
					}

					// 💾 per-item হলে প্রতি সেকেন্ডে cache সেভ (reload হলে resume করার জন্য)
					if (!isGlobal && perItemKey) {
						writeTimerCache(perItemKey, remaining, totalSeconds);
					}
				}}
				onComplete={() => {
					if (!isGlobal) setPerItemDone(true);
					// ✅ টাইম শেষ => cache সাফ (পরে খুললে 0:00 থাকবে)
					if (!isGlobal && perItemKey) removeTimerCache(perItemKey);
					onExpireRef.current?.();
					return { shouldRepeat: false };
				}}
			>
				{renderTime as any}
			</CountdownCircleTimer>
		</div>
	);
}

/* ✅ Prevent re-renders from parent if only function props changed. */
const areEqual = (prev: QuizTimerProps, next: QuizTimerProps) => {
	const pd = prev.data as QuizTiming | undefined;
	const nd = next.data as QuizTiming | undefined;

	const dataEqual =
		!!pd === !!nd &&
		pd?.id === nd?.id &&
		pd?.quiztime_mode === nd?.quiztime_mode &&
		pd?.time_limit === nd?.time_limit &&
		pd?.duration === nd?.duration &&
		pd?.close_datetime === nd?.close_datetime;

	return (
		dataEqual &&
		prev.persistKey === next.persistKey &&
		prev.autoStart === next.autoStart &&
		prev.tickIntervalSec === next.tickIntervalSec
		// Ignore onExpire/onTimeUpdate identity
	);
};

export default React.memo(QuizTimer, areEqual);
