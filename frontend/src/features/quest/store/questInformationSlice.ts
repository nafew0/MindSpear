import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Quiz } from "@/types/types";

interface QuizState {
  questInformation: Quiz | null;
}

const initialState: QuizState = {
  questInformation: null,
};

const questInformationSlice = createSlice({
  name: "questInformation",
  initialState,
  reducers: {
    setQuest(state, action: PayloadAction<Quiz>) {
      state.questInformation = action.payload;
    },
    clearQuest(state) {
      state.questInformation = null;
    },
  },
});

export const { setQuest, clearQuest } = questInformationSlice.actions;
export default questInformationSlice.reducer;
