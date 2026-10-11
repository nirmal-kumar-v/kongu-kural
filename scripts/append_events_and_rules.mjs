import fs from 'fs';
import path from 'path';

const collegeInfo2Path = path.resolve('college-info-2.txt');
const extractedDataPath = path.resolve('scripts/extracted_pasted_data.txt');

if (!fs.existsSync(collegeInfo2Path)) {
  console.error('college-info-2.txt not found!');
  process.exit(1);
}

if (!fs.existsSync(extractedDataPath)) {
  console.error('extracted_pasted_data.txt not found!');
  process.exit(1);
}

const originalInfo2 = fs.readFileSync(collegeInfo2Path, 'utf8');

// Check if section 8.11 already exists in college-info-2.txt
if (originalInfo2.includes('## 8.11')) {
  console.log('Section 8.11 already exists in college-info-2.txt. Skipping duplicate append.');
  process.exit(0);
}

const newSectionsContent = `
## 8.11 Special Events, Cultural Fests & Institutional Holidays 2026–2027

This section provides the official, verified chronological record and bidirectional lookup index of all special events, cultural fests, institutional holidays, sports meets, reopening dates, and milestones from the Kongu Engineering College Academic Calendar 2026–27 (Odd and Even Semesters).

---

### Chronological Calendar of Special Events & Holidays (2026–2027)

#### ODD SEMESTER (2026–27)

| Date | Event / Holiday / Milestone | Category / Type | Details / Cohort Affected |
| :--- | :--- | :--- | :--- |
| **01 June 2026** | **Reopening of College** | Academic Reopening | Reopen for BE/BTech (7th Sem), BSc (5th Sem), MSc (9th, 7th, 5th Sem) |
| **03 August 2026** | **Krishna Jayanthi** | Institutional Holiday | Holiday for all students and staff |
| **15 August 2026** | **Independence Day** | National Holiday | Holiday for all students and staff |
| **26 August 2026** | **Vinayakar Chathurthi** | Institutional Holiday | Holiday for all students and staff |
| **04 September 2026** | **Dheeran Chinnamalai Memorial Day** | State / Institutional Holiday | Holiday for all students and staff |
| **07 September 2026** | **Commencement of Classes** | Academic Milestone | Commencement of classes for BE/BTech (1st Sem, Regulation 2026) |
| **14 September 2026** | **Inauguration Day** | Institutional Ceremony | Inauguration for BE/BTech (1st Sem), ME/MTech (1st Sem), MBA (1st Sem), MCA (1st Sem), BArch (1st Sem) |
| **16 September 2026** | **Milad-un-Nabi** | Institutional Holiday | Holiday for all students and staff |
| **18 September 2026** | **Techno Cultural Fest / Founders' Day** | Special Cultural & Institutional Event | Premier institutional festival celebrating KEC Founders' Day and Techno Cultural Fest |
| **19 September 2026** | **Kongu Trophy** | Inter-Collegiate State Sports Tournament | Premier annual state-level inter-collegiate sports tournament hosted by KEC |
| **02 October 2026** | **Gandhi Jayanthi** | National Holiday | Holiday for all students and staff |
| **19 October 2026** | **Ayutha Pooja** | Festive Holiday | Holiday for all students and staff |
| **20 October 2026** | **Vijaya Dasami** | Festive Holiday | Holiday for all students and staff |
| **21 October 2026** | **Muharram** | Institutional Holiday | Holiday for all students and staff |
| **08 & 09 November 2026** | **Deepavali** | Festive Holidays | Holidays for all students and staff (2 consecutive days) |
| **25 December 2026** | **Christmas** | Festive Holiday | Holiday for all students and staff |

#### EVEN SEMESTER (2026–27)

| Date | Event / Holiday / Milestone | Category / Type | Details / Cohort Affected |
| :--- | :--- | :--- | :--- |
| **01 January 2027** | **New Year** | New Year Holiday | Holiday for all students and staff |
| **08–10 January 2027** | **Pongal Celebrations & Pongal** | Cultural Festival & Holidays | Traditional Pongal celebrations on campus followed by Pongal state holidays |
| **16 January 2027** | **Thiruvalluvar Day** | State Holiday | Holiday for all students and staff |
| **17 January 2027** | **Uzhavar Thirunal** | State Holiday | Holiday for all students and staff |
| **22 January 2027** | **Thaipoosam** | Festive Holiday | Holiday for all students and staff |
| **26 January 2027** | **Republic Day** | National Holiday | Holiday for all students and staff |
| **05 March 2027** | **Enthusia** | Annual Inter-Collegiate Cultural Festival | Grand annual cultural fest of Kongu Engineering College featuring music, arts, and competitive dance events |
| **12 March 2027** | **Swaram** | Annual Musical & Performing Arts Fest | Grand musical cultural fest showcasing student bands, vocal competitions, and celebrity musical performances |
| **19 March 2027** | **Sports Day, Annual Day & Farewell Day** | Triple Milestone Institutional Event | Mega institutional celebration comprising KEC Annual Sports Meet, College Annual Day celebrations, and Final-Year Farewell Day |
| **31 March 2027** | **Telugu New Year** | State / Festive Holiday | Holiday for all students and staff |
| **05 April 2027** | **Ramzan (Eid-ul-Fitr)** | Festive Holiday | Holiday for all students and staff |
| **14 April 2027** | **Tamil New Year & Dr. Ambedkar's Birthday** | State & National Holiday | Holiday for all students and staff |
| **21 April 2027** | **Mahavir Jayanthi** | Festive Holiday | Holiday for all students and staff |
| **30 April 2027** | **Good Friday** | Festive Holiday | Holiday for all students and staff |
| **01 May 2027** | **May Day** | International Workers' Day | Holiday for all students and staff |

---

### Bidirectional Lookup Directory

#### Case A: Event Name to Date Directory (When is [Event Name]?)

- **Enthusia (KEC Cultural Fest):**
  - **Date:** **05 March 2027** (Friday, 5th March 2027)
  - **Description:** Enthusia is the premier inter-collegiate annual cultural fest celebrated at Kongu Engineering College.
  - **Tamil:** என்Rank/என்சியூசியா கலாச்சார விழா 2027 மார்ச் 5 அன்று நடைபெறும்.

- **Swaram (Musical Fest):**
  - **Date:** **12 March 2027** (Friday, 12th March 2027)
  - **Description:** Swaram is the grand annual musical and arts fest organized at Kongu Engineering College.
  - **Tamil:** சுவரம் (Swaram) இசை நிகழ்ச்சி 2027 மார்ச் 12 அன்று நடைபெறும்.

- **Sports Day:**
  - **Date:** **19 March 2027** (Friday, 19th March 2027)
  - **Description:** Annual College Sports Day, held jointly with Annual Day and Farewell Day on March 19, 2027.
  - **Tamil:** கல்லூரி விளையாட்டு தினம் (Sports Day) 2027 மார்ச் 19 அன்று கொண்டாடப்படும்.

- **Annual Day:**
  - **Date:** **19 March 2027** (Friday, 19th March 2027)
  - **Description:** College Annual Day celebrations, held jointly with Sports Day and Farewell Day on March 19, 2027.
  - **Tamil:** கல்லூரி ஆண்டு விழா (Annual Day) 2027 மார்ச் 19 அன்று நடைபெறும்.

- **Farewell Day:**
  - **Date:** **19 March 2027** (Friday, 19th March 2027)
  - **Description:** Final year student farewell ceremony, held jointly on March 19, 2027.
  - **Tamil:** பிரியாவிடை விழா (Farewell Day) 2027 மார்ச் 19 அன்று நடைபெறும்.

- **Techno Cultural Fest / Founders' Day:**
  - **Date:** **18 September 2026** (Friday, 18th September 2026)
  - **Description:** Techno Cultural Fest celebrated jointly with Founders' Day commemorating the foundation of Kongu Engineering College.
  - **Tamil:** டெக்னோ கலாச்சார விழா மற்றும் நிறுவனர்கள் தினம் (Techno Cultural Fest / Founders' Day) 2026 செப்டம்பர் 18 அன்று கொண்டாடப்படும்.

- **Kongu Trophy:**
  - **Date:** **19 September 2026** (Saturday, 19th September 2026)
  - **Description:** State-level Inter-Collegiate Tournament in basketball, badminton, volleyball, football, etc.
  - **Tamil:** கொங்கு டிராபி (Kongu Trophy) மாநில அளவிலான விளையாட்டுப் போட்டி 2026 செப்டம்பர் 19 அன்று நடைபெறும்.

- **Inauguration for First-Year Students:**
  - **Date:** **14 September 2026** (Monday, 14th September 2026)
  - **Description:** Formal college inauguration for BE/BTech (1st Sem), ME/MTech, MBA, MCA, and BArch (1st Sem).
  - **Tamil:** முதலாம் ஆண்டு மாணவர்களுக்கான தொடக்க விழா 2026 செப்டம்பர் 14 அன்று நடைபெறும்.

- **Commencement of Classes (BE/BTech 1st Semester):**
  - **Date:** **07 September 2026** (Monday, 7th September 2026)
  - **Description:** First day of instruction for BE/BTech Semester 1 students.

- **College Reopening (Senior Batches — Odd Semester):**
  - **Date:** **01 June 2026** (Monday, 1st June 2026)
  - **Description:** Reopening for BE/BTech (7th Sem), BSc (5th Sem), and MSc (9th, 7th, 5th Sem).

- **Pongal Celebrations & Pongal Holidays:**
  - **Date:** **08–10 January 2027** (8th to 10th January 2027)
  - **Description:** Campus Pongal Celebrations and institutional holidays.

- **Krishna Jayanthi:** **03 August 2026** (Holiday)
- **Independence Day:** **15 August 2026** (National Holiday)
- **Vinayakar Chathurthi:** **26 August 2026** (Holiday)
- **Dheeran Chinnamalai Memorial Day:** **04 September 2026** (Holiday)
- **Milad-un-Nabi:** **16 September 2026** (Holiday)
- **Gandhi Jayanthi:** **02 October 2026** (National Holiday)
- **Ayutha Pooja:** **19 October 2026** (Holiday)
- **Vijaya Dasami:** **20 October 2026** (Holiday)
- **Muharram:** **21 October 2026** (Holiday)
- **Deepavali:** **08 & 09 November 2026** (Holidays — 2 days)
- **Christmas:** **25 December 2026** (Holiday)
- **New Year:** **01 January 2027** (Holiday)
- **Thiruvalluvar Day:** **16 January 2027** (State Holiday)
- **Uzhavar Thirunal:** **17 January 2027** (State Holiday)
- **Thaipoosam:** **22 January 2027** (Holiday)
- **Republic Day:** **26 January 2027** (National Holiday)
- **Telugu New Year:** **31 March 2027** (Holiday)
- **Ramzan (Eid-ul-Fitr):** **05 April 2027** (Holiday)
- **Tamil New Year & Dr. Ambedkar's Birthday:** **14 April 2027** (Holiday)
- **Mahavir Jayanthi:** **21 April 2027** (Holiday)
- **Good Friday:** **30 April 2027** (Holiday)
- **May Day:** **01 May 2027** (Holiday)

---

#### Case B: Date to Event Directory (What is on [Date]?)

- **01 June 2026:** College Reopening for senior batches: BE/BTech (7th Sem), BSc (5th Sem), MSc (9th, 7th, 5th Sem).
- **03 August 2026:** Krishna Jayanthi (Holiday).
- **15 August 2026:** Independence Day (National Holiday).
- **26 August 2026:** Vinayakar Chathurthi (Holiday).
- **04 September 2026:** Dheeran Chinnamalai Memorial Day (Holiday).
- **07 September 2026:** Commencement of classes for first-year BE/BTech (1st Sem, R26).
- **14 September 2026:** Inauguration Day for first-year students: BE/BTech (1st Sem), ME/MTech, MBA, MCA, BArch (1st Sem).
- **16 September 2026:** Milad-un-Nabi (Holiday).
- **18 September 2026:** Techno Cultural Fest / Founders' Day (Special institutional and cultural event).
- **19 September 2026:** Kongu Trophy (State-level inter-collegiate tournament).
- **02 October 2026:** Gandhi Jayanthi (National Holiday).
- **19 October 2026:** Ayutha Pooja (Holiday).
- **20 October 2026:** Vijaya Dasami (Holiday).
- **21 October 2026:** Muharram (Holiday).
- **08 November 2026 & 09 November 2026:** Deepavali (Holidays — 2 days).
- **25 December 2026:** Christmas (Holiday).
- **01 January 2027:** New Year (Holiday).
- **08–10 January 2027:** Pongal Celebrations & Pongal (Campus festivities followed by holidays).
- **16 January 2027:** Thiruvalluvar Day (Holiday).
- **17 January 2027:** Uzhavar Thirunal (Holiday).
- **22 January 2027:** Thaipoosam (Holiday).
- **26 January 2027:** Republic Day (National Holiday).
- **05 March 2027:** Enthusia (KEC Annual Inter-Collegiate Cultural Festival).
- **12 March 2027:** Swaram (KEC Annual Musical & Performing Arts Fest).
- **19 March 2027:** **Sports Day, Annual Day, and Farewell Day** (All three major celebrations occur on this date).
- **31 March 2027:** Telugu New Year / Holiday.
- **05 April 2027:** Ramzan / Eid-ul-Fitr (Holiday).
- **14 April 2027:** Tamil New Year & Dr. Ambedkar's Birthday (Holiday).
- **21 April 2027:** Mahavir Jayanthi (Holiday).
- **30 April 2027:** Good Friday (Holiday).
- **01 May 2027:** May Day / International Workers' Day (Holiday).

---

### Special Events Q&A Reference (English & Tamil)

Q: When is Enthusia in KEC?
A: Enthusia (KEC Annual Inter-Collegiate Cultural Fest) is scheduled on **05 March 2027**.

Q: When is Swaram?
A: Swaram (Annual Musical & Arts Fest) is scheduled on **12 March 2027**.

Q: When is Kongu Trophy conducted?
A: Kongu Trophy is scheduled on **19 September 2026**.

Q: When is Techno Cultural Fest / Founders' Day?
A: Techno Cultural Fest / Founders' Day is scheduled on **18 September 2026**.

Q: What event is scheduled on 19 March 2027?
A: On **19 March 2027**, three major events are conducted: **Sports Day, Annual Day, and Farewell Day**.

Q: What event is scheduled on 18 September 2026?
A: On **18 September 2026**, KEC conducts the **Techno Cultural Fest / Founders' Day**.

Q: What event is scheduled on 05 March 2027?
A: On **05 March 2027**, KEC celebrates **Enthusia**, the annual inter-collegiate cultural fest.

Q: What event is scheduled on 12 March 2027?
A: On **12 March 2027**, KEC conducts **Swaram**, the grand annual musical festival.

Q: என்சியூசியா (Enthusia) எப்போது நடைபெறும்?
A: என்சியூசியா (Enthusia) கலாச்சார விழா **2027 மார்ச் 5** அன்று கொங்கு பொறியியல் கல்லூரியில் நடைபெறும்.

Q: சுவரம் (Swaram) நிகழ்ச்சி எந்த தேதியில் நடைபெறும்?
A: சுவரம் (Swaram) இசை நிகழ்ச்சி **2027 மார்ச் 12** அன்று நடைபெறும்.

Q: 2027 மார்ச் 19 அன்று என்ன நிகழ்ச்சிகள் நடைபெறுகின்றன?
A: 2027 மார்ச் 19 அன்று **விளையாட்டு தினம் (Sports Day), கல்லூரி ஆண்டு விழா (Annual Day) மற்றும் பிரியாவிடை விழா (Farewell Day)** ஆகிய மூன்று முக்கிய நிகழ்வுகளும் நடைபெறுகின்றன.

Q: கொங்கு டிராபி (Kongu Trophy) எப்போது நடைபெறும்?
A: கொங்கு டிராபி (Kongu Trophy) மாநில அளவிலான விளையாட்டு போட்டி **2026 செப்டம்பர் 19** அன்று நடைபெறும்.

---

## 8.12 Placement Statistics & Recruiter Offers (2025–2026 Batch)

This section contains the complete, verified placement records, overall recruitment statistics, and exhaustive recruiter-wise offer breakdown for the 2025–2026 academic batch at Kongu Engineering College.

### Placement Overview (2025–2026 Batch)
- **Total Offers Secured:** **1,828 Offers**
- **Students Placed:** **1,529 Students**
- **Total Companies Visited:** **409 Companies**

### Company-Wise Placement Offers Breakdown (2025–2026 Batch)

| S.No | Company Name | No. of Offers |
| :--- | :--- | :--- |
| 1 | Soliton Technologies | 9 |
| 2 | Rubrik | 2 |
| 3 | JPMorgan Chase | 1 |
| 4 | Deloitte India | 5 |
| 5 | Mr Cooper | 2 |
| 6 | Trimble | 12 |
| 7 | Zoho | 11 |
| 8 | Virtusa | 2 |
| 9 | Genworx.AI | 3 |
| 10 | JGC | 8 |
| 11 | Rently | 2 |
| 12 | VA Tech Wabag | 25 |
| 13 | Tosibha | 1 |
| 14 | SPIC | 9 |
| 15 | Brakes India | 4 |
| 16 | Delta Electronics | 25 |
| 17 | Cognizant | 126 |
| 18 | Nbase2 | 3 |
| 19 | Infosys | 1 |
| 20 | JSW | 5 |
| 21 | Valeo India Pvt Ltd | 30 |
| 22 | Schneider Electric | 7 |
| 23 | Bhawan CyberTex | 9 |
| 24 | Rane | 8 |
| 25 | Workhall | 1 |
| 26 | Ignitarium | 7 |
| 27 | Codemagen | 14 |
| 28 | Presidio | 3 |
| 29 | Iam Neo | 1 |
| 30 | Yuvi Labs Technologies | 2 |
| 31 | CDW (Sirius) | 2 |
| 32 | Bi3 Technologies | 3 |
| 33 | Rapiddata Technologies | 11 |
| 34 | ZENThink | 4 |
| 35 | Pearson India Education Services | 1 |
| 36 | Winfomi | 5 |
| 37 | Griffyn Robotech - Pune | 1 |
| 38 | DataSpark AI Solutions Pvt Ltd | 1 |
| 39 | Crescent Moon Solutions | 2 |
| 40 | Leumasware | 4 |
| 41 | Openmynz | 3 |
| 42 | Tessolve Semiconductors | 2 |
| 43 | Likan Cleancell Innovations Pvt Ltd | 4 |
| 44 | Pentafox Technologies | 5 |
| 45 | SecurIn | 1 |
| 46 | Josh Technologies | 2 |
| 47 | Cube AI Solutions Tech Pvt Ltd | 5 |
| 48 | Thiran360AI | 1 |
| 49 | Twincord Technologies Private Limited | 6 |
| 50 | Lights Inc | 3 |
| 51 | Survey Sparrow | 3 |
| 52 | JMAN Group | 5 |
| 53 | AppSentinels | 2 |
| 54 | Infinox Info-Stark Services Pvt Ltd | 1 |
| 55 | Thirvusoft Private Limited | 4 |
| 56 | Logbase Technologies | 4 |
| 57 | Digital Yugam | 5 |
| 58 | Nutz Technovation Private Limited | 2 |
| 59 | Cartrabbit Technologies | 3 |
| 60 | Reading Chocolate (Sago factory) | 2 |
| 61 | Data Corp - Ed | 2 |
| 62 | Adwik Intellimech - Mds | 3 |
| 63 | Mistral Solutions | 6 |
| 64 | Calibraint Technologies | 8 |
| 65 | Dextris Engineer R&D division | 1 |
| 66 | WhiterApps | 2 |
| 67 | Icanio technologies | 2 |
| 68 | eG Innovations | 1 |
| 69 | Logicgo infotech | 1 |
| 70 | Adrasti Technologies Private Limited | 10 |
| 71 | ERP Roots | 2 |
| 72 | Brahmarsive | 3 |
| 73 | J&F India Pvt Ltd | 6 |
| 74 | Radiant Global Technology | 6 |
| 75 | HiTech Calibration | 4 |
| 76 | Endava Solution | 13 |
| 77 | SRC Projects | 5 |
| 78 | Mavenly | 1 |
| 79 | CIEL Skills and Careers Pvt Ltd | 1 |
| 80 | Green Collar Agritech Solutions Pvt Ltd | 1 |
| 81 | Mallow Technologies | 8 |
| 82 | CoreEL Technologies | 4 |
| 83 | Platform Science | 4 |
| 84 | Kurium.IO | 1 |
| 85 | Data Spark Solutions Inc | 1 |
| 86 | Conserve Solutions | 3 |
| 87 | Careyu Automation | 1 |
| 88 | Robovision pvt ltd | 1 |
| 89 | HFFC | 4 |
| 90 | System-controls | 2 |
| 91 | Muthoot Fincorp | 5 |
| 92 | Addis IT Solutions | 1 |
| 93 | Caliber InterConnect | 4 |
| 94 | Xoriant | 7 |
| 95 | Veritas Finance | 1 |
| 96 | Yellowmatics | 1 |
| 97 | Punchbiz | 1 |
| 98 | Integra Connect | 1 |
| 99 | Kasadara Technology | 6 |
| 100 | Bright Beam Solutions | 2 |
| 101 | SmartDV | 8 |
| 102 | DCW | 1 |
| 103 | ITC Food Division | 2 |
| 104 | RabbitQR | 1 |
| 105 | Avasoft | 2 |
| 106 | Tap Academy | 22 |
| 107 | GecaTech | 4 |
| 108 | CRP robots | 8 |
| 109 | Lancer International | 1 |
| 110 | BigBoon Technologies | 10 |
| 111 | Netgear | 3 |
| 112 | Infomin Solutions | 1 |
| 113 | Synapse Robotics | 1 |
| 114 | Imagitive Technology Pvt Ltd | 2 |
| 115 | Vintorix (Webberax Solutions) | 3 |
| 116 | MithilAI | 5 |
| 117 | Growwpark | 1 |
| 118 | Atelier | 1 |
| 119 | Acmegrade | 1 |
| 120 | Harmony Environmental Systems Pvt Ltd | 1 |
| 121 | Data Pattern | 2 |
| 122 | Motherson-SMRC | 8 |
| 123 | Pothigai Power Solutions | 4 |
| 124 | Cognizant - BSc | 1 |
| 125 | Ramalingan Construction | 6 |
| 126 | Promantus Inc | 1 |
| 127 | SLB | 8 |
| 128 | Real Tech System | 1 |
| 129 | Accenture - AASE (6.5 LPA) | 72 |
| 130 | Accenture - ASE (4.5 LPA) | 34 |
| 131 | Vaap Energy Private Limited | 1 |
| 132 | Sid's Farm | 1 |
| 133 | Workline Pvt Ltd | 4 |
| 134 | NIMIR construction | 1 |
| 135 | Srinsoft | 4 |
| 136 | Other Core and Software Companies | 940 |

### Placement Frequently Asked Questions (2025–2026 Batch)

Q: What is the total number of placement offers for the 2025–2026 batch at KEC?
A: For the 2025–2026 batch, students secured **1,828 total offers**, with **1,529 students placed** across **409 companies**.

Q: How many offers were given by Cognizant for the 2025-2026 batch?
A: Cognizant provided **126 offers** (plus 1 offer under Cognizant - BSc).

Q: How many offers did Accenture give for the 2025-2026 batch?
A: Accenture provided **106 total offers**:
- Accenture - AASE (6.5 LPA): **72 offers**
- Accenture - ASE (4.5 LPA): **34 offers**

Q: How many offers did Soliton Technologies give?
A: Soliton Technologies offered **9 offers**.

Q: Did Rubrik recruit from KEC?
A: Yes, Rubrik recruited **2 students** from KEC for the 2025–2026 batch.

Q: How many offers did JPMorgan Chase provide?
A: JPMorgan Chase provided **1 offer**.

Q: How many offers did Deloitte India provide?
A: Deloitte India provided **5 offers**.

Q: How many offers did Zoho provide?
A: Zoho provided **11 offers**.

Q: How many offers did VA Tech Wabag provide?
A: VA Tech Wabag provided **25 offers**.

Q: How many offers did Delta Electronics provide?
A: Delta Electronics provided **25 offers**.

Q: How many offers did Valeo India provide?
A: Valeo India Pvt Ltd provided **30 offers**.

---

## 8.13 General Examination Instructions & Hall Conduct Rules (Office of the COE)

Important rules and regulations to be strictly followed by all candidates during the conduct of continuous assessment (CAT) and end semester examinations (ESE) under the Autonomous system of Kongu Engineering College.

### The 19 Mandatory Examination Instructions

1. **Identity Card Requirement:**
   - A candidate entering the examination hall must possess an identity card issued by the Principal; else he/she will be denied admission to write the examination.
   - Wearing the official identity card is compulsory throughout the examination duration.

2. **Seating & Hall Superintendent Instructions:**
   - Candidates have to occupy their allotted seats **10 minutes before the commencement of examination** and maintain discipline and silence inside the examination hall.
   - They have to give due attention to the instructions given by the Hall Superintendent before commencement and also during the examination.

3. **Entry & Exit Time Limits:**
   - **Late Entry Limit:** No candidate will be permitted to enter the examination hall **after 30 minutes** from the commencement of the examination.
   - **Early Exit Limit:** No candidate will be permitted to leave the examination hall **before 45 minutes** from the commencement of the examination.
   - **Re-Entry Prohibition:** A candidate who leaves the examination hall will **not be permitted to re-enter** the hall under any account.

4. **Personal Stationery & Borrowing Prohibition:**
   - Candidates are expected to bring their own pens, pencils, eraser, geometrical instruments, calculators, etc.
   - Borrowing instruments or stationery from other candidates is strictly forbidden.

5. **Permitted Writing Instruments & Ink Colours:**
   - Candidates should use **only blue or black ink or ball pen** while answering their papers.
   - Only for drawing diagrams or charts, colour pens or sketch pens are allowed.

6. **Mathematical & Statistical Tables / Handbooks:**
   - Mathematical tables, Statistical tables, and other common handbooks will be supplied to candidates on request and must be returned immediately after use without any scribbling.
   - Candidates will be allowed to use their own handbooks, tables, or charts which are uncommon and specifically required to answer a particular paper only after obtaining prior permission from the Chief/Hall Superintendent.

7. **Permitted Calculators:**
   - Candidates are permitted to use **only non-programmable calculators**. Programmable calculators are strictly prohibited.

8. **Prohibited Communication Devices & Material Bits:**
   - Candidates are **prohibited from possessing cell phones, pagers, and any communication instruments** inside the examination hall.
   - Carrying bits of paper containing textual material, printed or written, is strictly prohibited.

9. **Verification of Question Paper:**
   - Candidates must verify and satisfy themselves that they have received the correct question paper before they start answering questions.
   - Any question paper that is not relevant to their registration must be returned to the Hall Superintendent at once.

10. **Prescribed Examination Time:**
    - Candidates are not allowed to write beyond the time prescribed for the examinations.

11. **Rough Work Location:**
    - Rough work, if any, must be done by the candidate in the **answer book itself** (on designated rough work margins/pages).
    - No separate answer book or loose sheet for rough work will be supplied.
    - Rough work carried out by a candidate becomes part and parcel of the answer paper.

12. **Clarifications & Questions from Hall Superintendent:**
    - Candidates are **forbidden from asking questions or clarifications of any kind** from the Hall Superintendent during the examination.

13. **Integrity of Answer Booklet:**
    - Candidates should not detach any sheet from the main answer book or smuggle out additional sheets or the main book.
    - Violation of this rule attracts severe disciplinary punishment.

14. **Handing Over Answer Booklet:**
    - Candidates should hand over the answer books personally to the Hall Superintendent before leaving the examination hall.

15. **Register Number Placement & Mark Influencing Appeal Prohibition:**
    - Candidates should not write their Register Number anywhere else except in the specified space on the first page of the Answer Book.
    - Writing candidate names, making appeals to the examiner, writing internal assessment marks, or making identifiable special markings will be treated as an attempt to influence the examiner and constitutes malpractice.

16. **Disciplinary Proceedings for Malpractice:**
    - Students indulging in malpractice while writing examinations will be immediately referred to the Chief Superintendent for disciplinary proceedings.
    - Proven cases are handed over to the Examination Disciplinary Committee for imposition of punishments.

17. **Delivery of External Communication:**
    - Any letter, telegram, or phone call to a candidate will not be delivered or communicated to the candidate until he/she completes the examination.

18. **Scribes for Temporary Illness / Differently Abled Candidates:**
    - Candidates who are not in a position to write the examination themselves due to temporary illness or blind candidates may be provided a **scribe** after obtaining prior permission from the Principal or Controller of Examinations.
    - A special fee prescribed for this purpose will be collected for each course.

19. **Impersonation Handover to Police Authorities:**
    - In case of impersonation, the accused person will be **handed over to police authorities** for criminal investigation and legal action.

### Official Warning on Malpractice
Any attempt to violate examination rules or engage in malpractice will lead to immediate disciplinary proceedings. This may include disqualification from the current exam, suspension, or other severe punishments as per institutional norms.

---

## 8.14 Controller of Examinations (COE) Office, Malpractice Offences & Penalties Matrix (30 Clauses)

### Office Overview
- **Institution:** Kongu Engineering College (Autonomous, Affiliated to Anna University, Accredited by NAAC with A++ Grade)
- **Office:** Office of the Controller of Examinations (COE)
- **Email Contact:** coe@kongu.ac.in
- **Phone Numbers:** 04294 - 226645, 04294 - 226625
- **Postal Address:** Kongu Engineering College, Perundurai, Erode - 638 060, Tamil Nadu, India.
- **TNEA Counselling Code:** **2711**

### General Conduct & Permitted Items
1. **Permitted Items:** Geometric tools, non-programmable calculators, approved tables, and data books only during theory and practical examinations. No other material or gadget (including cell phones) should be brought inside the examination hall.
2. **Conduct & Restrictions:**
   - Candidates must not possess or refer to forbidden materials, nor seek/obtain assistance from any person/source.
   - Candidates must not assist others, reveal identity in answer scripts, or indulge in direct/indirect canvassing for marks.
   - Candidates must maintain strict discipline and decorum.

---

### Official Malpractice Offences & Penalties Matrix (All 30 Clauses)

The following table contains the complete 30-clause penalty framework enforced by the Examination Disciplinary Committee:

| Clause No. | Nature of Malpractice Offence | Prescribed Punishment Details |
| :---: | :--- | :--- |
| **1** | Appeal by the candidate in the answer script to show mercy by way of awarding more than deserving marks. | **Fine of Rs. 1000/- per course.** (Immediate Enforcement) |
| **2** | The candidate writes his/her name in the answer script. | **Fine of Rs. 1000/- per course.** (Immediate Enforcement) |
| **3** | The candidate writes his/her registration number or college name in places other than specified. | **Fine of Rs. 1000/- per course.** (Immediate Enforcement) |
| **4** | Any special marking is found in the answer script by the candidate. | **Fine of Rs. 1000/- per course.** (Immediate Enforcement) |
| **5** | The candidate communicates orally/non-verbally or causes suspicious body movements. | **Fine of Rs. 1000/- per course.** (Immediate Enforcement) |
| **6** | Irrelevant writing by the candidate is found in the answer script. | **Fine of Rs. 1000/- per course.** (Immediate Enforcement) |
| **7** | The candidate writes answers on the question paper or uses it for rough work. | **Fine of Rs. 1000/- per course.** (Immediate Enforcement) |
| **8** | Possessing or passing another candidate's question paper (with no additional writing). | **Fine of Rs. 1000/- per course.** (Immediate Enforcement) |
| **9** | Possessing cell phones, programmable calculators, or other electronic storage devices/gadgets. | **Invalidating the examination of the particular course.** (Immediate Enforcement) |
| **10** | Facilitating another candidate to copy from one's answer script. | **Invalidating the examination of the particular course.** (Immediate Enforcement) |
| **11** | Possessing incriminating materials (used or not: written/printed bits, scale, handkerchief, dress, body parts, hall ticket, etc.). | **Invalidating examinations of the course concerned and all theory/practical courses of the current semester registered. No revaluation considered.** (Immediate Enforcement) |
| **12** | Possessing electronic gadgets/cell phones containing incriminating materials. | **Invalidating examinations of the course concerned and all current semester theory/practical courses. No revaluation for arrear courses.** (Immediate Enforcement) |
| **13** | Possessing another candidate's question paper with additional writing on it. | **Invalidating examinations of the course concerned and all current semester courses.** (Immediate Enforcement) |
| **14** | Passing own question paper with additional writing to another candidate. | **Invalidating examinations of the course concerned and all current semester courses.** (Immediate Enforcement) |
| **15** | Passing incriminating materials in any medium (hard/soft) to other candidates. | **Invalidating examinations of the course concerned and all current semester courses.** (Immediate Enforcement) |
| **16** | Copying from a neighboring candidate. | **Invalidating examinations of the course concerned and all current semester courses.** (Immediate Enforcement) |
| **17** | Taking out used or unused answer booklets from the exam hall. | **Invalidating examinations of the course concerned and all current semester courses.** (Immediate Enforcement) |
| **18** | Appeal in the answer script coupled with a promise of consideration. | **Invalidating examinations of the course concerned and all current semester courses.** (Immediate Enforcement) |
| **19** | Destroying evidence relating to an alleged irregularity. | **Invalidating current semester courses. Additional: Debarred for 1 year (2 semesters) if not completed; prevented from arrear exams for 2 semesters if completed.** |
| **20** | Substituting an answer booklet prepared outside the exam hall. | **Invalidating all current and arrear courses. Additional: Debarred for 1 year (2 semesters).** |
| **21** | Disruptive conduct (shouting, assault, abusive language, destruction of property). | **Invalidating all current and arrear courses. Additional: Debarred for 2 years (4 semesters).** |
| **22** | Harassing or engaging others to harass an invigilator or official. | **Invalidating all current and arrear courses. Additional: Debarred for 2 years (4 semesters).** |
| **23** | Possessing any firearm or weapon inside the examination hall. | **Invalidating all current and arrear courses. Additional: Debarred for 2 years (4 semesters).** |
| **24** | Vulgar or offensive writing found in the answer script. | **Invalidating all current and arrear courses.** (Immediate Enforcement) |
| **25** | Possessing another candidate's answer script. | **Invalidating all current and arrear courses.** (Immediate Enforcement) |
| **26** | Passing own answer script to another candidate. | **Invalidating all current and arrear courses.** (Immediate Enforcement) |
| **27** | Misbehaving in the examination hall. | **Invalidating all current and arrear courses. Additional: Debarred for 1 year.** |
| **28** | Involvement in malpractices (Serial No. 9 to 22) for the second or subsequent times. | **Invalidating all current and arrear courses. Additional: Debarred for 1 year.** |
| **29** | Cases of Impersonation. | **Handing over to police, permanent debarment of both impersonator and bonafide candidate, ineligible for future admission.** |
| **30** | Unclassified malpractices not covered in clauses 1 to 29. | **Suitable punishment awarded based on disciplinary committee report.** |

---

### Zero Tolerance Policy & Examination Disciplinary Committee
- Kongu Engineering College maintains a strict zero-tolerance policy towards academic dishonesty.
- The decisions of the Examination Disciplinary Committee are final and binding on all students.
- Any attempt to influence the committee or staff will result in severe additional penalties.

### COE Web Portal Links & Downloadable Forms
- **Official COE Portal Sections:**
  - Academic Schedule: https://coe.kongu.edu/#/academicSchedule
  - Circulars: https://coe.kongu.edu/#/circulars
  - Examination Rules: https://coe.kongu.edu/#/examrules
  - Instructions: https://coe.kongu.edu/#/examinstructions
  - Examination Results: https://coe.kongu.edu/#/results
  - Autonomous Rank Holders: https://coe.kongu.edu/#/rankholders
  - Certificate Status: https://coe.kongu.edu/#/certstatus
  - Online Services: https://coe.kongu.edu/#/services
- **Official Downloadable Applications Available at COE Office:**
  - Medical Leave Form
  - Exam Withdrawal Form
  - Break of Study Application
  - Duplicate Grade Sheet Application
  - CGPA Conversion Certificate Application
`;

// Append to college-info-2.txt
fs.writeFileSync(collegeInfo2Path, originalInfo2 + '\n' + newSectionsContent.trim() + '\n', 'utf8');

const updatedInfo2 = fs.readFileSync(collegeInfo2Path, 'utf8');
console.log('Successfully updated college-info-2.txt!');
console.log('Original length:', originalInfo2.length);
console.log('Updated length:', updatedInfo2.length);
console.log('Added characters:', updatedInfo2.length - originalInfo2.length);
