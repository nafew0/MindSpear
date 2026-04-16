import React, { useEffect, useState } from "react";

interface QuizTimerProps {
  isQuizTimeMode: boolean;
  timeLeft: number;
  quizCompleted: boolean;
  onTimeUp: () => void;
}

const QuizTimer: React.FC<QuizTimerProps> = ({
  isQuizTimeMode,
  timeLeft,
  quizCompleted,
  onTimeUp,
}) => {
  const [displayTime, setDisplayTime] = useState(timeLeft);

  useEffect(() => {
    if (!isQuizTimeMode || quizCompleted) return;

    const timer = setInterval(() => {
      setDisplayTime((prev) => {
        if (prev <= 1) {
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isQuizTimeMode, quizCompleted, onTimeUp]);

  // Format time as minutes:seconds
  const minutes = Math.floor(displayTime / 60);
  const seconds = displayTime % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div className="text-right mb-2">
      <span className="font-bold">Time Left: </span>
      <span className={`${displayTime <= 10 ? 'text-red-500' : 'text-gray-700'}`}>
        {formattedTime}
      </span>
    </div>
  );
};

export default QuizTimer;