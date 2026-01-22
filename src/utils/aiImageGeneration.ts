import type { ThemeColors } from '../types/theme';

/**
 * Available image generation styles
 */
export type ImageStyle = 'abstract' | 'professional' | 'artistic' | 'animated' | 'watercolor' | 'cyberpunk';

export interface ImageStyleOption {
  id: ImageStyle;
  name: string;
  description: string;
}

export const IMAGE_STYLES: ImageStyleOption[] = [
  {
    id: 'abstract',
    name: 'Abstract',
    description: 'Geometric shapes, modern patterns, clean lines',
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Clean, corporate feel, subtle textures, business-appropriate',
  },
  {
    id: 'artistic',
    name: 'Artistic',
    description: 'Bold brushstrokes, paint textures, expressive feel',
  },
  {
    id: 'animated',
    name: 'Animated',
    description: 'Cartoon-like, vibrant colors, playful illustration style',
  },
  {
    id: 'watercolor',
    name: 'Watercolor',
    description: 'Soft watercolor painting, flowing colors, organic textures',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    description: 'Neon colors, futuristic tech aesthetic, dark with glowing elements',
  },
];

/**
 * Generates a background image using Google AI Studio (Gemini)
 * This calls our serverless API endpoint which:
 * 1. Uses Gemini 2.5 Flash to generate a detailed prompt
 * 2. Uses Gemini 2.5 Flash Image to generate the image
 */
export async function generateBackgroundImage(
  title: string,
  description: string | undefined,
  colors: ThemeColors,
  style: ImageStyle = 'artistic'
): Promise<{ imageUrl: string | null; generatedPrompt: string | null; error: string | null }> {
  const styleOption = IMAGE_STYLES.find(s => s.id === style) || IMAGE_STYLES[0];

  try {
    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        description,
        colors: {
          primary: colors.primary,
          secondary: colors.secondary,
          surface: colors.surface,
        },
        style: `${styleOption.name} - ${styleOption.description}`,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || `API error: ${response.status}`;
      return {
        imageUrl: null,
        generatedPrompt: errorData.generatedPrompt || null,
        error: errorMessage,
      };
    }

    const data = await response.json();

    if (data.imageUrl) {
      return {
        imageUrl: data.imageUrl,
        generatedPrompt: data.generatedPrompt || null,
        error: null,
      };
    } else if (data.error) {
      return {
        imageUrl: null,
        generatedPrompt: data.generatedPrompt || null,
        error: data.error,
      };
    }

    return {
      imageUrl: null,
      generatedPrompt: null,
      error: 'No image was generated',
    };
  } catch (error) {
    console.error('Failed to generate image:', error);
    return {
      imageUrl: null,
      generatedPrompt: null,
      error: error instanceof Error ? error.message : 'Failed to generate image',
    };
  }
}
