import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const maxDuration = 30;

const MAX_PAGES = 10;
const MAX_BYTES = 300_000;
const FETCH_TIMEOUT_MS = 8_000;

type ImportedPage = {
  url: string;
  title: string;
  content: string;
  wordCount: number;
};

function normaliseUrl(value: string) {
  const candidate = value.trim().match(/^https?:\/\//i) ? value.trim() : `https://${value.trim()}`;
  const url = new URL(candidate);
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Only public HTTP or HTTPS websites are supported.');
  if (url.username || url.password) throw new Error('Website URLs cannot contain credentials.');
  if (url.port && !['80', '443'].includes(url.port)) throw new Error('Only standard website ports are supported.');

  const hostname = url.hostname.toLowerCase();
  const looksLikeIp = /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname) || hostname.includes(':');
  if (
    looksLikeIp ||
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal')
  ) {
    throw new Error('Please provide a public website domain, not a local or private address.');
  }

  url.hash = '';
  return url;
}

function decodeEntities(value: string) {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

function extractPage(html: string, url: URL): ImportedPage {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = decodeEntities((titleMatch?.[1] || url.pathname || url.hostname).replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 180);

  const content = decodeEntities(
    html
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
      .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, ' ')
      .replace(/<!--([\s\S]*?)-->/g, ' ')
      .replace(/<[^>]+>/g, ' ')
  )
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 45_000);

  return { url: url.toString(), title, content, wordCount: content ? content.split(/\s+/).length : 0 };
}

function extractLinks(html: string, current: URL, root: URL) {
  const links: string[] = [];
  const matcher = /<a\b[^>]*\bhref=["']([^"'#]+)["'][^>]*>/gi;
  let match: RegExpExecArray | null;

  while ((match = matcher.exec(html))) {
    try {
      const next = new URL(match[1], current);
      next.hash = '';
      if (next.origin !== root.origin || !['http:', 'https:'].includes(next.protocol)) continue;
      if (/\.(jpg|jpeg|png|gif|webp|svg|zip|mp4|mp3|docx?|xlsx?)$/i.test(next.pathname)) continue;
      links.push(next.toString());
    } catch {
      // Ignore malformed links found in third-party templates.
    }
  }
  return [...new Set(links)];
}

function disallowedPaths(robots: string) {
  const paths: string[] = [];
  let applies = false;
  for (const rawLine of robots.split(/\r?\n/)) {
    const line = rawLine.split('#')[0].trim();
    const [rawKey, ...rest] = line.split(':');
    const key = rawKey?.trim().toLowerCase();
    const value = rest.join(':').trim();
    if (key === 'user-agent') applies = value === '*';
    if (applies && key === 'disallow' && value) paths.push(value);
  }
  return paths;
}

async function fetchHtml(url: URL, root: URL) {
  let current = url;
  for (let redirect = 0; redirect < 4; redirect += 1) {
    if (current.origin !== root.origin) throw new Error('The website redirected outside its approved domain.');
    const response = await fetch(current, {
      redirect: 'manual',
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: { 'user-agent': 'AgentsHiveKnowledgeImporter/0.1 (+https://agentshive.net)' },
    });
    if (response.status >= 300 && response.status < 400 && response.headers.get('location')) {
      current = new URL(response.headers.get('location')!, current);
      continue;
    }
    if (!response.ok) throw new Error(`Page returned HTTP ${response.status}.`);
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) return null;
    const length = Number(response.headers.get('content-length') || 0);
    if (length > MAX_BYTES) return null;
    const html = (await response.text()).slice(0, MAX_BYTES);
    return { html, finalUrl: current };
  }
  throw new Error('The website redirected too many times.');
}

async function authorizedWorkspace(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!token || !url || !key) return { status: 401 as const, error: 'Please sign in before importing a website.' };
  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return { status: 401 as const, error: 'Please sign in before importing a website.' };
  const { data: organizationId, error: accessError } = await supabase.rpc('business_require_current_organization');
  if (accessError || !organizationId) {
    return { status: 403 as const, error: 'Business access is inactive, unpaid, revoked, or expired.' };
  }
  return { status: 200 as const, organizationId };
}

export async function POST(request: NextRequest) {
  const access = await authorizedWorkspace(request);
  if (access.status !== 200) return NextResponse.json({ error: access.error }, { status: access.status });

  try {
    const body = (await request.json()) as { website?: string };
    const root = normaliseUrl(body.website || '');
    root.pathname = root.pathname === '/' ? '/' : root.pathname.replace(/\/$/, '');

    let blocked: string[] = [];
    try {
      const robotsUrl = new URL('/robots.txt', root);
      const response = await fetch(robotsUrl, {
        signal: AbortSignal.timeout(4_000),
        headers: { 'user-agent': 'AgentsHiveKnowledgeImporter/0.1 (+https://agentshive.net)' },
      });
      if (response.ok) blocked = disallowedPaths((await response.text()).slice(0, 100_000));
    } catch {
      // A missing robots file does not prevent an owner-authorised import.
    }

    const queue = [root.toString()];
    const visited = new Set<string>();
    const pages: ImportedPage[] = [];

    while (queue.length && pages.length < MAX_PAGES) {
      const candidate = new URL(queue.shift()!);
      if (visited.has(candidate.toString())) continue;
      visited.add(candidate.toString());
      if (blocked.some((path) => path === '/' || candidate.pathname.startsWith(path))) continue;

      try {
        const result = await fetchHtml(candidate, root);
        if (!result) continue;
        const page = extractPage(result.html, result.finalUrl);
        if (page.wordCount >= 20) pages.push(page);
        for (const link of extractLinks(result.html, result.finalUrl, root)) {
          if (!visited.has(link) && queue.length < 40) queue.push(link);
        }
      } catch {
        // Continue importing other public pages when one page is unavailable.
      }
    }

    if (!pages.length) {
      return NextResponse.json({ error: 'No readable public pages were found. Check the address or website crawl settings.' }, { status: 422 });
    }

    return NextResponse.json({ rootUrl: root.origin, pages, capped: pages.length === MAX_PAGES });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Website import failed.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
