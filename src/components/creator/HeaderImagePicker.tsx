import { useState, useRef, useCallback, useEffect } from 'react';
import type { HeaderStyle, HeaderImageShape, HeaderImageCrop } from '../../types/theme';
import type { LayoutMode } from '../../types/form';
import { HEADER_GALLERY, getPicsumUrl } from '../../utils/imageSearch';

// Clip paths for header image shapes
export const HEADER_SHAPE_CLIP_PATHS: Record<HeaderImageShape, string> = {
  cloud: 'polygon(50% 2%, 53.9% 2.3%, 57.6% 3.3%, 61.1% 4.8%, 64.4% 6.7%, 67.3% 9.2%, 70% 12%, 73.2% 9.4%, 76.8% 7.5%, 80.6% 6.5%, 84.5% 6.5%, 88.4% 7.6%, 92% 10%, 95% 13.5%, 97% 17.6%, 98.1% 22.3%, 98.3% 27%, 97.6% 31.7%, 96% 36%, 98.4% 40.3%, 99.5% 45%, 99.5% 49.8%, 98.5% 54.4%, 96.6% 58.5%, 94% 62%, 95.5% 66.3%, 96% 71%, 95.5% 75.8%, 94% 80.4%, 91.5% 84.5%, 88% 88%, 83.9% 90.5%, 79.6% 92%, 75.3% 92.5%, 71.1% 92%, 67.3% 90.5%, 64% 88%, 60.5% 91.5%, 56.4% 93.9%, 51.8% 95.3%, 47% 95.4%, 42.3% 94.3%, 38% 92%, 34.7% 93.7%, 30.9% 94.6%, 26.8% 94.8%, 22.4% 94.1%, 18.1% 92.5%, 14% 90%, 10.5% 86.7%, 8% 82.8%, 6.5% 78.5%, 6% 73.9%, 6.5% 69%, 8% 64%, 5.4% 59.7%, 3.5% 55%, 2.5% 50%, 2.5% 45%, 3.6% 40.3%, 6% 36%, 3.7% 31.7%, 2.6% 27%, 2.8% 22.3%, 4.1% 17.6%, 6.5% 13.5%, 10% 10%, 14.1% 7.5%, 18.4% 6%, 22.8% 5.5%, 26.9% 6%, 30.7% 7.5%, 34% 10%, 36.2% 7.3%, 38.6% 5.3%, 41.3% 3.8%, 44.1% 2.7%, 47% 2.2%)',
  circle: 'circle(45% at 50% 50%)',
};

// Cloud shape polygon points (0-100 percentage coordinates) for reuse in crop dialog
const CLOUD_POLYGON_POINTS: [number, number][] = [
  [50,2],[53.9,2.3],[57.6,3.3],[61.1,4.8],[64.4,6.7],[67.3,9.2],[70,12],[73.2,9.4],[76.8,7.5],[80.6,6.5],[84.5,6.5],[88.4,7.6],[92,10],[95,13.5],[97,17.6],[98.1,22.3],[98.3,27],[97.6,31.7],[96,36],[98.4,40.3],[99.5,45],[99.5,49.8],[98.5,54.4],[96.6,58.5],[94,62],[95.5,66.3],[96,71],[95.5,75.8],[94,80.4],[91.5,84.5],[88,88],[83.9,90.5],[79.6,92],[75.3,92.5],[71.1,92],[67.3,90.5],[64,88],[60.5,91.5],[56.4,93.9],[51.8,95.3],[47,95.4],[42.3,94.3],[38,92],[34.7,93.7],[30.9,94.6],[26.8,94.8],[22.4,94.1],[18.1,92.5],[14,90],[10.5,86.7],[8,82.8],[6.5,78.5],[6,73.9],[6.5,69],[8,64],[5.4,59.7],[3.5,55],[2.5,50],[2.5,45],[3.6,40.3],[6,36],[3.7,31.7],[2.6,27],[2.8,22.3],[4.1,17.6],[6.5,13.5],[10,10],[14.1,7.5],[18.4,6],[22.8,5.5],[26.9,6],[30.7,7.5],[34,10],[36.2,7.3],[38.6,5.3],[41.3,3.8],[44.1,2.7],[47,2.2],
];

interface HeaderImagePickerProps {
  headerImageUrl?: string;
  headerStyle?: HeaderStyle;
  headerImageShape?: HeaderImageShape;
  headerImageCrop?: HeaderImageCrop;
  onImageChange: (url: string | undefined) => void;
  onStyleChange: (style: HeaderStyle) => void;
  onShapeChange: (shape: HeaderImageShape) => void;
  onCropChange: (crop: HeaderImageCrop) => void;
  layoutMode?: LayoutMode;
}

export function HeaderImagePicker({
  headerImageUrl,
  headerStyle = 'banner',
  headerImageShape = 'circle',
  headerImageCrop,
  onImageChange,
  onStyleChange,
  onShapeChange,
  onCropChange,
  layoutMode = 'standard',
}: HeaderImagePickerProps) {
  const [showCropDialog, setShowCropDialog] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Url = reader.result as string;
      setIsUploading(true);

      try {
        const response = await fetch('/api/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64Url }),
        });
        if (!response.ok) throw new Error('Upload failed');
        const data = await response.json();
        onImageChange(data.url);
      } catch {
        // Fall back to base64 if upload fails
        onImageChange(base64Url);
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleGallerySelect = (imageId: number) => {
    const url = getPicsumUrl(imageId, 1200, 400);
    onImageChange(url);
  };

  const handleRemove = () => {
    onImageChange(undefined);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700">Header Image</h3>

      {/* Image source */}
      {!headerImageUrl ? (
        <div className="space-y-3">
          {/* Gallery grid */}
          <div className="grid grid-cols-3 gap-1.5">
            {HEADER_GALLERY.map((imageId) => (
              <button
                key={imageId}
                onClick={() => handleGallerySelect(imageId)}
                className="relative aspect-[3/2] rounded-md overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all hover:opacity-90"
              >
                <img
                  src={getPicsumUrl(imageId, 200, 133)}
                  alt={`Header option ${imageId}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>

          {/* Upload button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full px-3 py-2 rounded-lg border-2 border-dashed border-gray-300 text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? 'Uploading...' : 'Upload image'}
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
          {layoutMode === 'question-by-question' ? (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-600">Style</label>
                <select
                  value={headerStyle === 'banner' ? 'banner' : headerStyle === 'half-card' ? 'half-card' : 'integrated'}
                  onChange={(e) => {
                    const val = e.target.value as HeaderStyle;
                    onStyleChange(val);
                    if (val === 'integrated') {
                      onShapeChange('circle');
                    }
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="integrated">Circle</option>
                  <option value="banner">Banner</option>
                  <option value="half-card">Half Card</option>
                </select>
              </div>

              {/* Adjust crop for circle and half-card */}
              {(headerStyle === 'integrated' || headerStyle === 'half-card') && (
                <button
                  onClick={() => setShowCropDialog(true)}
                  className="w-full text-xs text-blue-600 hover:text-blue-800 py-1"
                >
                  Adjust crop position
                </button>
              )}
            </>
          ) : (
            <>
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
                    Shape
                  </button>
                </div>
              </div>

              {/* Shape selector (integrated only) */}
              {headerStyle === 'integrated' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-600">Shape</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onShapeChange('cloud')}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-all ${
                        headerImageShape === 'cloud'
                          ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                          : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                      }`}
                    >
                      Cloud
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
            </>
          )}

          {/* Change image */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full text-xs text-gray-500 hover:text-gray-700 py-1 disabled:opacity-50"
          >
            {isUploading ? 'Uploading...' : 'Change image'}
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
          headerStyle={headerStyle}
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
  headerStyle?: HeaderStyle;
  crop: HeaderImageCrop;
  onApply: (crop: HeaderImageCrop) => void;
  onClose: () => void;
}

function HeaderCropDialog({ imageUrl, shape, headerStyle, crop, onApply, onClose }: HeaderCropDialogProps) {
  const [localCrop, setLocalCrop] = useState<HeaderImageCrop>(crop);
  const [isDragging, setIsDragging] = useState(false);
  const [containerSize, setContainerSize] = useState<{ w: number; h: number }>({ w: 600, h: 400 });
  const [imgAspect, setImgAspect] = useState(16 / 9);
  const dragStart = useRef<{ x: number; y: number; cropX: number; cropY: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load image to get natural aspect ratio
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImgAspect(img.naturalWidth / img.naturalHeight);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Track container size for pixel-perfect circle
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerSize({ w: entry.contentRect.width, h: entry.contentRect.height });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Circle radius in pixels: 40% of the smaller dimension so it's always a perfect circle
  const radiusPx = Math.min(containerSize.w, containerSize.h) * 0.4;
  const radiusPctW = (radiusPx / containerSize.w) * 100;
  const radiusPctH = (radiusPx / containerSize.h) * 100;

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
    if (!isDragging || !dragStart.current || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const dx = ((e.clientX - dragStart.current.x) / rect.width) * 100;
    const dy = ((e.clientY - dragStart.current.y) / rect.height) * 100;

    // Prevent dragging the shape to positions where coverage scale becomes extreme
    const marginW = radiusPctW + 2;
    const marginH = radiusPctH + 2;

    setLocalCrop((prev) => ({
      ...prev,
      x: Math.max(marginW, Math.min(100 - marginW, dragStart.current!.cropX + dx)),
      y: Math.max(marginH, Math.min(100 - marginH, dragStart.current!.cropY + dy)),
    }));
  }, [isDragging, radiusPctW, radiusPctH]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    dragStart.current = null;
  }, []);

  // Generate clip-path using pixel-based radius converted to percentages
  const getShapeClipPath = () => {
    const cx = localCrop.x;
    const cy = localCrop.y;

    // Half-card: rectangular region (right-half card shape)
    if (headerStyle === 'half-card') {
      const rectW = containerSize.w * 0.45; // 45% of container width
      const rectH = containerSize.h * 0.8;  // 80% of container height
      const left = cx - (rectW / containerSize.w) * 50;
      const top = cy - (rectH / containerSize.h) * 50;
      const right = cx + (rectW / containerSize.w) * 50;
      const bottom = cy + (rectH / containerSize.h) * 50;
      // Rounded rectangle via inset with border-radius
      return `inset(${Math.max(0, top)}% ${Math.max(0, 100 - right)}% ${Math.max(0, 100 - bottom)}% ${Math.max(0, left)}% round 12px)`;
    }

    if (shape === 'circle') {
      return `circle(${radiusPx}px at ${cx}% ${cy}%)`;
    }
    // Cloud: generate a polygon with percentage coordinates, offset to the crop position
    // Shape covers shapeSize% of the container, centered at (cx%, cy%)
    const shapeSizePct = (radiusPx / containerSize.w) * 200; // shape width as % of container
    const shapeSizePctH = (radiusPx / containerSize.h) * 200; // shape height as % of container
    const pts = CLOUD_POLYGON_POINTS.map(([px, py]) => {
      const x = cx + (px - 50) * shapeSizePct / 100;
      const y = cy + (py - 50) * shapeSizePctH / 100;
      return `${x.toFixed(1)}% ${y.toFixed(1)}%`;
    });
    return `polygon(${pts.join(', ')})`;
  };

  // Shared image style for zoom
  const imageTransform = localCrop.scale > 1
    ? { transform: `scale(${localCrop.scale})`, transformOrigin: `${localCrop.x}% ${localCrop.y}%` }
    : {};

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Adjust Crop Position</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        {/* Image area */}
        <div className="p-5 flex-1 overflow-auto">
          <div
            ref={containerRef}
            className="relative w-full rounded-lg overflow-hidden cursor-grab active:cursor-grabbing select-none bg-gray-900"
            style={{ aspectRatio: `${imgAspect}` }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            {/* Full image (dimmed) */}
            <img
              src={imageUrl}
              alt=""
              className="absolute inset-0 w-full h-full object-cover brightness-[0.35]"
              style={imageTransform}
              draggable={false}
            />

            {/* Bright region: same image clipped to shape at crop position */}
            <div
              className="absolute inset-0"
              style={{ clipPath: getShapeClipPath() }}
            >
              <img
                src={imageUrl}
                alt=""
                className="w-full h-full object-cover"
                style={imageTransform}
                draggable={false}
              />
            </div>

            {/* Hint */}
            {!isDragging && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="bg-black/50 text-white text-sm px-4 py-1.5 rounded-full">
                  Drag to reposition
                </span>
              </div>
            )}
          </div>

          {/* Zoom slider */}
          <div className="mt-5 space-y-1.5">
            <div className="flex justify-between text-sm text-gray-600">
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
        <div className="flex gap-3 p-5 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onApply(localCrop)}
            className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 text-sm font-medium text-white hover:bg-blue-700"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
