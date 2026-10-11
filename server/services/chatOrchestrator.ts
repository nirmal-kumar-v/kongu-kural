import path from 'path';
import { config } from '../config.js';
import {
  getKnowledge,
  getCandidatePassages,
  hasStrongKnowledgeCoverage,
  isMissingFromKnowledgeBase,
  resolveDepartmentFromQuery,
  understandAndNormalizeQuery,
  KnowledgeChunk,
} from './knowledgeService.js';
import {
  analyzeQueryAndSelectEvidence,
  generateAnswerWithGroq,
  isExplicitlyUnrelatedQuery,
  SemanticAnalysisResult,
} from './groqService.js';
import { generateAnswerWithGemini } from './geminiService.js';
import { searchWeb, WebSearchResult } from './webSearchService.js';
import { resolveQueryLanguage } from './languageService.js';

export interface SourceCitation {
  type: 'file' | 'web';
  title: string;
  url?: string;
  section?: string;
  snippet?: string;
}

export interface ChatResponse {
  answer: string;
  provider: string;
  sources: SourceCitation[];
  detectedLanguage: string;
  isWebFallback: boolean;
  metadata: {
    knowledgeFileTimestamp: number;
    evidenceChunksCount: number;
    intent: string;
  };
}

export async function processChatQuery(
  query: string,
  history: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<ChatResponse> {
  const cleanQuery = query.trim();
  if (!cleanQuery) {
    throw new Error('Question cannot be empty');
  }

  // 1. Resolve language early (Tamil / English / Tanglish / Explicit preference)
  const initialLangRes = resolveQueryLanguage(cleanQuery);

  // 2. Understand and normalize the intended question before searching the knowledge base
  // (maps typos, phonetic Tamil, Tanglish terms, and identifies target department & category)
  const normalizedContext = understandAndNormalizeQuery(cleanQuery);

  // 3. Ensure latest knowledge from college-info-2.txt / college-info.txt is loaded
  const knowledge = getKnowledge();

  // 4. Retrieve candidate passages from file using smart scoring with normalized context
  const candidatePassages = getCandidatePassages(cleanQuery, 20, normalizedContext);

  // 5. Use Groq to understand the question, detect language, and select relevant evidence
  let semanticResult: SemanticAnalysisResult;
  try {
    semanticResult = await analyzeQueryAndSelectEvidence(cleanQuery, history, candidatePassages);
  } catch (err: any) {
    console.warn('[Orchestrator] Groq semantic analysis failed, using heuristic fallback:', err?.message || err);
    const hasCoverage = candidatePassages.length > 0 && hasStrongKnowledgeCoverage(cleanQuery, candidatePassages);
    semanticResult = {
      isKecRelated: !isExplicitlyUnrelatedQuery(cleanQuery, history),
      detectedLanguage: initialLangRes.detectedLanguage === 'Tamil' ? 'Tamil' : 'English',
      intent: cleanQuery,
      selectedChunks: hasCoverage ? candidatePassages.slice(0, 4) : [],
      foundInFile: hasCoverage,
      suggestedWebQuery: `Kongu Engineering College ${cleanQuery}`,
    };
  }

  // Resolve final effective language and target response language:
  // - English question -> understand and answer in English.
  // - Tamil question -> understand and answer in Tamil.
  // - Tanglish question -> understand correctly and answer in English.
  // - Explicit user language request overrides detected language.
  const langRes = resolveQueryLanguage(cleanQuery, semanticResult.detectedLanguage);
  const targetResponseLanguage = langRes.targetLanguage;

  // 6. INTELLIGENT KEC-RELATED QUESTION GUARD:
  // For clearly unrelated questions, reply with EXACTLY: "Ask anything related to KEC."
  // Do not add apologies, explanations, alternative answers, or extra sentences.
  if (!semanticResult.isKecRelated) {
    console.log(`[Orchestrator] Question is unrelated to KEC: "${cleanQuery}". Returning mandatory guard response.`);
    return {
      answer: 'Ask anything related to KEC.',
      provider: 'Kongu Kural Guard',
      sources: [],
      detectedLanguage: langRes.detectedLanguage,
      isWebFallback: false,
      metadata: {
        knowledgeFileTimestamp: knowledge.lastModified,
        evidenceChunksCount: 0,
        intent: 'unrelated',
      },
    };
  }

  // 7. STAGE 1 PREPARATION: Check college knowledge base first!
  // If strong knowledge coverage exists in the file, prioritize college-info over web search
  if (
    (!semanticResult.foundInFile || semanticResult.selectedChunks.length === 0) &&
    hasStrongKnowledgeCoverage(cleanQuery, candidatePassages)
  ) {
    console.log('[Orchestrator] Direct college knowledge match confirmed. Prioritizing file over web search.');
    semanticResult.foundInFile = true;
    semanticResult.selectedChunks = candidatePassages.slice(0, 4);
  }

  // If candidatePassages is completely empty or has no strong coverage and no department match,
  // do not claim foundInFile (prevents sending unrelated faculty chunks for missing questions)
  const queryDept = resolveDepartmentFromQuery(cleanQuery);
  if (!queryDept && !hasStrongKnowledgeCoverage(cleanQuery, candidatePassages)) {
    semanticResult.foundInFile = false;
    semanticResult.selectedChunks = [];
  }

  // STRICT DEPARTMENT VALIDATION:
  // If the query targets a specific department, ensure NO chunks from other departments sneak in
  if (queryDept) {
    const validDeptChunks = semanticResult.selectedChunks.filter(
      (c) => c.departmentId === queryDept.id || c.departmentId === 'general'
    );
    if (validDeptChunks.length > 0) {
      semanticResult.selectedChunks = validDeptChunks;
    } else {
      semanticResult.selectedChunks = candidatePassages.filter(
        (c) => c.departmentId === queryDept.id || c.departmentId === 'general'
      ).slice(0, 4);
    }
  }

  let finalAnswer = '';
  let providerUsed = '';
  let citations: SourceCitation[] = [];
  let isWebFallback = false;

  // =========================================================================
  // STAGE 1: SEARCH THE EXISTING COLLEGE KNOWLEDGE BASE FIRST
  // =========================================================================
  const shouldAttemptStage1 = semanticResult.foundInFile && semanticResult.selectedChunks.length > 0;

  if (shouldAttemptStage1) {
    const sourceFileName = path.basename(config.collegeInfoPath);
    console.log(`[Orchestrator] Stage 1: Searching ${sourceFileName} (${semanticResult.selectedChunks.length} chunks)...`);
    try {
      const geminiRes = await generateAnswerWithGemini(
        cleanQuery,
        semanticResult.selectedChunks,
        null,
        targetResponseLanguage,
        history
      );
      finalAnswer = geminiRes.text;
      providerUsed = `${geminiRes.provider} (Key #${geminiRes.usedKeyIndex})`;
    } catch (geminiErr: any) {
      console.warn('[Orchestrator] Gemini failed in Stage 1, falling back to Groq:', geminiErr?.message || geminiErr);
      try {
        const groqRes = await generateAnswerWithGroq(
          cleanQuery,
          semanticResult.selectedChunks,
          null,
          targetResponseLanguage,
          history
        );
        finalAnswer = groqRes.text;
        providerUsed = groqRes.provider;
      } catch (groqErr: any) {
        console.warn('[Orchestrator] Both AI providers failed in Stage 1:', groqErr?.message || groqErr);
      }
    }

    // VERIFY STAGE 1 RESULT:
    // If the answer explicitly states that the requested detail is not available, missing,
    // or unverified in official college records, escalate to Stage 2 (Web Search Fallback)
    if (finalAnswer && isMissingFromKnowledgeBase(finalAnswer)) {
      console.log(
        `[Orchestrator] Stage 1 answer indicates information is missing/unverified in college records: "${finalAnswer.trim()}". Automatically escalating to Stage 2 Web Search Fallback...`
      );
      finalAnswer = ''; // Reset so Stage 2 executes
    } else if (finalAnswer) {
      // Stage 1 successfully answered using reliable evidence from knowledge base!
      isWebFallback = false;
      const seenSections = new Set<string>();
      for (const chunk of semanticResult.selectedChunks) {
        if (!seenSections.has(chunk.sectionTitle)) {
          seenSections.add(chunk.sectionTitle);
          citations.push({
            type: 'file',
            title: `${sourceFileName} → ${chunk.sectionTitle}`,
            section: chunk.sectionTitle,
            snippet: chunk.content.slice(0, 160) + (chunk.content.length > 160 ? '...' : ''),
          });
        }
        for (const url of chunk.urls) {
          citations.push({
            type: 'web',
            title: `Official Link (${chunk.sectionTitle})`,
            url,
            section: chunk.sectionTitle,
          });
        }
      }
    }
  }

  // =========================================================================
  // STAGE 2: SEARCH THE WEB WHEN INFORMATION IS MISSING OR INSUFFICIENT
  // =========================================================================
  if (!finalAnswer) {
    isWebFallback = true;
    citations = [];
    const searchQuery = semanticResult.suggestedWebQuery || `Kongu Engineering College ${cleanQuery}`;
    console.log(`[Orchestrator] Stage 2: Searching the web for: "${searchQuery}"`);

    let webResults: WebSearchResult[] = [];
    try {
      webResults = await searchWeb(searchQuery, 5);
    } catch (searchErr: any) {
      console.warn('[Orchestrator] Web search error:', searchErr?.message || searchErr);
    }

    const webText = webResults
      .map((r, i) => `[${i + 1}] ${r.title}\nURL: ${r.url}\nSummary: ${r.snippet}`)
      .join('\n\n');

    try {
      const geminiRes = await generateAnswerWithGemini(
        cleanQuery,
        [],
        webResults,
        targetResponseLanguage,
        history
      );
      finalAnswer = geminiRes.text;
      providerUsed = `${geminiRes.provider} [Web Search Fallback]`;
    } catch (geminiErr: any) {
      console.warn('[Orchestrator] Gemini web answer failed, falling back to Groq:', geminiErr?.message || geminiErr);
      try {
        const groqRes = await generateAnswerWithGroq(
          cleanQuery,
          [],
          webText,
          targetResponseLanguage,
          history
        );
        finalAnswer = groqRes.text;
        providerUsed = `${groqRes.provider} [Web Search Fallback]`;
      } catch (groqErr: any) {
        console.warn('[Orchestrator] Both AI providers failed in Stage 2:', groqErr?.message || groqErr);
      }
    }

    // Build citations from web results
    for (const res of webResults) {
      citations.push({
        type: 'web',
        title: res.title,
        url: res.url,
        snippet: res.snippet,
      });
    }

    // MANDATORY UNAVAILABLE-INFORMATION RESPONSE REQUIREMENT:
    // If web search produced no sufficient, reliable evidence or failed to verify, respond:
    // "Information regarding this topic could not be verified from the available college records or reliable web sources."
    const unavailableResponse =
      'Information regarding this topic could not be verified from the available college records or reliable web sources.';

    if (!finalAnswer || webResults.length === 0) {
      finalAnswer = unavailableResponse;
    } else {
      const lowerAns = finalAnswer.toLowerCase();
      if (
        lowerAns.includes('could not be verified') ||
        lowerAns.includes('cannot be verified') ||
        lowerAns.includes('not available in the available college records') ||
        lowerAns.includes('not available in official') ||
        lowerAns.includes('is not specified') ||
        lowerAns.includes('not mentioned in')
      ) {
        if (!finalAnswer.includes('could not be verified from the available college records or reliable web sources')) {
          finalAnswer = unavailableResponse;
        }
      }
    }
  }

  return {
    answer: finalAnswer,
    provider: providerUsed,
    sources: citations,
    detectedLanguage: langRes.detectedLanguage,
    isWebFallback,
    metadata: {
      knowledgeFileTimestamp: knowledge.lastModified,
      evidenceChunksCount: semanticResult.selectedChunks.length,
      intent: semanticResult.intent,
    },
  };
}
