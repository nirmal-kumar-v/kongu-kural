import fs from 'fs';
import path from 'path';

const origFile = path.resolve(process.cwd(), 'college-info.txt');
const newFile = path.resolve(process.cwd(), 'college-info-2.txt');

const origContent = fs.readFileSync(origFile, 'utf-8');
const newContent = fs.readFileSync(newFile, 'utf-8');

console.log('================================================================');
console.log('       KONGU KURAL — COLLEGE-INFO-2 VERIFICATION SUITE          ');
console.log('================================================================\n');

let allPassed = true;

// 1. Verify URLs
const urlRegex = /https?:\/\/[^\s)\]>"']+/gi;
const origUrls = Array.from(new Set(origContent.match(urlRegex) || []));
let missingUrls = [];
for (const u of origUrls) {
  if (!newContent.includes(u)) {
    missingUrls.push(u);
  }
}
console.log(`[CHECK 1] URLs Verification: ${origUrls.length} unique URLs in original file.`);
if (missingUrls.length === 0) {
  console.log('STATUS: ✅ PASSED (100% of URLs preserved)\n');
} else {
  console.log(`STATUS: ❌ FAILED (${missingUrls.length} missing URLs: ${missingUrls.slice(0, 5).join(', ')})\n`);
  allPassed = false;
}

// 2. Verify Email Addresses
const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const origEmails = Array.from(new Set(origContent.match(emailRegex) || []));
let missingEmails = [];
for (const e of origEmails) {
  if (!newContent.includes(e)) {
    missingEmails.push(e);
  }
}
console.log(`[CHECK 2] Email Addresses Verification: ${origEmails.length} unique emails in original file.`);
if (missingEmails.length === 0) {
  console.log('STATUS: ✅ PASSED (100% of emails preserved)\n');
} else {
  console.log(`STATUS: ❌ FAILED (${missingEmails.length} missing emails: ${missingEmails.slice(0, 5).join(', ')})\n`);
  allPassed = false;
}

// 3. Verify Phone Numbers
const phoneRegex = /(?:\+?91\s*)?(?:\d{5}\s*\d{5}|\d{4}-\d{6}|\d{10}|\b\d{4}-\d{6}\b)/g;
const origPhones = Array.from(new Set((origContent.match(phoneRegex) || []).map((p) => p.trim())));
let missingPhones = [];
for (const p of origPhones) {
  if (!newContent.includes(p)) {
    missingPhones.push(p);
  }
}
console.log(`[CHECK 3] Phone & Helpline Numbers: ${origPhones.length} phone patterns checked.`);
if (missingPhones.length === 0) {
  console.log('STATUS: ✅ PASSED (100% of phone contacts preserved)\n');
} else {
  console.log(`STATUS: ❌ FAILED (${missingPhones.length} missing: ${missingPhones.slice(0, 5).join(', ')})\n`);
  allPassed = false;
}

// 4. Verify Faculty Members & Key Leaders
const sampleFaculty = [
  'Dr. S. Varadhaganapathy',
  'Dr. J. Premalatha',
  'Dr. S. Vijayachitra',
  'Dr. S. J. Suji Prasad',
  'Dr. R. R. Rajalaxmi',
  'Dr. G. Murugesan',
  'Dr. P. Selvakumar',
  'Dr. R. Rajasekar',
  'Dr. S. Balaji',
  'Dr. R. Parameshwaran',
  'Mr. K. Sakthivel',
  'Ms. D. Ramya',
];
let missingStaff = [];
for (const s of sampleFaculty) {
  if (!newContent.includes(s)) {
    missingStaff.push(s);
  }
}
console.log(`[CHECK 4] Key Staff & Leadership Verification: ${sampleFaculty.length} checked.`);
if (missingStaff.length === 0) {
  console.log('STATUS: ✅ PASSED (100% of sample staff verified)\n');
} else {
  console.log(`STATUS: ❌ FAILED (${missingStaff.length} missing: ${missingStaff.join(', ')})\n`);
  allPassed = false;
}

// 5. Verify Transport Routes & Key Destinations
const transportRoutes = [
  '78',
  '26',
  'Erode',
  'Tiruppur',
  'Perundurai Bus Stand',
  'Gobichettipalayam',
  'Kangeyam',
  'Tiruchengode',
  'Sathyamangalam',
  'Athani',
  'Anthiyur',
  'Komarapalayam',
  'Bhavani',
  'Sankagiri',
  'SPB Colony',
  'Chennimalai',
  'Sivagiri',
  'Ammapettai',
  'Edapadi',
  'Kodumudi',
  'Vellakovil',
  'Palladam',
  'Avinashi',
  'Nambiyur',
  'Appakoodal',
  'Nathakadiyur',
  'Thandapalayam',
  'Getticheviyur',
  '4:45 PM',
  '5:30 PM',
  '6:45 PM',
  '₹20,000',
  '₹50',
  'Mr. K. Sakthivel',
  '98427 20087',
  'Linways',
  'Route Nos. 18, 39, 39-A, and 20-B',
];
let missingTransport = [];
for (const r of transportRoutes) {
  if (!newContent.includes(r)) {
    missingTransport.push(r);
  }
}
console.log(`[CHECK 5] Transport Details & Route Verification: ${transportRoutes.length} checked.`);
if (missingTransport.length === 0) {
  console.log('STATUS: ✅ PASSED (100% of transport data preserved)\n');
} else {
  console.log(`STATUS: ❌ FAILED (${missingTransport.length} missing: ${missingTransport.join(', ')})\n`);
  allPassed = false;
}

// 6. Verify Placement Figures
const placementFigures = [
  '1,784',
  '₹5.6 lakh per annum',
  '₹61.21 LPA',
  '172',
  '355',
  '94.1%',
  '1,360',
  '1,453',
  '1,108',
  '1,320',
  '₹24.5 LPA',
  '₹21 LPA',
  '₹7.5 LPA',
  '₹3.6 LPA',
  'Rubrik',
  'Zoho',
  'Mr. Cooper',
  'Zopsmart',
  'FourKites',
];
let missingPlacement = [];
for (const p of placementFigures) {
  if (!newContent.includes(p)) {
    missingPlacement.push(p);
  }
}
console.log(`[CHECK 6] Placement Figures & Recruiter Verification: ${placementFigures.length} checked.`);
if (missingPlacement.length === 0) {
  console.log('STATUS: ✅ PASSED (100% of placement statistics preserved)\n');
} else {
  console.log(`STATUS: ❌ FAILED (${missingPlacement.length} missing: ${missingPlacement.join(', ')})\n`);
  allPassed = false;
}

console.log('================================================================');
if (allPassed) {
  console.log('FINAL RESULT: ✅ ALL VERIFICATIONS PASSED SUCCESSFULLY!');
  process.exit(0);
} else {
  console.log('FINAL RESULT: ❌ SOME CHECKS FAILED');
  process.exit(1);
}
