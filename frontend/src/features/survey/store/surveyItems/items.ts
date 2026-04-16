import { SurveyItem } from '@/types/surveyTypes';
import { PayloadAction } from '@reduxjs/toolkit';

export const addNewSurveyItem = (state: any, action: PayloadAction<SurveyItem>) => {
  const nextPosition = state.multypleselectedItem.length > 0
    ? Math.max(...state.multypleselectedItem.map((item: SurveyItem) => item.position || 0)) + 1
    : 1;

  let newItem: SurveyItem = {
    key: action.payload.key,
    id: action.payload.id,
    title: action.payload.title || '',
    survey_id: action.payload.survey_id,
    page_id: action.payload.page_id,
    question_text: action.payload.question_text,
    question_type: action.payload.question_type,
    serial_number: action.payload.serial_number,
    is_required: action.payload.is_required,
    options: [],
    maxOptions: 0,
    minOptions: 0,
    position: nextPosition,
    allowDuplicates: false,
    isMultipleSelection: false,
    timeLimit: '',
    created_at: action.payload.created_at,
    updated_at: action.payload.updated_at,
    layout_id: action.payload.layout_id,
    image_url: action.payload.image_url,
  };

  if (action.payload.key === 'qsenchoice') {
    newItem = {
      ...newItem,
      options: [
        { id: '1', text: "", placeholder: 'Option 1', color: '#F79945', isSelected: false },
        { id: '2', text: "", placeholder: 'Option 2', color: '#BC5EB3', isSelected: false },
        { id: '3', text: "", placeholder: 'Option 3', color: '#5769e7', isSelected: false },
        { id: '4', text: "", placeholder: 'Option 4', color: '#89c6c7', isSelected: false },
      ],
      isMultipleSelection: false
    };
  }

  if (action.payload.key === 'truefalse') {
    newItem.options = [
      { id: '1', label: 'Yes', color: '#F79945', isSelected: false, text: 'Yes' },
      { id: '2', label: 'No', color: '#bc5eb3', isSelected: false, text: 'No' },
    ];
  }

  if (action.payload.key === 'sortanswer') {
    newItem = {
      ...newItem,
      options: [
        {
          id: '1',
          text: '',
          placeholder: 'Add answer 1',
          color: '#F79945',
          isSelected: false,
        }
      ],
      maxOptions: 4,
      minOptions: 1,
      allowDuplicates: false,
    };
  }

   if (action.payload.key === 'scales') {
    newItem = {
      ...newItem,
      options: [
        { id: '1', text: "", placeholder: 'Statement 1', color: '#F79945', isSelected: false },
        { id: '2', text: "", placeholder: 'Statement 2', color: '#BC5EB3', isSelected: false },
        { id: '3', text: "", placeholder: 'Statement 3', color: '#5769e7', isSelected: false },
        { id: '4', text: "", placeholder: 'Statement 4', color: '#89c6c7', isSelected: false },
      ],
      isMultipleSelection: false,
      minNumber: 1,
      maxNumber: 5,
    };
  }
   
  if (action.payload.key === 'wordcloud') {
    newItem = {
      ...newItem,
      options: [
        { id: '1', text: "", placeholder: 'Option 1', color: '#F79945', isSelected: false },
      ],
      isMultipleSelection: false
    };
  }

  if (action.payload.key === 'ranking') {
    newItem = {
      ...newItem,
      options: [
        { id: '1', text: "", placeholder: 'Item 1', color: '#F79945', isSelected: false },
        { id: '2', text: "", placeholder: 'Item 2', color: '#BC5EB3', isSelected: false },
        { id: '3', text: "", placeholder: 'Item 3', color: '#5769e7', isSelected: false },
        { id: '4', text: "", placeholder: 'Item 4', color: '#89c6c7', isSelected: false },
      ],
      isMultipleSelection: false
    };
  }

  if (action.payload.key === 'shortanswer') {
    newItem = {
      ...newItem,
      options: [
        { id: '1', text: "", placeholder: 'Item 1', color: '#F79945', isSelected: false },
      ],
      isMultipleSelection: false
    };
  }

  if (action.payload.key === 'longanswer') {
    newItem = {
      ...newItem,
      options: [
        { id: '1', text: "", placeholder: 'Item 1', color: '#F79945', isSelected: false },
      ],
      isMultipleSelection: false
    };
  }

  if (action.payload.key === 'sorting') {
    newItem = {
      ...newItem,
      options: [
        { id: '1', text: "", placeholder: 'Option 1', color: '#F79945', isSelected: false },
        { id: '2', text: "", placeholder: 'Option 2', color: '#BC5EB3', isSelected: false },
        { id: '3', text: "", placeholder: 'Option 3', color: '#5769e7', isSelected: false },
        { id: '4', text: "", placeholder: 'Option 4', color: '#89c6c7', isSelected: false },
      ],
      isMultipleSelection: false
    };
  }
  
  if (action.payload.key === 'content') {
    newItem = {
      ...newItem,
      options: [
        { id: '1', text: "", placeholder: 'Option 1', color: '#F79945', isSelected: false },
        { id: '2', text: "", placeholder: 'Option 2', color: '#BC5EB3', isSelected: false },
        { id: '3', text: "", placeholder: 'Option 3', color: '#5769e7', isSelected: false },
        { id: '4', text: "", placeholder: 'Option 4', color: '#89c6c7', isSelected: false },
      ],
      isMultipleSelection: false
    };
  }

  state.multypleselectedItem.push(newItem);
  state.selectedItem = newItem;
};

export const addNewItem = addNewSurveyItem; // For backward compatibility

export const removeSelectedItem = (state: any, action: any) => {
  const { id } = action.payload;
  state.multypleselectedItem = state.multypleselectedItem.filter(
    (item: SurveyItem) => item.id !== id
  );
};

export const clearAllSelectedItems = (state: any) => {
  state.multypleselectedItem = [];
  state.selectedItem = null;
};

export const updateQuizTitle = (state: any, action: any) => {
  if (!action?.payload) return;
  const { id, title } = action.payload;
  if (!id) return;
  const item = state.multypleselectedItem.find((item: SurveyItem) => item.id === id);
  if (item) {
    item.title = title;
    item.question_text = title;
  }

  if (state.selectedItem?.id === id) {
    state.selectedItem.title = title;
    state.selectedItem.question_text = title;
  }
  if (state.hoveredItem?.id === id) {
    state.hoveredItem.title = title;
    state.hoveredItem.question_text = title;
  }
};

export const updateQuizImages = (state: any, action: any) => {
  const { id, image_url } = action.payload;
  const item = state.multypleselectedItem.find((item: SurveyItem) => item.id === id);
  if (item) {
    item.image_url = image_url;
  }
};

export const updateLimitedTimeTitle = (state: any, action: PayloadAction<{ id: string; timeLimit: string }>) => {
  const { id, timeLimit } = action.payload;

  // Update selected item
  if (state.selectedItem?.id === id) {
    state.selectedItem.timeLimit = timeLimit;
  }

  // Update hovered item
  if (state.hoveredItem?.id === id) {
    state.hoveredItem.timeLimit = timeLimit;
  }

  // Update multiple selected items
  const itemToUpdate = state.multypleselectedItem.find((item: SurveyItem) => item.id === id);
  if (itemToUpdate) {
    itemToUpdate.timeLimit = timeLimit;
  }
};

export const contantData = (state: any, action: PayloadAction<{ id: string; contant_title: string; image_url?: string; layout_id?: string }>) => {
  const { id, contant_title, image_url, layout_id } = action.payload;

  // Update selected item
  if (state.selectedItem?.id === id) {
    if (contant_title !== undefined) state.selectedItem.contant_title = contant_title;
    if (image_url !== undefined) state.selectedItem.image_url = image_url;
    if (layout_id !== undefined) state.selectedItem.layout_id = layout_id;
  }

  // Update hovered item
  if (state.hoveredItem?.id === id) {
    if (contant_title !== undefined) state.hoveredItem.contant_title = contant_title;
    if (image_url !== undefined) state.hoveredItem.image_url = image_url;
    if (layout_id !== undefined) state.hoveredItem.layout_id = layout_id;
  }

  // Update multiple selected items
  const itemToUpdate = state.multypleselectedItem.find((item: SurveyItem) => item.id === id);
  if (itemToUpdate) {
    if (contant_title !== undefined) itemToUpdate.contant_title = contant_title;
    if (image_url !== undefined) itemToUpdate.image_url = image_url;
    if (layout_id !== undefined) itemToUpdate.layout_id = layout_id;
  }
};

export const scalesMaxMinData = (state: any, action: PayloadAction<{ id: string; minNumber: number; maxNumber: number; minText?: string; maxText?: string }>) => {
  const { id, minNumber, maxNumber, minText, maxText } = action.payload;

  // Update selected item
  if (state.selectedItem?.id === id) {
    if (!state.selectedItem.task_data) state.selectedItem.task_data = {};

    if (typeof minNumber === "number") state.selectedItem.task_data.minNumber = minNumber;
    if (typeof maxNumber === "number") state.selectedItem.task_data.maxNumber = maxNumber;
    if (minText) state.selectedItem.task_data.minText = minText;
    if (maxText) state.selectedItem.task_data.maxText = maxText;

    // Also update the direct properties for backward compatibility
    if (typeof minNumber === "number") state.selectedItem.minNumber = minNumber;
    if (typeof maxNumber === "number") state.selectedItem.maxNumber = maxNumber;
  }

  // Update hovered item
  if (state.hoveredItem?.id === id) {
    if (!state.hoveredItem.task_data) state.hoveredItem.task_data = {};

    if (typeof minNumber === "number") state.hoveredItem.task_data.minNumber = minNumber;
    if (typeof maxNumber === "number") state.hoveredItem.task_data.maxNumber = maxNumber;
    if (minText) state.hoveredItem.task_data.minText = minText;
    if (maxText) state.hoveredItem.task_data.maxText = maxText;

    // Also update the direct properties for backward compatibility
    if (typeof minNumber === "number") state.hoveredItem.minNumber = minNumber;
    if (typeof maxNumber === "number") state.hoveredItem.maxNumber = maxNumber;
  }

  // Update multiple selected items
  const itemToUpdate = state.multypleselectedItem.find((item: SurveyItem) => item.id === id);
  if (itemToUpdate) {
    if (!itemToUpdate.task_data) itemToUpdate.task_data = {};

    if (typeof minNumber === "number") itemToUpdate.task_data.minNumber = minNumber;
    if (typeof maxNumber === "number") itemToUpdate.task_data.maxNumber = maxNumber;
    if (minText) itemToUpdate.task_data.minText = minText;
    if (maxText) itemToUpdate.task_data.maxText = maxText;

    // Also update the direct properties for backward compatibility
    if (typeof minNumber === "number") itemToUpdate.minNumber = minNumber;
    if (typeof maxNumber === "number") itemToUpdate.maxNumber = maxNumber;
  }
};

export const updatePoints = (state: any, action: any) => {
  const { id, points } = action.payload;

  // Update selected item
  if (state.selectedItem?.id === id) {
    state.selectedItem.points = points;
  }

  // Update hovered item
  if (state.hoveredItem?.id === id) {
    state.hoveredItem.points = points;
  }

  // Update multiple selected items
  const itemToUpdate = state.multypleselectedItem.find((item: SurveyItem) => item.id === id);
  if (itemToUpdate) {
    itemToUpdate.points = points;
  }
};