// api/hobbies.js

module.exports = async (req, res) => {
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight OPTIONS request for CORS
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed. Only GET requests are accepted.' });
    }

    // Grab the API key and Collection ID from Vercel.
    const WEBFLOW_API_TOKEN = process.env.WEBFLOW_API_TOKEN;
    const WEBFLOW_COLLECTION_ID = process.env.WEBFLOW_COLLECTION_ID; 

    if (!WEBFLOW_API_TOKEN || !WEBFLOW_COLLECTION_ID) {
        console.error('WEBFLOW_API_TOKEN or WEBFLOW_COLLECTION_ID is not set in Vercel environment variables.');
        return res.status(500).json({ error: 'Server configuration error: Webflow API key or Collection ID missing.' });
    }

    try {
        // Construct the API URL for your Hobbies collection using the v2 endpoint
        const webflowApiUrl = `https://api.webflow.com/v2/collections/${WEBFLOW_COLLECTION_ID}/items?live=true`;

        // Make the API request to Webflow CMS
        const webflowResponse = await fetch(webflowApiUrl, {
            method: 'GET',
            headers: {
                'accept': 'application/json',
                'Authorization': `Bearer ${WEBFLOW_API_TOKEN}`,
                'User-Agent': 'Webflow-React-App-Proxy/1.0', 
                'Accept-Version': '1.0.0' 
            },
        });

        if (!webflowResponse.ok) {
            const errorData = await webflowResponse.json();
            console.error('Webflow API error:', errorData);
            return res.status(webflowResponse.status).json({
                error: 'Failed to fetch data from Webflow CMS',
                details: errorData.message || 'Unknown Webflow error',
            });
        }

        const data = await webflowResponse.json();

        // Receive the data 
        res.status(200).json(data);

    } catch (error) {
        console.error('Serverless function error:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};
