// utils/storageCleaner.js
export const clearAppStorage = () => {
  if (typeof window === "undefined") return;

  const keys = Object.keys(localStorage);
  
  keys.forEach((key) => {
    if (
      key.startsWith("timer_") ||
      key.startsWith("timeExpired_") ||
      key.startsWith("attempt-") ||
      key.startsWith("quest:joined:") ||
      key === "leaderboardState" ||
      key === "quiz_currentQuestion" ||
      key === "quiz_questions"
    ) {
      localStorage.removeItem(key);
    }
  });
};



