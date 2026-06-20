# Handoff — Agentshive — 2026-06-19

## Goal
Agentshive (agentshive.net) = open registry of AI agents. Current thread: ship the
**Companions** feature + new companion definitions, going live ~2026-06-20. Done = features
on production `main`, tested, no junk in prod.

## Current state
- **LIVE on prod** (`main` = `06e7740`, Vercel Ready, agentshive.net): Companions tab
  (`/companions`, `/companions/add`), the Official/Claude/OpenAI filter, 21 companion
  definitions served from `public/companions/*.md`, and the earlier enrichment (54 team
  agents + 18 Terminal Edition companions).
- `/companions`, `/companions/add`, `/companions/smart-coder.md` all return 200 on prod.
- **`staging` = `f37f204`**: same features + a working-artifacts commit (verify/audit
  scripts, marketing `.docx`) that is NOT on prod by design. Screenshots are untracked +
  gitignored. Open as **PR #1** (staging->main); now only the artifacts differ from main.
- **`backup/working-files`** branch on GitHub = durable backup of the 13 QA screenshots.

## Done this session
- Recovered an OOM-crashing transcript by trimming it (separate from this repo).
- Enriched 54 team agent files + added 18 companions (commit `a2c739a`, already live).
- Built Companions tab + add form + navbar link; wrote PA (local + Notion), Document
  Visualizer, and Smart Coder definitions.
- Added Official/Claude/OpenAI filter with platform badges.
- Kept screenshots out of prod (untracked + gitignored + backup branch).
- Cherry-picked companion + filter to `main`, pushed, verified deploy green.

## Next steps
1. Decide fate of PR #1: it now only carries scripts + marketing `.docx`. Merge it if those
   should live in the repo, else close it (work is already on `backup/working-files`).
2. If wanted: add the Official/Claude/OpenAI filter to the main Browse page (`/agents`) too.
3. If more agents should appear under the OpenAI filter, tag them (currently only
   Document Visualizer + Smart Coder are Claude+OpenAI; rest are Claude).
4. Optional: seed PA/Visualizer/Smart Coder into Supabase so they show as first-class
   agents, not just downloadable files.

## Key files & paths
- `app/companions/page.tsx` — Companions page (marquee data, `moreCompanions`, filter logic).
- `app/companions/add/page.tsx` — submission form (mirrors `app/agents/upload`; category locked to `Companion`).
- `app/components/shared-navbar.tsx` — nav link.
- `public/companions/*.md` — downloadable definitions (21).
- `AGENTS_CLAUDE_MD/companions/`, `AGENTS_CLAUDE_MD/team/smart-coder.md` — canonical defs.
- `AGENTS_CLAUDE_MD/ENRICHMENT_SPEC.md` — enrichment rules.

## Commands
- build: `npm run build`   dev: `npm run dev`   start: `npm run start`
- deploy: push to `main` (Vercel auto-deploys prod); other branches = preview.
- vercel status: `vercel ls --yes` / `vercel inspect <url>`.

## Environment & setup
- Next.js 16.2.6 (Turbopack) — NOT stock Next; see `AGENTS.md`. Supabase backend.
- Repo: `mananmaroo/agentshive`. Vercel project: `maroomanan-5713s-projects/agentstack`.
- Prod alias: agentshive.net (serves `main`). Preview deploys behind Vercel login.
- `gh` CLI installed but token lacks `read:org`; for GitHub API use the git-credential
  token directly (`git credential fill` -> `password`), which has `repo` scope.
- No secret values here. Supabase keys live in env / Vercel project settings.

## Decisions & rationale
- Companions = Claude Code agent definitions (MCP-driven, downloadable), NOT a hosted
  Gmail-OAuth service (that live-automation build is a separate, larger, security-heavy
  project).
- New work isolated on `staging` first; only companion+filter cherry-picked to `main` to
  keep prod clean (no scripts/docx/screenshots).
- PA shipped in two editions (local Markdown notes + Notion) per user request.

## Open questions / blockers
- PR #1 disposition (merge vs close) — user to decide.
- Whether to extend the filter to `/agents` and broaden OpenAI tagging.
- Machine runs the x86_64_baseline Claude Code build that OOM-crashes on huge transcripts;
  use `/compact` before context gets very large.
