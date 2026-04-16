import React from "react";
import QuizComponent from "../QuizComponent";
import TrueFalseComponent from "../TrueFalseComponent";
import FillInTheBlanksComponent from "../FillInTheBlanksComponent";
import SortAnswerBlanksComponent from "../SortAnswerBlanksComponent";
import { QuizQuestion } from "@/types/public";

interface QuestionRendererProps {
  question: QuizQuestion;
  onOptionSelect: (questionId: string, optionId: string) => void;
  disabled: boolean;
  timeLeft: number;
  onAnswerChange?: (hasAnswer: boolean) => void;
  onTextChange?: (text: string) => void;
}

const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  onOptionSelect,
  disabled,
  timeLeft,
  onAnswerChange,
  onTextChange,
}) => {
  // Create a handler that matches the expected signature for child components
  const handleOptionSelect = (optionId: string) => {
    onOptionSelect(question.id, optionId);
  };

  switch (question.key) {
    case "quiz":
      return (
        <QuizComponent
          question={question}
          onOptionSelect={handleOptionSelect}
          disabled={disabled}
          timeLeft={timeLeft}
        />
      );
    case "truefalse":
      return (
        <TrueFalseComponent
          question={question}
          onOptionSelect={handleOptionSelect}
          disabled={disabled}
          timeLeft={timeLeft}
        />
      );
    case "fillintheblanks":
      return (
        <FillInTheBlanksComponent
          question={question}
          onOptionSelect={handleOptionSelect}
          disabled={disabled}
          timeLeft={timeLeft}
        />
      );
    case "sortanswer":
      return (
        <SortAnswerBlanksComponent
          question={question}
          onOptionSelect={handleOptionSelect}
          disabled={disabled}
          timeLeft={timeLeft}
          onAnswerChange={onAnswerChange}
          onTextChange={onTextChange}
        />
      );
    default:
      return <div>Unsupported question type</div>;
  }
};

export default QuestionRenderer;