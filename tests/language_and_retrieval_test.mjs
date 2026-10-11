import { resolveQueryLanguage } from '../server/services/languageService.js';
import {
  understandAndNormalizeQuery,
  getCandidatePassages,
  getKnowledge,
  resolveDepartmentFromQuery,
  resolveCategoryFromQuery,
} from '../server/services/knowledgeService.js';
import fs from 'fs';
import path from 'path';

console.log('================================================================');
console.log('   LANGUAGE RESOLUTION & INTENT RETRIEVAL VERIFICATION TEST     ');
console.log('================================================================\n');

let allPassed = true;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    allPassed = false;
  }
}

// -------------------------------------------------------------
// TEST SUITE 1: LANGUAGE RESOLUTION
// -------------------------------------------------------------
console.log('[SUITE 1] Language Resolution Testing:');

const languageTests = [
  // 1. English queries -> English target
  {
    query: 'What are the college bus timings?',
    expectedDetected: 'English',
    expectedTarget: 'English',
    expectedOverride: false,
    label: 'Standard English question',
  },
  {
    query: 'Who is the principal of Kongu Engineering College?',
    expectedDetected: 'English',
    expectedTarget: 'English',
    expectedOverride: false,
    label: 'English question about principal',
  },

  // 2. Tamil script queries -> Tamil target
  {
    query: 'விடுதி கட்டணம் எவ்வளவு?',
    expectedDetected: 'Tamil',
    expectedTarget: 'Tamil',
    expectedOverride: false,
    label: 'Tamil script question on hostel fees',
  },
  {
    query: 'கல்லூரி பேருந்து நேரம் என்ன?',
    expectedDetected: 'Tamil',
    expectedTarget: 'Tamil',
    expectedOverride: false,
    label: 'Tamil script question on bus timings',
  },
  {
    query: 'தகவல் தொழில்நுட்ப துறை தலைவர் யார்?',
    expectedDetected: 'Tamil',
    expectedTarget: 'Tamil',
    expectedOverride: false,
    label: 'Tamil script question on IT HoD',
  },

  // 3. Tanglish queries (Tamil written in English letters) -> English target
  {
    query: 'hostel fees evalo?',
    expectedDetected: 'Tanglish',
    expectedTarget: 'English',
    expectedOverride: false,
    label: 'Tanglish: hostel fees evalo',
  },
  {
    query: 'college bus timings enna?',
    expectedDetected: 'Tanglish',
    expectedTarget: 'English',
    expectedOverride: false,
    label: 'Tanglish: bus timings enna',
  },
  {
    query: 'it hod yaaru?',
    expectedDetected: 'Tanglish',
    expectedTarget: 'English',
    expectedOverride: false,
    label: 'Tanglish: it hod yaaru',
  },
  {
    query: 'college la sports facilities irukka?',
    expectedDetected: 'Tanglish',
    expectedTarget: 'English',
    expectedOverride: false,
    label: 'Tanglish: sports facilities irukka',
  },
  {
    query: 'viduthi kattanam evvalo sollu',
    expectedDetected: 'Tanglish',
    expectedTarget: 'English',
    expectedOverride: false,
    label: 'Tanglish: viduthi kattanam evvalo sollu',
  },

  // 4. Explicit Language Requests (Overrides)
  {
    query: 'What are the college bus timings? answer in tamil',
    expectedTarget: 'Tamil',
    expectedOverride: true,
    label: 'English query with "answer in tamil"',
  },
  {
    query: 'hostel fees evalo? tamil la sollu',
    expectedTarget: 'Tamil',
    expectedOverride: true,
    label: 'Tanglish query with "tamil la sollu"',
  },
  {
    query: 'Who is the principal? பதில் தமிழில் தரவும்',
    expectedTarget: 'Tamil',
    expectedOverride: true,
    label: 'Query with Tamil script explicit request: பதில் தமிழில்',
  },
  {
    query: 'விடுதி கட்டணம் எவ்வளவு? answer in english',
    expectedTarget: 'English',
    expectedOverride: true,
    label: 'Tamil script query with "answer in english"',
  },
  {
    query: 'கல்லூரி பேருந்து நேரம் என்ன? in english please',
    expectedTarget: 'English',
    expectedOverride: true,
    label: 'Tamil script query with "in english please"',
  },
];

for (const tc of languageTests) {
  const res = resolveQueryLanguage(tc.query);
  if (tc.expectedDetected) {
    assert(
      res.detectedLanguage === tc.expectedDetected,
      `${tc.label} -> detectedLanguage="${res.detectedLanguage}" (expected "${tc.expectedDetected}")`
    );
  }
  assert(
    res.targetLanguage === tc.expectedTarget,
    `${tc.label} -> targetLanguage="${res.targetLanguage}" (expected "${tc.expectedTarget}")`
  );
  assert(
    res.explicitOverride === tc.expectedOverride,
    `${tc.label} -> explicitOverride=${res.explicitOverride} (expected ${tc.expectedOverride})`
  );
}

// -------------------------------------------------------------
// TEST SUITE 2: TYPO TOLERANCE, PHONETIC TAMIL & RETRIEVAL ACCURACY
// -------------------------------------------------------------
console.log('\n[SUITE 2] Typo Tolerance, Phonetic Tamil & Retrieval from college-info-2:');

const retrievalTests = [
  {
    label: 'Typo in department and placement: "automoblie placment salary"',
    query: 'automoblie placment salary',
    check: (norm, passages) => {
      const hasDept = norm.department?.id === 'auto';
      const hasCat = norm.category === 'placement';
      const topMatch = passages[0];
      const hasSnippet =
        topMatch &&
        topMatch.content.includes('Automobile') &&
        (topMatch.content.includes('7.5') || topMatch.content.includes('3.6') || topMatch.content.includes('48'));
      return hasDept && hasCat && hasSnippet;
    },
    detail: 'Resolved Automobile dept + placement category + Automobile placement passage',
  },
  {
    label: 'Typo in department and faculty: "machanical faculity"',
    query: 'machanical faculity',
    check: (norm, passages) => {
      const hasDept = norm.department?.id === 'mech';
      const hasCat = norm.category === 'faculty';
      const topMatch = passages[0];
      const hasContent = topMatch && topMatch.content.includes('Mechanical');
      return hasDept && hasCat && hasContent;
    },
    detail: 'Resolved Mechanical dept + faculty category',
  },
  {
    label: 'Typo in instrumentation: "instrumentaion engineering hod"',
    query: 'instrumentaion engineering hod',
    check: (norm, passages) => {
      const hasDept = norm.department?.id === 'eie';
      const topMatch = passages[0];
      return hasDept && topMatch && topMatch.departmentId === 'eie';
    },
    detail: 'Resolved EIE dept from "instrumentaion"',
  },
  {
    label: 'Phonetic Tamil/Tanglish: "viduthi kattanam evalo"',
    query: 'viduthi kattanam evalo',
    check: (norm, passages) => {
      const hasCat = norm.category === 'fees' || norm.category === 'hostel';
      const hasPassage = passages.some((p) => p.content.includes('Hostel') || p.content.includes('Mess'));
      return hasCat && hasPassage;
    },
    detail: 'Mapped viduthi & kattanam to hostel/fees category and retrieved hostel facts',
  },
  {
    label: 'Phonetic Tamil/Tanglish: "perunthu timimg"',
    query: 'perunthu timimg',
    check: (norm, passages) => {
      const hasCat = norm.category === 'transport';
      const hasPassage = passages.some((p) => p.category === 'transport' && p.content.includes('4:45 PM'));
      return hasCat && hasPassage;
    },
    detail: 'Mapped perunthu & typo timimg to transport and retrieved bus timings',
  },
  {
    label: 'Typo in scholarship: "scolarship details for 7.5% government school students"',
    query: 'scolarship details for 7.5% government school students',
    check: (norm, passages) => {
      const hasCat = norm.category === 'scholarship';
      const hasPassage = passages.some((p) => p.content.includes('7.5%'));
      return hasCat && hasPassage;
    },
    detail: 'Mapped scolarship to scholarship category and retrieved 7.5% scheme',
  },
  {
    label: 'Tanglish: "it hod yaaru"',
    query: 'it hod yaaru',
    check: (norm, passages) => {
      const hasDept = norm.department?.id === 'it';
      const topMatch = passages[0];
      const hasVaradha = passages.some((p) => p.content.includes('Varadhaganapathy'));
      return hasDept && hasVaradha;
    },
    detail: 'Identified IT dept + retrieved Dr. Varadhaganapathy as HoD',
  },
];

for (const tc of retrievalTests) {
  const norm = understandAndNormalizeQuery(tc.query);
  const passages = getCandidatePassages(tc.query, 10, norm);
  const pass = tc.check(norm, passages);
  assert(pass, `${tc.label} -> ${tc.detail}`);
}

// -------------------------------------------------------------
// TEST SUITE 3: SOURCES UI COMPONENT VERIFICATION
// -------------------------------------------------------------
console.log('\n[SUITE 3] Sources UI Dropdown Initial State:');

const messageItemPath = path.resolve(process.cwd(), 'src/components/MessageItem.tsx');
const messageItemContent = fs.readFileSync(messageItemPath, 'utf-8');

const hasClosedByDefault = messageItemContent.includes('const [sourcesOpen, setSourcesOpen] = useState(false);');
assert(hasClosedByDefault, 'MessageItem initializes sourcesOpen state to false (CLOSED by default)');

const hasToggleHandler = messageItemContent.includes('onClick={() => setSourcesOpen(!sourcesOpen)}');
assert(hasToggleHandler, 'MessageItem contains toggle handler to expand sources when user clicks');

// -------------------------------------------------------------
// SUMMARY
// -------------------------------------------------------------
console.log('\n================================================================');
if (allPassed) {
  console.log('  🎉 ALL TESTS PASSED SUCCESSFULLY!');
} else {
  console.error('  ❌ SOME TESTS FAILED. PLEASE REVIEW THE LOGS.');
}
console.log('================================================================\n');

process.exit(allPassed ? 0 : 1);
