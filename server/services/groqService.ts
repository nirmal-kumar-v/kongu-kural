import Groq from 'groq-sdk';
import { getGroqKeys, config } from '../config.js';
import { KnowledgeChunk } from './knowledgeService.js';

export interface SemanticAnalysisResult {
  detectedLanguage: string;
  intent: string;
  selectedChunks: KnowledgeChunk[];
  foundInFile: boolean;
  suggestedWebQuery?: string;
}

/**
 * Execute a Groq API call with automatic multi-key failover.
 * Tries GROQ_API_KEY_1 -> GROQ_API_KEY_2 -> GROQ_API_KEY_3
 */
export async function executeGroqWithFailover<T>(
  fn: (client: Groq, keyIndex: number) => Promise<T>
): Promise<{ result: T; usedKeyIndex: number }> {
  const keys = getGroqKeys();
  if (keys.length === 0) {
    throw new Error('No Groq API keys configured in .env (GROQ_API_KEY_1, GROQ_API_KEY_2, GROQ_API_KEY_3)');
  }

  let lastError: any = null;

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    try {
      const client = new Groq({ apiKey: key });
      const result = await fn(client, i);
      return { result, usedKeyIndex: i + 1 };
    } catch (err: any) {
      console.warn(
        `[GroqService] Request with Groq Key #${i + 1} failed: ${err?.message || err}. Attempting failover...`
      );
      lastError = err;
    }
  }

  throw new Error(`All Groq API keys failed. Last error: ${lastError?.message || lastError}`);
}

/**
 * Uses Groq to understand the user's intent across languages (English, Tamil, Tanglish, Hindi)
 * and semantically selects relevant chunks from the college knowledge file.
 */
export async function analyzeQueryAndSelectEvidence(
  query: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }>,
  candidateChunks: KnowledgeChunk[]
): Promise<SemanticAnalysisResult> {
  // If candidate chunks are empty, the file is empty
  if (candidateChunks.length === 0) {
    return {
      detectedLanguage: 'English',
      intent: query,
      selectedChunks: [],
      foundInFile: false,
      suggestedWebQuery: `Kongu Engineering College ${query}`,
    };
  }

  const chunksPayload = candidateChunks.map((c) => ({
    id: c.id,
    section: c.sectionTitle,
    textSnippet: c.content,
  }));

  const systemPrompt = `You are the Semantic Understanding Engine for Kongu Kural (Kongu Engineering College assistant).
Your task is to analyze user queries across English, Tamil, Tanglish (Tamil in Roman script), and other Indian languages.
Cross-lingual understanding is required:
Example: "ஹாஸ்டல் வார்டன் யார்?" or "Hostel warden yaaru?" matches section "Hostel Staff Details" / "CHIEF WARDEN".

You will inspect the candidate passages from the college-info.txt file and determine which passages contain direct or related facts to answer the question.
If the information requested is NOT present in any candidate passage, set "foundInFile": false and provide an optimal search query for Kongu Engineering College web search in "suggestedWebQuery".

Respond ONLY in valid JSON matching this schema:
{
  "detectedLanguage": "English" | "Tamil" | "Tanglish" | "Hindi" | "Other",
  "intent": "Brief summary of what the user wants to know",
  "foundInFile": true | false,
  "selectedChunkIds": ["chunk_1", ...],
  "suggestedWebQuery": "Kongu Engineering College [keywords]"
}`;

  const userPrompt = `Conversation History:
${history.slice(-4).map((h) => `${h.role}: ${h.content}`).join('\n') || 'None'}

Current User Question:
"${query}"

Candidate Passages:
${JSON.stringify(chunksPayload, null, 2)}

Analyze query intent, match passages semantically, and output JSON.`;

  try {
    const { result } = await executeGroqWithFailover(async (client) => {
      const completion = await client.chat.completions.create({
        model: config.groqModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' },
      });
      return completion.choices[0]?.message?.content || '{}';
    });

    const parsed = JSON.parse(result);
    const selectedIds = new Set(parsed.selectedChunkIds || []);
    const selected = candidateChunks.filter((c) => selectedIds.has(c.id));

    // If Groq found chunks
    const foundInFile = Boolean(parsed.foundInFile && selected.length > 0);

    return {
      detectedLanguage: parsed.detectedLanguage || 'English',
      intent: parsed.intent || query,
      selectedChunks: foundInFile ? selected : [],
      foundInFile,
      suggestedWebQuery: parsed.suggestedWebQuery || `Kongu Engineering College ${query}`,
    };
  } catch (err: any) {
    console.error('[GroqService] Semantic analysis failed:', err?.message || err);
    // Safe heuristic fallback:
    return {
      detectedLanguage: 'English',
      intent: query,
      selectedChunks: candidateChunks.slice(0, 3),
      foundInFile: candidateChunks.length > 0,
      suggestedWebQuery: `Kongu Engineering College ${query}`,
    };
  }
}

/**
 * Fallback answer generation using Groq if Gemini is unavailable.
 */
export async function generateAnswerWithGroq(
  query: string,
  evidenceChunks: KnowledgeChunk[],
  webResultsText: string | null,
  detectedLanguage: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<{ text: string; provider: string }> {
  const isWebFallback = !evidenceChunks || evidenceChunks.length === 0;

  const systemPrompt = `You are Kongu Kural, the official, intelligent multilingual assistant for Kongu Engineering College (KEC), Perundurai, Erode.
Answer principles:
1. Provide accurate, helpful, and natural answers.
2. ANSWER IN THE SAME LANGUAGE AS THE USER (${detectedLanguage}).
   - If Tamil: Answer in fluent Tamil.
   - If Tanglish: Answer naturally in friendly Tanglish.
   - If English: Answer in polished English.
   - If Hindi: Answer in Hindi.
3. ${
    isWebFallback
      ? 'The local college-info.txt did not contain this info. Use the provided LIVE WEB SEARCH results. Clearly mention at the top or bottom that this was retrieved from web search.'
      : 'Use ONLY the provided college knowledge passages as source of truth. Do NOT fabricate contacts, fees, or dates.'
  }
4. Format with clean bullet points, bold highlights, and readable structure.`;

  const contextContent = isWebFallback
    ? `LIVE WEB SEARCH RESULTS:\n${webResultsText || 'No web results available.'}`
    : `OFFICIAL COLLEGE KNOWLEDGE PASSAGES:\n${evidenceChunks
        .map((c) => `[Section: ${c.sectionTitle}]\n${c.content}`)
        .join('\n\n')}`;

  const messages: any[] = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-4).map((h) => ({ role: h.role, content: h.content })),
    {
      role: 'user',
      content: `Question: ${query}\n\nEvidence Context:\n${contextContent}`,
    },
  ];

  const { result } = await executeGroqWithFailover(async (client) => {
    const completion = await client.chat.completions.create({
      model: config.groqModel,
      messages,
      temperature: 0.3,
    });
    return completion.choices[0]?.message?.content || '';
  });

  return {
    text: result,
    provider: `Groq (${config.groqModel}) [Fallback]`,
  };
}
