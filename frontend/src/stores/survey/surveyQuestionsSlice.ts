import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SurveyQuestion, SurveyQuestionsState } from "@/types/surveyTypes";

const initialState: SurveyQuestionsState = {
  questionsByPage: {},
  loading: false,
  error: null,
};

const surveyQuestionsSlice = createSlice({
  name: "surveyQuestions",
  initialState,
  reducers: {
    // Set questions for a specific page
    setQuestionsForPage: (state, action: PayloadAction<{ pageId: number; questions: SurveyQuestion[] }>) => {
      const { pageId, questions } = action.payload;
      state.questionsByPage[pageId] = questions;
    },
    
    // Add a question to a specific page
    addQuestionToPage: (state, action: PayloadAction<{ pageId: number; question: SurveyQuestion }>) => {
      const { pageId, question } = action.payload;
      if (!state.questionsByPage[pageId]) {
        state.questionsByPage[pageId] = [];
      }
      state.questionsByPage[pageId].push(question);
    },
    
    // Update a question on a specific page
    updateQuestionOnPage: (state, action: PayloadAction<{ pageId: number; questionId: string; updatedQuestion: SurveyQuestion }>) => {
      const { pageId, questionId, updatedQuestion } = action.payload;
      if (state.questionsByPage[pageId]) {
        const questionIndex = state.questionsByPage[pageId].findIndex(q => q.id === questionId);
        if (questionIndex !== -1) {
          state.questionsByPage[pageId][questionIndex] = updatedQuestion;
        }
      }
    },
    
    // Remove a question from a specific page
    removeQuestionFromPage: (state, action: PayloadAction<{ pageId: number; questionId: string }>) => {
      const { pageId, questionId } = action.payload;
      if (state.questionsByPage[pageId]) {
        state.questionsByPage[pageId] = state.questionsByPage[pageId].filter(q => q.id !== questionId);
      }
    },
    
    // Move a question from one page to another
    moveQuestionBetweenPages: (
      state,
      action: PayloadAction<{ 
        sourcePageId: number; 
        targetPageId: number; 
        questionId: string 
      }>
    ) => {
      const { sourcePageId, targetPageId, questionId } = action.payload;
      
      // Remove from source page
      if (state.questionsByPage[sourcePageId]) {
        const questionToMove = state.questionsByPage[sourcePageId].find(q => q.id === questionId);
        if (questionToMove) {
          state.questionsByPage[sourcePageId] = state.questionsByPage[sourcePageId].filter(q => q.id !== questionId);
          
          // Add to target page
          if (!state.questionsByPage[targetPageId]) {
            state.questionsByPage[targetPageId] = [];
          }
          state.questionsByPage[targetPageId].push(questionToMove);
        }
      }
    },
    
    // Reorder questions on a specific page
    reorderQuestionsOnPage: (
      state,
      action: PayloadAction<{ 
        pageId: number; 
        orderedQuestionIds: string[] 
      }>
    ) => {
      const { pageId, orderedQuestionIds } = action.payload;
      if (state.questionsByPage[pageId]) {
        const reorderedQuestions = orderedQuestionIds
          .map(id => state.questionsByPage[pageId].find(q => q.id === id))
          .filter(Boolean) as SurveyQuestion[];
        
        state.questionsByPage[pageId] = reorderedQuestions;
      }
    },
    
    // Clear questions for a specific page
    clearQuestionsForPage: (state, action: PayloadAction<{ pageId: number }>) => {
      const { pageId } = action.payload;
      delete state.questionsByPage[pageId];
    },
    
    // Clear all questions
    clearAllQuestions: (state) => {
      state.questionsByPage = {};
    },
    
    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    // Set error
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setQuestionsForPage,
  addQuestionToPage,
  updateQuestionOnPage,
  removeQuestionFromPage,
  moveQuestionBetweenPages,
  reorderQuestionsOnPage,
  clearQuestionsForPage,
  clearAllQuestions,
  setLoading,
  setError,
} = surveyQuestionsSlice.actions;

export default surveyQuestionsSlice.reducer;