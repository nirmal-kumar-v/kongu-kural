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
    /\b(curriculum|syllabus|course|courses|subject|subjects|semester|sem|semesters|regulation|regulations|r2024|r2022|elective|electives|credits|lab|laboratory|cloud computing|deep learning|data structures|python|devops|cryptography|c programming|24[a-z]{2,3}\d{2}|பாடம்|பாடங்கள்|பாடத்திட்டம்|செமஸ்டர்|செமஸ்டரில்|கிளவுட்|கம்ப்யூட்டிங்|padippanga|padikkanum)\b/i.test(
      q
    )
  ) {
    return 'curriculum';
  }
  if (
    /\b(rule|rules|regulation|regulations|discipline|conduct|ragging|dress code|dress|uniform|churidar|dupatta|shoes|helmet|helmets|mobile|cell phone|phone|attendance|leave|hall ticket|malpractice|expulsion|suspension|penalty|fine|fined|prohibition|act no\.?\s*7|விதிகள்|விதிமுறைகள்|ஆடை கட்டுப்பாடு|டிரஸ்|அபராதம்|தண்டனை|வருகை|ஹெல்மெட்)\b/i.test(
      q
    )
  ) {
    return 'rules';
  }
  if (
    /\b(trust|trustee|trustees|kvitt|governing council|academic council|board of studies|patron|patron members|office bearer|office bearers|correspondent|treasurer|president|secretary|vice president|joint secretary|devarajan|sathiyamurthi|valliyammai|bhagyaveni|tamilarasan|thamilselvan|அறக்கட்டளை|ஆட்சி மன்றம்|கல்வி மன்றம்|தலைவர்|செயலாளர்)\b/i.test(
      q
    )
  ) {
    return 'governance';
  }
  if (
    /\b(principal|head of the institution|head of institution|parameshwaran|parameshwar|principal's|principals|முதல்வர்)\b/i.test(
      q
    )
  ) {
    return 'principal';
  }
  if (
    /\b(bus|buses|transport|transportation|route|routes|shuttle|shuttles|vehicle|two-wheelers?|parking|bus fee|van|sakthivel|பேருந்து|பஸ்|வழித்தடம்|perunthu|tranport|transpot)\b/i.test(
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
    /\b(placement|placements|salary|salaries|package|packages|lpa|ctc|placed|recruit|recruiter|highest offer|highest salary|average salary|வேலைவாய்ப்பு|சம்பளம்|sambalam|velai|placment|placemnt|1828|1529|409|soliton|rubrik|jpmorgan|deloitte|mr cooper|trimble|zoho|virtusa|genworx|jgc|rently|wabag|tosibha|spic|brakes india|delta electronics|cognizant|nbase2|valeo|schneider|bhawan|rane|workhall|ignitarium|codemagen|presidio|iam neo|yuvi|cdw|bi3|rapiddata|zenthink|pearson|winfomi|griffyn|dataspark|crescent moon|leumasware|openmynz|tessolve|likan|pentafox|securin|josh|cube ai|thiran360ai|twincord|survey sparrow|jman|appsentinels|infinox|thirvusoft|logbase|digital yugam|nutz|cartrabbit|adwik|mistral|calibraint|dextris|whiterapps|icanio|eg innovations|logicgo|adrasti|brahmarsive|endava|src projects|mavenly|ciel|mallow|coreel|platform science|kurium|conserve|careyu|robovision|hffc|system-controls|muthoot|addis|caliber|xoriant|veritas|yellowmatics|punchbiz|kasadara|bright beam|smartdv|dcw|itc food|rabbitqr|avasoft|tap academy|gecatech|crp robots|bigboon|netgear|infomin|synapse|imagitive|vintorix|mithilai|growwpark|atelier|acmegrade|data pattern|motherson|pothigai|ramalingan|promantus|slb|real tech|accenture|workline|nimir|srinsoft)\b/i.test(
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
  if (/\b(programme|programmes|degree|autonomous|பாடம்|பாடத்திட்டம்)\b/i.test(
    q
  )
  ) {
    return 'academics';
  }
  if (
    /\b(wifi|wi-fi|wireless|kongu_wifi|netid|firewall|mac address|internet|lan|hotspot|வைபை|இணையம்)\b/i.test(
      q
    )
  ) {
    return 'wifi';
  }
  if (
    /\b(special event|special events|event|events|fest|fests|cultural fest|techno cultural|founders day|kongu trophy|enthusia|swaram|sports day|annual day|farewell day|krishna jayanthi|vinayakar chathurthi|milad-un-nabi|dheeran chinnamalai|gandhi jayanthi|ayutha pooja|vijaya dasami|muharram|deepavali|pongal|thiruvalluvar day|uzhavar thirunal|thaipoosam|republic day|telugu new year|ramzan|tamil new year|ambedkar|mahavir jayanthi|good friday|may day|inauguration|நிகழ்ச்சி|சிறப்பு நிகழ்ச்சி|விடுமுறை|விழா|ஹாலிடே|எப்போது நடைபெறும்|என்ன நிகழ்ச்சி)\b/i.test(
      q
    ) ||
    (/\b(what event|which event|what is on|what happens on|any special event|any event|events on)\b/i.test(q) &&
      /\b(january|february|march|april|may|june|july|august|september|october|november|december)\b/i.test(q))
  ) {
    return 'events';
  }
  if (
    /\b(exam rule|exam rules|examination rule|examination rules|exam instruction|exam instructions|examination instructions|hall superintendent|admitted to write exam|permitted items|prohibited items|rough work|calculator|non-programmable calculator|borrowing|blue or black ink|sketch pen|data book|mathematical table|statistical table|entering examination hall|late entry|30 minutes|leaving hall|45 minutes|re-enter|identity card|id card|hall ticket|scribe|temporary illness|blind candidate|impersonation|handover to police|malpractice warning|தேர்வு விதிகள்|விதிமுறைகள்|தேர்வு அறை)\b/i.test(
      q
    )
  ) {
    return 'exam_rules';
  }
  if (
    /\b(malpractice|penalty matrix|punishment|debarment|debarred|fine of rs|rs\.?\s*1000|invalidating|cancellation of exam|incriminating materials|copying|substituting answer booklet|rough work on question paper|writing name|special marking|canvassing|medical leave form|break of study|exam withdrawal|cgpa conversion|duplicate grade sheet|zero tolerance policy|controller of examination|controller of examinations|coe)\b/i.test(
      q
    )
  ) {
    return 'malpractice';
  }
  if (
    /\b(academic schedule|academic calendar|calendar|schedule|cat 1|cat 2|cat 3|cat-1|cat-2|cat-3|ca test|ca test-1|ca test-2|ca test-3|retest|re test|improvement test|last working day|project review|viva voce|project report submission|practical exam|practical exams|theory exam|theory exams|commencement of classes|reopening|even semester reopening|odd semester reopening|தேர்வு|கால அட்டவணை|நாட்காட்டி)\b/i.test(
      q
    )
  ) {
    return 'academic_calendar';
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

    // 2. CAMPUS LEADERSHIP, ADMINISTRATION, PRINCIPAL & GOVERNANCE
    if (
      line.startsWith('SECTION 2:') ||
      line === 'Engineering & Technology Departments' ||
      line === 'Computer Applications & Technology (UG / PG)' ||
      line === 'Science & Humanities Departments' ||
      line === 'Central Campus Administration Contacts'
    ) {
      let curHeading = '## 2.1 Department Heads & Central Administration Directory';
      let curStartLine = i + 1;
      const curLines: string[] = [];
      i++;

      const flushSection2Chunk = (heading: string, linesArr: string[], startL: number) => {
        if (linesArr.length === 0) return;
        const content = linesArr.join('\n').trim();
        if (content.length < 20) return;

        let cat = 'hod';
        let subHeading = heading.replace(/^##\s*\d+\.\d+\s*/, '').trim();
        let secTitle = `Leadership & HOD Directory — ${subHeading}`;
        let headPath = ['Administration', 'Leadership', subHeading];

        if (heading.includes('2.3') || heading.includes('Trust') || heading.includes('KVITT')) {
          cat = 'governance';
          secTitle = 'KVITT Trust — Office Bearers & Patron Members';
          headPath = ['Governance', 'KVITT Trust'];
        } else if (heading.includes('2.4') || heading.includes('Principal')) {
          cat = 'principal';
          secTitle = 'Principal Profile — Dr. R. Parameshwaran';
          headPath = ['Administration', 'Principal'];
        } else if (heading.includes('2.5') || heading.includes('Governing Council')) {
          cat = 'governance';
          secTitle = 'Governing Council — Members & Nominees';
          headPath = ['Governance', 'Governing Council'];
        } else if (heading.includes('2.6') || heading.includes('Academic Council')) {
          cat = 'governance';
          secTitle = 'Academic Council — Members & Board of Studies Chairpersons';
          headPath = ['Governance', 'Academic Council'];
        } else if (heading.includes('2.2')) {
          cat = 'hod';
          secTitle = 'Leadership & HOD Directory — FAQs';
          headPath = ['Administration', 'Leadership FAQs'];
        }

        addChunk({
          documentTitle: docTitle,
          mainHeading: 'Campus Leadership, Principal & Governance',
          subHeading,
          headingPath: headPath,
          departmentId: 'general',
          category: cat,
          sectionTitle: secTitle,
          content,
          urls: extractUrls(content),
          lineNumber: startL,
        });
      };

      while (
        i < lines.length &&
        !lines[i].trim().startsWith('SECTION 3:') &&
        !lines[i].trim().startsWith('All faculty name') &&
        !lines[i].trim().startsWith('////')
      ) {
        const cur = lines[i].trim();
        if (cur.match(/^##\s*2\.\d+/)) {
          flushSection2Chunk(curHeading, curLines, curStartLine);
          curHeading = cur;
          curStartLine = i + 1;
          curLines.length = 0;
          curLines.push(cur);
          i++;
          continue;
        }
        if (cur && !cur.startsWith('=') && !cur.startsWith('---')) curLines.push(cur);
        i++;
      }
      flushSection2Chunk(curHeading, curLines, curStartLine);
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
            const upperSec = secTitle.toUpperCase();
            if (upperSec.includes('PROGRAMME') || upperSec.includes('INTAKE')) cat = 'intake';
            else if (upperSec.includes('ADMISSION') || upperSec.includes('COUNSELLING') || upperSec.includes('LATERAL ENTRY')) cat = 'admission';
            else if (upperSec.includes('CUT-OFF') || upperSec.includes('RANK')) cat = 'cutoff';
            else if (upperSec.includes('FEE') || upperSec.includes('SCHOLARSHIP')) cat = 'scholarship';
            else if (upperSec.includes('PLACEMENT')) cat = 'placement';
            else if (upperSec.includes('WORKING HOURS')) cat = 'working_hours';
            else if (upperSec.includes('HOSTEL')) cat = 'hostel';
            else if (upperSec.includes('TRANSPORT')) cat = 'transport';
            else if (upperSec.includes('SPORTS') || upperSec.includes('PHYSICAL EDUCATION')) cat = 'sports';
            else if (upperSec.includes('RULE') || upperSec.includes('DISCIPLIN') || upperSec.includes('CONDUCT')) cat = 'rules';
            else if (upperSec.includes('TRUST') || upperSec.includes('COUNCIL')) cat = 'governance';
            else if (upperSec.includes('ADMINISTRATION') || upperSec.includes('LEADERSHIP')) cat = 'principal';
            else if (upperSec.includes('CURRICULUM') || upperSec.includes('ACADEMIC SYSTEM')) cat = 'curriculum';

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
          let cat = 'overview';
          const upperSec = secTitle.toUpperCase();
          if (upperSec.includes('PROGRAMME') || upperSec.includes('INTAKE')) cat = 'intake';
          else if (upperSec.includes('ADMISSION') || upperSec.includes('COUNSELLING') || upperSec.includes('LATERAL ENTRY')) cat = 'admission';
          else if (upperSec.includes('CUT-OFF') || upperSec.includes('RANK')) cat = 'cutoff';
          else if (upperSec.includes('FEE') || upperSec.includes('SCHOLARSHIP')) cat = 'scholarship';
          else if (upperSec.includes('PLACEMENT')) cat = 'placement';
          else if (upperSec.includes('WORKING HOURS')) cat = 'working_hours';
          else if (upperSec.includes('HOSTEL')) cat = 'hostel';
          else if (upperSec.includes('TRANSPORT')) cat = 'transport';
          else if (upperSec.includes('SPORTS') || upperSec.includes('PHYSICAL EDUCATION')) cat = 'sports';
          else if (upperSec.includes('RULE') || upperSec.includes('DISCIPLIN') || upperSec.includes('CONDUCT')) cat = 'rules';
          else if (upperSec.includes('TRUST') || upperSec.includes('COUNCIL')) cat = 'governance';
          else if (upperSec.includes('ADMINISTRATION') || upperSec.includes('LEADERSHIP')) cat = 'principal';
          else if (upperSec.includes('CURRICULUM') || upperSec.includes('ACADEMIC SYSTEM')) cat = 'curriculum';

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

    // 8. ACADEMIC PROGRAMMES, AUTONOMOUS REGULATIONS, ADMISSIONS, SCHOLARSHIPS, CURRICULUM & RULES
    if (
      line.startsWith('SECTION 8:') ||
      line.startsWith('Kongu Engineering College (KEC) is a leading autonomous')
    ) {
      let curHeading = '## 8.0 Overview';
      let curStartLine = i + 1;
      const curLines: string[] = [];
      i++;

      const flushSection8Chunk = (heading: string, linesArr: string[], startL: number) => {
        if (linesArr.length === 0) return;
        const content = linesArr.join('\n').trim();
        if (content.length < 20) return;

        if (heading === '## 8.0 Overview') {
          // Extract working hours & timings into dedicated high-priority chunk
          const timingsMatch = content.match(/⏰ College Timings[\s\S]*?(?=📞 General Enquiries|$)/);
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
              lineNumber: startL,
            });
          }

          // Extract scholarships into dedicated chunk
          const schMatch = content.match(/🎓 Financial Aid & Fee Concessions[\s\S]*?(?=\*Courses and Departments|$)/);
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
              lineNumber: startL,
            });
          }

          // Academic Programmes & Regulations overview
          addChunk({
            documentTitle: docTitle,
            mainHeading: 'Academic Programmes & Regulations',
            subHeading: 'Academic Tracks, Autonomous Curriculum & Admissions',
            headingPath: ['Academics', 'Programmes & Regulations'],
            departmentId: 'general',
            category: 'academics',
            sectionTitle: 'Academics — Programmes, Autonomous Curriculum & Syllabus',
            content,
            urls: extractUrls(content),
            lineNumber: startL,
          });
          return;
        }

        if (heading.match(/8\.1\b/)) {
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
            lineNumber: startL,
          });
        } else if (heading.includes('8.2')) {
          addChunk({
            documentTitle: docTitle,
            mainHeading: 'Curriculum and Syllabus',
            subHeading: 'B.Tech. Information Technology (IT) Department — Regulation 2024',
            headingPath: ['Academics', 'Curriculum', 'Information Technology Department', 'IT Department', 'Regulation 2024'],
            departmentId: 'it',
            departmentName: 'Information Technology',
            category: 'curriculum',
            sectionTitle: 'Curriculum & Syllabus — B.Tech Information Technology (IT) Regulation 2024',
            content,
            urls: extractUrls(content),
            lineNumber: startL,
          });
        } else if (heading.includes('8.3')) {
          addChunk({
            documentTitle: docTitle,
            mainHeading: 'Curriculum and Syllabus',
            subHeading: 'B.E. Computer Science and Engineering (CSE) Department — Regulation 2024',
            headingPath: ['Academics', 'Curriculum', 'Computer Science and Engineering Department', 'CSE Department', 'Regulation 2024'],
            departmentId: 'cse',
            departmentName: 'Computer Science and Engineering',
            category: 'curriculum',
            sectionTitle: 'Curriculum & Syllabus — B.E Computer Science and Engineering (CSE) Regulation 2024',
            content,
            urls: extractUrls(content),
            lineNumber: startL,
          });
        } else if (heading.includes('8.4')) {
          addChunk({
            documentTitle: docTitle,
            mainHeading: 'Institutional Rules & Student Regulations',
            subHeading: 'Working Timings, Discipline, Dress Code, Ragging & Regulations',
            headingPath: ['Campus Regulations', 'Rules & Discipline'],
            departmentId: 'general',
            category: 'rules',
            sectionTitle: 'College Regulations — Rules, Working Timings, Discipline, Ragging & Dress Code',
            content,
            urls: extractUrls(content),
            lineNumber: startL,
          });
        } else if (heading.includes('8.5')) {
          addChunk({
            documentTitle: docTitle,
            mainHeading: 'Campus Wi-Fi Network & Registration',
            subHeading: 'Kongu_Wifi Registration Form, Technical Specs & Connection Procedure',
            headingPath: ['Campus Facilities', 'Computing & IT', 'Campus Wi-Fi', 'Kongu_Wifi'],
            departmentId: 'general',
            category: 'wifi',
            sectionTitle: 'Campus Wi-Fi Registration — Form, Kongu_Wifi SSID & Connection Guide',
            content,
            urls: extractUrls(content),
            lineNumber: startL,
          });
        } else if (heading.includes('8.6')) {
          addChunk({
            documentTitle: docTitle,
            mainHeading: 'Academic Schedule & Calendar 2026-27',
            subHeading: 'Odd Semester Schedule (Senior Semesters: BE/BTech, ME/MTech, BSc, MSc, MCA, BArch)',
            headingPath: ['Academics', 'Academic Schedule 2026-27', 'Odd Semester', 'Senior Semesters'],
            departmentId: 'general',
            category: 'academic_calendar',
            sectionTitle: 'Academic Schedule 2026–27 — Odd Semester (Senior Semesters)',
            content,
            urls: extractUrls(content),
            lineNumber: startL,
          });
        } else if (heading.includes('8.7')) {
          addChunk({
            documentTitle: docTitle,
            mainHeading: 'Academic Schedule & Calendar 2026-27',
            subHeading: 'Odd Semester Schedule (First Semester Programmes: BE/BTech, ME/MTech, BSc, MSc, MBA, MCA, BArch)',
            headingPath: ['Academics', 'Academic Schedule 2026-27', 'Odd Semester', 'First Semester'],
            departmentId: 'general',
            category: 'academic_calendar',
            sectionTitle: 'Academic Schedule 2026–27 — Odd Semester (First Semester Programmes)',
            content,
            urls: extractUrls(content),
            lineNumber: startL,
          });
        } else if (heading.includes('8.8')) {
          addChunk({
            documentTitle: docTitle,
            mainHeading: 'Academic Schedule & Calendar 2026-27',
            subHeading: 'Even Semester Schedule (All Programmes & Batches: BE/BTech, ME/MTech, BSc, MSc, MCA, BArch, MBA)',
            headingPath: ['Academics', 'Academic Schedule 2026-27', 'Even Semester'],
            departmentId: 'general',
            category: 'academic_calendar',
            sectionTitle: 'Academic Schedule 2026–27 — Even Semester (All Programmes & Batches)',
            content,
            urls: extractUrls(content),
            lineNumber: startL,
          });
        } else if (heading.includes('8.9')) {
          addChunk({
            documentTitle: docTitle,
            mainHeading: 'Academic Schedule & Calendar 2026-27',
            subHeading: 'Master Date-by-Date Schedule & Event Calendar (Activities by Date)',
            headingPath: ['Academics', 'Academic Schedule 2026-27', 'Master Date Index'],
            departmentId: 'general',
            category: 'academic_calendar',
            sectionTitle: 'Academic Schedule 2026–27 — Master Date-by-Date Schedule & Event Calendar',
            content,
            urls: extractUrls(content),
            lineNumber: startL,
          });
        } else if (heading.includes('8.10')) {
          addChunk({
            documentTitle: docTitle,
            mainHeading: 'Academic Schedule & Calendar 2026-27',
            subHeading: 'Frequently Asked Questions — CAT Dates, Exams, Practicals, Deadlines & Reopening',
            headingPath: ['Academics', 'Academic Schedule 2026-27', 'FAQs'],
            departmentId: 'general',
            category: 'academic_calendar',
            sectionTitle: 'Academic Schedule 2026–27 — FAQs & Specific Exam/CAT Lookups',
            content,
            urls: extractUrls(content),
            lineNumber: startL,
          });
        } else if (heading.includes('8.11')) {
          // Special Events, Cultural Fests & Institutional Holidays 2026-27
          // 1. Overall Special Events & Holidays chunk
          addChunk({
            documentTitle: docTitle,
            mainHeading: 'Special Events, Cultural Fests & Institutional Holidays 2026-27',
            subHeading: 'Chronological Calendar & Institutional Holidays (Odd & Even Semesters)',
            headingPath: ['Campus Life', 'Events', 'Calendar 2026-27', 'Special Events'],
            departmentId: 'general',
            category: 'events',
            sectionTitle: 'Special Events, Cultural Fests & Institutional Holidays 2026–27 — Master Calendar',
            content,
            urls: extractUrls(content),
            lineNumber: startL,
          });

          // 2. Dedicated Bidirectional Lookup chunk (Event Name <-> Date)
          const bidiMatch = content.match(/### Bidirectional Lookup Directory[\s\S]*?(?=(?:## 8\.12|$))/);
          if (bidiMatch) {
            addChunk({
              documentTitle: docTitle,
              mainHeading: 'Special Events & Holidays 2026–27',
              subHeading: 'Bidirectional Lookup Index (When is Event / What Event is on Date)',
              headingPath: ['Campus Life', 'Events', 'Bidirectional Lookup'],
              departmentId: 'general',
              category: 'events',
              sectionTitle: 'Special Events — Bidirectional Lookup Directory (Event Name <-> Date)',
              content: bidiMatch[0],
              urls: extractUrls(bidiMatch[0]),
              lineNumber: startL,
            });
          }
        } else if (heading.includes('8.12')) {
          addChunk({
            documentTitle: docTitle,
            mainHeading: 'Placement Statistics & Recruiter Offers (2025–2026 Batch)',
            subHeading: '1828 Offers, 1529 Placed, 409 Companies & Full Company Breakdown',
            headingPath: ['Placements', 'Batch 2025-2026', 'Recruiter Offers'],
            departmentId: 'general',
            category: 'placement',
            sectionTitle: 'Placement Statistics 2025–2026 — Total Offers, Placed Students & Recruiter Offers',
            content,
            urls: extractUrls(content),
            lineNumber: startL,
          });
        } else if (heading.includes('8.13')) {
          addChunk({
            documentTitle: docTitle,
            mainHeading: 'General Examination Instructions & Hall Conduct Rules',
            subHeading: 'The 19 Mandatory Examination Instructions, Scribes & Hall Superintendent Rules',
            headingPath: ['Academics', 'Examinations', 'Instructions', 'Rules & Conduct'],
            departmentId: 'general',
            category: 'exam_rules',
            sectionTitle: 'General Examination Instructions — 19 Hall Conduct Rules, Calculators & Guidelines',
            content,
            urls: extractUrls(content),
            lineNumber: startL,
          });
        } else if (heading.includes('8.14')) {
          addChunk({
            documentTitle: docTitle,
            mainHeading: 'Controller of Examinations (COE) Office & Malpractice Penalties Matrix',
            subHeading: 'COE Contacts, Portal Services & 30-Clause Malpractice Penalty Table',
            headingPath: ['Academics', 'Examinations', 'COE Office', 'Malpractice Penalties Matrix'],
            departmentId: 'general',
            category: 'malpractice',
            sectionTitle: 'Controller of Examinations — COE Office, Portal & 30-Clause Malpractice Matrix',
            content,
            urls: extractUrls(content),
            lineNumber: startL,
          });
        }
      };

      while (i < lines.length) {
        const cur = lines[i].trim();
        if (cur.match(/^##\s*8\.\d+/)) {
          flushSection8Chunk(curHeading, curLines, curStartLine);
          curHeading = cur;
          curStartLine = i + 1;
          curLines.length = 0;
          curLines.push(cur);
          i++;
          continue;
        }
        if (cur && !cur.startsWith('=')) curLines.push(cur);
        i++;
      }
      flushSection8Chunk(curHeading, curLines, curStartLine);
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
  'many', 'members', 'member', 'number', 'count', 'total',
  'study', 'studies', 'studyin', 'studying',
  'எந்த', 'எப்போது', 'எங்கே', 'யார்', 'என்ன', 'எவ்வளவு', 'எப்படி'
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
  wifi: ['wifi', 'wi-fi', 'wireless', 'kongu_wifi', 'netid', 'firewall', 'mac address', 'internet', 'registration form'],
  'wi-fi': ['wifi', 'wi-fi', 'wireless', 'kongu_wifi', 'netid', 'firewall', 'mac address', 'internet', 'registration form'],
  wireless: ['wifi', 'wi-fi', 'wireless', 'kongu_wifi'],
  kongu_wifi: ['wifi', 'wi-fi', 'wireless', 'kongu_wifi', 'netid', 'firewall'],
  netid: ['netid', 'firewall', 'wifi', 'wi-fi', 'kongu_wifi'],
  cat: ['cat', 'ca test', 'continuous assessment', 'exam', 'test'],
  'ca test': ['cat', 'ca test', 'continuous assessment', 'test'],
  calendar: ['calendar', 'academic calendar', 'schedule', 'academic schedule'],
  schedule: ['schedule', 'academic schedule', 'calendar', 'academic calendar'],
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
  // Curricula, Courses, Subjects, Regulations, Semesters
  curriculum: ['curriculum', 'syllabus', 'course', 'courses', 'subject', 'subjects', 'semester', 'sem', 'regulation', 'r2024'],
  curriculums: ['curriculum', 'syllabus', 'course', 'courses', 'subject', 'subjects', 'semester', 'regulation'],
  syllabus: ['syllabus', 'curriculum', 'course', 'courses', 'subject', 'subjects', 'semester'],
  course: ['course', 'courses', 'subject', 'subjects', 'curriculum', 'syllabus'],
  courses: ['course', 'courses', 'subject', 'subjects', 'curriculum', 'syllabus'],
  subject: ['subject', 'subjects', 'course', 'courses', 'curriculum', 'syllabus'],
  subjects: ['subject', 'subjects', 'course', 'courses', 'curriculum', 'syllabus'],
  semester: ['semester', 'sem', 'curriculum', 'syllabus', 'course', 'subjects'],
  semesters: ['semester', 'sem', 'curriculum', 'syllabus', 'course', 'subjects'],
  sem: ['semester', 'sem', 'curriculum', 'syllabus', 'course'],
  regulation: ['regulation', 'regulations', 'r2024', 'r2022', 'autonomous', 'curriculum'],
  regulations: ['regulation', 'regulations', 'r2024', 'r2022', 'rules', 'curriculum'],
  cloud: ['cloud', 'cloud computing', '24itc52', '24cs601'],
  computing: ['computing', 'cloud computing', 'computer systems'],
  ragging: ['ragging', 'anti-ragging', 'act no.7', 'penalty', 'discipline', 'suspension', 'prohibition', 'fine'],
  dress: ['dress code', 'dress', 'uniform', 'shoes', 'churidar', 'trousers', 'dupatta'],
  dresscode: ['dress code', 'dress', 'uniform', 'shoes', 'churidar', 'trousers', 'dupatta'],
  uniform: ['dress code', 'uniform', 'dress', 'churidar', 'trousers'],
  helmet: ['helmet', 'helmets', 'two-wheeler', 'pillion', 'rules'],
  helmets: ['helmet', 'helmets', 'two-wheeler', 'pillion', 'rules'],
  mobile: ['mobile', 'cell phone', 'phone', 'banned', 'rules'],
  rule: ['rules', 'regulation', 'regulations', 'discipline', 'conduct', 'penalty'],
  rules: ['rules', 'regulation', 'regulations', 'discipline', 'conduct', 'penalty'],
  conduct: ['conduct', 'discipline', 'rules', 'regulations'],
  discipline: ['discipline', 'conduct', 'rules', 'regulations', 'penalty'],
  penalty: ['penalty', 'fine', 'ragging', 'imprisonment', 'expulsion', 'suspension'],
  fine: ['fine', 'penalty', 'rules', 'bus fee fine', 'late fee'],
  fines: ['fine', 'penalty', 'rules'],
  attendance: ['attendance', 'leave', 'lecture hour', 'rules'],
  identity: ['identity card', 'id card', 'rules'],
  governing: ['governing council', 'governing', 'council', 'sathiyamurthi', 'devarajan'],
  trust: ['trust', 'kvitt', 'trustee', 'trustees', 'office bearers', 'patron'],
  trustee: ['trust', 'kvitt', 'trustee', 'trustees', 'office bearers'],
  trustees: ['trust', 'kvitt', 'trustee', 'trustees', 'office bearers'],
  council: ['governing council', 'academic council', 'council', 'members'],
  patron: ['patron', 'patron members', 'kvitt', 'trust'],
  principal: ['principal', 'dr. r. parameshwaran', 'head of institution', 'head of the institution'],
  coe: ['controller of examinations', 'coe', 'thamilselvan', 'academic council'],
  dean: ['dean', 'dean academic', 'murugesan'],
  registrar: ['registrar', 'balasubramanie'],
  radio: ['kongu fm', 'fm', '90.4mhz', 'radio', 'broadcast'],
  fm: ['kongu fm', 'fm', '90.4mhz', 'radio', 'broadcast'],
  broadcast: ['broadcast', 'kongu fm', '90.4mhz', 'timings'],
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
  'கிளவுட்': ['cloud', 'cloud computing'],
  'கம்ப்யூட்டிங்': ['computing', 'cloud computing'],
  'செமஸ்டர்': ['semester', 'sem', 'curriculum', 'syllabus'],
  'செமஸ்டரில்': ['semester', 'sem', 'curriculum', 'syllabus'],
  'பாடம்': ['course', 'subject', 'curriculum', 'syllabus'],
  'பாடங்கள்': ['course', 'courses', 'subject', 'subjects'],
  'பாடத்திட்டம்': ['curriculum', 'syllabus', 'course'],
  'படிப்பார்கள்': ['study', 'curriculum', 'course', 'semester'],
  'படிப்பு': ['study', 'programme', 'degree'],
  'ஆடை': ['dress code', 'dress', 'rules'],
  'கட்டுப்பாடு': ['rules', 'discipline', 'regulations'],
  'ராகிங்': ['ragging', 'anti-ragging', 'act no.7', 'penalty'],
  'ஹெல்மெட்': ['helmet', 'rules'],
  'முதல்வர்': ['principal', 'parameshwaran'],
  'விதிமுறைகள்': ['rules', 'regulations', 'discipline'],
  'விதிகள்': ['rules', 'regulations', 'discipline'],
  'அபராதம்': ['fine', 'penalty'],
  'தண்டனை': ['penalty', 'imprisonment', 'fine'],
  'வருகை': ['attendance', 'rules'],
  'அடையாள அட்டை': ['identity card', 'id card'],
  'வானொலி': ['kongu fm', 'fm', '90.4mhz', 'radio'],
  'அலைவரிசை': ['kongu fm', 'fm', '90.4mhz', 'radio'],
  'அறக்கட்டளை': ['trust', 'kvitt'],
  'ஆட்சி மன்றம்': ['governing council', 'council'],
  'கல்வி மன்றம்': ['academic council', 'council'],
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
  padippanga: ['study', 'semester', 'curriculum', 'course'],
  padippaanga: ['study', 'semester', 'curriculum', 'course'],
  padipanga: ['study', 'semester', 'curriculum', 'course'],
  padika: ['study', 'semester', 'curriculum', 'course'],
  padikkanum: ['study', 'semester', 'curriculum', 'course'],
  varum: ['offered', 'scheduled', 'semester', 'curriculum'],
  varudhu: ['offered', 'scheduled', 'semester', 'curriculum'],
  varumla: ['offered', 'scheduled', 'semester', 'curriculum'],
  eppo: ['when', 'timing', 'semester'],
  eppodhu: ['when', 'timing', 'semester'],
  enga: ['where', 'location'],
  engae: ['where', 'location'],
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
  // Special Events & Cultural Fests
  enthusia: ['enthusia', 'cultural fest', 'events', '05 march 2027', 'march 5'],
  enthusiya: ['enthusia', 'cultural fest', 'events', '05 march 2027', 'march 5'],
  entusia: ['enthusia', 'cultural fest', 'events', '05 march 2027', 'march 5'],
  enthusa: ['enthusia', 'cultural fest', 'events', '05 march 2027', 'march 5'],
  swaram: ['swaram', 'musical fest', 'events', '12 march 2027', 'march 12'],
  swaramu: ['swaram', 'musical fest', 'events', '12 march 2027', 'march 12'],
  swaramfest: ['swaram', 'musical fest', 'events', '12 march 2027', 'march 12'],
  trophy: ['kongu trophy', 'sports', 'events', '19 september 2026', 'september 19'],
  trofy: ['kongu trophy', 'sports', 'events', '19 september 2026', 'september 19'],
  technocultural: ['techno cultural fest', 'founders day', '18 september 2026'],
  cultural: ['cultural fest', 'enthusia', 'techno cultural', 'events'],
  culturals: ['cultural fest', 'enthusia', 'techno cultural', 'events'],
  farewell: ['farewell day', '19 march 2027', 'events'],
  // Examination Rules & Conduct
  scribe: ['scribe', 'temporary illness', 'blind candidate', 'special fee'],
  scribes: ['scribe', 'temporary illness', 'blind candidate', 'special fee'],
  impersonation: ['impersonation', 'police', 'handover to police', 'debarment'],
  calculator: ['calculator', 'non-programmable calculator'],
  calculators: ['calculator', 'non-programmable calculator'],
  roughwork: ['rough work', 'answer book itself'],
  superintendent: ['hall superintendent', 'chief superintendent', 'exam instructions'],
  superintendant: ['hall superintendent', 'chief superintendent', 'exam instructions'],
  malpractice: ['malpractice', 'penalty', 'punishment', 'debarment', 'fine'],
  malpractices: ['malpractice', 'penalty', 'punishment', 'debarment', 'fine'],
  debar: ['debarment', 'debarred', 'malpractice', 'punishment'],
  debarred: ['debarment', 'debarred', 'malpractice', 'punishment'],
  coe: ['controller of examinations', 'coe', 'coe@kongu.ac.in', '04294-226645'],
  soliton: ['soliton technologies', 'placement', 'offers'],
  rubrik: ['rubrik', 'placement', 'offers'],
  jpmorgan: ['jpmorgan chase', 'placement', 'offers'],
  deloitte: ['deloitte india', 'placement', 'offers'],
  accenture: ['accenture', 'aase', 'ase', 'placement', 'offers'],
  cognizant: ['cognizant', 'placement', 'offers'],
};

export const KEY_CAMPUS_TERMS = [
  'automobile', 'mechanical', 'mechatronics', 'instrumentation',
  'electronics', 'communication', 'electrical', 'computer',
  'faculty', 'faculties', 'professor', 'professors',
  'principal', 'admission', 'counselling', 'scholarship',
  'placement', 'placements', 'hostel', 'hostels', 'warden',
  'library', 'timing', 'timings', 'transport', 'shuttle',
  'cutoff', 'cutoffs', 'salary', 'salaries', 'package',
  'concession', 'autonomous', 'curriculum', 'syllabus',
  'semester', 'semesters', 'course', 'courses', 'subject',
  'ragging', 'dresscode', 'helmet', 'mobile', 'discipline',
  'governance', 'trust', 'trustee', 'council', 'academic',
  'wifi', 'wireless', 'kongu_wifi', 'netid', 'firewall',
  'enthusia', 'swaram', 'trophy', 'superintendent', 'malpractice',
  'scribe', 'impersonation', 'calculator', 'penalties'
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
  phrases: string[];
  intendedSummary: string;
}

/**
 * Understands the user's intended question before searching the knowledge base:
 * - Detects department even with severe typos or colloquial names.
 * - Detects category (transport, timings, scholarship, faculty, placement, curriculum, rules, governance, etc.).
 * - Maps Tamil, Tanglish, and misspelled tokens to core English search concepts.
 * - Extracts exact multi-word key phrases and entity names.
 * - Applies Levenshtein fuzzy correction against key campus terms.
 */
export function understandAndNormalizeQuery(query: string): NormalizedQueryContext {
  const clean = query.trim();
  const lower = clean.toLowerCase();

  let dept = resolveDepartmentFromQuery(query);
  let category = resolveCategoryFromQuery(query);

  const detectedPhrases: string[] = [];
  const COMMON_PHRASES = [
    'cloud computing',
    'deep learning',
    'data structures',
    'dress code',
    'act no.7',
    'act no 7',
    'governing council',
    'academic council',
    'board of studies',
    'office bearers',
    'patron members',
    'working hours',
    'class hours',
    'library hours',
    'computer centre',
    'kongu fm',
    '90.4mhz',
    'first graduate',
    '7.5%',
    'dr. r. parameshwaran',
    'parameshwaran',
    'dr. p. c. murugan',
    'p. c. murugan',
    'thiru. c. devarajan',
    'devarajan',
    'thiru. r. r. sathiyamurthi',
    'sathiyamurthi',
    'dr. m. a. bhagyaveni',
    'bhagyaveni',
    'k. k. tamilarasan',
    'tamilarasan',
    'dr. c. valliyammai',
    'valliyammai',
    'dr. r. thamilselvan',
    'thamilselvan',
    'dr. g. murugesan',
    'murugesan',
    'dr. s. varadhaganapathy',
    'varadhaganapathy',
    'kongu_wifi',
    'wi-fi',
    'wifi registration',
    'registration form',
    'mac address',
    'cat 1',
    'cat 2',
    'cat 3',
    'ca test-1',
    'ca test-2',
    'ca test-3',
    'project review',
    'viva voce',
    'last working day',
    'academic schedule',
    'academic calendar',
    'reopening',
    'improvement test',
    'enthusia',
    'swaram',
    'kongu trophy',
    'techno cultural fest',
    'founders day',
    'sports day',
    'annual day',
    'farewell day',
    'krishna jayanthi',
    'vinayakar chathurthi',
    'dheeran chinnamalai',
    'milad-un-nabi',
    'ayutha pooja',
    'vijaya dasami',
    'muharram',
    'deepavali',
    'thiruvalluvar day',
    'uzhavar thirunal',
    'thaipoosam',
    'telugu new year',
    'tamil new year',
    'mahavir jayanthi',
    'good friday',
    'may day',
    'examination instructions',
    'examination rules',
    'hall superintendent',
    'non-programmable calculator',
    'blue or black ink',
    'rough work',
    'impersonation',
    'controller of examinations',
    'malpractice offences',
    'examination disciplinary committee',
    'medical leave form',
    'break of study',
    'exam withdrawal',
    'cgpa conversion',
    'duplicate grade sheet',
    'soliton technologies',
    'deloitte india',
    'jpmorgan chase',
    'rubrik'
  ];

  for (const cp of COMMON_PHRASES) {
    if (lower.includes(cp)) {
      detectedPhrases.push(cp);
    }
  }

  // Bidirectional Event & Date Normalization
  // If user asks about a specific date (e.g. "what is on 19 march", "events on march 5", "sep 18", etc.)
  const dateEventMap: Record<string, { dateFull: string; altDate: string; events: string[] }> = {
    '18 sep': { dateFull: '18 september 2026', altDate: 'september 18', events: ['techno cultural fest', 'founders day'] },
    '18 september': { dateFull: '18 september 2026', altDate: 'september 18', events: ['techno cultural fest', 'founders day'] },
    'september 18': { dateFull: '18 september 2026', altDate: 'september 18', events: ['techno cultural fest', 'founders day'] },
    '19 sep': { dateFull: '19 september 2026', altDate: 'september 19', events: ['kongu trophy'] },
    '19 september': { dateFull: '19 september 2026', altDate: 'september 19', events: ['kongu trophy'] },
    'september 19': { dateFull: '19 september 2026', altDate: 'september 19', events: ['kongu trophy'] },
    '5 mar': { dateFull: '05 march 2027', altDate: 'march 5', events: ['enthusia'] },
    '05 mar': { dateFull: '05 march 2027', altDate: 'march 5', events: ['enthusia'] },
    '5 march': { dateFull: '05 march 2027', altDate: 'march 5', events: ['enthusia'] },
    '05 march': { dateFull: '05 march 2027', altDate: 'march 5', events: ['enthusia'] },
    'march 5': { dateFull: '05 march 2027', altDate: 'march 5', events: ['enthusia'] },
    '12 mar': { dateFull: '12 march 2027', altDate: 'march 12', events: ['swaram'] },
    '12 march': { dateFull: '12 march 2027', altDate: 'march 12', events: ['swaram'] },
    'march 12': { dateFull: '12 march 2027', altDate: 'march 12', events: ['swaram'] },
    '19 mar': { dateFull: '19 march 2027', altDate: 'march 19', events: ['sports day', 'annual day', 'farewell day'] },
    '19 march': { dateFull: '19 march 2027', altDate: 'march 19', events: ['sports day', 'annual day', 'farewell day'] },
    'march 19': { dateFull: '19 march 2027', altDate: 'march 19', events: ['sports day', 'annual day', 'farewell day'] },
    '3 aug': { dateFull: '03 august 2026', altDate: 'august 3', events: ['krishna jayanthi'] },
    '3 august': { dateFull: '03 august 2026', altDate: 'august 3', events: ['krishna jayanthi'] },
    'august 3': { dateFull: '03 august 2026', altDate: 'august 3', events: ['krishna jayanthi'] },
    '15 aug': { dateFull: '15 august 2026', altDate: 'august 15', events: ['independence day'] },
    '15 august': { dateFull: '15 august 2026', altDate: 'august 15', events: ['independence day'] },
    'august 15': { dateFull: '15 august 2026', altDate: 'august 15', events: ['independence day'] },
    '26 aug': { dateFull: '26 august 2026', altDate: 'august 26', events: ['vinayakar chathurthi'] },
    '26 august': { dateFull: '26 august 2026', altDate: 'august 26', events: ['vinayakar chathurthi'] },
    'august 26': { dateFull: '26 august 2026', altDate: 'august 26', events: ['vinayakar chathurthi'] },
    '4 sep': { dateFull: '04 september 2026', altDate: 'september 4', events: ['dheeran chinnamalai'] },
    '4 september': { dateFull: '04 september 2026', altDate: 'september 4', events: ['dheeran chinnamalai'] },
    'september 4': { dateFull: '04 september 2026', altDate: 'september 4', events: ['dheeran chinnamalai'] },
    '14 sep': { dateFull: '14 september 2026', altDate: 'september 14', events: ['inauguration'] },
    '14 september': { dateFull: '14 september 2026', altDate: 'september 14', events: ['inauguration'] },
    'september 14': { dateFull: '14 september 2026', altDate: 'september 14', events: ['inauguration'] },
    '16 sep': { dateFull: '16 september 2026', altDate: 'september 16', events: ['milad-un-nabi'] },
    '16 september': { dateFull: '16 september 2026', altDate: 'september 16', events: ['milad-un-nabi'] },
    'september 16': { dateFull: '16 september 2026', altDate: 'september 16', events: ['milad-un-nabi'] },
    '19 oct': { dateFull: '19 october 2026', altDate: 'october 19', events: ['ayutha pooja'] },
    '19 october': { dateFull: '19 october 2026', altDate: 'october 19', events: ['ayutha pooja'] },
    'october 19': { dateFull: '19 october 2026', altDate: 'october 19', events: ['ayutha pooja'] },
    '20 oct': { dateFull: '20 october 2026', altDate: 'october 20', events: ['vijaya dasami'] },
    '20 october': { dateFull: '20 october 2026', altDate: 'october 20', events: ['vijaya dasami'] },
    'october 20': { dateFull: '20 october 2026', altDate: 'october 20', events: ['vijaya dasami'] },
    '21 oct': { dateFull: '21 october 2026', altDate: 'october 21', events: ['muharram'] },
    '21 october': { dateFull: '21 october 2026', altDate: 'october 21', events: ['muharram'] },
    'october 21': { dateFull: '21 october 2026', altDate: 'october 21', events: ['muharram'] },
    '8 nov': { dateFull: '08 november 2026', altDate: 'deepavali', events: ['deepavali'] },
    '9 nov': { dateFull: '09 november 2026', altDate: 'deepavali', events: ['deepavali'] },
    '25 dec': { dateFull: '25 december 2026', altDate: 'december 25', events: ['christmas'] },
    '25 december': { dateFull: '25 december 2026', altDate: 'december 25', events: ['christmas'] },
    '1 jan': { dateFull: '01 january 2027', altDate: 'january 1', events: ['new year'] },
    '1 january': { dateFull: '01 january 2027', altDate: 'january 1', events: ['new year'] },
    '16 jan': { dateFull: '16 january 2027', altDate: 'january 16', events: ['thiruvalluvar day'] },
    '16 january': { dateFull: '16 january 2027', altDate: 'january 16', events: ['thiruvalluvar day'] },
    '17 jan': { dateFull: '17 january 2027', altDate: 'january 17', events: ['uzhavar thirunal'] },
    '17 january': { dateFull: '17 january 2027', altDate: 'january 17', events: ['uzhavar thirunal'] },
    '22 jan': { dateFull: '22 january 2027', altDate: 'january 22', events: ['thaipoosam'] },
    '22 january': { dateFull: '22 january 2027', altDate: 'january 22', events: ['thaipoosam'] },
    '26 jan': { dateFull: '26 january 2027', altDate: 'january 26', events: ['republic day'] },
    '26 january': { dateFull: '26 january 2027', altDate: 'january 26', events: ['republic day'] },
    '31 mar': { dateFull: '31 march 2027', altDate: 'march 31', events: ['telugu new year'] },
    '31 march': { dateFull: '31 march 2027', altDate: 'march 31', events: ['telugu new year'] },
    '5 apr': { dateFull: '05 april 2027', altDate: 'april 5', events: ['ramzan'] },
    '5 april': { dateFull: '05 april 2027', altDate: 'april 5', events: ['ramzan'] },
    '14 apr': { dateFull: '14 april 2027', altDate: 'april 14', events: ['tamil new year', 'ambedkar'] },
    '14 april': { dateFull: '14 april 2027', altDate: 'april 14', events: ['tamil new year', 'ambedkar'] },
    '21 apr': { dateFull: '21 april 2027', altDate: 'april 21', events: ['mahavir jayanthi'] },
    '21 april': { dateFull: '21 april 2027', altDate: 'april 21', events: ['mahavir jayanthi'] },
    '30 apr': { dateFull: '30 april 2027', altDate: 'april 30', events: ['good friday'] },
    '30 april': { dateFull: '30 april 2027', altDate: 'april 30', events: ['good friday'] },
    '1 may': { dateFull: '01 may 2027', altDate: 'may 1', events: ['may day'] },
  };

  for (const [key, val] of Object.entries(dateEventMap)) {
    if (lower.includes(key)) {
      detectedPhrases.push(val.dateFull);
      detectedPhrases.push(val.altDate);
      for (const ev of val.events) {
        detectedPhrases.push(ev);
      }
      if (!category) category = 'events';
      break;
    }
  }

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

  // Cross-lingual concept bridge for Tamil script in query
  if (lower.includes('கிளவுட்') || lower.includes('கம்ப்யூட்டிங்')) {
    detectedPhrases.push('cloud computing');
    expanded.add('cloud');
    expanded.add('computing');
    expanded.add('cloud computing');
    if (!category) category = 'curriculum';
  }
  if (lower.includes('செமஸ்டர்') || lower.includes('செமஸ்டரில்')) {
    expanded.add('semester');
    expanded.add('curriculum');
    if (!category) category = 'curriculum';
  }
  if (lower.includes('பாடம்') || lower.includes('பாடத்திட்டம்') || lower.includes('பாடங்கள்')) {
    expanded.add('curriculum');
    expanded.add('syllabus');
    expanded.add('course');
    if (!category) category = 'curriculum';
  }
  if (lower.includes('ஆடை') || lower.includes('டிரஸ்')) {
    detectedPhrases.push('dress code');
    expanded.add('dress');
    expanded.add('dress code');
    expanded.add('rules');
    if (!category) category = 'rules';
  }
  if (lower.includes('ராகிங்')) {
    expanded.add('ragging');
    expanded.add('penalty');
    expanded.add('rules');
    if (!category) category = 'rules';
  }
  if (lower.includes('ஹெல்மெட்')) {
    expanded.add('helmet');
    expanded.add('rules');
    if (!category) category = 'rules';
  }
  if (lower.includes('முதல்வர்')) {
    expanded.add('principal');
    expanded.add('parameshwaran');
    if (!category) category = 'principal';
  }
  if (lower.includes('அறக்கட்டளை')) {
    expanded.add('trust');
    expanded.add('kvitt');
    if (!category) category = 'governance';
  }
  if (lower.includes('ஆட்சி மன்றம்')) {
    detectedPhrases.push('governing council');
    expanded.add('governing');
    expanded.add('council');
    if (!category) category = 'governance';
  }
  if (lower.includes('கல்வி மன்றம்')) {
    detectedPhrases.push('academic council');
    expanded.add('academic');
    expanded.add('council');
    if (!category) category = 'governance';
  }
  if (lower.includes('வைபை') || lower.includes('வை-பை') || lower.includes('வை ஃபை')) {
    detectedPhrases.push('wifi');
    expanded.add('wifi');
    expanded.add('wireless');
    expanded.add('kongu_wifi');
    if (!category) category = 'wifi';
  }
  if (lower.includes('நிகழ்ச்சி') || lower.includes('விழா') || lower.includes('நிகழ்வு')) {
    expanded.add('event');
    expanded.add('events');
    expanded.add('special');
    if (!category) category = 'events';
  }
  if (lower.includes('என்சியூசியா') || lower.includes('என்ஸூசியா') || lower.includes('என்சியுசியா')) {
    detectedPhrases.push('enthusia');
    expanded.add('enthusia');
    expanded.add('05 march 2027');
    if (!category) category = 'events';
  }
  if (lower.includes('சுவரம்')) {
    detectedPhrases.push('swaram');
    expanded.add('swaram');
    expanded.add('12 march 2027');
    if (!category) category = 'events';
  }
  if (lower.includes('கொங்கு டிராபி')) {
    detectedPhrases.push('kongu trophy');
    expanded.add('kongu trophy');
    expanded.add('19 september 2026');
    if (!category) category = 'events';
  }
  if (lower.includes('விளையாட்டு தினம்')) {
    detectedPhrases.push('sports day');
    expanded.add('sports day');
    expanded.add('19 march 2027');
    if (!category) category = 'events';
  }
  if (lower.includes('ஆண்டு விழா')) {
    detectedPhrases.push('annual day');
    expanded.add('annual day');
    expanded.add('19 march 2027');
    if (!category) category = 'events';
  }
  if (lower.includes('பிரியாவிடை')) {
    detectedPhrases.push('farewell day');
    expanded.add('farewell day');
    expanded.add('19 march 2027');
    if (!category) category = 'events';
  }
  if (lower.includes('தேர்வு விதிகள்') || lower.includes('தேர்வு விதிமுறைகள்')) {
    detectedPhrases.push('examination instructions');
    expanded.add('examination');
    expanded.add('rules');
    expanded.add('instructions');
    if (!category) category = 'exam_rules';
  }
  if (lower.includes('ஆள்மாறாட்டம்')) {
    detectedPhrases.push('impersonation');
    expanded.add('impersonation');
    expanded.add('police');
    if (!category) category = 'malpractice';
  }

  // Conversational Tanglish bridge
  if (lower.includes('padippanga') || lower.includes('padika') || lower.includes('padikkanum') || lower.includes('padippaanga')) {
    expanded.add('curriculum');
    expanded.add('syllabus');
    expanded.add('semester');
    if (!category) category = 'curriculum';
  }
  if (lower.includes('varum') || lower.includes('varudhu')) {
    expanded.add('semester');
    expanded.add('curriculum');
  }
  if (lower.includes('sem ') || lower.endsWith('sem') || lower.includes('semester')) {
    expanded.add('semester');
    expanded.add('curriculum');
    if (!category) category = 'curriculum';
  }
  if (lower.includes('eppodhu') || lower.includes('eppo')) {
    expanded.add('when');
    expanded.add('date');
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
    if (category === 'curriculum') {
      expanded.add('curriculum');
      expanded.add('syllabus');
      expanded.add('semester');
      expanded.add('course');
    } else if (category === 'rules') {
      expanded.add('rules');
      expanded.add('discipline');
      expanded.add('regulations');
    } else if (category === 'governance') {
      expanded.add('trust');
      expanded.add('governing');
      expanded.add('council');
    } else if (category === 'principal') {
      expanded.add('principal');
      expanded.add('parameshwaran');
    } else if (category === 'transport') {
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
      expanded.add('offers');
      expanded.add('companies');
    } else if (category === 'wifi') {
      expanded.add('wifi');
      expanded.add('wi-fi');
      expanded.add('wireless');
      expanded.add('kongu_wifi');
      expanded.add('registration');
      expanded.add('form');
      expanded.add('netid');
      expanded.add('firewall');
    } else if (category === 'events') {
      expanded.add('event');
      expanded.add('events');
      expanded.add('special');
      expanded.add('fest');
      expanded.add('cultural');
      expanded.add('date');
      expanded.add('holiday');
    } else if (category === 'exam_rules') {
      expanded.add('examination');
      expanded.add('exam');
      expanded.add('rules');
      expanded.add('instructions');
      expanded.add('hall');
      expanded.add('superintendent');
      expanded.add('calculator');
    } else if (category === 'malpractice') {
      expanded.add('malpractice');
      expanded.add('penalty');
      expanded.add('punishment');
      expanded.add('debarred');
      expanded.add('controller');
      expanded.add('coe');
    } else if (category === 'academic_calendar') {
      expanded.add('academic');
      expanded.add('calendar');
      expanded.add('schedule');
      expanded.add('cat');
      expanded.add('test');
      expanded.add('exam');
      expanded.add('semester');
    }
  }

  const intendedSummary = [
    dept ? `Dept: ${dept.name}` : null,
    category ? `Category: ${category}` : null,
    `Phrases: ${detectedPhrases.join(', ') || 'None'}`,
    `Terms: ${Array.from(expanded).slice(0, 8).join(', ')}`,
  ]
    .filter(Boolean)
    .join(' | ');

  return {
    cleanQuery: clean,
    department: dept,
    category,
    expandedTerms: Array.from(expanded),
    phrases: detectedPhrases,
    intendedSummary,
  };
}

/**
 * Global Intelligent Information Retrieval Engine:
 * 1. Strict Department-First Retrieval when asking for department staff or placement figures.
 * 2. Cross-domain semantic & hybrid retrieval across curriculum, rules, governance, principal, admissions, hostels, transport, scholarships.
 * 3. Exact phrase & entity matching to retrieve precise facts irrespective of phrasing.
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

  // CASE 1: DEPARTMENT-SCOPED QUERY FOR FACULTY / PLACEMENTS / INTAKE / HOD
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

  // CASE 2: GENERAL OR OPEN-ENDED QUERY (HYBRID & PHRASE RETRIEVAL)
  const searchTerms = new Set<string>(norm.expandedTerms);

  // Candidate pool: if targetDept is set, prioritize department chunks + general chunks
  // If no targetDept is set, search all chunks across college
  const candidatePool = targetDept
    ? knowledge.chunks.filter((c) => c.departmentId === targetDept.id || c.departmentId === 'general')
    : knowledge.chunks;

  const scored = candidatePool.map((chunk) => {
    let score = 0;
    const lowerContent = chunk.content.toLowerCase();
    const lowerSection = chunk.sectionTitle.toLowerCase();
    const lowerHeadPath = chunk.headingPath.join(' ').toLowerCase();
    const matchedConcepts = new Set<string>();

    // 1. Exact multi-word phrase matching (highest precision for topics like "cloud computing", "dress code", "act no.7", etc.)
    for (const phrase of norm.phrases) {
      if (lowerSection.includes(phrase) || lowerHeadPath.includes(phrase)) {
        score += 200;
        matchedConcepts.add(phrase);
      } else if (lowerContent.includes(phrase)) {
        score += 150;
        matchedConcepts.add(phrase);
      }
    }

    // 2. Individual search terms
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

    // 3. Multi-concept synergy
    if (matchedConcepts.size > 1) {
      score *= 1 + matchedConcepts.size * 1.5;
    }

    // 4. Category alignment
    if (targetCategory && chunk.category === targetCategory) {
      score += 160;
    }

    // 5. Department alignment
    if (targetDept && chunk.departmentId === targetDept.id) {
      if (targetCategory && chunk.category === targetCategory) {
        score += 250;
      } else if (!targetCategory) {
        score += 60;
      }
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
  'timing', 'timings', 'hours', 'working', 'office', 'library', 'tnea', 'tancet',
  'curriculum', 'syllabus', 'course', 'courses', 'subject', 'subjects', 'semester', 'sem', 'regulation', 'r2024',
  'cloud', 'computing', 'deep', 'learning', 'programming', 'devops', 'cryptography',
  'ragging', 'dress', 'dresscode', 'helmet', 'mobile', 'attendance', 'discipline', 'penalty', 'fine',
  'governing', 'council', 'academic', 'trust', 'patron', 'devarajan', 'sathiyamurthi', 'parameshwaran',
  'wifi', 'wi-fi', 'kongu_wifi', 'wireless', 'netid', 'firewall',
  'calendar', 'schedule', 'cat', 'viva', 'reopening',
  'enthusia', 'swaram', 'trophy', 'founders', 'sports day', 'annual day', 'farewell',
  'exam', 'examination', 'superintendent', 'calculator', 'scribe', 'rough', 'malpractice',
  'soliton', 'rubrik', 'jpmorgan', 'deloitte', 'cognizant', 'accenture', 'offers', '1828', '1529', '409'
]);

export function hasStrongKnowledgeCoverage(
  query: string,
  candidates: KnowledgeChunk[],
  normContext?: NormalizedQueryContext
): boolean {
  if (!candidates || candidates.length === 0) return false;

  // 0. Use Normalized Context if supplied (highest reliability across Tamil, Tanglish, & typos)
  if (normContext) {
    if (normContext.phrases && normContext.phrases.length > 0) {
      for (const phrase of normContext.phrases) {
        for (const chunk of candidates.slice(0, 8)) {
          if (
            chunk.content.toLowerCase().includes(phrase) ||
            chunk.sectionTitle.toLowerCase().includes(phrase) ||
            chunk.headingPath.join(' ').toLowerCase().includes(phrase)
          ) {
            return true;
          }
        }
      }
    }
    if (
      normContext.category === 'events' ||
      normContext.category === 'exam_rules' ||
      normContext.category === 'malpractice' ||
      normContext.category === 'curriculum' ||
      normContext.category === 'placement' ||
      normContext.category === 'wifi' ||
      normContext.category === 'academic_calendar'
    ) {
      return true;
    }
    if (normContext.expandedTerms && normContext.expandedTerms.length > 0) {
      for (const chunk of candidates.slice(0, 8)) {
        const text = (chunk.sectionTitle + ' ' + chunk.headingPath.join(' ') + ' ' + chunk.content).toLowerCase();
        for (const term of normContext.expandedTerms) {
          if (SPECIFIC_DOMAIN_KEYWORDS.has(term) && text.includes(term)) {
            return true;
          }
        }
      }
    }
  }

  const clean = query.toLowerCase();

  // 1. Direct multi-word phrase match against top candidate chunks
  for (const phrase of [
    'cloud computing', 'deep learning', 'data structures', 'dress code', 'act no.7', 'act no 7',
    'governing council', 'academic council', 'working hours', 'library hours', 'computer centre',
    'kongu fm', 'first graduate', '7.5%', 'parameshwaran', 'devarajan', 'sathiyamurthi', 'murugan',
    'kongu_wifi', 'wi-fi', 'wifi',
    'academic schedule', 'academic calendar', 'cat 1', 'cat 2', 'cat 3', 'ca test', 'project review', 'last working day',
    'enthusia', 'swaram', 'kongu trophy', 'techno cultural fest', 'founders day', 'sports day', 'annual day', 'farewell day',
    'examination instructions', 'examination rules', 'hall superintendent', 'non-programmable calculator',
    'controller of examinations', 'malpractice offences', 'zero tolerance policy', 'soliton technologies', '1828'
  ]) {
    if (clean.includes(phrase)) {
      for (const chunk of candidates.slice(0, 8)) {
        if (chunk.content.toLowerCase().includes(phrase) || chunk.sectionTitle.toLowerCase().includes(phrase)) {
          return true;
        }
      }
    }
  }

  // 2. Token overlap and domain keyword matching
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

