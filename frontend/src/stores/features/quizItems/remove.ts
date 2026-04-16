import { PayloadAction } from '@reduxjs/toolkit';
import { QuizItem, HoverState } from '@/types/types';

export const removeSelectedItem = (state: HoverState, action: PayloadAction<QuizItem>) => {
  state.multypleselectedItem = state.multypleselectedItem.filter(item => item.id !== action.payload.id);
};

export const clearAllSelectedItems = (state: HoverState) => {
  state.multypleselectedItem = [];
};