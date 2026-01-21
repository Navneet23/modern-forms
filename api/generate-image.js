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

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt parameter' });
  }

  // Get API key from environment variable
  const apiKey = process.env.GOOGLE_AI_STUDIO_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    // Call Gemini 2.0 Flash Image Generation API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseModalities: ['IMAGE', 'TEXT'],
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Gemini API error:', response.status, errorData);
      return res.status(response.status).json({
        error: errorData.error?.message || `Image generation failed: ${response.status}`,
      });
    }

    const data = await response.json();

    // Extract the generated image from the response
    if (data.candidates && data.candidates.length > 0) {
      const parts = data.candidates[0].content?.parts || [];

      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          const mimeType = part.inlineData.mimeType || 'image/png';
          const imageUrl = `data:${mimeType};base64,${part.inlineData.data}`;
          return res.status(200).json({ imageUrl });
        }
      }
    }

    return res.status(500).json({ error: 'No image was generated' });
  } catch (error) {
    console.error('Generate image error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate image',
    });
  }
}
