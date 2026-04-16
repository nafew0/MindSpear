/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface QuestState {
  questId: string | null;
  questiQsenStartTime: string | null;
  questiQsenTime: string | null;
  questionId: string | null;
  questiQsenLateStartTime: any;
}

const initialState: QuestState = {
  questId: null,
  questionId: null,
  questiQsenStartTime: null,
  questiQsenTime: null,
  questiQsenLateStartTime: null,
};

const questQsenTimeSlice = createSlice({
  name: 'questTime',
  initialState,
  reducers: {
    setQuestData: (state, action: PayloadAction<Partial<QuestState>>) => {
      return { ...state, ...action.payload };
    },
    clearQuestData: () => initialState,
  },
});

export const { setQuestData, clearQuestData } = questQsenTimeSlice.actions;
export default questQsenTimeSlice.reducer;