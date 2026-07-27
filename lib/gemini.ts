import { GoogleGenAI } from '@google/genai';

export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your-gemini-api-key') {
    console.warn('GEMINI_API_KEY is not configured.');
    return null;
  }

  return new GoogleGenAI({ apiKey });
}
