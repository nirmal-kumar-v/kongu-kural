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

/**
 * Free web search fallback using DuckDuckGo HTML and Instant Answer APIs.
 * Requires no external paid credentials.
 */
export async function searchWeb(query: string, maxResults = 5): Promise<WebSearchResult[]> {
  const results: WebSearchResult[] = [];

  try {
    // 1. First attempt: DuckDuckGo HTML Lite search
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
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

      // Extract results from DuckDuckGo HTML format
      const resultBlocks = html.split(/class="result\s/);

      for (let i = 1; i < resultBlocks.length && results.length < maxResults; i++) {
        const block = resultBlocks[i];

        // Extract title & link
        const titleMatch = block.match(/<a class="result__url"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i) ||
          block.match(/<a class="result__snippet"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i) ||
          block.match(/<a class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i);

        // Extract snippet
        const snippetMatch = block.match(/<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/i);

        let targetUrl = '';
        let title = '';
        let snippet = '';

        if (titleMatch) {
          const rawHref = titleMatch[1];
          // DuckDuckGo redirects often look like /l/?uddg=URL
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
          results.push({
            title: title || 'Web Source',
            snippet: snippet || title,
            url: targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`,
          });
        }
      }
    }
  } catch (err: any) {
    console.warn(`[WebSearchService] DuckDuckGo HTML search error: ${err?.message || err}`);
  }

  // 2. If no results or error, try DuckDuckGo JSON Instant Answer API
  if (results.length === 0) {
    try {
      const apiUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
      const res = await fetch(apiUrl, { signal: AbortSignal.timeout(5000) });
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
      console.warn(`[WebSearchService] DuckDuckGo API error: ${err?.message || err}`);
    }
  }

  // Fallback: If still empty, add default official KEC portals so Gemini has reliable context
  if (results.length === 0) {
    results.push({
      title: 'Kongu Engineering College (Autonomous)',
      snippet:
        'Kongu Engineering College is an autonomous engineering college located at Perundurai, Erode district, Tamil Nadu, India. Affiliated with Anna University, accredited with A++ by NAAC. Official website: kongu.ac.in',
      url: 'https://kongu.ac.in',
    });
  }

  return results;
}
