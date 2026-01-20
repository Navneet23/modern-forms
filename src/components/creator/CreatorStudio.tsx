import { useState, useCallback } from 'react';
import type { ParsedForm, LayoutMode, FormConfig } from '../../types/form';
import type { ThemeConfig, ThemeColors } from '../../types/theme';
import { defaultTheme } from '../../data/themes';
import { ThemeSelector } from './ThemeSelector';
import { ColorCustomizer } from './ColorCustomizer';
import { BackgroundImagePicker } from './BackgroundImagePicker';
import { generateThemeFromForm } from '../../utils/imageSearch';
import { saveFormConfig } from '../../utils/storage';
import { StandardLayout } from '../layouts/StandardLayout';
import { QuestionByQuestionLayout } from '../layouts/QuestionByQuestionLayout';

interface CreatorStudioProps {
  form: ParsedForm;
  onBack: () => void;
}

type PreviewMode = 'desktop' | 'mobile';

export function CreatorStudio({ form, onBack }: CreatorStudioProps) {
  // Theme state for each layout
  const [standardTheme, setStandardTheme] = useState<ThemeConfig>(defaultTheme);
  const [qbyqTheme, setQbyqTheme] = useState<ThemeConfig>(defaultTheme);

  // Current layout being edited
  const [activeLayout, setActiveLayout] = useState<LayoutMode>('standard');

  // Preview mode
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');

  // UI state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // Get current theme based on active layout
  const currentTheme = activeLayout === 'standard' ? standardTheme : qbyqTheme;
  const setCurrentTheme = activeLayout === 'standard' ? setStandardTheme : setQbyqTheme;

  // Handle theme selection
  const handleSelectTheme = useCallback((theme: ThemeConfig) => {
    setCurrentTheme(theme);
    setGenerateError(null);
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

  // Handle generate theme
  const handleGenerateTheme = useCallback(async () => {
    setIsGenerating(true);
    setGenerateError(null);

    try {
      const { theme, error } = await generateThemeFromForm(form.title, form.description);
      setCurrentTheme(theme);

      if (error) {
        setGenerateError(error);
      }
    } catch (err) {
      setGenerateError('Failed to generate theme. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [form.title, form.description, setCurrentTheme]);

  // Handle create & copy
  const handleCreateAndCopy = useCallback(() => {
    const config: FormConfig = {
      formId: form.id,
      parsedForm: form,
      layoutMode: activeLayout,
      headerImageUrl: currentTheme.headerImageUrl,
      createdAt: Date.now(),
    };

    // Add theme data to config (we'll need to extend FormConfig type)
    const extendedConfig = {
      ...config,
      standardTheme,
      questionByQuestionTheme: qbyqTheme,
    };

    const id = saveFormConfig(extendedConfig as FormConfig);
    const url = `${window.location.origin}${window.location.pathname}?f=${id}`;

    navigator.clipboard.writeText(url).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    });
  }, [form, activeLayout, currentTheme, standardTheme, qbyqTheme]);

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

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-72 bg-white border-r border-gray-200 flex flex-col overflow-hidden flex-shrink-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
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

            {/* Generate Theme Button */}
            <div className="space-y-2">
              <button
                onClick={handleGenerateTheme}
                disabled={isGenerating}
                className={`
                  w-full py-2.5 px-4 rounded-lg font-medium text-sm transition-all
                  flex items-center justify-center gap-2
                  ${isGenerating
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                  }
                `}
              >
                {isGenerating ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    Generate Theme
                  </>
                )}
              </button>

              {generateError && (
                <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">
                  {generateError}
                </p>
              )}
            </div>

            {/* Background Image Picker */}
            <BackgroundImagePicker
              currentImageUrl={currentTheme.backgroundImageUrl}
              onImageSelect={handleBackgroundImageChange}
            />

            {/* Color Customizer */}
            <ColorCustomizer
              colors={currentTheme.colors}
              onColorChange={handleColorChange}
            />
          </div>
        </aside>

        {/* Main Preview Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Preview Toggle */}
          <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-center gap-2 flex-shrink-0">
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

          {/* Preview Frame */}
          <div className="flex-1 overflow-auto p-6 flex items-start justify-center">
            <div
              className={`
                bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-300
                ${previewMode === 'mobile'
                  ? 'w-[375px] h-[700px]'
                  : 'w-full max-w-4xl h-full'
                }
              `}
              style={previewMode === 'mobile' ? {
                boxShadow: '0 0 0 12px #1f2937, 0 0 0 14px #374151, 0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                borderRadius: '36px',
              } : undefined}
            >
              <div className="w-full h-full overflow-auto">
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
