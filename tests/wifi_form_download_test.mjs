import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

async function testWifiIntegration() {
  console.log('=== TEST 1: Verify PDF file integrity in public/ ===');
  const pdfPath = path.resolve(projectRoot, 'public', 'kec-wifi-registration-form.pdf');
  assert(fs.existsSync(pdfPath), 'public/kec-wifi-registration-form.pdf must exist');
  const stats = fs.statSync(pdfPath);
  console.log(`File size: ${stats.size} bytes`);
  assert.strictEqual(stats.size, 145892, 'File size must match original exactly (145892 bytes)');
  const buffer = fs.readFileSync(pdfPath);
  assert.strictEqual(buffer.slice(0, 4).toString(), '%PDF', 'File must begin with %PDF header');
  console.log('✔ PDF file exists and contents are intact.');

  console.log('\n=== TEST 2: Verify knowledge loading and chunk parsing for Section 8.5 ===');
  const { getKnowledge, getCandidatePassages } = await import('../server/services/knowledgeService.js');
  const knowledge = getKnowledge();
  assert(knowledge.chunks.length > 0, 'Knowledge chunks must not be empty');
  const wifiChunk = knowledge.chunks.find((c) => c.sectionTitle && c.sectionTitle.includes('Wi-Fi Registration'));
  assert(wifiChunk, 'Section 8.5 Wi-Fi registration chunk must be present in parsed knowledge');
  console.log(`✔ Found Section 8.5 chunk: "${wifiChunk.sectionTitle}" (${wifiChunk.content.length} chars)`);

  const candidates1 = getCandidatePassages('how to download wifi registration form', 5);
  assert(candidates1.some((c) => c.content.includes('Kongu_Wifi')), 'Wi-Fi query must retrieve Wi-Fi chunk in top candidates');
  console.log('✔ Top candidate for Wi-Fi query matches Wi-Fi chunk.');

  console.log('\n=== TEST 3: Verify attachment detection logic in shouldAttachWifiForm ===');
  const { shouldAttachWifiForm } = await import('../server/services/chatOrchestrator.js');

  const positiveQueries = [
    { q: 'Download wifi registration form', a: 'You can download the form.' },
    { q: 'where can I download the wifi application form?', a: 'Download using the button below.' },
    { q: 'how to get campus wifi in KEC?', a: 'Fill the wifi form and submit.' },
    { q: 'kongu_wifi connect panna form venum', a: 'Submit the registration form.' },
    { q: 'vai fai registration form', a: 'Here is the wifi form.' },
    { q: 'wifi form download', a: 'Download below.' },
    { q: 'வைபை பதிவு படிவம்', a: 'வைபை படிவத்தை பதிவிறக்கம் செய்யலாம்.' },
    { q: 'I am a first year student. What forms do I need after joining KEC?', a: 'Submit onboarding documents including Wi-Fi registration.' },
    { q: 'what to do after joining KEC? what forms needed?', a: 'Complete onboarding and wifi registration.' },
  ];

  for (const item of positiveQueries) {
    const attach = shouldAttachWifiForm(item.q, [], item.a);
    console.log(`Query: "${item.q}" -> Attached: ${attach}`);
    assert.strictEqual(attach, true, `Expected attachment for: "${item.q}"`);
  }
  console.log('✔ All positive Wi-Fi and onboarding queries attach the form.');

  const negativeQueries = [
    { q: 'What is the hostel fee for dheeran hostel?', a: 'Hostel fee is around 50,000 to 80,000.' },
    { q: 'Who is the principal of Kongu Engineering College?', a: 'Dr. R. Parameshwaran is the Principal.' },
    { q: 'What are the bus routes for erode?', a: 'Buses operate on multiple routes.' },
    { q: 'What is the cut off for CSE?', a: 'CSE cutoff is 194.5.' },
    { q: 'How to bake a chocolate cake?', a: 'Ask anything related to KEC.' },
  ];

  for (const item of negativeQueries) {
    const attach = shouldAttachWifiForm(item.q, [], item.a);
    console.log(`Unrelated query: "${item.q}" -> Attached: ${attach}`);
    assert.strictEqual(attach, false, `Expected NO attachment for unrelated query: "${item.q}"`);
  }
  console.log('✔ All unrelated queries do NOT attach the form.');

  console.log('\n=== TEST 4: Verify Express static serving ===');
  const { app } = await import('../server/app.js');
  const http = await import('http');
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  console.log(`Test server running on port ${port}`);

  const fetchRes = await fetch(`http://localhost:${port}/kec-wifi-registration-form.pdf`);
  assert.strictEqual(fetchRes.status, 200, 'Static route must return HTTP 200');
  assert.strictEqual(
    fetchRes.headers.get('content-type')?.includes('pdf'),
    true,
    'Content-Type must be application/pdf'
  );
  const downloadedBuf = await fetchRes.arrayBuffer();
  assert.strictEqual(downloadedBuf.byteLength, 145892, 'Downloaded byte size must match exact PDF size');
  console.log(`✔ Downloaded HTTP response: status 200, length ${downloadedBuf.byteLength} bytes.`);

  server.close();
  console.log('\n🎉 ALL WI-FI REGISTRATION FORM INTEGRATION TESTS PASSED!');
}

testWifiIntegration().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
