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
    // Call Google AI Studio Imagen API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:generateImages?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          config: {
            numberOfImages: 1,
            aspectRatio: '16:9',
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Imagen API error:', response.status, errorText);
      return res.status(response.status).json({
        error: `Image generation failed: ${response.status}`,
        details: errorText,
      });
    }

    const data = await response.json();

    // Extract the generated image from the response
    // Imagen API returns base64 encoded images in generatedImages array
    if (data.generatedImages && data.generatedImages.length > 0) {
      const image = data.generatedImages[0];

      // The image is returned as base64 encoded data
      if (image.image && image.image.imageBytes) {
        const imageUrl = `data:image/png;base64,${image.image.imageBytes}`;
        return res.status(200).json({ imageUrl });
      }
    }

    return res.status(500).json({ error: 'No image was generated', response: data });
  } catch (error) {
    console.error('Generate image error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate image',
    });
  }
}
