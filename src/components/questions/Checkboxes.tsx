import type { FormQuestion } from '../../types/form';
import type { ThemeConfig } from '../../types/theme';

interface CheckboxesProps {
  question: FormQuestion;
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
  theme?: ThemeConfig;
}

export function Checkboxes({ question, value, onChange, error, theme }: CheckboxesProps) {
  const groupId = `question-${question.id}`;
  const errorId = `${groupId}-error`;
  const descriptionId = question.description ? `${groupId}-description` : undefined;

  const handleChange = (optionValue: string, checked: boolean) => {
    if (checked) {
      onChange([...value, optionValue]);
    } else {
      onChange(value.filter((v) => v !== optionValue));
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
        role="group"
        aria-required={question.required}
        aria-invalid={!!error}
        aria-describedby={[descriptionId, error ? errorId : null].filter(Boolean).join(' ') || undefined}
        className="space-y-2"
      >
        {question.options?.map((option, index) => {
          const optionId = `${groupId}-option-${index}`;
          const isSelected = value.includes(option.value);

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
                type="checkbox"
                value={option.value}
                checked={isSelected}
                onChange={(e) => handleChange(option.value, e.target.checked)}
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
