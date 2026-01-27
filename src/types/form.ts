export type QuestionType =
  | 'short_answer'
  | 'paragraph'
  | 'multiple_choice'
  | 'checkboxes'
  | 'dropdown'
  | 'linear_scale'
  | 'multiple_choice_grid'
  | 'checkbox_grid'
  | 'date'
  | 'time';

export interface FormOption {
  value: string;
  label: string;
}

export interface ScaleLabels {
  low?: string;
  high?: string;
}

export interface GridQuestion {
  rows: string[];
  columns: string[];
}

export interface FormQuestion {
  id: string;
  entryId: string;
  title: string;
  description?: string;
  type: QuestionType;
  required: boolean;
  options?: FormOption[];
  scaleStart?: number;
  scaleEnd?: number;
  scaleLabels?: ScaleLabels;
  grid?: GridQuestion;
}

export interface ParsedForm {
  id: string;
  title: string;
  description?: string;
  questions: FormQuestion[];
  submitUrl: string;
}

export interface FormResponse {
  [questionId: string]: string | string[];
}

export type LayoutMode = 'standard' | 'question-by-question';

export type QbyQStyle = 'classic' | 'immersive';

export interface FormConfig {
  formId: string;
  parsedForm: ParsedForm;
  layoutMode: LayoutMode;
  qbyqStyle?: QbyQStyle; // Style for Q-by-Q layout: 'classic' or 'immersive'
  headerImageUrl?: string;
  createdAt: number;
  // Theme configuration (shared across layouts)
  theme?: unknown;
}

export const isSingleSelectQuestion = (type: QuestionType): boolean => {
  return ['multiple_choice', 'dropdown', 'linear_scale'].includes(type);
};
