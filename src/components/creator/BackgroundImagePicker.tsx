import { useState, useCallback } from 'react';
import { BACKGROUND_GALLERY, getPicsumUrl } from '../../utils/imageSearch';
import { generateBackgroundImage, regenerateImageFromPrompt, IMAGE_STYLES, type ImageStyle } from '../../utils/aiImageGeneration';
import type { ThemeColors } from '../../types/theme';

// M3 Shimmer animation component for AI generation loading state
function PromptShimmer() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="h-3 w-3 rounded-full bg-gradient-to-r from-primary-400 to-primary-600 animate-pulse" />
        <span className="text-label-md text-on-surface-variant">Generating prompt...</span>
      </div>
      <div className="relative overflow-hidden shape-small border border-outline-variant bg-surface-container p-3">
        <div className="space-y-2">
          <div className="h-3 bg-surface-container-high rounded-full w-full shimmer-line" />
          <div className="h-3 bg-surface-container-high rounded-full w-11/12 shimmer-line" style={{ animationDelay: '0.1s' }} />
          <div className="h-3 bg-surface-container-high rounded-full w-4/5 shimmer-line" style={{ animationDelay: '0.2s' }} />
          <div className="h-3 bg-surface-container-high rounded-full w-3/4 shimmer-line" style={{ animationDelay: '0.3s' }} />
        </div>
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
  const [recentGeneratedImages, setRecentGeneratedImages] = useState<string[]>([]);

  // Add image to recent list (max 6)
  const addToRecentImages = useCallback((imageUrl: string) => {
    setRecentGeneratedImages((prev) => {
      if (prev.includes(imageUrl)) return prev;
      const updated = [imageUrl, ...prev].slice(0, 6);
      return updated;
    });
  }, []);

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
        addToRecentImages(imageUrl);
      }
    } catch (err) {
      setAiError('Failed to generate image. Please try again.');
    } finally {
      setIsGeneratingAI(false);
    }
  }, [formTitle, formDescription, themeColors, selectedStyle, onImageSelect, addToRecentImages]);

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
        addToRecentImages(imageUrl);
      }
    } catch (err) {
      setAiError('Failed to regenerate image. Please try again.');
    } finally {
      setIsRegenerating(false);
    }
  }, [editedPrompt, onImageSelect, addToRecentImages]);

  // Handle selecting a recent generated image
  const handleSelectRecentImage = useCallback((imageUrl: string) => {
    onImageSelect(imageUrl);
  }, [onImageSelect]);

  // Handle file upload
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

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
    <div className="space-y-4">
      {/* M3 Section Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-title-sm text-on-surface">Background Image</h3>
        {currentImageUrl && (
          <button
            onClick={handleRemoveBackground}
            className="md-text-button text-error hover:bg-error-50 px-2 h-8"
          >
            Remove
          </button>
        )}
      </div>

      {/* M3 Current image preview card */}
      {currentImageUrl && (
        <div className="relative shape-medium overflow-hidden border border-outline-variant">
          <img
            src={currentImageUrl}
            alt="Current background"
            className="w-full h-20 object-cover"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="md-chip bg-surface/90 text-on-surface text-label-sm">
              Current
            </span>
          </div>
        </div>
      )}

      {/* M3 Filled Tonal Button - Generate with AI */}
      <button
        onClick={handleGenerateWithAI}
        disabled={isGeneratingAI}
        className={`
          md-tonal-button w-full h-11
          ${isGeneratingAI
            ? 'bg-surface-container-high text-on-surface/38 cursor-not-allowed'
            : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
          }
        `}
      >
        {isGeneratingAI ? (
          <>
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-label-lg">Generating...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <span className="text-label-lg">Generate with AI</span>
          </>
        )}
      </button>

      {/* M3 Outlined Select - Style Selector */}
      <div className="space-y-2">
        <label className="text-label-md text-on-surface-variant">Image Style</label>
        <div className="md-select">
          <select
            value={selectedStyle}
            onChange={(e) => setSelectedStyle(e.target.value as ImageStyle)}
            disabled={isGeneratingAI}
            className="w-full px-4 py-3 text-body-md bg-transparent border border-outline shape-xs focus:outline-none focus:border-2 focus:border-primary disabled:opacity-38 disabled:cursor-not-allowed transition-all duration-short4 ease-md-standard"
          >
            {IMAGE_STYLES.map((style) => (
              <option key={style.id} value={style.id}>
                {style.name}
              </option>
            ))}
          </select>
        </div>
        <p className="text-body-sm text-on-surface-variant">
          {IMAGE_STYLES.find(s => s.id === selectedStyle)?.description}
        </p>
      </div>

      {/* M3 Error Container */}
      {aiError && (
        <div className="shape-small bg-error-50 border border-error-200 p-3">
          <p className="text-body-sm text-error-700">{aiError}</p>
        </div>
      )}

      {/* Shimmer animation during prompt generation */}
      {isGeneratingAI && !generatedPrompt && (
        <PromptShimmer />
      )}

      {/* M3 Editable Prompt Card with Try Again */}
      {generatedPrompt && (
        <div className="md-card-outlined p-4 space-y-3">
          <label className="text-label-md text-on-surface-variant">AI Generated Prompt</label>
          <div className="relative">
            <textarea
              value={editedPrompt}
              onChange={(e) => setEditedPrompt(e.target.value)}
              disabled={isRegenerating}
              className="w-full px-4 py-3 text-body-sm text-on-surface bg-surface-container-low border border-outline-variant shape-xs resize-none focus:outline-none focus:border-2 focus:border-primary disabled:opacity-50 transition-all duration-short4 ease-md-standard"
              rows={4}
              placeholder="Edit the prompt to regenerate..."
            />
            {/* Shimmer overlay during regeneration */}
            {isRegenerating && (
              <div className="absolute inset-0 shape-xs overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent shimmer-overlay" />
              </div>
            )}
          </div>

          {/* M3 Filled Button - Try Again */}
          <button
            onClick={handleTryAgain}
            disabled={isRegenerating || !editedPrompt.trim()}
            className={`
              md-filled-button w-full h-10
              ${isRegenerating || !editedPrompt.trim()
                ? 'bg-on-surface/12 text-on-surface/38 cursor-not-allowed shadow-none'
                : 'bg-secondary text-on-secondary hover:shadow-elevation-1'
              }
            `}
          >
            {isRegenerating ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-label-lg">Regenerating...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="text-label-lg">Try Again</span>
              </>
            )}
          </button>

          {/* M3 Recent Generated Images List */}
          {recentGeneratedImages.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-outline-variant">
              <label className="text-label-md text-on-surface-variant">Recent Generated</label>
              <div className="space-y-2">
                {recentGeneratedImages.map((imageUrl, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectRecentImage(imageUrl)}
                    className={`
                      md-list-item w-full h-16 p-0 shape-medium overflow-hidden border-2 transition-all duration-short4 ease-md-standard
                      ${currentImageUrl === imageUrl
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-outline-variant hover:border-outline'
                      }
                    `}
                  >
                    <img
                      src={imageUrl}
                      alt={`Generated image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {currentImageUrl === imageUrl && (
                      <div className="absolute top-1.5 right-1.5 w-6 h-6 bg-primary shape-full flex items-center justify-center shadow-elevation-1">
                        <svg className="w-4 h-4 text-on-primary" fill="currentColor" viewBox="0 0 20 20">
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
            </div>
          )}
        </div>
      )}

      {/* M3 Segmented Button - Tabs */}
      <div className="md-segmented-button-container w-full">
        <button
          onClick={() => setActiveTab('browse')}
          className={`
            md-segmented-button text-label-lg
            ${activeTab === 'browse'
              ? 'bg-secondary-100 text-on-secondary-container'
              : 'bg-transparent text-on-surface hover:bg-surface-container-high'
            }
          `}
          aria-selected={activeTab === 'browse'}
        >
          Browse
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={`
            md-segmented-button text-label-lg
            ${activeTab === 'upload'
              ? 'bg-secondary-100 text-on-secondary-container'
              : 'bg-transparent text-on-surface hover:bg-surface-container-high'
            }
          `}
          aria-selected={activeTab === 'upload'}
        >
          Upload
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[160px]">
        {/* Browse Tab - M3 Image Grid */}
        {activeTab === 'browse' && (
          <div className="grid grid-cols-3 gap-2">
            {BACKGROUND_GALLERY.map((imageId) => (
              <button
                key={imageId}
                onClick={() => handleSelectImage(imageId)}
                className={`
                  relative aspect-[4/3] shape-small overflow-hidden border-2 transition-all duration-short4 ease-md-standard
                  hover:scale-[1.02] active:scale-[0.98]
                  ${currentImageUrl?.includes(`/id/${imageId}/`)
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-transparent hover:border-outline-variant'
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
                  <div className="absolute top-1 right-1 w-5 h-5 bg-primary shape-full flex items-center justify-center shadow-elevation-1">
                    <svg className="w-3 h-3 text-on-primary" fill="currentColor" viewBox="0 0 20 20">
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

        {/* Upload Tab - M3 Upload Area */}
        {activeTab === 'upload' && (
          <div className="space-y-3">
            <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-outline-variant shape-medium cursor-pointer hover:border-primary hover:bg-primary-50/50 transition-all duration-short4 ease-md-standard">
              <svg className="w-10 h-10 text-on-surface-variant mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-label-lg text-on-surface">Click to upload</span>
              <span className="text-body-sm text-on-surface-variant mt-1">PNG, JPG up to 5MB</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {uploadedImage && (
              <div className="relative shape-medium overflow-hidden border border-outline-variant">
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
                  className="md-fab-small absolute top-2 right-2 bg-error text-on-error hover:shadow-elevation-4"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
