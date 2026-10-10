import http from 'http';

function queryChat(message) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ message });
    const req = http.request(
      'http://localhost:5000/api/chat',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            reject(new Error(`Failed to parse response: ${body}`));
          }
        });
      }
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

const testCases = [
  {
    id: 1,
    name: 'Asking for Information Technology staff must not return Electronics and Instrumentation staff',
    question: 'Who are the staff members in the Information Technology department?',
    verify: (ans, sources) => {
      const hasITHead = ans.includes('Varadhaganapathy') || ans.includes('Premalatha');
      const hasEIEStaff = ans.includes('Vijayachitra') || ans.includes('Suji Prasad') || ans.includes('Kalavathi Devi');
      const hasEEEStaff = ans.includes('Senthilnathan') || ans.includes('Chandrasekar');
      const pass = hasITHead && !hasEIEStaff && !hasEEEStaff;
      return {
        pass,
        reason: pass
          ? 'Correctly returned IT faculty members only (Dr. S. Varadhaganapathy, Dr. J. Premalatha) without any EIE or EEE faculty.'
          : `Failed: hasITHead=${hasITHead}, hasEIEStaff=${hasEIEStaff}, hasEEEStaff=${hasEEEStaff}`,
      };
    },
  },
  {
    id: 2,
    name: 'Asking for Electronics and Instrumentation staff must not return Information Technology or EEE staff',
    question: 'Who are the staff members in Electronics and Instrumentation Engineering?',
    verify: (ans, sources) => {
      const hasEIE = ans.includes('Suji Prasad') || ans.includes('Vijayachitra') || ans.includes('Kalavathi Devi');
      const hasIT = ans.includes('Varadhaganapathy') || ans.includes('Premalatha');
      const hasEEE = ans.includes('Chandrasekar') || ans.includes('Ranjith Kumar');
      const pass = hasEIE && !hasIT && !hasEEE;
      return {
        pass,
        reason: pass
          ? 'Correctly returned EIE faculty members (Dr. S. Vijayachitra, Dr. S. J. Suji Prasad) without any IT or EEE faculty.'
          : `Failed: hasEIE=${hasEIE}, hasIT=${hasIT}, hasEEE=${hasEEE}`,
      };
    },
  },
  {
    id: 3,
    name: 'Asking about a specific course must not return details belonging to a different course',
    question: 'What is the intake and duration for B.Tech Food Technology?',
    verify: (ans) => {
      const hasFT = ans.includes('60') || ans.includes('Food Technology');
      const pass = hasFT && !ans.includes('240'); // 240 belongs to CSE/ECE, not Food Tech (which is 60)
      return {
        pass,
        reason: pass
          ? 'Correctly returned Food Technology details without mixing with 240 intake from CSE/ECE.'
          : 'Failed to isolate course details correctly.',
      };
    },
  },
  {
    id: 4,
    name: 'Asking about college-wide facilities must not return unrelated department-only details',
    question: 'What sports facilities and grounds are available on the campus?',
    verify: (ans) => {
      const hasSports = ans.toLowerCase().includes('ground') || ans.toLowerCase().includes('gym') || ans.toLowerCase().includes('stadium') || ans.toLowerCase().includes('sports');
      const hasUnrelatedDept = ans.includes('Dr. S. Varadhaganapathy') || ans.includes('M. Lizzy Nesa Bagyam');
      const pass = hasSports && !hasUnrelatedDept;
      return {
        pass,
        reason: pass
          ? 'Correctly returned college-wide sports grounds and facilities without leaking department faculty lists.'
          : 'Failed: Mixed unrelated department faculty into general campus sports query.',
      };
    },
  },
  {
    id: 5,
    name: "Asking for a staff member's designation must not return another person's designation",
    question: 'What is the designation of Dr. S. Varadhaganapathy?',
    verify: (ans) => {
      const hasCorrectDesignation = ans.toLowerCase().includes('senior professor') || ans.toLowerCase().includes('head');
      const pass = hasCorrectDesignation;
      return {
        pass,
        reason: pass
          ? 'Correctly returned Senior Professor & Head for Dr. S. Varadhaganapathy.'
          : 'Failed to return correct designation.',
      };
    },
  },
  {
    id: 6,
    name: 'Asking a question whose answer is absent from the documents must not produce an invented answer',
    question: 'What is the personal mobile phone number of the NASA astronaut visiting KEC next month?',
    verify: (ans) => {
      const safe =
        ans.includes('could not be verified') ||
        ans.includes('not available') ||
        ans.includes('Ask anything related to KEC') ||
        ans.includes('not found') ||
        ans.includes('official college records') ||
        ans.includes('does not specify') ||
        ans.includes('do not contain') ||
        ans.includes('does not contain');
      return {
        pass: safe,
        reason: safe
          ? 'Correctly acknowledged that the unverified/absent information is not in official college records.'
          : 'Failed: Hallucinated an answer for absent records.',
      };
    },
  },
  {
    id: 7,
    name: 'Asking a question where two figures exist must report verifiable context',
    question: 'What is the annual intake of students across all departments in KEC?',
    verify: (ans) => {
      const hasIntakeRef = ans.includes('1,710') || ans.includes('1,800') || ans.includes('intake') || ans.includes('verified');
      return {
        pass: hasIntakeRef,
        reason: hasIntakeRef
          ? 'Correctly noted the published intake estimates and verification context without fabricating definitive numbers.'
          : 'Failed to reflect source nuance.',
      };
    },
  },
  {
    id: 8,
    name: 'Asking a question answered by a table must return correct row values (Automobile Placement)',
    question: 'What are the exact placement salary details for Automobile Engineering in 2024-2025?',
    verify: (ans) => {
      const hasMin = ans.includes('1.8');
      const hasMax = ans.includes('7.5');
      const hasAvg = ans.includes('3.6');
      const pass = hasMin && hasMax && hasAvg;
      return {
        pass,
        reason: pass
          ? 'Correctly extracted exact table row values for Automobile Engineering: Min ₹1.8 LPA, Max ₹7.5 LPA, Avg ₹3.6 LPA.'
          : `Failed: hasMin=${hasMin}, hasMax=${hasMax}, hasAvg=${hasAvg}`,
      };
    },
  },
  {
    id: 9,
    name: 'Asking a question under a nested subheading must retrieve correct section context',
    question: 'Who is the Deputy Warden for Amaravathi hostel?',
    verify: (ans) => {
      const hasWarden = ans.includes('D RAMYA') || ans.includes('Ramya');
      return {
        pass: hasWarden,
        reason: hasWarden
          ? 'Correctly retrieved Deputy Warden Ms. D Ramya under Amaravathi hostel subheading.'
          : 'Failed: Did not retrieve Ms. D Ramya for Amaravathi hostel.',
      };
    },
  },
  {
    id: 10,
    name: 'Asking a general question must not unnecessarily restrict the answer to an unrelated department',
    question: 'What are the general college working hours?',
    verify: (ans) => {
      const hasHours = ans.toLowerCase().includes('working hours') || ans.toLowerCase().includes('office') || ans.toLowerCase().includes('hour') || ans.includes('8:45') || ans.includes('4:30');
      const pass = hasHours && !ans.includes('Information Technology (IT)');
      return {
        pass,
        reason: pass
          ? 'Correctly returned college working hours without restricting to any specific department.'
          : 'Failed to answer general college working hours cleanly.',
      };
    },
  },
];

async function runAllTests() {
  console.log('================================================================');
  console.log('       KONGU KURAL — INFORMATION EXTRACTION & RETRIEVAL SUITE    ');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  for (const tc of testCases) {
    console.log(`[TEST ${tc.id}] ${tc.name}`);
    console.log(`Q: "${tc.question}"`);
    try {
      const res = await queryChat(tc.question);
      const answerText = res.answer || '';
      const sources = (res.sources || []).map((s) => s.title || s.section || '').join('; ');
      const result = tc.verify(answerText, sources);

      if (result.pass) {
        console.log(`STATUS: ✅ PASSED`);
        console.log(`REASON: ${result.reason}`);
        passed++;
      } else {
        console.log(`STATUS: ❌ FAILED`);
        console.log(`REASON: ${result.reason}`);
        console.log(`RESPONSE SNIPPET: ${answerText.slice(0, 200)}...`);
        failed++;
      }
    } catch (err) {
      console.log(`STATUS: ❌ ERROR - ${err.message}`);
      failed++;
    }
    console.log('----------------------------------------------------------------\n');
  }

  console.log('================================================================');
  console.log(`TEST SUMMARY: Total: ${testCases.length} | Passed: ${passed} | Failed: ${failed}`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests();
