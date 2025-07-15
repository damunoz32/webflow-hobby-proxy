// api/generate-description.js
// This serverless function acts as a secure proxy to the Google Gemini API.
// It receives a prompt from your frontend, calls Gemini, and returns the generated text.

module.exports = async (req, res) => {
    // Set CORS headers to allow requests from your Webflow domain
    // IMPORTANT: Replace 'https://webflow-portfolio-site---project.webflow.io' with your actual Webflow domain
    // For local testing, you might need to add 'http://localhost:3000' or '*' temporarily,
    // but always restrict it to your specific domain(s) for production
    res.setHeader('Access-Control-Allow-Origin', 'https://webflow-portfolio-site---project.webflow.io');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight OPTIONS request for CORS
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Ensure it's a POST request
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed. Only POST requests are accepted.' });
    }

    // Get the API key from Vercel environment variables
    // This key is NOT exposed in your client-side code, keeping it secure.
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
        console.error('GEMINI_API_KEY is not set in Vercel environment variables.');
        return res.status(500).json({ error: 'Server configuration error: API key missing.' });
    }

    // Parse the request body to get the user's prompt
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required in the request body.' });
    }

    try {
        // Construct the payload for the Gemini API call
        const payload = {
            contents: [{
                role: "user",
                parts: [{ text: prompt }]
            }],
            generationConfig: {
                // You can adjust these parameters for different outputs
                // temperature: 0.7,
                // topK: 40,
                // topP: 0.95,
                // maxOutputTokens: 500,
            }
        };

        // Make the request to the Google Gemini API
        const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

        const geminiResponse = await fetch(geminiApiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!geminiResponse.ok) {
            const errorData = await geminiResponse.json();
            console.error('Gemini API error:', errorData);
            return res.status(geminiResponse.status).json({
                error: 'Failed to get response from Gemini API',
                details: errorData.error ? errorData.error.message : 'Unknown Gemini error',
            });
        }

        const geminiResult = await geminiResponse.json();

        // Extract the generated text
        let generatedText = "No content generated.";
        if (geminiResult.candidates && geminiResult.candidates.length > 0 &&
            geminiResult.candidates[0].content && geminiResult.candidates[0].content.parts &&
            geminiResult.candidates[0].content.parts.length > 0) {
            generatedText = geminiResult.candidates[0].content.parts[0].text;
        }

        // Send the generated text back to the frontend
        res.status(200).json({ generatedText });

    } catch (error) {
        console.error('Serverless function error:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};
