import { QuizData, QuizQuestion } from "@/types/public";

export interface QuizOption {
  id: string;
  text: string;
  placeholder: string;
  color: string;
  isSelected: boolean;
  label: string;
}

export interface SingleSelectionResult extends QuizOption {
  indexNumber: string;
  questionId: string;
}

export type MultiSelectionResult = string[];
export type SelectionResult = SingleSelectionResult | MultiSelectionResult;

export interface QuizState {
  currentIndex: number;
  answeredQuestions: number[];
  questions: QuizQuestion[];
  questionTimes: Record<number, number>;
  totalTimeLeft: number;
  quizData: QuizData;
}

export interface QuizPlayPageProps {
  params: {
    id: string;
  };
  searchParams: {
    preview: string;
    qid: string;
    aid: string;
    jid: string;
  };
}