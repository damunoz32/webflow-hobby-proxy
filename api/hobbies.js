    // api/hobbies.js
    // This is a simple Vercel Serverless Function that acts as a proxy
    // to fetch data from the Webflow CMS API and bypass CORS issues.

    // --- IMPORTANT: Store your Webflow API Token as an Environment Variable in Vercel ---
    // DO NOT hardcode your API token here.
    // In Vercel Project Settings -> Environment Variables, add:
    // Name: WEBFLOW_API_TOKEN
    // Value: YOUR_WEBFLOW_API_TOKEN (the one you generated in Webflow)

    // --- IMPORTANT: Replace with your actual Webflow Hobbies Collection ID ---
    const WEBFLOW_COLLECTION_ID = 'YOUR_WEBFLOW_HOBBIES_COLLECTION_ID'; // <<< REPLACE THIS

    export default async function (req, res) {
      // Set CORS headers for your Webflow domain
      // Replace 'https://webflow-portfolio-site---project.webflow.io' with your actual Webflow published domain
      // If you have a custom domain, use that instead.
      // For development/testing, you can use '*' but narrow it down for production.
      res.setHeader('Access-Control-Allow-Origin', 'https://webflow-portfolio-site---project.webflow.io');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

      // Handle preflight requests (OPTIONS method)
      if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
      }

      // Ensure it's a GET request
      if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method Not Allowed' });
        return;
      }

      // Get the API token from Vercel's environment variables
      const WEBFLOW_API_TOKEN = process.env.WEBFLOW_API_TOKEN;

      if (!WEBFLOW_API_TOKEN || !WEBFLOW_COLLECTION_ID) {
        res.status(500).json({ error: 'Server configuration error: API Token or Collection ID missing.' });
        return;
      }

      try {
        const apiUrl = `https://api.webflow.com/collections/${WEBFLOW_COLLECTION_ID}/items?live=true`;

        const webflowResponse = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'Authorization': `Bearer ${WEBFLOW_API_TOKEN}`,
            'User-Agent': 'Vercel-Webflow-Proxy/1.0',
            'Accept-Version': '1.0.0'
          },
        });

        if (!webflowResponse.ok) {
          const errorText = await webflowResponse.text();
          console.error(`Webflow API Error: ${webflowResponse.status} - ${errorText}`);
          res.status(webflowResponse.status).json({ error: `Webflow API Error: ${webflowResponse.status}`, details: errorText });
          return;
        }

        const data = await webflowResponse.json();
        res.status(200).json(data); // Send the data back to the client
      } catch (error) {
        console.error('Proxy fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch data from Webflow API via proxy.', details: error.message });
      }
    }
    