import { HoverState } from "@/types/surveyTypes";

export const initialState: HoverState = {
	hoveredItem: null,
	selectedItem: null,
	multypleselectedItem: [],
	options: [],
	isMultipleSelection: false,
};
