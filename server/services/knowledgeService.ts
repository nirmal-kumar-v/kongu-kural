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
    regex: /\b(information\s+technology|\bit\b)\b/i,
  },
  {
    id: 'eie',
    name: 'Electronics and Instrumentation Engineering',
    shortName: 'EIE',
    regex: /\b(electronics\s+(and|&)\s+instrumentation|\beie\b|instrumentation\s+engineering)\b/i,
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
    regex: /\b(mechanical\s+engineering|mechanical|\bmech\b)\b/i,
  },
  {
    id: 'auto',
    name: 'Automobile Engineering',
    shortName: 'Automobile',
    regex: /\b(automobile\s+engineering|automobile|\bauto\b)\b/i,
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
    regex: /\b(chemical\s+engineering|chemical|\bchem\b)\b/i,
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
    /\b(staff|faculty|teacher|teachers|professor|professors|assistant professor|associate professor|hod|head of department|who teaches|members|directory)\b/i.test(
      q
    )
  ) {
    return 'faculty';
  }
  if (
    /\b(placement|placements|salary|salaries|package|packages|lpa|ctc|placed|recruit|recruiter|highest offer|highest salary|average salary)\b/i.test(
      q
    )
  ) {
    return 'placement';
  }
  if (/\b(cutoff|cut-off|cutoffs|cut-offs|marks)\b/i.test(q)) {
    return 'cutoff';
  }
  if (/\b(rank|ranks|ranking|closing rank)\b/i.test(q)) {
    return 'rank';
  }
  if (/\b(intake|seats|seat|how many seats|capacity)\b/i.test(q)) {
    return 'intake';
  }
  if (/\b(hostel|hostels|mess|food|room|rooms|warden|wardens)\b/i.test(q)) {
    return 'hostel';
  }
  if (/\b(fee|fees|cost|tuition fee|hostel fee)\b/i.test(q)) {
    return 'fees';
  }
  if (/\b(admission|admissions|counselling|counseling|tnea|eligibility|lateral)\b/i.test(q)) {
    return 'admission';
  }
  if (/\b(sport|sports|gym|ground|stadium|physical education|badminton|football|cricket)\b/i.test(q)) {
    return 'sports';
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

    // 1. HOSTEL STAFF DETAILS (Table)
    if (line === 'Hostel : --- done' || line === 'KEC Hostel Staff Details') {
      const startLine = i + 1;
      const hostelLines: string[] = ['Hostel Accommodation & Staff Directory', '--------------------------------------'];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('Hostel Accommodation Details') && !lines[i].trim().startsWith('----------------')) {
        if (lines[i].trim()) hostelLines.push(lines[i].trim());
        i++;
      }
      const content = hostelLines.join('\n');
      addChunk({
        documentTitle: docTitle,
        mainHeading: 'Hostel Information',
        subHeading: 'KEC Hostel Staff Details',
        headingPath: ['Hostels', 'Hostel Staff Details'],
        departmentId: 'general',
        category: 'hostel_staff',
        sectionTitle: 'Hostel Information — KEC Hostel Staff Details',
        content,
        urls: extractUrls(content),
        lineNumber: startLine,
      });
      continue;
    }

    // 2. HOSTEL ACCOMMODATION & KEY DETAILS
    if (line === 'Hostel Accommodation Details') {
      const startLine = i + 1;
      const accLines: string[] = ['Hostel Accommodation Details (Blocks & Facilities)', '-----------------------------------------------'];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('Engineering & Technology Departments') && !lines[i].trim().startsWith('All faculty name')) {
        if (lines[i].trim() && !lines[i].trim().startsWith('---') && !lines[i].trim().startsWith('http')) {
          accLines.push(lines[i].trim());
        }
        i++;
      }
      const content = accLines.join('\n');
      addChunk({
        documentTitle: docTitle,
        mainHeading: 'Hostel Information',
        subHeading: 'Accommodation & Key Details',
        headingPath: ['Hostels', 'Hostel Accommodation Details'],
        departmentId: 'general',
        category: 'hostel',
        sectionTitle: 'Hostel Information — Accommodation Details & Fees',
        content,
        urls: extractUrls(content),
        lineNumber: startLine,
      });
      continue;
    }

    // 3. DEPARTMENT HEADS (HODs) AND CENTRAL CONTACTS
    if (
      line === 'Engineering & Technology Departments' ||
      line === 'Computer Applications & Technology (UG / PG)' ||
      line === 'Science & Humanities Departments' ||
      line === 'Central Campus Administration Contacts'
    ) {
      const startLine = i + 1;
      const hodLines: string[] = [`Department Heads & Leadership (${line})`, '------------------------------------------------'];
      const sectionName = line;
      i++;
      while (
        i < lines.length &&
        !lines[i].trim().startsWith('All faculty name') &&
        !lines[i].trim().startsWith('////')
      ) {
        const cur = lines[i].trim();
        if (
          cur === 'Engineering & Technology Departments' ||
          cur === 'Computer Applications & Technology (UG / PG)' ||
          cur === 'Science & Humanities Departments' ||
          cur === 'Central Campus Administration Contacts'
        ) {
          break;
        }
        if (cur && !cur.startsWith('---')) {
          hodLines.push(cur);
        }
        i++;
      }
      const content = hodLines.join('\n');
      addChunk({
        documentTitle: docTitle,
        mainHeading: 'Campus Leadership & Department Heads',
        subHeading: sectionName,
        headingPath: ['Administration', 'Department Heads (HODs)', sectionName],
        departmentId: 'general',
        category: 'hod',
        sectionTitle: `Leadership & HOD Directory — ${sectionName}`,
        content,
        urls: extractUrls(content),
        lineNumber: startLine,
      });
      continue;
    }

    // 4. FACULTY DIRECTORY FOR ALL DEPARTMENTS (Lines 120–499)
    if (line.includes('All faculty name :') || line.startsWith('1. Computer Science and Engineering (CSE)')) {
      if (line.includes('All faculty name :')) i++;

      while (i < lines.length && !lines[i].trim().startsWith('Department summary') && !lines[i].trim().startsWith('physical department')) {
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
          i++; // move past department heading

          // Collect table header and rows
          while (
            i < lines.length &&
            !lines[i].trim().match(/^(\d+)\.\s+[A-Za-z]/) &&
            !lines[i].trim().startsWith('Department summary') &&
            !lines[i].trim().startsWith('physical department')
          ) {
            const row = lines[i].trim();
            if (row && !row.startsWith('#\tFaculty Name')) {
              facultyRows.push(row);
            }
            i++;
          }

          // Build chunk with exact document hierarchy & table headers
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
      continue;
    }

    // 5. DEPARTMENT SUMMARY (Lines 500–518)
    if (line.startsWith('Department summary')) {
      const startLine = i + 1;
      const sumLines: string[] = ['Department Summary — Listed Faculty Counts', '------------------------------------------'];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('physical department') && !lines[i].trim().startsWith('# Kongu')) {
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
      continue;
    }

    // 6. PHYSICAL EDUCATION & SPORTS (Lines 519–1398)
    if (line.startsWith('physical department:') || line.startsWith('A1. DEPARTMENT OVERVIEW') || line.startsWith('A2. STAFF AND CONTACTS')) {
      const startLine = i + 1;
      let sportsSec = line;
      const sportsLines: string[] = [line];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('# Kongu Engineering College') && !lines[i].trim().startsWith('Placement Information :')) {
        const cur = lines[i].trim();
        if (cur.match(/^[A-Z0-9]{1,3}\.\s+[A-Z\s/&()-]{3,50}/)) {
          // Flush current sports section
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
        if (cur) sportsLines.push(cur);
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

    // 7. STRUCTURED KNOWLEDGE BASE (17 SECTIONS) (Lines 1399–2070)
    if (line.startsWith('# Kongu Engineering College (KEC) — Structured Knowledge Base') || line.match(/^[0-9]{1,2}\.\s+[A-Z\s,/&()-]{3,60}$/)) {
      const startLine = i + 1;
      let secTitle = line.replace(/^#\s*/, '').trim();
      const secLines: string[] = [secTitle];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('Placement Information :') && !lines[i].trim().startsWith('## 1.')) {
        const cur = lines[i].trim();
        if (cur.match(/^[0-9]{1,2}\.\s+[A-Z\s,/&()-]{3,60}$/)) {
          // Flush section
          const content = secLines.join('\n').trim();
          if (content.length > 50) {
            let cat = 'overview';
            if (secTitle.includes('PROGRAMMES') || secTitle.includes('intake')) cat = 'intake';
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
        if (cur) secLines.push(cur);
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

    // 8. PLACEMENT INFORMATION (SECTIONS 1 TO 13) (Lines 2071–2311)
    if (line.startsWith('Placement Information :') || line.startsWith('## ')) {
      if (line.startsWith('Placement Information :')) i++;

      while (i < lines.length) {
        const curLine = lines[i].trim();
        if (curLine.startsWith('## ')) {
          const subHeading = curLine.replace(/^##\s+/, '').trim();
          const startSubLine = i + 1;
          const pLines: string[] = [subHeading];
          i++;

          while (i < lines.length && !lines[i].trim().startsWith('## ')) {
            const row = lines[i].trim();
            if (row) pLines.push(row);
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
            // General placement section or CSE/IT specific
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
      break;
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
  'tamil', 'nadu', 'current', 'state', 'government'
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
  staff: ['faculty', 'staff', 'teacher', 'teachers', 'professor', 'professors', 'members'],
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
};

/**
 * Strict Department-First Retrieval:
 * 1. For department queries (e.g. IT, EIE, Mech), strictly filters chunks to that department
 * 2. Never retrieves or mixes other departments' faculty or records
 * 3. Preserves table structure and heading hierarchy in returned evidence
 */
export function getCandidatePassages(query: string, maxCandidates = 20): KnowledgeChunk[] {
  const knowledge = getKnowledge();
  if (knowledge.isEmpty) return [];

  const targetDept = resolveDepartmentFromQuery(query);
  const targetCategory = resolveCategoryFromQuery(query);

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
  const cleanQuery = query.toLowerCase();
  const tokens = cleanQuery
    .replace(/[^\w\s\u0B80-\u0BFF-]/g, ' ')
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t));

  const searchTerms = new Set<string>();
  for (const token of tokens) {
    searchTerms.add(token);
    if (token.includes('-')) {
      searchTerms.add(token.replace(/-/g, ''));
      searchTerms.add(token.replace(/-/g, ' '));
    }
    const mapped = SYNONYM_MAP[token] || SYNONYM_MAP[token.replace(/-/g, '')];
    if (mapped) {
      for (const m of mapped) searchTerms.add(m);
    }
  }

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
      score += 100; // Strong boost for target category
    }

    return { chunk, score, matchedCount: matchedConcepts.size };
  });

  scored.sort((a, b) => b.score - a.score);

  const topMatches = scored.filter((s) => s.score > 0).map((s) => s.chunk);
  if (topMatches.length > 0) {
    return topMatches.slice(0, maxCandidates);
  }

  return candidatePool.slice(0, maxCandidates);
}

const SPECIFIC_DOMAIN_KEYWORDS = new Set([
  'cutoff', 'cutoffs', 'cut-off', 'cut-offs',
  'hostel', 'hostels', 'warden', 'wardens',
  'fees', 'fee', 'mess', 'counselling', 'counseling',
  'admission', 'admissions', 'lateral', 'scholarship',
  'principal', 'placement', 'placements', 'highest package',
  'autonomous', 'ranking', 'sports', 'gym', 'ground', 'stadium',
  'dheeran', 'valluvar', 'kaveri', 'amaravathi', 'bhavani', 'kamban', 'ilango', 'ponnar', 'sankar',
  'salary', 'salaries', 'package', 'packages', 'lpa', 'placed',
  'faculty', 'staff', 'professor', 'hod',
  'mechanical', 'mechatronics', 'automobile', 'civil', 'chemical', 'cse', 'it', 'eee', 'ece', 'eie', 'mba', 'mca', 'food', 'aiml', 'aids', 'csd'
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
