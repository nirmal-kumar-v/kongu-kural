import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();
const collegeInfoPath = path.resolve(projectRoot, 'college-info.txt');
const collegeInfo2Path = path.resolve(projectRoot, 'college-info-2.txt');

const raw1 = fs.readFileSync(collegeInfoPath, 'utf-8');
const raw2 = fs.readFileSync(collegeInfo2Path, 'utf-8');

const lines1 = raw1.split(/\r?\n/);
const calendarContent = lines1.slice(3884).join('\n').trim();

console.log(`Original calendar length: ${calendarContent.length} characters`);

// Let's create the structured text for Section 8.6, 8.7, 8.8, 8.9, 8.10
const section8_6 = `
## 8.6 Academic Schedule 2026–27 — Odd Semester (Senior Semesters: BE/BTech, ME/MTech, BSc, MSc, MCA, BArch)

Document Reference: Ref: KEC/COE/2026-27/ODD/AS/01
Document Number: Doc. No: KEC/EOMS/COE/01
Revision Number: Rev. No 00
Revision Date: Rev. Date 01.01.2026
Issue Number: Issue. No 00
Issue Date: 20.05.2026
Issuing Authority: Office of the Controller of Examinations & Internal Quality Assurance Cell (IQAC), Kongu Engineering College (Autonomous)
Scope: ODD SEMESTER 2026-27 (Except MBA and First Semester Programmes)

### Entry 1: BE / BTech (Semester 7, Regulation 2022 / R22)
• Programme: BE / BTech
• Regulations (R): 22 (Regulation 2022)
• Semester: 7
• Commencement of Classes: 01 June 2026
• CA Test-1 / Project Review - 1: 08, 09, 10 July 2026
• CA Test-2 / Project Review - 2: 17, 18, 19 Aug 2026
• CA Test-3 / Project Review - 3: 07, 08, 09 Oct 2026
• Re Test: 12, 13, 14 Oct 2026
• Semester Last Working Day: 10 Oct 2026
• Commencement of End Semester Examinations (Practical): Not Applicable
• Commencement of End Semester Examinations (Theory): 02 Nov 2026
• Even Semester Reopening (Tentative): 25 Nov 2026

### Entry 2: BE / BTech Project Details (Semester 7)
• Project Review 1: 18 July 2026
• Project Review 2: 29 Aug 2026
• Project Review 3: 10 Oct 2026
• Last date to Submit the Project Report: 10 Oct 2026
• Project Viva Voce Examinations: 13, 14 Oct 2026

### Entry 3: BE / BTech (Semester 5, Regulation 2024 / R24)
• Programme: BE / BTech
• Regulations (R): 24 (Regulation 2024)
• Semester: 5
• Commencement of Classes: 29 June 2026
• CA Test-1 / Project Review - 1: 04, 05, 06 Aug 2026
• CA Test-2 / Project Review - 2: 15, 16, 17 Sep 2026
• CA Test-3 / Project Review - 3: 26, 27, 28 Oct 2026
• Re Test: 29, 30, 31 Oct 2026
• Semester Last Working Day: 28 Oct 2026
• Commencement of End Semester Examinations (Practical): 02, 03, 04 Nov 2026
• Commencement of End Semester Examinations (Theory): 17 Nov 2026
• Even Semester Reopening (Tentative): 07 Dec 2026

### Entry 4: BE / BTech (Semester 3, Regulation 2024 / R24)
• Programme: BE / BTech
• Regulations (R): 24 (Regulation 2024)
• Semester: 3
• Commencement of Classes: 13 July 2026
• CA Test-1 / Project Review - 1: 17, 18, 19 Aug 2026
• CA Test-2 / Project Review - 2: 25, 26, 28 Sep 2026
• CA Test-3 / Project Review - 3: 04, 05, 06 Nov 2026
• Re Test: 10, 11, 12 Nov 2026
• Semester Last Working Day: 06 Nov 2026
• Commencement of End Semester Examinations (Practical): 13, 14 Nov 2026
• Commencement of End Semester Examinations (Theory): 27 Nov 2026
• Even Semester Reopening (Tentative): 21 Dec 2026

### Entry 5: ME / MTech (Semester 3, Regulation 2024 / R24)
• Programme: ME / MTech
• Regulations (R): 24 (Regulation 2024)
• Semester: 3
• Commencement of Classes: 22 June 2026
• CA Test-1 / Project Review - 1: 29, 30 July 2026
• CA Test-2 / Project Review - 2: 08, 09 Sep 2026
• CA Test-3 / Project Review - 3: 15, 16 Oct 2026
• Re Test: 21, 22 Oct 2026
• Semester Last Working Day: 17 Oct 2026
• Commencement of End Semester Examinations (Practical): Not Applicable
• Commencement of End Semester Examinations (Theory): 02 Nov 2026
• Even Semester Reopening (Tentative): 16 Nov 2026

### Entry 6: ME / MTech Project Details (Semester 3)
• Project Review 1: 01 Aug 2026
• Project Review 2: 12 Sep 2026
• Project Review 3: 17 Oct 2026
• Last date to Submit the Project Report: 23 Oct 2026
• Project Viva Voce Examinations: 24 Oct 2026

### Entry 7: BSc (Semester 5, Regulation 2024 / R24)
• Programme: BSc
• Regulations (R): 24 (Regulation 2024)
• Semester: 5
• Commencement of Classes: 01 June 2026
• CA Test-1 / Project Review - 1: 08, 09, 10 July 2026
• CA Test-2 / Project Review - 2: 17, 18, 19 Aug 2026
• CA Test-3 / Project Review - 3: 07, 08, 09 Oct 2026
• Re Test: 12, 13, 14 Oct 2026
• Semester Last Working Day: 10 Oct 2026
• Commencement of End Semester Examinations (Practical): Not Applicable
• Commencement of End Semester Examinations (Theory): 02 Nov 2026
• Even Semester Reopening (Tentative): 25 Nov 2026

### Entry 8: BSc Project Details (Semester 5)
• Project Review 1: 18 July 2026
• Project Review 2: 29 Aug 2026
• Project Review 3: 10 Oct 2026
• Last date to Submit the Project Report: 10 Oct 2026
• Project Viva Voce Examinations: 13, 14 Oct 2026

### Entry 9: BSc (Semester 3, Regulation 2024 / R24)
• Programme: BSc
• Regulations (R): 24 (Regulation 2024)
• Semester: 3
• Commencement of Classes: 22 June 2026
• CA Test-1 / Project Review - 1: 28, 29, 30 July 2026
• CA Test-2 / Project Review - 2: 07, 08, 09 Sep 2026
• CA Test-3 / Project Review - 3: 15, 16, 17 Oct 2026
• Re Test: 21, 22, 23 Oct 2026
• Semester Last Working Day: 17 Oct 2026
• Commencement of End Semester Examinations (Practical): 24, 26, 27 Oct 2026
• Commencement of End Semester Examinations (Theory): 11 Nov 2026
• Even Semester Reopening (Tentative): 07 Dec 2026

### Entry 10: MSc (Semester 9, Regulation 2022 / R22)
• Programme: MSc
• Regulations (R): 22 (Regulation 2022)
• Semester: 9
• Commencement of Classes: 01 June 2026
• CA Test-1 / Project Review - 1: 08, 09, 10 July 2026
• CA Test-2 / Project Review - 2: 17, 18, 19 Aug 2026
• CA Test-3 / Project Review - 3: 07, 08, 09 Oct 2026
• Re Test: 12, 13, 14 Oct 2026
• Semester Last Working Day: 09 Oct 2026
• Commencement of End Semester Examinations (Practical): Not Applicable
• Commencement of End Semester Examinations (Theory): 02 Nov 2026
• Even Semester Reopening (Tentative): 25 Nov 2026

### Entry 11: MSc (Semester 7, Regulation 2022 / R22)
• Programme: MSc
• Regulations (R): 22 (Regulation 2022)
• Semester: 7
• Commencement of Classes: 01 June 2026
• CA Test-1 / Project Review - 1: 18 July 2026
• CA Test-2 / Project Review - 2: 29 Aug 2026
• CA Test-3 / Project Review - 3: 10 Oct 2026
• Re Test: Not Applicable
• Semester Last Working Day: 10 Oct 2026
• Commencement of End Semester Examinations (Practical): Not Applicable
• Commencement of End Semester Examinations (Theory): Not Applicable
• Even Semester Reopening (Tentative): 25 Nov 2026

### Entry 12: MSc Project Details (Semester 7)
• Last date to Submit the Project Report: 10 Oct 2026
• Project Viva Voce Examinations: 13, 14 Oct 2026

### Entry 13: MSc (Semester 5, Regulation 2024 / R24)
• Programme: MSc
• Regulations (R): 24 (Regulation 2024)
• Semester: 5
• Commencement of Classes: 01 June 2026
• CA Test-1 / Project Review - 1: 08, 09, 10 July 2026
• CA Test-2 / Project Review - 2: 17, 18, 19 Aug 2026
• CA Test-3 / Project Review - 3: 07, 08, 09 Oct 2026
• Re Test: 12, 13, 14 Oct 2026
• Semester Last Working Day: 09 Oct 2026
• Commencement of End Semester Examinations (Practical): 15, 16, 17 Oct 2026
• Commencement of End Semester Examinations (Theory): 02 Nov 2026
• Even Semester Reopening (Tentative): 25 Nov 2026

### Entry 14: MSc (Semester 3, Regulation 2024 / R24)
• Programme: MSc
• Regulations (R): 24 (Regulation 2024)
• Semester: 3
• Commencement of Classes: 22 June 2026
• CA Test-1 / Project Review - 1: 28, 29, 30 July 2026
• CA Test-2 / Project Review - 2: 07, 08, 09 Sep 2026
• CA Test-3 / Project Review - 3: 15, 16, 17 Oct 2026
• Re Test: 21, 22, 23 Oct 2026
• Semester Last Working Day: 17 Oct 2026
• Commencement of End Semester Examinations (Practical): 24, 26 Oct 2026
• Commencement of End Semester Examinations (Theory): 11 Nov 2026
• Even Semester Reopening (Tentative): 07 Dec 2026

### Entry 15: MCA (Semester 3, Regulation 2024 / R24)
• Programme: MCA
• Regulations (R): 24 (Regulation 2024)
• Semester: 3
• Commencement of Classes: 22 June 2026
• CA Test-1 / Project Review - 1: 28, 29, 30 July 2026
• CA Test-2 / Project Review - 2: 07, 08, 09 Sep 2026
• CA Test-3 / Project Review - 3: 15, 16, 17 Oct 2026
• Re Test: 21, 22, 23 Oct 2026
• Semester Last Working Day: 17 Oct 2026
• Commencement of End Semester Examinations (Practical): 24, 26, 27 Oct 2026
• Commencement of End Semester Examinations (Theory): 11 Nov 2026
• Even Semester Reopening (Tentative): 07 Dec 2026

### Entry 16: BArch (Semester 3, Regulation 2025 / R25)
• Programme: BArch
• Regulations (R): 25 (Regulation 2025)
• Semester: 3
• Commencement of Classes: 22 June 2026
• CA Test-1 / Project Review - 1: 17, 18, 19 Aug 2026
• CA Test-2 / Project Review - 2: 15, 16, 17 Oct 2026
• CA Test-3 / Project Review - 3: Not Applicable
• Re Test: 21, 22 Oct 2026
• Semester Last Working Day: 17 Oct 2026
• Commencement of End Semester Examinations (Practical): 23, 24 Oct 2026
• Commencement of End Semester Examinations (Theory): 02 Nov 2026
• Even Semester Reopening (Tentative): 25 Nov 2026
`;

const section8_7 = `
## 8.7 Academic Schedule 2026–27 — Odd Semester (First Semester: BE/BTech, ME/MTech, BSc, MSc, MBA, MCA, BArch)

Document Reference: Ref: KEC/COE/2026-27/ODD/AS/02
Document Number: Doc. No: KEC/EOMS/COE/01
Revision Number: Rev. No 00
Revision Date: Rev. Date 01.01.2026
Issue Number: Issue. No 00
Date: 17.08.2026 (also noted as 7.8.26)
Issuing Authority: Office of the Controller of Examinations, Kongu Engineering College (Autonomous)
Signatories: Controller of Examinations, Principal
Scope: ODD SEMESTER 2026-27 (First Semester Programmes)

### Entry 1: BSc (Semester 1, Regulation 2026 / R26)
• Programme: BSc
• Regulations (R): 26 (Regulation 2026)
• Semester: 1
• Special Note / Program Schedule: Induction Programme and Foundation Laboratory: 18.06.2026 - 24.07.2026
• Commencement of Classes: 27 July 2026
• CA Test-1 / Project Review - 1: 18-23 Sep 2026
• CA Test-2 / Project Review - 2: 17-21 Nov 2026
• CA Test-3 / Project Review - 3: Not Applicable
• Improvement Test / Re Test: 23-27 Nov 2026
• Semester Last Working Day: 21 Nov 2026
• Commencement of End Semester Examinations (Practical): 23 Nov 2026
• Commencement of End Semester Examinations (Theory): 07 Dec 2026
• Even Semester Reopening (Tentative): 04 Jan 2027

### Entry 2: MSc (Semester 1, Regulation 2026 / R26)
• Programme: MSc
• Regulations (R): 26 (Regulation 2026)
• Semester: 1
• Special Note / Program Schedule: Induction Programme and Foundation Laboratory: 18.06.2026 - 24.07.2026
• Commencement of Classes: 27 July 2026
• CA Test-1 / Project Review - 1: 18-23 Sep 2026
• CA Test-2 / Project Review - 2: 17-21 Nov 2026
• CA Test-3 / Project Review - 3: Not Applicable
• Improvement Test / Re Test: 23-27 Nov 2026
• Semester Last Working Day: 21 Nov 2026
• Commencement of End Semester Examinations (Practical): 23 Nov 2026
• Commencement of End Semester Examinations (Theory): 07 Dec 2026
• Even Semester Reopening (Tentative): 04 Jan 2027

### Entry 3: BE / BTech (Semester 1, Regulation 2026 / R26)
• Programme: BE / BTech
• Regulations (R): 26 (Regulation 2026)
• Semester: 1
• Special Note / Program Schedule: Induction Program: 24.08.2026 - 03.09.2026
• Commencement of Classes: 07 Sep 2026
• CA Test-1 / Project Review - 1: 24-29 Oct 2026
• CA Test-2 / Project Review - 2: 24-31 Dec 2026
• CA Test-3 / Project Review - 3: Not Applicable
• Improvement Test / Re Test: 02-06 Nov 2026 / 04-08 Jan 2027
• Semester Last Working Day: 31 Dec 2026
• Commencement of End Semester Examinations (Practical): 04 Jan 2027
• Commencement of End Semester Examinations (Theory): 23 Jan 2027
• Even Semester Reopening (Tentative): 08 Feb 2027

### Entry 4: BArch (Semester 1, Regulation 2026 / R26)
• Programme: BArch
• Regulations (R): 26 (Regulation 2026)
• Semester: 1
• Commencement of Classes: 31 Aug 2026
• CA Test-1 / Project Review - 1: 24-29 Oct 2026
• CA Test-2 / Project Review - 2: 19-24 Dec 2026
• CA Test-3 / Project Review - 3: Not Applicable
• Improvement Test / Re Test: 28-31 Dec 2026
• Semester Last Working Day: 24 Dec 2026
• Commencement of End Semester Examinations (Practical): 28 Dec 2026
• Commencement of End Semester Examinations (Theory): 19 Jan 2027
• Even Semester Reopening (Tentative): 08 Feb 2027

### Entry 5: ME / MTech (Semester 1, Regulation 2026 / R26)
• Programme: ME / MTech
• Regulations (R): 26 (Regulation 2026)
• Semester: 1
• Commencement of Classes: 31 Aug 2026
• CA Test-1 / Project Review - 1: 24-29 Oct 2026
• CA Test-2 / Project Review - 2: 19-24 Dec 2026
• CA Test-3 / Project Review - 3: Not Applicable
• Improvement Test / Re Test: 28-31 Dec 2026
• Semester Last Working Day: 24 Dec 2026
• Commencement of End Semester Examinations (Practical): 28 Dec 2026
• Commencement of End Semester Examinations (Theory): 19 Jan 2027
• Even Semester Reopening (Tentative): 08 Feb 2027

### Entry 6: MBA (Semester 1, Regulation 2026 / R26)
• Programme: MBA
• Regulations (R): 26 (Regulation 2026)
• Semester: 1
• Commencement of Classes: 31 Aug 2026
• CA Test-1 / Project Review - 1: 24-29 Oct 2026
• CA Test-2 / Project Review - 2: 19-24 Dec 2026
• CA Test-3 / Project Review - 3: Not Applicable
• Improvement Test / Re Test: 28-31 Dec 2026
• Semester Last Working Day: 24 Dec 2026
• Commencement of End Semester Examinations (Practical): 28 Dec 2026
• Commencement of End Semester Examinations (Theory): 19 Jan 2027
• Even Semester Reopening (Tentative): 08 Feb 2027

### Entry 7: MCA (Semester 1, Regulation 2026 / R26)
• Programme: MCA
• Regulations (R): 26 (Regulation 2026)
• Semester: 1
• Commencement of Classes: 31 Aug 2026
• CA Test-1 / Project Review - 1: 24-29 Oct 2026
• CA Test-2 / Project Review - 2: 19-24 Dec 2026
• CA Test-3 / Project Review - 3: Not Applicable
• Improvement Test / Re Test: 28-31 Dec 2026
• Semester Last Working Day: 24 Dec 2026
• Commencement of End Semester Examinations (Practical): 28 Dec 2026
• Commencement of End Semester Examinations (Theory): 19 Jan 2027
• Even Semester Reopening (Tentative): 08 Feb 2027

Signatories (Present on all pages):
• Controller of Examinations
• Principal
`;

const section8_8 = `
## 8.8 Academic Schedule 2026–27 — Even Semester (All Programmes & Batches: BE/BTech, ME/MTech, BSc, MSc, MCA, BArch, MBA)

Document Reference: Ref: KEC/COE/2026-27/EVEN/AS/01
Document Number: Doc. No: KEC/EOMS/COE/01
Revision Number: Rev. No 00
Revision Date: Rev. Date 01.01.2026
Issue Number: Issue. No 00
Issue Date: 17.08.2026
Issuing Authority: Office of the Controller of Examinations, Kongu Engineering College (Autonomous)
Scope: EVEN SEMESTER 2026-27 Academic Schedule across all Batches and Programmes

### 1. BE / BTech Programmes (Even Semester 2026–27)

#### BE / BTech Batch 2022 (Semester 8)
• Commencement of Classes: 25 Nov 2026
• CA Test-1 / Project Review-1: 14 Dec 2026 (Project Review: 09 Jan 2027)
• CA Test-2 / Project Review-2: 05 Jan 2027 (Project Review: 20 Feb 2027)
• CA Test-3 / Project Review-3: 25 Jan 2027 (Project Review: 13 Mar 2027)
• Improvement Test / Re-Test: 29, 30 Jan 2027
• Last Date to Submit Project Report: 20 Mar 2027
• Semester Last Working Day: 20 Mar 2027
• Project Viva Voce Examinations: 23 Mar 2027
• Commencement of End Semester Examinations: 01 Apr 2027

#### BE / BTech Batch 2024 (Semester 6)
• Commencement of Classes: 07 Dec 2026
• CA Test-1 / Project Review-1: 18, 19, 20 Jan 2027 (Project Review: 23 Jan 2027)
• CA Test-2 / Project Review-2: 24, 25, 26 Feb 2027 (Project Review: 20 Feb 2027)
• CA Test-3 / Project Review-3: 05, 06, 08 Apr 2027 (Project Review: 03 Apr 2027)
• Improvement Test / Re-Test: 09, 12, 13 Apr 2027
• Last Date to Submit Project Report: 03 Apr 2027
• Semester Last Working Day: 08 Apr 2027
• Project Viva Voce Examinations: 09 Apr 2027
• Commencement of End Semester Examinations: 26 Apr 2027 (Theory) / 15 Apr 2027 (Practical)
• Even Semester Reopening (Tentative): 01 June 2027

#### BE / BTech Batch 2024 (Semester 4)
• Commencement of Classes: 21 Dec 2026
• CA Test-1 / Project Review-1: 01, 02, 03 Feb 2027
• CA Test-2 / Project Review-2: 11, 12, 13 Mar 2027
• CA Test-3 / Project Review-3: 22, 23, 24 Apr 2027
• Improvement Test / Re-Test: 26, 27, 28 Apr 2027
• Semester Last Working Day: 24 Apr 2027
• Commencement of End Semester Examinations: 29 Apr 2027 (Theory) / 08 May 2027 (Practical)
• Even Semester Reopening (Tentative): 01 June 2027

#### BE / BTech Batch 2026 (Semester 2)
• Commencement of Classes: 08 Feb 2027
• CA Test-1 / Project Review-1: 03-12 Apr 2027
• CA Test-2 / Project Review-2: 29-31 May 2027 and 01-04 June 2027
• CA Test-3 / Project Review-3: 05-11 June 2027
• Improvement Test / Re-Test: 04 June 2027
• Semester Last Working Day: 19 June 2027 (Theory) / 07 June 2027 (Practical)
• Commencement of End Semester Examinations: 12 July 2027

---

### 2. ME / MTech Programmes (Even Semester 2026–27)

#### ME / MTech Batch 2024 (Semester 4)
• Commencement of Classes: 16 Nov 2026
• CA Test-1 / Project Review-1: 24 Dec 2026
• CA Test-2 / Project Review-2: 06 Feb 2027
• CA Test-3 / Project Review-3: 16 Mar 2027
• Improvement Test / Re-Test: 16 Mar 2027
• Last Date to Submit Project Report: Feb 2027 / 17 Mar 2027
• Project Viva Voce Examinations: 17 Mar 2027 / 18, 19 Mar 2027 / 22 Mar 2027 / 23 Mar 2027
• Even Semester Reopening (Tentative): 19 June 2027 / 07 June 2027 / 01 Apr 2027 / 12 July 2027

---

### 3. BSc Programmes (Even Semester 2026–27)

#### BSc Batch 2024 (Semester 6)
• Commencement of Classes: 25 Nov 2026
• CA Test-1 / Project Review-1: 31 Dec 2026 (Project Review: 09 Jan 2027)
• CA Test-2 / Project Review-2: 20 Feb 2027
• CA Test-3 / Project Review-3: 20 Mar 2027
• Improvement Test / Re-Test: 01 Apr 2027
• Last Date to Submit Project Report: 10 Feb 2027 / 20 Mar 2027
• Project Viva Voce Examinations: 13 Mar 2027 / 17 Mar 2027 / 18, 19 Mar 2027 / 20 Mar 2027 / 22 Mar 2027 / 23 Mar 2027
• Semester Last Working Day / Exams / Reopening Details: 29-31 May 2027, 01-04 June 2027, 05-11 June 2027, 04 June 2027, 07 June 2027, 19 June 2027, 12 July 2027

#### BSc Batch 2024 (Semester 4)
• Commencement of Classes: 07 Dec 2026
• CA Test-1 / Project Review-1: 18, 19, 20 Jan 2027
• CA Test-2 / Project Review-2: 24, 25, 26 Feb 2027
• CA Test-3 / Project Review-3: 05, 06, 08 Apr 2027
• Improvement Test / Re-Test: 09, 12, 13 Apr 2027
• Semester Last Working Day: 08 Apr 2027
• Commencement of End Semester Examinations: 26 Apr 2027 (Theory) / 15 Apr 2027 (Practical)
• Even Semester Reopening (Tentative): 01 June 2027

#### BSc Batch 2026 (Semester 2)
• Commencement of Classes: 04 Jan 2027
• CA Test-1 / Project Review-1: 01-05 Mar 2027
• CA Test-2 / Project Review-2: 29, 30 Apr 2027 and 03-05 May 2027
• CA Test-3 / Project Review-3: 06-11 May 2027
• Improvement Test / Re-Test: 05 May 2027
• Semester Last Working Day: 07 May 2027 (Theory) / 18 May 2027 (Practical)
• Commencement of End Semester Examinations: 16 June 2027

---

### 4. MSc Programmes (Even Semester 2026–27)

#### MSc Batch 2022 (Semester 10)
• Commencement of Classes: 09 Jan 2027
• CA Test-1 / Project Review-1: 25 Nov 2026
• CA Test-2 / Project Review-2: 20 Feb 2027
• CA Test-3 / Project Review-3: 13 Mar 2027
• Improvement Test / Re-Test: 20 Mar 2027
• Last Date to Submit Project Report: 25 Nov 2026
• Project Viva Voce Examinations: 15, 16, 17 Feb 2027 / 29, 30, 31 Mar 2027
• Commencement of End Semester Examinations: 01 June 2027

#### MSc Batch 2022 / 2024 (Semester 8 / 6)
• Commencement of Classes: 04, 05, 06 Jan 2027
• CA Test-1 / Project Review-1: 25 Nov 2026 / 20 Mar 2027
• Project Viva Voce Examinations: 15, 16, 17 Feb 2027 / 29, 30, 31 Mar 2027
• Improvement Test / Re-Test: 01, 02, 03 Apr 2027
• Semester Last Working Day: 23 Mar 2027 / 31 Mar 2027
• Commencement of End Semester Examinations: 05 Apr 2027 / 15 Apr 2027
• Even Semester Reopening (Tentative): 01 June 2027

#### MSc Batch 2024 (Semester 4)
• Commencement of Classes: 07 Dec 2026
• CA Test-1 / Project Review-1: 18, 19, 20 Jan 2027
• CA Test-2 / Project Review-2: 24, 25, 26 Feb 2027
• CA Test-3 / Project Review-3: 05, 06, 08 Apr 2027
• Improvement Test / Re-Test: 09, 12, 13 Apr 2027
• Semester Last Working Day: 08 Apr 2027
• Commencement of End Semester Examinations: 26 Apr 2027 (Theory) / 15 Apr 2027 (Practical)
• Even Semester Reopening (Tentative): 01 June 2027

#### MSc Batch 2026 (Semester 2)
• Commencement of Classes: 04 Jan 2027
• CA Test-1 / Project Review-1: 01-05 Mar 2027
• CA Test-2 / Project Review-2: 29, 30 Apr 2027 and 03-05 May 2027
• CA Test-3 / Project Review-3: 06-11 May 2027
• Improvement Test / Re-Test: 05 May 2027
• Semester Last Working Day: 07 May 2027 (Theory) / 18 May 2027 (Practical)
• Commencement of End Semester Examinations: 16 June 2027

---

### 5. MCA Programmes (Even Semester 2026–27)

#### MCA Batch 2024 (Semester 4)
• Commencement of Classes: 07 Dec 2026
• CA Test-1 / Project Review-1: 23 Jan 2027
• CA Test-2 / Project Review-2: 20 Feb 2027 / 03 Apr 2027
• Improvement Test / Re-Test: 08 Apr 2027
• Last Date to Submit Project Report: 03 Apr 2027
• Project Viva Voce Examinations: 09 Apr 2027
• Additional Project Review: 18 Mar 2027 / 24 Apr 2027 / 01 June 2027
• Final Project Report Submission: 05 June 2027
• Project Viva Voce (Final): 09 June 2027

#### MCA Batch 2026 (Semester 2)
• Commencement of Classes: 08 Feb 2027
• CA Test-1 / Project Review-1: 01-08 Apr 2027
• CA Test-2 / Project Review-2: 29-31 May 2027 and 01-04 June 2027
• CA Test-3 / Project Review-3: 05-11 June 2027
• Improvement Test / Re-Test: 04 June 2027
• Semester Last Working Day: 19 June 2027 (Theory) / 07 June 2027 (Practical)
• Commencement of End Semester Examinations: 12 July 2027

---

### 6. BArch Programmes (Even Semester 2026–27)

#### BArch Batch 2025 (Semester 4)
• Commencement of Classes: 25 Nov 2026
• CA Test-1 / Project Review-1: 27, 28, 29 Jan 2027
• CA Test-2 / Project Review-2: 29, 30, 31 Mar 2027
• CA Test-3 / Project Review-3: 01, 02, 03 Apr 2027
• Improvement Test / Re-Test: 31 Mar 2027
• Semester Last Working Day: 15 Apr 2027 (Theory) / 05 Apr 2027 (Practical)
• Commencement of End Semester Examinations: 01 June 2027

#### BArch Batch 2026 (Semester 2)
• Commencement of Classes: 08 Feb 2027
• CA Test-1 / Project Review-1: 01-08 Apr 2027
• CA Test-2 / Project Review-2: 29-31 May 2027 and 01-04 June 2027
• CA Test-3 / Project Review-3: 05-11 June 2027
• Improvement Test / Re-Test: 04 June 2027
• Semester Last Working Day: 19 June 2027 (Theory) / 07 June 2027 (Practical)
• Commencement of End Semester Examinations: 12 July 2027

---

### 7. MBA Programmes (Even Semester 2026–27)

#### MBA Batch 2026 (Semester 2)
• Commencement of Classes: 08 Feb 2027
• CA Test-1 / Project Review-1: 01-08 Apr 2027
• CA Test-2 / Project Review-2: 29-31 May 2027 and 01-04 June 2027
• CA Test-3 / Project Review-3: 05-11 June 2027
• Improvement Test / Re-Test: 04 June 2027
• Semester Last Working Day: 19 June 2027 (Theory) / 07 June 2027 (Practical)
• Commencement of End Semester Examinations: 12 July 2027
`;

const section8_9 = `
## 8.9 Academic Schedule 2026–27 — Master Date-by-Date Schedule & Event Index (What is scheduled on specific dates)

This section maps calendar dates across the 2026-27 academic year to all scheduled exams, reviews, classes, and activities:

### June 2026
• 18 June 2026 to 24 July 2026: Induction Programme and Foundation Laboratory for BSc Semester 1 (R26) and MSc Semester 1 (R26).
• 01 June 2026: Commencement of Classes for BE/BTech Semester 7 (R22), BSc Semester 5 (R24), MSc Semester 9 (R22), MSc Semester 7 (R22), MSc Semester 5 (R24).
• 22 June 2026: Commencement of Classes for ME/MTech Semester 3 (R24), BSc Semester 3 (R24), MSc Semester 3 (R24), MCA Semester 3 (R24), BArch Semester 3 (R25).
• 29 June 2026: Commencement of Classes for BE/BTech Semester 5 (R24).

### July 2026
• 08, 09, 10 July 2026: CA Test-1 / Project Review - 1 for BE/BTech Semester 7 (R22), BSc Semester 5 (R24), MSc Semester 9 (R22), MSc Semester 5 (R24).
• 13 July 2026: Commencement of Classes for BE/BTech Semester 3 (R24).
• 18 July 2026: Project Review 1 for BE/BTech Semester 7, BSc Semester 5; CA Test-1 / Project Review - 1 for MSc Semester 7 (R22).
• 27 July 2026: Commencement of Classes for BSc Semester 1 (R26) and MSc Semester 1 (R26).
• 28, 29, 30 July 2026: CA Test-1 / Project Review - 1 for BSc Semester 3 (R24), MSc Semester 3 (R24), MCA Semester 3 (R24).
• 29, 30 July 2026: CA Test-1 / Project Review - 1 for ME/MTech Semester 3 (R24).

### August 2026
• 01 August 2026: Project Review 1 for ME/MTech Semester 3.
• 04, 05, 06 August 2026: CA Test-1 / Project Review - 1 for BE/BTech Semester 5 (R24).
• 17, 18, 19 August 2026: CA Test-1 / Project Review - 1 for BE/BTech Semester 3 (R24), BArch Semester 3 (R25); CA Test-2 / Project Review - 2 for BE/BTech Semester 7 (R22), BSc Semester 5 (R24), MSc Semester 9 (R22), MSc Semester 5 (R24).
• 24 August 2026 to 03 September 2026: Induction Program for BE / BTech Semester 1 (R26).
• 29 August 2026: Project Review 2 for BE/BTech Semester 7, BSc Semester 5; CA Test-2 / Project Review - 2 for MSc Semester 7 (R22).
• 31 August 2026: Commencement of Classes for BArch Semester 1 (R26), ME/MTech Semester 1 (R26), MBA Semester 1 (R26), MCA Semester 1 (R26).

### September 2026
• 07 September 2026: Commencement of Classes for BE / BTech Semester 1 (R26).
• 07, 08, 09 September 2026: CA Test-2 / Project Review - 2 for BSc Semester 3 (R24), MSc Semester 3 (R24), MCA Semester 3 (R24).
• 08, 09 September 2026: CA Test-2 / Project Review - 2 for ME/MTech Semester 3 (R24).
• 12 September 2026: Project Review 2 for ME/MTech Semester 3.
• 15, 16, 17 September 2026: CA Test-2 / Project Review - 2 for BE/BTech Semester 5 (R24).
• 18-23 September 2026: CA Test-1 / Project Review - 1 for BSc Semester 1 (R26), MSc Semester 1 (R26).
• 25, 26, 28 September 2026: CA Test-2 / Project Review - 2 for BE/BTech Semester 3 (R24).

### October 2026
• 07, 08, 09 October 2026: CA Test-3 / Project Review - 3 for BE/BTech Semester 7 (R22), BSc Semester 5 (R24), MSc Semester 9 (R22), MSc Semester 5 (R24).
• 09 October 2026: Semester Last Working Day for MSc Semester 9 (R22) and MSc Semester 5 (R24).
• 10 October 2026: Semester Last Working Day for BE/BTech Semester 7 (R22), BSc Semester 5 (R24), MSc Semester 7 (R22); CA Test-3 / Project Review - 3 for MSc Semester 7 (R22); Project Review 3 and Last date to Submit Project Report for BE/BTech Semester 7, BSc Semester 5, MSc Semester 7.
• 12, 13, 14 October 2026: Re Test for BE/BTech Semester 7 (R22), BSc Semester 5 (R24), MSc Semester 9 (R22), MSc Semester 5 (R24).
• 13, 14 October 2026: Project Viva Voce Examinations for BE/BTech Semester 7, BSc Semester 5, MSc Semester 7.
• 15, 16 October 2026: CA Test-3 / Project Review - 3 for ME/MTech Semester 3 (R24).
• 15, 16, 17 October 2026: CA Test-3 / Project Review - 3 for BSc Semester 3 (R24), MSc Semester 3 (R24), MCA Semester 3 (R24); CA Test-2 / Project Review - 2 for BArch Semester 3 (R25); Commencement of End Semester Examinations (Practical) for MSc Semester 5 (R24).
• 17 October 2026: Semester Last Working Day for ME/MTech Semester 3, BSc Semester 3, MSc Semester 3, MCA Semester 3, BArch Semester 3; Project Review 3 for ME/MTech Semester 3.
• 21, 22 October 2026: Re Test for ME/MTech Semester 3 (R24) and BArch Semester 3 (R25).
• 21, 22, 23 October 2026: Re Test for BSc Semester 3 (R24), MSc Semester 3 (R24), MCA Semester 3 (R24).
• 23 October 2026: Last date to Submit the Project Report for ME/MTech Semester 3.
• 23, 24 October 2026: Commencement of End Semester Examinations (Practical) for BArch Semester 3 (R25).
• 24 October 2026: Project Viva Voce Examinations for ME/MTech Semester 3.
• 24, 26 October 2026: Commencement of End Semester Examinations (Practical) for MSc Semester 3 (R24).
• 24, 26, 27 October 2026: Commencement of End Semester Examinations (Practical) for BSc Semester 3 (R24) and MCA Semester 3 (R24).
• 24-29 October 2026: CA Test-1 / Project Review - 1 for BE/BTech Semester 1 (R26), BArch Semester 1 (R26), ME/MTech Semester 1 (R26), MBA Semester 1 (R26), MCA Semester 1 (R26).
• 26, 27, 28 October 2026: CA Test-3 / Project Review - 3 for BE/BTech Semester 5 (R24).
• 28 October 2026: Semester Last Working Day for BE/BTech Semester 5 (R24).
• 29, 30, 31 October 2026: Re Test for BE/BTech Semester 5 (R24).

### November 2026
• 02 November 2026: Commencement of End Semester Examinations (Theory) for BE/BTech Semester 7, ME/MTech Semester 3, BSc Semester 5, MSc Semester 9, MSc Semester 5, BArch Semester 3.
• 02, 03, 04 November 2026: Commencement of End Semester Examinations (Practical) for BE/BTech Semester 5 (R24).
• 02-06 November 2026: Improvement Test / Re Test (Phase 1) for BE/BTech Semester 1 (R26).
• 04, 05, 06 November 2026: CA Test-3 / Project Review - 3 for BE/BTech Semester 3 (R24).
• 06 November 2026: Semester Last Working Day for BE/BTech Semester 3 (R24).
• 10, 11, 12 November 2026: Re Test for BE/BTech Semester 3 (R24).
• 11 November 2026: Commencement of End Semester Examinations (Theory) for BSc Semester 3, MSc Semester 3, MCA Semester 3.
• 13, 14 November 2026: Commencement of End Semester Examinations (Practical) for BE/BTech Semester 3 (R24).
• 16 November 2026: Even Semester Reopening (Tentative) for ME/MTech Semester 3; Commencement of Classes for ME/MTech Batch 2024 (Semester 4).
• 17 November 2026: Commencement of End Semester Examinations (Theory) for BE/BTech Semester 5 (R24).
• 17-21 November 2026: CA Test-2 / Project Review - 2 for BSc Semester 1 (R26), MSc Semester 1 (R26).
• 21 November 2026: Semester Last Working Day for BSc Semester 1 (R26), MSc Semester 1 (R26).
• 23 November 2026: Commencement of End Semester Examinations (Practical) for BSc Semester 1 (R26), MSc Semester 1 (R26).
• 23-27 November 2026: Improvement Test / Re Test for BSc Semester 1 (R26), MSc Semester 1 (R26).
• 25 November 2026: Even Semester Reopening (Tentative) for BE/BTech Semester 7, BSc Semester 5, MSc Semester 9, MSc Semester 7, MSc Semester 5, BArch Semester 3; Commencement of Classes for BE/BTech Batch 2022 (Semester 8), BSc Batch 2024 (Semester 6), BArch Batch 2025 (Semester 4); CA Test-1 / Project Review-1 for MSc Batch 2022 (Semester 10); CA Test-1 for MSc Batch 2022 / 2024 (Semester 8 / 6); Last Date to Submit Project Report for MSc Batch 2022 (Semester 10).
• 27 November 2026: Commencement of End Semester Examinations (Theory) for BE/BTech Semester 3 (R24).

### December 2026
• 07 December 2026: Even Semester Reopening (Tentative) for BE/BTech Semester 5, BSc Semester 3, MSc Semester 3, MCA Semester 3; Commencement of End Semester Examinations (Theory) for BSc Semester 1, MSc Semester 1; Commencement of Classes for BE/BTech Batch 2024 (Semester 6), BSc Batch 2024 (Semester 4), MSc Batch 2024 (Semester 4), MCA Batch 2024 (Semester 4).
• 14 December 2026: CA Test-1 for BE/BTech Batch 2022 (Semester 8).
• 19-24 December 2026: CA Test-2 / Project Review - 2 for BArch Semester 1, ME/MTech Semester 1, MBA Semester 1, MCA Semester 1.
• 21 December 2026: Even Semester Reopening (Tentative) for BE/BTech Semester 3; Commencement of Classes for BE/BTech Batch 2024 (Semester 4).
• 24 December 2026: Semester Last Working Day for BArch Semester 1, ME/MTech Semester 1, MBA Semester 1, MCA Semester 1; CA Test-1 / Project Review-1 for ME/MTech Batch 2024 (Semester 4).
• 24-31 December 2026: CA Test-2 / Project Review - 2 for BE/BTech Semester 1 (R26).
• 28 December 2026: Commencement of End Semester Examinations (Practical) for BArch Semester 1, ME/MTech Semester 1, MBA Semester 1, MCA Semester 1.
• 28-31 December 2026: Improvement Test / Re Test for BArch Semester 1, ME/MTech Semester 1, MBA Semester 1, MCA Semester 1.
• 31 December 2026: Semester Last Working Day for BE/BTech Semester 1 (R26); CA Test-1 for BSc Batch 2024 (Semester 6).

### January 2027
• 04 January 2027: Even Semester Reopening (Tentative) for BSc Semester 1, MSc Semester 1; Commencement of End Semester Examinations (Practical) for BE/BTech Semester 1; Commencement of Classes for BSc Batch 2026 (Semester 2), MSc Batch 2026 (Semester 2).
• 04, 05, 06 January 2027: Commencement of Classes for MSc Batch 2022 / 2024 (Semester 8 / 6).
• 04-08 January 2027: Improvement Test / Re Test (Phase 2) for BE/BTech Semester 1 (R26).
• 05 January 2027: CA Test-2 for BE/BTech Batch 2022 (Semester 8).
• 09 January 2027: Project Review 1 for BE/BTech Batch 2022 (Semester 8) and BSc Batch 2024 (Semester 6); Commencement of Classes for MSc Batch 2022 (Semester 10).
• 18, 19, 20 January 2027: CA Test-1 / Project Review-1 for BE/BTech Batch 2024 (Semester 6), BSc Batch 2024 (Semester 4), MSc Batch 2024 (Semester 4).
• 19 January 2027: Commencement of End Semester Examinations (Theory) for BArch Semester 1, ME/MTech Semester 1, MBA Semester 1, MCA Semester 1.
• 23 January 2027: Commencement of End Semester Examinations (Theory) for BE/BTech Semester 1; Project Review 1 for BE/BTech Batch 2024 (Semester 6) and MCA Batch 2024 (Semester 4); CA Test-1 for MCA Batch 2024 (Semester 4).
• 25 January 2027: CA Test-3 for BE/BTech Batch 2022 (Semester 8).
• 27, 28, 29 January 2027: CA Test-1 for BArch Batch 2025 (Semester 4).
• 29, 30 January 2027: Improvement Test / Re-Test for BE/BTech Batch 2022 (Semester 8).

### February 2027
• 01, 02, 03 February 2027: CA Test-1 for BE/BTech Batch 2024 (Semester 4).
• 06 February 2027: CA Test-2 / Project Review-2 for ME/MTech Batch 2024 (Semester 4).
• 08 February 2027: Even Semester Reopening (Tentative) for BE/BTech Semester 1, BArch Semester 1, ME/MTech Semester 1, MBA Semester 1, MCA Semester 1; Commencement of Classes for BE/BTech Batch 2026 (Semester 2), MCA Batch 2026 (Semester 2), BArch Batch 2026 (Semester 2), MBA Batch 2026 (Semester 2).
• 10 February 2027: Last Date to Submit Project Report (Phase 1) for BSc Batch 2024 (Semester 6).
• 15, 16, 17 February 2027: Project Viva Voce (Phase 1) for MSc Batch 2022 (Semester 10), MSc Batch 2022 / 2024 (Semester 8 / 6).
• 20 February 2027: Project Review 2 for BE/BTech Batch 2022 (Semester 8), BE/BTech Batch 2024 (Semester 6); CA Test-2 for BSc Batch 2024 (Semester 6), MSc Batch 2022 (Semester 10), MCA Batch 2024 (Semester 4).
• 24, 25, 26 February 2027: CA Test-2 for BE/BTech Batch 2024 (Semester 6), BSc Batch 2024 (Semester 4), MSc Batch 2024 (Semester 4).

### March 2027
• 01-05 March 2027: CA Test-1 / Project Review-1 for BSc Batch 2026 (Semester 2), MSc Batch 2026 (Semester 2).
• 11, 12, 13 March 2027: CA Test-2 for BE/BTech Batch 2024 (Semester 4).
• 13 March 2027: Project Review 3 for BE/BTech Batch 2022 (Semester 8); CA Test-3 for MSc Batch 2022 (Semester 10); Project Viva Voce for BSc Batch 2024 (Semester 6).
• 16 March 2027: CA Test-3 / Project Review-3 and Improvement Test / Re-Test for ME/MTech Batch 2024 (Semester 4).
• 17 March 2027: Last Date to Submit Project Report / Project Viva Voce for ME/MTech Batch 2024 (Semester 4), BSc Batch 2024 (Semester 6).
• 18 March 2027: Additional Project Review for MCA Batch 2024 (Semester 4).
• 18, 19 March 2027: Project Viva Voce Examinations for ME/MTech Batch 2024 (Semester 4), BSc Batch 2024 (Semester 6).
• 20 March 2027: Last Date to Submit Project Report and Semester Last Working Day for BE/BTech Batch 2022 (Semester 8); CA Test-3 for BSc Batch 2024 (Semester 6); Improvement Test / Re-Test for MSc Batch 2022 (Semester 10); CA Test-1 (Phase 2) for MSc Batch 2022 / 2024 (Semester 8 / 6); Last Date to Submit Project Report and Project Viva Voce for BSc Batch 2024 (Semester 6).
• 22 March 2027: Project Viva Voce for ME/MTech Batch 2024 (Semester 4), BSc Batch 2024 (Semester 6).
• 23 March 2027: Project Viva Voce for BE/BTech Batch 2022 (Semester 8), ME/MTech Batch 2024 (Semester 4), BSc Batch 2024 (Semester 6); Semester Last Working Day for MSc Batch 2022 / 2024 (Semester 8 / 6).
• 29, 30, 31 March 2027: CA Test-2 for BArch Batch 2025 (Semester 4); Project Viva Voce (Phase 2) for MSc Batch 2022 (Semester 10), MSc Batch 2022 / 2024 (Semester 8 / 6).
• 31 March 2027: Improvement Test / Re-Test for BArch Batch 2025 (Semester 4); Semester Last Working Day for MSc Batch 2022 / 2024 (Semester 8 / 6).

### April 2027
• 01 April 2027: Commencement of End Semester Examinations for BE/BTech Batch 2022 (Semester 8); Improvement Test / Re-Test for BSc Batch 2024 (Semester 6); Reopening (Option) for ME/MTech Batch 2024 (Semester 4).
• 01, 02, 03 April 2027: CA Test-3 for BArch Batch 2025 (Semester 4); Improvement Test / Re-Test for MSc Batch 2022 / 2024 (Semester 8 / 6).
• 01-08 April 2027: CA Test-1 / Project Review-1 for MCA Batch 2026 (Semester 2), BArch Batch 2026 (Semester 2), MBA Batch 2026 (Semester 2).
• 03 April 2027: Project Review 3 and Last Date to Submit Project Report for BE/BTech Batch 2024 (Semester 6), MCA Batch 2024 (Semester 4); CA Test-2 (Phase 2) for MCA Batch 2024 (Semester 4).
• 03-12 April 2027: CA Test-1 / Project Review-1 for BE/BTech Batch 2026 (Semester 2).
• 05 April 2027: Commencement of End Semester Examinations (Phase 1) for MSc Batch 2022 / 2024 (Semester 8 / 6); Practical Semester Last Working Day for BArch Batch 2025 (Semester 4).
• 05, 06, 08 April 2027: CA Test-3 / Project Review-3 for BE/BTech Batch 2024 (Semester 6), BSc Batch 2024 (Semester 4), MSc Batch 2024 (Semester 4).
• 08 April 2027: Semester Last Working Day for BE/BTech Batch 2024 (Semester 6), BSc Batch 2024 (Semester 4), MSc Batch 2024 (Semester 4); Improvement Test / Re-Test for MCA Batch 2024 (Semester 4).
• 09 April 2027: Project Viva Voce for BE/BTech Batch 2024 (Semester 6), MCA Batch 2024 (Semester 4).
• 09, 12, 13 April 2027: Improvement Test / Re-Test for BE/BTech Batch 2024 (Semester 6), BSc Batch 2024 (Semester 4), MSc Batch 2024 (Semester 4).
• 15 April 2027: Commencement of End Semester Examinations (Practical) for BE/BTech Batch 2024 (Semester 6), BSc Batch 2024 (Semester 4), MSc Batch 2024 (Semester 4); Theory Semester Last Working Day for BArch Batch 2025 (Semester 4); Commencement of End Semester Examinations (Phase 2) for MSc Batch 2022 / 2024 (Semester 8 / 6).
• 22, 23, 24 April 2027: CA Test-3 for BE/BTech Batch 2024 (Semester 4).
• 24 April 2027: Semester Last Working Day for BE/BTech Batch 2024 (Semester 4); Additional Project Review for MCA Batch 2024 (Semester 4).
• 26 April 2027: Commencement of End Semester Examinations (Theory) for BE/BTech Batch 2024 (Semester 6), BSc Batch 2024 (Semester 4), MSc Batch 2024 (Semester 4).
• 26, 27, 28 April 2027: Improvement Test / Re-Test for BE/BTech Batch 2024 (Semester 4).
• 29 April 2027: Commencement of End Semester Examinations (Theory) for BE/BTech Batch 2024 (Semester 4).
• 29, 30 April 2027 and 03-05 May 2027: CA Test-2 / Project Review-2 for BSc Batch 2026 (Semester 2), MSc Batch 2026 (Semester 2).

### May 2027
• 05 May 2027: Improvement Test / Re-Test for BSc Batch 2026 (Semester 2), MSc Batch 2026 (Semester 2).
• 06-11 May 2027: CA Test-3 / Project Review-3 for BSc Batch 2026 (Semester 2), MSc Batch 2026 (Semester 2).
• 07 May 2027: Theory Semester Last Working Day for BSc Batch 2026 (Semester 2), MSc Batch 2026 (Semester 2).
• 08 May 2027: Commencement of End Semester Examinations (Practical) for BE/BTech Batch 2024 (Semester 4).
• 18 May 2027: Practical Semester Last Working Day for BSc Batch 2026 (Semester 2), MSc Batch 2026 (Semester 2).
• 29-31 May 2027 and 01-04 June 2027: CA Test-2 / Project Review-2 for BE/BTech Batch 2026 (Semester 2), MCA Batch 2026 (Semester 2), BArch Batch 2026 (Semester 2), MBA Batch 2026 (Semester 2); also BSc Batch 2024 (Semester 6).

### June 2027
• 01 June 2027: Even Semester Reopening (Tentative) for BE/BTech Batch 2024 (Semester 6), BE/BTech Batch 2024 (Semester 4), BSc Batch 2024 (Semester 4), MSc Batch 2024 (Semester 4), MSc Batch 2022 / 2024 (Semester 8 / 6); Commencement of End Semester Examinations for MSc Batch 2022 (Semester 10), BArch Batch 2025 (Semester 4); Additional Project Review for MCA Batch 2024 (Semester 4).
• 04 June 2027: Improvement Test / Re-Test for BE/BTech Batch 2026 (Semester 2), MCA Batch 2026 (Semester 2), BArch Batch 2026 (Semester 2), MBA Batch 2026 (Semester 2); also BSc Batch 2024 (Semester 6).
• 05 June 2027: Final Project Report Submission for MCA Batch 2024 (Semester 4).
• 05-11 June 2027: CA Test-3 / Project Review-3 for BE/BTech Batch 2026 (Semester 2), MCA Batch 2026 (Semester 2), BArch Batch 2026 (Semester 2), MBA Batch 2026 (Semester 2); also BSc Batch 2024 (Semester 6).
• 07 June 2027: Practical Semester Last Working Day for BE/BTech Batch 2026 (Semester 2), MCA Batch 2026 (Semester 2), BArch Batch 2026 (Semester 2), MBA Batch 2026 (Semester 2); Reopening (Option) for ME/MTech Batch 2024 (Semester 4); also BSc Batch 2024 (Semester 6).
• 09 June 2027: Final Project Viva Voce for MCA Batch 2024 (Semester 4).
• 16 June 2027: Commencement of End Semester Examinations for BSc Batch 2026 (Semester 2), MSc Batch 2026 (Semester 2).
• 19 June 2027: Theory Semester Last Working Day for BE/BTech Batch 2026 (Semester 2), MCA Batch 2026 (Semester 2), BArch Batch 2026 (Semester 2), MBA Batch 2026 (Semester 2); Reopening (Option) for ME/MTech Batch 2024 (Semester 4); also BSc Batch 2024 (Semester 6).

### July 2027
• 12 July 2027: Commencement of End Semester Examinations for BE/BTech Batch 2026 (Semester 2), MCA Batch 2026 (Semester 2), BArch Batch 2026 (Semester 2), MBA Batch 2026 (Semester 2); Reopening (Option) for ME/MTech Batch 2024 (Semester 4); also BSc Batch 2024 (Semester 6).
`;

const section8_10 = `
## 8.10 Academic Schedule 2026–27 — Frequently Asked Questions (CAT Dates, Exams, Practicals, Deadlines & Reopening)

Q: When is CAT 3 for Regulation 2024, 5th semester?
A: For BE / BTech Regulation 2024 (R24), Semester 5, CA Test-3 / Project Review - 3 is scheduled on 26, 27, 28 October 2026.

Q: What is the full Continuous Assessment (CAT) schedule for BE/BTech 5th semester (Regulation 2024)?
A: For BE / BTech Semester 5 (R24):
• CA Test-1 / Project Review - 1: 04, 05, 06 August 2026
• CA Test-2 / Project Review - 2: 15, 16, 17 September 2026
• CA Test-3 / Project Review - 3: 26, 27, 28 October 2026
• Re Test: 29, 30, 31 October 2026
• Semester Last Working Day: 28 October 2026
• Practical End Semester Exams: 02, 03, 04 November 2026
• Theory End Semester Exams: 17 November 2026
• Even Semester Reopening (Tentative): 07 December 2026

Q: When is CAT 1, CAT 2, and CAT 3 for BE/BTech 3rd semester (Regulation 2024)?
A: For BE / BTech Semester 3 (R24):
• Commencement of Classes: 13 July 2026
• CA Test-1 / Project Review - 1: 17, 18, 19 August 2026
• CA Test-2 / Project Review - 2: 25, 26, 28 September 2026
• CA Test-3 / Project Review - 3: 04, 05, 06 November 2026
• Re Test: 10, 11, 12 November 2026
• Semester Last Working Day: 06 November 2026
• Practical End Semester Exams: 13, 14 November 2026
• Theory End Semester Exams: 27 November 2026
• Even Semester Reopening (Tentative): 21 December 2026

Q: When is CAT 1, CAT 2, and CAT 3 for BE/BTech 7th semester (Regulation 2022)?
A: For BE / BTech Semester 7 (R22):
• Commencement of Classes: 01 June 2026
• CA Test-1 / Project Review - 1: 08, 09, 10 July 2026
• CA Test-2 / Project Review - 2: 17, 18, 19 August 2026
• CA Test-3 / Project Review - 3: 07, 08, 09 October 2026
• Re Test: 12, 13, 14 October 2026
• Semester Last Working Day: 10 October 2026
• Theory End Semester Exams: 02 November 2026
• Even Semester Reopening (Tentative): 25 November 2026

Q: What are the project deadlines and viva voce dates for BE/BTech 7th semester students?
A: For BE / BTech Semester 7 Project Work:
• Project Review 1: 18 July 2026
• Project Review 2: 29 August 2026
• Project Review 3: 10 October 2026
• Last Date to Submit Project Report: 10 October 2026
• Project Viva Voce Examinations: 13, 14 October 2026

Q: When does first-year BE/BTech (Semester 1, Regulation 2026) start, and what is the exam schedule?
A: For first-year BE / BTech Semester 1 (R26):
• Induction Program: 24.08.2026 - 03.09.2026
• Commencement of Classes: 07 September 2026
• CA Test-1 / Project Review - 1: 24-29 October 2026
• CA Test-2 / Project Review - 2: 24-31 December 2026
• CA Test-3: Not Applicable
• Improvement Test / Re Test: 02-06 November 2026 / 04-08 January 2027
• Semester Last Working Day: 31 December 2026
• Practical End Semester Exams: 04 January 2027
• Theory End Semester Exams: 23 January 2027
• Even Semester Reopening (Tentative): 08 February 2027

Q: What is the schedule for ME/MTech 3rd semester (Regulation 2024)?
A: For ME / MTech Semester 3 (R24):
• Commencement of Classes: 22 June 2026
• CA Test-1 / Project Review - 1: 29, 30 July 2026
• CA Test-2 / Project Review - 2: 08, 09 September 2026
• CA Test-3 / Project Review - 3: 15, 16 October 2026
• Re Test: 21, 22 October 2026
• Semester Last Working Day: 17 October 2026
• Theory End Semester Exams: 02 November 2026
• Even Semester Reopening (Tentative): 16 November 2026
• Project Review 1: 01 August 2026
• Project Review 2: 12 September 2026
• Project Review 3: 17 October 2026
• Last Date to Submit Project Report: 23 October 2026
• Project Viva Voce: 24 October 2026

Q: When is CAT 1, CAT 2, and CAT 3 for final-year BE/BTech 8th semester (Batch 2022 Even Semester)?
A: For BE / BTech Batch 2022 Semester 8:
• Commencement of Classes: 25 November 2026
• CA Test-1 / Project Review-1: 14 December 2026 (Project Review: 09 January 2027)
• CA Test-2 / Project Review-2: 05 January 2027 (Project Review: 20 February 2027)
• CA Test-3 / Project Review-3: 25 January 2027 (Project Review: 13 March 2027)
• Improvement Test / Re-Test: 29, 30 January 2027
• Last Date to Submit Project Report: 20 March 2027
• Semester Last Working Day: 20 March 2027
• Project Viva Voce Examinations: 23 March 2027
• End Semester Examinations: 01 April 2027

Q: When is CAT 1, CAT 2, and CAT 3 for BE/BTech 6th semester (Batch 2024 Even Semester)?
A: For BE / BTech Batch 2024 Semester 6:
• Commencement of Classes: 07 December 2026
• CA Test-1 / Project Review-1: 18, 19, 20 January 2027 (Project Review: 23 January 2027)
• CA Test-2 / Project Review-2: 24, 25, 26 February 2027 (Project Review: 20 February 2027)
• CA Test-3 / Project Review-3: 05, 06, 08 April 2027 (Project Review: 03 April 2027)
• Improvement Test / Re-Test: 09, 12, 13 April 2027
• Last Date to Submit Project Report: 03 April 2027
• Semester Last Working Day: 08 April 2027
• Project Viva Voce Examinations: 09 April 2027
• End Semester Examinations: 26 April 2027 (Theory) / 15 April 2027 (Practical)
• Even Semester Reopening (Tentative): 01 June 2027

Q: What is scheduled on 26 October 2026?
A: On 26 October 2026:
• CA Test-3 / Project Review - 3 for BE/BTech Semester 5 (R24) (conducted across 26, 27, 28 October 2026).
• CA Test-1 / Project Review - 1 for first-year programmes: BE/BTech Sem 1 (R26), BArch Sem 1 (R26), ME/MTech Sem 1 (R26), MBA Sem 1 (R26), MCA Sem 1 (R26) (window 24-29 October 2026).
• Practical End Semester Examinations for MSc Semester 3 (R24) (24, 26 October 2026) and BSc Sem 3 / MCA Sem 3 (24, 26, 27 October 2026).

Q: What is scheduled on 10 October 2026?
A: On 10 October 2026:
• Semester Last Working Day for BE/BTech Semester 7 (R22), BSc Semester 5 (R24), MSc Semester 7 (R22).
• CA Test-3 / Project Review - 3 for MSc Semester 7 (R22).
• Project Review 3 and Last date to Submit Project Report for BE/BTech Semester 7, BSc Semester 5, MSc Semester 7.

Q: What is scheduled on 02 November 2026?
A: On 02 November 2026:
• Commencement of End Semester Theory Examinations for: BE/BTech Semester 7 (R22), ME/MTech Semester 3 (R24), BSc Semester 5 (R24), MSc Semester 9 (R22), MSc Semester 5 (R24), BArch Semester 3 (R25).
• Commencement of Practical Examinations for BE/BTech Semester 5 (R24) (02, 03, 04 November 2026).
• Improvement Test / Re Test (Option 1) for BE/BTech Semester 1 (R26) (02-06 November 2026).
`;

const fullAddition = [section8_6, section8_7, section8_8, section8_9, section8_10].join('\n');
console.log(`Total addition text length: ${fullAddition.length} characters`);

// Let's verify that EVERY piece of calendar information is preserved
const essentialPhrases = [
  'Ref: KEC/COE/2026-27/ODD/AS/01',
  'Ref: KEC/COE/2026-27/ODD/AS/02',
  'Ref: KEC/COE/2026-27/EVEN/AS/01',
  '26, 27, 28 Oct 2026',
  '08, 09, 10 July 2026',
  '17, 18, 19 Aug 2026',
  '07, 08, 09 Oct 2026',
  '12, 13, 14 Oct 2026',
  '02 Nov 2026',
  '25 Nov 2026',
  '18 July 2026',
  '29 Aug 2026',
  '10 Oct 2026',
  '13, 14 Oct 2026',
  '29 June 2026',
  '04, 05, 06 Aug 2026',
  '15, 16, 17 Sep 2026',
  '29, 30, 31 Oct 2026',
  '28 Oct 2026',
  '02, 03, 04 Nov 2026',
  '17 Nov 2026',
  '07 Dec 2026',
  '13 July 2026',
  '25, 26, 28 Sep 2026',
  '04, 05, 06 Nov 2026',
  '10, 11, 12 Nov 2026',
  '06 Nov 2026',
  '13, 14 Nov 2026',
  '27 Nov 2026',
  '21 Dec 2026',
  '22 June 2026',
  '29, 30 July 2026',
  '08, 09 Sep 2026',
  '15, 16 Oct 2026',
  '21, 22 Oct 2026',
  '17 Oct 2026',
  '16 Nov 2026',
  '01 Aug 2026',
  '12 Sep 2026',
  '23 Oct 2026',
  '24 Oct 2026',
  '28, 29, 30 July 2026',
  '07, 08, 09 Sep 2026',
  '15, 16, 17 Oct 2026',
  '21, 22, 23 Oct 2026',
  '24, 26, 27 Oct 2026',
  '11 Nov 2026',
  '09 Oct 2026',
  '24, 26 Oct 2026',
  '23, 24 Oct 2026',
  '18.06.2026 - 24.07.2026',
  '27 July 2026',
  '18-23 Sep 2026',
  '17-21 Nov 2026',
  '23-27 Nov 2026',
  '21 Nov 2026',
  '23 Nov 2026',
  '07 Dec 2026',
  '04 Jan 2027',
  '24.08.2026 - 03.09.2026',
  '07 Sep 2026',
  '24-29 Oct 2026',
  '24-31 Dec 2026',
  '02-06 Nov 2026 / 04-08 Jan 2027',
  '31 Dec 2026',
  '23 Jan 2027',
  '08 Feb 2027',
  '31 Aug 2026',
  '19-24 Dec 2026',
  '28-31 Dec 2026',
  '24 Dec 2026',
  '28 Dec 2026',
  '19 Jan 2027',
  '14 Dec 2026',
  '09 Jan 2027',
  '05 Jan 2027',
  '20 Feb 2027',
  '25 Jan 2027',
  '13 Mar 2027',
  '29, 30 Jan 2027',
  '20 Mar 2027',
  '23 Mar 2027',
  '01 Apr 2027',
  '18, 19, 20 Jan 2027',
  '23 Jan 2027',
  '24, 25, 26 Feb 2027',
  '05, 06, 08 Apr 2027',
  '03 Apr 2027',
  '09, 12, 13 Apr 2027',
  '08 Apr 2027',
  '09 Apr 2027',
  '26 Apr 2027',
  '15 Apr 2027',
  '01 June 2027',
  '01, 02, 03 Feb 2027',
  '11, 12, 13 Mar 2027',
  '22, 23, 24 Apr 2027',
  '26, 27, 28 Apr 2027',
  '24 Apr 2027',
  '29 Apr 2027',
  '08 May 2027',
  '03-12 Apr 2027',
  '29-31 May 2027',
  '01-04 June 2027',
  '05-11 June 2027',
  '04 June 2027',
  '19 June 2027',
  '07 June 2027',
  '12 July 2027',
  '16 Nov 2026',
  '06 Feb 2027',
  '16 Mar 2027',
  '17 Mar 2027',
  '18, 19 Mar 2027',
  '22 Mar 2027',
  '31 Dec 2026',
  '10 Feb 2027',
  '01-05 Mar 2027',
  '29, 30 Apr 2027',
  '03-05 May 2027',
  '06-11 May 2027',
  '05 May 2027',
  '07 May 2027',
  '18 May 2027',
  '16 June 2027',
  '04, 05, 06 Jan 2027',
  '01, 02, 03 Apr 2027',
  '23 Mar 2027',
  '31 Mar 2027',
  '05 Apr 2027',
  '18 Mar 2027',
  '05 June 2027',
  '09 June 2027',
  '01-08 Apr 2027',
  '27, 28, 29 Jan 2027',
  '29, 30, 31 Mar 2027',
  '01, 02, 03 Apr 2027',
  '31 Mar 2027',
  '15 Apr 2027',
  '05 Apr 2027',
  'Controller of Examinations',
  'Principal',
];

for (const phrase of essentialPhrases) {
  if (!fullAddition.includes(phrase)) {
    console.error(`MISSING PHRASE in addition: "${phrase}"`);
    process.exit(1);
  }
}
console.log(`All ${essentialPhrases.length} essential calendar phrases verified in new text!`);

// Append to college-info-2.txt
const updatedCollegeInfo2 = raw2.trimEnd() + '\n\n' + fullAddition.trim() + '\n';
fs.writeFileSync(collegeInfo2Path, updatedCollegeInfo2, 'utf-8');
console.log(`Successfully updated college-info-2.txt. New length: ${updatedCollegeInfo2.length} characters.`);
