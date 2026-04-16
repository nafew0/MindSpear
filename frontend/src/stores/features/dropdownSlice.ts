// store/slices/dropdownSlice.ts
import { createSlice } from "@reduxjs/toolkit";

interface DropdownState {
  isDropdownOpen: boolean;
}

const initialState: DropdownState = {
  isDropdownOpen: false,
};

const dropdownSlice = createSlice({
  name: "dropdown",
  initialState,
  reducers: {
    setDropdownOpen: (state, action) => {
      state.isDropdownOpen = action.payload;
    },
  },
});

export const { setDropdownOpen } = dropdownSlice.actions;
export default dropdownSlice.reducer;
