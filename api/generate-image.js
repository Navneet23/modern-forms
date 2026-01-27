import { put } from '@vercel/blob';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title, description, colors, style, prompt: directPrompt } = req.body;

  // If directPrompt is provided, skip text generation and go straight to image
  // Otherwise, require title for prompt generation
  if (!directPrompt && !title) {
    return res.status(400).json({ error: 'Missing title or prompt parameter' });
  }

  // Get API key from environment variable
  const apiKey = process.env.GOOGLE_AI_STUDIO_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    let generatedPrompt = directPrompt || '';

    // Step 1: Generate detailed prompt using Gemini 2.5 Flash (skip if directPrompt provided)
    if (!directPrompt) {
      const promptGenerationRequest = `Create a detailed, descriptive prompt for generating a background image for a form.

Form title: "${title}"
${description ? `Form description: "${description}"` : ''}
Color palette: primary ${colors?.primary || '#4F46E5'}, secondary ${colors?.secondary || '#7C3AED'}, surface ${colors?.surface || '#FFFFFF'}
Style: ${style || 'Abstract - Geometric shapes, modern patterns, clean lines'}

Generate a detailed, vivid prompt that describes the background image. The prompt should:
- Be specific about colors, shapes, textures, and composition
- Match the requested style
- Be suitable for a form background (not too busy or distracting)
- Not include any text, logos, or watermarks in the image

Respond with ONLY the image generation prompt, nothing else.`;

      const textGenResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptGenerationRequest }] }],
          }),
        }
      );

      if (!textGenResponse.ok) {
        const errorData = await textGenResponse.json().catch(() => ({}));
        console.error('Prompt generation error:', textGenResponse.status, errorData);
        return res.status(textGenResponse.status).json({
          error: errorData.error?.message || `Prompt generation failed: ${textGenResponse.status}`,
        });
      }

      const textGenData = await textGenResponse.json();

      // Extract generated prompt
      if (textGenData.candidates && textGenData.candidates.length > 0) {
        const parts = textGenData.candidates[0].content?.parts || [];
        for (const part of parts) {
          if (part.text) {
            generatedPrompt = part.text.trim();
            break;
          }
        }
      }

      if (!generatedPrompt) {
        return res.status(500).json({ error: 'Failed to generate prompt' });
      }
    }

    // Step 2: Generate image using Gemini 2.5 Flash Image
    const imageGenResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: generatedPrompt }] }],
          generationConfig: {
            responseModalities: ['IMAGE', 'TEXT'],
          },
        }),
      }
    );

    if (!imageGenResponse.ok) {
      const errorData = await imageGenResponse.json().catch(() => ({}));
      console.error('Image generation error:', imageGenResponse.status, errorData);
      return res.status(imageGenResponse.status).json({
        error: errorData.error?.message || `Image generation failed: ${imageGenResponse.status}`,
        generatedPrompt, // Still return the prompt even if image fails
      });
    }

    const imageGenData = await imageGenResponse.json();

    // Extract the generated image
    if (imageGenData.candidates && imageGenData.candidates.length > 0) {
      const parts = imageGenData.candidates[0].content?.parts || [];

      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          const mimeType = part.inlineData.mimeType || 'image/png';
          const base64Data = part.inlineData.data;

          // Convert base64 to Buffer for upload
          const imageBuffer = Buffer.from(base64Data, 'base64');

          // Generate a unique filename
          const extension = mimeType.split('/')[1] || 'png';
          const filename = `ai-background-${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`;

          // Upload to Vercel Blob
          try {
            const blob = await put(filename, imageBuffer, {
              access: 'public',
              contentType: mimeType,
            });

            return res.status(200).json({
              imageUrl: blob.url,
              generatedPrompt,
            });
          } catch (uploadError) {
            console.error('Blob upload error:', uploadError);
            // Fallback to base64 if blob upload fails (e.g., in local dev without token)
            const imageUrl = `data:${mimeType};base64,${base64Data}`;
            return res.status(200).json({
              imageUrl,
              generatedPrompt,
              warning: 'Image stored as base64 - may not work in shared links',
            });
          }
        }
      }
    }

    return res.status(500).json({
      error: 'No image was generated',
      generatedPrompt,
    });
  } catch (error) {
    console.error('Generate image error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate image',
    });
  }
}
