import { Question, QuestionCategory } from "@/types/question";

export const mockCategories: QuestionCategory[] = [
	{ id: "1", name: "Medicine", description: "Medical questions" },
	{ id: "2", name: "Capsule", description: "Capsule related questions" },
	{ id: "3", name: "Diabetes", description: "Diabetes related questions" },
	{ id: "4", name: "Tablet", description: "Tablet related questions" },
];

export const mockQuestions: Question[] = [
	{
		id: "1",
		type: "radio",
		question: "What is the primary source of coral calcium?",
		description:
			"This question tests knowledge about coral calcium sources.",
		category: "Medicine",
		mark: 1,
		options: [
			{ id: "1", text: "Limestone deposits", isCorrect: false },
			{ id: "2", text: "Oceanic coral reefs", isCorrect: true },
			{ id: "3", text: "Volcanic ash", isCorrect: false },
			{ id: "4", text: "Volcanic ash", isCorrect: false },
		],
		createdAt: "2023-07-12T00:00:00Z",
		updatedAt: "2023-07-12T00:00:00Z",
	},
	{
		id: "2",
		type: "checkbox",
		question: "Which of the following are symptoms of diabetes?",
		category: "Diabetes",
		mark: 2,
		options: [
			{ id: "1", text: "Increased thirst", isCorrect: true },
			{ id: "2", text: "Frequent urination", isCorrect: true },
			{ id: "3", text: "Blurred vision", isCorrect: true },
			{ id: "4", text: "Improved appetite", isCorrect: false },
		],
		createdAt: "2023-07-12T00:00:00Z",
		updatedAt: "2023-07-12T00:00:00Z",
	},
	{
		id: "3",
		type: "dropdown",
		question: "What is the recommended daily dosage for vitamin D?",
		category: "Capsule",
		mark: 1,
		options: [
			{ id: "1", text: "400 IU", isCorrect: false },
			{ id: "2", text: "600 IU", isCorrect: true },
			{ id: "3", text: "800 IU", isCorrect: false },
			{ id: "4", text: "1000 IU", isCorrect: false },
		],
		createdAt: "2023-07-12T00:00:00Z",
		updatedAt: "2023-07-12T00:00:00Z",
	},
	{
		id: "4",
		type: "text",
		question: "Target doctor of Ranoxen Plus is_",
		category: "Medicine",
		mark: 1,
		options: [{ id: "1", text: "Rheumatologists", isCorrect: true }],
		createdAt: "2023-07-12T00:00:00Z",
		updatedAt: "2023-07-12T00:00:00Z",
	},
	{
		id: "5",
		type: "radio",
		question: "What is the active ingredient in aspirin?",
		category: "Tablet",
		mark: 1,
		options: [
			{ id: "1", text: "Acetaminophen", isCorrect: false },
			{ id: "2", text: "Acetylsalicylic acid", isCorrect: true },
			{ id: "3", text: "Ibuprofen", isCorrect: false },
			{ id: "4", text: "Naproxen", isCorrect: false },
		],
		createdAt: "2023-07-12T00:00:00Z",
		updatedAt: "2023-07-12T00:00:00Z",
	},
	{
		id: "6",
		type: "checkbox",
		question: "Which vitamins are fat-soluble?",
		category: "Capsule",
		mark: 2,
		options: [
			{ id: "1", text: "Vitamin A", isCorrect: true },
			{ id: "2", text: "Vitamin C", isCorrect: false },
			{ id: "3", text: "Vitamin D", isCorrect: true },
			{ id: "4", text: "Vitamin E", isCorrect: true },
			{ id: "5", text: "Vitamin K", isCorrect: true },
		],
		createdAt: "2023-07-12T00:00:00Z",
		updatedAt: "2023-07-12T00:00:00Z",
	},
];
