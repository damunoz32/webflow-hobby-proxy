const WEBFLOW_COLLECTION_ID = '68749d179596d5c6c446db80';

export default async function (req, res) {
// Set CORS headers for your Webflow domain
@@ -26,28 +19,28 @@
return;
}

      
      
if (req.method !== 'GET') {
res.status(405).json({ error: 'Method Not Allowed' });
return;
}

// Grab API token from Vercel
const WEBFLOW_API_TOKEN = process.env.WEBFLOW_API_TOKEN;

if (!WEBFLOW_API_TOKEN || !WEBFLOW_COLLECTION_ID) {
res.status(500).json({ error: 'Server configuration error: API Token or Collection ID missing.' });
return;
}

try {
const apiUrl = `https://api.webflow.com/v2/collections/${WEBFLOW_COLLECTION_ID}/items?live=true`;

const webflowResponse = await fetch(apiUrl, {
method: 'GET',
headers: {
'accept': 'application/json',
'Authorization': `Bearer ${WEBFLOW_API_TOKEN}`,
'User-Agent': 'Vercel-Webflow-Proxy/1.0',
'Accept-Version': '1.0.0'
},