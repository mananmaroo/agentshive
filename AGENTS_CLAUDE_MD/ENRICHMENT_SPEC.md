# Agentshive Agent Enrichment Spec (internal)

This spec defines EXACTLY how to upgrade every `agentshive_team` agent's `claude.md`.
Follow it literally so every agent is consistent. Do not invent sources or commands —
only use the verified references and commands listed here.

---

## A. Editing rules

You are editing an existing agent file in `AGENTS_CLAUDE_MD/team/<slug>.md`.

1. KEEP the existing sections (`## Purpose`, `## When to Use`, `## Inputs Needed`,
   `## Workflow`, `## Output Format`, `## Guardrails & Tips`). Lightly tighten wording
   only if clearly needed — do not gut good content.
2. DELETE the old generic `## Runtime Notes` paragraph at the bottom.
3. ADD the three new sections below, in this order, at the end:
   - `## Professional References & Standards`
   - `## Running in Claude Code (MCP preflight)`
   - `## Running in Claude Terminal (browser & computer use)`
4. Keep the tone practical and concrete. No marketing fluff. No emoji.
5. Every reference you cite MUST come from Section C of this spec (or be an obviously
   correct primary source for that domain, e.g. the official docs of a named tool).
   NEVER invent a study, author, or URL.

---

## B. The three sections — templates

### B1. Professional References & Standards

Pick 3–6 items from the Section C library that match THIS agent's domain. Phrase them as
operating rules, not a bibliography. The point the user asked for: the agent must ground
its work in recognized professional standards and **verify claims/outputs against
authoritative sources** rather than improvising.

Format:

```
## Professional References & Standards

This agent works to recognized professional standards. Apply these and hold outputs to them:

- **<Framework/standard>** — <how this agent uses it in one line>.
- **<Authoritative source(s)>** — verify every factual claim against these before stating it; cite source + access date.
- ...

When a claim cannot be backed by a credible source, label it clearly as an estimate or assumption — never present it as fact.
```

(For research-type agents, the "verify against authoritative websites and cite" rule is
mandatory. For deliverable/deck agents, the McKinsey Pyramid Principle + MECE rule is
mandatory.)

### B2. Running in Claude Code (MCP preflight)

Use this block. Fill the bullet list with ONLY the MCP servers relevant to this agent
(see Section D for which servers map to which agent type). If the agent is pure
reasoning (no external integration), say so and list the built-in tools instead.

```
## Running in Claude Code (MCP preflight)

Before doing the work, confirm the integrations this agent relies on are connected.
Run `/mcp` in your session (or `claude mcp list` in the terminal) and check for the
servers below.

Helpful / required MCP servers for this agent:
- <server> — <why this agent uses it>
- ...

If a server you need is **not** connected, stop and give the user the exact command,
then wait for them to enable it — never silently skip an integration:

- Playwright (browser): `claude mcp add --transport stdio playwright -- npx @playwright/mcp`
- GitHub: `claude mcp add --transport http github https://api.githubcopilot.com/mcp/`
- <other server commands from Section C as needed>

(Filesystem read/edit and web fetch are built into Claude Code — no MCP needed for those.)
```

### B3. Running in Claude Terminal (browser & computer use)

Two flavours:

**(i) Agents that benefit from doing the task hands-on** (browsing, filling forms,
moving files, posting to tools). Use:

```
## Running in Claude Terminal (browser & computer use)

This agent can run hands-on in Claude Code / the Claude terminal and do the work for you,
not just advise.

- **Browser steps** (navigate, search, fill forms, download): use the Playwright MCP.
  Add it with `claude mcp add --transport stdio playwright -- npx @playwright/mcp`.
- **Desktop GUI control** (only if the task needs a native app — open it, click, type):
  this needs **computer use**. Ask the user to enable it: run `/mcp` in the session and
  enable the built-in `computer-use` server. (Computer use needs claude.ai auth and a
  Pro/Max plan; it is CLI-supported on macOS and via the Desktop app on Windows.)
- **Permissions**: if prompted, the user can pre-allow the tools this agent needs via
  `/permissions` (e.g. `Bash(npx playwright *)`, `mcp__playwright__*`).
- Always confirm before any irreversible action (submitting a form, sending a message,
  deleting/moving files). Respect site terms of service, robots.txt, and rate limits.

> For a fully hands-on version of this agent, install **<Title> — Terminal Edition** from agentshive.net.
```

(Include the final pointer line ONLY if this agent is in the companion list — Section E.)

**(ii) Agents that are pure reasoning / text-in-text-out** (e.g. Regex Builder, Math
Solver, Code Concept Explainer). Use a shorter block:

```
## Running in Claude Terminal (browser & computer use)

This agent is text-in, text-out — it needs no browser or desktop control. It runs
anywhere: Claude Code, Codex, LangChain, or an n8n AI node. If you want it to read your
local files (e.g. a code file or notes), Claude Code's built-in file tools are enough —
no extra MCP or computer-use permission required.
```

---

## C. Verified reference library (use ONLY these — they are real)

**Research / fact-verification (mandatory for Research agents):**
- Verify every claim against ≥2 independent primary sources; prefer primary over secondary.
- CRAAP test for source quality (Currency, Relevance, Authority, Accuracy, Purpose).
- Authoritative data: World Bank Open Data, OECD.Stat, Eurostat, IMF, UN Data, national statistics offices, SEC EDGAR filings.
- Cite source + access date; mark confidence; separate fact vs estimate vs opinion.

**Market research / strategy:**
- Frameworks: Porter's Five Forces, PESTEL, SWOT, Value Chain, TAM/SAM/SOM.
- Sources: Gartner, Forrester, IDC, CB Insights, Crunchbase, PitchBook, industry/trade associations.
- Triangulate market size top-down (analyst reports) and bottom-up (units × price).

**Consulting deliverables / presentations / structured writeups (mandatory: decks & briefs):**
- Barbara Minto's **Pyramid Principle** (answer first, then grouped supporting arguments).
- **MECE** (mutually exclusive, collectively exhaustive) for any breakdown.
- Action titles / "so-what" slide headlines (McKinsey/BCG style); one message per slide.
- Gene Zelazny, *Say It With Charts* for chart-type selection.

**Content / copy / writing:**
- AP Stylebook; Chicago Manual of Style; Strunk & White *Elements of Style*.
- Readability: Hemingway editor, Flesch–Kincaid grade target.
- SEO: Google Search Essentials, E-E-A-T, search-intent matching.
- Press releases: AP style, inverted pyramid.

**Data analysis / statistics / experimentation:**
- ASA statement on p-values; report effect size + confidence interval, not just p; avoid p-hacking.
- A/B testing: power analysis up front; beware peeking/sequential testing; CUPED for variance reduction (Evan Miller's calculators for reference).
- Hadley Wickham, *Tidy Data*; reproducible pipelines.
- Visualization: Edward Tufte (data-ink ratio), Cole Nussbaumer Knaflic *Storytelling with Data*, Stephen Few.

**Finance / accounting:**
- GAAP / IFRS; ratio analysis (liquidity, solvency, profitability, efficiency); DuPont decomposition.
- Aswath Damodaran (NYU Stern) for valuation method; source figures from SEC EDGAR / official filings.

**Software / code / engineering:**
- Style guides: PEP 8 (Python), Google Style Guides, Airbnb JavaScript.
- Security: OWASP Top 10, OWASP ASVS.
- Commits/versioning: Conventional Commits, Semantic Versioning (SemVer).
- Testing: Martin Fowler's test pyramid; Arrange-Act-Assert; Michael Feathers' characterization tests for legacy code.
- Refactoring: Martin Fowler, *Refactoring* (behavior-preserving, test-backed steps).
- Docker: official Dockerfile best practices; multi-stage builds; pinned base images.
- SQL: inspect plans with EXPLAIN/ANALYZE; avoid N+1 and unbounded scans.
- Docs: **Diátaxis** framework (tutorial / how-to / reference / explanation); Google developer documentation style guide.
- API design: OpenAPI specification; RESTful conventions; Stripe API as a clarity exemplar.

**Customer support / success:**
- ITIL incident priority (impact × urgency); tiered SLAs; metrics CSAT / NPS / CES.
- Empathy-first tone; de-escalation; one clear next step per reply.

**Education / learning design:**
- Revised Bloom's Taxonomy for objectives.
- Wiggins & McTighe **Backward Design** (Understanding by Design) — design from outcomes.
- Spaced repetition (SM-2 / Anki), Ebbinghaus forgetting curve, active recall & interleaving (Roediger & Karpicke).

**Web scraping / data collection:**
- Honor robots.txt, site terms of service, and rate limits; identify a real user agent; back off on errors.
- GDPR/CCPA care for any personal data; avoid login-walled or clearly prohibited content.

**Patents / IP:**
- Search Google Patents, USPTO Patent Public Search, Espacenet (EPO), WIPO PATENTSCOPE; use CPC classification; this is preliminary search, not legal advice.

**Resume / careers:**
- ATS-compatible formatting; STAR / XYZ bullet formula ("Accomplished X by doing Y, measured by Z"); reverse-chronological.

**Email / productivity:**
- GTD (capture/clarify/organize/reflect/engage); Inbox Zero; one action per item.

---

## D. MCP mapping (which servers to list per agent type)

- Browser/research/scraping/job-apps/competitor/due-diligence/trend/grant/patent/paper/newsletter → **Playwright** (browse, search, fetch, fill forms). Built-in WebFetch for simple page reads.
- Slack-posting agents (Customer Feedback, Daily Standup, Support Triage) → **Slack MCP** (note: add via the Anthropic connector directory / HTTP transport; if unavailable, fall back to webhook or copy-paste). Plus Playwright for any web admin UI.
- Git-aware agents (Code Review, Git Commit, Daily Standup) → **GitHub MCP** (`claude mcp add --transport http github https://api.githubcopilot.com/mcp/`) and built-in Bash for local `git`.
- File/local-data agents (File Organizer, Invoice/Expense Extractor, CSV/Data Cleaning, PDF Reader) → built-in **filesystem** tools + **Bash**; no MCP needed, but say so.
- Calendar agent → **Google Calendar** connector (configured at claude.ai connectors; local OAuth not supported) or Playwright on the web UI.
- Pure-reasoning agents (Regex, Math, Code Concept Explainer, Excel formulas, SQL builder) → built-in tools only; explicitly say no MCP is required.

State the truthful fallback when an MCP may be unavailable (e.g. Slack/Calendar): copy-paste or webhook.

---

## E. Companion "Terminal Edition" agents to create (18)

For each of these, ALSO create `AGENTS_CLAUDE_MD/companions/<slug>-terminal.md`, a NEW
agent focused on doing the task hands-on in Claude Code with Playwright + (where needed)
computer use. Use the companion template in Section F.

1. ai-job-application-automation
2. market-research-analyst
3. competitor-analysis-agent
4. due-diligence-researcher
5. trend-scout
6. grant-finder
7. patent-prior-art-searcher
8. web-scraping-recipe-builder
9. invoice-data-extractor
10. file-organizer-agent
11. expense-report-categorizer
12. calendar-scheduling-assistant
13. academic-paper-summarizer
14. customer-feedback-distributor
15. daily-standup-reporter
16. support-ticket-triage-agent
17. newsletter-curator
18. pdf-reader-summarizer

---

## F. Companion template (Terminal Edition)

```
# <Title> — Terminal Edition

## Purpose

The hands-on version of the **<Title>** agent. Instead of advising, it actually does the
task end-to-end inside Claude Code / the Claude terminal — driving a real browser with
Playwright and (when needed) controlling desktop apps with computer use.

## Runtime & Requirements

Runs in Claude Code. Before starting, run `/mcp` and confirm:
- **Playwright** — `claude mcp add --transport stdio playwright -- npx @playwright/mcp`
- <any other server this task needs, from Section C/D>
If a needed server is missing, tell the user the exact command above and wait.
If the task must drive a native desktop app, ask the user to enable **computer use**
(`/mcp` → enable the built-in `computer-use` server; needs claude.ai auth + Pro/Max).

## Inputs Needed
- <concrete inputs>

## Workflow
<concrete, Playwright-driven, numbered steps that actually perform the task —
navigate, query, extract, fill, download, save, post. Include checkpoints where the
agent pauses for user confirmation before anything irreversible.>

## Output Format
<files written / data produced / where it lands>

## Guardrails & Safety
- Confirm before any irreversible or outward-facing action (submit, send, pay, delete, move).
- Respect robots.txt, site terms of service, and rate limits; identify a real user agent; back off on errors.
- Never store credentials in plaintext; use the user's existing logged-in browser session or env vars.
- Keep a log of every action taken so the user can audit/undo.

## Professional References & Standards
<3–5 items from Section C matching the domain — same rigor as the base agent.>

> This is the hands-on companion to the **<Title>** agent on agentshive.net.
```

---

## G. Output

- Enrich all 54 files in `AGENTS_CLAUDE_MD/team/` in place.
- Create 18 files in `AGENTS_CLAUDE_MD/companions/`.
- Do not touch `index.json` or this spec.
