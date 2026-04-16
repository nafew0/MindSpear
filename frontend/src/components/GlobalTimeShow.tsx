/* eslint-disable react/no-children-prop */
import React, { useState, useEffect, useMemo, useRef } from "react";
import { CountdownCircleTimer } from "react-countdown-circle-timer";

interface TimerData {
  questId: string | number;
  questionId: string | number;
  questiQsenStartTime: string; // e.g. "2025-10-22T10:17:00+06:00" (preferred) or "October 22nd 2025, 10:17"
  questiQsenTime: string; // total seconds as string, e.g. "120" or "60"
  questiQsenLateStartTime: string | boolean; // date string or false
}

interface QuizTimerProps {
  data: TimerData;
  onTimeUpdate: (remainingTime: number) => void;
  onExpire: () => void;
  /** Make sure this is unique **per attempt + per question** to avoid mixing times. */
  persistKey: string;
}

const STORAGE_PREFIX = "quiz_timer_";

/** Robust number read from localStorage */
const getPersistedTime = (key: string): number | null => {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_PREFIX + key);
  if (!raw) return null;
  const n = Number(raw);
  if (Number.isFinite(n) && n > 0) return n;
  // Clean up bad values
  window.localStorage.removeItem(STORAGE_PREFIX + key);
  return null;
};

const setPersistedTime = (key: string, timeRemaining: number): void => {
  if (typeof window === "undefined") return;
  if (Number.isFinite(timeRemaining) && timeRemaining >= 0) {
    window.localStorage.setItem(STORAGE_PREFIX + key, String(Math.ceil(timeRemaining)));
  } else {
    window.localStorage.removeItem(STORAGE_PREFIX + key);
  }
};

const clearPersistedTime = (key: string): void => {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(STORAGE_PREFIX + key);
  }
};

/** Strip 1st/2nd/3rd/4th suffixes and try parsing, fallback to Dhaka TZ if needed */
const safeParseDateMs = (input: string): number => {
  if (!input) return NaN;
  const cleaned = input.replace(/\b(\d{1,2})(st|nd|rd|th)\b/gi, "$1").trim();

  let ms = Date.parse(cleaned); // try native
  if (!Number.isNaN(ms)) return ms;

  // If no timezone was included, try assuming Asia/Dhaka (+06:00)
  ms = Date.parse(`${cleaned} GMT+0600`);
  return Number.isNaN(ms) ? NaN : ms;
};

/** 👉 forceFreshStart=true হলে duration থেকেই শুরু হবে (persistence/elapsed উপেক্ষা) */
const calculateTimerParams = (
  data: TimerData,
  persistKey: string,
  forceFreshStart: boolean = false
) => {
  // Parse and validate duration
  const initialDurationRaw = Number(data.questiQsenTime);
  const initialDuration = Number.isFinite(initialDurationRaw) ? Math.max(0, Math.floor(initialDurationRaw)) : NaN;

  // Parse and validate start time
  const startTimeMs = safeParseDateMs(String(data.questiQsenStartTime));

  if (!Number.isFinite(initialDuration) || initialDuration <= 0 || Number.isNaN(startTimeMs)) {
    console.error(
      "Timer data is invalid or incomplete. Check 'questiQsenTime' (duration) or 'questiQsenStartTime' (date string).",
      {
        sourceData: data,
        parsedDuration: initialDuration,
        parsedStartTimeMs: startTimeMs,
      }
    );
    return { duration: 0, initialRemainingTime: 0 };
  }

  let effectiveDuration = initialDuration;
  let effectiveStartTimeMs = startTimeMs;

  // Handle Late Start Time (Implements the 10:28:42 - 10:27:58 = 44 logic)
  if (data.questiQsenLateStartTime && typeof data.questiQsenLateStartTime === "string") {
    const lateStartTimeMs = safeParseDateMs(data.questiQsenLateStartTime);
    if (!Number.isNaN(lateStartTimeMs) && lateStartTimeMs > startTimeMs) {
      // Calculate the time gap in seconds (44 seconds in your example)
      const gapSeconds = Math.round((lateStartTimeMs - startTimeMs) / 1000);
      
      // Reduce the total available duration (300 - 44 = 256 in your example)
      effectiveDuration = Math.max(0, effectiveDuration - gapSeconds);
      
      // Set the effective start time to the late start time
      effectiveStartTimeMs = lateStartTimeMs;
    }
    console.log(lateStartTimeMs, "lateStartTimeMslateStartTimeMs");
  }

  // 🟢 New requirement: question changed, always start from the full calculated duration
  if (forceFreshStart) {
    return {
      duration: effectiveDuration,
      initialRemainingTime: effectiveDuration,
    };
  }

  // (Optional) Persistence for reload
  const persistedTime = getPersistedTime(persistKey);
  if (persistedTime !== null) {
    const clamped = Math.min(effectiveDuration, Math.max(0, Math.floor(persistedTime)));
    return { duration: effectiveDuration, initialRemainingTime: clamped };
  }

  // Compute remaining from start time (used only when not forcing fresh start & no persistence)
  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - effectiveStartTimeMs) / 1000));
  const calculatedRemaining = Math.max(0, effectiveDuration - elapsedSeconds);

  return {
    duration: effectiveDuration,
    initialRemainingTime: calculatedRemaining,
  };
};

const GlobalTimeShow: React.FC<QuizTimerProps> = ({ data, onTimeUpdate, onExpire, persistKey }) => {
  console.log(data, "datadatadatadatadata");
  
  // Using questId+questionId in the key fully resets when question changes
  const timerKey = `${data.questId}-${data.questionId}`;

  // ⬇️ This flag ensures the timer starts from 'full duration' on a question change
  const [freshStart, setFreshStart] = useState(false);
  // ⬇️ A counter to force the circle component to re-mount (visual reset)
  const [resetCounter, setResetCounter] = useState(0);

  const { duration: totalDuration, initialRemainingTime: initialTime } = useMemo(
    () => calculateTimerParams(data, persistKey, freshStart),
    [data, persistKey, timerKey, freshStart]
  );

  const [remainingTime, setRemainingTime] = useState<number>(initialTime);
  const isExpired = remainingTime <= 0;

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTickTimeRef = useRef<number>(Date.now());

  // 🔁 Logic to handle Question ID change (Resets timer to full duration)
  useEffect(() => {
    // 1. Clear previous question's time from storage
    clearPersistedTime(persistKey); 
    // 2. Set flag to force fresh start in the next calculation
    setFreshStart(true);             
    // 3. Increment counter to force a visual reset/re-mount of the CircleTimer
    setResetCounter((c) => c + 1);   
    
    // 4. Clean up any running interval
    if (timerRef.current) {
      clearInterval(timerRef.current); 
      timerRef.current = null;
    }
    
    // 5. Update state immediately (pre-emptively) to the new full duration
    const d = Number.isFinite(totalDuration) ? totalDuration : 0;
    setRemainingTime(d);
    onTimeUpdate(Math.max(0, Math.floor(d)));
  }, [data.questionId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Clear freshStart flag after it has been applied once
  useEffect(() => {
    if (freshStart) setFreshStart(false);
  }, [freshStart]);

  // initialTime sync (load/recalc)
  useEffect(() => {
    setRemainingTime(initialTime);
    onTimeUpdate(Math.max(0, Math.floor(initialTime)));
    if (initialTime <= 0) clearPersistedTime(persistKey);
  }, [initialTime, onTimeUpdate, persistKey, timerKey]);

  // Ticker (handles time counting down and persistence)
  useEffect(() => {
    if (totalDuration <= 0) return;
    if (timerRef.current) clearInterval(timerRef.current);

    if (remainingTime > 0) {
      lastTickTimeRef.current = Date.now();

      const tick = () => {
        const now = Date.now();
        const deltaSeconds = (now - lastTickTimeRef.current) / 1000;
        lastTickTimeRef.current = now;

        setRemainingTime((prev) => {
          const base = Number.isFinite(prev) ? prev : 0;
          const newTime = base - deltaSeconds;
          const rounded = Math.max(0, newTime);

          // Update persistence every tick (or every few seconds, depending on preference)
          setPersistedTime(persistKey, rounded);

          onTimeUpdate(Math.max(0, Math.ceil(rounded)));

          if (rounded <= 0) {
            if (timerRef.current) clearInterval(timerRef.current);
            clearPersistedTime(persistKey);
            onExpire();
          }
          return rounded;
        });
      };

      timerRef.current = setInterval(tick, 250); // Tick every 250ms for smooth display
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [remainingTime, totalDuration, persistKey, onTimeUpdate, onExpire]);

  // Display logic for the center of the circle
  const renderTime = ({ remainingTime }: { remainingTime: number }) => {
    if (remainingTime <= 0) {
      return <div className="text-xl font-bold text-red-600">Done!</div>;
    }
    const totalSeconds = Math.max(0, Math.ceil(remainingTime));
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");

    return (
      <div className="flex flex-col items-center justify-center text-gray-800 dark:text-gray-100">
        <div className="text-3xl font-mono font-extrabold text-blue-600 dark:text-blue-400">
          {minutes}:{seconds}
        </div>
        <div className="text-xs mt-1 text-gray-500 dark:text-gray-400">Seconds Left</div>
      </div>
    );
  };

  if (totalDuration <= 0) {
    return (
      <div className="text-gray-500 font-medium p-4 rounded-xl bg-gray-100 dark:bg-gray-800 text-center shadow-md">
        Duration not set or expired.
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="text-red-600 font-bold p-6 rounded-xl bg-red-50 dark:bg-red-900 border border-red-300 shadow-xl text-center">
        TIME EXPIRED
      </div>
    );
  }

  // Guarantee a valid finite initialRemainingTime for the circle
  const initialRemainingForCircle = Math.min(
    totalDuration,
    Math.max(0, Math.ceil(Number.isFinite(remainingTime) ? remainingTime : 0))
  );

  return (
    <div
      key={timerKey}
      className="max-w-xs w-full mx-auto p-6 rounded-2xl shadow-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700"
    >
      <div className="text-center mb-6">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Quiz Progress Timer</h2>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {String(data.questId)} - Q{String(data.questionId)}
        </p>
      </div>

      <div className="mb-6 flex justify-center">
        <CountdownCircleTimer
          // Unique key to force re-render when duration or remaining time changes significantly
          key={`${timerKey}-${totalDuration}-${resetCounter}-${initialRemainingForCircle}`} 
          duration={totalDuration}
          initialRemainingTime={initialRemainingForCircle}
          isPlaying={!isExpired}
          size={180}
          strokeWidth={12}
          trailColor="#E5E7EB"
          colors={["#10B981", "#F59E0B", "#EF4444"]}
          colorsTime={[Math.floor(totalDuration * 0.5), Math.floor(totalDuration * 0.2), 0]}
          children={renderTime}
        />
      </div>

      <p className="text-xs text-center mt-4 text-gray-500 dark:text-gray-400">
        Total Duration: {totalDuration} seconds
      </p>
    </div>
  );
};

export default GlobalTimeShow;