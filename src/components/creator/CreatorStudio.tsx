import { useState, useCallback, useRef, useEffect } from 'react';
import type { ParsedForm, LayoutMode } from '../../types/form';
import type { ThemeConfig, ThemeColors, BackgroundEffect } from '../../types/theme';
import { defaultTheme } from '../../data/themes';
import { ThemeSelector } from './ThemeSelector';
import { ColorCustomizer } from './ColorCustomizer';
import { BackgroundImagePicker } from './BackgroundImagePicker';
import { BackgroundEffectPicker } from './BackgroundEffectPicker';
import { createShareableUrl, isBase64DataUrl } from '../../utils/urlSharing';
import { StandardLayout } from '../layouts/StandardLayout';
import { QuestionByQuestionLayout } from '../layouts/QuestionByQuestionLayout';

interface CreatorStudioProps {
  form: ParsedForm;
  originalFormUrl: string;
  onBack: () => void;
}

type PreviewMode = 'desktop' | 'mobile';

export function CreatorStudio({ form, originalFormUrl, onBack }: CreatorStudioProps) {
  // Single shared theme state across layouts - default to 'shapes' background effect
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>({
    ...defaultTheme,
    backgroundEffect: 'shapes',
  });

  // Current layout being edited
  const [activeLayout, setActiveLayout] = useState<LayoutMode>('standard');

  // Preview mode
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');

  // UI state
  const [copySuccess, setCopySuccess] = useState(false);
  const [imageWarning, setImageWarning] = useState(false);

  // Ref for the preview scroll container
  const previewScrollRef = useRef<HTMLDivElement>(null);

  // Scroll preview based on layout type
  useEffect(() => {
    const scrollContainer = previewScrollRef.current;
    if (!scrollContainer) return;

    // Small delay to ensure content is rendered
    const timeoutId = setTimeout(() => {
      if (activeLayout === 'standard') {
        // Standard layout: scroll to top
        scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        // Question by Question layout: scroll to middle
        const scrollHeight = scrollContainer.scrollHeight;
        const clientHeight = scrollContainer.clientHeight;
        const middlePosition = (scrollHeight - clientHeight) / 2;
        scrollContainer.scrollTo({ top: middlePosition, behavior: 'smooth' });
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [activeLayout, previewMode]);

  // Handle theme selection - preserve user's background effect, use theme's background image
  const handleSelectTheme = useCallback((theme: ThemeConfig) => {
    setCurrentTheme((prev) => ({
      ...theme,
      backgroundEffect: prev.backgroundEffect,
      backgroundImageUrl: theme.backgroundImageUrl, // Use theme's image or undefined
    }));
  }, [setCurrentTheme]);

  // Handle color customization
  const handleColorChange = useCallback((colorKey: keyof ThemeColors, value: string) => {
    setCurrentTheme((prev) => ({
      ...prev,
      id: `${prev.id}-custom`,
      colors: {
        ...prev.colors,
        [colorKey]: value,
      },
    }));
  }, [setCurrentTheme]);

  // Handle background image change
  const handleBackgroundImageChange = useCallback((url: string | undefined) => {
    setCurrentTheme((prev) => ({
      ...prev,
      id: prev.id.includes('-custom') ? prev.id : `${prev.id}-custom`,
      backgroundImageUrl: url,
    }));
  }, [setCurrentTheme]);

  // Handle background effect change
  const handleBackgroundEffectChange = useCallback((effect: BackgroundEffect) => {
    setCurrentTheme((prev) => ({
      ...prev,
      id: prev.id.includes('-custom') ? prev.id : `${prev.id}-custom`,
      backgroundEffect: effect,
    }));
  }, [setCurrentTheme]);

  // Handle create & copy - uses URL-based sharing (no localStorage)
  const handleCreateAndCopy = useCallback(() => {
    // Check if the background image is a base64 data URL (AI-generated or uploaded)
    const hasBase64Image = isBase64DataUrl(currentTheme.backgroundImageUrl);

    const url = createShareableUrl(originalFormUrl, activeLayout, currentTheme);

    navigator.clipboard.writeText(url).then(() => {
      setCopySuccess(true);
      // Show warning if base64 image won't be included in shared link
      if (hasBase64Image) {
        setImageWarning(true);
        setTimeout(() => setImageWarning(false), 5000);
      }
      setTimeout(() => setCopySuccess(false), 3000);
    });
  }, [originalFormUrl, activeLayout, currentTheme]);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-900 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <div className="h-4 w-px bg-gray-300" />
          <h1 className="font-semibold text-gray-900 truncate max-w-md">{form.title}</h1>
        </div>

        <button
          onClick={handleCreateAndCopy}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all
            ${copySuccess
              ? 'bg-green-500 text-white'
              : 'bg-blue-600 text-white hover:bg-blue-700'
            }
          `}
        >
          {copySuccess ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              Create & Copy Link
            </>
          )}
        </button>
      </header>

      {/* Warning toast for AI/uploaded images not included in shared link */}
      {imageWarning && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-50 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg shadow-lg flex items-start gap-3 max-w-md">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="text-sm">
            <p className="font-medium">Background image not included</p>
            <p className="mt-1 text-amber-700">AI-generated and uploaded images cannot be shared via URL. Recipients will see the background effect instead.</p>
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-72 bg-white border-r border-gray-200 flex flex-col overflow-hidden flex-shrink-0">
          <div className="flex-1 overflow-y-auto p-4 pb-16 space-y-6">
            {/* Layout Toggle */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700">Layout</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveLayout('standard')}
                  className={`
                    flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all
                    ${activeLayout === 'standard'
                      ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                      : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                    }
                  `}
                >
                  Standard
                </button>
                <button
                  onClick={() => setActiveLayout('question-by-question')}
                  className={`
                    flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all
                    ${activeLayout === 'question-by-question'
                      ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                      : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                    }
                  `}
                >
                  Q by Q
                </button>
              </div>
            </div>

            {/* Theme Selector */}
            <ThemeSelector
              selectedThemeId={currentTheme.id}
              onSelectTheme={handleSelectTheme}
            />

            {/* Background Image Picker */}
            <BackgroundImagePicker
              currentImageUrl={currentTheme.backgroundImageUrl}
              onImageSelect={handleBackgroundImageChange}
              formTitle={form.title}
              formDescription={form.description}
              themeColors={currentTheme.colors}
            />

            {/* Color Customizer */}
            <ColorCustomizer
              colors={currentTheme.colors}
              onColorChange={handleColorChange}
            />

            {/* Background Effect Picker */}
            <BackgroundEffectPicker
              selectedEffect={currentTheme.backgroundEffect || 'solid'}
              onEffectChange={handleBackgroundEffectChange}
              backgroundColor={currentTheme.colors.background}
              primaryColor={currentTheme.colors.primary}
              secondaryColor={currentTheme.colors.secondary}
              disabled={!!currentTheme.backgroundImageUrl}
            />
          </div>
        </aside>

        {/* Main Preview Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Preview Toggle */}
          <div className="bg-white border-b border-gray-200 px-4 py-2 flex flex-col items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewMode('desktop')}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                  ${previewMode === 'desktop'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Desktop
              </button>
              <button
                onClick={() => setPreviewMode('mobile')}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                  ${previewMode === 'mobile'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Mobile
              </button>
            </div>
            <p className="text-xs text-yellow-700 bg-yellow-50 px-3 py-1 rounded-full">
              Preview mode - responses will not be submitted
            </p>
          </div>

          {/* Preview Frame */}
          <div className={`flex-1 overflow-auto ${previewMode === 'mobile' ? 'p-6 flex items-start justify-center' : ''}`}>
            <div
              className={`
                bg-white overflow-hidden transition-all duration-300
                ${previewMode === 'mobile'
                  ? 'w-[375px] h-[700px] rounded-xl shadow-2xl'
                  : 'w-full h-full'
                }
              `}
              style={previewMode === 'mobile' ? {
                boxShadow: '0 0 0 12px #1f2937, 0 0 0 14px #374151, 0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                borderRadius: '36px',
              } : undefined}
            >
              <div ref={previewScrollRef} className="w-full h-full overflow-auto">
                <PreviewContent
                  form={form}
                  theme={currentTheme}
                  layout={activeLayout}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Separate component for preview content to enable theming
interface PreviewContentProps {
  form: ParsedForm;
  theme: ThemeConfig;
  layout: LayoutMode;
}

function PreviewContent({ form, theme, layout }: PreviewContentProps) {
  const style = {
    '--theme-primary': theme.colors.primary,
    '--theme-secondary': theme.colors.secondary,
    '--theme-background': theme.colors.background,
    '--theme-surface': theme.colors.surface,
    '--theme-text': theme.colors.text,
    '--theme-text-secondary': theme.colors.textSecondary,
    '--theme-border': theme.colors.border,
    '--theme-error': theme.colors.error,
    '--theme-success': theme.colors.success,
  } as React.CSSProperties;

  return (
    <div style={style}>
      {layout === 'standard' ? (
        <StandardLayout
          form={form}
          theme={theme}
          isPreview
        />
      ) : (
        <QuestionByQuestionLayout
          form={form}
          theme={theme}
          isPreview
        />
      )}
    </div>
  );
}
