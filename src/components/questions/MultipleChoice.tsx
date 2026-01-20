import type { FormQuestion } from '../../types/form';
import type { ThemeConfig } from '../../types/theme';

interface MultipleChoiceProps {
  question: FormQuestion;
  value: string;
  onChange: (value: string) => void;
  onAutoAdvance?: () => void;
  error?: string;
  theme?: ThemeConfig;
}

export function MultipleChoice({ question, value, onChange, onAutoAdvance, error, theme }: MultipleChoiceProps) {
  const groupId = `question-${question.id}`;
  const errorId = `${groupId}-error`;
  const descriptionId = question.description ? `${groupId}-description` : undefined;

  const handleChange = (optionValue: string) => {
    onChange(optionValue);
    // Auto-advance after a brief delay for single-selection
    if (onAutoAdvance) {
      setTimeout(() => onAutoAdvance(), 400);
    }
  };

  return (
    <fieldset className="space-y-3">
      <legend className="block text-lg font-medium" style={{ color: theme?.colors.text }}>
        {question.title}
        {question.required && (
          <span style={{ color: theme?.colors.error }} className="ml-1" aria-hidden="true">*</span>
        )}
      </legend>

      {question.description && (
        <p id={descriptionId} className="text-sm" style={{ color: theme?.colors.textSecondary }}>
          {question.description}
        </p>
      )}

      <div
        role="radiogroup"
        aria-required={question.required}
        aria-invalid={!!error}
        aria-describedby={[descriptionId, error ? errorId : null].filter(Boolean).join(' ') || undefined}
        className="space-y-2"
      >
        {question.options?.map((option, index) => {
          const optionId = `${groupId}-option-${index}`;
          const isSelected = value === option.value;

          return (
            <label
              key={option.value}
              htmlFor={optionId}
              className="flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all min-h-[48px]"
              style={{
                borderColor: isSelected ? theme?.colors.primary : theme?.colors.border,
                backgroundColor: isSelected ? `${theme?.colors.primary}10` : 'transparent',
              }}
            >
              <input
                id={optionId}
                type="radio"
                name={groupId}
                value={option.value}
                checked={isSelected}
                onChange={() => handleChange(option.value)}
                className="w-5 h-5"
                style={{
                  accentColor: theme?.colors.primary,
                }}
                aria-describedby={descriptionId}
              />
              <span className="text-base" style={{ color: theme?.colors.text }}>{option.label}</span>
            </label>
          );
        })}
      </div>

      {error && (
        <p id={errorId} className="text-sm" style={{ color: theme?.colors.error }} role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}
