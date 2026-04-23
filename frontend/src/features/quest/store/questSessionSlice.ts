// store/slices/questSessionSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { LiveParticipant, TimerState } from "@/features/live/types";

interface QuestSession {
  quest_id?: number | null;
  quiz_id?: number | null;
  title?: string | null;
  session_id?: string | null;
  start_datetime?: string | null;
  end_datetime?: string | null;
  timezone?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
  id: number;
  public_channel_key?: string | null;
  running_status?: boolean;
  current_question_id?: number | null;
  current_task_id?: number | null;
  timer_state?: TimerState;
  participant_count?: number | null;
  active_participants?: LiveParticipant[];
  join_link?: string | null;
  join_code?: string | null;
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
