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

const STOP_WORDS = new Set([
  'what', 'is', 'the', 'for', 'in', 'on', 'at', 'of', 'to', 'a', 'an', 'and', 'or', 'by',
  'how', 'can', 'tell', 'me', 'give', 'details', 'detail', 'about', 'info', 'information',
  'please', 'any', 'do', 'does', 'kec', 'kongu', 'college', 'engineering', 'irukku',
  'enna', 'yaaru', 'sollu', 'sollunga', 'paththi', 'available', 'show', 'need', 'want',
  'which', 'who', 'whom', 'where', 'when', 'why', 'are', 'was', 'were', 'will', 'would',
  'with', 'from', 'this', 'that', 'last', 'year', 'years',
  'tamil', 'nadu', 'current', 'state', 'government'
]);

const SYNONYM_MAP: Record<string, string[]> = {
  cutoff: ['cut-off', 'cutoff', 'cut off', 'cut-offs', 'marks', 'cut off marks'],
  cutoffs: ['cut-off', 'cutoff', 'cut off', 'cut-offs', 'marks'],
  'cut-off': ['cut-off', 'cutoff', 'cut off', 'cut-offs', 'marks'],
  'cut-offs': ['cut-off', 'cutoff', 'cut off', 'cut-offs', 'marks'],
  rank: ['rank', 'ranks', 'ranking', 'closing rank', 'merit rank'],
  ranks: ['rank', 'ranks', 'ranking', 'closing rank'],
  fee: ['fee', 'fees', 'cost', 'hostel fee', 'tuition fee'],
  fees: ['fee', 'fees', 'cost', 'hostel fee', 'tuition fee'],
  hostel: ['hostel', 'hostels', 'mess', 'dheeran', 'valluvar', 'kaveri', 'amaravathi', 'bhavani'],
  hostels: ['hostel', 'hostels', 'mess'],
  warden: ['warden', 'wardens', 'chief warden', 'deputy warden', 'associate warden'],
  wardens: ['warden', 'wardens'],
  admission: ['admission', 'admissions', 'counselling', 'counseling', 'tnea', 'quota'],
  admissions: ['admission', 'admissions', 'counselling', 'counseling', 'tnea', 'quota'],
  counselling: ['counselling', 'counseling', 'tnea', 'single window'],
  counseling: ['counselling', 'counseling', 'tnea', 'single window'],
  sports: ['sports', 'sport', 'gym', 'ground', 'stadium', 'physical education', 'playfield'],
  placement: ['placement', 'placements', 'salary', 'lpa', 'package', 'recruiter', 'highest package'],
  placements: ['placement', 'placements', 'salary', 'lpa', 'package', 'recruiter'],
  cse: ['cse', 'computer science'],
  it: ['information technology'],
  aids: ['ai-ds', 'ai & ds', 'artificial intelligence', 'data science'],
  ece: ['ece', 'electronics and communication'],
  eee: ['eee', 'electrical and electronics'],
  mech: ['mechanical', 'mech'],
  civil: ['civil']
};

/**
 * Advanced candidate retrieval:
 * 1. Filters stop words so common words don't dilute scoring
 * 2. Expands domain keywords (e.g. cutoff <-> cut-off <-> marks)
 * 3. Multi-concept boosting (e.g. "cutoff" + "cse" gets heavy bonus)
 * 4. Ensures chunks with direct core keyword matches are always included
 */
export function getCandidatePassages(query: string, maxCandidates = 20): KnowledgeChunk[] {
  const knowledge = getKnowledge();
  if (knowledge.isEmpty) return [];

  const cleanQuery = query.toLowerCase();

  // Extract individual words and normalized forms
  const tokens = cleanQuery
    .replace(/[^\w\s\u0B80-\u0BFF-]/g, ' ')
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t));

  if (tokens.length === 0) {
    return knowledge.chunks.slice(0, maxCandidates);
  }

  // Build concept terms list including synonyms
  const searchTerms = new Set<string>();
  const coreConcepts = new Set<string>();

  for (const token of tokens) {
    searchTerms.add(token);
    coreConcepts.add(token);

    // If token has hyphen, also add unhyphenated and spaced versions
    if (token.includes('-')) {
      searchTerms.add(token.replace(/-/g, ''));
      searchTerms.add(token.replace(/-/g, ' '));
    }

    // Check synonym map
    const mapped = SYNONYM_MAP[token] || SYNONYM_MAP[token.replace(/-/g, '')];
    if (mapped) {
      for (const m of mapped) {
        searchTerms.add(m);
      }
    }
  }

  // Score each chunk
  const scored = knowledge.chunks.map((chunk) => {
    let score = 0;
    const lowerContent = chunk.content.toLowerCase();
    const lowerSection = chunk.sectionTitle.toLowerCase();
    const matchedConcepts = new Set<string>();

    for (const term of searchTerms) {
      let termMatched = false;
      if (lowerSection.includes(term)) {
        score += 20; // Big bonus for section header match
        termMatched = true;
      }
      if (lowerContent.includes(term)) {
        score += term.length > 4 ? 6 : 3; // Informative terms score higher
        termMatched = true;
      }

      if (termMatched) {
        matchedConcepts.add(term);
      }
    }

    // Multi-concept multiplier: If chunk matches multiple different terms (e.g., both "cutoff" and "cse"), boost it!
    if (matchedConcepts.size > 1) {
      score *= (1 + matchedConcepts.size * 1.5);
    }

    return { chunk, score, matchedCount: matchedConcepts.size };
  });

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  const topMatches = scored.filter((s) => s.score > 0).map((s) => s.chunk);
  if (topMatches.length > 0) {
    return topMatches.slice(0, maxCandidates);
  }

  return knowledge.chunks.slice(0, maxCandidates);
}

const SPECIFIC_DOMAIN_KEYWORDS = new Set([
  'cutoff', 'cutoffs', 'cut-off', 'cut-offs',
  'hostel', 'hostels', 'warden', 'wardens',
  'fees', 'fee', 'mess', 'counselling', 'counseling',
  'admission', 'admissions', 'lateral', 'scholarship',
  'principal', 'placement', 'placements', 'highest package',
  'autonomous', 'ranking', 'sports', 'gym', 'ground', 'stadium',
  'dheeran', 'valluvar', 'kaveri', 'amaravathi', 'bhavani', 'kamban', 'ilango', 'ponnar', 'sankar'
]);

/**
 * Checks if the knowledge base has direct factual coverage for the query
 * based on strong keyword and multi-term matches in candidate passages.
 */
export function hasStrongKnowledgeCoverage(query: string, candidates: KnowledgeChunk[]): boolean {
  if (!candidates || candidates.length === 0) return false;

  const clean = query.toLowerCase();
  const tokens = clean
    .replace(/[^\w\s\u0B80-\u0BFF-]/g, ' ')
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t));

  if (tokens.length === 0) return false;

  for (const chunk of candidates.slice(0, 8)) {
    const text = (chunk.sectionTitle + ' ' + chunk.content).toLowerCase();

    // 1. Direct high-specificity campus keyword match (e.g. cutoff, warden, hostel, fee)
    for (const token of tokens) {
      if (SPECIFIC_DOMAIN_KEYWORDS.has(token) && text.includes(token)) {
        return true;
      }
      const syns = SYNONYM_MAP[token] || [];
      if (syns.some((s) => SPECIFIC_DOMAIN_KEYWORDS.has(s) && text.includes(s))) {
        return true;
      }
    }

    // 2. Multi-token match: at least 2 distinct query tokens match the same chunk
    const matchedCount = tokens.filter((t) => text.includes(t)).length;
    if (matchedCount >= 2) {
      return true;
    }
  }

  return false;
}
