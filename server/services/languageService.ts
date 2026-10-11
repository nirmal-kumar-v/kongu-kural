export interface LanguageResolution {
  detectedLanguage: 'English' | 'Tamil' | 'Tanglish' | 'Hindi' | 'Other';
  targetLanguage: 'English' | 'Tamil';
  explicitOverride: boolean;
}

/**
 * Resolves the query's detected language and target answer language.
 *
 * Rules:
 * 1. English question → understand and answer in English.
 * 2. Tamil question (Tamil script) → understand it and answer in Tamil.
 * 3. Tanglish question (Tamil written using English letters) → understand it and answer in English.
 * 4. Explicit user language request (e.g. "answer in tamil", "தமிழ்ல சொல்லு", "in english")
 *    → explicitly overrides the detected question language.
 */
export function resolveQueryLanguage(query: string, groqDetected?: string): LanguageResolution {
  const clean = query.trim();
  const lower = clean.toLowerCase();

  // 1. Check for explicit user request for Tamil
  const explicitTamilPatterns = [
    /\b(in\s+tamil|answer\s+in\s+tamil|reply\s+in\s+tamil|explain\s+in\s+tamil|tell\s+(me\s+)?in\s+tamil)\b/i,
    /\b(tamil\s*la\s*(sollu|sollunga|solla|pesu|bathil|vilakku))\b/i,
    /\b(tamilil\s*(sollu|sollunga|solla|pesu|bathil|vilakkavum|kuru)?)\b/i,
    /\b(tamil\s+me\s+batao|tamil\s+me)\b/i,
    /(தமிழில்\s*(கூறு|சொல்|சொல்லு|சொல்லுங்கள்|பதில்|விளக்கு|எழுது|தரவும்)|தமிழ்ல\s*(சொல்லு|சொல்லுங்கள்|பதில்))/i,
    /(பதில்\s*தமிழில்|தமிழில்\s*பதில்|விளக்கம்\s*தமிழில்|தமிழில்)/i,
  ];

  // 2. Check for explicit user request for English
  const explicitEnglishPatterns = [
    /\b(in\s+english|answer\s+in\s+english|reply\s+in\s+english|explain\s+in\s+english|tell\s+(me\s+)?in\s+english)\b/i,
    /\b(english\s*la\s*(sollu|sollunga|solla|pesu|bathil|vilakku))\b/i,
    /\b(englishil\s*(sollu|sollunga|solla|pesu|bathil)?)\b/i,
    /\b(english\s+me\s+batao|english\s+me)\b/i,
    /(ஆங்கிலத்தில்\s*(கூறு|சொல்|சொல்லு|சொல்லுங்கள்|பதில்|விளக்கு|தரவும்)|இங்கிலீஷ்ல\s*(சொல்லு|பதில்))/i,
    /(பதில்\s*ஆங்கிலத்தில்|ஆங்கிலத்தில்\s*பதில்|ஆங்கிலத்தில்)/i,
  ];

  const wantsTamil = explicitTamilPatterns.some((pattern) => pattern.test(lower));
  const wantsEnglish = explicitEnglishPatterns.some((pattern) => pattern.test(lower));

  // 3. Detect base language of the query text
  const hasTamilScript = /[\u0B80-\u0BFF]/.test(clean);

  const tanglishMarkers = [
    /\b(evalo|evvalo|evvalavu|yevalo|enna|ethana|ethanai|yaaru|yaru|yar)\b/i,
    /\b(sollu|sollunga|solunga|solla|paththi|patthi|patti)\b/i,
    /\b(irukka|iruka|irukkuma|irukaa|kedakkuma|varuma|eppadi|epdi)\b/i,
    /\b(viduthi|kattanam|neram|noolagam|perunthu|uthavithogai)\b/i,
    /\b(mudhal\s+pattadhari|arasu\s+palli|sambalam|velai)\b/i,
    /\b(thangum|saapadu|venum|pannanum|engae|enga|eppo)\b/i,
    /\b(irundha|iruntha|koodum|kodupaangala|kudukkurangala)\b/i,
  ];
  const hasTanglishMarker = tanglishMarkers.some((p) => p.test(lower));

  let detectedLanguage: 'English' | 'Tamil' | 'Tanglish' | 'Hindi' | 'Other';
  if (hasTamilScript) {
    detectedLanguage = 'Tamil';
  } else if (hasTanglishMarker || groqDetected === 'Tanglish') {
    detectedLanguage = 'Tanglish';
  } else if (groqDetected === 'Hindi') {
    detectedLanguage = 'Hindi';
  } else {
    detectedLanguage = 'English';
  }

  // 4. Resolve target response language:
  // Explicit request takes highest precedence
  if (wantsTamil) {
    return { detectedLanguage, targetLanguage: 'Tamil', explicitOverride: true };
  }
  if (wantsEnglish) {
    return { detectedLanguage, targetLanguage: 'English', explicitOverride: true };
  }

  // Pure Tamil script defaults to Tamil
  if (detectedLanguage === 'Tamil') {
    return { detectedLanguage, targetLanguage: 'Tamil', explicitOverride: false };
  }

  // Both English and Tanglish default to English target response
  return { detectedLanguage, targetLanguage: 'English', explicitOverride: false };
}
