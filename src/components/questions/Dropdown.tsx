import type { FormQuestion } from '../../types/form';
import type { ThemeConfig } from '../../types/theme';

interface DropdownProps {
  question: FormQuestion;
  value: string;
  onChange: (value: string) => void;
  onAutoAdvance?: () => void;
  error?: string;
  theme?: ThemeConfig;
}

export function Dropdown({ question, value, onChange, onAutoAdvance, error, theme }: DropdownProps) {
  const inputId = `question-${question.id}`;
  const errorId = `${inputId}-error`;
  const descriptionId = question.description ? `${inputId}-description` : undefined;

  const handleChange = (newValue: string) => {
    onChange(newValue);
    // Auto-advance after selection
    if (onAutoAdvance && newValue) {
      setTimeout(() => onAutoAdvance(), 400);
    }
  };

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

      <select
        id={inputId}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full px-4 py-3 text-base border-2 rounded-lg transition-all appearance-none cursor-pointer min-h-[48px]"
        style={{
          borderColor: error ? theme?.colors.error : theme?.colors.border,
          color: theme?.colors.text,
          backgroundColor: theme?.colors.surface,
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
          backgroundPosition: 'right 0.75rem center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '1.5em 1.5em',
          paddingRight: '2.5rem',
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
      >
        <option value="">Choose an option</option>
        {question.options?.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error && (
        <p id={errorId} className="text-sm" style={{ color: theme?.colors.error }} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
