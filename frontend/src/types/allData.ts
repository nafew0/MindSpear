export interface Option {
  id: number;
  name: string;
  isEditing: boolean;
  editedName: string;
  isSelected: boolean; 
}

export interface OptionsState {
  options: Option[];
  showAll: boolean;
}

export const TOGGLE_EDIT = 'TOGGLE_EDIT';
export const UPDATE_OPTION_NAME = 'UPDATE_OPTION_NAME';
export const TOGGLE_SELECT = 'TOGGLE_SELECT';
export const TOGGLE_SHOW_ALL = 'TOGGLE_SHOW_ALL';

interface ToggleEditAction {
  type: typeof TOGGLE_EDIT;
  payload: number;
}

interface UpdateOptionNameAction {
  type: typeof UPDATE_OPTION_NAME;
  payload: {
    id: number;
    name: string;
  };
}

interface ToggleSelectAction {
  type: typeof TOGGLE_SELECT;
  payload: number;
}

interface ToggleShowAllAction {
  type: typeof TOGGLE_SHOW_ALL;
}

export type OptionsActionTypes = 
  | ToggleEditAction 
  | UpdateOptionNameAction 
  | ToggleSelectAction 
  | ToggleShowAllAction;