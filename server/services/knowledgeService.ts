import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { config } from '../config.js';

export interface KnowledgeChunk {
  id: string;
  sectionTitle: string;
  content: string;
  urls: string[];
  lineNumber: number;
}

export interface KnowledgeState {
  filePath: string;
  lastModified: number;
  hash: string;
  rawText: string;
  chunks: KnowledgeChunk[];
  sections: string[];
  isEmpty: boolean;
}

let cachedKnowledge: KnowledgeState | null = null;

// Helper to extract URLs from text
function extractUrls(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s)\]>"']+)/gi;
  const matches = text.match(urlRegex);
  return matches ? Array.from(new Set(matches)) : [];
}

// Detect if a line looks like a heading
function isHeading(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;

  // Markdown headers: # Heading, ## Heading, ### Heading
  if (/^#{1,6}\s+\S+/.test(trimmed)) return true;

  // Section with colon: e.g. "Hostel :", "Category :"
  if (/^[A-Za-z0-9\s/&()-]{2,60}:$/.test(trimmed)) return true;

  // Uppercase headers: e.g. "HOSTEL INFORMATION", "KEC HOSTELS"
  if (
    trimmed.length >= 3 &&
    trimmed.length <= 60 &&
    trimmed === trimmed.toUpperCase() &&
    /[A-Z]/.test(trimmed) &&
    !trimmed.includes('\t')
  ) {
    return true;
  }

  // Common titles: "KEC Hostel Staff Details", "Hostel Accommodation Details", "Key Details"
  if (
    trimmed.length >= 3 &&
    trimmed.length <= 60 &&
    /^[A-Z][A-Za-z0-9\s/&()-]+$/.test(trimmed) &&
    !trimmed.includes('\t') &&
    (trimmed.endsWith('Details') ||
      trimmed.endsWith('Information') ||
      trimmed.endsWith('Facilities') ||
      trimmed.endsWith('Rules') ||
      trimmed.endsWith('Fee') ||
      trimmed.endsWith('Fees') ||
      trimmed.endsWith('Overview'))
  ) {
    return true;
  }

  return false;
}

function cleanHeading(line: string): string {
  return line.replace(/^#{1,6}\s+/, '').replace(/:$/, '').trim();
}

/**
 * Parses raw text into structured chunks with associated headings and URLs.
 */
function parseKnowledgeText(rawText: string): { chunks: KnowledgeChunk[]; sections: string[] } {
  if (!rawText.trim()) {
    return { chunks: [], sections: [] };
  }

  const lines = rawText.split(/\r?\n/);
  const chunks: KnowledgeChunk[] = [];
  const sectionsSet = new Set<string>();

  let currentSection = 'General Campus Information';
  let currentChunkLines: string[] = [];
  let chunkStartLine = 1;

  function flushChunk() {
    if (currentChunkLines.length === 0) return;
    const content = currentChunkLines.join('\n').trim();
    if (!content) return;

    sectionsSet.add(currentSection);
    chunks.push({
      id: `chunk_${chunks.length + 1}`,
      sectionTitle: currentSection,
      content,
      urls: extractUrls(content),
      lineNumber: chunkStartLine,
    });
    currentChunkLines = [];
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    if (isHeading(line)) {
      flushChunk();
      currentSection = cleanHeading(line);
      sectionsSet.add(currentSection);
      chunkStartLine = lineNum;
      continue;
    }

    // Check if line is empty and current chunk is getting sizable (> 450 chars)
    if (!line.trim() && currentChunkLines.join('\n').length > 450) {
      flushChunk();
      chunkStartLine = lineNum + 1;
      continue;
    }

    currentChunkLines.push(line);

    // Hard limit per chunk (~900 chars) while preserving table rows
    if (currentChunkLines.join('\n').length > 900) {
      flushChunk();
      chunkStartLine = lineNum + 1;
    }
  }

  flushChunk();

  return {
    chunks,
    sections: Array.from(sectionsSet),
  };
}

/**
 * Ensures the latest knowledge from college-info.txt is loaded.
 * Automatically checks mtime and file hash to hot-reload without server restarts.
 */
export function getKnowledge(): KnowledgeState {
  const filePath = config.collegeInfoPath;

  if (!fs.existsSync(filePath)) {
    return {
      filePath,
      lastModified: 0,
      hash: '',
      rawText: '',
      chunks: [],
      sections: [],
      isEmpty: true,
    };
  }

  const stats = fs.statSync(filePath);
  const mtime = stats.mtimeMs;

  // If cache is valid and timestamp hasn't changed, return cached
  if (cachedKnowledge && cachedKnowledge.lastModified === mtime) {
    return cachedKnowledge;
  }

  const rawText = fs.readFileSync(filePath, 'utf-8');
  const hash = crypto.createHash('md5').update(rawText).digest('hex');

  // If hash is same as cached, just update timestamp
  if (cachedKnowledge && cachedKnowledge.hash === hash) {
    cachedKnowledge.lastModified = mtime;
    return cachedKnowledge;
  }

  const { chunks, sections } = parseKnowledgeText(rawText);
  const isEmpty = rawText.trim().length === 0 || chunks.length === 0;

  cachedKnowledge = {
    filePath,
    lastModified: mtime,
    hash,
    rawText,
    chunks,
    sections,
    isEmpty,
  };

  console.log(
    `[KnowledgeService] Reloaded college-info.txt (Length: ${rawText.length} chars, Chunks: ${chunks.length}, Sections: ${sections.length})`
  );

  return cachedKnowledge;
}

/**
 * Basic candidate retrieval scoring using token overlap and section matching.
 * This filters down 100s of chunks into top candidate passages before passing to Groq for deep semantic selection.
 */
export function getCandidatePassages(query: string, maxCandidates = 15): KnowledgeChunk[] {
  const knowledge = getKnowledge();
  if (knowledge.isEmpty) return [];

  const rawTokens = query
    .toLowerCase()
    .replace(/[^\w\s\u0B80-\u0BFF]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1);

  if (rawTokens.length === 0) {
    return knowledge.chunks.slice(0, maxCandidates);
  }

  const scored = knowledge.chunks.map((chunk) => {
    let score = 0;
    const lowerContent = chunk.content.toLowerCase();
    const lowerSection = chunk.sectionTitle.toLowerCase();

    for (const token of rawTokens) {
      if (lowerSection.includes(token)) score += 5; // Heavy weight for section match
      if (lowerContent.includes(token)) score += 1;
    }

    return { chunk, score };
  });

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  // Return top candidates; if none matched, return top initial chunks as fallback
  const topMatches = scored.filter((s) => s.score > 0).map((s) => s.chunk);
  if (topMatches.length > 0) {
    return topMatches.slice(0, maxCandidates);
  }

  return knowledge.chunks.slice(0, maxCandidates);
}
