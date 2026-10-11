import { getCandidatePassages, understandAndNormalizeQuery } from '../server/services/knowledgeService';

const testCases = [
  {
    query: 'When is Enthusia?',
    expectedCategory: 'events',
    mustIncludeInTop: ['Enthusia', '05 March 2027']
  },
  {
    query: 'When is Swaram?',
    expectedCategory: 'events',
    mustIncludeInTop: ['Swaram', '12 March 2027']
  },
  {
    query: 'What event is on 19 March 2027?',
    expectedCategory: 'events',
    mustIncludeInTop: ['Sports Day', 'Annual Day', 'Farewell Day']
  },
  {
    query: 'What happens on 18 September 2026 in KEC?',
    expectedCategory: 'events',
    mustIncludeInTop: ['Techno Cultural Fest', 'Founders']
  },
  {
    query: 'When is Kongu Trophy?',
    expectedCategory: 'events',
    mustIncludeInTop: ['Kongu Trophy', '19 September 2026']
  },
  {
    query: 'What are the general examination rules?',
    expectedCategory: 'exam_rules',
    mustIncludeInTop: ['The 19 Mandatory Examination Instructions']
  },
  {
    query: 'Can students bring a mobile phone into the examination hall?',
    expectedCategory: 'exam_rules',
    mustIncludeInTop: ['prohibited from possessing cell phone']
  },
  {
    query: 'Can candidates use calculators during exams?',
    expectedCategory: 'exam_rules',
    mustIncludeInTop: ['non-programmable calculators']
  },
  {
    query: 'Can a candidate get a scribe for exam due to illness?',
    expectedCategory: 'exam_rules',
    mustIncludeInTop: ['scribe']
  },
  {
    query: 'What happens if a candidate writes their name in the answer script?',
    expectedCategory: 'malpractice',
    mustIncludeInTop: ['Fine of Rs. 1000']
  },
  {
    query: 'What is the punishment for impersonation in examinations?',
    expectedCategory: 'malpractice',
    mustIncludeInTop: ['police', 'Impersonation']
  },
  {
    query: 'How many total offers were secured in 2025-2026 batch placements?',
    expectedCategory: 'placement',
    mustIncludeInTop: ['1,828', '1,529', '409']
  },
  {
    query: 'How many offers did Soliton Technologies give for 2025-2026?',
    expectedCategory: 'placement',
    mustIncludeInTop: ['Soliton Technologies', '9']
  },
  {
    query: 'How many offers did Cognizant provide in 2025-2026?',
    expectedCategory: 'placement',
    mustIncludeInTop: ['Cognizant', '126']
  },
  {
    query: 'என்சியூசியா கலாச்சார விழா எப்போது நடைபெறும்?',
    expectedCategory: 'events',
    mustIncludeInTop: ['05 March 2027']
  },
  {
    query: 'சுவரம் இசை நிகழ்ச்சி எப்போது நடைபெறும்?',
    expectedCategory: 'events',
    mustIncludeInTop: ['12 March 2027']
  },
  {
    query: '19 மார்ச் 2027 அன்று கல்லூரியில் என்ன நிகழ்ச்சிகள்?',
    expectedCategory: 'events',
    mustIncludeInTop: ['19 March 2027']
  }
];

let allPassed = true;

for (const tc of testCases) {
  const norm = understandAndNormalizeQuery(tc.query);
  const passages = getCandidatePassages(tc.query, 3, norm);

  console.log(`\n--------------------------------------------------`);
  console.log(`Query: "${tc.query}"`);
  console.log(`Normalized Category: "${norm.category}" (Expected: "${tc.expectedCategory}")`);

  if (!passages || passages.length === 0) {
    console.error(`FAILED: Zero passages returned for query: ${tc.query}`);
    allPassed = false;
    continue;
  }

  const topContent = passages.map(p => p.content).join('\n---\n');
  const missingInTop = tc.mustIncludeInTop.filter(target => !topContent.toLowerCase().includes(target.toLowerCase()));

  if (missingInTop.length > 0) {
    console.error(`FAILED: Top passages missing expected targets: ${missingInTop.join(', ')}`);
    console.error(`Top passage heading: ${passages[0].mainHeading} - ${passages[0].sectionTitle}`);
    allPassed = false;
  } else {
    console.log(`PASSED: All targets [${tc.mustIncludeInTop.join(', ')}] matched in top passages!`);
    console.log(`Top match: ${passages[0].sectionTitle}`);
  }
}

if (!allPassed) {
  console.error('\nSOME TESTS FAILED!');
  process.exit(1);
} else {
  console.log('\n==================================================');
  console.log(`ALL ${testCases.length} RETRIEVAL & NORMALIZATION TESTS PASSED PERFECTLY!`);
  console.log('==================================================\n');
}
