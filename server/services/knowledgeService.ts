import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { config } from '../config.js';

export interface DepartmentDef {
  id: string;
  name: string;
  shortName: string;
  regex: RegExp;
}

export const VERIFIED_DEPARTMENTS: DepartmentDef[] = [
  {
    id: 'it',
    name: 'Information Technology',
    shortName: 'IT',
    regex: /\b(information\s+technology|\bit\b|infomation\s+technology)\b/i,
  },
  {
    id: 'eie',
    name: 'Electronics and Instrumentation Engineering',
    shortName: 'EIE',
    regex: /\b(electronics\s+(and|&)\s+instrumentation|\beie\b|instrumentation\s+engineering|instrumentaion|instumentation)\b/i,
  },
  {
    id: 'ece',
    name: 'Electronics and Communication Engineering',
    shortName: 'ECE',
    regex: /\b(electronics\s+(and|&)\s+communication|\bece\b)\b/i,
  },
  {
    id: 'eee',
    name: 'Electrical and Electronics Engineering',
    shortName: 'EEE',
    regex: /\b(electrical\s+(and|&)\s+electronics|\beee\b)\b/i,
  },
  {
    id: 'csd',
    name: 'Computer Science and Design',
    shortName: 'CSD',
    regex: /\b(computer\s+science\s+(and|&)\s+design|\bcsd\b)\b/i,
  },
  {
    id: 'cse',
    name: 'Computer Science and Engineering',
    shortName: 'CSE',
    regex: /\b(computer\s+science\s+(and|&)\s+engineering|computer\s+science|\bcse\b)\b/i,
  },
  {
    id: 'aiml',
    name: 'Artificial Intelligence and Machine Learning',
    shortName: 'AI&ML',
    regex: /\b(artificial\s+intelligence\s+(and|&)\s+machine\s+learning|ai\s*(&|-)?\s*ml|aiml)\b/i,
  },
  {
    id: 'aids',
    name: 'Artificial Intelligence and Data Science',
    shortName: 'AI&DS',
    regex: /\b(artificial\s+intelligence\s+(and|&)\s+data\s+science|ai\s*(&|-)?\s*ds|aids|data\s+science)\b/i,
  },
  {
    id: 'mechatronics',
    name: 'Mechatronics Engineering',
    shortName: 'Mechatronics',
    regex: /\b(mechatronics\s+engineering|mechatronics|mtrs|mts)\b/i,
  },
  {
    id: 'mech',
    name: 'Mechanical Engineering',
    shortName: 'Mechanical',
    regex: /\b(mechanical\s+engineering|mechanical|\bmech\b|machanical|mechanocal|mecanical)\b/i,
  },
  {
    id: 'auto',
    name: 'Automobile Engineering',
    shortName: 'Automobile',
    regex: /\b(automobile\s+engineering|automobile|\bauto\b|automoblie|autombile|automoble)\b/i,
  },
  {
    id: 'civil',
    name: 'Civil Engineering',
    shortName: 'Civil',
    regex: /\b(civil\s+engineering|civil)\b/i,
  },
  {
    id: 'chemical',
    name: 'Chemical Engineering',
    shortName: 'Chemical',
    regex: /\b(chemical\s+engineering|chemical|\bchem\b|chemcial)\b/i,
  },
  {
    id: 'food',
    name: 'Food Technology',
    shortName: 'Food Tech',
    regex: /\b(food\s+technology|food\s+tech|\bft\b)\b/i,
  },
  {
    id: 'mca',
    name: 'Master of Computer Applications',
    shortName: 'MCA',
    regex: /\b(master\s+of\s+computer\s+applications|computer\s+applications|\bmca\b)\b/i,
  },
  {
    id: 'mba',
    name: 'Master of Business Administration',
    shortName: 'MBA',
    regex: /\b(master\s+of\s+business\s+administration|\bmba\b|management\s+studies)\b/i,
  },
  {
    id: 'maths',
    name: 'Mathematics',
    shortName: 'Mathematics',
    regex: /\b(mathematics|maths)\b/i,
  },
  {
    id: 'physics',
    name: 'Physics',
    shortName: 'Physics',
    regex: /\bphysics\b/i,
  },
  {
    id: 'chemistry',
    name: 'Chemistry',
    shortName: 'Chemistry',
    regex: /\bchemistry\b/i,
  },
  {
    id: 'english',
    name: 'English',
    shortName: 'English',
    regex: /\benglish\b/i,
  },
];

export interface KnowledgeChunk {
  id: string;
  documentTitle: string;
  mainHeading: string;
  subHeading?: string;
  headingPath: string[];
  departmentId?: string;
  departmentName?: string;
  category?: string;
  sectionTitle: string;
  content: string;
  urls: string[];
  lineNumber: number;
}

export interface KnowledgeState {
  filePath: string;
  lastModified: number;
  hash: string;
  rawText: string;
  chunks: KnowledgeChunk[];
  sections: string[];
  isEmpty: boolean;
}

let cachedKnowledge: KnowledgeState | null = null;

export function resolveDepartmentFromQuery(query: string): DepartmentDef | null {
  for (const dept of VERIFIED_DEPARTMENTS) {
    if (dept.regex.test(query)) {
      return dept;
    }
  }
  return null;
}

export function resolveCategoryFromQuery(query: string): string | null {
  const q = query.toLowerCase();
  if (
    /\b(bus|buses|transport|transportation|route|routes|shuttle|shuttles|vehicle|two-wheelers?|helmets?|parking|bus fee|van|sakthivel|பேருந்து|பஸ்|வழித்தடம்|perunthu|tranport|transpot)\b/i.test(
      q
    )
  ) {
    return 'transport';
  }
  if (
    /\b(working hours|college timing|college timings|class timing|class timings|class hours|office hours|library hours|college time|schedule|operating hours|வேலை நேரம்|கல்லூரி நேரம்|neram|timimg|timimgs)\b/i.test(
      q
    )
  ) {
    return 'working_hours';
  }
  if (
    /\b(scholarship|scholarships|concession|concessions|fee waiver|waiver|financial aid|7\.5%|first graduate|first generation|உதவித்தொகை|முதல் பட்டதாரி|அரசு பள்ளி|uthavithogai|mudhal pattadhari|scolarship|scholorship)\b/i.test(
      q
    )
  ) {
    return 'scholarship';
  }
  if (
    /\b(staff|faculty|faculties|faculity|faculti|teacher|teachers|professor|professors|profesor|assistant professor|associate professor|hod|head of department|who teaches|members|directory|ஆசிரியர்கள்|பேராசிரியர்|துறைத்தலைவர்|துறை தலைவர்|yaaru|yaru)\b/i.test(
      q
    )
  ) {
    return 'faculty';
  }
  if (
    /\b(placement|placements|salary|salaries|package|packages|lpa|ctc|placed|recruit|recruiter|highest offer|highest salary|average salary|வேலைவாய்ப்பு|சம்பளம்|sambalam|velai|placment|placemnt)\b/i.test(
      q
    )
  ) {
    return 'placement';
  }
  if (/\b(cutoff|cut-off|cutoffs|cut-offs|marks|கட் ஆஃப்|மதிப்பெண்)\b/i.test(q)) {
    return 'cutoff';
  }
  if (/\b(rank|ranks|ranking|closing rank|தரவரிசை)\b/i.test(q)) {
    return 'rank';
  }
  if (/\b(intake|seats|seat|how many seats|capacity|இடங்கள்)\b/i.test(q)) {
    return 'intake';
  }
  if (/\b(hostel|hostels|hostal|hosetl|mess|food|room|rooms|warden|wardens|விடுதி|காப்பாளர்|viduthi|thangum)\b/i.test(q)) {
    return 'hostel';
  }
  if (/\b(fee|fees|cost|tuition fee|hostel fee|கட்டணம்|kattanam|evalo|evvalo|evvalavu)\b/i.test(q)) {
    return 'fees';
  }
  if (/\b(admission|admissions|counselling|counseling|counceling|tnea|eligibility|lateral|quota|சேர்க்கை|serkkai|admision|addmission)\b/i.test(
    q
  )
  ) {
    return 'admission';
  }
  if (/\b(sport|sports|gym|ground|stadium|physical education|badminton|football|cricket|விளையாட்டு|திடல்|vilayattu)\b/i.test(
    q
  )
  ) {
    return 'sports';
  }
  if (/\b(course|courses|programme|programmes|degree|curriculum|syllabus|autonomous|regulation|பாடம்|பாடத்திட்டம்)\b/i.test(
    q
  )
  ) {
    return 'academics';
  }
  return null;
}

function extractUrls(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s)\]>"']+)/gi;
  const matches = text.match(urlRegex);
  return matches ? Array.from(new Set(matches)) : [];
}

/**
 * Parses raw text into highly structured knowledge chunks with strict document hierarchy,
 * heading paths, department isolation, and table header retention.
 */
function parseKnowledgeText(rawText: string): { chunks: KnowledgeChunk[]; sections: string[] } {
  if (!rawText.trim()) {
    return { chunks: [], sections: [] };
  }

  const lines = rawText.split(/\r?\n/);
  const chunks: KnowledgeChunk[] = [];
  const sectionsSet = new Set<string>();

  const docTitle = 'Kongu Engineering College (KEC) Official Knowledge Base';

  function addChunk(chunk: Omit<KnowledgeChunk, 'id'>) {
    sectionsSet.add(chunk.sectionTitle);
    chunks.push({
      ...chunk,
      id: `chunk_${chunks.length + 1}`,
    });
  }

  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();

    // 1. HOSTEL ACCOMMODATION, WARDENS, RULES & FEES
    if (
      line.startsWith('SECTION 1:') ||
      line === 'Hostel : --- done' ||
      line === 'KEC Hostel Staff Details'
    ) {
      const startLine = i + 1;
      const hostelLines: string[] = [];
      i++;
      while (
        i < lines.length &&
        !lines[i].trim().startsWith('SECTION 2:') &&
        !lines[i].trim().startsWith('Engineering & Technology Departments')
      ) {
        const cur = lines[i].trim();
        if (cur.startsWith('## 1.1') || cur.startsWith('## 1.2') || cur.startsWith('## 1.3')) {
          if (hostelLines.length > 0) {
            const content = hostelLines.join('\n').trim();
            const subTitle = hostelLines[0].replace(/^##\s*\d+\.\d+\s*/, '').trim();
            addChunk({
              documentTitle: docTitle,
              mainHeading: 'Hostel Information',
              subHeading: subTitle,
              headingPath: ['Hostels', subTitle],
              departmentId: 'general',
              category: subTitle.includes('Staff') || subTitle.includes('Warden') ? 'hostel_staff' : 'hostel',
              sectionTitle: `Hostel Information — ${subTitle}`,
              content,
              urls: extractUrls(content),
              lineNumber: startLine,
            });
            hostelLines.length = 0;
          }
        }
        if (cur && !cur.startsWith('=')) hostelLines.push(cur);
        i++;
      }
      if (hostelLines.length > 0) {
        const content = hostelLines.join('\n').trim();
        addChunk({
          documentTitle: docTitle,
          mainHeading: 'Hostel Information',
          subHeading: 'Accommodation & Regulations',
          headingPath: ['Hostels', 'Accommodation & Regulations'],
          departmentId: 'general',
          category: 'hostel',
          sectionTitle: 'Hostel Information — Accommodation Details & Fees',
          content,
          urls: extractUrls(content),
          lineNumber: startLine,
        });
      }
      continue;
    }

    // 2. CAMPUS LEADERSHIP & DEPARTMENT HEADS (HODs)
    if (
      line.startsWith('SECTION 2:') ||
      line === 'Engineering & Technology Departments' ||
      line === 'Computer Applications & Technology (UG / PG)' ||
      line === 'Science & Humanities Departments' ||
      line === 'Central Campus Administration Contacts'
    ) {
      const startLine = i + 1;
      const hodLines: string[] = [];
      const secName = line.startsWith('SECTION 2:') ? 'Campus Leadership & HOD Directory' : line;
      i++;
      while (
        i < lines.length &&
        !lines[i].trim().startsWith('SECTION 3:') &&
        !lines[i].trim().startsWith('All faculty name') &&
        !lines[i].trim().startsWith('////')
      ) {
        const cur = lines[i].trim();
        if (cur.startsWith('## 2.2')) {
          if (hodLines.length > 0) {
            const content = hodLines.join('\n').trim();
            addChunk({
              documentTitle: docTitle,
              mainHeading: 'Campus Leadership & Department Heads',
              subHeading: 'HOD & Administration Directory',
              headingPath: ['Administration', 'Department Heads (HODs)'],
              departmentId: 'general',
              category: 'hod',
              sectionTitle: 'Leadership & HOD Directory',
              content,
              urls: extractUrls(content),
              lineNumber: startLine,
            });
            hodLines.length = 0;
          }
        }
        if (cur && !cur.startsWith('=') && !cur.startsWith('---')) hodLines.push(cur);
        i++;
      }
      if (hodLines.length > 0) {
        const content = hodLines.join('\n').trim();
        addChunk({
          documentTitle: docTitle,
          mainHeading: 'Campus Leadership & Department Heads',
          subHeading: secName,
          headingPath: ['Administration', 'Department Heads (HODs)', secName],
          departmentId: 'general',
          category: 'hod',
          sectionTitle: `Leadership & HOD Directory — ${secName}`,
          content,
          urls: extractUrls(content),
          lineNumber: startLine,
        });
      }
      continue;
    }

    // 3. FACULTY DIRECTORY (TEACHING STAFF BY DEPARTMENT)
    if (
      line.startsWith('SECTION 3:') ||
      line.includes('All faculty name :') ||
      line.startsWith('1. Computer Science and Engineering (CSE)')
    ) {
      if (line.startsWith('SECTION 3:') || line.includes('All faculty name :')) i++;

      while (
        i < lines.length &&
        !lines[i].trim().startsWith('SECTION 4:') &&
        !lines[i].trim().startsWith('Department summary') &&
        !lines[i].trim().startsWith('physical department') &&
        !lines[i].trim().startsWith('## 3.1')
      ) {
        const deptLine = lines[i].trim();
        const deptMatch = deptLine.match(/^(\d+)\.\s+(.+)$/);

        if (deptMatch) {
          const deptRawName = deptMatch[2].trim();
          const deptStartLine = i + 1;
          const matchedDept = resolveDepartmentFromQuery(deptRawName) || {
            id: 'general',
            name: deptRawName,
            shortName: deptRawName,
            regex: new RegExp(deptRawName, 'i'),
          };

          const facultyRows: string[] = [];
          i++;

          while (
            i < lines.length &&
            !lines[i].trim().match(/^(\d+)\.\s+[A-Za-z]/) &&
            !lines[i].trim().startsWith('SECTION 4:') &&
            !lines[i].trim().startsWith('Department summary') &&
            !lines[i].trim().startsWith('physical department') &&
            !lines[i].trim().startsWith('## 3.1')
          ) {
            const row = lines[i].trim();
            if (row && !row.startsWith('#\tFaculty Name')) {
              facultyRows.push(row);
            }
            i++;
          }

          const chunkContent = [
            `Document: Faculty Directory`,
            `Main Heading: Faculty Details`,
            `Department: ${matchedDept.name} (${matchedDept.shortName})`,
            `Subheading: Teaching Staff / Faculty Members`,
            `Total Listed Entries: ${facultyRows.length}`,
            ``,
            `Table: S.No | Faculty Name | Designation | Qualification`,
            `------------------------------------------------------------`,
            ...facultyRows.map((r) => r.replace(/\t/g, ' | ')),
          ].join('\n');

          addChunk({
            documentTitle: docTitle,
            mainHeading: 'Faculty Directory',
            subHeading: `${matchedDept.name} (${matchedDept.shortName})`,
            headingPath: ['Faculty Directory', matchedDept.name, 'Teaching Staff'],
            departmentId: matchedDept.id,
            departmentName: matchedDept.name,
            category: 'faculty',
            sectionTitle: `Faculty Directory — ${matchedDept.name} (${matchedDept.shortName})`,
            content: chunkContent,
            urls: [],
            lineNumber: deptStartLine,
          });
          continue;
        }
        i++;
      }

      if (i < lines.length && lines[i].trim().startsWith('Department summary')) {
        const sumLines: string[] = ['Department Summary — Listed Faculty Counts', '------------------------------------------'];
        const startLine = i + 1;
        i++;
        while (
          i < lines.length &&
          !lines[i].trim().startsWith('SECTION 4:') &&
          !lines[i].trim().startsWith('## 3.1') &&
          !lines[i].trim().startsWith('physical department')
        ) {
          if (lines[i].trim()) sumLines.push(lines[i].trim());
          i++;
        }
        const content = sumLines.join('\n');
        addChunk({
          documentTitle: docTitle,
          mainHeading: 'Faculty Directory',
          subHeading: 'Department Faculty Summary',
          headingPath: ['Faculty Directory', 'Summary Counts'],
          departmentId: 'general',
          category: 'faculty_summary',
          sectionTitle: 'Faculty Directory — Department-wise Faculty Summary',
          content,
          urls: extractUrls(content),
          lineNumber: startLine,
        });
      }

      if (i < lines.length && lines[i].trim().startsWith('## 3.1')) {
        const faqLines: string[] = [];
        const startLine = i + 1;
        i++;
        while (
          i < lines.length &&
          !lines[i].trim().startsWith('SECTION 4:') &&
          !lines[i].trim().startsWith('physical department')
        ) {
          if (lines[i].trim() && !lines[i].trim().startsWith('=')) faqLines.push(lines[i].trim());
          i++;
        }
        const content = faqLines.join('\n');
        addChunk({
          documentTitle: docTitle,
          mainHeading: 'Faculty Directory',
          subHeading: 'Faculty Directory FAQs',
          headingPath: ['Faculty Directory', 'FAQs'],
          departmentId: 'general',
          category: 'faculty',
          sectionTitle: 'Faculty Directory — Frequently Asked Questions',
          content,
          urls: extractUrls(content),
          lineNumber: startLine,
        });
      }
      continue;
    }

    // 4. PLACEMENT INFORMATION (STATISTICS, SALARIES, TRAINING & RECRUITERS)
    if (
      line.startsWith('SECTION 4:') ||
      line.startsWith('Placement Information :') ||
      (line.startsWith('## ') && line.includes('Placement'))
    ) {
      const startLine = i + 1;
      i++;
      while (
        i < lines.length &&
        !lines[i].trim().startsWith('SECTION 5:') &&
        !lines[i].trim().startsWith('physical department:')
      ) {
        const curLine = lines[i].trim();
        if (curLine.startsWith('## ')) {
          const subHeading = curLine.replace(/^##\s+/, '').trim();
          const startSubLine = i + 1;
          const pLines: string[] = [subHeading];
          i++;
          while (
            i < lines.length &&
            !lines[i].trim().startsWith('## ') &&
            !lines[i].trim().startsWith('SECTION 5:') &&
            !lines[i].trim().startsWith('physical department:')
          ) {
            const row = lines[i].trim();
            if (row && !row.startsWith('=')) pLines.push(row);
            i++;
          }
          const fullSectionText = pLines.join('\n');

          // If this is Section 6 (Department Salary Information), break it down per department!
          if (subHeading.includes('Placement Salary Information by Department')) {
            const deptBlocks = fullSectionText.split(/(?=\*\*B\.[A-Za-z.]+\s+|\*\*Master of\s+)/);
            for (const block of deptBlocks) {
              const bTrimmed = block.trim();
              if (!bTrimmed) continue;
              const deptMatch = resolveDepartmentFromQuery(bTrimmed);
              const deptId = deptMatch ? deptMatch.id : 'general';
              const deptName = deptMatch ? deptMatch.name : 'All Departments';

              addChunk({
                documentTitle: docTitle,
                mainHeading: 'Placement Statistics (2024–2025)',
                subHeading: `Department Placement — ${deptName}`,
                headingPath: ['Placement Information', 'Department Salary Information', deptName],
                departmentId: deptId,
                departmentName: deptName,
                category: 'placement',
                sectionTitle: `Placement Salary Statistics — ${deptName}`,
                content: `Document: Placement Statistics\nDepartment: ${deptName}\nAcademic Year: 2024–2025\n\n${bTrimmed}`,
                urls: extractUrls(bTrimmed),
                lineNumber: startSubLine,
              });
            }
          } else {
            let deptId = 'general';
            if (subHeading.includes('Computer Science and Information Technology')) {
              deptId = 'cse';
            } else if (subHeading.includes('Computer Science and Design')) {
              deptId = 'csd';
            }

            addChunk({
              documentTitle: docTitle,
              mainHeading: 'Placement Information',
              subHeading,
              headingPath: ['Placement Information', subHeading],
              departmentId: deptId,
              category: 'placement',
              sectionTitle: `Placement Information — ${subHeading}`,
              content: fullSectionText,
              urls: extractUrls(fullSectionText),
              lineNumber: startSubLine,
            });
          }
          continue;
        }
        i++;
      }
      continue;
    }

    // 5. PHYSICAL EDUCATION & SPORTS
    if (
      line.startsWith('SECTION 5:') ||
      line.startsWith('physical department:') ||
      line.startsWith('A1. DEPARTMENT OVERVIEW')
    ) {
      const startLine = i + 1;
      let sportsSec = line.startsWith('SECTION 5:') ? 'Physical Education Overview' : line;
      const sportsLines: string[] = [sportsSec];
      i++;
      while (
        i < lines.length &&
        !lines[i].trim().startsWith('SECTION 6:') &&
        !lines[i].trim().startsWith('# Kongu Engineering College (KEC) — Structured Knowledge Base')
      ) {
        const cur = lines[i].trim();
        if (cur.match(/^[A-Z0-9]{1,3}\.\s+[A-Z\s/&()-]{3,50}/) || cur.startsWith('## 5.')) {
          if (sportsLines.length > 0) {
            const content = sportsLines.join('\n').trim();
            if (content.length > 50) {
              addChunk({
                documentTitle: docTitle,
                mainHeading: 'Physical Education & Sports',
                subHeading: sportsSec,
                headingPath: ['Physical Education', sportsSec],
                departmentId: 'general',
                category: 'sports',
                sectionTitle: `Physical Education — ${sportsSec}`,
                content,
                urls: extractUrls(content),
                lineNumber: startLine,
              });
            }
          }
          sportsSec = cur;
          sportsLines.length = 0;
          sportsLines.push(cur);
          i++;
          continue;
        }
        if (cur && !cur.startsWith('=')) sportsLines.push(cur);
        i++;
      }
      if (sportsLines.length > 0) {
        const content = sportsLines.join('\n').trim();
        if (content.length > 50) {
          addChunk({
            documentTitle: docTitle,
            mainHeading: 'Physical Education & Sports',
            subHeading: sportsSec,
            headingPath: ['Physical Education', sportsSec],
            departmentId: 'general',
            category: 'sports',
            sectionTitle: `Physical Education — ${sportsSec}`,
            content,
            urls: extractUrls(content),
            lineNumber: startLine,
          });
        }
      }
      continue;
    }

    // 6. INSTITUTIONAL KNOWLEDGE BASE (17 STRUCTURED TOPICS)
    if (
      line.startsWith('SECTION 6:') ||
      line.startsWith('# Kongu Engineering College (KEC) — Structured Knowledge Base')
    ) {
      const startLine = i + 1;
      let secTitle = line.startsWith('SECTION 6:') ? 'Institutional Overview' : line.replace(/^#\s*/, '').trim();
      const secLines: string[] = [secTitle];
      i++;
      while (
        i < lines.length &&
        !lines[i].trim().startsWith('SECTION 7:') &&
        !lines[i].trim().startsWith('transport:')
      ) {
        const cur = lines[i].trim();
        if (cur.match(/^[0-9]{1,2}\.\s+[A-Z\s,/&()-]{3,60}$/)) {
          const content = secLines.join('\n').trim();
          if (content.length > 50) {
            let cat = 'overview';
            if (secTitle.includes('PROGRAMMES') || secTitle.includes('INTAKE')) cat = 'intake';
            else if (secTitle.includes('ADMISSION') || secTitle.includes('COUNSELLING')) cat = 'admission';
            else if (secTitle.includes('CUT-OFF') || secTitle.includes('RANKS')) cat = 'cutoff';
            else if (secTitle.includes('FEES') || secTitle.includes('SCHOLARSHIPS')) cat = 'fees';
            else if (secTitle.includes('PLACEMENTS')) cat = 'placement_general';
            else if (secTitle.includes('WORKING HOURS')) cat = 'working_hours';

            addChunk({
              documentTitle: docTitle,
              mainHeading: 'Institutional Knowledge Base',
              subHeading: secTitle,
              headingPath: ['Structured Knowledge Base', secTitle],
              departmentId: 'general',
              category: cat,
              sectionTitle: `KEC Knowledge — ${secTitle}`,
              content,
              urls: extractUrls(content),
              lineNumber: startLine,
            });
          }
          secTitle = cur;
          secLines.length = 0;
          secLines.push(cur);
          i++;
          continue;
        }
        if (cur && !cur.startsWith('=')) secLines.push(cur);
        i++;
      }
      if (secLines.length > 0) {
        const content = secLines.join('\n').trim();
        if (content.length > 50) {
          addChunk({
            documentTitle: docTitle,
            mainHeading: 'Institutional Knowledge Base',
            subHeading: secTitle,
            headingPath: ['Structured Knowledge Base', secTitle],
            departmentId: 'general',
            category: 'overview',
            sectionTitle: `KEC Knowledge — ${secTitle}`,
            content,
            urls: extractUrls(content),
            lineNumber: startLine,
          });
        }
      }
      continue;
    }

    // 7. TRANSPORT NETWORK, BUS ROUTES & TIMINGS
    if (line.startsWith('SECTION 7:') || line.startsWith('transport:')) {
      const startLine = i + 1;
      const transLines: string[] = [];
      i++;
      while (
        i < lines.length &&
        !lines[i].trim().startsWith('SECTION 8:') &&
        !lines[i].trim().startsWith('Kongu Engineering College (KEC) is a leading autonomous')
      ) {
        const cur = lines[i].trim();
        if (cur.startsWith('## 7.1')) {
          if (transLines.length > 0) {
            const content = transLines.join('\n').trim();
            addChunk({
              documentTitle: docTitle,
              mainHeading: 'Transport Network & Bus Services',
              subHeading: 'Transport Fleet, Routes & Bus Timings',
              headingPath: ['Transport', 'Bus Fleet & Timings'],
              departmentId: 'general',
              category: 'transport',
              sectionTitle: 'Transport — Fleet, Bus Timings, Routes & Fares',
              content,
              urls: extractUrls(content),
              lineNumber: startLine,
            });
            transLines.length = 0;
          }
        }
        if (cur && !cur.startsWith('=')) transLines.push(cur);
        i++;
      }
      if (transLines.length > 0) {
        const content = transLines.join('\n').trim();
        addChunk({
          documentTitle: docTitle,
          mainHeading: 'Transport Network & Bus Services',
          subHeading: 'Transport FAQs & Regulations',
          headingPath: ['Transport', 'Transport FAQs'],
          departmentId: 'general',
          category: 'transport',
          sectionTitle: 'Transport — Frequently Asked Questions & Vehicle Regulations',
          content,
          urls: extractUrls(content),
          lineNumber: startLine,
        });
      }
      continue;
    }

    // 8. ACADEMIC PROGRAMMES, AUTONOMOUS REGULATIONS, ADMISSIONS, SCHOLARSHIPS & COLLEGE WORKING HOURS
    if (
      line.startsWith('SECTION 8:') ||
      line.startsWith('Kongu Engineering College (KEC) is a leading autonomous')
    ) {
      const startLine = i + 1;
      const acadLines: string[] = [];
      i++;
      while (i < lines.length) {
        const cur = lines[i].trim();
        if (cur.startsWith('## 8.1 Frequently Asked Questions')) {
          if (acadLines.length > 0) {
            const fullText = acadLines.join('\n').trim();

            // Extract working hours & timings into dedicated high-priority chunk
            const timingsMatch = fullText.match(/⏰ College Timings[\s\S]*?(?=📞 General Enquiries|$)/);
            if (timingsMatch) {
              addChunk({
                documentTitle: docTitle,
                mainHeading: 'Campus Operations & Working Hours',
                subHeading: 'College Working Hours, Class & Library Timings',
                headingPath: ['Campus Life', 'Working Hours'],
                departmentId: 'general',
                category: 'working_hours',
                sectionTitle: 'College Timings — Class Hours, Office Hours & Library Timings',
                content: timingsMatch[0],
                urls: extractUrls(timingsMatch[0]),
                lineNumber: startLine,
              });
            }

            // Extract scholarships into dedicated chunk
            const schMatch = fullText.match(/🎓 Financial Aid & Fee Concessions[\s\S]*?(?=\*Courses and Departments|$)/);
            if (schMatch) {
              addChunk({
                documentTitle: docTitle,
                mainHeading: 'Financial Aid & Fee Concessions',
                subHeading: '7.5% Govt School Waiver, First Graduate & Merit Scholarships',
                headingPath: ['Admissions', 'Scholarships'],
                departmentId: 'general',
                category: 'scholarship',
                sectionTitle: 'Scholarships & Fee Concessions — 7.5% Govt Quota & First Graduate',
                content: schMatch[0],
                urls: extractUrls(schMatch[0]),
                lineNumber: startLine,
              });
            }

            // Academic Programmes & Regulations
            addChunk({
              documentTitle: docTitle,
              mainHeading: 'Academic Programmes & Regulations',
              subHeading: 'Academic Tracks, Autonomous Curriculum & Admissions',
              headingPath: ['Academics', 'Programmes & Regulations'],
              departmentId: 'general',
              category: 'academics',
              sectionTitle: 'Academics — Programmes, Autonomous Curriculum & Syllabus',
              content: fullText,
              urls: extractUrls(fullText),
              lineNumber: startLine,
            });

            acadLines.length = 0;
          }
        }
        if (cur && !cur.startsWith('=')) acadLines.push(cur);
        i++;
      }

      if (acadLines.length > 0) {
        const content = acadLines.join('\n').trim();
        addChunk({
          documentTitle: docTitle,
          mainHeading: 'Academic Programmes & Regulations',
          subHeading: 'Academics, Timings & Scholarships FAQs',
          headingPath: ['Academics', 'FAQs'],
          departmentId: 'general',
          category: 'academics',
          sectionTitle: 'Academics — Frequently Asked Questions & Answers',
          content,
          urls: extractUrls(content),
          lineNumber: startLine,
        });
      }
      continue;
    }

    i++;
  }

  return {
    chunks,
    sections: Array.from(sectionsSet),
  };
}

export function getKnowledge(): KnowledgeState {
  const filePath = config.collegeInfoPath;

  if (!fs.existsSync(filePath)) {
    return {
      filePath,
      lastModified: 0,
      hash: '',
      rawText: '',
      chunks: [],
      sections: [],
      isEmpty: true,
    };
  }

  const stats = fs.statSync(filePath);
  const mtime = stats.mtimeMs;

  if (cachedKnowledge && cachedKnowledge.lastModified === mtime) {
    return cachedKnowledge;
  }

  const rawText = fs.readFileSync(filePath, 'utf-8');
  const hash = crypto.createHash('md5').update(rawText).digest('hex');

  if (cachedKnowledge && cachedKnowledge.hash === hash) {
    cachedKnowledge.lastModified = mtime;
    return cachedKnowledge;
  }

  const { chunks, sections } = parseKnowledgeText(rawText);
  const isEmpty = rawText.trim().length === 0 || chunks.length === 0;

  cachedKnowledge = {
    filePath,
    lastModified: mtime,
    hash,
    rawText,
    chunks,
    sections,
    isEmpty,
  };

  console.log(
    `[KnowledgeService] Reloaded college-info.txt (Length: ${rawText.length} chars, Chunks: ${chunks.length}, Sections: ${sections.length})`
  );

  return cachedKnowledge;
}

const STOP_WORDS = new Set([
  'what', 'is', 'the', 'for', 'in', 'on', 'at', 'of', 'to', 'a', 'an', 'and', 'or', 'by',
  'how', 'can', 'tell', 'me', 'give', 'details', 'detail', 'about', 'info', 'information',
  'please', 'any', 'do', 'does', 'kec', 'kongu', 'college', 'engineering', 'irukku',
  'enna', 'yaaru', 'sollu', 'sollunga', 'paththi', 'available', 'show', 'need', 'want',
  'which', 'who', 'whom', 'where', 'when', 'why', 'are', 'was', 'were', 'will', 'would',
  'with', 'from', 'this', 'that', 'last', 'year', 'years',
  'tamil', 'nadu', 'current', 'state', 'government',
  'many', 'members', 'member', 'number', 'count', 'total'
]);

const SYNONYM_MAP: Record<string, string[]> = {
  cutoff: ['cut-off', 'cutoff', 'cut off', 'cut-offs', 'marks', 'cut off marks'],
  cutoffs: ['cut-off', 'cutoff', 'cut off', 'cut-offs', 'marks'],
  'cut-off': ['cut-off', 'cutoff', 'cut off', 'cut-offs', 'marks'],
  'cut-offs': ['cut-off', 'cutoff', 'cut off', 'cut-offs', 'marks'],
  rank: ['rank', 'ranks', 'ranking', 'closing rank', 'merit rank'],
  ranks: ['rank', 'ranks', 'ranking', 'closing rank'],
  fee: ['fee', 'fees', 'cost', 'hostel fee', 'tuition fee'],
  fees: ['fee', 'fees', 'cost', 'hostel fee', 'tuition fee'],
  hostel: ['hostel', 'hostels', 'mess', 'dheeran', 'valluvar', 'kaveri', 'amaravathi', 'bhavani'],
  hostels: ['hostel', 'hostels', 'mess'],
  warden: ['warden', 'wardens', 'chief warden', 'deputy warden', 'associate warden'],
  wardens: ['warden', 'wardens'],
  admission: ['admission', 'admissions', 'counselling', 'counseling', 'tnea', 'quota'],
  admissions: ['admission', 'admissions', 'counselling', 'counseling', 'tnea', 'quota'],
  counselling: ['counselling', 'counseling', 'tnea', 'single window'],
  counseling: ['counselling', 'counseling', 'tnea', 'single window'],
  sports: ['sports', 'sport', 'gym', 'ground', 'stadium', 'physical education', 'playfield'],
  placement: ['placement', 'placements', 'salary', 'salaries', 'lpa', 'package', 'packages', 'ctc', 'recruiter', 'highest package', 'placed'],
  placements: ['placement', 'placements', 'salary', 'salaries', 'lpa', 'package', 'packages', 'ctc', 'recruiter', 'placed'],
  salary: ['salary', 'salaries', 'package', 'packages', 'lpa', 'ctc', 'placement', 'placements'],
  salaries: ['salary', 'salaries', 'package', 'packages', 'lpa', 'ctc', 'placement', 'placements'],
  package: ['package', 'packages', 'salary', 'salaries', 'lpa', 'ctc', 'placement', 'placements'],
  packages: ['package', 'packages', 'salary', 'salaries', 'lpa', 'ctc', 'placement', 'placements'],
  lpa: ['lpa', 'salary', 'package', 'placement'],
  faculty: ['faculty', 'staff', 'teacher', 'teachers', 'professor', 'professors', 'assistant professor', 'associate professor', 'hod'],
  staff: ['faculty', 'staff', 'teacher', 'teachers', 'professor', 'professors', 'teaching faculty'],
  cse: ['cse', 'computer science', 'computer science and engineering'],
  it: ['it', 'information technology'],
  aids: ['ai-ds', 'aids', 'ai & ds', 'artificial intelligence and data science', 'data science'],
  aiml: ['ai-ml', 'aiml', 'ai & ml', 'artificial intelligence and machine learning'],
  csd: ['csd', 'computer science and design'],
  ece: ['ece', 'electronics and communication'],
  eee: ['eee', 'electrical and electronics'],
  eie: ['eie', 'electronics and instrumentation', 'instrumentation'],
  mech: ['mechanical', 'mech', 'mechanical engineering'],
  mechanical: ['mechanical', 'mech', 'mechanical engineering'],
  mechatronics: ['mechatronics', 'mct', 'mechatronics engineering'],
  automobile: ['automobile', 'auto', 'automobile engineering'],
  civil: ['civil', 'civil engineering'],
  chemical: ['chemical', 'chemical engineering'],
  food: ['food technology', 'food tech', 'food'],
  mba: ['mba', 'master of business administration', 'management'],
  mca: ['mca', 'master of computer applications'],
  bus: ['bus', 'buses', 'transport', 'transportation', 'route', 'routes', 'shuttle', 'departure', 'timings', 'van', 'sakthivel'],
  buses: ['bus', 'buses', 'transport', 'transportation', 'route', 'routes', 'shuttle', 'departure', 'timings', 'van'],
  transport: ['transport', 'bus', 'buses', 'routes', 'shuttle', 'transportation', 'sakthivel', 'timings', 'fares'],
  route: ['route', 'routes', 'bus', 'buses', 'destination', 'transport', 'stops'],
  routes: ['route', 'routes', 'bus', 'buses', 'destination', 'transport', 'stops'],
  shuttle: ['shuttle', 'shuttles', 'bus', 'perundurai bus stand', 'mini bus'],
  timing: ['timing', 'timings', 'hours', 'working hours', 'schedule', 'college hours', 'class timing', 'office hours', 'time'],
  timings: ['timing', 'timings', 'hours', 'working hours', 'schedule', 'college hours', 'class timing', 'office hours', 'time'],
  time: ['timing', 'timings', 'hours', 'working hours', 'schedule', 'college time', 'class timing'],
  hours: ['hours', 'working hours', 'timing', 'timings', 'schedule', 'office hours', 'library hours'],
  scholarship: ['scholarship', 'scholarships', 'concession', 'waiver', 'fee waiver', '7.5%', 'first graduate', 'first-generation', 'merit', 'financial aid'],
  scholarships: ['scholarship', 'scholarships', 'concession', 'waiver', 'fee waiver', '7.5%', 'first graduate', 'first-generation', 'merit', 'financial aid'],
  concession: ['concession', 'scholarship', 'fee waiver', 'waiver', 'first graduate', 'concessions'],
  concessions: ['concession', 'scholarship', 'fee waiver', 'waiver', 'first graduate', 'concessions'],
  waiver: ['waiver', 'fee waiver', 'scholarship', '7.5%', 'concession'],
  // Tamil Script Mappings to English knowledge concepts
  'விடுதி': ['hostel', 'hostels', 'mess', 'accommodation'],
  'கட்டணம்': ['fee', 'fees', 'cost'],
  'பேருந்து': ['bus', 'buses', 'transport', 'timings'],
  'பஸ்': ['bus', 'buses', 'transport', 'timings'],
  'நேரம்': ['timing', 'timings', 'hours', 'working hours'],
  'உதவித்தொகை': ['scholarship', 'scholarships', 'concession', 'waiver', '7.5%'],
  'முதல் பட்டதாரி': ['first graduate', 'first-generation', 'concession', '25000'],
  'அரசு பள்ளி': ['7.5%', 'government school', 'waiver'],
  'துறைத்தலைவர்': ['hod', 'head of department', 'faculty'],
  'பேராசிரியர்': ['professor', 'faculty', 'staff'],
  'வேலைவாய்ப்பு': ['placement', 'placements', 'salary', 'package', 'recruiter'],
  'சம்பளம்': ['salary', 'salaries', 'lpa', 'package', 'placement'],
  'சேர்க்கை': ['admission', 'admissions', 'counselling', 'tnea'],
  'மதிப்பெண்': ['cutoff', 'cut-off', 'marks'],
  'தரவரிசை': ['rank', 'ranks', 'closing rank'],
  'நூலகம்': ['library', 'library hours'],
  'விளையாட்டு': ['sports', 'gym', 'ground', 'stadium'],
  // Tanglish Mappings (Tamil written in English letters)
  viduthi: ['hostel', 'hostels', 'mess', 'accommodation'],
  kattanam: ['fee', 'fees', 'cost'],
  perunthu: ['bus', 'buses', 'transport', 'timings'],
  neram: ['timing', 'timings', 'hours', 'working hours'],
  uthavithogai: ['scholarship', 'scholarships', 'concession', 'waiver'],
  evalo: ['fees', 'fee', 'cost'],
  evvalo: ['fees', 'fee', 'cost'],
  evvalavu: ['fees', 'fee', 'cost'],
  yevalo: ['fees', 'fee', 'cost'],
  yaaru: ['hod', 'faculty', 'professor', 'principal', 'warden'],
  yaru: ['hod', 'faculty', 'professor', 'principal', 'warden'],
  sambalam: ['salary', 'salaries', 'lpa', 'package', 'placement'],
  velai: ['placement', 'placements', 'career'],
  noolagam: ['library', 'library hours'],
  vilayattu: ['sports', 'gym', 'ground'],
  mudhal: ['first graduate', 'first-generation'],
  thangum: ['hostel', 'accommodation'],
  saapadu: ['mess', 'food'],
  // Common conversational spelling mistakes & typos
  hostal: ['hostel', 'hostels', 'mess'],
  hosetl: ['hostel', 'hostels', 'mess'],
  hostle: ['hostel', 'hostels', 'mess'],
  placment: ['placement', 'placements', 'salary', 'package'],
  placemnt: ['placement', 'placements', 'salary', 'package'],
  plassment: ['placement', 'placements', 'salary', 'package'],
  counceling: ['counselling', 'counseling', 'tnea', 'admission'],
  councelling: ['counselling', 'counseling', 'tnea', 'admission'],
  counselor: ['counselling', 'counseling', 'admission'],
  addmission: ['admission', 'admissions', 'counselling'],
  admissoin: ['admission', 'admissions', 'counselling'],
  admision: ['admission', 'admissions', 'counselling'],
  faculti: ['faculty', 'staff', 'professor'],
  faculity: ['faculty', 'staff', 'professor'],
  faculties: ['faculty', 'staff', 'professors'],
  profesor: ['professor', 'faculty', 'staff'],
  principle: ['principal'],
  princpal: ['principal'],
  prinicipal: ['principal'],
  wardon: ['warden', 'wardens'],
  wareden: ['warden', 'wardens'],
  scolarship: ['scholarship', 'scholarships'],
  scholorship: ['scholarship', 'scholarships'],
  sholarship: ['scholarship', 'scholarships'],
  tranport: ['transport', 'bus', 'buses'],
  transpot: ['transport', 'bus', 'buses'],
  trasport: ['transport', 'bus', 'buses'],
  timimg: ['timing', 'timings', 'hours'],
  timimgs: ['timing', 'timings', 'hours'],
  timeing: ['timing', 'timings', 'hours'],
  libary: ['library', 'library hours'],
  libarary: ['library', 'library hours'],
  automoblie: ['automobile', 'auto'],
  autombile: ['automobile', 'auto'],
  automoble: ['automobile', 'auto'],
  machanical: ['mechanical', 'mech'],
  mechanocal: ['mechanical', 'mech'],
  mecanical: ['mechanical', 'mech'],
  instrumentaion: ['instrumentation', 'eie'],
  instumentation: ['instrumentation', 'eie'],
  colg: ['college', 'kec', 'campus'],
  clg: ['college', 'kec', 'campus'],
};

export const KEY_CAMPUS_TERMS = [
  'automobile', 'mechanical', 'mechatronics', 'instrumentation',
  'electronics', 'communication', 'electrical', 'computer',
  'faculty', 'faculties', 'professor', 'professors',
  'principal', 'admission', 'counselling', 'scholarship',
  'placement', 'placements', 'hostel', 'hostels', 'warden',
  'library', 'timing', 'timings', 'transport', 'shuttle',
  'cutoff', 'cutoffs', 'salary', 'salaries', 'package',
  'concession', 'autonomous', 'curriculum', 'syllabus'
];

export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

export interface NormalizedQueryContext {
  cleanQuery: string;
  department: DepartmentDef | null;
  category: string | null;
  expandedTerms: string[];
  intendedSummary: string;
}

/**
 * Understands the user's intended question before searching the knowledge base:
 * - Detects department even with severe typos or colloquial names.
 * - Detects category (transport, timings, scholarship, faculty, placement, etc.).
 * - Maps Tamil, Tanglish, and misspelled tokens to core English search concepts.
 * - Applies Levenshtein fuzzy correction against key campus terms.
 */
export function understandAndNormalizeQuery(query: string): NormalizedQueryContext {
  const clean = query.trim();
  const lower = clean.toLowerCase();

  let dept = resolveDepartmentFromQuery(query);
  let category = resolveCategoryFromQuery(query);

  const tokens = lower
    .replace(/[^\w\s\u0B80-\u0BFF-]/g, ' ')
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t));

  const expanded = new Set<string>();

  for (const token of tokens) {
    expanded.add(token);
    if (token.includes('-')) {
      expanded.add(token.replace(/-/g, ''));
      expanded.add(token.replace(/-/g, ' '));
    }

    const syns = SYNONYM_MAP[token] || SYNONYM_MAP[token.replace(/-/g, '')];
    if (syns) {
      for (const s of syns) expanded.add(s);
    }

    // Fuzzy matching against key campus terms for tokens with length >= 5
    if (token.length >= 5) {
      for (const term of KEY_CAMPUS_TERMS) {
        if (levenshteinDistance(token, term) <= 2) {
          expanded.add(term);
          const termSyns = SYNONYM_MAP[term];
          if (termSyns) {
            for (const s of termSyns) expanded.add(s);
          }
        }
      }
    }
  }

  // If department or category wasn't resolved directly, try from expanded terms
  if (!dept) {
    for (const exp of expanded) {
      dept = resolveDepartmentFromQuery(exp);
      if (dept) break;
    }
  }
  if (!category) {
    for (const exp of expanded) {
      category = resolveCategoryFromQuery(exp);
      if (category) break;
    }
  }

  if (dept) {
    expanded.add(dept.name.toLowerCase());
    expanded.add(dept.shortName.toLowerCase());
    expanded.add(dept.id);
  }

  if (category) {
    expanded.add(category);
    if (category === 'transport') {
      expanded.add('bus');
      expanded.add('timing');
      expanded.add('timings');
      expanded.add('route');
    } else if (category === 'working_hours') {
      expanded.add('hours');
      expanded.add('working');
      expanded.add('timings');
      expanded.add('timing');
    } else if (category === 'scholarship') {
      expanded.add('scholarship');
      expanded.add('concession');
      expanded.add('waiver');
    } else if (category === 'hostel') {
      expanded.add('hostel');
      expanded.add('mess');
    } else if (category === 'placement') {
      expanded.add('placement');
      expanded.add('salary');
    }
  }

  const intendedSummary = [
    dept ? `Dept: ${dept.name}` : null,
    category ? `Category: ${category}` : null,
    `Terms: ${Array.from(expanded).slice(0, 8).join(', ')}`,
  ]
    .filter(Boolean)
    .join(' | ');

  return {
    cleanQuery: clean,
    department: dept,
    category,
    expandedTerms: Array.from(expanded),
    intendedSummary,
  };
}

/**
 * Strict Department-First Retrieval:
 * 1. For department queries (e.g. IT, EIE, Mech), strictly filters chunks to that department
 * 2. Never retrieves or mixes other departments' faculty or records
 * 3. Preserves table structure and heading hierarchy in returned evidence
 */
export function getCandidatePassages(
  query: string,
  maxCandidates = 20,
  preNormalizedContext?: NormalizedQueryContext
): KnowledgeChunk[] {
  const knowledge = getKnowledge();
  if (knowledge.isEmpty) return [];

  // Understand and normalize the intended question before searching
  const norm = preNormalizedContext || understandAndNormalizeQuery(query);
  const targetDept = norm.department;
  const targetCategory = norm.category;

  // CASE 1: DEPARTMENT-SCOPED QUERY (e.g. IT faculty, EIE staff, Mechanical placement)
  if (targetDept && (targetCategory === 'faculty' || targetCategory === 'placement' || targetCategory === 'intake' || targetCategory === 'hod')) {
    // Collect all chunks matching this department
    const deptChunks = knowledge.chunks.filter((c) => c.departmentId === targetDept.id);

    // Sort to place exact category match at the top
    const sortedDeptChunks = deptChunks.sort((a, b) => {
      const aCatScore = a.category === targetCategory ? 100 : (a.category === 'hod' ? 50 : 0);
      const bCatScore = b.category === targetCategory ? 100 : (b.category === 'hod' ? 50 : 0);
      return bCatScore - aCatScore;
    });

    // Add general/college-wide background chunks (summary, admin contacts) at the bottom
    const generalChunks = knowledge.chunks
      .filter((c) => c.departmentId === 'general' && (c.category === 'faculty_summary' || c.category === 'overview' || c.category === 'hod'))
      .slice(0, 3);

    // STRICT ISOLATION: NEVER INCLUDE OTHER DEPARTMENTS!
    const filteredResults = [...sortedDeptChunks, ...generalChunks];
    if (filteredResults.length > 0) {
      return filteredResults.slice(0, maxCandidates);
    }
  }

  // CASE 2: GENERAL OR OPEN-ENDED QUERY
  const searchTerms = new Set<string>(norm.expandedTerms);

  // Score candidate pool
  const candidatePool = targetDept
    ? knowledge.chunks.filter((c) => c.departmentId === targetDept.id || c.departmentId === 'general')
    : knowledge.chunks;

  const scored = candidatePool.map((chunk) => {
    let score = 0;
    const lowerContent = chunk.content.toLowerCase();
    const lowerSection = chunk.sectionTitle.toLowerCase();
    const lowerHeadPath = chunk.headingPath.join(' ').toLowerCase();
    const matchedConcepts = new Set<string>();

    for (const term of searchTerms) {
      let termMatched = false;
      if (lowerHeadPath.includes(term) || lowerSection.includes(term)) {
        score += 25;
        termMatched = true;
      }
      if (lowerContent.includes(term)) {
        score += term.length > 4 ? 6 : 3;
        termMatched = true;
      }
      if (termMatched) {
        matchedConcepts.add(term);
      }
    }

    if (matchedConcepts.size > 1) {
      score *= 1 + matchedConcepts.size * 1.5;
    }

    if (targetDept && chunk.departmentId === targetDept.id) {
      score += 200; // Strong boost for target department
    }
    if (targetCategory && chunk.category === targetCategory) {
      score += 150; // Strong boost for target category
    }

    return { chunk, score, matchedCount: matchedConcepts.size };
  });

  scored.sort((a, b) => b.score - a.score);

  const topMatches = scored.filter((s) => s.score > 0).map((s) => s.chunk);
  if (topMatches.length > 0) {
    return topMatches.slice(0, maxCandidates);
  }

  return [];
}

const SPECIFIC_DOMAIN_KEYWORDS = new Set([
  'cutoff', 'cutoffs', 'cut-off', 'cut-offs',
  'hostel', 'hostels', 'warden', 'wardens',
  'fees', 'fee', 'mess', 'counselling', 'counseling',
  'admission', 'admissions', 'lateral', 'scholarship', 'scholarships', 'concession', 'waiver',
  'principal', 'placement', 'placements', 'highest package',
  'autonomous', 'ranking', 'sports', 'gym', 'ground', 'stadium',
  'dheeran', 'valluvar', 'kaveri', 'amaravathi', 'bhavani', 'kamban', 'ilango', 'ponnar', 'sankar',
  'salary', 'salaries', 'package', 'packages', 'lpa', 'placed',
  'faculty', 'staff', 'professor', 'hod',
  'mechanical', 'mechatronics', 'automobile', 'civil', 'chemical', 'cse', 'it', 'eee', 'ece', 'eie', 'mba', 'mca', 'food', 'aiml', 'aids', 'csd',
  'bus', 'buses', 'transport', 'route', 'routes', 'shuttle', 'sakthivel',
  'timing', 'timings', 'hours', 'working', 'office', 'library', 'tnea', 'tancet'
]);

export function hasStrongKnowledgeCoverage(query: string, candidates: KnowledgeChunk[]): boolean {
  if (!candidates || candidates.length === 0) return false;

  const clean = query.toLowerCase();
  const tokens = clean
    .replace(/[^\w\s\u0B80-\u0BFF-]/g, ' ')
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t));

  if (tokens.length === 0) return false;

  for (const chunk of candidates.slice(0, 8)) {
    const text = (chunk.sectionTitle + ' ' + chunk.headingPath.join(' ') + ' ' + chunk.content).toLowerCase();

    for (const token of tokens) {
      if (SPECIFIC_DOMAIN_KEYWORDS.has(token) && text.includes(token)) {
        return true;
      }
      const syns = SYNONYM_MAP[token] || [];
      if (syns.some((s) => SPECIFIC_DOMAIN_KEYWORDS.has(s) && text.includes(s))) {
        return true;
      }
    }

    const matchedCount = tokens.filter((t) => text.includes(t)).length;
    if (matchedCount >= 2) {
      return true;
    }
  }

  return false;
}

/**
 * Checks if the generated answer indicates that the requested information is absent,
 * partial, or unverified in the official college records.
 */
export function isMissingFromKnowledgeBase(text: string): boolean {
  if (!text) return true;
  const lower = text.toLowerCase();
  const missingIndicators = [
    'not available in the official',
    'not specified in the official',
    'could not be verified from the available college records',
    'could not be verified in official',
    'cannot be verified from the available college records',
    'cannot be verified in official',
    'not mentioned in the official',
    'not found in the official',
    'not available in the college records',
    'not specified in the college records',
    'not mentioned in the college records',
    'no information regarding',
    'not present in the official records',
    'records do not contain',
    'records do not specify',
    'records do not provide',
    'not provided in the official',
    'not available in the provided',
    'not found in the provided',
    'information regarding this detail is not available',
  ];
  return missingIndicators.some((indicator) => lower.includes(indicator));
}

