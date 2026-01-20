import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Get the path from the URL
  const { path } = req.query;
  const pathString = Array.isArray(path) ? path.join('/') : path || '';

  // Build the Google Forms URL
  const googleUrl = `https://docs.google.com/forms/${pathString}`;

  try {
    // Forward the request to Google Forms
    const response = await fetch(googleUrl, {
      method: req.method || 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ModernForms/1.0)',
      },
    });

    // Get the response body
    const body = await response.text();

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Return the response
    res.status(response.status).send(body);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Failed to fetch from Google Forms' });
  }
}
