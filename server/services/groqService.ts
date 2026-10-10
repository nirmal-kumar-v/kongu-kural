import Groq from 'groq-sdk';
import { getGroqKeys, config } from '../config.js';
import { KnowledgeChunk } from './knowledgeService.js';

export interface SemanticAnalysisResult {
  detectedLanguage: string;
  intent: string;
  selectedChunks: KnowledgeChunk[];
  foundInFile: boolean;
  suggestedWebQuery?: string;
  isKecRelated: boolean;
}

/**
 * Rapid heuristic check for queries that are unequivocally unrelated
 * (e.g. recipes, movie suggestions, general politics, general trivia)
 * without any campus, hostel, or KEC context.
 */
export function isExplicitlyUnrelatedQuery(
  query: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }> = []
): boolean {
  const lower = query.toLowerCase().trim();

  // If question explicitly mentions KEC or campus keywords, never mark unrelated
  const campusExceptions = /(kec|kongu|hostel|mess|canteen|warden|chief warden|admission|cutoff|cut-off|tnea|placement|bus|transport|library|syllabus|department|dept|hod|principal|campus|faculty|club|tamil mandram|sports quota|timing|timings|working hours|class hours|office hours|library hours|route|routes|shuttle|scholarship|scholarships|concession|first graduate)/i;
  if (campusExceptions.test(lower)) {
    return false;
  }

  // 1. Recipes / Baking / Cooking (with no campus context)
  if (
    /(how to (bake|cook|make|prepare)|recipe (for|of)|ingredients (for|of)|baking (instructions|a cake))/i.test(lower)
  ) {
    return true;
  }

  // 2. Movie, song, entertainment recommendations
  if (
    /(recommend|suggest).*(movie|film|song|series|anime|show|comedy)|(movie|film) for (tonight|today)|(best|good) (movies|songs|films) of/i.test(lower)
  ) {
    return true;
  }

  // 3. General politics / world trivia / external government leaders
  if (
    /(chief minister|prime minister|president of|capital of|who invented|who discovered|who won the (ipl|world cup|match|fifa|election)|weather in)/i.test(lower)
  ) {
    return true;
  }

  // 4. General personal tasks / creative writing / generic programming exercises
  if (
    /^(write|generate) (a )?(python|java|c\+\+|javascript)? ?(code|script|essay|story|poem) (for|about|to) (invert|reverse|binary|sort|lions|dogs|cats)/i.test(lower)
  ) {
    return true;
  }

  return false;
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
    throw new Error('No Groq API keys configured. Please set GROQ_API_KEY (or GROQ_API_KEY_1) in your environment variables.');
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
 * Uses Groq to understand the user's intent across languages (English, Tamil, Tanglish, Hindi),
 * determines if the question is related to Kongu Engineering College (KEC),
 * and semantically selects relevant chunks from the college knowledge file.
 */
export async function analyzeQueryAndSelectEvidence(
  query: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }>,
  candidateChunks: KnowledgeChunk[]
): Promise<SemanticAnalysisResult> {
  // Fast-path guard for unequivocally unrelated non-college requests (recipes, movie recommendations, etc.)
  if (isExplicitlyUnrelatedQuery(query, history)) {
    return {
      isKecRelated: false,
      detectedLanguage: 'English',
      intent: 'unrelated',
      selectedChunks: [],
      foundInFile: false,
      suggestedWebQuery: '',
    };
  }

  const chunksPayload = candidateChunks.map((c) => ({
    id: c.id,
    section: c.sectionTitle,
    textSnippet: c.content,
  }));

  const systemPrompt = `You are the Semantic Understanding & Intent Classification Engine for Kongu Kural, the official campus AI assistant for Kongu Engineering College (KEC), Perundurai, Erode.

PRIMARY TASK 1: CLASSIFY IF THE QUESTION IS KEC-RELATED (isKecRelated)
Analyze the full meaning, intent, context, and conversation history. Do NOT use simple keyword matching.

Consider a question KEC-RELATED ("isKecRelated": true) if it concerns:
- College information, history, departments, courses, curriculum, academics, admissions, cutoff marks, ranks.
- Hostels, warden details, mess/food, buses/transport, fees, facilities, rules, student services.
- Placements, companies, internships, careers, training, campus recruitment.
- Clubs, Tamil Mandram, events, symposiums, cultural activities, sports, gym, tournaments, competitions.
- Faculty, HODs, Principal, administrative offices, contacts, campus life, college procedures.
- Friendly campus interactions and greetings ("Hi", "Hello", "Vanakkam", "Who are you?", "Help", "What can you do?").
- INDIRECT AND AMBIGUOUS QUESTIONS:
  * Do NOT reject a question merely because it does not explicitly mention "KEC" or "Kongu Engineering College".
  * Examples: "What are the hostel timings?", "When is the application deadline?", "What facilities are available there?", "Who is the warden?", "Hostel fees evalo?", "Bus routes irukka?".
  * Questions about placements, transport, fees, or sports remain KEC-related even when the user does not name the college.
  * Understand spelling mistakes, abbreviations, English, Tamil (தமிழ்), Tanglish, Hindi, mixed language, and informal expressions.
  * Use the previous conversation history to understand follow-up questions.
  * If a question has ANY reasonable connection to KEC, college life, or studies, treat it as RELATED ("isKecRelated": true).

Consider a question CLEARLY UNRELATED ("isKecRelated": false) if:
- The question is general trivia, politics, recipes/cooking, entertainment/movie recommendations, or personal tasks that are NOT about KEC campus, admissions, academics, hostels, or student life.
- IMPORTANT: Accidental keyword overlap in candidate passages does NOT make an unrelated question related!
  * Asking for recipes or cooking instructions (e.g. "How to bake a chocolate cake at home?", "How to make biryani?") is UNRELATED ("isKecRelated": false), even if college passages mention nearby food or canteens!
  * Asking for movie, music, or entertainment recommendations (e.g. "Recommend a comedy movie for tonight", "Best songs of 2024") is UNRELATED ("isKecRelated": false)!
  * Asking general knowledge / politics (e.g. "Who is the Chief Minister of Tamil Nadu?", "Capital of France", "Who won the cricket match?") is UNRELATED ("isKecRelated": false)!
  * Asking personal or general programming tasks (e.g. "Write python code to reverse a list", "Write an essay about dogs") with no KEC academic context is UNRELATED ("isKecRelated": false)!

Always ask: Is the user genuinely inquiring about Kongu Engineering College (KEC), its campus, courses, admissions, hostels, wardens, fees, placements, student activities, or context from prior conversation? If NOT, set "isKecRelated": false.

PRIMARY TASK 2: EVIDENCE SELECTION (if isKecRelated is true)
- If candidate passages contain direct, approximate, or estimated facts, set "foundInFile": true and select the chunk IDs.
- Set "foundInFile": false ONLY if the topic is completely absent from all candidate passages.
- Distinguish Cut-off marks (out of 200) vs Rank (TNEA merit rank number).

Respond ONLY in valid JSON matching this schema:
{
  "isKecRelated": true | false,
  "detectedLanguage": "English" | "Tamil" | "Tanglish" | "Hindi" | "Other",
  "intent": "Brief summary of what the user wants to know",
  "foundInFile": true | false,
  "selectedChunkIds": ["chunk_1", ...],
  "suggestedWebQuery": "Kongu Engineering College [keywords]"
}`;

  const userPrompt = `Conversation History:
${history.slice(-6).map((h) => `${h.role}: ${h.content}`).join('\n') || 'None'}

Current User Question:
"${query}"

Candidate Passages:
${JSON.stringify(chunksPayload, null, 2)}

Analyze query intent, classify isKecRelated, match passages semantically, and output JSON.`;

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

    const isKecRelated = parsed.isKecRelated !== undefined ? Boolean(parsed.isKecRelated) : true;
    const foundInFile = Boolean(parsed.foundInFile && selected.length > 0);

    return {
      isKecRelated,
      detectedLanguage: parsed.detectedLanguage || 'English',
      intent: parsed.intent || query,
      selectedChunks: foundInFile ? selected : [],
      foundInFile,
      suggestedWebQuery: parsed.suggestedWebQuery || `Kongu Engineering College ${query}`,
    };
  } catch (err: any) {
    console.error('[GroqService] Semantic analysis failed:', err?.message || err);

    // Robust heuristic fallback:
    const lower = query.toLowerCase();
    const collegeKeywords = [
      'kec', 'kongu', 'college', 'hostel', 'warden', 'fee', 'fees', 'cutoff', 'cut-off',
      'rank', 'admission', 'counselling', 'dept', 'department', 'bus', 'transport', 'mess',
      'placement', 'placements', 'principal', 'hod', 'faculty', 'sports', 'gym', 'course',
      'b.e', 'b.tech', 'm.e', 'mba', 'mca', 'tnea', 'tamil mandram', 'club', 'scholarship',
      'hi', 'hello', 'vanakkam', 'who are you', 'help'
    ];
    const isExplicitCollege = collegeKeywords.some((k) => lower.includes(k));
    const hasHistory = history.length > 0;

    return {
      isKecRelated: isExplicitCollege || hasHistory || candidateChunks.length > 0,
      detectedLanguage: 'English',
      intent: query,
      selectedChunks: candidateChunks.slice(0, 4),
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

3. DIRECT DATA WITH AUTHORITATIVE CITATIONS:
   ${
     isWebFallback
       ? '- When answering from web search results, synthesize and state verified facts directly (e.g. the exact number/count, key members, names). Always include the relevant official source URL as a markdown or plain link. Do NOT tell the user to browse links or search online.'
       : '- When answering from the official college records, provide the data directly. NEVER tell the user to visit the official website or check links. Only provide a URL if explicitly requested.'
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
       ? 'The requested topic was not in local files. Answer directly using verified evidence from the search results. If the web search results do not provide sufficient, reliable evidence to verify the answer, respond EXACTLY: "Information regarding this topic could not be verified from the available college records or reliable web sources." Do NOT invent facts.'
       : 'Use the provided college knowledge passages as your factual truth. Present the estimated cutoff figures directly if requested. If a specific detail is absent from the college records, clearly explain: "Information regarding this detail is not available in the official college records." Do NOT invent facts.'
   }
   - NEVER respond with an unnecessary apology such as "Sorry, I cannot help with that" or "I apologize". State verified facts or unverified status directly and objectively.

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
