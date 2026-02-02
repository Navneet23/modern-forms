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

  const { image } = req.body;

  if (!image || !image.startsWith('data:')) {
    return res.status(400).json({ error: 'Missing or invalid base64 image data' });
  }

  try {
    // Parse the data URL: data:<mime>;base64,<data>
    const matches = image.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) {
      return res.status(400).json({ error: 'Invalid data URL format' });
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Generate a unique filename
    const extension = mimeType.split('/')[1] || 'png';
    const filename = `upload-${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`;

    // Upload to Vercel Blob
    const blob = await put(filename, imageBuffer, {
      access: 'public',
      contentType: mimeType,
    });

    return res.status(200).json({ url: blob.url });
  } catch (error) {
    console.error('Upload image error:', error);
    // Return the original base64 as fallback (e.g. local dev without blob token)
    return res.status(200).json({
      url: image,
      warning: 'Blob upload failed - returning original base64. Image may not work in shared links.',
    });
  }
}
