import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Quiz } from "@/types/types";

interface QuizState {
	surveyInformation: Quiz | null;
}

const initialState: QuizState = {
	surveyInformation: null,
};

const surveyInformationSlice = createSlice({
	name: "surveyInformation",
	initialState,
	reducers: {
		setSurvey(state, action: PayloadAction<Quiz>) {
			state.surveyInformation = action.payload;
		},
		clearSurvey(state) {
			state.surveyInformation = null;
		},
	},
});

export const { setSurvey: setSurvey, clearSurvey: clearSurvey } =
	surveyInformationSlice.actions;
export default surveyInformationSlice.reducer;
