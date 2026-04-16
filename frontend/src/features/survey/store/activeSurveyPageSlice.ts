import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ActiveSurveyPageState } from "@/types/surveyTypes";

const initialState: ActiveSurveyPageState = {
  activePageId: null,
  surveyId: null,
};

const activeSurveyPageSlice = createSlice({
  name: "activeSurveyPage",
  initialState,
  reducers: {
    setActivePage: (state, action: PayloadAction<number | null>) => {
      state.activePageId = action.payload;
    },
    
    setSurveyId: (state, action: PayloadAction<string>) => {
      state.surveyId = action.payload;
    },
    
    resetActivePage: (state) => {
      state.activePageId = null;
      state.surveyId = null;
    },
  },
});

export const { 
  setActivePage, 
  setSurveyId, 
  resetActivePage 
} = activeSurveyPageSlice.actions;

export default activeSurveyPageSlice.reducer;