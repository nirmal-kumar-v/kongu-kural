import assert from 'assert';
import path from 'path';

async function testAcademicCalendar() {
  console.log('=== TEST 1: Load Knowledge and Verify Section 8.6-8.10 Chunks ===');
  const { getKnowledge, getCandidatePassages, hasStrongKnowledgeCoverage } = await import(
    '../server/services/knowledgeService.js'
  );

  const knowledge = getKnowledge();
  console.log(`Loaded ${knowledge.chunks.length} chunks from ${knowledge.filePath}`);

  const sectionTitles = knowledge.chunks.map((c) => c.sectionTitle);
  const requiredSections = [
    'Academic Schedule 2026–27 — Odd Semester (Senior Semesters)',
    'Academic Schedule 2026–27 — Odd Semester (First Semester Programmes)',
    'Academic Schedule 2026–27 — Even Semester (All Programmes & Batches)',
    'Academic Schedule 2026–27 — Master Date-by-Date Schedule & Event Calendar',
    'Academic Schedule 2026–27 — FAQs & Specific Exam/CAT Lookups',
  ];

  for (const reqSec of requiredSections) {
    const found = sectionTitles.some((t) => t.includes(reqSec));
    console.log(`Checking "${reqSec}" -> Found: ${found}`);
    assert(found, `Expected chunk for "${reqSec}" not found!`);
  }
  console.log('✔ All 5 Academic Schedule chunks are present in knowledge base.');

  console.log('\n=== TEST 2: Retrieval for Target Calendar Queries ===');

  const testCases = [
    {
      q: 'When is CAT 3 for Regulation 2024, 5th semester?',
      expectedContent: '26, 27, 28 Oct',
    },
    {
      q: 'When is CAT 3 for Regulation 2024 students in 5th semester?',
      expectedContent: '26, 27, 28',
    },
    {
      q: 'What is scheduled on 26 October 2026?',
      expectedContent: '26 October 2026',
    },
    {
      q: 'When do classes commence for BE/BTech Semester 5 Regulation 2024?',
      expectedContent: '29 June 2026',
    },
    {
      q: 'When is CAT 1 for first year BE/BTech Regulation 2026?',
      expectedContent: '24-29 Oct',
    },
    {
      q: 'When are the practical examinations for BE/BTech 5th semester?',
      expectedContent: '02, 03, 04 Nov 2026',
    },
    {
      q: 'When is the project report submission for BE/BTech 7th semester?',
      expectedContent: '10 Oct 2026',
    },
    {
      q: 'When is the project viva voce for BE/BTech 7th semester?',
      expectedContent: '13, 14 Oct 2026',
    },
    {
      q: 'When does the even semester reopen for BE/BTech 5th semester?',
      expectedContent: '07 Dec 2026',
    },
    {
      q: 'When is CAT 1 for BE/BTech 8th semester Batch 2022?',
      expectedContent: '14 Dec 2026',
    },
  ];

  for (const { q, expectedContent } of testCases) {
    const candidates = getCandidatePassages(q, 5);
    const hasCoverage = hasStrongKnowledgeCoverage(q, candidates);
    const matched = candidates.some((c) =>
      c.content.toLowerCase().includes(expectedContent.toLowerCase())
    );
    console.log(`Query: "${q}" -> Coverage: ${hasCoverage}, Matched: ${matched}`);
    assert(matched, `Failed to retrieve passage containing "${expectedContent}" for query: "${q}"`);
  }
  console.log('✔ All candidate retrieval tests passed.');

  console.log('\n=== TEST 3: Live End-to-End API Test for Calendar Example Query ===');
  const res = await fetch('http://localhost:5000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'When is CAT 3 for Regulation 2024 students in 5th semester?',
    }),
  });

  assert.strictEqual(res.status, 200, 'API must return 200 OK');
  const data = await res.json();
  console.log(`Provider: ${data.provider}`);
  console.log(`Answer:\n${data.answer}`);
  assert(
    data.answer.includes('26') && data.answer.includes('27') && data.answer.includes('28'),
    'Answer must state 26, 27, 28 October 2026'
  );
  console.log('✔ Live API returned correct date: 26, 27, 28 October 2026.');

  console.log('\n🎉 ALL ACADEMIC CALENDAR INTEGRATION TESTS PASSED!');
}

testAcademicCalendar().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
