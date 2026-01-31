import { useState, useRef, useCallback, useEffect } from 'react';
import type { HeaderStyle, HeaderImageShape, HeaderImageCrop } from '../../types/theme';

// Clip paths for header image shapes
export const HEADER_SHAPE_CLIP_PATHS: Record<HeaderImageShape, string> = {
  blob: "path('M 50 5 C 75 0, 100 15, 95 40 C 100 65, 85 95, 55 95 C 30 100, 5 80, 5 55 C 0 30, 20 5, 50 5 Z')",
  circle: 'circle(45% at 50% 50%)',
};

interface HeaderImagePickerProps {
  headerImageUrl?: string;
  headerStyle?: HeaderStyle;
  headerImageShape?: HeaderImageShape;
  headerImageCrop?: HeaderImageCrop;
  onImageChange: (url: string | undefined) => void;
  onStyleChange: (style: HeaderStyle) => void;
  onShapeChange: (shape: HeaderImageShape) => void;
  onCropChange: (crop: HeaderImageCrop) => void;
}

export function HeaderImagePicker({
  headerImageUrl,
  headerStyle = 'banner',
  headerImageShape = 'blob',
  headerImageCrop,
  onImageChange,
  onStyleChange,
  onShapeChange,
  onCropChange,
}: HeaderImagePickerProps) {
  const [showCropDialog, setShowCropDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      onImageChange(reader.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemove = () => {
    onImageChange(undefined);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700">Header Image</h3>

      {/* Image source */}
      {!headerImageUrl ? (
        <div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full px-3 py-2 rounded-lg border-2 border-dashed border-gray-300 text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-all"
          >
            Upload image
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      ) : (
        <div className="space-y-3">
          {/* Preview */}
          <div className="relative rounded-lg overflow-hidden h-24">
            <img src={headerImageUrl} alt="" className="w-full h-full object-cover" />
            <button
              onClick={handleRemove}
              className="absolute top-1 right-1 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center text-xs hover:bg-black/70"
            >
              ✕
            </button>
          </div>

          {/* Style selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-600">Style</label>
            <div className="flex gap-2">
              <button
                onClick={() => onStyleChange('banner')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                  headerStyle === 'banner'
                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                    : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                }`}
              >
                Banner
              </button>
              <button
                onClick={() => onStyleChange('integrated')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                  headerStyle === 'integrated'
                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                    : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                }`}
              >
                Integrated
              </button>
            </div>
          </div>

          {/* Shape selector (integrated only) */}
          {headerStyle === 'integrated' && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600">Shape</label>
              <div className="flex gap-2">
                <button
                  onClick={() => onShapeChange('blob')}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                    headerImageShape === 'blob'
                      ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                      : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                  }`}
                >
                  Blob
                </button>
                <button
                  onClick={() => onShapeChange('circle')}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                    headerImageShape === 'circle'
                      ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                      : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                  }`}
                >
                  Circle
                </button>
              </div>

              {/* Adjust crop button */}
              <button
                onClick={() => setShowCropDialog(true)}
                className="w-full text-xs text-blue-600 hover:text-blue-800 py-1"
              >
                Adjust crop position
              </button>
            </div>
          )}

          {/* Change image */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full text-xs text-gray-500 hover:text-gray-700 py-1"
          >
            Change image
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      )}

      {/* Crop Dialog */}
      {showCropDialog && headerImageUrl && (
        <HeaderCropDialog
          imageUrl={headerImageUrl}
          shape={headerImageShape}
          crop={headerImageCrop || { x: 50, y: 50, scale: 1 }}
          onApply={(crop) => {
            onCropChange(crop);
            setShowCropDialog(false);
          }}
          onClose={() => setShowCropDialog(false)}
        />
      )}
    </div>
  );
}

// Crop dialog component
interface HeaderCropDialogProps {
  imageUrl: string;
  shape: HeaderImageShape;
  crop: HeaderImageCrop;
  onApply: (crop: HeaderImageCrop) => void;
  onClose: () => void;
}

function HeaderCropDialog({ imageUrl, shape, crop, onApply, onClose }: HeaderCropDialogProps) {
  const [localCrop, setLocalCrop] = useState<HeaderImageCrop>(crop);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number; cropX: number; cropY: number } | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      cropX: localCrop.x,
      cropY: localCrop.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [localCrop]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || !dragStart.current || !previewRef.current) return;

    const rect = previewRef.current.getBoundingClientRect();
    const dx = ((e.clientX - dragStart.current.x) / rect.width) * 100;
    const dy = ((e.clientY - dragStart.current.y) / rect.height) * 100;

    setLocalCrop((prev) => ({
      ...prev,
      x: Math.max(0, Math.min(100, dragStart.current!.cropX - dx)),
      y: Math.max(0, Math.min(100, dragStart.current!.cropY - dy)),
    }));
  }, [isDragging]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    dragStart.current = null;
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Adjust Crop Position</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        {/* Preview */}
        <div className="p-4 flex-1 overflow-auto">
          <div
            ref={previewRef}
            className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-grab active:cursor-grabbing select-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            <div
              className="absolute inset-0"
              style={{ clipPath: HEADER_SHAPE_CLIP_PATHS[shape] }}
            >
              <img
                src={imageUrl}
                alt=""
                className="w-full h-full"
                style={{
                  objectFit: 'cover',
                  objectPosition: `${localCrop.x}% ${localCrop.y}%`,
                  transform: `scale(${localCrop.scale})`,
                  transformOrigin: `${localCrop.x}% ${localCrop.y}%`,
                }}
                draggable={false}
              />
            </div>
            {!isDragging && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="bg-black/40 text-white text-xs px-3 py-1 rounded-full">
                  Drag to reposition
                </span>
              </div>
            )}
          </div>

          {/* Zoom slider */}
          <div className="mt-4 space-y-1">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Zoom</span>
              <span>{localCrop.scale.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="1"
              max="3"
              step="0.1"
              value={localCrop.scale}
              onChange={(e) => setLocalCrop((prev) => ({ ...prev, scale: parseFloat(e.target.value) }))}
              className="w-full"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onApply(localCrop)}
            className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-sm font-medium text-white hover:bg-blue-700"
          >
            Select
          </button>
        </div>
      </div>
    </div>
  );
}
