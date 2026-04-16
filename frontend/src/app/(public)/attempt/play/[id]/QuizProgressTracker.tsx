import React from "react";
import { QuizQuestion } from "@/types/public";

interface QuizProgressTrackerProps {
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  answeredQuestions: number[];
}

const QuizProgressTracker: React.FC<QuizProgressTrackerProps> = ({
  questions,
  currentQuestionIndex,
  answeredQuestions,
}) => {
  return (
    <div className="w-full mb-4">
      <div className="grid grid-cols-3 md:grid-cols-6 gap-1">
        {Array.from({ length: questions.length }).map((_, index) => (
          <div
            key={index}
            className={`
              w-full h-4 border rounded flex items-center justify-center text-sm
              ${
                index < currentQuestionIndex ||
                answeredQuestions.includes(index)
                  ? "bg-primary text-white border-primary"
                  : index === currentQuestionIndex
                  ? "bg-primary border-primary text-white font-bold"
                  : "bg-gray-100 border-gray-300"
              }
            `}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default QuizProgressTracker;