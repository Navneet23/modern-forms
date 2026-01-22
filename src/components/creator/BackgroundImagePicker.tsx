import { useState, useCallback } from 'react';
import { BACKGROUND_GALLERY, getPicsumUrl } from '../../utils/imageSearch';
import { generateBackgroundImage, regenerateImageFromPrompt, IMAGE_STYLES, type ImageStyle } from '../../utils/aiImageGeneration';
import type { ThemeColors } from '../../types/theme';

// Shimmer animation component for AI generation loading state
function PromptShimmer() {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <div className="h-3 w-3 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 animate-pulse" />
        <span className="text-xs text-gray-500 font-medium">Generating prompt...</span>
      </div>
      <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50 p-3">
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-full shimmer-line" />
          <div className="h-3 bg-gray-200 rounded w-11/12 shimmer-line" style={{ animationDelay: '0.1s' }} />
          <div className="h-3 bg-gray-200 rounded w-4/5 shimmer-line" style={{ animationDelay: '0.2s' }} />
          <div className="h-3 bg-gray-200 rounded w-3/4 shimmer-line" style={{ animationDelay: '0.3s' }} />
        </div>
        <style>{`
          .shimmer-line {
            background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
          }
          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
      </div>
    </div>
  );
}

interface BackgroundImagePickerProps {
  currentImageUrl?: string;
  onImageSelect: (url: string | undefined) => void;
  formTitle: string;
  formDescription?: string;
  themeColors: ThemeColors;
}

type TabType = 'browse' | 'upload';

export function BackgroundImagePicker({
  currentImageUrl,
  onImageSelect,
  formTitle,
  formDescription,
  themeColors,
}: BackgroundImagePickerProps) {
  const [activeTab, setActiveTab] = useState<TabType>('browse');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<ImageStyle>('artistic');
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [editedPrompt, setEditedPrompt] = useState<string>('');

  // Handle AI image generation
  const handleGenerateWithAI = useCallback(async () => {
    setIsGeneratingAI(true);
    setAiError(null);
    setGeneratedPrompt(null);
    setEditedPrompt('');

    try {
      const { imageUrl, generatedPrompt: prompt, error } = await generateBackgroundImage(
        formTitle,
        formDescription,
        themeColors,
        selectedStyle
      );

      if (prompt) {
        setGeneratedPrompt(prompt);
        setEditedPrompt(prompt);
      }

      if (error) {
        setAiError(error);
      } else if (imageUrl) {
        onImageSelect(imageUrl);
      }
    } catch (err) {
      setAiError('Failed to generate image. Please try again.');
    } finally {
      setIsGeneratingAI(false);
    }
  }, [formTitle, formDescription, themeColors, selectedStyle, onImageSelect]);

  // Handle regenerating image with edited prompt
  const handleTryAgain = useCallback(async () => {
    if (!editedPrompt.trim()) return;

    setIsRegenerating(true);
    setAiError(null);

    try {
      const { imageUrl, error } = await regenerateImageFromPrompt(editedPrompt);

      if (error) {
        setAiError(error);
      } else if (imageUrl) {
        onImageSelect(imageUrl);
      }
    } catch (err) {
      setAiError('Failed to regenerate image. Please try again.');
    } finally {
      setIsRegenerating(false);
    }
  }, [editedPrompt, onImageSelect]);

  // Handle file upload
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setUploadedImage(dataUrl);
      onImageSelect(dataUrl);
    };
    reader.readAsDataURL(file);
  }, [onImageSelect]);

  // Handle image selection from gallery
  const handleSelectImage = useCallback((imageId: number) => {
    const url = getPicsumUrl(imageId, 1920, 1080);
    onImageSelect(url);
  }, [onImageSelect]);

  // Handle remove background
  const handleRemoveBackground = useCallback(() => {
    setUploadedImage(null);
    onImageSelect(undefined);
  }, [onImageSelect]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Background Image</h3>
        {currentImageUrl && (
          <button
            onClick={handleRemoveBackground}
            className="text-xs text-red-600 hover:text-red-700 font-medium"
          >
            Remove
          </button>
        )}
      </div>

      {/* Current image preview */}
      {currentImageUrl && (
        <div className="relative rounded-lg overflow-hidden border border-gray-200">
          <img
            src={currentImageUrl}
            alt="Current background"
            className="w-full h-20 object-cover"
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <span className="text-white text-xs font-medium bg-black/50 px-2 py-1 rounded">
              Current
            </span>
          </div>
        </div>
      )}

      {/* Generate with AI Button */}
      <button
        onClick={handleGenerateWithAI}
        disabled={isGeneratingAI}
        className={`
          w-full py-2.5 px-4 rounded-lg font-medium text-sm transition-all
          flex items-center justify-center gap-2
          ${isGeneratingAI
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600'
          }
        `}
      >
        {isGeneratingAI ? (
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
            Generate with AI
          </>
        )}
      </button>

      {/* AI Style Selector */}
      <div className="space-y-1.5">
        <label className="text-xs text-gray-500 font-medium">Image Style</label>
        <select
          value={selectedStyle}
          onChange={(e) => setSelectedStyle(e.target.value as ImageStyle)}
          disabled={isGeneratingAI}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {IMAGE_STYLES.map((style) => (
            <option key={style.id} value={style.id}>
              {style.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-400">
          {IMAGE_STYLES.find(s => s.id === selectedStyle)?.description}
        </p>
      </div>

      {/* AI Error Message */}
      {aiError && (
        <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg">
          {aiError}
        </p>
      )}

      {/* Shimmer animation during prompt generation */}
      {isGeneratingAI && !generatedPrompt && (
        <PromptShimmer />
      )}

      {/* Editable Prompt with Try Again */}
      {generatedPrompt && (
        <div className="space-y-2">
          <label className="text-xs text-gray-500 font-medium">AI Generated Prompt</label>
          <textarea
            value={editedPrompt}
            onChange={(e) => setEditedPrompt(e.target.value)}
            disabled={isRegenerating}
            className="w-full px-3 py-2 text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            rows={4}
            placeholder="Edit the prompt to regenerate..."
          />
          <button
            onClick={handleTryAgain}
            disabled={isRegenerating || !editedPrompt.trim()}
            className={`
              w-full py-2 px-4 rounded-lg font-medium text-xs transition-all
              flex items-center justify-center gap-2
              ${isRegenerating || !editedPrompt.trim()
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-800 text-white hover:bg-gray-900'
              }
            `}
          >
            {isRegenerating ? (
              <>
                <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Regenerating...
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Try Again
              </>
            )}
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('browse')}
          className={`
            flex-1 py-1.5 px-2 text-xs font-medium rounded-md transition-all
            ${activeTab === 'browse'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
            }
          `}
        >
          Browse
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={`
            flex-1 py-1.5 px-2 text-xs font-medium rounded-md transition-all
            ${activeTab === 'upload'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
            }
          `}
        >
          Upload
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[160px]">
        {/* Browse Tab */}
        {activeTab === 'browse' && (
          <div className="grid grid-cols-3 gap-1.5">
            {BACKGROUND_GALLERY.map((imageId) => (
              <button
                key={imageId}
                onClick={() => handleSelectImage(imageId)}
                className={`
                  relative aspect-[4/3] rounded-md overflow-hidden border-2 transition-all
                  hover:opacity-90
                  ${currentImageUrl?.includes(`/id/${imageId}/`)
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : 'border-transparent'
                  }
                `}
              >
                <img
                  src={getPicsumUrl(imageId, 200, 150)}
                  alt={`Background option ${imageId}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {currentImageUrl?.includes(`/id/${imageId}/`) && (
                  <div className="absolute top-0.5 right-0.5 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="space-y-3">
            <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
              <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs text-gray-600 font-medium">Click to upload</span>
              <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {uploadedImage && (
              <div className="relative rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={uploadedImage}
                  alt="Uploaded background"
                  className="w-full h-20 object-cover"
                />
                <button
                  onClick={() => {
                    setUploadedImage(null);
                    if (currentImageUrl === uploadedImage) {
                      onImageSelect(undefined);
                    }
                  }}
                  className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
