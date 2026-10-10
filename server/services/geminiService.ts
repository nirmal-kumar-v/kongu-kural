import { GoogleGenerativeAI } from '@google/generative-ai';
import { getGeminiKeys, config } from '../config.js';
import { KnowledgeChunk } from './knowledgeService.js';
import { WebSearchResult } from './webSearchService.js';

export interface GeminiAnswerResponse {
  text: string;
  provider: string;
  usedKeyIndex: number;
}

/**
 * Executes a Gemini operation with automatic multi-key failover.
 * Tries GEMINI_API_KEY_1 -> GEMINI_API_KEY_2 -> GEMINI_API_KEY_3
 */
export async function executeGeminiWithFailover<T>(
  fn: (genAI: GoogleGenerativeAI, keyIndex: number) => Promise<T>
): Promise<{ result: T; usedKeyIndex: number }> {
  const keys = getGeminiKeys();
  if (keys.length === 0) {
    throw new Error('No Gemini API keys configured in .env (GEMINI_API_KEY_1, GEMINI_API_KEY_2, GEMINI_API_KEY_3)');
  }

  let lastError: any = null;

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    try {
      const genAI = new GoogleGenerativeAI(key);
      const result = await fn(genAI, i);
      return { result, usedKeyIndex: i + 1 };
    } catch (err: any) {
      console.warn(
        `[GeminiService] Request with Gemini Key #${i + 1} failed: ${err?.message || err}. Attempting failover...`
      );
      lastError = err;
    }
  }

  throw new Error(`All Gemini API keys failed. Last error: ${lastError?.message || lastError}`);
}

/**
 * Generate final answer using Gemini with the exact student language.
 */
export async function generateAnswerWithGemini(
  query: string,
  evidenceChunks: KnowledgeChunk[],
  webResults: WebSearchResult[] | null,
  detectedLanguage: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<GeminiAnswerResponse> {
  const isWebFallback = !evidenceChunks || evidenceChunks.length === 0;

  const systemInstruction = `You are Kongu Kural, the official and intelligent campus assistant for Kongu Engineering College (KEC), Perundurai, Erode.
CRITICAL INSTRUCTIONS:
1. Multilingual Output: Answer in the EXACT SAME LANGUAGE as the user's query (${detectedLanguage}).
   - Tamil query -> Answer in elegant, correct Tamil (தமிழ்).
   - Tanglish query -> Answer in friendly, natural Tanglish.
   - English query -> Answer in professional, clear English.
   - Hindi query -> Answer in Hindi.
2. Accuracy & Truthfulness:
   ${
     isWebFallback
       ? '- The local college-info.txt did not contain this information. You are given LIVE WEB SEARCH results.\n- State clearly that this information was retrieved via live web search since it is not yet present in the college-info.txt file.\n- Include verified web links when available.'
       : '- Use ONLY the provided college knowledge passages as your factual source.\n- Do NOT invent or hallucinate phone numbers, emails, names, or fees.\n- If a specific detail is not present in the passages, honestly state that it is not documented in the college files.'
   }
3. Formatting:
   - Use clean Markdown with bullet points, bold key terms, and neat tabular summaries where appropriate.
   - Be helpful, direct, and welcoming.`;

  let evidenceContext = '';
  if (isWebFallback) {
    evidenceContext = `SOURCE: LIVE INTERNET SEARCH RESULTS\n\n${
      webResults && webResults.length > 0
        ? webResults.map((r, i) => `[${i + 1}] ${r.title}\nURL: ${r.url}\nSummary: ${r.snippet}`).join('\n\n')
        : 'No specific web results found.'
    }`;
  } else {
    evidenceContext = `SOURCE: OFFICIAL COLLEGE INFORMATION (college-info.txt)\n\n${evidenceChunks
      .map(
        (c) =>
          `[Section: ${c.sectionTitle} (Line ${c.lineNumber})]\n${c.content}${
            c.urls.length > 0 ? `\nRelated URLs: ${c.urls.join(', ')}` : ''
          }`
      )
      .join('\n\n')}`;
  }

  const promptContent = `User Question: "${query}"

${evidenceContext}

Please generate the complete, accurate answer for the student now.`;

  // Candidate models to try in case one model code is unavailable
  const candidateModels = [
    config.geminiModel,
    'gemini-2.5-flash',
    'gemini-1.5-flash',
    'gemini-2.0-flash',
  ].filter(Boolean);

  const { result, usedKeyIndex } = await executeGeminiWithFailover(async (genAI) => {
    let lastModelErr: any = null;

    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction,
        });

        const validHistory = history.filter((h) => h && h.content).slice(-6);
        while (validHistory.length > 0 && validHistory[0].role !== 'user') {
          validHistory.shift();
        }

        const chat = model.startChat({
          history: validHistory.map((h) => ({
            role: h.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: h.content }],
          })),
        });

        const response = await chat.sendMessage(promptContent);
        const text = response.response.text();
        return { text, modelName };
      } catch (err: any) {
        lastModelErr = err;
        // If it's a model not found / unsupported error, try the next model candidate
        if (
          err?.message?.includes('not found') ||
          err?.message?.includes('unsupported') ||
          err?.status === 404
        ) {
          continue;
        }
        // Otherwise rethrow so key failover can trigger
        throw err;
      }
    }

    throw lastModelErr || new Error('No candidate Gemini model succeeded');
  });

  return {
    text: result.text,
    provider: `Gemini (${result.modelName})`,
    usedKeyIndex,
  };
}
