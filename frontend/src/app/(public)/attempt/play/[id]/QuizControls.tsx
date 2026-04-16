import React from "react";

interface QuizControlsProps {
  currentQuestionIndex: number;
  totalQuestions: number;
  hasSelectedAnswer: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

const QuizControls: React.FC<QuizControlsProps> = ({
  currentQuestionIndex,
  totalQuestions,
  hasSelectedAnswer,
  onPrevious,
  onNext,
}) => {
  return (
    <div className="flex justify-between mt-4">
      <button
        onClick={onPrevious}
        disabled={currentQuestionIndex === 0}
        className={`bg-gray-500 text-white font-bold py-2 px-4 rounded ${
          currentQuestionIndex === 0
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-gray-700"
        }`}
      >
        Previous
      </button>

      <button
        onClick={onNext}
        disabled={!hasSelectedAnswer}
        className={`bg-purple-600 text-white font-bold py-2 px-4 rounded ${
          !hasSelectedAnswer
            ? "opacity-50 cursor-not-allowed"
            : "hover:bg-purple-700"
        }`}
      >
        {currentQuestionIndex < totalQuestions - 1 ? "Next" : "Finish Quiz"}
      </button>
    </div>
  );
};

export default QuizControls;