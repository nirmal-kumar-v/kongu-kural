import { getKnowledge, getCandidatePassages } from '../server/services/knowledgeService.js';

console.log('================================================================');
console.log('   NEW CONTENT RETRIEVAL & INTEGRATION VERIFICATION TEST        ');
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

const kb = getKnowledge();

// 1. Test IT Regulation 2024 Courses
console.log('[TEST 1] IT Regulation 2024 Curriculum:');
const itPassages = getCandidatePassages('IT regulation 2024 courses semester 1 course codes', 10);
const itHas24EGT11 = itPassages.some((p) => p.content.includes('24EGT11') && p.content.includes('24ITT11'));
assert(itHas24EGT11, 'IT Semester 1 course codes (24EGT11, 24ITT11) successfully retrieved');

const itHasDeepLearning = itPassages.some((p) => p.content.includes('24ITT61') && p.content.includes('Deep Learning and Generative AI'));
assert(itHasDeepLearning, 'IT Semester 6 (24ITT61 Deep Learning and Generative AI) successfully retrieved');

// 2. Test CSE Regulation 2024 Courses
console.log('\n[TEST 2] CSE Regulation 2024 Curriculum:');
const csePassages = getCandidatePassages('CSE regulation 2024 course codes semester 1', 10);
const cseHas24CS101 = csePassages.some((p) => p.content.includes('24CS101') && p.content.includes('Problem Solving and Programming in C'));
assert(cseHas24CS101, 'CSE Semester 1 course code (24CS101) successfully retrieved');

const cseHasDevOps = csePassages.some((p) => p.content.includes('24CS601') && p.content.includes('Cloud Computing and DevOps'));
assert(cseHasDevOps, 'CSE Semester 6 (24CS601 Cloud Computing and DevOps) successfully retrieved');

// 3. Test College Rules, Timings, Dress Code, Ragging & Policies
console.log('\n[TEST 3] College Rules, Timings & Student Regulations:');
const rulesPassages = getCandidatePassages('What is the dress code and rules for boys and girls?', 10);
const hasDressCode = rulesPassages.some((p) => p.content.includes('Churidar with dupatta') && p.content.includes('black/brown shoes'));
assert(hasDressCode, 'Dress code details for girls and boys successfully retrieved');

const raggingPassages = getCandidatePassages('What is the penalty for ragging in college?', 10);
const hasRaggingAct = raggingPassages.some((p) => p.content.includes('Act No.7 of 1997') && p.content.includes('10,000'));
assert(hasRaggingAct, 'Ragging prohibition Act No. 7 of 1997 & ₹10,000 fine penalty retrieved');

const fmPassages = getCandidatePassages('Kongu FM radio broadcast timings frequency', 10);
const hasFmTimings = fmPassages.some((p) => p.content.includes('90.4MHz') && p.content.includes('6.30 AM to 10.00 AM'));
assert(hasFmTimings, 'Kongu FM 90.4MHz broadcast timings retrieved');

const helmetPassages = getCandidatePassages('Is helmet and mobile phone allowed?', 10);
const hasHelmetAndMobile = helmetPassages.some((p) => p.content.includes('Helmets are compulsory') && p.content.includes('banned inside campus'));
assert(hasHelmetAndMobile, 'Helmet mandate and mobile phone campus ban retrieved');

// 4. Test KVITT Trust Members
console.log('\n[TEST 4] Trust Members of KEC (KVITT):');
const trustPassages = getCandidatePassages('Who are the trust members and president of KEC KVITT?', 10);
const hasPresident = trustPassages.some(
  (p) => p.content.toUpperCase().includes('DEVARAJAN') && p.content.toUpperCase().includes('PRESIDENT')
);
const hasSecretary = trustPassages.some(
  (p) => p.content.toUpperCase().includes('SATHIYAMURTHI') && p.content.toUpperCase().includes('SECRETARY')
);
assert(hasPresident && hasSecretary, 'KVITT President Thiru. C. Devarajan and Secretary Thiru. R. R. Sathiyamurthi retrieved');

// 5. Test Principal Profile
console.log('\n[TEST 5] Principal Dr. R. Parameshwaran Profile:');
const principalPassages = getCandidatePassages('Tell me about principal Dr R Parameshwaran qualifications and research', 10);
const hasPrincipalBio = principalPassages.some(
  (p) => p.content.includes('NIT Trichy') && p.content.includes('65 research papers') && p.content.includes('3D metal printer')
);
assert(hasPrincipalBio, 'Principal profile (NIT Trichy, 65 papers, 3D metal printer project) retrieved');

// 6. Test Governing Council Members
console.log('\n[TEST 6] Governing Council Members:');
const gcPassages = getCandidatePassages('Who are the members of the Governing Council of Kongu Engineering College?', 10);
const hasGcMembers = gcPassages.some(
  (p) => p.content.includes('Governing Council') && p.content.includes('Bhagyaveni') && p.content.includes('Tamilarasan')
);
assert(hasGcMembers, 'Governing Council members (Anna Univ nominee Dr. Bhagyaveni, Industry nominee Mr. Tamilarasan) retrieved');

// 7. Test Academic Council Members
console.log('\n[TEST 7] Academic Council Members:');
const acPassages = getCandidatePassages('Who are the members of the Academic Council of KEC?', 10);
const hasAcMembers = acPassages.some(
  (p) => p.content.includes('Academic Council') && p.content.includes('Valliyammai') && p.content.includes('Thamilselvan')
);
assert(hasAcMembers, 'Academic Council members (Dr. Valliyammai, Controller of Examinations Dr. Thamilselvan) retrieved');

// -------------------------------------------------------------
// SUMMARY
// -------------------------------------------------------------
console.log('\n================================================================');
if (allPassed) {
  console.log('  🎉 ALL NEW CONTENT INTEGRATION TESTS PASSED!');
} else {
  console.error('  ❌ SOME TESTS FAILED.');
}
console.log('================================================================\n');

process.exit(allPassed ? 0 : 1);
