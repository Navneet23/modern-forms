import { useState } from 'react';
import { extractFormId } from '../../utils/formParser';

interface FormUrlInputProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
  error?: string;
}

export function FormUrlInput({ onSubmit, isLoading, error }: FormUrlInputProps) {
  const [url, setUrl] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      setValidationError('Please enter a Google Form URL');
      return;
    }

    if (!extractFormId(trimmedUrl)) {
      setValidationError('Please enter a valid Google Form URL');
      return;
    }

    setValidationError('');
    onSubmit(trimmedUrl);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center p-4">
      <div className="max-w-xl w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Modern Forms</h1>
          <p className="text-gray-600 text-lg">
            Transform your Google Forms into beautiful, modern experiences
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <form onSubmit={handleSubmit}>
            <label htmlFor="form-url" className="block text-sm font-medium text-gray-700 mb-2">
              Google Form URL
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                id="form-url"
                type="url"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setValidationError('');
                }}
                placeholder="https://docs.google.com/forms/d/e/..."
                className={`
                  flex-1 px-4 py-3 text-base border-2 rounded-lg transition-smooth
                  focus:border-primary-500 focus:ring-0
                  ${validationError || error ? 'border-red-500' : 'border-gray-300'}
                `}
                disabled={isLoading}
                aria-describedby={validationError || error ? 'url-error' : undefined}
              />
              <button
                type="submit"
                disabled={isLoading}
                className={`
                  px-6 py-3 text-white font-medium rounded-lg transition-smooth min-h-[48px]
                  ${isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700'
                  }
                `}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Loading...
                  </span>
                ) : (
                  'Continue'
                )}
              </button>
            </div>

            {(validationError || error) && (
              <p id="url-error" className="mt-2 text-sm text-red-500" role="alert">
                {validationError || error}
              </p>
            )}
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h2 className="text-sm font-medium text-gray-700 mb-3">How it works</h2>
            <ol className="space-y-2 text-sm text-gray-600">
              <li className="flex gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium">1</span>
                <span>Paste your Google Form URL above</span>
              </li>
              <li className="flex gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium">2</span>
                <span>Choose your layout and preview the form</span>
              </li>
              <li className="flex gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-medium">3</span>
                <span>Share the modern form link with respondents</span>
              </li>
            </ol>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Responses are submitted directly to your original Google Form
        </p>
      </div>
    </div>
  );
}
