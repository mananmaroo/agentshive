# Website Crawler & Extractor

*An official agent from [agentshive.net](https://agentshive.net).*

## Purpose

Crawls every reachable page of a given website (following internal links from a start URL),
extracts the readable content of each page (title, headings, body text, links), and writes it
out as structured data — then can push the result to a live destination (a repo, a CMS, a
database) once you confirm where it should go.

## When to Use

Use for: pulling all content off a site for migration/re-platforming, building a searchable
content index, auditing what's actually published across a site. Categories: Research,
Automation, Data Analysis.

## Recommended Plugins

- **[ponytail](https://github.com/anthropics/claude-code)** — keeps the crawler script itself
  minimal: Python stdlib + `requests`/`beautifulsoup4`, no scraping framework unless the site
  needs JS rendering.
- **[caveman](https://github.com/JuliusBrussee/caveman)** — keeps per-page crawl logs terse.
  Install: `claude plugin marketplace add JuliusBrussee/caveman && claude plugin install caveman@caveman`.

Ask before installing; both optional.

## Inputs Needed

- Start URL and how far to crawl (whole domain, a path prefix, or a page-count/depth limit).
- Confirmation the site's `robots.txt` / terms allow crawling it.
- What "extract" means here: full text, just headings, specific fields (price, date, etc).
- Where to push the result when done: a repo path, a CMS API, a file, or "just show me".

## Workflow

1. **Check `robots.txt` first.** Fetch `<site>/robots.txt`; respect `Disallow` rules and any
   `Crawl-delay`. Stop and ask if the site clearly disallows automated access.
2. **Crawl breadth-first from the start URL,** staying on the same domain, following only
   internal links, and stopping at the agreed depth/page limit.
3. **Extract per page:** URL, title, headings, main body text (strip nav/footer boilerplate),
   and outbound links. Skip binary assets (images, PDFs) unless asked to include them.
4. **Rate-limit.** Wait between requests (default 1s, or the site's `Crawl-delay`) so the crawl
   doesn't look like an attack.
5. **Write the crawler as Python** (script below is the starting point — adapt selectors to the
   target site's actual HTML structure).
6. **Push to the agreed destination.** Only after the user confirms *where*: commit the output
   file(s) to a repo and push, POST to a CMS API, or write to a local file — never push
   automatically to a destination that wasn't explicitly named.
7. **Append the handout.** Dated entry to `HANDOUT.md` (append, don't overwrite).

## Reference Implementation (Python)

```python
"""
Minimal same-domain crawler + content extractor.
Requires: pip install requests beautifulsoup4
"""
import time
import json
import urllib.robotparser
from collections import deque
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup

START_URL = "https://example.com"     # set the real start URL
MAX_PAGES = 200                       # crawl-size guardrail
CRAWL_DELAY = 1.0                     # seconds between requests, overridden by robots.txt
USER_AGENT = "agentshive-crawler/1.0"

def allowed_by_robots(start_url: str) -> tuple[urllib.robotparser.RobotFileParser, float]:
    parsed = urlparse(start_url)
    robots_url = f"{parsed.scheme}://{parsed.netloc}/robots.txt"
    rp = urllib.robotparser.RobotFileParser()
    rp.set_url(robots_url)
    rp.read()
    delay = rp.crawl_delay(USER_AGENT) or CRAWL_DELAY
    return rp, delay

def extract_page(url: str, html: str) -> dict:
    soup = BeautifulSoup(html, "html.parser")
    for tag in soup(["script", "style", "nav", "footer"]):
        tag.decompose()  # drop boilerplate before extracting text
    title = soup.title.string.strip() if soup.title and soup.title.string else ""
    headings = [h.get_text(strip=True) for h in soup.find_all(["h1", "h2", "h3"])]
    body_text = " ".join(soup.get_text(separator=" ", strip=True).split())
    links = {urljoin(url, a["href"]) for a in soup.find_all("a", href=True)}
    return {"url": url, "title": title, "headings": headings, "text": body_text, "links": list(links)}

def crawl(start_url: str, max_pages: int = MAX_PAGES) -> list[dict]:
    domain = urlparse(start_url).netloc
    rp, delay = allowed_by_robots(start_url)
    if not rp.can_fetch(USER_AGENT, start_url):
        raise SystemExit(f"robots.txt disallows crawling {start_url}")

    seen = {start_url}
    queue = deque([start_url])
    pages = []
    session = requests.Session()
    session.headers["User-Agent"] = USER_AGENT

    while queue and len(pages) < max_pages:
        url = queue.popleft()
        if not rp.can_fetch(USER_AGENT, url):
            continue
        resp = session.get(url, timeout=15)
        if resp.status_code != 200 or "text/html" not in resp.headers.get("Content-Type", ""):
            continue
        page = extract_page(url, resp.text)
        pages.append(page)
        for link in page["links"]:
            if urlparse(link).netloc == domain and link not in seen:
                seen.add(link)
                queue.append(link)
        time.sleep(delay)
    return pages

if __name__ == "__main__":
    result = crawl(START_URL)
    with open("crawl_output.json", "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    print(f"Crawled {len(result)} pages -> crawl_output.json")
```

Adapt `extract_page` if the site needs specific fields (e.g. product price, article date) rather
than generic text. If the site renders content via JavaScript, this `requests`-based approach
won't see it — say so and switch to a browser MCP (Playwright) instead of silently returning
empty pages.

## Output Format

`crawl_output.json` — one object per page (`url`, `title`, `headings`, `text`, `links`).

Append to `HANDOUT.md`:
```
---
# Handout — website crawl — <date>

## Site crawled
<start URL, domain, depth/page limit used>

## Pages extracted
<count>

## robots.txt check
<result — allowed / restricted paths skipped>

## Pushed to
<repo path + commit, CMS endpoint, or "not pushed — awaiting destination">

## Known gaps
<JS-rendered pages skipped, pages that errored, etc>
```

## Guardrails & Tips

- Never crawl past what `robots.txt` allows, and never ignore an explicit "do not push" — pushing
  extracted content live (a commit/push, a CMS write) is a one-way, visible action: confirm the
  exact destination with the user before doing it, every time.
- Stay on the same domain; don't follow external links into an unbounded crawl.
- Large sites: page-limit first, confirm results look right, then raise the limit.

## Where it runs

**Claude Code** (writes and runs the Python script directly) or any assistant with code
execution + web access. Pushing to a repo needs git access; pushing to a CMS needs its API/MCP.

## Loop & Automation

**Recommended loop:** One-off for a migration/audit; re-run on a schedule (via the `website
connect & automate` companion agent) if the goal is keeping an external index in sync with the
site's current content.

> Part of the agent library at [agentshive.net](https://agentshive.net).
