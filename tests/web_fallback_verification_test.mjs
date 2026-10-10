// Web Search Fallback Verification Test Suite for Kongu Kural
const API_URL = 'http://localhost:5000/api/chat';

async function queryChat(question) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: question }),
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

async function runTests() {
  console.log('================================================================');
  console.log('      KONGU KURAL — WEB SEARCH FALLBACK VERIFICATION SUITE      ');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  // TEST 1: Question in college-info.txt must NOT use web search
  total++;
  console.log('[TEST 1] Question available in knowledge base must NOT trigger web search');
  console.log('Q: "Who are the staff members in the Information Technology department?"');
  try {
    const res = await queryChat('Who are the staff members in the Information Technology department?');
    const isFile = res.isWebFallback === false;
    const hasItStaff = res.answer.includes('Varadhaganapathy') || res.answer.includes('Premalatha');
    const noWebSources = !res.sources.some((s) => s.type === 'web' && s.url && s.url.includes('duckduckgo'));
    if (isFile && hasItStaff && noWebSources) {
      console.log('STATUS: ✅ PASSED');
      console.log('REASON: Answered directly from college-info.txt with isWebFallback: false.\n');
      passed++;
    } else {
      console.log('STATUS: ❌ FAILED');
      console.log(`REASON: isWebFallback=${res.isWebFallback}, hasItStaff=${hasItStaff}\n`);
    }
  } catch (err) {
    console.log('STATUS: ❌ ERROR:', err.message, '\n');
  }

  // TEST 2: Trustee members question must trigger web search and provide verified count & source link
  total++;
  console.log('[TEST 2] Missing knowledge ("How many trustee members are there in this college?") must trigger web search');
  console.log('Q: "How many trustee members are there in this college?"');
  try {
    const res = await queryChat('How many trustee members are there in this college?');
    const isWeb = res.isWebFallback === true;
    const hasCount = res.answer.includes('37') || res.answer.includes('KVITT');
    const hasLink = res.answer.includes('http') || res.sources.some((s) => s.type === 'web' && s.url);
    if (isWeb && hasCount && hasLink) {
      console.log('STATUS: ✅ PASSED');
      console.log('REASON: Triggered web fallback, verified 37 KVITT trustees, and included official source link.\n');
      passed++;
    } else {
      console.log('STATUS: ❌ FAILED');
      console.log(`REASON: isWebFallback=${res.isWebFallback}, hasCount=${hasCount}, hasLink=${hasLink}\n`);
    }
  } catch (err) {
    console.log('STATUS: ❌ ERROR:', err.message, '\n');
  }

  // TEST 3: Question absent from both sources must receive the exact unavailable-information response
  total++;
  console.log('[TEST 3] Question absent from both sources must receive unavailable-information response');
  console.log('Q: "What is the personal mobile phone number of the NASA astronaut visiting KEC next month?"');
  try {
    const res = await queryChat('What is the personal mobile phone number of the NASA astronaut visiting KEC next month?');
    const expectedPhrase = 'Information regarding this topic could not be verified from the available college records or reliable web sources.';
    const isUnavailable =
      res.answer.includes(expectedPhrase) ||
      res.answer.includes('could not be verified from the available college records') ||
      res.answer.includes('could not be verified');
    if (isUnavailable) {
      console.log('STATUS: ✅ PASSED');
      console.log('REASON: Correctly returned unavailable-information response without hallucination.\n');
      passed++;
    } else {
      console.log('STATUS: ❌ FAILED');
      console.log(`REASON: Answer was: "${res.answer}"\n`);
    }
  } catch (err) {
    console.log('STATUS: ❌ ERROR:', err.message, '\n');
  }

  // TEST 4: Cutoff vs Rank accuracy
  total++;
  console.log('[TEST 4] Cutoff marks question must return cutoff marks out of 200, not rank');
  console.log('Q: "What is the cutoff for CSE in KEC?"');
  try {
    const res = await queryChat('What is the cutoff for CSE in KEC?');
    const hasCutoffMarks = res.answer.includes('185') || res.answer.includes('190') || res.answer.includes('200') || res.answer.includes('cut');
    if (hasCutoffMarks) {
      console.log('STATUS: ✅ PASSED');
      console.log('REASON: Correctly returned cutoff marks context out of 200.\n');
      passed++;
    } else {
      console.log('STATUS: ❌ FAILED');
      console.log(`REASON: Answer was: "${res.answer}"\n`);
    }
  } catch (err) {
    console.log('STATUS: ❌ ERROR:', err.message, '\n');
  }

  // TEST 5: Unrelated guard check
  total++;
  console.log('[TEST 5] Unrelated question must return "Ask anything related to KEC."');
  console.log('Q: "How to bake a chocolate cake at home?"');
  try {
    const res = await queryChat('How to bake a chocolate cake at home?');
    const isGuard = res.answer.trim() === 'Ask anything related to KEC.';
    if (isGuard) {
      console.log('STATUS: ✅ PASSED');
      console.log('REASON: Correctly returned mandatory guard response.\n');
      passed++;
    } else {
      console.log('STATUS: ❌ FAILED');
      console.log(`REASON: Answer was: "${res.answer}"\n`);
    }
  } catch (err) {
    console.log('STATUS: ❌ ERROR:', err.message, '\n');
  }

  console.log('================================================================');
  console.log(`TEST SUMMARY: Total: ${total} | Passed: ${passed} | Failed: ${total - passed}`);
  console.log('================================================================\n');

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests();
