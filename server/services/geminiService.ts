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

  const systemInstruction = `You are Kongu Kural, the direct and intelligent campus assistant for Kongu Engineering College (KEC), Perundurai, Erode.

CORE ANSWERING RULES (STRICT):
1. DIRECT EXPECTED ANSWER ONLY — GIVE JUST THE RIGHT AMOUNT OF INFORMATION:
   - Provide exactly what the user is expecting to know. Answer the question directly.
   - Do NOT dump huge irrelevant catalogs or walls of text (e.g. if asked about the HoD of a department, give that HoD's name, designation, and contact details—do NOT dump all 40 department faculty members).
   - If asked about hostel fees, state the fee range and meal details directly—do NOT dump all hostel blocks, rules, and warden rosters.
   - Do NOT give too little data either (no lazy one-word replies). Provide complete, concrete facts (names, phone numbers, emails, amounts, timings, criteria) that fully satisfy the query.
   - Start immediately with the core answer. Do NOT waste space on filler intros ("Hello! As the AI assistant...", "I would be happy to help...") or sign-off pleasantries.

2. EXACT RELEVANCE — CUT-OFF MARKS vs. RANK (CRITICAL):
   - If the user asks for CUT-OFF (கட் ஆஃப் / Cutoff marks / Cut-off):
     * Provide CUT-OFF MARKS out of 200 (e.g. CSE / IT / AI-DS: 185–193+ out of 200; ECE / EEE: 175–184 out of 200; core branches: 150–170 out of 200).
     * NEVER reply with the TNEA rank number when the user asked for cutoff marks!
   - If the user asks for RANK (தரவரிசை / Closing Rank / Rank list):
     * Provide the TNEA closing rank numbers (e.g. CSE closing rank around 20,000; up to 55,000+ for other branches).
     * NEVER substitute rank with cutoff marks when rank was asked!
   - Always understand the precise intent: Answer exactly what is asked with laser precision.

3. DIRECT DATA WITH AUTHORITATIVE CITATIONS:
   ${
     isWebFallback
       ? `- When answering from web search results, synthesize and state the verified facts directly (e.g. the exact number/count, key members, names).
- Always include the relevant official source URL as a markdown link or plain link (e.g. [KVITT Trustees Directory](url) or https://...).
- Do NOT tell the user to "visit the website to find out" or "browse the links yourself". Give them the exact answer and cite the source link as evidence.`
       : `- When answering from the official college records, provide the data directly.
- NEVER tell the user to "visit the official website", "check the link below", "refer to the college portal", or "find the information online".
- Only provide a URL if the user explicitly asked for a website link or portal address.`
   }

4. MULTILINGUAL FIDELITY:
   - Answer in the EXACT SAME LANGUAGE as the user's query (${detectedLanguage}):
     * Tamil query -> Fluent, accurate Tamil (தமிழ்).
     * Tanglish query -> Natural, easy-to-read Tanglish.
     * English query -> Clean, professional, direct English.
     * Hindi query -> Natural Hindi.

5. FACTUAL ACCURACY & UNVERIFIED INFORMATION:
   ${
     isWebFallback
       ? `- Answer directly using the verified evidence from the search results.
- If the web search results do not provide sufficient, reliable evidence to verify the answer, respond EXACTLY with this phrase:
"Information regarding this topic could not be verified from the available college records or reliable web sources."
- Do NOT invent facts, numbers, or URLs.`
       : `- Use the provided college-info.txt passages as your factual truth.
- Present the estimated cutoff marks directly if requested.
- If a specific detail is absent from the college records, clearly explain:
"Information regarding this detail is not available in the official college records."
- Do NOT invent facts.`
   }
   - NEVER respond with an unnecessary apology such as "Sorry, I cannot help with that" or "I apologize". State verified facts or the verification status directly and objectively.

6. DEPARTMENT-SPECIFIC PLACEMENT ACCURACY (STRICT):
   - When the user asks about placement, salary package, or placement statistics for a specific department (e.g. Mechanical, Mechatronics, Automobile, Civil, EEE, EIE, ECE, CSE, IT, Chemical, Food Technology, MBA, MCA, AI&DS, AI&ML, CSD):
     * ALWAYS supply that department's exact figures from the records (Students placed, Minimum salary, Maximum salary, Average salary).
     * NEVER use the college-wide default (e.g. ₹5.6 LPA or 94%) when specific department figures exist in the records.
     * Answer directly with ONLY that department's specific placement statistics. Do NOT append unnecessary walls of text about general college placement rates or general recruiter lists unless specifically asked.

7. STRICT DEPARTMENT MATCHING & FACULTY RETRIEVAL (CRITICAL):
   - When asked about staff, faculty members, professors, or HoD in a specific department (e.g. Information Technology / IT):
     * Return ONLY the verified faculty members belonging specifically to THAT requested department.
     * NEVER return, substitute, or mix staff members from Electronics and Instrumentation (EIE), EEE, ECE, CSE, Mechanical, or any other department!
     * Even if names, designations, or keywords seem similar, NEVER cross department boundaries.
     * Report each faculty member clearly: Name, Designation, and Qualification.
     * If a staff member or detail cannot be verified for that specific department, state that clearly without guessing.

8. CLEAN PRESENTATION:
   - Use clean, well-spaced bullet points and bold highlights for key details so it reads effortlessly on both website chat and mobile SMS.`;

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

Generate the direct, complete answer for the student now. Provide the data directly; do not tell them to visit links or websites to find information.`;

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
