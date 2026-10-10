import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env at project root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

function cleanKey(val: string | undefined): string | null {
  if (!val) return null;
  const trimmed = val.trim();
  if (
    trimmed === '' ||
    trimmed.startsWith('your_') ||
    trimmed.includes('PLACEHOLDER') ||
    trimmed === 'undefined' ||
    trimmed === 'null'
  ) {
    return null;
  }
  return trimmed;
}

export function getGeminiKeys(): string[] {
  const keys = [
    cleanKey(process.env.GEMINI_API_KEY_1),
    cleanKey(process.env.GEMINI_API_KEY_2),
    cleanKey(process.env.GEMINI_API_KEY_3),
    cleanKey(process.env.GEMINI_API_KEY),
  ].filter((k): k is string => Boolean(k));

  // Deduplicate while preserving order
  return Array.from(new Set(keys));
}

export function getGroqKeys(): string[] {
  const keys = [
    cleanKey(process.env.GROQ_API_KEY_1),
    cleanKey(process.env.GROQ_API_KEY_2),
    cleanKey(process.env.GROQ_API_KEY_3),
    cleanKey(process.env.GROQ_API_KEY),
  ].filter((k): k is string => Boolean(k));

  // Deduplicate while preserving order
  return Array.from(new Set(keys));
}

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  geminiModel: process.env.GEMINI_MODEL?.trim() || 'gemini-2.5-flash',
  groqModel: process.env.GROQ_MODEL?.trim() || 'llama-3.3-70b-versatile',
  collegeInfoPath: path.resolve(process.cwd(), 'college-info.txt'),
};
