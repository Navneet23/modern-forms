import type { FormQuestion } from '../../types/form';
import type { ThemeConfig } from '../../types/theme';
import { isSingleSelectQuestion } from '../../types/form';
import { ShortAnswer } from './ShortAnswer';
import { Paragraph } from './Paragraph';
import { MultipleChoice } from './MultipleChoice';
import { Checkboxes } from './Checkboxes';
import { Dropdown } from './Dropdown';
import { LinearScale } from './LinearScale';
import { DateInput } from './DateInput';
import { TimeInput } from './TimeInput';

interface QuestionRendererProps {
  question: FormQuestion;
  value: string | string[];
  onChange: (value: string | string[]) => void;
  onAutoAdvance?: () => void;
  error?: string;
  theme?: ThemeConfig;
}

export function QuestionRenderer({
  question,
  value,
  onChange,
  onAutoAdvance,
  error,
  theme,
}: QuestionRendererProps) {
  // Determine if auto-advance should be passed
  const shouldAutoAdvance = isSingleSelectQuestion(question.type) ? onAutoAdvance : undefined;

  switch (question.type) {
    case 'short_answer':
      return (
        <ShortAnswer
          question={question}
          value={value as string}
          onChange={onChange as (v: string) => void}
          error={error}
          theme={theme}
        />
      );

    case 'paragraph':
      return (
        <Paragraph
          question={question}
          value={value as string}
          onChange={onChange as (v: string) => void}
          error={error}
          theme={theme}
        />
      );

    case 'multiple_choice':
      return (
        <MultipleChoice
          question={question}
          value={value as string}
          onChange={onChange as (v: string) => void}
          onAutoAdvance={shouldAutoAdvance}
          error={error}
          theme={theme}
        />
      );

    case 'checkboxes':
      return (
        <Checkboxes
          question={question}
          value={Array.isArray(value) ? value : []}
          onChange={onChange as (v: string[]) => void}
          error={error}
          theme={theme}
        />
      );

    case 'dropdown':
      return (
        <Dropdown
          question={question}
          value={value as string}
          onChange={onChange as (v: string) => void}
          onAutoAdvance={shouldAutoAdvance}
          error={error}
          theme={theme}
        />
      );

    case 'linear_scale':
      return (
        <LinearScale
          question={question}
          value={value as string}
          onChange={onChange as (v: string) => void}
          onAutoAdvance={shouldAutoAdvance}
          error={error}
          theme={theme}
        />
      );

    case 'date':
      return (
        <DateInput
          question={question}
          value={value as string}
          onChange={onChange as (v: string) => void}
          error={error}
          theme={theme}
        />
      );

    case 'time':
      return (
        <TimeInput
          question={question}
          value={value as string}
          onChange={onChange as (v: string) => void}
          error={error}
          theme={theme}
        />
      );

    case 'multiple_choice_grid':
    case 'checkbox_grid':
      // Grid types - simplified for prototype
      return (
        <div className="space-y-2">
          <p className="text-lg font-medium" style={{ color: theme?.colors.text }}>
            {question.title}
            {question.required && <span style={{ color: theme?.colors.error }} className="ml-1">*</span>}
          </p>
          <p className="text-sm italic" style={{ color: theme?.colors.textSecondary }}>
            Grid questions are not fully supported in this prototype.
          </p>
        </div>
      );

    default:
      return (
        <div className="p-4 rounded-lg" style={{ backgroundColor: theme?.colors.background }}>
          <p style={{ color: theme?.colors.textSecondary }}>Unsupported question type: {question.type}</p>
        </div>
      );
  }
}

export { ShortAnswer, Paragraph, MultipleChoice, Checkboxes, Dropdown, LinearScale, DateInput, TimeInput };
