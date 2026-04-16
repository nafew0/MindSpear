/* eslint-disable @typescript-eslint/no-explicit-any */
export interface OptionItem {
	id: string;
	text: string;
	label?: string;
	placeholder?: string;
	color?: string;
	isSelected?: boolean;
}
export interface Option {
	id?: string;
	isSelected?: boolean;
}
export interface SurveyItem {
	key: string; // question_type
	id: string; // question id
	title: string; // UI title
	survey_id: string;
	page_id: number;

	question_text: string;
	question_type: string;
	serial_number: number;
	is_required: boolean;

	options: OptionItem[];

	maxOptions: number;
	minOptions: number;
	allowDuplicates: boolean;
	isMultipleSelection: boolean;

	timeLimit: string;

	layout_id?: string;
	image_url?: string;
	quiz_id?: string; // Added for compatibility
	contant_title?: string; // Added for content type
	minNumber?: number; // Added for scales
	maxNumber?: number; // Added for scales
	points?: string; // Added for points system
	source_image_id?: number; // Added for image handling
	source_content_url?: string; // Added for content handling
	task_data?: any; // Added for task data

	created_at: string;
	updated_at: string;
	position?: number;
}
export interface HoverState {
	id?: string;
	timeLimit?: string;
	layout_id?: string;
	options: Option[];
	isMultipleSelection: boolean;
	hoveredItem: SurveyItem | null;
	selectedItem: SurveyItem | null;
	multypleselectedItem: SurveyItem[];
}

export interface SurveyPage {
	id: number;
	title: string;
	page_number: number;
	description?: string;
	question_count?: number;
	has_conditional_logic?: boolean;
	conditional_parent_type?: string | null;
	conditional_question_id?: number | null;
	conditional_page_id?: number | null;
	conditional_value?: string | null;
	conditional_operator?: string | null;
}

export interface SurveyQuestion extends SurveyItem {
	metadata?: Record<string, any>;
}

export interface SurveyPageQuestions {
	[pageId: number]: SurveyQuestion[];
}

export interface SurveyQuestionsState {
	questionsByPage: SurveyPageQuestions;
	loading: boolean;
	error: string | null;
}

export interface ActiveSurveyPageState {
	activePageId: number | null;
	surveyId: string | null;
}
