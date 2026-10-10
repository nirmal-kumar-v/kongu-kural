import { config } from '../server/config.js';
import { getKnowledge, getCandidatePassages, resolveCategoryFromQuery } from '../server/services/knowledgeService.js';
import path from 'path';

console.log('================================================================');
console.log('   COLLEGE-INFO-2 INTEGRATION & RETRIEVAL VERIFICATION TEST     ');
console.log('================================================================\n');

let allPassed = true;

// 1. Verify Config Resolution
const resolvedPath = config.collegeInfoPath;
console.log(`[TEST 1] Resolved Knowledge File Path: ${resolvedPath}`);
if (path.basename(resolvedPath) === 'college-info-2.txt') {
  console.log('STATUS: ✅ PASSED (Successfully points to college-info-2.txt)\n');
} else {
  console.log(`STATUS: ❌ FAILED (Expected college-info-2.txt, got ${path.basename(resolvedPath)})\n`);
  allPassed = false;
}

// 2. Verify Knowledge Parsing
const kb = getKnowledge();
console.log(`[TEST 2] Loaded Knowledge State:`);
console.log(`- File Length: ${kb.rawText.length} characters`);
console.log(`- Chunks Generated: ${kb.chunks.length}`);
console.log(`- Sections: ${kb.sections.length}`);

const categoryCounts = {};
for (const c of kb.chunks) {
  categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
}
console.log('Category breakdown:', categoryCounts);

if (kb.chunks.length >= 80 && categoryCounts['transport'] > 0 && categoryCounts['working_hours'] > 0 && categoryCounts['scholarship'] > 0) {
  console.log('STATUS: ✅ PASSED (All core categories parsed and populated)\n');
} else {
  console.log('STATUS: ❌ FAILED (Missing chunks or categories)\n');
  allPassed = false;
}

// 3. Retrieval Test Cases
const testQueries = [
  {
    query: 'What are the college bus timings?',
    expectedCategory: 'transport',
    expectedContentSnippet: '4:45 PM',
  },
  {
    query: 'What are the college working hours and library timings?',
    expectedCategory: 'working_hours',
    expectedContentSnippet: '8:45 AM',
  },
  {
    query: 'What scholarships are available for 7.5% government school students?',
    expectedCategory: 'scholarship',
    expectedContentSnippet: '7.5%',
  },
  {
    query: 'Who is the HoD of Information Technology?',
    expectedCategory: 'faculty',
    expectedContentSnippet: 'Varadhaganapathy',
  },
  {
    query: 'What is the placement salary for Automobile Engineering?',
    expectedCategory: 'placement',
    expectedContentSnippet: 'Automobile',
  },
  {
    query: 'hostal warden contact details',
    expectedCategory: 'hostel',
    expectedContentSnippet: 'Warden',
  },
  {
    query: 'What are the bus fees and fine policy?',
    expectedCategory: 'transport',
    expectedContentSnippet: '20,000',
  },
  {
    query: 'What is the TNEA admission code for KEC?',
    expectedCategory: 'admission',
    expectedContentSnippet: '2711',
  },
];

console.log('[TEST 3] Running Retrieval Query Benchmarks:');
for (const t of testQueries) {
  const cat = resolveCategoryFromQuery(t.query);
  const candidates = getCandidatePassages(t.query, 5);
  const hasCandidates = candidates.length > 0;
  const topCandidateText = candidates.map(c => c.sectionTitle + ' ' + c.content).join(' ');
  const snippetFound = topCandidateText.includes(t.expectedContentSnippet);

  console.log(`Query: "${t.query}"`);
  console.log(`  -> Detected category: ${cat}`);
  console.log(`  -> Top chunk: ${candidates[0]?.sectionTitle}`);
  console.log(`  -> Snippet "${t.expectedContentSnippet}" found: ${snippetFound ? 'YES' : 'NO'}`);

  if (snippetFound) {
    console.log('  STATUS: ✅ PASSED\n');
  } else {
    console.log('  STATUS: ❌ FAILED\n');
    allPassed = false;
  }
}

console.log('================================================================');
if (allPassed) {
  console.log('FINAL RESULT: ✅ ALL RETRIEVAL & INTEGRATION TESTS PASSED!');
  process.exit(0);
} else {
  console.log('FINAL RESULT: ❌ SOME TESTS FAILED');
  process.exit(1);
}
