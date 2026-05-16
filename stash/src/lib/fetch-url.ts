import * as cheerio from "cheerio";

export type LinkPreview = {
  url: string;
  title?: string;
  description?: string;
  text: string;
};

export function extractFirstUrl(s: string): string | null {
  const m = s.match(/https?:\/\/[^\s)>\]"']+/i);
  return m ? m[0] : null;
}

export async function fetchUrlPreview(url: string): Promise<LinkPreview> {
  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(url, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (compatible; StashBot/1.0; +https://stash.local)",
        accept: "text/html,application/xhtml+xml",
      },
      signal: ctrl.signal,
      redirect: "follow",
    });
    const html = await res.text();
    const $ = cheerio.load(html);
    const title =
      $('meta[property="og:title"]').attr("content") ||
      $('meta[name="twitter:title"]').attr("content") ||
      $("title").first().text().trim() ||
      undefined;
    const description =
      $('meta[property="og:description"]').attr("content") ||
      $('meta[name="description"]').attr("content") ||
      $('meta[name="twitter:description"]').attr("content") ||
      undefined;
    // Lightweight body text extraction.
    $("script,style,noscript,svg").remove();
    const body = $("article").text() || $("main").text() || $("body").text();
    const text = body.replace(/\s+/g, " ").trim().slice(0, 4000);
    return { url, title, description, text };
  } catch {
    return { url, text: "" };
  } finally {
    clearTimeout(timeout);
  }
}
