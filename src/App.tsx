import { useState, useEffect } from 'react';
import type { ParsedForm, FormConfig, LayoutMode } from './types/form';
import type { ThemeConfig } from './types/theme';
import { defaultTheme } from './data/themes';
import { fetchGoogleForm, parseGoogleFormHtml } from './utils/formParser';
import { getFormConfig } from './utils/storage';
import {
  getEncodedDataFromUrl,
  decodeFormConfig,
  shareableToThemeConfig,
  shareableToLayoutMode,
} from './utils/urlSharing';
import { FormUrlInput, CreatorStudio } from './components/creator';
import { StandardLayout, QuestionByQuestionLayout } from './components/layouts';

type AppView = 'input' | 'creator' | 'respond';

// Check if URL has form data parameters (checked synchronously to avoid flash)
function hasFormDataInUrl(): boolean {
  const params = new URLSearchParams(window.location.search);
  return params.has('d') || params.has('f');
}

function App() {
  const [view, setView] = useState<AppView>('input');
  const [parsedForm, setParsedForm] = useState<ParsedForm | null>(null);
  const [formConfig, setFormConfig] = useState<FormConfig | null>(null);
  const [originalFormUrl, setOriginalFormUrl] = useState<string>('');
  const [sharedTheme, setSharedTheme] = useState<ThemeConfig | null>(null);
  const [sharedLayoutMode, setSharedLayoutMode] = useState<LayoutMode | null>(null);
  // Start with loading if URL has form data, to prevent homepage flash
  const [isLoading, setIsLoading] = useState(hasFormDataInUrl);
  const [error, setError] = useState('');

  // Check URL for form data on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    // Allow ?reset to clear all saved forms and start fresh
    if (params.has('reset')) {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('modern-forms-')) {
          localStorage.removeItem(key);
        }
      });
      window.history.replaceState({}, '', window.location.pathname);
      return;
    }

    // Allow ?new to force fresh start
    if (params.has('new')) {
      window.history.replaceState({}, '', window.location.pathname);
      return;
    }

    // Check for new URL-based sharing (?d= parameter)
    const encodedData = getEncodedDataFromUrl();
    if (encodedData) {
      const sharedConfig = decodeFormConfig(encodedData);
      if (sharedConfig) {
        // Load form from the shared URL
        setIsLoading(true);
        setError('');

        fetchGoogleForm(sharedConfig.u)
          .then(html => {
            const form = parseGoogleFormHtml(html, sharedConfig.u);
            if (form.questions.length === 0) {
              throw new Error('Could not parse form questions.');
            }
            setParsedForm(form);
            setOriginalFormUrl(sharedConfig.u);
            setSharedTheme(shareableToThemeConfig(sharedConfig));
            setSharedLayoutMode(shareableToLayoutMode(sharedConfig));
            setView('respond');
          })
          .catch(err => {
            console.error('Failed to load shared form:', err);
            setError('Failed to load form. The link may be invalid or expired.');
          })
          .finally(() => {
            setIsLoading(false);
          });
        return;
      } else {
        setError('Form link is invalid or has expired (links expire after 7 days).');
        setIsLoading(false);
        return;
      }
    }

    // Legacy: Check for old localStorage-based sharing (?f= parameter)
    const formId = params.get('f');
    if (formId) {
      const config = getFormConfig(formId);
      if (config) {
        setFormConfig(config);
        setParsedForm(config.parsedForm);
        setView('respond');
      } else {
        setError('Form not found. Legacy links may no longer work.');
      }
      setIsLoading(false);
    }
  }, []);

  const handleUrlSubmit = async (url: string) => {
    setIsLoading(true);
    setError('');

    try {
      const html = await fetchGoogleForm(url);
      const form = parseGoogleFormHtml(html, url);

      if (form.questions.length === 0) {
        throw new Error('Could not parse form questions. Please check the URL and try again.');
      }

      setParsedForm(form);
      setOriginalFormUrl(url);
      setView('creator');
    } catch (err) {
      console.error('Failed to fetch form:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load form. Please check the URL and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setParsedForm(null);
    setFormConfig(null);
    setOriginalFormUrl('');
    setSharedTheme(null);
    setSharedLayoutMode(null);
    setError('');
    setView('input');

    // Clear URL params
    window.history.replaceState({}, '', window.location.pathname);
  };

  // Respondent view - render the form with saved theme
  // Supports both new URL-based sharing and legacy localStorage-based sharing
  if (view === 'respond' && parsedForm) {
    // Use shared theme/layout from URL, or fall back to legacy formConfig, or defaults
    const theme = sharedTheme || (formConfig?.theme as ThemeConfig) || defaultTheme;

    // Load Google Font for shared forms
    const fontName = theme.fontFamily.split(',')[0].replace(/'/g, '').trim();
    if (fontName && fontName !== 'system-ui') {
      const linkId = `google-font-${fontName.replace(/\s+/g, '-')}`;
      if (!document.getElementById(linkId)) {
        const link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@400;500;600;700&display=swap`;
        document.head.appendChild(link);
      }
    }
    const layoutMode = sharedLayoutMode || formConfig?.layoutMode || 'standard';
    const headerImageUrl = formConfig?.headerImageUrl;

    return layoutMode === 'standard' ? (
      <StandardLayout
        form={parsedForm}
        theme={theme}
        headerImageUrl={headerImageUrl}
      />
    ) : (
      <QuestionByQuestionLayout
        form={parsedForm}
        theme={theme}
        headerImageUrl={headerImageUrl}
      />
    );
  }

  // Creator Studio view - full theme customization
  if (view === 'creator' && parsedForm && originalFormUrl) {
    return (
      <CreatorStudio
        form={parsedForm}
        originalFormUrl={originalFormUrl}
        onBack={handleBack}
      />
    );
  }

  // Loading screen for shared form links
  if (isLoading && view === 'input') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <svg
            className="w-12 h-12 text-primary-500 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="text-lg text-gray-600 font-medium">Loading form...</p>
        </div>
      </div>
    );
  }

  // Input view (default)
  return (
    <FormUrlInput
      onSubmit={handleUrlSubmit}
      isLoading={isLoading}
      error={error}
    />
  );
}

export default App;
