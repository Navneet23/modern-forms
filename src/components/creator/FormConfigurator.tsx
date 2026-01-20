import { useState } from 'react';
import type { ParsedForm, LayoutMode } from '../../types/form';
import { StandardLayout, QuestionByQuestionLayout } from '../layouts';

interface FormConfiguratorProps {
  form: ParsedForm;
  onCreateForm: (layoutMode: LayoutMode, headerImageUrl?: string) => void;
  onBack: () => void;
}

export function FormConfigurator({ form, onCreateForm, onBack }: FormConfiguratorProps) {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('standard');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewViewport, setPreviewViewport] = useState<'desktop' | 'mobile'>('desktop');

  const handleCreate = () => {
    onCreateForm(layoutMode);
  };

  if (isPreviewOpen) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-900">
        {/* Preview Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Settings
              </button>
              <span className="text-sm text-gray-500">|</span>
              <span className="text-sm font-medium text-gray-900">Preview Mode</span>
            </div>

            <div className="flex items-center gap-4">
              {/* Viewport Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setPreviewViewport('desktop')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-smooth ${
                    previewViewport === 'desktop'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  aria-pressed={previewViewport === 'desktop'}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setPreviewViewport('mobile')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-smooth ${
                    previewViewport === 'mobile'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  aria-pressed={previewViewport === 'mobile'}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>

              {/* Layout Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setLayoutMode('standard')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-smooth ${
                    layoutMode === 'standard'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Standard
                </button>
                <button
                  onClick={() => setLayoutMode('question-by-question')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-smooth ${
                    layoutMode === 'question-by-question'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Question by Question
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Content */}
        <div className="h-[calc(100vh-57px)] overflow-auto bg-gray-100 p-4">
          <div
            className={`mx-auto transition-all duration-300 ${
              previewViewport === 'mobile' ? 'max-w-[375px]' : 'max-w-full'
            }`}
            style={previewViewport === 'mobile' ? {
              boxShadow: '0 0 0 14px #1f2937, 0 0 0 16px #374151',
              borderRadius: '36px',
              overflow: 'hidden',
            } : undefined}
          >
            <div className={previewViewport === 'mobile' ? 'h-[700px] overflow-auto bg-white' : ''}>
              {layoutMode === 'standard' ? (
                <StandardLayout form={form} isPreview />
              ) : (
                <QuestionByQuestionLayout form={form} isPreview />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>

        {/* Form Info */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{form.title}</h1>
          {form.description && (
            <p className="text-gray-600">{form.description}</p>
          )}
          <p className="text-sm text-gray-500 mt-2">{form.questions.length} questions</p>
        </div>

        {/* Layout Selection */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Choose Layout</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <button
              onClick={() => setLayoutMode('standard')}
              className={`p-4 rounded-xl border-2 text-left transition-smooth ${
                layoutMode === 'standard'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  layoutMode === 'standard' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Standard Layout</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    All questions on a single scrollable page
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setLayoutMode('question-by-question')}
              className={`p-4 rounded-xl border-2 text-left transition-smooth ${
                layoutMode === 'question-by-question'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  layoutMode === 'question-by-question' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Question by Question</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    One question at a time with navigation
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => setIsPreviewOpen(true)}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-smooth min-h-[48px] flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Preview Form
          </button>

          <button
            onClick={handleCreate}
            className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-smooth min-h-[48px] flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Create & Share
          </button>
        </div>
      </div>
    </div>
  );
}
