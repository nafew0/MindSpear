import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Quiz } from "@/types/types";

interface QuizState {
  quizInformation: Quiz | null;
}

const initialState: QuizState = {
  quizInformation: null,
};

const quizInformationSlice = createSlice({
  name: "quizInformation",
  initialState,
  reducers: {
    setQuiz(state, action: PayloadAction<Quiz>) {
      // console.log(action.payload, "action.payloadaction.payload");
      
      state.quizInformation = action.payload;
    },
    clearQuiz(state) {
      state.quizInformation = null;
    },
  },
});

export const { setQuiz, clearQuiz } = quizInformationSlice.actions;
export default quizInformationSlice.reducer;
