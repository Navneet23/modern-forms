import type { ThemeColors } from '../types/theme';

/**
 * Available contextual image generation styles
 * These are different from background image styles - focused on brand/positioning
 */
export type ContextualImageStyle = 'brand-hero' | 'topic-illustration' | 'lifestyle';

export interface ContextualImageStyleOption {
  id: ContextualImageStyle;
  name: string;
  description: string;
}

export const CONTEXTUAL_IMAGE_STYLES: ContextualImageStyleOption[] = [
  {
    id: 'brand-hero',
    name: 'Brand / Hero',
    description: 'Professional brand imagery with abstract elements, clean corporate feel',
  },
  {
    id: 'topic-illustration',
    name: 'Topic Illustration',
    description: 'Illustrative imagery related to the form subject matter',
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle',
    description: 'People-focused, aspirational imagery that evokes emotion',
  },
];

/**
 * Get the prompt context for each style
 */
function getStylePromptContext(style: ContextualImageStyle, formTitle: string, formDescription?: string): string {
  const formContext = formDescription
    ? `Form: "${formTitle}" - ${formDescription}`
    : `Form: "${formTitle}"`;

  switch (style) {
    case 'brand-hero':
      return `Create a professional, high-end brand hero image for a business form.
${formContext}

The image should:
- Feel premium and corporate, like a Fortune 500 company website hero
- Use clean, modern design with subtle abstract geometric elements
- Include soft gradients, light rays, or glass-morphism effects
- Convey professionalism, trust, and innovation
- NOT include any text, logos, faces, or specific brand elements
- Be suitable as a side panel image for a form interface
- Use a sophisticated color palette that complements business contexts`;

    case 'topic-illustration':
      return `Create an illustrative image that represents the topic and purpose of this form.
${formContext}

The image should:
- Visually represent what the form is about (e.g., job application = office/workspace, feedback = communication/collaboration)
- Use a modern illustration style with clean shapes and appealing colors
- Feel welcoming and approachable
- Include relevant symbolic elements related to the form's purpose
- NOT include any text, specific faces, or brand logos
- Work well as a side panel image that provides context
- Use colors that feel professional yet friendly`;

    case 'lifestyle':
      return `Create an aspirational lifestyle image that evokes positive emotions for form respondents.
${formContext}

The image should:
- Show abstract representations of people or human elements (silhouettes, hands, gestures)
- Convey warmth, connection, achievement, or collaboration
- Feel inspirational and motivating
- Use soft, warm lighting and natural tones
- NOT include recognizable faces or specific individuals
- Be suitable as a side panel image that encourages form completion
- Evoke feelings of success, belonging, or positive outcomes`;

    default:
      return `Create a professional image for a form interface.
${formContext}

The image should be high-quality, professional, and suitable as a side panel image.`;
  }
}

/**
 * Generates a contextual image using Google AI Studio (Gemini)
 * This uses a different prompt style focused on brand/positioning rather than backgrounds
 */
export async function generateContextualImage(
  title: string,
  description: string | undefined,
  colors: ThemeColors,
  style: ContextualImageStyle = 'brand-hero'
): Promise<{ imageUrl: string | null; generatedPrompt: string | null; error: string | null }> {
  const stylePromptContext = getStylePromptContext(style, title, description);

  try {
    const response = await fetch('/api/generate-contextual-image', {
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
        styleContext: stylePromptContext,
        style,
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
    console.error('Failed to generate contextual image:', error);
    return {
      imageUrl: null,
      generatedPrompt: null,
      error: error instanceof Error ? error.message : 'Failed to generate image',
    };
  }
}

/**
 * Regenerates a contextual image using a direct prompt (skips prompt generation)
 */
export async function regenerateContextualImageFromPrompt(
  prompt: string
): Promise<{ imageUrl: string | null; error: string | null }> {
  try {
    const response = await fetch('/api/generate-contextual-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || `API error: ${response.status}`;
      return {
        imageUrl: null,
        error: errorMessage,
      };
    }

    const data = await response.json();

    if (data.imageUrl) {
      return {
        imageUrl: data.imageUrl,
        error: null,
      };
    } else if (data.error) {
      return {
        imageUrl: null,
        error: data.error,
      };
    }

    return {
      imageUrl: null,
      error: 'No image was generated',
    };
  } catch (error) {
    console.error('Failed to regenerate contextual image:', error);
    return {
      imageUrl: null,
      error: error instanceof Error ? error.message : 'Failed to regenerate image',
    };
  }
}
