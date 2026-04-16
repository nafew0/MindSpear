import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type AnswerOption = {
  id: number | string;
  text: string;
  color?: string | null;
};

export type LeaderboardAnswer = {
  id: number | string;          // question id (unique)
  quiz_id?: number | string | null;
  serial_number?: number | null;
  title?: string | null;
  question_type?: string | null;
  selected_time: number;        // seconds until select/submit
  source_content_url?: string | null;
  questions: AnswerOption[];    // selected option(s) or typed text
};

// IMPORTANT: keep state as a plain array so `state.answers` IS the array.
const initialState: LeaderboardAnswer[] = [];

const ledaerboardAnswersSlice = createSlice({
  name: "answers",
  initialState,
  reducers: {
    upsertAnswer: (state, action: PayloadAction<LeaderboardAnswer>) => {
        
        const i = state.findIndex(a => a.id === action.payload.id);
        console.log(i, "statestatestatestatestatestatestatestate");
      if (i >= 0) state[i] = action.payload; else state.push(action.payload);
    },
    resetAnswers: () => initialState,
  },
});

export const { upsertAnswer, resetAnswers } = ledaerboardAnswersSlice.actions;
export default ledaerboardAnswersSlice.reducer;
