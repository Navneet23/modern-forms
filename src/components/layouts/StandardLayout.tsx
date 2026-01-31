import { useState, useRef, useEffect } from 'react';
import type { ParsedForm, FormResponse } from '../../types/form';
import type { ThemeConfig, HeaderImageShape } from '../../types/theme';
import { HEADER_SHAPE_CLIP_PATHS } from '../creator/HeaderImagePicker';
import { defaultTheme } from '../../data/themes';
import { QuestionRenderer } from '../questions';
import { submitFormResponse } from '../../utils/formParser';
import { BackgroundEffectRenderer } from '../common/BackgroundEffectRenderer';

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
  const [isNarrow, setIsNarrow] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setIsNarrow(entry.contentRect.width < 500);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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

  // Blend primary (45%) and background (55%) for the title card tint
  const blendColors = (hex1: string, hex2: string, weight: number): string => {
    const h1 = hex1.replace('#', '');
    const h2 = hex2.replace('#', '');
    const r = Math.round(parseInt(h1.substring(0, 2), 16) * weight + parseInt(h2.substring(0, 2), 16) * (1 - weight));
    const g = Math.round(parseInt(h1.substring(2, 4), 16) * weight + parseInt(h2.substring(2, 4), 16) * (1 - weight));
    const b = Math.round(parseInt(h1.substring(4, 6), 16) * weight + parseInt(h2.substring(4, 6), 16) * (1 - weight));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  const titleCardBg = blendColors(theme.colors.primary, theme.colors.background, 0.45);

  // Determine contrast text color for the title card
  const getTitleTextColor = (bgHex: string): string => {
    const hex = bgHex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    const toLinear = (c: number) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    const luminance = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
    return luminance > 0.4 ? theme.colors.text : '#FFFFFF';
  };

  const titleTextColor = getTitleTextColor(titleCardBg);

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
      ref={containerRef}
      className="min-h-screen relative"
      style={{
        backgroundColor: hasBackgroundImage ? 'transparent' : theme.colors.background,
      }}
    >
      {/* Background layers (image or effect) */}
      <BackgroundLayers />

      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Banner style: full-width image above the constrained content */}
      {displayHeaderImage && (theme.headerStyle === 'banner' || !theme.headerStyle) && (
        <div className="relative z-10">
          <div className="overflow-hidden shadow-md">
            <img
              src={displayHeaderImage}
              alt=""
              className="w-full object-cover"
              style={{ aspectRatio: '16 / 5' }}
              aria-hidden="true"
            />
          </div>
        </div>
      )}

      {/* Content layer */}
      <main
        id="main-content"
        className={`max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 ${
          displayHeaderImage && (theme.headerStyle === 'banner' || !theme.headerStyle)
            ? 'pt-0 pb-8'
            : 'py-8'
        }`}
      >
        {/* Header */}
        <header className="mb-8">
          {/* Banner style: title card overlapping the banner image */}
          {displayHeaderImage && (theme.headerStyle === 'banner' || !theme.headerStyle) && (
            <div
              className="rounded-2xl shadow-md p-6 sm:p-8 -mt-12 relative z-10"
              style={{ backgroundColor: titleCardBg }}
            >
              <h1
                className="text-3xl sm:text-4xl font-bold mb-2"
                style={{ color: titleTextColor, fontFamily: theme.fontFamily }}
              >
                {form.title}
              </h1>
              {form.description && (
                <p
                  className="text-base sm:text-lg"
                  style={{ color: titleTextColor, opacity: 0.85, fontFamily: theme.fontFamily }}
                >
                  {form.description}
                </p>
              )}
            </div>
          )}

          {/* Integrated style: image above card when narrow, side-by-side when wide */}
          {displayHeaderImage && theme.headerStyle === 'integrated' && isNarrow && (
            <div className="flex flex-col items-center">
              {/* Shaped image floating above */}
              <div
                className="w-40 h-40 flex-shrink-0 relative z-10"
                style={{
                  clipPath: HEADER_SHAPE_CLIP_PATHS[theme.headerImageShape || 'blob'],
                }}
              >
                <img
                  src={displayHeaderImage}
                  alt=""
                  className="w-full h-full"
                  style={{
                    objectFit: 'cover',
                    objectPosition: theme.headerImageCrop
                      ? `${theme.headerImageCrop.x}% ${theme.headerImageCrop.y}%`
                      : '50% 50%',
                    transform: theme.headerImageCrop
                      ? `scale(${theme.headerImageCrop.scale})`
                      : undefined,
                    transformOrigin: theme.headerImageCrop
                      ? `${theme.headerImageCrop.x}% ${theme.headerImageCrop.y}%`
                      : undefined,
                  }}
                  aria-hidden="true"
                />
              </div>
              {/* Title card overlapping the image */}
              <div
                className="rounded-2xl shadow-md p-6 w-full -mt-8"
                style={{ backgroundColor: titleCardBg }}
              >
                <h1
                  className="text-3xl font-bold mb-2 pt-4"
                  style={{ color: titleTextColor, fontFamily: theme.fontFamily }}
                >
                  {form.title}
                </h1>
                {form.description && (
                  <p
                    className="text-base"
                    style={{ color: titleTextColor, opacity: 0.85, fontFamily: theme.fontFamily }}
                  >
                    {form.description}
                  </p>
                )}
              </div>
            </div>
          )}

          {displayHeaderImage && theme.headerStyle === 'integrated' && !isNarrow && (
            <div
              className="rounded-2xl shadow-md overflow-hidden relative"
              style={{ backgroundColor: titleCardBg, padding: '2rem' }}
            >
              {/* Wide: text left, shaped image right */}
              <div className="relative z-10 pr-[45%]" style={{ minHeight: '160px' }}>
                    <h1
                      className="text-4xl font-bold mb-2"
                      style={{ color: titleTextColor, fontFamily: theme.fontFamily }}
                    >
                      {form.title}
                    </h1>
                    {form.description && (
                      <p
                        className="text-lg"
                        style={{ color: titleTextColor, opacity: 0.85, fontFamily: theme.fontFamily }}
                      >
                        {form.description}
                      </p>
                    )}
                  </div>
                  <div
                    className="absolute top-0 right-0 w-[45%] h-full"
                    style={{
                      clipPath: HEADER_SHAPE_CLIP_PATHS[theme.headerImageShape || 'blob'],
                    }}
                  >
                    <img
                      src={displayHeaderImage}
                      alt=""
                      className="w-full h-full"
                      style={{
                        objectFit: 'cover',
                        objectPosition: theme.headerImageCrop
                          ? `${theme.headerImageCrop.x}% ${theme.headerImageCrop.y}%`
                          : '50% 50%',
                        transform: theme.headerImageCrop
                          ? `scale(${theme.headerImageCrop.scale})`
                          : undefined,
                        transformOrigin: theme.headerImageCrop
                          ? `${theme.headerImageCrop.x}% ${theme.headerImageCrop.y}%`
                          : undefined,
                      }}
                      aria-hidden="true"
                    />
                  </div>
            </div>
          )}

          {/* No header image: default title card */}
          {!displayHeaderImage && (
            <div
              className="rounded-2xl shadow-md p-6 sm:p-8"
              style={{ backgroundColor: titleCardBg }}
            >
              <h1
                className="text-3xl sm:text-4xl font-bold mb-2"
                style={{ color: titleTextColor, fontFamily: theme.fontFamily }}
              >
                {form.title}
              </h1>
              {form.description && (
                <p
                  className="text-base sm:text-lg"
                  style={{ color: titleTextColor, opacity: 0.85, fontFamily: theme.fontFamily }}
                >
                  {form.description}
                </p>
              )}
            </div>
          )}
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
