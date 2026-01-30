import { useState, useCallback } from 'react';
import { BACKGROUND_GALLERY, getPicsumUrl } from '../../utils/imageSearch';
import {
  generateContextualImage,
  regenerateContextualImageFromPrompt,
  CONTEXTUAL_IMAGE_STYLES,
  type ContextualImageStyle,
} from '../../utils/contextualImageGeneration';
import type { ThemeColors, ContextualImageCropSettings, ContextualImageCropShape } from '../../types/theme';
import { ImageCropDialog } from './ImageCropDialog';

// Shape options for cropping
const CROP_SHAPES: { id: ContextualImageCropShape; name: string; icon: JSX.Element }[] = [
  {
    id: 'none',
    name: 'None',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth={2} />
      </svg>
    ),
  },
  {
    id: 'oval',
    name: 'Oval',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <ellipse cx="12" cy="12" rx="9" ry="7" strokeWidth={2} />
      </svg>
    ),
  },
  {
    id: 'circle',
    name: 'Circle',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" strokeWidth={2} />
      </svg>
    ),
  },
  {
    id: 'blob',
    name: 'Blob',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M18 3 Q22 3 22 8 L22 16 Q22 21 17 21 L9 21 Q3 21 3 15 L3 9 Q3 3 10 3 Z" strokeWidth={2} />
      </svg>
    ),
  },
];

interface ContextualImagePickerProps {
  currentImageUrl?: string;
  onImageSelect: (url: string | undefined) => void;
  cropSettings?: ContextualImageCropSettings;
  onCropChange: (settings: ContextualImageCropSettings | undefined) => void;
  formTitle: string;
  formDescription?: string;
  themeColors: ThemeColors;
}

type TabType = 'browse' | 'upload';

export function ContextualImagePicker({
  currentImageUrl,
  onImageSelect,
  cropSettings,
  onCropChange,
  formTitle,
  formDescription,
  themeColors,
}: ContextualImagePickerProps) {
  const [activeTab, setActiveTab] = useState<TabType>('browse');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<ContextualImageStyle>('brand-hero');
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [editedPrompt, setEditedPrompt] = useState<string>('');
  const [showCropDialog, setShowCropDialog] = useState(false);
  const [pendingCropShape, setPendingCropShape] = useState<ContextualImageCropShape | null>(null);

  // Handle AI image generation
  const handleGenerateWithAI = useCallback(async () => {
    setIsGeneratingAI(true);
    setAiError(null);
    setGeneratedPrompt(null);
    setEditedPrompt('');

    try {
      const { imageUrl, generatedPrompt: prompt, error } = await generateContextualImage(
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
      const { imageUrl, error } = await regenerateContextualImageFromPrompt(editedPrompt);

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

  // Handle remove image
  const handleRemoveImage = useCallback(() => {
    setUploadedImage(null);
    onImageSelect(undefined);
    onCropChange(undefined);
  }, [onImageSelect, onCropChange]);

  // Handle shape selection
  const handleShapeSelect = useCallback((shape: ContextualImageCropShape) => {
    if (shape === 'none') {
      onCropChange(undefined);
    } else if (currentImageUrl) {
      setPendingCropShape(shape);
      setShowCropDialog(true);
    }
  }, [currentImageUrl, onCropChange]);

  // Handle crop dialog confirm
  const handleCropConfirm = useCallback((settings: ContextualImageCropSettings) => {
    onCropChange(settings);
    setShowCropDialog(false);
    setPendingCropShape(null);
  }, [onCropChange]);

  // Handle crop dialog cancel
  const handleCropCancel = useCallback(() => {
    setShowCropDialog(false);
    setPendingCropShape(null);
  }, []);

  // Get current shape
  const currentShape = cropSettings?.shape || 'none';

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Contextual Image</h3>
        {currentImageUrl && (
          <button
            onClick={handleRemoveImage}
            className="text-xs text-red-600 hover:text-red-700 font-medium"
          >
            Remove
          </button>
        )}
      </div>

      <p className="text-xs text-gray-500">
        This image appears on the right side in desktop view.
      </p>

      {/* Current image preview */}
      {currentImageUrl && (
        <div className="relative rounded-lg overflow-hidden border border-gray-200">
          <img
            src={currentImageUrl}
            alt="Current contextual"
            className="w-full h-20 object-cover"
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <span className="text-white text-xs font-medium bg-black/50 px-2 py-1 rounded">
              Current
            </span>
          </div>
        </div>
      )}

      {/* Crop Shape Selection - Only show when image is selected */}
      {currentImageUrl && (
        <div className="space-y-2">
          <label className="text-xs text-gray-500 font-medium">Image Shape</label>
          <div className="flex gap-1">
            {CROP_SHAPES.map((shape) => (
              <button
                key={shape.id}
                onClick={() => handleShapeSelect(shape.id)}
                className={`
                  flex-1 py-2 px-1 rounded-lg border-2 transition-all flex flex-col items-center gap-1
                  ${currentShape === shape.id
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }
                `}
                title={shape.name}
              >
                {shape.icon}
                <span className="text-[10px] font-medium">{shape.name}</span>
              </button>
            ))}
          </div>
          {currentShape !== 'none' && (
            <button
              onClick={() => {
                setPendingCropShape(currentShape);
                setShowCropDialog(true);
              }}
              className="w-full py-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Adjust crop position
            </button>
          )}
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
          onChange={(e) => setSelectedStyle(e.target.value as ContextualImageStyle)}
          disabled={isGeneratingAI}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {CONTEXTUAL_IMAGE_STYLES.map((style) => (
            <option key={style.id} value={style.id}>
              {style.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-400">
          {CONTEXTUAL_IMAGE_STYLES.find(s => s.id === selectedStyle)?.description}
        </p>
      </div>

      {/* AI Error Message */}
      {aiError && (
        <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg">
          {aiError}
        </p>
      )}

      {/* Editable Prompt with Try Again */}
      {generatedPrompt && (
        <div className="space-y-2">
          <label className="text-xs text-gray-500 font-medium">AI Generated Prompt</label>
          <textarea
            value={editedPrompt}
            onChange={(e) => setEditedPrompt(e.target.value)}
            disabled={isRegenerating}
            className="w-full px-3 py-2 text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
            rows={3}
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
                Generating...
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Generate image
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
      <div className="min-h-[120px]">
        {/* Browse Tab */}
        {activeTab === 'browse' && (
          <div className="grid grid-cols-3 gap-1.5">
            {BACKGROUND_GALLERY.slice(0, 9).map((imageId) => (
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
                  alt={`Image option ${imageId}`}
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
            <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
              <svg className="w-6 h-6 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs text-gray-600 font-medium">Click to upload</span>
              <span className="text-xs text-gray-400">PNG, JPG up to 5MB</span>
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
                  alt="Uploaded"
                  className="w-full h-16 object-cover"
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

      {/* Crop Dialog */}
      {showCropDialog && currentImageUrl && pendingCropShape && pendingCropShape !== 'none' && (
        <ImageCropDialog
          imageUrl={currentImageUrl}
          shape={pendingCropShape}
          initialSettings={cropSettings?.shape === pendingCropShape ? cropSettings : undefined}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
}
