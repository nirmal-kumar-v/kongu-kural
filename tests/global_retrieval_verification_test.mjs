import { getKnowledge, getCandidatePassages, hasStrongKnowledgeCoverage, understandAndNormalizeQuery } from '../server/services/knowledgeService.js';
import { isExplicitlyUnrelatedQuery } from '../server/services/groqService.js';

console.log('================================================================');
console.log('       KONGU KURAL — GLOBAL RETRIEVAL VERIFICATION TEST         ');
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
console.log(`[Loaded Knowledge] Chunks: ${kb.chunks.length}, Sections: ${kb.sections.length}\n`);

// -------------------------------------------------------------
// SUITE 1: CURRICULUM, COURSES & SEMESTERS (ALL PHRASING VARIATIONS)
// -------------------------------------------------------------
console.log('[SUITE 1] Curriculum, Subjects & Semester-Wise Offerings:');

// 1.1 Natural language with department
const q1 = 'When do IT students study cloud computing?';
const p1 = getCandidatePassages(q1, 5);
const cov1 = hasStrongKnowledgeCoverage(q1, p1);
assert(cov1, 'Coverage confirmed for: ' + q1);
assert(
  p1.some(p => p.content.includes('24ITC52') || (p.content.includes('Cloud Computing') && p.departmentId === 'it')),
  'IT Semester V Cloud Computing (24ITC52) retrieved'
);

// 1.2 Open-ended semester question without department
const q2 = 'Which sem has cloud computing?';
const p2 = getCandidatePassages(q2, 5);
const cov2 = hasStrongKnowledgeCoverage(q2, p2);
assert(cov2, 'Coverage confirmed for: ' + q2);
const hasItCloud = p2.some(p => p.content.includes('24ITC52') || (p.content.includes('Cloud Computing') && p.departmentId === 'it'));
const hasCseCloud = p2.some(p => p.content.includes('24CS601') || (p.content.includes('Cloud Computing and DevOps') && p.departmentId === 'cse'));
assert(hasItCloud && hasCseCloud, 'Both IT (Sem 5) and CSE (Sem 6) Cloud Computing courses retrieved');

// 1.3 Conversational Tanglish question
const q3 = 'IT students cloud computing eppo padippanga?';
const p3 = getCandidatePassages(q3, 5);
assert(
  p3.some(p => p.content.includes('24ITC52') || p.sectionTitle.includes('Information Technology')),
  'Tanglish query retrieved IT curriculum passage'
);

// 1.4 Tamil script question
const q4 = 'கிளவுட் கம்ப்யூட்டிங் எந்த செமஸ்டரில் வரும்?';
const p4 = getCandidatePassages(q4, 5);
const cov4 = hasStrongKnowledgeCoverage(q4, p4);
assert(cov4, 'Coverage confirmed for Tamil script: ' + q4);
assert(
  p4.some(p => p.content.includes('Cloud Computing')),
  'Tamil script query retrieved curriculum passages mentioning Cloud Computing'
);

// 1.5 CSE Deep Learning / DevOps Course
const q5 = 'What semester is Cloud Computing and DevOps taught in CSE?';
const p5 = getCandidatePassages(q5, 5);
assert(
  p5.some(p => p.content.includes('24CS601') && p.content.includes('Cloud Computing and DevOps')),
  'CSE Semester 6 24CS601 Cloud Computing and DevOps retrieved'
);

// -------------------------------------------------------------
// SUITE 2: FACULTY & RELATIONSHIPS (WHO BELONGS TO WHICH DEPARTMENT)
// -------------------------------------------------------------
console.log('\n[SUITE 2] Faculty, Leadership & Department Relationships:');

// 2.1 Cross-reference faculty to department
const q6 = 'Which department does Dr. P. C. Murugan belong to?';
const p6 = getCandidatePassages(q6, 5);
assert(
  p6.some(p => p.content.includes('Murugan') && (p.content.includes('Automobile') || p.departmentId === 'auto')),
  'Dr. P. C. Murugan resolved to Automobile Engineering'
);

// 2.2 HoD of IT
const q7 = 'Who is the HoD of Information Technology?';
const p7 = getCandidatePassages(q7, 5);
assert(
  p7.some(p => p.content.includes('Varadhaganapathy')),
  'Dr. S. Varadhaganapathy retrieved as HoD of IT'
);

// 2.3 Strict department isolation: IT faculty query must NOT return EIE/Mech
const q8 = 'List the faculty members in IT department';
const p8 = getCandidatePassages(q8, 10);
const allITorGeneral = p8.every(p => p.departmentId === 'it' || p.departmentId === 'general');
assert(allITorGeneral, 'Strict isolation: No other departments mixed into IT faculty results');

// -------------------------------------------------------------
// SUITE 3: CAMPUS REGULATIONS, DISCIPLINE, DRESS CODE & RULES
// -------------------------------------------------------------
console.log('\n[SUITE 3] Institutional Rules, Discipline, Timings & Regulations:');

// 3.1 Ragging rules and penalty
const q9 = 'What is the penalty for ragging in college?';
const p9 = getCandidatePassages(q9, 5);
const cov9 = hasStrongKnowledgeCoverage(q9, p9);
assert(cov9, 'Coverage confirmed for: ' + q9);
assert(
  p9.some(p => p.content.includes('Act No.7 of 1997') && p.content.includes('10,000') && p.content.includes('2 years imprisonment')),
  'Ragging Act No. 7 of 1997 & ₹10,000 / 2 years imprisonment penalty retrieved'
);

// 3.2 Dress code
const q10 = 'What is the dress code for boys and girls?';
const p10 = getCandidatePassages(q10, 5);
assert(
  p10.some(p => p.content.includes('Churidar with dupatta') && p.content.includes('black/brown shoes')),
  'Dress code specifications for girls and boys retrieved'
);

// 3.3 Helmet & Mobile phone policies
const q11 = 'Are helmets compulsory and can students use mobile phones on campus?';
const p11 = getCandidatePassages(q11, 5);
assert(
  p11.some(p => p.content.includes('Helmets are compulsory') && p.content.includes('banned inside campus')),
  'Helmet compulsion and mobile phone campus ban retrieved'
);

// 3.4 Library & FM Radio timings
const q12 = 'When is the library open on holidays and what are Kongu FM timings?';
const p12 = getCandidatePassages(q12, 5);
assert(
  p12.some(p => p.content.includes('9.00 AM to 5.00 PM') && p.content.includes('90.4MHz')),
  'Library holiday timings (9 AM - 5 PM) and Kongu FM 90.4MHz timings retrieved'
);

// -------------------------------------------------------------
// SUITE 4: GOVERNANCE, TRUSTEES, PRINCIPAL & COUNCILS
// -------------------------------------------------------------
console.log('\n[SUITE 4] Governance, KVITT Trust, Principal Profile & Councils:');

// 4.1 KVITT Trust President & Secretary
const q13 = 'Who is the President and Secretary of KVITT Trust?';
const p13 = getCandidatePassages(q13, 5);
assert(
  p13.some(p => p.content.includes('DEVARAJAN') && p.content.includes('SATHIYAMURTHI')),
  'KVITT President Thiru. C. Devarajan and Secretary Thiru. R. R. Sathiyamurthi retrieved'
);

// 4.2 Principal profile & research
const q14 = 'Tell me about Principal Dr. R. Parameshwaran qualifications and research projects';
const p14 = getCandidatePassages(q14, 5);
assert(
  p14.some(p => p.content.includes('NIT Trichy') && p.content.includes('3D metal printer') && p.content.includes('2.86 crores')),
  'Principal qualifications, NIT Trichy degree & DST 3D metal printer project retrieved'
);

// 4.3 Governing Council Chairman & Nominees
const q15 = 'Who is the Chairman of Governing Council of KEC?';
const p15 = getCandidatePassages(q15, 5);
assert(
  p15.some(p => p.content.includes('Sathiyamurthi') && p.content.includes('Governing Council')),
  'Governing Council Chairman Thiru. R. R. Sathiyamurthi retrieved'
);

// 4.4 Academic Council Controller of Examinations
const q16 = 'Who is the Controller of Examinations and Dean Academic in Academic Council?';
const p16 = getCandidatePassages(q16, 5);
assert(
  p16.some(p => p.content.includes('Thamilselvan') && p.content.includes('Murugesan')),
  'COE Dr. R. Thamilselvan and Dean Academic Dr. G. Murugesan retrieved'
);

// -------------------------------------------------------------
// SUITE 5: ADMISSIONS, SCHOLARSHIPS, HOSTELS & TRANSPORT
// -------------------------------------------------------------
console.log('\n[SUITE 5] Admissions, Scholarships, Hostels & Transport:');

// 5.1 7.5% Government school scholarship
const q17 = 'What scholarship is available for 7.5% government school students?';
const p17 = getCandidatePassages(q17, 5);
assert(
  p17.some(p => p.content.includes('7.5%') && (p.content.includes('tuition fee') || p.content.includes('waiver'))),
  '7.5% Government school fee waiver scheme retrieved'
);

// 5.2 Hostel Wardens
const q18 = 'Who is the hostel warden and what are the contact numbers?';
const p18 = getCandidatePassages(q18, 5);
assert(
  p18.some(p => p.content.includes('Warden') && p.category?.includes('hostel')),
  'Hostel warden directory retrieved'
);

// 5.3 Transport bus timings and payment fine
const q19 = 'What are the college bus departure timings and late fee fine?';
const p19 = getCandidatePassages(q19, 5);
assert(
  p19.some(p => p.content.includes('4:45 PM') && p.content.includes('50')),
  'Bus departure 4:45 PM and late fine ₹50 per day retrieved'
);

// -------------------------------------------------------------
// SUITE 6: UNRELATED GUARD (NEVER RETRIEVE COLLEGE CHUNKS FOR RANDOM TRIVIA)
// -------------------------------------------------------------
console.log('\n[SUITE 6] Guard against Unrelated Queries:');
const unrelated1 = isExplicitlyUnrelatedQuery('How to bake a chocolate cake at home?');
assert(unrelated1, 'Recipe query correctly classified as unrelated');

const unrelated2 = isExplicitlyUnrelatedQuery('Recommend best comedy movies of 2024');
assert(unrelated2, 'Movie recommendation query correctly classified as unrelated');

const relatedCampus = isExplicitlyUnrelatedQuery('When do IT students study cloud computing?');
assert(!relatedCampus, 'Campus question correctly retained as related');

// -------------------------------------------------------------
// SUMMARY
// -------------------------------------------------------------
console.log('\n================================================================');
if (allPassed) {
  console.log('  🎉 ALL GLOBAL RETRIEVAL VERIFICATION TESTS PASSED!');
} else {
  console.error('  ❌ SOME TESTS FAILED.');
}
console.log('================================================================\n');

process.exit(allPassed ? 0 : 1);
