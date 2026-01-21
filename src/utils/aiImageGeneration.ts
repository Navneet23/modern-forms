import type { ThemeColors } from '../types/theme';

/**
 * Builds an optimized prompt for AI image generation based on form context and theme colors
 */
export function buildImagePrompt(
  title: string,
  description: string | undefined,
  colors: ThemeColors
): string {
  const formContext = description
    ? `${title}. ${description}`
    : title;

  return `Abstract background image for a form about: ${formContext}.
Color palette: primary ${colors.primary}, surface ${colors.surface}, secondary ${colors.secondary}.
Style: modern, professional, subtle gradient, suitable as form background.
No text, no faces, abstract patterns or soft gradients.`;
}

/**
 * Generates a background image using Google AI Studio (Imagen)
 * This calls our serverless API endpoint which securely handles the API key
 */
export async function generateBackgroundImage(
  title: string,
  description: string | undefined,
  colors: ThemeColors
): Promise<{ imageUrl: string | null; error: string | null }> {
  const prompt = buildImagePrompt(title, description, colors);

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
