import { useState } from 'react';
import type { ParsedForm, FormResponse } from '../../types/form';
import type { ThemeConfig } from '../../types/theme';
import { defaultTheme } from '../../data/themes';
import { QuestionRenderer } from '../questions';
import { submitFormResponse } from '../../utils/formParser';

interface StandardLayoutProps {
  form: ParsedForm;
  theme?: ThemeConfig;
  headerImageUrl?: string;
  isPreview?: boolean;
  onSubmitSuccess?: () => void;
}

export function StandardLayout({
  form,
  theme = defaultTheme,
  headerImageUrl,
  isPreview,
  onSubmitSuccess,
}: StandardLayoutProps) {
  const [responses, setResponses] = useState<FormResponse>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Use theme header image if available
  const displayHeaderImage = headerImageUrl || theme.headerImageUrl;
  const hasBackgroundImage = !!theme.backgroundImageUrl;

  const handleChange = (questionId: string, value: string | string[]) => {
    setResponses((prev) => ({ ...prev, [questionId]: value }));
    if (errors[questionId]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    form.questions.forEach((question) => {
      if (question.required) {
        const response = responses[question.id];
        const isEmpty = !response || (Array.isArray(response) && response.length === 0);
        if (isEmpty) {
          newErrors[question.id] = 'This question is required';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isPreview) {
      alert('This is a preview. Responses are not submitted in preview mode.');
      return;
    }

    if (!validateForm()) {
      const firstErrorId = Object.keys(errors)[0];
      if (firstErrorId) {
        document.getElementById(`question-${firstErrorId}`)?.focus();
      }
      return;
    }

    setIsSubmitting(true);

    const submissionData: { [entryId: string]: string | string[] } = {};
    form.questions.forEach((question) => {
      const response = responses[question.id];
      if (response !== undefined && response !== '') {
        submissionData[question.entryId] = response;
      }
    });

    const success = await submitFormResponse(form.submitUrl, submissionData);

    setIsSubmitting(false);
    setSubmitStatus(success ? 'success' : 'error');

    if (success && onSubmitSuccess) {
      onSubmitSuccess();
    }
  };

  // Use absolute positioning in preview mode to stay within container
  const positionClass = isPreview ? 'absolute' : 'fixed';

  // Background layers component - raw image, no overlay or blur
  const BackgroundLayers = () => {
    if (!hasBackgroundImage) return null;

    return (
      <div
        className={`${positionClass} inset-0 bg-cover bg-center bg-no-repeat`}
        style={{
          backgroundImage: `url(${theme.backgroundImageUrl})`,
        }}
        aria-hidden="true"
      />
    );
  };

  if (submitStatus === 'success') {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4 relative"
        style={{ backgroundColor: hasBackgroundImage ? 'transparent' : theme.colors.background }}
      >
        <BackgroundLayers />
        <div
          className="max-w-lg w-full rounded-2xl shadow-lg p-8 text-center relative z-10"
          style={{ backgroundColor: theme.colors.surface }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: theme.colors.success + '20' }}
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke={theme.colors.success}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: theme.colors.text }}>
            Response Submitted
          </h2>
          <p style={{ color: theme.colors.textSecondary }}>
            Thank you for completing this form.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundColor: hasBackgroundImage ? 'transparent' : theme.colors.background,
      }}
    >
      {/* Background layers (image + overlay) */}
      <BackgroundLayers />

      {/* Fallback solid background when no image */}
      {!hasBackgroundImage && (
        <div
          className={`${positionClass} inset-0`}
          style={{ backgroundColor: theme.colors.background }}
          aria-hidden="true"
        />
      )}

      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Content layer */}
      <main id="main-content" className="max-w-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <header className="mb-8">
          {displayHeaderImage && (
            <div className="mb-6 rounded-2xl overflow-hidden shadow-md">
              <img
                src={displayHeaderImage}
                alt=""
                className="w-full h-48 object-cover"
                aria-hidden="true"
              />
            </div>
          )}

          <div
            className="rounded-2xl shadow-md p-6 sm:p-8"
            style={{
              backgroundColor: theme.colors.surface,
              borderTop: `4px solid ${theme.colors.primary}`,
            }}
          >
            <h1
              className="text-2xl sm:text-3xl font-bold mb-2"
              style={{ color: theme.colors.text }}
            >
              {form.title}
            </h1>
            {form.description && (
              <p className="text-base sm:text-lg" style={{ color: theme.colors.textSecondary }}>
                {form.description}
              </p>
            )}
            {isPreview && (
              <div className="mt-4 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Preview Mode - Responses will not be submitted
                </p>
              </div>
            )}
          </div>
        </header>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-6">
            {form.questions.map((question, index) => (
              <div
                key={question.id}
                className="rounded-2xl shadow-md p-6 sm:p-8 transition-all hover:shadow-lg"
                style={{ backgroundColor: theme.colors.surface }}
              >
                <QuestionRenderer
                  question={question}
                  value={responses[question.id] || (question.type === 'checkboxes' ? [] : '')}
                  onChange={(value) => handleChange(question.id, value)}
                  error={errors[question.id]}
                  theme={theme}
                />
                <div className="sr-only">Question {index + 1} of {form.questions.length}</div>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex justify-between items-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 text-lg font-medium text-white rounded-lg transition-all min-h-[48px] min-w-[120px]"
              style={{
                backgroundColor: isSubmitting ? theme.colors.textSecondary : theme.colors.primary,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>

            {submitStatus === 'error' && (
              <p className="text-sm" style={{ color: theme.colors.error }} role="alert">
                Failed to submit. Please try again.
              </p>
            )}
          </div>
        </form>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm" style={{ color: theme.colors.textSecondary }}>
          <p>Powered by Modern Forms</p>
        </footer>
      </main>
    </div>
  );
}
