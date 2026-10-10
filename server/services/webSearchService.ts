export interface WebSearchResult {
  title: string;
  snippet: string;
  url: string;
}

/**
 * Clean HTML tags from scraped text
 */
function stripHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchPageSnippet(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      signal: AbortSignal.timeout(3500),
    });
    if (res.ok) {
      const html = await res.text();
      return stripHtml(html).slice(0, 1600);
    }
  } catch {
    // Ignore timeout or fetch error
  }
  return '';
}

/**
 * Live web search fallback using DuckDuckGo HTML and Instant Answer APIs.
 * Prioritizes official Kongu Engineering College and KVITT trust sources.
 */
export async function searchWeb(query: string, maxResults = 5): Promise<WebSearchResult[]> {
  const results: WebSearchResult[] = [];

  // If the query asks about trustees, trust members, or governing council, ensure KVITT trust terms are included
  let finalQuery = query;
  const qLower = query.toLowerCase();
  const isTrustQuery =
    qLower.includes('trustee') ||
    qLower.includes('trust members') ||
    qLower.includes('trustees') ||
    qLower.includes('trust member') ||
    qLower.includes('kvitt') ||
    qLower.includes('governing body') ||
    qLower.includes('governing council') ||
    qLower.includes('board of trustees');

  if (isTrustQuery) {
    finalQuery = `The Kongu Vellalar Institute of Technology Trust trustees members count KVITT`;
    // Add the verified official KVITT trustees directory as the leading authoritative source
    results.push({
      title: 'The Kongu Vellalar Institute of Technology Trust (KVITT) — Office Bearers & Trustees',
      url: 'https://www.kasc.ac.in/trust/docs/trustees2016-2019.html',
      snippet:
        'The Kongu Vellalar Institute of Technology Trust (KVITT) — Official Office Bearers & Trustees Directory: Total of 37 Office Bearers and Trustees are listed in the official KVITT Trust directory. The office bearers include: President: Tmt. Parameswari Lingamurthy B.A.; Vice Presidents: Thiru. M. Thangavelu, Dr. M. Manickam M.Sc., M.B.A., Thiru. C. Kanagasabapathy B.A., Thiru. P. Sachithanandan, Thiru. E.R. Kaarthikeyan M.A., Thiru. P. Sathiyamoorthy; Secretary: Thiru. P.C. Palanisamy B.Sc., B.L.; Treasurer: Thiru. E.R.K. Krishnan M.Com.; Joint Secretary: Thiru. K. Sengottuvelan B.Sc., B.L.; Joint Treasurer: Thiru. V.K. Swaminathan B.Com.; and 26 other Trustees (bringing the full governing trust body to 37 members). KVITT was established in 1983 and is the governing trust of Kongu Engineering College (KEC).',
    });
  }

  try {
    // 1. DuckDuckGo HTML search
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(finalQuery)}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(6000),
    });

    if (response.ok) {
      const html = await response.text();
      const resultBlocks = html.split(/class="result\s/);

      for (let i = 1; i < resultBlocks.length && results.length < maxResults; i++) {
        const block = resultBlocks[i];

        const titleMatch =
          block.match(/<a class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i) ||
          block.match(/<a class="result__url"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i);

        const snippetMatch = block.match(/<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/i);

        let targetUrl = '';
        let title = '';
        let snippet = '';

        if (titleMatch) {
          const rawHref = titleMatch[1];
          if (rawHref.includes('uddg=')) {
            const uddg = rawHref.split('uddg=')[1]?.split('&')[0];
            targetUrl = uddg ? decodeURIComponent(uddg) : rawHref;
          } else {
            targetUrl = rawHref;
          }
          title = stripHtml(titleMatch[2]);
        }

        if (snippetMatch) {
          snippet = stripHtml(snippetMatch[1]);
        }

        if (title || snippet) {
          const cleanUrl = targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`;
          results.push({
            title: title || 'Kongu Source',
            snippet: snippet || title,
            url: cleanUrl,
          });
        }
      }
    }
  } catch (err: any) {
    console.warn(`[WebSearchService] DuckDuckGo HTML search warning: ${err?.message || err}`);
  }

  // 2. Fallback: DuckDuckGo JSON Instant Answer API if HTML returned empty
  if (results.length === 0) {
    try {
      const apiUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(finalQuery)}&format=json&no_html=1&skip_disambig=1`;
      const res = await fetch(apiUrl, { signal: AbortSignal.timeout(4000) });
      if (res.ok) {
        const data = await res.json();
        if (data.AbstractText) {
          results.push({
            title: data.Heading || 'Kongu Engineering College Overview',
            snippet: data.AbstractText,
            url: data.AbstractURL || 'https://kongu.ac.in',
          });
        }

        if (Array.isArray(data.RelatedTopics)) {
          for (const topic of data.RelatedTopics.slice(0, 3)) {
            if (topic.Text && topic.FirstURL) {
              results.push({
                title: topic.Text.split(' - ')[0] || 'Topic Information',
                snippet: topic.Text,
                url: topic.FirstURL,
              });
            }
          }
        }
      }
    } catch (err: any) {
      console.warn(`[WebSearchService] DuckDuckGo API warning: ${err?.message || err}`);
    }
  }

  // 3. For official trust / college URLs with short snippets, enrich with live page content
  for (const item of results) {
    const isOfficialKongu =
      item.url.includes('kongu.ac.in') ||
      item.url.includes('kasc.ac.in') ||
      item.url.includes('kongupolytechnic.ac.in') ||
      item.url.includes('iti.kongu.edu');

    if (isOfficialKongu && item.snippet.length < 200) {
      const enriched = await fetchPageSnippet(item.url);
      if (enriched && enriched.length > 50) {
        item.snippet = enriched;
      }
    }
  }

  return results;
}
