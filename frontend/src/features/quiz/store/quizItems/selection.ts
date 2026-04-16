import { PayloadAction } from '@reduxjs/toolkit';
import { HoverState, ToggleOptionSelectionPayload, UpdateTrueFalseOptionPayload } from '@/types/types';




export const toggleOptionSelection = (state: HoverState, action: PayloadAction<ToggleOptionSelectionPayload>) => {
  const quizItem = state.multypleselectedItem.find(item => item.id === action.payload.quizId);
  if (!quizItem || !quizItem.options) return;

  const option = quizItem.options.find(opt => opt.id === action.payload.optionId);
  if (!option) return;

  if (!action.payload.isMultipleSelection) {
    quizItem.options.forEach(opt => {
      opt.isSelected = opt.id === action.payload.optionId;
    });
  } else {
    option.isSelected = !option.isSelected;
  }

  if (state.selectedItem?.id === action.payload.quizId && state.selectedItem.options) {
    if (!action.payload.isMultipleSelection) {
      state.selectedItem.options.forEach(opt => {
        opt.isSelected = opt.id === action.payload.optionId;
      });
    } else {
      const opt = state.selectedItem.options.find(opt => opt.id === action.payload.optionId);
      if (opt) opt.isSelected = !opt.isSelected;
    }
  }
  if (state.hoveredItem?.id === action.payload.quizId && state.hoveredItem.options) {
    if (!action.payload.isMultipleSelection) {
      state.hoveredItem.options.forEach(opt => {
        opt.isSelected = opt.id === action.payload.optionId;
      });
    } else {
      const opt = state.hoveredItem.options.find(opt => opt.id === action.payload.optionId);
      if (opt) opt.isSelected = !opt.isSelected;
    }
  }
};

export const updateTrueFalseOption = (
  state: HoverState,
  action: PayloadAction<UpdateTrueFalseOptionPayload>
) => {
  const targetItem = state.multypleselectedItem.find(
    item => item.id === action.payload.quizId && item.key === 'truefalse'
  );

  if (targetItem && Array.isArray(targetItem.options)) {
    const targetOption = targetItem.options.find(opt => opt.id === action.payload.optionId);
    if (targetOption) {
      if (action.payload.type === 'color' && typeof action.payload.value === 'string') {
        targetOption.color = action.payload.value;
      }

      if (action.payload.type === 'isSelected') {
        targetItem.options.forEach(opt => {
          opt.isSelected = opt.id === action.payload.optionId;
        });
      }
    }
  }

  if (state.selectedItem?.id === action.payload.quizId && state.selectedItem.options) {
    const option = state.selectedItem.options.find(opt => opt.id === action.payload.optionId);
    if (option) {
      if (action.payload.type === 'color' && typeof action.payload.value === 'string') {
        option.color = action.payload.value;
      }
      if (action.payload.type === 'isSelected') {
        state.selectedItem.options.forEach(opt => {
          opt.isSelected = opt.id === action.payload.optionId;
        });
      }
    }
  }
};


export const toggleSwitchSelectionMode = (state : HoverState) => {
  console.log(state.multypleselectedItem, "state");
  
  
  if (state.selectedItem) {
    state.selectedItem.isMultipleSelection = !state.selectedItem.isMultipleSelection;
  }

  state.multypleselectedItem = state.multypleselectedItem.map(item => {
    if (item.id === state.selectedItem?.id) {
      return {
        ...item,
        isMultipleSelection: !item.isMultipleSelection
      };
    }
    return item;
  });
};








