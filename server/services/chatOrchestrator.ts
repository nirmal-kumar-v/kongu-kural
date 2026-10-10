import { getKnowledge, getCandidatePassages, KnowledgeChunk } from './knowledgeService.js';
import { analyzeQueryAndSelectEvidence, generateAnswerWithGroq, SemanticAnalysisResult } from './groqService.js';
import { generateAnswerWithGemini } from './geminiService.js';
import { searchWeb, WebSearchResult } from './webSearchService.js';

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

  // 1. Ensure latest knowledge from college-info.txt is loaded
  const knowledge = getKnowledge();

  // 2. Retrieve candidate passages from file
  const candidatePassages = getCandidatePassages(cleanQuery, 12);

  // 3. Use Groq to understand the question, detect language, and select relevant evidence
  let semanticResult: SemanticAnalysisResult;
  try {
    semanticResult = await analyzeQueryAndSelectEvidence(cleanQuery, history, candidatePassages);
  } catch (err: any) {
    console.warn('[Orchestrator] Groq semantic analysis failed, using heuristic fallback:', err?.message || err);
    semanticResult = {
      detectedLanguage: 'English',
      intent: cleanQuery,
      selectedChunks: candidatePassages.slice(0, 3),
      foundInFile: candidatePassages.length > 0 && !knowledge.isEmpty,
      suggestedWebQuery: `Kongu Engineering College ${cleanQuery}`,
    };
  }

  let finalAnswer = '';
  let providerUsed = '';
  let citations: SourceCitation[] = [];
  let isWebFallback = false;
  let webResults: WebSearchResult[] | null = null;

  // 4. Determine if we have valid evidence in college-info.txt or need web search fallback
  if (semanticResult.foundInFile && semanticResult.selectedChunks.length > 0) {
    // Found in college-info.txt!
    // Try Gemini first (with multi-key failover)
    try {
      const geminiRes = await generateAnswerWithGemini(
        cleanQuery,
        semanticResult.selectedChunks,
        null,
        semanticResult.detectedLanguage,
        history
      );
      finalAnswer = geminiRes.text;
      providerUsed = `${geminiRes.provider} (Key #${geminiRes.usedKeyIndex})`;
    } catch (geminiErr: any) {
      console.warn('[Orchestrator] Gemini failed, falling back to Groq for answer:', geminiErr?.message || geminiErr);
      // Fallback to Groq for answer generation
      try {
        const groqRes = await generateAnswerWithGroq(
          cleanQuery,
          semanticResult.selectedChunks,
          null,
          semanticResult.detectedLanguage,
          history
        );
        finalAnswer = groqRes.text;
        providerUsed = groqRes.provider;
      } catch (groqErr: any) {
        throw new Error(
          `Both AI providers failed. Gemini: ${geminiErr?.message}. Groq: ${groqErr?.message}`
        );
      }
    }

    // Build citations from selected chunks in college-info.txt
    const seenSections = new Set<string>();
    for (const chunk of semanticResult.selectedChunks) {
      if (!seenSections.has(chunk.sectionTitle)) {
        seenSections.add(chunk.sectionTitle);
        citations.push({
          type: 'file',
          title: `college-info.txt → ${chunk.sectionTitle}`,
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
  } else {
    // 5. Information NOT found in college-info.txt -> Search all around the internet and reply!
    isWebFallback = true;
    const searchQuery = semanticResult.suggestedWebQuery || `Kongu Engineering College ${cleanQuery}`;
    console.log(`[Orchestrator] Info not in college-info.txt. Searching the web for: "${searchQuery}"`);

    webResults = await searchWeb(searchQuery, 4);
    const webText = webResults
      .map((r, i) => `[${i + 1}] ${r.title}\nURL: ${r.url}\nSummary: ${r.snippet}`)
      .join('\n\n');

    // Try Gemini with web results
    try {
      const geminiRes = await generateAnswerWithGemini(
        cleanQuery,
        [],
        webResults,
        semanticResult.detectedLanguage,
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
          semanticResult.detectedLanguage,
          history
        );
        finalAnswer = groqRes.text;
        providerUsed = `${groqRes.provider} [Web Search Fallback]`;
      } catch (groqErr: any) {
        throw new Error(
          `Both providers failed during web search answering. Gemini: ${geminiErr?.message}. Groq: ${groqErr?.message}`
        );
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
  }

  return {
    answer: finalAnswer,
    provider: providerUsed,
    sources: citations,
    detectedLanguage: semanticResult.detectedLanguage,
    isWebFallback,
    metadata: {
      knowledgeFileTimestamp: knowledge.lastModified,
      evidenceChunksCount: semanticResult.selectedChunks.length,
      intent: semanticResult.intent,
    },
  };
}
