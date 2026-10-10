import fs from 'fs';
import path from 'path';

const sourceFile = path.resolve(process.cwd(), 'college-info.txt');
const targetFile = path.resolve(process.cwd(), 'college-info-2.txt');

const raw = fs.readFileSync(sourceFile, 'utf-8');
const lines = raw.split(/\r?\n/);

console.log(`Original file lines: ${lines.length}`);
console.log(`Original file bytes: ${Buffer.byteLength(raw, 'utf-8')}`);

// Extract slices corresponding to each core section:
// 1. Hostel: lines 1 - 76 (0 to 76)
const hostelRaw = lines.slice(0, 76).join('\n');

// 2. Leadership & HODs: lines 77 - 119 (76 to 119)
const hodRaw = lines.slice(76, 119).join('\n');

// 3. Faculty directory & department summary: lines 120 - 522 (119 to 522)
const facultyRaw = lines.slice(119, 522).join('\n');

// 4. Placement info (part 1): lines 523 - 750 (522 to 750)
const placementPart1Raw = lines.slice(522, 750).join('\n');

// 5. Physical Education: lines 751 - 1638 (750 to 1638)
const sportsRaw = lines.slice(750, 1638).join('\n');

// 6. Structured KB (1-17): lines 1639 - 2311 (1638 to 2311)
const structuredKbRaw = lines.slice(1638, 2311).join('\n');

// 7. Transport: lines 2312 - 2623 (2311 to 2623)
const transportRaw = lines.slice(2311, 2623).join('\n');

// 8. Extended Academics, Working Hours, Autonomous Syllabus & Scholarships: lines 2624 - 3289 (2623 to 3289)
const extendedAcademicsRaw = lines.slice(2623, 3289).join('\n');

// 9. Extended Placement Training & Recruiter Metrics: lines 3290 - 3379 (3289 to end)
const extendedPlacementRaw = lines.slice(3289).join('\n');

const organizedDocument = `# KONGU ENGINEERING COLLEGE (KEC) — COMPREHENSIVE KNOWLEDGE BASE (VERSION 2)
# Document Identifier: college-info-2.txt
# Institution: Kongu Engineering College (Autonomous), Perundurai, Erode - 638060, Tamil Nadu, India
# Affiliation: Anna University, Chennai | Approved by AICTE | Accredited by NAAC (A++ Grade)
# Governance: The Kongu Vellalar Institute of Technology Trust (KVITT) (Established 1983)
# Purpose: Master official campus intelligence reference for Kongu Kural Assistant.

====================================================================================================
SECTION 1: HOSTEL ACCOMMODATION, WARDENS, MESS, TIMINGS, RULES & EXPENSES
====================================================================================================

## 1.1 KEC Hostel Staff & Warden Directory

Table: S.No | Hostel Block | Staff Name | Designation | Contact Info | Email ID
----------------------------------------------------------------------------------------------------
${hostelRaw
  .split('\n')
  .filter((l) => l.includes('\t') || l.startsWith('Chief Warden') || l.startsWith('Dheeran') || l.startsWith('Amaravathi') || l.startsWith('Kaveri') || l.startsWith('Valluvar') || l.startsWith('Bhavani'))
  .map((l, idx) => `${idx + 1} | ` + l.split('\t').join(' | '))
  .join('\n')}

## 1.2 Hostel Accommodation Blocks, Facilities, Timings & Regulations

${hostelRaw}

## 1.3 Frequently Asked Questions & Answers — Hostels

Q: What are the hostel options and blocks available at KEC?
A: KEC provides separate residential hostel blocks for boys and girls. Major men's hostels include Dheeran, Valluvar, and Kaveri blocks. Major women's hostels include Amaravathi and Bhavani blocks.

Q: Who is the Chief Warden and how can they be contacted?
A: Dr. R. Parameshwaran serves as the Chief Warden (Contact: 9842722655, email: principal@kongu.ac.in).

Q: Who is the Deputy Warden for Amaravathi hostel?
A: Ms. D. Ramya is the Deputy Warden for Amaravathi hostel (Mobile: 9789397940).

Q: What are the annual hostel fees at KEC?
A: Annual hostel fees generally range between ₹50,000 and ₹80,000 per academic year, covering room accommodation and boarding depending on room type and amenities.

====================================================================================================
SECTION 2: CAMPUS LEADERSHIP, ADMINISTRATION & DEPARTMENT HEADS (HODs)
====================================================================================================

## 2.1 Department Heads & Central Administration Directory

${hodRaw}

## 2.2 Frequently Asked Questions & Answers — Leadership & HODs

Q: Who is the Principal of Kongu Engineering College?
A: Dr. R. Parameshwaran is the Principal of Kongu Engineering College (Phone: 04294-226555, Email: principal@kongu.ac.in).

Q: Who is the Head of Department (HoD) for Information Technology (IT)?
A: Dr. S. Varadhaganapathy is the Senior Professor & Head of the Information Technology Department (Mobile: 9842721119, Email: varadhaganapathy@kongu.ac.in).

Q: Who is the Head of Department (HoD) for Electronics and Instrumentation Engineering (EIE)?
A: Dr. S. Vijayachitra is the Senior Professor & Head of the Electronics and Instrumentation Engineering Department (Mobile: 9842782245, Email: vijayachitra@kongu.ac.in).

Q: Who is the Head of Department (HoD) for Computer Science and Engineering (CSE)?
A: Dr. R. R. Rajalaxmi is the Professor & Head of the Computer Science and Engineering Department (Email: hod_cse@kongu.ac.in).

====================================================================================================
SECTION 3: VERIFIED TEACHING FACULTY DIRECTORY (BY DEPARTMENT)
====================================================================================================

${facultyRaw}

## 3.1 Frequently Asked Questions & Answers — Faculty Directory

Q: Who are the faculty members in the Information Technology (IT) department?
A: Verified faculty members in the IT department include:
1. Dr. S. Varadhaganapathy | Senior Professor & Head | M.E., Ph.D.
2. Dr. J. Premalatha | Senior Professor | M.Tech., Ph.D.
3. Dr. P. Natesan | Senior Professor | M.E., Ph.D.
4. Dr. R. Thangarajan | Senior Professor | M.E., Ph.D.
alongside all verified assistant and associate professors listed in the IT faculty table.

Q: Who are the faculty members in the Electronics and Instrumentation Engineering (EIE) department?
A: Verified faculty members in the EIE department include:
1. Dr. S. Vijayachitra | Senior Professor & Head | M.E., Ph.D.
2. Dr. S. J. Suji Prasad | Professor | M.E., Ph.D.
3. Dr. J. Indra | Professor | M.E., Ph.D.
4. Dr. M. Ponnambalam | Associate Professor | M.E., Ph.D.
alongside all verified assistant and associate professors listed in the EIE faculty table.

Q: How many total faculty members are listed across departments?
A: A total of 350 teaching staff members are cataloged in the department faculty summary.

====================================================================================================
SECTION 4: PLACEMENT & CAREER DEVELOPMENT (STATISTICS, SALARIES, COMPANIES & TRAINING)
====================================================================================================

## 4.1 Placement Overview & Official Figures (2024–2025 & 2025–2026)

${placementPart1Raw}

## 4.2 Comprehensive Placement Framework, Training Roadmaps & Recruiter Metrics

${extendedPlacementRaw}

## 4.3 Frequently Asked Questions & Answers — Placements & Salaries

Q: What are the latest placement statistics displayed on the official KEC homepage?
A: For the 2025–2026 placement period:
- Placement offers: 1,784 (ongoing drive secured 1,828+ offers)
- Average salary: ₹5.6 LPA
- Highest salary: ₹61.21 LPA
- Offers above ₹8 LPA: 172
- Companies visited: 355 (to 371+ companies)
- Placement status / success rate: 94.1% to 95%

Q: What are the exact placement salary details for Automobile Engineering in 2024–2025?
A: According to the KEC Mandatory Disclosure for 2024–2025:
- Students placed: 48
- Minimum salary: ₹1.8 LPA
- Maximum salary: ₹7.5 LPA
- Average salary: ₹3.6 LPA

Q: What are the exact placement salary details for Mechanical Engineering in 2024–2025?
A: According to the KEC Mandatory Disclosure for 2024–2025:
- Students placed: 80
- Minimum salary: ₹2.8 LPA
- Maximum salary: ₹8 LPA
- Average salary: ₹4.4 LPA

Q: What are the placement details for Computer Science and Information Technology in 2024–2025?
A: - Computer Science and Engineering (CSE): 174 students placed; Average salary: ₹5.2 LPA; Maximum salary: ₹24.5 LPA.
- Information Technology (IT): 86 students placed; Average salary: ₹5.6 LPA; Maximum salary: ₹21 LPA.

Q: What are the contact details for the KEC Placement Cell?
A: Central Placement Cell, Main Administrative Block:
- Phone: 04294-226564 / 04294-226644
- Fax: 04294-220087
- Email: placement@kongu.ac.in / placement@kongu.edu
- Industry-Institute Partnership Cell (IIPC) Coordinator: Dr. P. Selvakumar (+91 4294-226650, iipc@kongu.ac.in).

====================================================================================================
SECTION 5: DEPARTMENT OF PHYSICAL EDUCATION, SPORTS, FITNESS, GYM & SPORTS QUOTA
====================================================================================================

${sportsRaw}

## 5.1 Frequently Asked Questions & Answers — Sports & Facilities

Q: What sports facilities and grounds are available on the KEC campus?
A: KEC features extensive sports infrastructure spanning a 167-acre campus, including:
- A standard 400-metre outdoor running track and sports field.
- Indoor stadium for badminton, table tennis, and gymnasium workouts.
- Dedicated outdoor courts for basketball (concrete/floodlit), volleyball, ball badminton, and tennis.
- Football grounds, cricket fields with practice net pitches, and hockey facilities.

Q: Does KEC have a sports quota for engineering admissions?
A: Yes, KEC reserves seats under the sports quota during admissions for candidates demonstrating state, national, or inter-district sports achievements, with scholarships and fee waivers provided based on athletic merit.

====================================================================================================
SECTION 6: INSTITUTIONAL KNOWLEDGE BASE (17 STRUCTURED TOPICS & POLICIES)
====================================================================================================

${structuredKbRaw}

====================================================================================================
SECTION 7: TRANSPORT, COLLEGE BUS FLEET, ROUTES, TIMINGS, FARES & VEHICLE RULES
====================================================================================================

${transportRaw}

## 7.1 Frequently Asked Questions & Answers — Transport & Bus Services

Q: How many buses does KEC operate and how many routes are covered?
A: KEC operates a fleet of 78 college buses covering 26 distinct destination routes across 5 surrounding districts (Erode, Tiruppur, Namakkal, Salem, and Coimbatore regions).

Q: What are the college bus departure timings in the evening?
A: Regular college route buses assemble in the campus yard and depart every evening at 4:45 PM sharp. Extended buses depart at 5:30 PM and 6:45 PM for students attending late classes, labs, or sports training.

Q: Are there local shuttle buses between Perundurai Bus Stand and KEC?
A: Yes. College mini-buses and shuttles make frequent trips between the Perundurai Bus Stand and the campus:
- Morning slot: 7:40 AM to 8:20 AM
- Evening slot: 4:15 PM to 7:15 PM

Q: What are the bus fees and payment deadlines at KEC?
A: The average annual bus fee is approximately ₹20,000, depending on the distance from the boarding hub. Bus fees must be paid within 10 days of the course reopening date for the academic year. If paid late, a fine of ₹50 per working day is charged for up to 10 working days.

Q: What public buses drop passengers at the KEC Arch?
A: Public buses stopping directly at the KEC Arch include:
- From Erode: Route Nos. 18, 39, 39-A, and 20-B.
- From Kodumudi / Modakkurichi: Vellode route (Kongu Raja Bus Service and Route P-9).

Q: Who is the Transport In-charge at KEC and how can they be contacted?
A: Mr. K. Sakthivel is the Transport Maintenance Officer:
- Mobile: +91 98427 20087
- Email: transport@kongu.ac.in
- Office: Ground Floor, Central Administration Block, KEC Campus.

Q: What are the vehicle policies for two-wheelers and cars on campus?
A: - Day scholars and staff are permitted to ride two-wheelers, provided they wear mandatory safety helmets, possess a valid Driving License, and obtain a KEC vehicle sticker.
- Hostel students are strictly banned from keeping or riding powered two-wheelers on campus.
- Students are not permitted to bring four-wheelers (cars) on campus.
- The maximum speed limit inside the campus is strictly capped at 20 km/h.

====================================================================================================
SECTION 8: ACADEMIC PROGRAMMES, AUTONOMOUS REGULATIONS, ADMISSIONS, SCHOLARSHIPS & COLLEGE WORKING HOURS
====================================================================================================

${extendedAcademicsRaw}

## 8.1 Frequently Asked Questions & Answers — Academics, Admissions, Timings & Scholarships

Q: What are the general college working hours and class timings?
A: - Class Hours: Standard daily classes generally run between 8:45 AM / 9:00 AM and 4:15 PM / 4:30 PM, split into morning and afternoon sessions with built-in breaks.
- General Administrative Office Hours: 9:00 AM to 5:00 PM, Monday through Saturday.
- Central Library Hours: 8:00 AM to 8:00 PM on standard working days, and 9:00 AM to 5:00 PM on holidays.

Q: What are the admission codes and entry quotas for KEC?
A: Seats are systematically allocated between Government Counseling (65%) and Management Quota (35%):
- B.E. / B.Tech: TNEA Counseling (Code: 2711) based on 12th Cut-Off.
- MBA: TANCET Counseling (Code: 233).
- MCA: TANCET Counseling (Code: 512).
- Management Quota: Direct institutional admission based on Merit/HSC aggregate marks.

Q: What are the college fees for Government and Management Quotas?
A: - Government Quota (Via TNEA): Approximately ₹50,000 to ₹55,000 per year (~₹2,20,000 total for 4 years).
- Management Quota: Approximately ₹1,00,000 to ₹2,00,000 per year depending on the branch.
- PG Programmes: MBA totals ~₹2,00,000 (2 years), MCA totals ~₹1,00,000 in tuition costs.
- Hostel Charges: An additional ₹50,000 to ₹80,000 annually.

Q: What scholarships and fee concessions are available at KEC?
A: KEC provides several tuition support waivers:
1. 7.5% Government School Quota: 100% complete tuition, hostel, and mess fee waiver for eligible Tamil Nadu Government School students.
2. First-Generation Graduate Concession: A deduction of ₹25,000 per year for students who are the first in their family to graduate.
3. Institutional Merit Scholarship: 50% tuition fee waiver for the top 5% of academic rank holders within the semester.

Q: How can someone contact the Admissions Office?
A: Admission Office Helpline: 04294-226515 / 04294-226517 (Mobile: 9965277765, 9443020583, Email: principal@kongu.ac.in).
`;

fs.writeFileSync(targetFile, organizedDocument, 'utf-8');

console.log(`Successfully generated: ${targetFile}`);
console.log(`Generated file size: ${fs.statSync(targetFile).size} bytes`);
