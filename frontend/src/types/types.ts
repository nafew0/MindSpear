/* eslint-disable @typescript-eslint/no-explicit-any */
export interface OptionItem {
	id: string;
	text: string;
	label?: string;
	placeholder?: string;
	color?: string;
	isSelected?: boolean;
}

export interface QuizItem {
	source_image_id?: number;
	source_content_url?: string;
	key: string;
	id: string;
	title: string;
	quiz_id?: string;
	points?: string;
	options: OptionItem[];
	maxOptions: number;
	position?: number;
	minOptions: number;
	allowDuplicates: boolean;
	isMultipleSelection: boolean;
	timeLimit: string;
	quizTypeName?: string;
	quizTypeModalStatus?: string;
	minNumber?: number,
      maxNumber?: number,
	  contant_title?: string
	  image_url?: string
	  layout_id?: string
}
export interface Option {
	id?: string;
	isSelected?: boolean;
}
export interface HoverState {
	id?: string;
	timeLimit?: string;
	layout_id?: string;
	options: Option[];
	isMultipleSelection: boolean;
	hoveredItem: QuizItem | null;
	selectedItem: QuizItem | null;
	multypleselectedItem: QuizItem[];
}

export type QuizOption = {
	id: string;
	text: string;
	placeholder?: string;
	color: string;
	isSelected: boolean;
};

export interface SortAnswerItem {
	id: string;
	text: string;
	placeholder: string;
	color: string;
	isSelected: boolean;
}

export type QuizState = {
	multypleselectedItem: QuizItem[];
	selectedItem: QuizItem | null;
	sortOptions?: SortAnswerItem[];
};

export type UpdateOptionTextPayload = {
	quizId: string;
	optionId: string;
	text: string;
};

export type UpdateOptionColorPayload = {
	quizId: string;
	optionId: string;
	color: string;
};

export type ToggleOptionSelectionPayload = {
	quizId: string;
	optionId: string;
	isMultipleSelection: boolean;
};

export type UpdateQuizTitlePayload = {
	id: string;
	title: string;
};

export type UpdateTrueFalseOptionPayload = {
	quizId: string;
	optionId: "1" | "2";
	type: "color" | "isSelected";
	value: string | boolean;
};

export interface User {
	id: number;
	first_name: string;
	last_name: string;
	email: string;
	phone: string | null;
	email_verified_at: string;
	email_verification_token: string | null;
	is_verified: boolean;
	profile_picture: string;
	account_type: string | null;
	institution_id: number | null;
	institution_name: string | null;
	designation: string | null;
	department: string | null;
	created_at: string;
	updated_at: string;
	full_name: string;
	institution: string | null;
}

export interface Survey {
  [x: string]: any;
  tasks_count: number;
  questions?: string;
  questions_count?: number;
  total_points?: number;
  is_live: boolean;
  join_link: string;
  join_code: string;
  visibility: string;
  id: number;
  title: string;
  description: string | null;
  user_id: number;
  category_id: number | null;
  is_published: boolean;
  open_datetime?: string | null;
  close_datetime?: string | null;
  duration: number | null;
  logged_in_users_only: boolean;
  safe_browser_mode: boolean;
  survey_mode: string;
  timezone: string;
  deleted_at: string | null;
  deleted_by: string | null;
  created_at: string;
  updated_at: string;
  open_datetime_local?: string,
  user: User;
}

export interface Quiz {
  [x: string]: any;
	tasks_count: number;
	questions?: string;
	questions_count?: number;
	total_points?: number;
	is_live: boolean;
	join_link: string;
	join_code: string;
	visibility: string;
	id: number;
	title: string;
	description: string | null;
	user_id: number;
	category_id: number | null;
	is_published: boolean;
	open_datetime?: string | null;
	close_datetime?: string | null;
	duration: number | null;
	logged_in_users_only: boolean;
	safe_browser_mode: boolean;
	quiz_mode: string;
	timezone: string;
	deleted_at: string | null;
	deleted_by: string | null;
	created_at: string;
	updated_at: string;
	open_datetime_local?: string,
	user: User;
}

export type TransformedQuestion = {
	question_id?: string | undefined;
	id?: number;
	quiz_id: number;
	question_text: string;
	question_type:
		| "quiz_single_choice"
		| "quiz_multiple_choice"
		| "true_false_choice"
		| "sort_answer_choice"
		| "fill_in_the_blanks_choice"
		| "fill_in_the_blanks_multiple_choice";
	options: {
		choices: string[];
		correct_answer: number | number[];
	};
};

export type FinalData = {
	questions: TransformedQuestion[];
};

export type OptionTwo = {
	id: string;
	text: string;
	placeholder: string;
	color: string;
	isSelected: boolean;
};

export type TransformedQuestionData = {
	points: string;
	key: string;
	id: string;
	title: string;
	options: OptionTwo[];
	maxOptions: number;
	minOptions: number;
	position: number;
	allowDuplicates: boolean;
	isMultipleSelection: boolean;
	timeLimit: string;
	quiz_id: string;
};

export type QuizUser = {
	id: number;
	first_name: string;
	last_name: string;
	email: string;
	phone: string | null;
	email_verified_at: string | null;
	email_verification_token: string | null;
	is_verified: boolean;
	profile_picture: string;
	account_type: string | null;
	institution_id: number | null;
	institution_name: string | null;
	designation: string | null;
	department: string | null;
	created_at: string;
	updated_at: string;
	full_name: string;
	institution: null;
};

export type QuizData = {
	id: number;
	title: string;
	description: string | null;
	user_id: number;
	category_id: number | null;
	is_published: boolean;
	open_datetime: string | null;
	close_datetime: string | null;
	duration: number | null;
	logged_in_users_only: boolean;
	safe_browser_mode: boolean;
	quiz_mode: string;
	timezone: string;
	deleted_at: string | null;
	deleted_by: number | null;
	created_at: string;
	updated_at: string;
	user: QuizUser;
};

export type ApiQuestion = {
	close_datetime: string;
	open_datetime: string;
	id: number;
	quiz_id: number;
	serial_number: number | null;
	question_text: string;
	question_type: string;
	time_limit_seconds: number | null;
	points: number | null;
	is_ai_generated: boolean;
	source_content_url?: string | null;
	options: {
		color: string[];
		choices: (string | null)[];
		correct_answer: number | number[];
	};
	deleted_at: string | null;
	deleted_by: number | null;
	created_at: string;
	updated_at: string;
	quiz: Quiz;
};
