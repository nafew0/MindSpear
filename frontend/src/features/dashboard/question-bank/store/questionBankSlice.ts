import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the state interface
interface QuestionBankState {
  loading: boolean;
  error: string | null;
  success: boolean;
  categories: any[]; // Replace with proper category interface if available
  currentQuestion: any | null; // Will hold the question data to be added
  formData: {
    name: string;
    quiz_q_bank_category_id: number;
    tags: string;
  };
}

// Initial state
const initialState: QuestionBankState = {
  loading: false,
  error: null,
  success: false,
  categories: [],
  currentQuestion: null,
  formData: {
    name: "",
    quiz_q_bank_category_id: 0,
    tags: "",
  },
};

const questionBankSlice = createSlice({
  name: "questionBank",
  initialState,
  reducers: {
    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
      state.error = null;
    },
    
    // Set error message
    setError: (state, action: PayloadAction<string | null>) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    // Set success state
    setSuccess: (state, action: PayloadAction<boolean>) => {
      state.success = action.payload;
    },
    
    // Set categories
    setCategories: (state, action: PayloadAction<any[]>) => {
      state.categories = action.payload;
    },
    
    // Set current question to be added
    setCurrentQuestion: (state, action: PayloadAction<any>) => {
      state.currentQuestion = action.payload;
    },
    
    // Set form data
    setFormData: (state, action: PayloadAction<Partial<QuestionBankState['formData']>>) => {
      state.formData = {
        ...state.formData,
        ...action.payload,
      };
    },
    
    // Reset form data
    resetFormData: (state) => {
      state.formData = initialState.formData;
      state.loading = false;
      state.error = null;
      state.success = false;
    },
    
    // Reset the entire state
    resetState: (state) => {
      return { ...initialState };
    },
  },
});

export const {
  setLoading,
  setError,
  setSuccess,
  setCategories,
  setCurrentQuestion,
  setFormData,
  resetFormData,
  resetState,
} = questionBankSlice.actions;

export default questionBankSlice.reducer;