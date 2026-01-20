import type { FormQuestion } from '../../types/form';
import type { ThemeConfig } from '../../types/theme';

interface DateInputProps {
  question: FormQuestion;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  theme?: ThemeConfig;
}

export function DateInput({ question, value, onChange, error, theme }: DateInputProps) {
  const inputId = `question-${question.id}`;
  const errorId = `${inputId}-error`;
  const descriptionId = question.description ? `${inputId}-description` : undefined;

  return (
    <div className="space-y-2">
      <label
        htmlFor={inputId}
        className="block text-lg font-medium"
        style={{ color: theme?.colors.text }}
      >
        {question.title}
        {question.required && (
          <span style={{ color: theme?.colors.error }} className="ml-1" aria-hidden="true">*</span>
        )}
      </label>

      {question.description && (
        <p id={descriptionId} className="text-sm" style={{ color: theme?.colors.textSecondary }}>
          {question.description}
        </p>
      )}

      <input
        id={inputId}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full max-w-xs px-4 py-3 text-base border-2 rounded-lg transition-all min-h-[48px]"
        style={{
          borderColor: error ? theme?.colors.error : theme?.colors.border,
          color: theme?.colors.text,
          backgroundColor: theme?.colors.surface,
        }}
        onFocus={(e) => {
          e.target.style.borderColor = theme?.colors.primary || '#4F46E5';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error ? (theme?.colors.error || '#EF4444') : (theme?.colors.border || '#E5E7EB');
        }}
        required={question.required}
        aria-required={question.required}
        aria-invalid={!!error}
        aria-describedby={[descriptionId, error ? errorId : null].filter(Boolean).join(' ') || undefined}
      />

      {error && (
        <p id={errorId} className="text-sm" style={{ color: theme?.colors.error }} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
