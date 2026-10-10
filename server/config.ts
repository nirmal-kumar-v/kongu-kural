import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env if present (local development)
try {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  } else {
    dotenv.config();
  }
} catch {
  // On Vercel, environment variables are injected directly into process.env
}

function cleanKey(val: string | undefined): string | null {
  if (!val) return null;
  let trimmed = val.trim();
  // Strip optional surrounding single or double quotes
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    trimmed = trimmed.slice(1, -1).trim();
  }
  if (
    trimmed === '' ||
    trimmed.startsWith('your_') ||
    trimmed.startsWith('PASTE_') ||
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
    cleanKey(process.env.GEMINI_API_KEY),
    cleanKey(process.env.GEMINI_API_KEY_1),
    cleanKey(process.env.GEMINI_API_KEY_2),
    cleanKey(process.env.GEMINI_API_KEY_3),
  ].filter((k): k is string => Boolean(k));

  // Deduplicate while preserving order
  return Array.from(new Set(keys));
}

export function getGroqKeys(): string[] {
  const keys = [
    cleanKey(process.env.GROQ_API_KEY),
    cleanKey(process.env.GROQ_API_KEY_1),
    cleanKey(process.env.GROQ_API_KEY_2),
    cleanKey(process.env.GROQ_API_KEY_3),
  ].filter((k): k is string => Boolean(k));

  // Deduplicate while preserving order
  return Array.from(new Set(keys));
}

export function resolveCollegeInfoPath(): string {
  // 1. Explicit environment variable if configured
  if (process.env.COLLEGE_INFO_PATH && fs.existsSync(process.env.COLLEGE_INFO_PATH)) {
    return process.env.COLLEGE_INFO_PATH;
  }

  // 2. Candidate paths across local dev & Vercel serverless lambda containers
  // Check for college-info-2.txt first, then fallback to college-info.txt
  const fileNames = ['college-info-2.txt', 'college-info.txt'];
  const baseDirs = [
    process.cwd(),
    path.resolve(process.cwd(), '..'),
    __dirname,
    path.resolve(__dirname, '..'),
    path.resolve(__dirname, '..', '..'),
  ];

  for (const fileName of fileNames) {
    for (const baseDir of baseDirs) {
      const candidate = path.resolve(baseDir, fileName);
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    }
  }

  // Fallback to project root
  return path.resolve(process.cwd(), 'college-info-2.txt');
}

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  geminiModel: process.env.GEMINI_MODEL?.trim() || 'gemini-2.5-flash',
  groqModel: process.env.GROQ_MODEL?.trim() || 'llama-3.3-70b-versatile',
  get collegeInfoPath() {
    return resolveCollegeInfoPath();
  },
};
