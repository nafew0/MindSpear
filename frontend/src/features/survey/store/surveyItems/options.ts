import { SurveyItem } from '@/types/surveyTypes';
import { PayloadAction } from "@reduxjs/toolkit";

// Add option to survey item
export const addSurveyOption = (state: any, action: PayloadAction<{ id: string; option: any }>) => {
  const { id, option } = action.payload;
  const item = state.multypleselectedItem.find((item: SurveyItem) => item.id === id);
  if (item && item.options) {
    const newOption = {
      ...option,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    item.options.push(newOption);
  }
};

// Add multiple options from paste
export const addSurveyOptionsFromPaste = (state: any, action: any) => {
  const { id, options } = action.payload;
  const item = state.multypleselectedItem.find((item: SurveyItem) => item.id === id);
  if (item && item.options) {
    options.forEach((option: any) => {
      const newOption = {
        ...option,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };
      item.options.push(newOption);
    });
  }
};

// Remove option from survey item
export const removeSurveyOption = (state: any, action: PayloadAction<{ id: string; optionId: string }>) => {
  const { id, optionId } = action.payload;
  const item = state.multypleselectedItem.find((item: SurveyItem) => item.id === id);
  if (item && item.options) {
    item.options = item.options.filter((opt: any) => opt.id !== optionId);
  }
};

// Update option text
export const updateOptionText = (state: any, action: any) => {
  const { quizId, optionId, text } = action.payload;
  const item = state.multypleselectedItem.find((item: SurveyItem) => item.id === quizId);
  if (item && item.options) {
    const option = item.options.find((opt: any) => opt.id === optionId);
    if (option) {
      option.text = text;
    }
  }
};

// Update option color
export const updateOptionColor = (state: any, action: any) => {
  const { quizId, optionId, color } = action.payload;
  const item = state.multypleselectedItem.find((item: SurveyItem) => item.id === quizId);
  if (item && item.options) {
    const option = item.options.find((opt: any) => opt.id === optionId);
    if (option) {
      option.color = color;
    }
  }
};

// Toggle option selection
export const toggleOptionSelection = (state: any, action: any) => {
  const { quizId, optionId, isMultipleSelection } = action.payload;
  const item = state.multypleselectedItem.find((item: SurveyItem) => item.id === quizId);
  if (item && item.options) {
    if (isMultipleSelection) {
      const option = item.options.find((opt: any) => opt.id === optionId);
      if (option) {
        option.isSelected = !option.isSelected;
      }
    } else {
      // For single selection, unselect all others
      item.options.forEach((opt: any) => {
        if (opt.id === optionId) {
          opt.isSelected = true;
        } else {
          opt.isSelected = false;
        }
      });
    }
  }
};

// Update true/false option
export const updateTrueFalseOption = (state: any, action: any) => {
  const { quizId, optionId, type, value } = action.payload;
  const item = state.multypleselectedItem.find((item: SurveyItem) => item.id === quizId);
  if (item && item.options) {
    const option = item.options.find((opt: any) => opt.id === optionId);
    if (option) {
      if (type === 'color') {
        option.color = value;
      } else if (type === 'isSelected') {
        option.isSelected = value;
      }
    }
  }
};

// Toggle switch selection mode
export const toggleSwitchSelectionMode = (state: any, action: PayloadAction<{ id: string; isMultipleSelection: boolean }>) => {
  const { id, isMultipleSelection } = action.payload;
  const item = state.multypleselectedItem.find((item: SurveyItem) => item.id === id);
  if (item) {
    item.isMultipleSelection = isMultipleSelection;
  }
};

// Sort answer reducers namespace
export const sortAnswerReducers = {
  addSortAnswerOption: (state: any, action: any) => {
    const { id, option } = action.payload;
    const item = state.multypleselectedItem.find((item: SurveyItem) => item.id === id);
    if (item && item.options) {
      const newOption = {
        ...option,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };
      item.options.push(newOption);
    }
  },

  updateSortAnswerOption: (state: any, action: any) => {
    const { quizId, optionId, text } = action.payload;
    const item = state.multypleselectedItem.find((item: SurveyItem) => item.id === quizId);
    if (item && item.options) {
      const option = item.options.find((opt: any) => opt.id === optionId);
      if (option) {
        option.text = text;
      }
    }
  },

  updateSortAnswerItem: (state: any, action: any) => {
    const { id, minOptions, maxOptions, allowDuplicates } = action.payload;
    const item = state.multypleselectedItem.find((item: SurveyItem) => item.id === id);
    if (item) {
      if (minOptions !== undefined) item.minOptions = minOptions;
      if (maxOptions !== undefined) item.maxOptions = maxOptions;
      if (allowDuplicates !== undefined) item.allowDuplicates = allowDuplicates;
    }
  },
};