export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  // Get the Google Forms path from query parameter
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  // Build the Google Forms URL
  const googleUrl = url.startsWith('http') ? url : `https://docs.google.com/forms/${url}`;

  try {
    const fetchOptions = {
      method: req.method || 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    };

    // For POST requests, forward the body as URL-encoded form data
    if (req.method === 'POST' && req.body) {
      let formBody;

      // Handle different body formats
      if (typeof req.body === 'string') {
        formBody = req.body;
      } else if (typeof req.body === 'object') {
        // Convert object to URL-encoded string
        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(req.body)) {
          if (Array.isArray(value)) {
            // Handle array values (checkboxes)
            value.forEach(v => params.append(key, v));
          } else {
            params.append(key, value);
          }
        }
        formBody = params.toString();
      }

      if (formBody) {
        fetchOptions.body = formBody;
        fetchOptions.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      }
    }

    // Forward the request to Google Forms
    const response = await fetch(googleUrl, fetchOptions);

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
