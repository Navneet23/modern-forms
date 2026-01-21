import { useState, useEffect, useCallback, useRef } from 'react';
import type { ParsedForm, FormResponse } from '../../types/form';
import type { ThemeConfig } from '../../types/theme';
import { isSingleSelectQuestion } from '../../types/form';
import { defaultTheme } from '../../data/themes';
import { QuestionRenderer } from '../questions';
import { submitFormResponse } from '../../utils/formParser';
import { BackgroundEffectRenderer } from '../common/BackgroundEffectRenderer';

interface QuestionByQuestionLayoutProps {
  form: ParsedForm;
  theme?: ThemeConfig;
  headerImageUrl?: string;
  isPreview?: boolean;
  onSubmitSuccess?: () => void;
}

type ViewState = 'welcome' | 'questions' | 'review' | 'success';

export function QuestionByQuestionLayout({
  form,
  theme = defaultTheme,
  headerImageUrl,
  isPreview,
  onSubmitSuccess,
}: QuestionByQuestionLayoutProps) {
  const [viewState, setViewState] = useState<ViewState>('welcome');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<FormResponse>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [isAnimating, setIsAnimating] = useState(false);

  const questionRef = useRef<HTMLDivElement>(null);

  // Use theme header image if available
  const displayHeaderImage = headerImageUrl || theme.headerImageUrl;
  const hasBackgroundImage = !!theme.backgroundImageUrl;

  const currentQuestion = form.questions[currentIndex];
  const totalQuestions = form.questions.length;
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  // Use absolute positioning in preview mode to stay within container
  const positionClass = isPreview ? 'absolute' : 'fixed';

  // Background layers component - handles both image and effect backgrounds
  const BackgroundLayers = () => {
    if (hasBackgroundImage) {
      return (
        <div
          className={`${positionClass} inset-0 bg-cover bg-center bg-no-repeat`}
          style={{
            backgroundImage: `url(${theme.backgroundImageUrl})`,
          }}
          aria-hidden="true"
        />
      );
    }

    // Render background effect when no image is selected
    return (
      <BackgroundEffectRenderer
        effect={theme.backgroundEffect || 'solid'}
        backgroundColor={theme.colors.background}
        positionClass={positionClass}
      />
    );
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewState !== 'questions' || isAnimating) return;

      if (e.key === 'Enter' && !e.shiftKey) {
        // Don't advance on Enter for text areas
        const activeElement = document.activeElement;
        if (activeElement?.tagName === 'TEXTAREA') return;

        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewState, currentIndex, isAnimating]);

  // Focus management
  useEffect(() => {
    if (viewState === 'questions' && questionRef.current) {
      const focusable = questionRef.current.querySelector<HTMLElement>(
        'input, textarea, select, button, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable) {
        setTimeout(() => focusable.focus(), 300);
      }
    }
  }, [currentIndex, viewState]);

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

  const validateCurrentQuestion = (): boolean => {
    if (!currentQuestion.required) return true;

    const response = responses[currentQuestion.id];
    const isEmpty = !response || (Array.isArray(response) && response.length === 0);

    if (isEmpty) {
      setErrors((prev) => ({
        ...prev,
        [currentQuestion.id]: 'This question is required',
      }));
      return false;
    }

    return true;
  };

  const animateTransition = useCallback((newIndex: number, dir: 'forward' | 'back') => {
    setIsAnimating(true);
    setDirection(dir);
    setTimeout(() => {
      setCurrentIndex(newIndex);
      setIsAnimating(false);
    }, 300);
  }, []);

  const handleNext = useCallback(() => {
    if (isAnimating) return;

    if (!validateCurrentQuestion()) return;

    if (currentIndex < totalQuestions - 1) {
      animateTransition(currentIndex + 1, 'forward');
    } else {
      setViewState('review');
    }
  }, [currentIndex, totalQuestions, isAnimating, animateTransition]);

  const handlePrevious = useCallback(() => {
    if (isAnimating) return;

    if (currentIndex > 0) {
      animateTransition(currentIndex - 1, 'back');
    }
  }, [currentIndex, isAnimating, animateTransition]);

  const handleAutoAdvance = useCallback(() => {
    // Only auto-advance for single-select questions
    if (isSingleSelectQuestion(currentQuestion.type)) {
      handleNext();
    }
  }, [currentQuestion, handleNext]);

  const handleGoToQuestion = (index: number) => {
    setCurrentIndex(index);
    setViewState('questions');
  };

  const handleSubmit = async () => {
    if (isPreview) {
      alert('This is a preview. Responses are not submitted in preview mode.');
      return;
    }

    // Validate all required questions
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

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Go to first unanswered required question
      const firstErrorIndex = form.questions.findIndex((q) => newErrors[q.id]);
      if (firstErrorIndex >= 0) {
        setCurrentIndex(firstErrorIndex);
        setViewState('questions');
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

    if (success) {
      setViewState('success');
      if (onSubmitSuccess) onSubmitSuccess();
    } else {
      alert('Failed to submit. Please try again.');
    }
  };

  // Welcome Screen
  if (viewState === 'welcome') {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4 relative"
        style={{ backgroundColor: hasBackgroundImage ? 'transparent' : theme.colors.background }}
      >
        <BackgroundLayers />

        <div className="max-w-lg w-full relative z-10">
          {displayHeaderImage && (
            <div className="mb-6 rounded-2xl overflow-hidden shadow-lg">
              <img src={displayHeaderImage} alt="" className="w-full h-48 object-cover" aria-hidden="true" />
            </div>
          )}

          <div
            className="rounded-2xl shadow-lg p-8 text-center"
            style={{ backgroundColor: theme.colors.surface }}
          >
            <h1
              className="text-3xl font-bold mb-4"
              style={{ color: theme.colors.text }}
            >
              {form.title}
            </h1>
            {form.description && (
              <p
                className="text-lg mb-6"
                style={{ color: theme.colors.textSecondary }}
              >
                {form.description}
              </p>
            )}
            <p className="text-sm mb-8" style={{ color: theme.colors.textSecondary }}>
              {totalQuestions} questions
            </p>

            <button
              onClick={() => setViewState('questions')}
              className="px-8 py-4 text-lg font-medium text-white rounded-lg transition-all min-h-[48px]"
              style={{ backgroundColor: theme.colors.primary }}
            >
              Start
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success Screen
  if (viewState === 'success') {
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
            <svg className="w-8 h-8" fill="none" stroke={theme.colors.success} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2
            className="text-2xl font-bold mb-2"
            style={{ color: theme.colors.text }}
          >
            Response Submitted
          </h2>
          <p style={{ color: theme.colors.textSecondary }}>
            Thank you for completing this form.
          </p>
        </div>
      </div>
    );
  }

  // Review Screen
  if (viewState === 'review') {
    return (
      <div
        className="min-h-screen py-8 px-4 relative"
        style={{ backgroundColor: hasBackgroundImage ? 'transparent' : theme.colors.background }}
      >
        <BackgroundLayers />

        <div className="max-w-2xl mx-auto relative z-10">
          <div
            className="rounded-2xl shadow-lg p-6 sm:p-8"
            style={{ backgroundColor: theme.colors.surface }}
          >
            <h2
              className="text-2xl font-bold mb-6"
              style={{ color: theme.colors.text }}
            >
              Review Your Answers
            </h2>

            <div className="space-y-4">
              {form.questions.map((question, index) => {
                const response = responses[question.id];
                const displayValue = Array.isArray(response)
                  ? response.join(', ')
                  : response || '(Not answered)';

                return (
                  <button
                    key={question.id}
                    onClick={() => handleGoToQuestion(index)}
                    className="w-full text-left p-4 rounded-lg border-2 transition-all"
                    style={{
                      borderColor: theme.colors.border,
                      backgroundColor: 'transparent',
                    }}
                  >
                    <p className="text-sm mb-1" style={{ color: theme.colors.textSecondary }}>
                      Question {index + 1}
                    </p>
                    <p className="font-medium mb-2" style={{ color: theme.colors.text }}>
                      {question.title}
                    </p>
                    <p
                      className="text-sm"
                      style={{ color: response ? theme.colors.textSecondary : theme.colors.textSecondary + '80' }}
                    >
                      {displayValue}
                    </p>
                    {errors[question.id] && (
                      <p className="text-sm mt-1" style={{ color: theme.colors.error }}>
                        {errors[question.id]}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => {
                  setCurrentIndex(totalQuestions - 1);
                  setViewState('questions');
                }}
                className="px-6 py-3 border-2 rounded-lg transition-all min-h-[48px]"
                style={{
                  borderColor: theme.colors.border,
                  color: theme.colors.text,
                }}
              >
                Back to Questions
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 px-8 py-3 text-lg font-medium text-white rounded-lg transition-all min-h-[48px]"
                style={{
                  backgroundColor: isSubmitting ? theme.colors.textSecondary : theme.colors.primary,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                }}
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Questions Screen
  return (
    <div
      className="min-h-screen flex flex-col relative"
      style={{ backgroundColor: hasBackgroundImage ? 'transparent' : theme.colors.background }}
    >
      <BackgroundLayers />

      <a href="#question-content" className="skip-link">
        Skip to question
      </a>

      {/* Progress Bar */}
      <div
        className={`${positionClass} top-0 left-0 right-0 z-20 shadow-sm`}
        style={{ backgroundColor: theme.colors.surface }}
      >
        <div className="h-1" style={{ backgroundColor: theme.colors.border }}>
          <div
            className="h-full transition-all duration-300"
            style={{ width: `${progress}%`, backgroundColor: theme.colors.primary }}
          />
        </div>
        <div className="max-w-2xl mx-auto px-4 py-3 flex justify-between items-center">
          <span className="text-sm" style={{ color: theme.colors.textSecondary }}>
            Question {currentIndex + 1} of {totalQuestions}
          </span>
          <span className="text-sm font-medium" style={{ color: theme.colors.primary }}>
            {Math.round(progress)}% complete
          </span>
        </div>
      </div>

      {/* Question Content */}
      <main
        id="question-content"
        className="flex-1 flex items-center justify-center px-4 pt-20 pb-24 relative z-10"
      >
        <div
          ref={questionRef}
          className={`max-w-xl w-full rounded-2xl shadow-lg p-6 sm:p-8 ${
            isAnimating
              ? direction === 'forward'
                ? 'slide-exit-active'
                : 'slide-back-exit-active'
              : direction === 'forward'
              ? 'slide-enter-active'
              : 'slide-back-enter-active'
          }`}
          style={{ backgroundColor: theme.colors.surface }}
          role="region"
          aria-label={`Question ${currentIndex + 1}: ${currentQuestion.title}`}
        >
          <QuestionRenderer
            question={currentQuestion}
            value={responses[currentQuestion.id] || (currentQuestion.type === 'checkboxes' ? [] : '')}
            onChange={(value) => handleChange(currentQuestion.id, value)}
            onAutoAdvance={handleAutoAdvance}
            error={errors[currentQuestion.id]}
            theme={theme}
          />

          {/* Hint for single-select questions */}
          {isSingleSelectQuestion(currentQuestion.type) && (
            <p className="mt-4 text-sm italic" style={{ color: theme.colors.textSecondary }}>
              Select an option to continue automatically
            </p>
          )}
        </div>
      </main>

      {/* Navigation */}
      <nav
        className={`${positionClass} bottom-0 left-0 right-0 border-t shadow-lg z-20`}
        style={{
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        }}
      >
        <div className="max-w-2xl mx-auto px-4 py-4 flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-6 py-3 rounded-lg transition-all min-h-[48px]"
            style={{
              color: currentIndex === 0 ? theme.colors.border : theme.colors.text,
              cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
            }}
            aria-label="Previous question"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Previous</span>
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-3 text-white rounded-lg transition-all min-h-[48px]"
            style={{ backgroundColor: theme.colors.primary }}
            aria-label={currentIndex === totalQuestions - 1 ? 'Review answers' : 'Next question'}
          >
            <span>{currentIndex === totalQuestions - 1 ? 'Review' : 'Next'}</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </nav>
    </div>
  );
}
