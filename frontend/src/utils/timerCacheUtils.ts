/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import moment from "@/lib/dayjs";

export type AttemptRecord = {
	timeLimit: number; // seconds
	startMMSS: string; // display seed
	accumulatedSec: number; // total counted while active
	startedAt?: number | null; // when counting resumed; null = paused
	completedAt?: number;
};

export class TimerCacheManager {
	private static keyFor(id: string | number) {
		return `attempt-${id}`;
	}
	private static ACTIVE_KEY = "attempt-active-id";

	/** Create if missing. Starts in PAUSED state to avoid background ticking. */
	static getOrInitAttempt(
		id: string | number,
		timeLimit: number
	): AttemptRecord | null {
		if (typeof window === "undefined" || id == null) return null;

		const key = this.keyFor(id);
		const raw = localStorage.getItem(key);
		if (raw) {
			try {
				const old = JSON.parse(raw) as any;

				// ── migrate from old shape { startedAt, timeLimit, startMMSS, completedAt } ──
				if (typeof old.accumulatedSec !== "number") {
					const elapsed = old.startedAt
						? Math.floor(
								(Date.now() - Number(old.startedAt)) / 1000
						  )
						: 0;
					const acc = Math.min(
						Math.max(0, elapsed),
						Number(old.timeLimit ?? timeLimit) || 0
					);
					const rec: AttemptRecord = {
						timeLimit:
							Number(old.timeLimit ?? timeLimit) || timeLimit,
						startMMSS: String(
							old.startMMSS ?? moment().format("mm:ss")
						),
						accumulatedSec: acc,
						startedAt: null, // start paused
						completedAt: old.completedAt,
					};
					localStorage.setItem(key, JSON.stringify(rec));
					return rec;
				}

				return old as AttemptRecord;
			} catch {
				// fallthrough to recreate
			}
		}

		const rec: AttemptRecord = {
			timeLimit,
			startMMSS: moment().format("mm:ss"),
			accumulatedSec: 0,
			startedAt: null, // paused by default
		};
		localStorage.setItem(key, JSON.stringify(rec));
		return rec;
	}

	static getAttempt(id: string | number): AttemptRecord | null {
		if (typeof window === "undefined" || id == null) return null;
		const raw = localStorage.getItem(this.keyFor(id));
		if (!raw) return null;
		try {
			return JSON.parse(raw) as AttemptRecord;
		} catch {
			return null;
		}
	}

	private static saveAttempt(id: string | number, rec: AttemptRecord) {
		if (typeof window === "undefined" || id == null) return;
		localStorage.setItem(this.keyFor(id), JSON.stringify(rec));
	}

	/** Make this attempt the only one ticking. */
	static activate(id: string | number) {
		if (typeof window === "undefined" || id == null) return;
		// pause all others first
		this.pauseAllExcept(id);

		const rec = this.getAttempt(id);
		if (!rec || rec.completedAt) return;

		if (rec.startedAt == null) {
			rec.startedAt = Date.now();
			localStorage.setItem(this.ACTIVE_KEY, String(id));
			this.saveAttempt(id, rec);
		}
	}

	/** Fold in elapsed time and pause. */
	static pause(id: string | number) {
		const rec = this.getAttempt(id);
		if (!rec || rec.startedAt == null) return;

		const now = Date.now();
		rec.accumulatedSec += Math.max(
			0,
			Math.floor((now - rec.startedAt) / 1000)
		);
		rec.startedAt = null;

		if (rec.accumulatedSec >= rec.timeLimit) {
			rec.accumulatedSec = rec.timeLimit;
			rec.completedAt = rec.completedAt ?? now;
		}
		this.saveAttempt(id, rec);

		// clear active marker if this was the active one
		const active = localStorage.getItem(this.ACTIVE_KEY);
		if (String(active) === String(id)) {
			localStorage.removeItem(this.ACTIVE_KEY);
		}
	}

	/** Pause every attempt except the given one (so only one can tick). */
	static pauseAllExcept(id: string | number) {
		if (typeof window === "undefined") return;
		Object.keys(localStorage).forEach((k) => {
			if (!k.startsWith("attempt-")) return;
			const otherId = k.replace("attempt-", "");
			if (String(otherId) === String(id)) return;

			try {
				const rec = JSON.parse(
					localStorage.getItem(k) || "null"
				) as AttemptRecord | null;
				if (rec && rec.startedAt != null) {
					const now = Date.now();
					rec.accumulatedSec += Math.max(
						0,
						Math.floor((now - rec.startedAt) / 1000)
					);
					rec.startedAt = null;
					if (rec.accumulatedSec >= rec.timeLimit) {
						rec.accumulatedSec = rec.timeLimit;
						rec.completedAt = rec.completedAt ?? now;
					}
					localStorage.setItem(k, JSON.stringify(rec));
				}
			} catch {}
		});
	}

	static markCompleted(id: string | number) {
		const rec = this.getAttempt(id);
		if (!rec) return;
		if (rec.startedAt != null) {
			const now = Date.now();
			rec.accumulatedSec += Math.max(
				0,
				Math.floor((now - rec.startedAt) / 1000)
			);
			rec.startedAt = null;
		}
		rec.accumulatedSec = rec.timeLimit;
		rec.completedAt = rec.completedAt ?? Date.now();
		this.saveAttempt(id, rec);
	}

	/** Compute remaining/duration at this instant (respects pause). */
	static computeNow(rec: AttemptRecord) {
		console.log(rec);

		const live =
			rec.startedAt != null
				? Math.max(0, Math.floor((Date.now() - rec.startedAt) / 1000))
				: 0;

		const elapsed = Math.min(rec.timeLimit, rec.accumulatedSec + live);
		const remaining = rec.completedAt
			? 0
			: Math.max(0, rec.timeLimit - elapsed);
		const duration = moment(rec.startMMSS, "mm:ss")
			.add(elapsed, "seconds")
			.format("mm:ss");
		return { remaining, duration };
	}

	// Utilities (unchanged semantics)
	static clearAllTimerStores() {
		if (typeof window === "undefined") return;
		Object.keys(localStorage).forEach((key) => {
			if (key.startsWith("attempt-")) localStorage.removeItem(key);
		});
		//console.log("All timer stores cleared");
	}
	static getAllTimerStores(): string[] {
		if (typeof window === "undefined") return [];
		return Object.keys(localStorage)
			.filter((k) => k.startsWith("attempt-"))
			.map((k) => k.replace("attempt-", ""));
	}
	static clearAttempt(id: string | number) {
		if (typeof window === "undefined" || id == null) return;
		localStorage.removeItem(this.keyFor(id));
		const active = localStorage.getItem(this.ACTIVE_KEY);
		if (String(active) === String(id))
			localStorage.removeItem(this.ACTIVE_KEY);
	}
}
