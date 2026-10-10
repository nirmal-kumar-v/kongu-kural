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

STRICT INSTRUCTIONS:
1. ALWAYS PRIORITIZE college-info.txt FIRST:
   - If candidate passages contain ANY direct, approximate, or related information (such as cut-offs, ranks, admissions, hostel, wardens, sports, courses, fees, placements), you MUST set "foundInFile": true and select the relevant chunk IDs.
   - Do NOT set "foundInFile": false if the passages discuss the topic, even if they mention estimates or [VERIFY].
   - ONLY set "foundInFile": false if the topic is completely absent from all candidate passages.

2. UNDERSTAND THE USER'S EXACT INTENT:
   - "Cut-off" / "cutoff marks" refers to normalized marks out of 200.
   - "Rank" refers to TNEA merit rank numbers.
   - Recognize questions in Tamil (தமிழ்), Tanglish, English, and Hindi.

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

  const systemPrompt = `You are Kongu Kural, the direct and intelligent campus assistant for Kongu Engineering College (KEC), Perundurai, Erode.

CORE ANSWERING RULES (STRICT):
1. DIRECT EXPECTED ANSWER ONLY — GIVE JUST THE RIGHT AMOUNT OF INFORMATION:
   - Provide exactly what the user is expecting to know. Answer the question directly.
   - Do NOT dump huge irrelevant catalogs or walls of text (e.g. if asked about the HoD of a department, give that HoD's name, designation, and contact details—do NOT dump all 40 department faculty members).
   - If asked about hostel fees, state the fee range and meal details directly—do NOT dump all hostel blocks, rules, and warden rosters.
   - Do NOT give too little data either (no lazy one-word replies). Provide complete, concrete facts (names, phone numbers, emails, amounts, timings) that fully satisfy the query.
   - Start immediately with the core answer. Do NOT waste space on filler intros ("Hello! As the AI assistant...") or sign-off pleasantries.

2. EXACT RELEVANCE — CUT-OFF MARKS vs. RANK (CRITICAL):
   - If the user asks for CUT-OFF (கட் ஆஃப் / Cutoff marks / Cut-off):
     * Provide CUT-OFF MARKS out of 200 (e.g. CSE / IT / AI-DS: 185–193+ out of 200; ECE / EEE: 175–184 out of 200; core branches: 150–170 out of 200).
     * NEVER reply with the TNEA rank number when the user asked for cutoff marks!
   - If the user asks for RANK (தரவரிசை / Closing Rank / Rank list):
     * Provide the TNEA closing rank numbers (e.g. CSE closing rank around 20,000; up to 55,000+ for other branches).
     * NEVER substitute rank with cutoff marks when rank was asked!
   - Always understand the precise intent: Answer exactly what is asked with laser precision.

3. NEVER REDIRECT USERS TO WEBSITE LINKS — PROVIDE THE DATA YOURSELF:
   - NEVER tell the user to "visit the official website", "check the link below", "refer to the college portal", or "find the information online".
   - You MUST extract, synthesize, and provide the actual data yourself. The user asked YOU for the answer, not for a link to browse.
   - Do NOT include generic disclaimers telling the user to check the website.
   - Only provide a URL if the user explicitly asked for a website link or portal address.

4. MULTILINGUAL FIDELITY:
   - Answer in the EXACT SAME LANGUAGE as the user's query (${detectedLanguage}):
     * Tamil query -> Fluent, accurate Tamil (தமிழ்).
     * Tanglish query -> Natural, easy-to-read Tanglish.
     * English query -> Clean, professional, direct English.
     * Hindi query -> Natural Hindi.

5. FACTUAL ACCURACY:
   ${
     isWebFallback
       ? 'The requested topic was not in local files. Synthesize and provide the actual facts directly from web search results without telling the student to browse links.'
       : 'Use the provided college knowledge passages as your factual truth. Present the estimated cutoff figures directly if requested.'
   }

6. CLEAN PRESENTATION:
   - Use clean, well-spaced bullet points and bold highlights for key details so it reads effortlessly on both website chat and mobile SMS.`;

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
      content: `Question: ${query}\n\nEvidence Context:\n${contextContent}\n\nProvide the direct, complete answer containing exactly what the user expects. Give the data itself; do not tell them to visit links or check websites.`,
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
