export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  success: string;
}

export type BackgroundEffect = 'solid' | 'textured' | 'shapes' | 'gradient';

export type ContextualImageCropShape = 'none' | 'oval' | 'hexagon' | 'arch' | 'blob';

export interface ContextualImageCropSettings {
  shape: ContextualImageCropShape;
  position: { x: number; y: number }; // Percentage 0-100, position of crop area on original image
  scale: number; // Scale factor for the shape size (1 = default, 0.5 = half, 2 = double)
}

export interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  colors: ThemeColors;
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  fontFamily: string;
  headerImageUrl?: string;
  backgroundImageUrl?: string;
  backgroundEffect?: BackgroundEffect;
  contextualImageUrl?: string; // Used in Q-by-Q Immersive layout
  contextualImageCrop?: ContextualImageCropSettings; // Crop settings for contextual image
}

export const borderRadiusValues = {
  none: '0px',
  sm: '4px',
  md: '8px',
  lg: '16px',
  xl: '24px',
  full: '9999px',
};

export function themeToCSS(theme: ThemeConfig): Record<string, string> {
  return {
    '--theme-primary': theme.colors.primary,
    '--theme-secondary': theme.colors.secondary,
    '--theme-background': theme.colors.background,
    '--theme-surface': theme.colors.surface,
    '--theme-text': theme.colors.text,
    '--theme-text-secondary': theme.colors.textSecondary,
    '--theme-border': theme.colors.border,
    '--theme-error': theme.colors.error,
    '--theme-success': theme.colors.success,
    '--theme-radius': borderRadiusValues[theme.borderRadius],
    '--theme-font': theme.fontFamily,
  };
}
