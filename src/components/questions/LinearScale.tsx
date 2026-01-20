import type { FormQuestion } from '../../types/form';
import type { ThemeConfig } from '../../types/theme';

interface LinearScaleProps {
  question: FormQuestion;
  value: string;
  onChange: (value: string) => void;
  onAutoAdvance?: () => void;
  error?: string;
  theme?: ThemeConfig;
}

export function LinearScale({ question, value, onChange, onAutoAdvance, error, theme }: LinearScaleProps) {
  const groupId = `question-${question.id}`;
  const errorId = `${groupId}-error`;
  const descriptionId = question.description ? `${groupId}-description` : undefined;

  const start = question.scaleStart || 1;
  const end = question.scaleEnd || 5;
  const scaleValues = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  const handleChange = (newValue: string) => {
    onChange(newValue);
    // Auto-advance after selection
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
        className="space-y-4"
      >
        {/* Scale labels */}
        <div className="flex justify-between text-sm" style={{ color: theme?.colors.textSecondary }}>
          {question.scaleLabels?.low && <span>{question.scaleLabels.low}</span>}
          {question.scaleLabels?.high && <span className="text-right">{question.scaleLabels.high}</span>}
        </div>

        {/* Scale options */}
        <div className="flex justify-between gap-2">
          {scaleValues.map((scaleValue) => {
            const optionId = `${groupId}-option-${scaleValue}`;
            const isSelected = value === String(scaleValue);

            return (
              <label
                key={scaleValue}
                htmlFor={optionId}
                className="flex-1 flex flex-col items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all min-h-[48px] min-w-[48px]"
                style={{
                  borderColor: isSelected ? theme?.colors.primary : theme?.colors.border,
                  backgroundColor: isSelected ? theme?.colors.primary : 'transparent',
                  color: isSelected ? '#FFFFFF' : theme?.colors.text,
                }}
              >
                <input
                  id={optionId}
                  type="radio"
                  name={groupId}
                  value={scaleValue}
                  checked={isSelected}
                  onChange={() => handleChange(String(scaleValue))}
                  className="sr-only"
                />
                <span className="text-lg font-medium">{scaleValue}</span>
              </label>
            );
          })}
        </div>
      </div>

      {error && (
        <p id={errorId} className="text-sm" style={{ color: theme?.colors.error }} role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}
