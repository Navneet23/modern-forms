import type { BackgroundEffect } from '../../types/theme';

interface BackgroundEffectRendererProps {
  effect: BackgroundEffect;
  backgroundColor: string;
  positionClass?: string;
}

// Generate complementary colors based on the background color
function getComplementaryColor(hexColor: string, shift: number = 30): string {
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

  h = (h + shift / 360) % 1;

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

function adjustBrightness(hexColor: string, percent: number): string {
  const hex = hexColor.replace('#', '');
  const r = Math.min(255, Math.max(0, parseInt(hex.substring(0, 2), 16) + percent));
  const g = Math.min(255, Math.max(0, parseInt(hex.substring(2, 4), 16) + percent));
  const b = Math.min(255, Math.max(0, parseInt(hex.substring(4, 6), 16) + percent));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export function BackgroundEffectRenderer({
  effect,
  backgroundColor,
  positionClass = 'fixed',
}: BackgroundEffectRendererProps) {
  const complementary = getComplementaryColor(backgroundColor, 40);
  const lighter = adjustBrightness(backgroundColor, 40);
  const darker = adjustBrightness(backgroundColor, -30);

  switch (effect) {
    case 'solid':
      return (
        <div
          className={`${positionClass} inset-0`}
          style={{ backgroundColor }}
          aria-hidden="true"
        />
      );

    case 'textured':
      return (
        <div className={`${positionClass} inset-0`} aria-hidden="true">
          <div
            className="absolute inset-0"
            style={{ backgroundColor }}
          />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          />
        </div>
      );

    case 'shapes':
      return (
        <div
          className={`${positionClass} inset-0 overflow-hidden`}
          style={{ backgroundColor }}
          aria-hidden="true"
        >
          <svg
            className="absolute w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid slice"
          >
            {/* Large circle bottom left */}
            <circle cx="10" cy="90" r="50" fill={lighter} opacity="0.5" />
            {/* Medium circle center */}
            <circle cx="50" cy="50" r="35" fill={complementary} opacity="0.3" />
            {/* Large circle top right */}
            <circle cx="90" cy="20" r="45" fill={darker} opacity="0.4" />
            {/* Small accent circle */}
            <circle cx="70" cy="70" r="20" fill={lighter} opacity="0.3" />
          </svg>
        </div>
      );

    case 'gradient':
      return (
        <div
          className={`${positionClass} inset-0`}
          style={{
            background: `linear-gradient(135deg, ${backgroundColor} 0%, ${complementary} 100%)`,
          }}
          aria-hidden="true"
        />
      );

    default:
      return (
        <div
          className={`${positionClass} inset-0`}
          style={{ backgroundColor }}
          aria-hidden="true"
        />
      );
  }
}
