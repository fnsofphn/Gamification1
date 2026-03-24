import { GoogleGenAI } from '@google/genai';
import { env } from './env';

// This demo initializes Gemini in the browser for faster setup.
// For production, proxy these requests through your backend.
export const geminiClient = env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: env.GEMINI_API_KEY })
  : null;
