/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { CountdownCircleTimer } from "react-countdown-circle-timer";

type QuizTiming = {
  id: number | string;
  quiztime_mode: boolean;          // false => time_limit (seconds)
  time_limit?: number;             // seconds
  duration?: number;               // minutes (unused in per-item)
  open_datetime?: string;
  close_datetime?: string;
};

type QuizTimerProps = {
  data?: any;
  onExpire?: () => void | Promise<void>;
  onTimeUpdate?: (remaining: number, elapsed: number, total: number) => void;
  persistKey?: any;
  autoStart?: boolean;
  tickIntervalSec?: number;
};

/** Format seconds -> mm:ss */
const mmss = (totalSec: number) => {
  const t = Math.max(0, Math.floor(totalSec) || 0);
  const m = Math.floor(t / 60);
  const s = t % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

function TimeShow({
  data,
  onExpire,
  // persistKey,
  autoStart = true,
  onTimeUpdate,
  tickIntervalSec = 5,
}: QuizTimerProps) {
  const hasData = !!data;
  const safeData: QuizTiming = hasData
    ? (data as QuizTiming)
    : { id: "__no-data__", quiztime_mode: false, time_limit: 30 };

  const { id, quiztime_mode, time_limit = 0 } = safeData;

  // local ready gate
  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    setIsReady(true);
  }, []);

  // keep latest callbacks
  const onExpireRef = useRef(onExpire);
  const onTimeUpdateRef = useRef(onTimeUpdate);
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);
  useEffect(() => {
    onTimeUpdateRef.current = onTimeUpdate;
  }, [onTimeUpdate]);

  // Per-item only (your use case)
  const totalSeconds = useMemo(
    () => Math.max(0, Math.floor(time_limit) || 0),
    [time_limit]
  );

  // Make sure initialRemaining equals totalSeconds on mount (resume is done in parent)
  const initialRemaining = totalSeconds;

  // Key forces remount when question changes or time changes
  const timerKey = `per-item-${id}-${totalSeconds}`;

  // color stages (fixed)
  const colors = ["#16a34a", "#f59e0b", "#ef4444", "#9ca3af"] as const;
  const colorsTime = [
    totalSeconds,
    Math.max(1, Math.ceil(totalSeconds * 0.5)),
    Math.max(10, Math.ceil(totalSeconds * 0.2)),
    0,
  ] as const;

  const renderTime = ({ remainingTime }: { remainingTime: number }) => (
    <div className="flex flex-col items-center justify-center">
      <div className="text-xs uppercase tracking-wide opacity-70">Remaining</div>
      <div className="text-2xl font-semibold">
        {mmss(Math.max(0, remainingTime || 0))}
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

  const shouldPlay = autoStart && !quiztime_mode && initialRemaining > 0;

  return (
    <div className="inline-flex flex-col items-center gap-2">
      <CountdownCircleTimer
        key={timerKey}
        isPlaying={shouldPlay}
        duration={totalSeconds}
        initialRemainingTime={initialRemaining}
        updateInterval={1}
        trailColor="#eee"
        colors={colors as unknown as any}
        colorsTime={colorsTime as unknown as any}
        isSmoothColorTransition={true}
        size={140}
        onUpdate={(remainingTime: number) => {
          const remaining = Math.max(0, Math.floor(remainingTime) || 0);
          const elapsed = Math.max(0, totalSeconds - remaining);
          if (tickIntervalSec <= 1) {
            onTimeUpdateRef.current?.(remaining, elapsed, totalSeconds);
          } else {
            if (remaining % tickIntervalSec === 0) {
              onTimeUpdateRef.current?.(remaining, elapsed, totalSeconds);
            }
          }
        }}
        onComplete={() => {
          onExpireRef.current?.();
          return { shouldRepeat: false };
        }}
      >
        {renderTime as any}
      </CountdownCircleTimer>
    </div>
  );
}

export default React.memo(TimeShow);
