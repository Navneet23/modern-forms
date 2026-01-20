import { useState, useEffect } from 'react';
import type { ParsedForm, FormConfig } from './types/form';
import type { ThemeConfig } from './types/theme';
import { defaultTheme } from './data/themes';
import { fetchGoogleForm, parseGoogleFormHtml } from './utils/formParser';
import { getFormConfig } from './utils/storage';
import { FormUrlInput, CreatorStudio } from './components/creator';
import { StandardLayout, QuestionByQuestionLayout } from './components/layouts';

type AppView = 'input' | 'creator' | 'respond';

function App() {
  const [view, setView] = useState<AppView>('input');
  const [parsedForm, setParsedForm] = useState<ParsedForm | null>(null);
  const [formConfig, setFormConfig] = useState<FormConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Check URL for form ID on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const formId = params.get('f');

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

    if (formId) {
      const config = getFormConfig(formId);
      if (config) {
        setFormConfig(config);
        setParsedForm(config.parsedForm);
        setView('respond');
      } else {
        setError('Form not found');
      }
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
    setError('');
    setView('input');

    // Clear URL params
    window.history.replaceState({}, '', window.location.pathname);
  };

  // Respondent view - render the form with saved theme
  if (view === 'respond' && formConfig && parsedForm) {
    // Get theme from saved config or use default
    const standardTheme = (formConfig.standardTheme as ThemeConfig) || defaultTheme;
    const qbyqTheme = (formConfig.questionByQuestionTheme as ThemeConfig) || defaultTheme;
    const currentTheme = formConfig.layoutMode === 'standard' ? standardTheme : qbyqTheme;

    return formConfig.layoutMode === 'standard' ? (
      <StandardLayout
        form={parsedForm}
        theme={currentTheme}
        headerImageUrl={formConfig.headerImageUrl}
      />
    ) : (
      <QuestionByQuestionLayout
        form={parsedForm}
        theme={currentTheme}
        headerImageUrl={formConfig.headerImageUrl}
      />
    );
  }

  // Creator Studio view - full theme customization
  if (view === 'creator' && parsedForm) {
    return (
      <CreatorStudio
        form={parsedForm}
        onBack={handleBack}
      />
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
