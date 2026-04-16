import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { initialState } from "./initialState";
import * as surveyItemReducers from "./surveyItems/items";
import * as surveyOptionReducers from "./surveyItems/options";
import { SurveyItem } from "@/types/surveyTypes";

interface TrueFalseOption {
	text: string;
	id: "1" | "2";
	label: string;
	color: string;
	isSelected: boolean;
}
export interface Option {
	id?: string;
	isSelected?: boolean;
}

interface DeplucateItem {
	id: string;
	qid: string;
}
const generateUniqueId = (prefix: string = ""): string => {
	return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

const surveySlice = createSlice({
	name: "survey",
	initialState,
	reducers: {
		setHoveredItem: (state, action: PayloadAction<SurveyItem | null>) => {
			state.hoveredItem = action.payload;
		},
		removeSelectedItem: (state, action) => {
			const { id } = action.payload;
			state.multypleselectedItem = state.multypleselectedItem.filter(
				(item) => item.id !== id
			);

			state.multypleselectedItem = state.multypleselectedItem
				.sort((a, b) => (a.position || 0) - (b.position || 0))
				.map((item, index) => ({
					...item,
					position: index + 1,
				}));
		},
		duplicateItem: (state, action: PayloadAction<DeplucateItem>) => {
			const itemToDuplicate = state.multypleselectedItem.find(
				(item) => item.id === action.payload.id
			);

			console.log({ ...itemToDuplicate }, "currentActive");
			if (!itemToDuplicate) return;
			console.log(action.payload, "currentActive");
			const maxPosition = state.multypleselectedItem.reduce(
				(max, item) => Math.max(max, item.position || 0),
				0
			);
			const nextPosition = maxPosition + 1;

			const duplicatedItem = {
				...itemToDuplicate,
				id: action.payload.qid,
				position: nextPosition,
				options: itemToDuplicate.options.map((option) => ({
					...option,
					id: generateUniqueId("option"),
				})),
			};

			state.multypleselectedItem.push(duplicatedItem);
			state.selectedItem = duplicatedItem;
		},
		clearHoveredItem: (state) => {
			state.hoveredItem = null;
		},
		setSelectedItem: (state, action: PayloadAction<SurveyItem | null>) => {
			state.selectedItem = action.payload;
			if (
				action.payload &&
				!state.multypleselectedItem.some(
					(item) => item.id === action.payload?.id
				)
			) {
				state.multypleselectedItem.push(action.payload);
			}
		},
		clearSelectedItem: (state) => {
			state.selectedItem = null;
		},
		reorderOptions: (state, action) => {
			const { quizId, fromId, toId } = action.payload;
			const quiz = state.multypleselectedItem.find(
				(item) => item.id === quizId
			);

			if (quiz && quiz.options) {
				const fromIndex = quiz.options.findIndex(
					(opt) => opt.id === fromId
				);
				const toIndex = quiz.options.findIndex(
					(opt) => opt.id === toId
				);

				if (fromIndex !== -1 && toIndex !== -1) {
					const [movedOption] = quiz.options.splice(fromIndex, 1);
					quiz.options.splice(toIndex, 0, movedOption);
				}
			}
		},
		setMultipleSelectedItems: (
			state,
			action: PayloadAction<SurveyItem[]>
		) => {
			state.multypleselectedItem = action.payload;
		},
		clearMultipleSelectedItems: (state) => {
			state.multypleselectedItem = [];
		},

		// Item reducers
		addNewItem: surveyItemReducers.addNewItem,
		addNewSurveyItem: surveyItemReducers.addNewSurveyItem,
		// removeSelectedItem: surveyItemReducers.removeSelectedItem,
		clearAllSelectedItems: surveyItemReducers.clearAllSelectedItems,
		updateQuizTitle: surveyItemReducers.updateQuizTitle,
		updateQuizImages: surveyItemReducers.updateQuizImages,
		updateLimitedTimeTitle: surveyItemReducers.updateLimitedTimeTitle,
		contantData: surveyItemReducers.contantData,
		scalesMaxMinData: surveyItemReducers.scalesMaxMinData,
		updatePoints: surveyItemReducers.updatePoints,

		// Option reducers
		addSurveyOption: surveyOptionReducers.addSurveyOption,
		addSurveyOptionsFromPaste: surveyOptionReducers.addSurveyOptionsFromPaste,
		removeSurveyOption: surveyOptionReducers.removeSurveyOption,
		updateOptionText: surveyOptionReducers.updateOptionText,
		updateOptionColor: surveyOptionReducers.updateOptionColor,
		toggleOptionSelection: surveyOptionReducers.toggleOptionSelection,
		updateTrueFalseOption: surveyOptionReducers.updateTrueFalseOption,
		toggleSwitchSelectionMode: surveyOptionReducers.toggleSwitchSelectionMode,

		addSortAnswerOption:
			surveyOptionReducers.sortAnswerReducers.addSortAnswerOption,
		updateSortAnswerOption:
			surveyOptionReducers.sortAnswerReducers.updateSortAnswerOption,
		updateSortAnswerItem:
			surveyOptionReducers.sortAnswerReducers.updateSortAnswerItem,
	},
});

export const {
	setHoveredItem,
	clearHoveredItem,
	setSelectedItem,
	clearSelectedItem,
	setMultipleSelectedItems,
	addNewItem,
	reorderOptions,
	addNewSurveyItem,
	clearAllSelectedItems,
	updateQuizTitle,
	updateQuizImages,
	updateLimitedTimeTitle,
	contantData,
	scalesMaxMinData,
	updatePoints,
	addSurveyOption,
	addSurveyOptionsFromPaste,
	removeSurveyOption,
	updateOptionText,
	updateOptionColor,
	toggleOptionSelection,
	updateTrueFalseOption,
	toggleSwitchSelectionMode,
	clearMultipleSelectedItems,
	addSortAnswerOption,
	updateSortAnswerOption,
	updateSortAnswerItem,
	removeSelectedItem,
	duplicateItem,
} = surveySlice.actions;
export default surveySlice.reducer;
export type { TrueFalseOption };
