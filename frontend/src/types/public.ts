export interface QuizOption {
  id: string;
  text: string;
  placeholder: string;
  color: string;     
  isSelected: boolean;
  label: string;
}

export interface QuizQuestion {
  key: string;
  id: string;
  title: string;
  options: QuizOption[];
  maxOptions?: number;
  minOptions?: number;
  position?: number;
  allowDuplicates?: boolean;
  isMultipleSelection?: boolean;
  timeLimit?: string;
  quiz_id?: string;
  source_content_url?: string;
}
export interface TwoQuizQuestion {
  key: string;
  id: string;
  title: string;
  options: QuizOption[];
  maxOptions?: number;
  minOptions?: number;
  position?: number;
  allowDuplicates?: boolean;
  isMultipleSelection?: boolean;
  timeLimit?: string;
  quiz_id?: string;
  source_content_url?: string;
    question_type?: string;
  text: string;
  color?: string;
  isSelected?: boolean;
}

export interface QuizData {
  label?: string;
  quiztime: string;
  quiztimeStatus: boolean;
  questions: QuizQuestion[];
}



export interface QuizData {
  label?: string;
  open_datetime?: string;
  close_datetime?: string;
  quiztime: string;
  quiztimeStatus: boolean;
  questions: QuizQuestion[];
}

export interface AnswerData {
  start_time: string;
  end_time: string;
  selected_option: number | number[] | string | null;
  text: string;
}

export interface SaveAnswerPayload {
  question_id: string;
  answer_data: AnswerData;
  time_taken_seconds: number;
}

