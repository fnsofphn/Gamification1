import { GoogleGenAI } from '@google/genai';

const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({
      error: 'Missing GEMINI_API_KEY on the server. Add it in Vercel Project Settings -> Environment Variables.',
    });
    return;
  }

  try {
    const { prompt } = req.body || {};

    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ error: 'Missing prompt' });
      return;
    }

    const client = new GoogleGenAI({ apiKey });
    const response = await client.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    res.status(200).json({ text: response.text || '' });
  } catch (error: any) {
    res.status(500).json({
      error: error?.message || 'Gemini request failed',
    });
  }
}
