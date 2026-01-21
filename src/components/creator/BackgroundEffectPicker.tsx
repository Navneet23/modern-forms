import type { BackgroundEffect } from '../../types/theme';

interface BackgroundEffectPickerProps {
  selectedEffect: BackgroundEffect;
  onEffectChange: (effect: BackgroundEffect) => void;
  backgroundColor: string;
  primaryColor: string;
  secondaryColor: string;
  disabled: boolean;
}

// Generate complementary colors based on the background color
function getComplementaryColor(hexColor: string, shift: number = 30): string {
  // Convert hex to HSL, shift hue, convert back
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  // Shift hue
  h = (h + shift / 360) % 1;

  // Convert back to RGB
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const newR = Math.round(hue2rgb(p, q, h + 1/3) * 255);
  const newG = Math.round(hue2rgb(p, q, h) * 255);
  const newB = Math.round(hue2rgb(p, q, h - 1/3) * 255);

  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

// Lighten or darken a color
function adjustBrightness(hexColor: string, percent: number): string {
  const hex = hexColor.replace('#', '');
  const r = Math.min(255, Math.max(0, parseInt(hex.substring(0, 2), 16) + percent));
  const g = Math.min(255, Math.max(0, parseInt(hex.substring(2, 4), 16) + percent));
  const b = Math.min(255, Math.max(0, parseInt(hex.substring(4, 6), 16) + percent));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

interface EffectPreviewProps {
  effect: BackgroundEffect;
  backgroundColor: string;
  primaryColor: string;
  secondaryColor: string;
  isSelected: boolean;
  onClick: () => void;
  disabled: boolean;
}

function EffectPreview({ effect, backgroundColor, primaryColor, secondaryColor, isSelected, onClick, disabled }: EffectPreviewProps) {
  // Use lighter versions of primary/secondary for shapes and gradient
  const primaryLight = adjustBrightness(primaryColor, 60);
  const secondaryLight = adjustBrightness(secondaryColor, 40);

  const getPreviewStyle = (): React.CSSProperties => {
    switch (effect) {
      case 'solid':
        return { backgroundColor };
      case 'textured':
        return {
          backgroundColor,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundBlendMode: 'soft-light',
        };
      case 'shapes':
        return { backgroundColor };
      case 'gradient':
        return {
          background: `linear-gradient(135deg, ${primaryLight} 0%, ${secondaryLight} 100%)`,
        };
      default:
        return { backgroundColor };
    }
  };

  const labels: Record<BackgroundEffect, string> = {
    solid: 'Solid',
    textured: 'Textured',
    shapes: 'Shapes',
    gradient: 'Gradient',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative flex flex-col items-center gap-1.5 p-1 rounded-lg transition-all
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-100 cursor-pointer'}
        ${isSelected && !disabled ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
      `}
    >
      <div
        className="w-14 h-14 rounded-lg overflow-hidden border border-gray-200 relative"
        style={getPreviewStyle()}
      >
        {/* Shapes overlay for preview */}
        {effect === 'shapes' && (
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
            <circle cx="20" cy="50" r="35" fill={primaryLight} opacity="0.6" />
            <circle cx="50" cy="60" r="30" fill={secondaryLight} opacity="0.5" />
            <circle cx="80" cy="40" r="40" fill={primaryColor} opacity="0.3" />
          </svg>
        )}
        {/* Texture overlay for preview */}
        {effect === 'textured' && (
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          />
        )}
      </div>
      <span className={`text-xs font-medium ${disabled ? 'text-gray-400' : 'text-gray-600'}`}>
        {labels[effect]}
      </span>
    </button>
  );
}

export function BackgroundEffectPicker({
  selectedEffect,
  onEffectChange,
  backgroundColor,
  primaryColor,
  secondaryColor,
  disabled,
}: BackgroundEffectPickerProps) {
  const effects: BackgroundEffect[] = ['solid', 'textured', 'shapes', 'gradient'];

  return (
    <div className={`space-y-3 ${disabled ? 'opacity-60' : ''}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Background Effect</h3>
        {disabled && (
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
            Image selected
          </span>
        )}
      </div>
      <div className="grid grid-cols-4 gap-1">
        {effects.map((effect) => (
          <EffectPreview
            key={effect}
            effect={effect}
            backgroundColor={backgroundColor}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            isSelected={selectedEffect === effect}
            onClick={() => !disabled && onEffectChange(effect)}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
}

// Export utility functions for use in layouts
export { getComplementaryColor, adjustBrightness };
