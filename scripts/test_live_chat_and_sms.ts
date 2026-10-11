import http from 'http';

function queryChatApi(message: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ message, history: [] });
    const req = http.request(
      'http://localhost:5000/api/chat',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
        },
        timeout: 30000,
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            reject(new Error(`Invalid JSON: ${body}`));
          }
        });
      }
    );
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function runLiveTests() {
  console.log('============================================================');
  console.log('KONGU KURAL GLOBAL RETRIEVAL & ANSWER GENERATION TEST SUITE');
  console.log('============================================================\n');

  const testCases = [
    {
      name: 'Event Name -> Date (Enthusia)',
      question: 'When is Enthusia conducted in KEC?',
      checkKeywords: ['march', '5', '2027'],
    },
    {
      name: 'Event Name -> Date (Swaram)',
      question: 'What is the date for Swaram musical fest?',
      checkKeywords: ['march', '12', '2027'],
    },
    {
      name: 'Event Name -> Date (Kongu Trophy)',
      question: 'When will Kongu Trophy be held?',
      checkKeywords: ['september', '19', '2026'],
    },
    {
      name: 'Event Name -> Date (Founders Day / Techno Cultural)',
      question: 'When is Techno Cultural Fest and Founders Day?',
      checkKeywords: ['september', '18', '2026'],
    },
    {
      name: 'Date -> Event (19 March 2027 - Triple Event)',
      question: 'What events are conducted on 19 March 2027 in KEC?',
      checkKeywords: ['sports day', 'annual day', 'farewell day'],
    },
    {
      name: 'Date -> Event (18 September 2026)',
      question: 'What is scheduled on 18 September 2026?',
      checkKeywords: ['techno cultural', 'founders'],
    },
    {
      name: 'Date -> Event (05 March 2027)',
      question: 'What event happens on 05 March 2027?',
      checkKeywords: ['enthusia'],
    },
    {
      name: 'Exam Rule: Mobile phone prohibition',
      question: 'Can students bring a mobile phone into the examination hall?',
      checkKeywords: ['prohibited', 'phone'],
    },
    {
      name: 'Exam Rule: Calculator permitted',
      question: 'What type of calculator is allowed during exams?',
      checkKeywords: ['non-programmable'],
    },
    {
      name: 'Exam Rule: Scribe for illness',
      question: 'Can a candidate get a scribe for exams due to temporary illness?',
      checkKeywords: ['scribe', 'principal', 'controller'],
    },
    {
      name: 'Malpractice: Candidate writing name',
      question: 'What happens if a student writes their name in the answer script?',
      checkKeywords: ['1000'],
    },
    {
      name: 'Malpractice: Impersonation punishment',
      question: 'What is the punishment for impersonation in examinations?',
      checkKeywords: ['police', 'debar'],
    },
    {
      name: 'Placement 2025-2026 Statistics',
      question: 'How many total offers were received for 2025-2026 batch placements at KEC?',
      checkKeywords: ['1828', '1529', '409'],
    },
    {
      name: 'Placement 2025-2026 Recruiter (Soliton)',
      question: 'How many offers did Soliton Technologies give for the 2025-2026 batch?',
      checkKeywords: ['9'],
    },
    {
      name: 'Placement 2025-2026 Recruiter (Cognizant)',
      question: 'How many offers were given by Cognizant for the 2025-2026 batch?',
      checkKeywords: ['126'],
    },
    {
      name: 'Tamil Language: Event Date (Enthusia)',
      question: 'என்சியூசியா கலாச்சார விழா எப்போது நடைபெறும்?',
      checkKeywords: ['மார்ச்', '2027'],
    },
    {
      name: 'Tanglish Language: Event Date (Swaram)',
      question: 'Swaram event eppo nadakkum?',
      checkKeywords: ['march', '12', '2027'],
    },
  ];

  let passedCount = 0;
  for (const tc of testCases) {
    console.log(`\nTEST: [${tc.name}]`);
    console.log(`Q: "${tc.question}"`);
    try {
      const res = await queryChatApi(tc.question);
      const answer = res.answer || res.reply || res.text || '';
      console.log(`A: ${answer.trim()}`);
      console.log(`Provider: ${res.provider || 'unknown'} | Language: ${res.detectedLanguage || 'unknown'}`);

      const lower = answer.toLowerCase().replace(/,/g, '');
      const missing = tc.checkKeywords.filter((k) => !lower.includes(k.toLowerCase().replace(/,/g, '')));
      if (missing.length === 0) {
        console.log(`=> PASS`);
        passedCount++;
      } else {
        console.log(`=> FAIL (Missing keywords: ${missing.join(', ')})`);
      }
    } catch (e: any) {
      console.log(`=> ERROR: ${e.message}`);
    }
  }

  console.log('\n============================================================');
  console.log(`RESULT: ${passedCount} / ${testCases.length} LIVE TESTS PASSED`);
  console.log('============================================================\n');

  if (passedCount !== testCases.length) {
    process.exit(1);
  }
}

runLiveTests();
