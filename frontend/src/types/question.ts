export interface QuestionOption {
	id: string;
	text: string;
	isCorrect: boolean;
}

export interface Question {
	id: string;
	type: "radio" | "checkbox" | "dropdown" | "image" | "text";
	question: string;
	description?: string;
	category: string;
	mark: number;
	options?: QuestionOption[];
	createdAt: string;
	updatedAt: string;
}

export interface QuestionCategory {
	id: string;
	name: string;
	description?: string;
}
