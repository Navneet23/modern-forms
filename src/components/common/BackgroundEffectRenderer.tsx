import type { BackgroundEffect } from '../../types/theme';

interface BackgroundEffectRendererProps {
  effect: BackgroundEffect;
  backgroundColor: string;
  primaryColor: string;
  secondaryColor: string;
  positionClass?: string;
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
  primaryColor,
  secondaryColor,
  positionClass = 'fixed',
}: BackgroundEffectRendererProps) {
  // Use lighter versions of primary/secondary for softer backgrounds
  const primaryLight = adjustBrightness(primaryColor, 80);
  const secondaryLight = adjustBrightness(secondaryColor, 60);
  const primaryMedium = adjustBrightness(primaryColor, 40);

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
            <circle cx="10" cy="90" r="50" fill={primaryLight} opacity="0.6" />
            {/* Medium circle center */}
            <circle cx="50" cy="50" r="35" fill={secondaryLight} opacity="0.5" />
            {/* Large circle top right */}
            <circle cx="90" cy="20" r="45" fill={primaryMedium} opacity="0.4" />
            {/* Small accent circle */}
            <circle cx="70" cy="70" r="20" fill={secondaryLight} opacity="0.4" />
          </svg>
        </div>
      );

    case 'gradient':
      return (
        <div
          className={`${positionClass} inset-0`}
          style={{
            background: `linear-gradient(135deg, ${primaryLight} 0%, ${secondaryLight} 100%)`,
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
