import { useState, useRef, useCallback, useEffect } from 'react';
import type { ContextualImageCropShape, ContextualImageCropSettings } from '../../types/theme';

interface ImageCropDialogProps {
  imageUrl: string;
  shape: ContextualImageCropShape;
  initialSettings?: ContextualImageCropSettings;
  onConfirm: (settings: ContextualImageCropSettings) => void;
  onCancel: () => void;
}

// Shape clip paths for preview
const SHAPE_CLIP_PATHS: Record<ContextualImageCropShape, string> = {
  none: 'none',
  oval: 'ellipse(50% 40% at 50% 50%)',
  hexagon: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
  arch: 'path("M 0 100 L 0 30 Q 0 0 30 0 L 70 0 Q 100 0 100 30 L 100 100 Z")',
  blob: 'path("M 85 5 Q 100 5 100 25 L 100 75 Q 100 95 80 95 L 40 95 Q 5 95 5 70 L 5 35 Q 5 5 40 5 Z")',
};

// Default shape positions in the layout (fixed per shape)
export const SHAPE_LAYOUT_POSITIONS: Record<ContextualImageCropShape, { top: string; left: string; right: string; bottom: string }> = {
  none: { top: '0', left: '0', right: '0', bottom: '0' },
  oval: { top: '10%', left: '10%', right: '10%', bottom: '10%' },
  hexagon: { top: '15%', left: '15%', right: '15%', bottom: '15%' },
  arch: { top: '0', left: '5%', right: '5%', bottom: '10%' },
  blob: { top: '0', left: '0', right: '0', bottom: '5%' },
};

export function ImageCropDialog({
  imageUrl,
  shape,
  initialSettings,
  onConfirm,
  onCancel,
}: ImageCropDialogProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [position, setPosition] = useState(initialSettings?.position || { x: 50, y: 50 });
  const [scale, setScale] = useState(initialSettings?.scale || 1);
  const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  // Close on clicking outside the dialog
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
      onCancel();
    }
  }, [onCancel]);

  // Handle mouse down on crop area
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains('resize-handle')) {
      setIsResizing(true);
    } else {
      setIsDragging(true);
    }
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: position.x,
      posY: position.y,
    };
    e.preventDefault();
  }, [position]);

  // Handle mouse move
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      if (isDragging) {
        const container = containerRef.current.getBoundingClientRect();
        const deltaX = ((e.clientX - dragStartRef.current.x) / container.width) * 100;
        const deltaY = ((e.clientY - dragStartRef.current.y) / container.height) * 100;

        setPosition({
          x: Math.max(0, Math.min(100, dragStartRef.current.posX + deltaX)),
          y: Math.max(0, Math.min(100, dragStartRef.current.posY + deltaY)),
        });
      } else if (isResizing) {
        const container = containerRef.current.getBoundingClientRect();
        const deltaY = (e.clientY - dragStartRef.current.y) / container.height;
        const newScale = Math.max(0.3, Math.min(2, scale + deltaY));
        setScale(newScale);
        dragStartRef.current.y = e.clientY;
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, scale]);

  const handleConfirm = () => {
    onConfirm({
      shape,
      position,
      scale,
    });
  };

  // Calculate crop area size based on scale
  const cropWidth = 60 * scale;
  const cropHeight = 70 * scale;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        ref={dialogRef}
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Adjust Crop Area</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Drag to position. Use slider to resize.
            </p>
          </div>
          <button
            onClick={onCancel}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Image with crop overlay */}
        <div className="p-4 overflow-auto flex-1">
          <div
            ref={containerRef}
            className="relative w-full aspect-[4/5] bg-gray-100 rounded-lg overflow-hidden cursor-move"
          >
            {/* Original image */}
            <img
              src={imageUrl}
              alt="Crop preview"
              className="absolute inset-0 w-full h-full object-cover"
              draggable={false}
            />

            {/* Darkened overlay */}
            <div className="absolute inset-0 bg-black/40" />

            {/* Crop area - shows the selected portion */}
            <div
              className="absolute cursor-move"
              style={{
                left: `${position.x - cropWidth / 2}%`,
                top: `${position.y - cropHeight / 2}%`,
                width: `${cropWidth}%`,
                height: `${cropHeight}%`,
              }}
              onMouseDown={handleMouseDown}
            >
              {/* Shape mask showing the image */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{
                  clipPath: SHAPE_CLIP_PATHS[shape],
                }}
              >
                <img
                  src={imageUrl}
                  alt=""
                  className="absolute object-cover"
                  style={{
                    width: `${100 / (cropWidth / 100)}%`,
                    height: `${100 / (cropHeight / 100)}%`,
                    left: `${-((position.x - cropWidth / 2) / (cropWidth / 100))}%`,
                    top: `${-((position.y - cropHeight / 2) / (cropHeight / 100))}%`,
                  }}
                  draggable={false}
                />
              </div>

              {/* Shape border outline */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                {shape === 'oval' && (
                  <ellipse
                    cx="50"
                    cy="50"
                    rx="50"
                    ry="40"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />
                )}
                {shape === 'hexagon' && (
                  <polygon
                    points="50,0 100,25 100,75 50,100 0,75 0,25"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />
                )}
                {shape === 'arch' && (
                  <path
                    d="M 0 100 L 0 30 Q 0 0 30 0 L 70 0 Q 100 0 100 30 L 100 100 Z"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />
                )}
                {shape === 'blob' && (
                  <path
                    d="M 85 5 Q 100 5 100 25 L 100 75 Q 100 95 80 95 L 40 95 Q 5 95 5 70 L 5 35 Q 5 5 40 5 Z"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />
                )}
              </svg>

              {/* Resize handle */}
              <div
                className="resize-handle absolute bottom-1 right-1 w-6 h-6 bg-white rounded-full shadow-lg cursor-se-resize flex items-center justify-center"
              >
                <svg className="w-3 h-3 text-gray-600 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </div>
            </div>
          </div>

          {/* Scale slider */}
          <div className="mt-3">
            <label className="text-sm font-medium text-gray-700">Size</label>
            <input
              type="range"
              min="0.3"
              max="2"
              step="0.1"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="w-full mt-1"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Small</span>
              <span>Large</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 flex-shrink-0">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
          >
            Select
          </button>
        </div>
      </div>
    </div>
  );
}
