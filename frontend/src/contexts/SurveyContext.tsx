"use client";

import React, {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
} from "react";
import type {
	SurveyItem,
	SurveyPage,
	SurveyPageQuestions,
	SurveyQuestion,
} from "@/types/surveyTypes";
import type { Quiz } from "@/types/types";
import * as surveyItemReducers from "@/features/survey/store/surveyItems/items";
import * as surveyOptionReducers from "@/features/survey/store/surveyItems/options";
import {
	createSurveyPage,
	deleteSurveyPage,
	getPagesBySurveyId,
	getSurveyQuestionsByPage,
	updateSurveyPage,
	createSurveyQuestion,
	deleteSurveyQuestion,
	updateSurveyQuestion,
	getSurveyDetailsById,
} from "@/features/survey/services/surveyService";

interface SurveyState {
	surveyId: string | null;
	pages: SurveyPage[];
	activePageId: number | null;
	questionsByPage: SurveyPageQuestions;
	hoveredItem: SurveyQuestion | null;
	selectedItem: SurveyQuestion | null;
	multypleselectedItem: SurveyQuestion[];
	surveyInformation: Quiz | null;
}

interface SurveyActions {
	setSurveyId: (surveyId: string | null) => void;
	setPages: (pages: SurveyPage[]) => void;
	setActivePage: (pageId: number | null) => void;
	setQuestionsForPage: (pageId: number, questions: SurveyQuestion[]) => void;
	addQuestionToPage: (pageId: number, question: SurveyQuestion) => void;
	updateQuestionOnPage: (
		pageId: number,
		questionId: string,
		updatedQuestion: SurveyQuestion,
	) => void;
	removeQuestionFromPage: (pageId: number, questionId: string) => void;
	reorderQuestionsOnPage: (pageId: number, orderedIds: string[]) => void;
	clearQuestionsForPage: (pageId: number) => void;
	setSurveyInformation: (surveyInfo: Quiz | null) => void;
	setHoveredItem: (item: SurveyQuestion | null) => void;
	clearHoveredItem: () => void;
	setSelectedItem: (item: SurveyQuestion | null) => void;
	clearSelectedItem: () => void;
	setMultipleSelectedItems: (items: SurveyQuestion[]) => void;
	clearMultipleSelectedItems: () => void;
	addNewSurveyItem: (item: SurveyQuestion) => void;
	removeSelectedItem: (item: { id: string }) => void;
	duplicateItem: (payload: { id: string; qid: string }) => void;
	reorderOptions: (payload: {
		quizId: string;
		fromId: string;
		toId: string;
	}) => void;
	updateQuizTitle: (payload: { id: string; title: string }) => void;
	addSurveyOption: (payload: { id: string; option: any }) => void;
	addSurveyOptionsFromPaste: (payload: {
		quizId: string;
		text: string;
	}) => void;
	removeSurveyOption: (payload: { id: string; optionId: string }) => void;
	updateOptionText: (payload: {
		quizId: string;
		optionId: string;
		text: string;
	}) => void;
	updateOptionColor: (payload: {
		quizId: string;
		optionId: string;
		color: string;
	}) => void;
	toggleOptionSelection: (payload: {
		quizId: string;
		optionId: string;
		isMultipleSelection: boolean;
	}) => void;
	updateTrueFalseOption: (payload: {
		quizId: string;
		optionId: string;
		type: "color" | "isSelected";
		value: string | boolean;
	}) => void;
	toggleSwitchSelectionMode: (payload: {
		id: string;
		isMultipleSelection: boolean;
	}) => void;
	updateLimitedTimeTitle: (payload: {
		id: string;
		timeLimit: string;
	}) => void;
	contantData: (payload: {
		id: string;
		contant_title: string;
		image_url?: string;
		layout_id?: string;
	}) => void;
	scalesMaxMinData: (payload: {
		id: string;
		minNumber: number;
		maxNumber: number;
		minText?: string;
		maxText?: string;
	}) => void;
	updatePoints: (payload: { id: string; points: string }) => void;
	addSortAnswerOption: (payload: { id: string; option: any }) => void;
	updateSortAnswerOption: (payload: {
		quizId: string;
		optionId: string;
		text: string;
	}) => void;
	updateSortAnswerItem: (payload: {
		id: string;
		minOptions?: number;
		maxOptions?: number;
		allowDuplicates?: boolean;
	}) => void;
}

interface SurveyApi {
	fetchSurveyDetails: (
		surveyId: number | string,
	) => ReturnType<typeof getSurveyDetailsById>;
	fetchPagesBySurvey: (
		surveyId: number | string,
	) => ReturnType<typeof getPagesBySurveyId>;
	createPage: (pageData: any) => ReturnType<typeof createSurveyPage>;
	updatePage: (
		pageId: number | string,
		pageData: any,
	) => ReturnType<typeof updateSurveyPage>;
	deletePage: (
		pageId: number | string,
	) => ReturnType<typeof deleteSurveyPage>;
	fetchQuestionsByPage: (
		pageId: number | string,
	) => ReturnType<typeof getSurveyQuestionsByPage>;
	createQuestion: (
		questionData: any,
	) => ReturnType<typeof createSurveyQuestion>;
	updateQuestion: (
		questionId: number | string,
		questionData: any,
	) => ReturnType<typeof updateSurveyQuestion>;
	deleteQuestion: (
		questionId: number | string,
	) => ReturnType<typeof deleteSurveyQuestion>;
}

interface SurveyContextValue {
	state: SurveyState;
	actions: SurveyActions;
	api: SurveyApi;
}

const SurveyContext = createContext<SurveyContextValue | null>(null);

const cloneState = <T,>(value: T): T => {
	if (typeof structuredClone === "function") {
		return structuredClone(value);
	}
	return JSON.parse(JSON.stringify(value)) as T;
};

const generateUniqueId = (prefix: string = ""): string => {
	return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

export function SurveyProvider({ children }: { children: React.ReactNode }) {
	const [state, setState] = useState<SurveyState>({
		surveyId: null,
		pages: [],
		activePageId: null,
		questionsByPage: {},
		hoveredItem: null,
		selectedItem: null,
		multypleselectedItem: [],
		surveyInformation: null,
	});

	const applyReducer = useCallback(
		<P,>(
			reducer: (draft: any, action: { payload: P; type: string }) => void,
			payload: P,
		) => {
			setState((prev) => {
				const next = cloneState(prev);
				reducer(next as any, { payload, type: "context" } as any);
				return next;
			});
		},
		[],
	);

	const actions: SurveyActions = useMemo(
		() => ({
			setSurveyId: (surveyId) =>
				setState((prev) => ({ ...prev, surveyId })),
			setPages: (pages) => setState((prev) => ({ ...prev, pages })),
			setActivePage: (activePageId) =>
				setState((prev) => ({ ...prev, activePageId })),
			setQuestionsForPage: (pageId, questions) =>
				setState((prev) => ({
					...prev,
					questionsByPage: {
						...prev.questionsByPage,
						[pageId]: questions,
					},
				})),
			addQuestionToPage: (pageId, question) =>
				setState((prev) => {
					const existing = prev.questionsByPage[pageId] || [];
					return {
						...prev,
						questionsByPage: {
							...prev.questionsByPage,
							[pageId]: [...existing, question],
						},
					};
				}),
			updateQuestionOnPage: (pageId, questionId, updatedQuestion) =>
				setState((prev) => {
					const pageQuestions = prev.questionsByPage[pageId] || [];
					return {
						...prev,
						questionsByPage: {
							...prev.questionsByPage,
							[pageId]: pageQuestions.map((q) =>
								q.id === questionId ? updatedQuestion : q,
							),
						},
					};
				}),
			removeQuestionFromPage: (pageId, questionId) =>
				setState((prev) => {
					const pageQuestions = prev.questionsByPage[pageId] || [];
					return {
						...prev,
						questionsByPage: {
							...prev.questionsByPage,
							[pageId]: pageQuestions.filter(
								(q) => q.id !== questionId,
							),
						},
					};
				}),
			reorderQuestionsOnPage: (pageId, orderedIds) =>
				setState((prev) => {
					const pageQuestions = prev.questionsByPage[pageId] || [];
					const reordered = orderedIds
						.map((id, index) => {
							const found = pageQuestions.find((q) => q.id === id);
							if (!found) return null;
							return {
								...found,
								position: index + 1,
								serial_number:
									found.serial_number ?? index + 1,
							};
						})
						.filter(Boolean) as SurveyQuestion[];
					return {
						...prev,
						questionsByPage: {
							...prev.questionsByPage,
							[pageId]: reordered,
						},
					};
				}),
			clearQuestionsForPage: (pageId) =>
				setState((prev) => {
					const next = { ...prev.questionsByPage };
					delete next[pageId];
					return { ...prev, questionsByPage: next };
				}),
			setSurveyInformation: (surveyInformation) =>
				setState((prev) => ({ ...prev, surveyInformation })),
			setHoveredItem: (hoveredItem) =>
				setState((prev) => ({ ...prev, hoveredItem })),
			clearHoveredItem: () =>
				setState((prev) => ({ ...prev, hoveredItem: null })),
			setSelectedItem: (selectedItem) =>
				setState((prev) => {
					if (!selectedItem) {
						return { ...prev, selectedItem: null };
					}
					const exists = prev.multypleselectedItem.some(
						(item) => item.id === selectedItem.id,
					);
					return {
						...prev,
						selectedItem,
						multypleselectedItem: exists
							? prev.multypleselectedItem
							: [...prev.multypleselectedItem, selectedItem],
					};
				}),
			clearSelectedItem: () =>
				setState((prev) => ({ ...prev, selectedItem: null })),
			setMultipleSelectedItems: (items) =>
				setState((prev) => ({ ...prev, multypleselectedItem: items })),
			clearMultipleSelectedItems: () =>
				setState((prev) => ({ ...prev, multypleselectedItem: [] })),
			addNewSurveyItem: (item) =>
				applyReducer(surveyItemReducers.addNewSurveyItem, item),
			removeSelectedItem: ({ id }) =>
				setState((prev) => {
					const filtered = prev.multypleselectedItem.filter(
						(item) => item.id !== id,
					);
					const reOrdered = filtered
						.sort((a, b) => (a.position || 0) - (b.position || 0))
						.map((item, index) => ({
							...item,
							position: index + 1,
						}));
					return {
						...prev,
						multypleselectedItem: reOrdered,
					};
				}),
			duplicateItem: ({ id, qid }) =>
				setState((prev) => {
					const itemToDuplicate = prev.multypleselectedItem.find(
						(item) => item.id === id,
					);
					if (!itemToDuplicate) return prev;
					const maxPosition = prev.multypleselectedItem.reduce(
						(max, item) => Math.max(max, item.position || 0),
						0,
					);
					const nextPosition = maxPosition + 1;
					const duplicatedItem = {
						...itemToDuplicate,
						id: qid,
						position: nextPosition,
						options: (itemToDuplicate.options || []).map(
							(option) => ({
								...option,
								id: generateUniqueId("option"),
							}),
						),
					};
					return {
						...prev,
						multypleselectedItem: [
							...prev.multypleselectedItem,
							duplicatedItem,
						],
						selectedItem: duplicatedItem,
					};
				}),
			updateQuizTitle: (payload) =>
				setState((prev) => {
					const next = cloneState(prev);
					surveyItemReducers.updateQuizTitle(next as any, payload);

					const { id, title } = payload;
					Object.keys(next.questionsByPage).forEach((pageId) => {
						const pageQuestions =
							next.questionsByPage[Number(pageId)];
						if (!pageQuestions) return;
						const question = pageQuestions.find((q) => q.id === id);
						if (question) {
							question.title = title;
							question.question_text = title;
						}
					});

					return next;
				}),
			reorderOptions: (payload) =>
				setState((prev) => {
					const next = cloneState(prev);
					const { quizId, fromId, toId } = payload;
					const quiz = next.multypleselectedItem.find(
						(item) => item.id === quizId,
					);
					if (quiz && quiz.options) {
						const fromIndex = quiz.options.findIndex(
							(opt) => opt.id === fromId,
						);
						const toIndex = quiz.options.findIndex(
							(opt) => opt.id === toId,
						);
						if (fromIndex !== -1 && toIndex !== -1) {
							const [movedOption] = quiz.options.splice(
								fromIndex,
								1,
							);
							quiz.options.splice(toIndex, 0, movedOption);
						}
					}
					return next;
				}),
			addSurveyOption: (payload) =>
				applyReducer(surveyOptionReducers.addSurveyOption, payload),
			addSurveyOptionsFromPaste: (payload) =>
				setState((prev) => {
					const next = cloneState(prev);
					const { quizId, text } = payload;
					const item = next.multypleselectedItem.find(
						(q) => q.id === quizId,
					);
					if (!item || !item.options) return next;
					const newOptions = text
						.split(/\r?\n/)
						.map((line) => line.trim())
						.filter(Boolean)
						.map((line) => ({
							text: line,
							color: "#3b82f6",
							isSelected: false,
						}));
					newOptions.forEach((option) => {
						item.options.push({
							...option,
							id: generateUniqueId("option"),
						});
					});
					return next;
				}),
			removeSurveyOption: (payload) =>
				applyReducer(surveyOptionReducers.removeSurveyOption, payload),
			updateOptionText: (payload) =>
				applyReducer(surveyOptionReducers.updateOptionText, payload),
			updateOptionColor: (payload) =>
				applyReducer(surveyOptionReducers.updateOptionColor, payload),
			toggleOptionSelection: (payload) =>
				applyReducer(
					surveyOptionReducers.toggleOptionSelection,
					payload,
				),
			updateTrueFalseOption: (payload) =>
				applyReducer(
					surveyOptionReducers.updateTrueFalseOption,
					payload,
				),
			toggleSwitchSelectionMode: (payload) =>
				applyReducer(
					surveyOptionReducers.toggleSwitchSelectionMode,
					payload,
				),
			updateLimitedTimeTitle: (payload) =>
				applyReducer(
					surveyItemReducers.updateLimitedTimeTitle,
					payload,
				),
			contantData: (payload) =>
				applyReducer(surveyItemReducers.contantData, payload),
			scalesMaxMinData: (payload) =>
				applyReducer(surveyItemReducers.scalesMaxMinData, payload),
			updatePoints: (payload) =>
				applyReducer(surveyItemReducers.updatePoints, payload),
			addSortAnswerOption: (payload) =>
				applyReducer(
					surveyOptionReducers.sortAnswerReducers.addSortAnswerOption,
					payload,
				),
			updateSortAnswerOption: (payload) =>
				applyReducer(
					surveyOptionReducers.sortAnswerReducers
						.updateSortAnswerOption,
					payload,
				),
			updateSortAnswerItem: (payload) =>
				applyReducer(
					surveyOptionReducers.sortAnswerReducers
						.updateSortAnswerItem,
					payload,
				),
		}),
		[applyReducer],
	);

	const api: SurveyApi = useMemo(
		() => ({
			fetchSurveyDetails: (surveyId) => getSurveyDetailsById(surveyId),
			fetchPagesBySurvey: (surveyId) => getPagesBySurveyId(surveyId),
			createPage: (pageData) => createSurveyPage(pageData),
			updatePage: (pageId, pageData) =>
				updateSurveyPage(pageId, pageData),
			deletePage: (pageId) => deleteSurveyPage(pageId),
			fetchQuestionsByPage: (pageId) => getSurveyQuestionsByPage(pageId),
			createQuestion: (questionData) =>
				createSurveyQuestion(questionData),
			updateQuestion: (questionId, questionData) =>
				updateSurveyQuestion(questionId, questionData),
			deleteQuestion: (questionId) => deleteSurveyQuestion(questionId),
		}),
		[],
	);

	const value = useMemo(
		() => ({ state, actions, api }),
		[state, actions, api],
	);

	return (
		<SurveyContext.Provider value={value}>
			{children}
		</SurveyContext.Provider>
	);
}

export const useSurvey = () => {
	const context = useContext(SurveyContext);
	if (!context) {
		throw new Error("useSurvey must be used within SurveyProvider");
	}
	return context;
};

export const useSurveyOptional = () => useContext(SurveyContext);
