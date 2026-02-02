import { useState, useEffect, useCallback, useRef } from 'react';
import type { ParsedForm, FormResponse } from '../../types/form';
import type { ThemeConfig } from '../../types/theme';
import { isSingleSelectQuestion } from '../../types/form';
import { defaultTheme } from '../../data/themes';
import { QuestionRenderer } from '../questions';
import { submitFormResponse } from '../../utils/formParser';
import { BackgroundEffectRenderer } from '../common/BackgroundEffectRenderer';
import { HEADER_SHAPE_CLIP_PATHS } from '../creator/HeaderImagePicker';

interface QuestionByQuestionLayoutProps {
  form: ParsedForm;
  theme?: ThemeConfig;
  headerImageUrl?: string;
  isPreview?: boolean;
  previewMode?: 'desktop' | 'mobile';
  onSubmitSuccess?: () => void;
}

type ViewState = 'welcome' | 'questions' | 'review' | 'success';

export function QuestionByQuestionLayout({
  form,
  theme = defaultTheme,
  headerImageUrl,
  isPreview,
  previewMode,
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

  // Track header image aspect ratio for crop calculations
  const [headerImgAspect, setHeaderImgAspect] = useState(1);
  useEffect(() => {
    if (!displayHeaderImage) return;
    const img = new Image();
    img.onload = () => setHeaderImgAspect(img.naturalWidth / img.naturalHeight);
    img.src = displayHeaderImage;
  }, [displayHeaderImage]);

  // Compute image positioning for shaped/cropped header images
  const getIntegratedImageStyle = (): React.CSSProperties => {
    const crop = theme.headerImageCrop;
    if (!crop) return { objectFit: 'cover' as const, objectPosition: '50% 50%', width: '100%', height: '100%' };

    const coverW = Math.max(1, headerImgAspect);
    const coverH = Math.max(1, 1 / headerImgAspect);

    const safeX = Math.max(1, Math.min(99, crop.x));
    const safeY = Math.max(1, Math.min(99, crop.y));
    const cs = Math.max(
      1,
      50 / (safeX * coverW),
      50 / ((100 - safeX) * coverW),
      50 / (safeY * coverH),
      50 / ((100 - safeY) * coverH)
    );

    return {
      position: 'absolute' as const,
      maxWidth: 'none',
      width: `${coverW * cs * 100}%`,
      height: `${coverH * cs * 100}%`,
      left: `${50 - crop.x * coverW * cs}%`,
      top: `${50 - crop.y * coverH * cs}%`,
      transform: `scale(${crop.scale})`,
      transformOrigin: `${crop.x}% ${crop.y}%`,
    };
  };

  const currentQuestion = form.questions[currentIndex];
  const totalQuestions = form.questions.length;
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  // Use absolute positioning in preview mode to stay within container
  const positionClass = isPreview ? 'absolute' : 'fixed';

  // Determine contrasting text color based on background luminance.
  // Manual override first, then luminance check on theme background color
  // (which is a reasonable proxy for image tone since themes pair colors with images).
  const getWelcomeTextColor = () => {
    if (theme.welcomeTitleLight) return '#FFFFFF';
    const hex = theme.colors.background.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    const toLinear = (c: number) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    const luminance = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
    return luminance > 0.5 ? theme.colors.primary : '#FFFFFF';
  };
  const welcomeTextColor = getWelcomeTextColor();

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
        primaryColor={theme.colors.primary}
        secondaryColor={theme.colors.secondary}
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
    const hasHeaderImage = !!displayHeaderImage && !!theme.headerStyle;
    // In creator studio preview, use previewMode; on actual page, use viewport width
    const isMobile = previewMode ? previewMode === 'mobile' : typeof window !== 'undefined' && window.innerWidth < 768;

    // Banner style: full-width strip at top, centered content below
    if (hasHeaderImage && theme.headerStyle === 'banner') {
      return (
        <div
          className="min-h-screen flex flex-col relative"
          style={{ backgroundColor: hasBackgroundImage ? 'transparent' : theme.colors.background }}
        >
          <BackgroundLayers />

          <div className="relative z-10 flex flex-col items-center">
            {/* Banner image */}
            <div className="w-full" style={{ maxHeight: '30vh', overflow: 'hidden' }}>
              <img
                src={displayHeaderImage}
                alt=""
                className="w-full h-full object-cover object-center"
                aria-hidden="true"
              />
            </div>

            {/* Centered content below banner */}
            <div className="max-w-2xl w-full text-center px-4 py-12">
              <h1
                className="text-5xl sm:text-6xl font-bold mb-6"
                style={{ color: welcomeTextColor, fontFamily: theme.fontFamily }}
              >
                {form.title}
              </h1>
              {form.description && (
                <p
                  className="text-xl sm:text-2xl mb-8"
                  style={{ color: welcomeTextColor, opacity: 0.9 }}
                >
                  {form.description}
                </p>
              )}

              <div
                className="mx-auto mb-8 max-w-lg"
                style={{ borderBottom: `1px solid ${welcomeTextColor}40` }}
              />

              <p className="text-sm mb-6" style={{ color: welcomeTextColor, opacity: 0.7 }}>
                {totalQuestions} questions
              </p>

              <button
                onClick={() => setViewState('questions')}
                className="px-16 py-4 text-lg font-medium text-white rounded-lg transition-all min-h-[48px]"
                style={{ backgroundColor: theme.colors.primary }}
              >
                Start
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Circle style: mobile = circle on top + text below; desktop = text left + circle right
    if (hasHeaderImage && theme.headerStyle === 'integrated') {
      return (
        <div
          className={`min-h-screen flex relative ${isMobile ? 'flex-col' : 'flex-row'}`}
          style={{ backgroundColor: hasBackgroundImage ? 'transparent' : theme.colors.background }}
        >
          <BackgroundLayers />

          {/* Mobile: circle at top */}
          {isMobile && (
            <div className="flex relative z-10 justify-center pt-10 pb-4">
              <div
                className="relative overflow-hidden"
                style={{
                  width: '60%',
                  maxWidth: '280px',
                  aspectRatio: '1',
                  clipPath: HEADER_SHAPE_CLIP_PATHS['circle'],
                }}
              >
                <img
                  src={displayHeaderImage}
                  alt=""
                  style={getIntegratedImageStyle()}
                  aria-hidden="true"
                />
              </div>
            </div>
          )}

          {/* Text content: centered on mobile, left-half on desktop */}
          <div className={`relative z-10 flex items-center justify-center p-8 ${isMobile ? 'w-full' : 'w-1/2'}`}>
            <div className={`max-w-lg w-full ${isMobile ? 'text-center' : 'text-left'}`}>
              <h1
                className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6"
                style={{ color: welcomeTextColor, fontFamily: theme.fontFamily }}
              >
                {form.title}
              </h1>
              {form.description && (
                <p
                  className="text-lg sm:text-xl mb-6"
                  style={{ color: welcomeTextColor, opacity: 0.9 }}
                >
                  {form.description}
                </p>
              )}

              <p className="text-sm mb-6" style={{ color: welcomeTextColor, opacity: 0.7 }}>
                {totalQuestions} questions
              </p>

              <button
                onClick={() => setViewState('questions')}
                className="px-16 py-4 text-lg font-medium text-white rounded-lg transition-all min-h-[48px]"
                style={{ backgroundColor: theme.colors.primary }}
              >
                Start
              </button>
            </div>
          </div>

          {/* Desktop: circle on right half */}
          {!isMobile && (
            <div className="flex relative z-10 w-1/2 items-center justify-center">
              <div
                className="relative overflow-hidden"
                style={{
                  width: '50vw',
                  maxWidth: '600px',
                  aspectRatio: '1',
                  clipPath: HEADER_SHAPE_CLIP_PATHS['circle'],
                }}
              >
                <img
                  src={displayHeaderImage}
                  alt=""
                  style={getIntegratedImageStyle()}
                  aria-hidden="true"
                />
              </div>
            </div>
          )}
        </div>
      );
    }

    // Half Card style: split layout with text left, full-height rectangular image right
    // On mobile, drop the image and show centered text only
    if (hasHeaderImage && theme.headerStyle === 'half-card') {
      const crop = theme.headerImageCrop;
      const cropStyle: React.CSSProperties = crop
        ? {
            objectFit: 'cover' as const,
            objectPosition: `${crop.x}% ${crop.y}%`,
            transform: crop.scale > 1 ? `scale(${crop.scale})` : undefined,
            transformOrigin: `${crop.x}% ${crop.y}%`,
          }
        : { objectFit: 'cover' as const, objectPosition: '50% 50%' };

      return (
        <div
          className={`min-h-screen flex relative ${isMobile ? 'items-center justify-center' : ''}`}
          style={{ backgroundColor: hasBackgroundImage ? 'transparent' : theme.colors.background }}
        >
          <BackgroundLayers />

          {/* Text content: full-width centered on mobile, left half on desktop */}
          <div className={`relative z-10 flex items-center justify-center p-8 ${isMobile ? 'w-full' : 'w-1/2'}`}>
            <div className={`max-w-lg w-full ${isMobile ? 'text-center' : 'text-left'}`}>
              <h1
                className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6"
                style={{ color: welcomeTextColor, fontFamily: theme.fontFamily }}
              >
                {form.title}
              </h1>
              {form.description && (
                <p
                  className="text-lg sm:text-xl mb-6"
                  style={{ color: welcomeTextColor, opacity: 0.9 }}
                >
                  {form.description}
                </p>
              )}

              <p className="text-sm mb-6" style={{ color: welcomeTextColor, opacity: 0.7 }}>
                {totalQuestions} questions
              </p>

              <button
                onClick={() => setViewState('questions')}
                className="px-16 py-4 text-lg font-medium text-white rounded-lg transition-all min-h-[48px]"
                style={{ backgroundColor: theme.colors.primary }}
              >
                Start
              </button>
            </div>
          </div>

          {/* Right half: full-height rectangular image (desktop only) */}
          {!isMobile && (
            <div className="relative z-10 w-1/2">
              <div className="absolute inset-2 rounded-2xl overflow-hidden shadow-lg">
                <img
                  src={displayHeaderImage}
                  alt=""
                  className="w-full h-full"
                  style={cropStyle}
                  aria-hidden="true"
                />
              </div>
            </div>
          )}
        </div>
      );
    }

    // Default: no header image or no headerStyle — centered welcome screen
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4 relative"
        style={{ backgroundColor: hasBackgroundImage ? 'transparent' : theme.colors.background }}
      >
        <BackgroundLayers />

        <div className="max-w-2xl w-full relative z-10 text-center">
          {displayHeaderImage && (
            <div className="mb-8 rounded-2xl overflow-hidden shadow-lg">
              <img src={displayHeaderImage} alt="" className="w-full h-48 object-cover" aria-hidden="true" />
            </div>
          )}

          <h1
            className="text-5xl sm:text-6xl font-bold mb-6"
            style={{ color: welcomeTextColor, fontFamily: theme.fontFamily }}
          >
            {form.title}
          </h1>
          {form.description && (
            <p
              className="text-xl sm:text-2xl mb-8"
              style={{ color: welcomeTextColor, opacity: 0.9 }}
            >
              {form.description}
            </p>
          )}

          <div
            className="mx-auto mb-8 max-w-lg"
            style={{ borderBottom: `1px solid ${welcomeTextColor}40` }}
          />

          <p className="text-sm mb-6" style={{ color: welcomeTextColor, opacity: 0.7 }}>
            {totalQuestions} questions
          </p>

          <button
            onClick={() => setViewState('questions')}
            className="px-16 py-4 text-lg font-medium text-white rounded-lg transition-all min-h-[48px]"
            style={{ backgroundColor: theme.colors.primary }}
          >
            Start
          </button>
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
        <div className="max-w-xl w-full">
          <h1
            className="text-5xl sm:text-6xl font-bold text-center mb-6"
            style={{ color: welcomeTextColor }}
          >
            {form.title}
          </h1>
          <div
            ref={questionRef}
            className={`w-full rounded-2xl shadow-lg p-6 sm:p-8 ${
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
