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
 * Builds an optimized prompt for AI image generation based on form context, theme colors, and style
 */
export function buildImagePrompt(
  title: string,
  description: string | undefined,
  colors: ThemeColors,
  style: ImageStyle = 'abstract'
): string {
  const styleOption = IMAGE_STYLES.find(s => s.id === style) || IMAGE_STYLES[0];

  return `Create a background image for a form with title: "${title}"${description ? `. The form description is: "${description}"` : ''}.
Color palette to use: primary ${colors.primary}, secondary ${colors.secondary}, surface ${colors.surface}.
Style: ${styleOption.description}.
The image should be suitable as a form background. No text, no faces, no people.`;
}

/**
 * Generates a background image using Google AI Studio (Gemini)
 * This calls our serverless API endpoint which securely handles the API key
 */
export async function generateBackgroundImage(
  title: string,
  description: string | undefined,
  colors: ThemeColors,
  style: ImageStyle = 'abstract'
): Promise<{ imageUrl: string | null; error: string | null }> {
  const prompt = buildImagePrompt(title, description, colors, style);

  try {
    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || `API error: ${response.status}`;
      return { imageUrl: null, error: errorMessage };
    }

    const data = await response.json();

    if (data.imageUrl) {
      return { imageUrl: data.imageUrl, error: null };
    } else if (data.error) {
      return { imageUrl: null, error: data.error };
    }

    return { imageUrl: null, error: 'No image was generated' };
  } catch (error) {
    console.error('Failed to generate image:', error);
    return {
      imageUrl: null,
      error: error instanceof Error ? error.message : 'Failed to generate image',
    };
  }
}
