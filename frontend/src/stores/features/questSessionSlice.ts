// store/slices/questSessionSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface QuestSession {
  quest_id: number;
  title: string;
  session_id: string;
  start_datetime: string;
  end_datetime: string;
  timezone: string;
  updated_at: string;
  created_at: string;
  id: number;
}

interface QuestSessionState {
  questSession: QuestSession | null;
}

const initialState: QuestSessionState = {
  questSession: null,
};

const questSessionSlice = createSlice({
  name: 'questSession',
  initialState,
  reducers: {
    setQuestSession: (state, action: PayloadAction<QuestSession>) => {
      state.questSession = action.payload;
    },
    clearQuestSession: (state) => {
      state.questSession = null;
    },
  },
});

export const { setQuestSession, clearQuestSession } = questSessionSlice.actions;
export default questSessionSlice.reducer;