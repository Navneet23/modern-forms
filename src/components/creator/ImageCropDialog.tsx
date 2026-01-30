import { useState, useRef, useCallback, useEffect } from 'react';
import type { ContextualImageCropShape, ContextualImageCropSettings } from '../../types/theme';

interface ImageCropDialogProps {
  imageUrl: string;
  shape: ContextualImageCropShape;
  initialSettings?: ContextualImageCropSettings;
  onConfirm: (settings: ContextualImageCropSettings) => void;
  onCancel: () => void;
}

// Shape clip paths used in both dialog preview and layout rendering
export const SHAPE_CLIP_PATHS: Record<ContextualImageCropShape, string> = {
  none: 'none',
  oval: 'ellipse(50% 40% at 50% 50%)',
  circle: 'circle(45% at 50% 50%)',
  blob: 'path("M 85 2 Q 100 2 100 20 L 100 80 Q 100 98 82 98 L 35 98 Q 2 98 2 75 L 2 30 Q 2 2 35 2 Z")',
};

// Fixed layout positions for each shape in the right panel
export const SHAPE_LAYOUT_POSITIONS: Record<ContextualImageCropShape, { top: string; left: string; right: string; bottom: string }> = {
  none: { top: '0', left: '0', right: '0', bottom: '0' },
  oval: { top: '5%', left: '5%', right: '5%', bottom: '5%' },
  circle: { top: '5%', left: '5%', right: '5%', bottom: '5%' },
  blob: { top: '0', left: '0', right: '0', bottom: '0' },
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

  // Handle mouse down on the shape preview area
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: position.x,
      posY: position.y,
    };
    e.preventDefault();
  }, [position]);

  // Handle mouse move for dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      // Drag sensitivity: when zoomed in more, smaller drags have bigger effect
      const sensitivity = 100 / scale;
      const dx = ((e.clientX - dragStartRef.current.x) / rect.width) * sensitivity;
      const dy = ((e.clientY - dragStartRef.current.y) / rect.height) * sensitivity;

      // Dragging the image in a direction shows the opposite side
      setPosition({
        x: Math.max(0, Math.min(100, dragStartRef.current.posX - dx)),
        y: Math.max(0, Math.min(100, dragStartRef.current.posY - dy)),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, scale]);

  const handleConfirm = () => {
    onConfirm({
      shape,
      position,
      scale,
    });
  };

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
              Drag to reposition. Use slider to zoom.
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

        {/* WYSIWYG shape preview - uses same CSS as the layout */}
        <div className="p-4 overflow-auto flex-1">
          <div
            ref={containerRef}
            className="relative w-full aspect-[4/5] bg-gray-100 rounded-lg overflow-hidden cursor-move"
            onMouseDown={handleMouseDown}
          >
            {/* Gray background to simulate the theme background area */}
            <div className="absolute inset-0 bg-gray-200" />

            {/* Shape-clipped image preview - exact same rendering as layout */}
            <div
              className="absolute overflow-hidden"
              style={{
                ...SHAPE_LAYOUT_POSITIONS[shape],
                clipPath: SHAPE_CLIP_PATHS[shape],
              }}
            >
              <img
                src={imageUrl}
                alt="Crop preview"
                className="absolute inset-0 w-full h-full object-cover"
                style={{
                  objectPosition: `${position.x}% ${position.y}%`,
                  transform: `scale(${scale})`,
                }}
                draggable={false}
              />
            </div>

            {/* Drag hint overlay */}
            {!isDragging && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-black/50 text-white text-xs px-3 py-1.5 rounded-full">
                  Drag to reposition
                </div>
              </div>
            )}
          </div>

          {/* Zoom slider */}
          <div className="mt-3">
            <label className="text-sm font-medium text-gray-700">Zoom</label>
            <input
              type="range"
              min="1"
              max="3"
              step="0.1"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="w-full mt-1"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Fit</span>
              <span>Zoomed</span>
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
