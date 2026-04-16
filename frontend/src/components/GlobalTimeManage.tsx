"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type CountdownSource = {
  id: number | string;
  open_datetime: string;
  close_datetime: string;
  quiztime_mode: boolean;
  duration?: number | string;
  time_limit?: number | string;
  task_data?: { time_limit?: number | string };
};

export type GlobalCountdownProps = {
  source: CountdownSource;
  autoStart?: boolean;
  startDelayMs?: number;
  capToClose?: boolean;
  size?: number;
  stroke?: number;
  className?: string;
  onExpire?: () => void;
  onTimeUpdate?: (remainingSec: number) => void;
};

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const toMs = (sec: number) => sec * 1000;
const minToSec = (m: number) => m * 60;

function formatTime(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  const two = (n: number) => n.toString().padStart(2, "0");
  return hrs > 0 ? `${hrs}:${two(mins)}:${two(secs)}` : `${two(mins)}:${two(secs)}`;
}

function useEphemeralCountdown(
  totalSeconds: number,
  openAtMs: number,
  closeAtMs: number,
  opts: {
    autoStart: boolean;
    startDelayMs?: number;
    capToClose: boolean;
    onExpire?: () => void;
    onTimeUpdate?: (remainingSec: number) => void;
    resetSignal?: number;
    autoStartOnReset?: boolean;
  }
) {
  const { autoStart, startDelayMs, capToClose, onExpire, onTimeUpdate, resetSignal = 0, autoStartOnReset = autoStart } = opts;

  const [now, setNow] = useState<number>(Date.now());
  const [startAt, setStartAt] = useState<number | null>(null);
  const [endAt, setEndAt] = useState<number | null>(null);
  const [expired, setExpired] = useState<boolean>(false);
  const expiredCalledRef = useRef(false);
  const initedRef = useRef(false);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(id);
  }, []);

  const initialize = useCallback((shouldAutoStart: boolean) => {
    const now0 = Date.now();

    if (now0 >= closeAtMs) {
      setExpired(true);
      setStartAt(null);
      setEndAt(null);
      return;
    }

    if (now0 < openAtMs) {
      if (shouldAutoStart) {
        const sAt = openAtMs + (startDelayMs ?? 0);
        let eAt = sAt + toMs(totalSeconds);
        if (capToClose) eAt = Math.min(eAt, closeAtMs);
        setStartAt(sAt);
        setEndAt(eAt);
      } else {
        setStartAt(null);
        setEndAt(null);
      }
      setExpired(false);
      expiredCalledRef.current = false;
      return;
    }

    if (shouldAutoStart) {
      const sAt = now0 + (startDelayMs ?? 0);
      let eAt = sAt + toMs(totalSeconds);
      if (capToClose) eAt = Math.min(eAt, closeAtMs);
      setStartAt(sAt);
      setEndAt(eAt);
      setExpired(false);
      expiredCalledRef.current = false;
    } else {
      setStartAt(null);
      setEndAt(null);
      setExpired(false);
      expiredCalledRef.current = false;
    }
  }, [openAtMs, closeAtMs, startDelayMs, totalSeconds, capToClose]);

  useEffect(() => {
    if (initedRef.current) return;
    initedRef.current = true;
    initialize(autoStart);
  }, [autoStart, initialize]);

  useEffect(() => {
    if (!initedRef.current) return;
    setStartAt(null);
    setEndAt(null);
    setExpired(false);
    expiredCalledRef.current = false;
    initialize(autoStartOnReset);
  }, [resetSignal, autoStartOnReset, initialize]);

  const start = useCallback((delayMs = 0) => {
    const now0 = Date.now();
    if (now0 >= closeAtMs) return false;

    const sAt = now0 < openAtMs ? openAtMs + delayMs : now0 + delayMs;
    let eAt = sAt + toMs(totalSeconds);
    if (capToClose) eAt = Math.min(eAt, closeAtMs);

    setStartAt(sAt);
    setEndAt(eAt);
    setExpired(false);
    expiredCalledRef.current = false;
    return true;
  }, [openAtMs, closeAtMs, totalSeconds, capToClose]);

  const waitingMs = useMemo(() => {
    if (!startAt) return 0;
    const r = startAt - now;
    return r > 0 ? r : 0;
  }, [startAt, now]);

  const remainingMs = useMemo(() => {
    if (!startAt || !endAt) return 0;
    const r = endAt - now;
    return r > 0 ? r : 0;
  }, [startAt, endAt, now]);

  const totalMs = useMemo(() => {
    if (!startAt || !endAt) return toMs(totalSeconds);
    const span = endAt - startAt;
    return Number.isFinite(span) && span > 0 ? span : 1;
  }, [startAt, endAt, totalSeconds]);

  useEffect(() => {
    onTimeUpdate?.(Math.ceil(remainingMs / 1000));
  }, [remainingMs, onTimeUpdate]);

  const beforeOpen = now < openAtMs;
  const afterClose = now >= closeAtMs;
  const hasStarted = !!startAt && now >= startAt;
  const isWaitingToStart = waitingMs > 0;
  const isExpired = (hasStarted && remainingMs <= 0) || afterClose || expired;

  useEffect(() => {
    if (isExpired && !expiredCalledRef.current) {
      expiredCalledRef.current = true;
      setExpired(true);
      onExpire?.();
    }
  }, [isExpired, onExpire]);

  return {
    remainingSec: Math.ceil(remainingMs / 1000),
    totalSec: Math.ceil(totalMs / 1000),
    progress: (!hasStarted || isWaitingToStart) ? 1 : clamp(remainingMs / totalMs, 0, 1),
    beforeOpen,
    afterClose,
    isExpired,
    isWaitingToStart,
    waitingSec: Math.ceil(waitingMs / 1000),
    hasStarted,
    start,
  } as const;
}

export const GlobalCountdown: React.FC<GlobalCountdownProps> = ({
  source,
  autoStart = true,
  startDelayMs,
  capToClose = true,
  size = 140,
  stroke = 10,
  className,
  onExpire,
  onTimeUpdate,
}) => {
  console.log(source, "source");
  
  const openAtMs = useMemo(() => new Date(source.open_datetime).getTime(), [source.open_datetime]);
  const closeAtMs = useMemo(() => new Date(source.close_datetime).getTime(), [source.close_datetime]);

  // Calculate base seconds based on quiztime_mode
  const baseSeconds = useMemo(() => {
    if (source.quiztime_mode) {
      // Use duration (minutes) when quiztime_mode is true
      const durationMin = Number(source.duration ?? 0);
      return minToSec(durationMin);
    } else {
      // Use time_limit (seconds) when quiztime_mode is false
      const rawTL = source.task_data?.time_limit ?? source.time_limit;
      const parsedTL = Number(rawTL);
      return (!rawTL || !Number.isFinite(parsedTL) || parsedTL === 0) ? 30 : parsedTL;
    }
  }, [source.quiztime_mode, source.duration, source.time_limit, source.task_data?.time_limit]);

  // Reset behavior: restart on ID change except when quiztime_mode is true
  const [resetSignal, setResetSignal] = useState(0);
  const prevIdRef = useRef(source.id);
  
  useEffect(() => {
    if (prevIdRef.current !== source.id) {
      prevIdRef.current = source.id;
      // Only reset if quiztime_mode is false
      if (!source.quiztime_mode) {
        setResetSignal(s => s + 1);
      }
    }
  }, [source.id, source.quiztime_mode]);

  // Don't auto-start on reset when quiztime_mode is true
  const autoStartOnReset = !source.quiztime_mode;

  const {
    remainingSec, totalSec, progress, beforeOpen, afterClose, isExpired,
    isWaitingToStart, waitingSec, hasStarted,
  } = useEphemeralCountdown(
    baseSeconds,
    openAtMs,
    closeAtMs,
    { 
      autoStart, 
      startDelayMs, 
      capToClose, 
      onExpire, 
      onTimeUpdate,
      resetSignal, 
      autoStartOnReset 
    }
  );

  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const safeProgress = Number.isFinite(progress) ? progress : 1;
  const dashOffset = circumference * (1 - safeProgress);

  const label = beforeOpen
    ? `Opens in ${formatTime(Math.max(0, Math.ceil((openAtMs - Date.now()) / 1000)))}`
    : afterClose
      ? "Closed"
      : isExpired
        ? "Time Up"
        : isWaitingToStart
          ? `Starts in ${formatTime(waitingSec)}`
          : hasStarted
            ? formatTime(remainingSec)
            : formatTime(totalSec);

  return (
    <div className={"flex items-center justify-center " + (className ?? "")} aria-label="global-countdown">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="block">
          <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke} strokeOpacity={0.15} stroke="currentColor" fill="none" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={stroke}
            strokeLinecap="round"
            stroke="currentColor"
            fill="none"
            style={{
              transform: "rotate(-90deg)",
              transformOrigin: "50% 50%",
              strokeDasharray: `${circumference} ${circumference}`,
              strokeDashoffset: dashOffset,
              transition: "stroke-dashoffset 0.2s linear",
            }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-center">
            <div className="text-xl font-semibold leading-none select-none">{label}</div>
            {!beforeOpen && hasStarted && !isExpired && !isWaitingToStart && (
              <div className="text-xs opacity-70 mt-1 select-none">Total: {formatTime(totalSec)}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};