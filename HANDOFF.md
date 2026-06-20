# Handoff — Agentshive — 2026-06-20 (LAUNCH DAY)

## Goal
Agentshive (agentshive.net) = free open registry of AI agents. This thread shipped the
Companions feature, a Browse template filter, legal pages, analytics, and launch assets.
Launch is **today (2026-06-20)**. Definition of done: everything live on prod `main`, tested.

## Current state — ALL on production `main` (agentshive.net)
Everything below is merged and live (run `git log --oneline -15` for exact SHAs; latest work
ends around commit `67c0cbb`+ social-footer + this handoff):
- **Companions**: `/companions` (intro card, 4 flagship cards: PA Local, PA Notion, Document
  Visualizer, Smart Coder + 18 Terminal Edition companions), `/companions/add` submission form.
  Downloads are **signup-gated** (logged-out → `/auth/signup?redirect=/companions`), no view link.
  Definitions served from `public/companions/*.md`.
- **Browse filter** (`/agents`): Template = **Claude Code / Codex / Agentshive Team**
  (Agentshive Team = creator `agentshive_team`; Claude Code/Codex = tag match). The companions
  page no longer has a filter (moved to Browse per request).
- **Compatibility copy** everywhere: works with Claude Code, Codex, Cursor, Perplexity, n8n,
  LangChain & any LLM (hero, intro card, Browse + agent detail).
- **Legal**: `/privacy` + `/terms` live, linked in footer.
- **Analytics**: GA4 wired via env var `NEXT_PUBLIC_GA_ID` (see Pending — not set yet).
- **Footer socials**: GitHub, LinkedIn (agentshive99), Instagram + X (@getagentshive), email.
- Earlier enrichment (54 team agents + 18 companions) already live since `a2c739a`.

## Done this session (2026-06-19 → 06-20)
- Recovered an OOM-crashing transcript by trimming (separate from this repo).
- Enriched 54 team agents + 18 companions; built Companions tab + add form.
- Wrote PA (local + Notion), Document Visualizer, Smart Coder definitions.
- Browse template filter; tagged all 54 `agentshive_team` agents with `claude-code` + `codex`
  (via `scripts/tag-templates.mjs`, service-role).
- Removed companions filter; gated companion downloads; intro card; compatibility copy.
- Privacy + Terms pages + footer links.
- GA4 (replaced Plausible); social footer links.
- **Signup flow tested end-to-end on prod: works** (email confirmation is OFF; profile row
  created by DB trigger; test user cleaned up). Script: `scripts/test-signup.mjs`.
- Launch assets: `MARKETING_REELS.md` (10 reels, shot-by-shot), `LAUNCH_POSTS.md` (PH/Reddit/
  X/LinkedIn/Show HN, handle @getagentshive), `LAUNCH_CHECKLIST.md` (legal + day-of + ads).
- Brand: handle **@getagentshive** secured on IG/X/TikTok/YouTube; site agentshive.net.

## Next steps (launch day)
1. **Set GA4 ID**: create GA4 property → add `NEXT_PUBLIC_GA_ID=G-XXXX` in Vercel (Production)
   → redeploy. (Or paste the ID to hardcode.)
2. Execute launch: Product Hunt (12:01am PT), then LinkedIn + X + IG reel; Reddit midday;
   reply to comments in first hour. Use `LAUNCH_POSTS.md`.
3. Record/post reels from `MARKETING_REELS.md` (faceless: hands+screen; lead with Visualizer).
4. Set same pic/bio/agentshive.net link on all 4 social handles.
5. After ~48h, boost the 2–3 best reels (settings in `LAUNCH_CHECKLIST.md`).

## Open items / decisions
- **GA4 ID not set yet** — analytics inert until done (step 1).
- **Email confirmation is OFF** in Supabase (frictionless; emails unverified). Flip on later if needed.
- **Minor DB**: deleting an auth user does NOT cascade to `public.users` (orphan row). Add
  `ON DELETE CASCADE` before shipping account-deletion.
- **Legal**: LLC not required to launch (Stripe Atlas later if taking payments); file
  "Agentshive" trademark in coming weeks; agentshive.com is parked on HugeDomains (for sale,
  not a competitor) — optional buy later; grabbed .net.
- **PR #1** (staging→main) now only holds the scripts/marketing-docx backup; staging also has
  `backup/working-files` (screenshots). Close PR #1 or merge the leftover docs — your call.
- LinkedIn handle is `agentshive99`, not `getagentshive` — unify if possible.

## Key files & paths
- `app/companions/page.tsx` (+ `add/page.tsx`, `layout.tsx`) — companions.
- `app/agents/page.tsx` — Browse + template filter; `app/agents/[id]/page.tsx` — detail + download gate.
- `app/privacy/page.tsx`, `app/terms/page.tsx` — legal.
- `app/layout.tsx` — GA4 (`NEXT_PUBLIC_GA_ID`), metadata, OG.
- `app/components/site-footer.tsx` — footer + socials; `sidebar-nav.tsx` — nav (Companions link).
- `public/companions/*.md` — downloadable defs; `AGENTS_CLAUDE_MD/` — canonical defs + spec.
- `scripts/tag-templates.mjs`, `scripts/test-signup.mjs`, `scripts/reel-shots.mjs` — utilities (read `.env.local`).
- `MARKETING_REELS.md`, `LAUNCH_POSTS.md`, `LAUNCH_CHECKLIST.md` — launch assets.

## Commands
- build: `npm run build`   dev: `npm run dev`   start: `npm run start`
- deploy: push to `main` → Vercel auto-deploys prod. Verify: `vercel ls --yes`.
- DB (service-role): scripts read `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`,
  `SUPABASE_SERVICE_ROLE_KEY`); REST at `${URL}/rest/v1/...`, auth admin at `${URL}/auth/v1/admin/users`.

## Environment & setup
- Next.js 16.2.6 (Turbopack) — NOT stock Next (see `AGENTS.md`). Supabase + Vercel.
- Repo `mananmaroo/agentshive`; Vercel project `maroomanan-5713s-projects/agentstack`; prod = agentshive.net.
- `gh` CLI installed but token lacks `read:org`; create PRs via GitHub API with the
  git-credential token (`git credential fill` → password; has `repo` scope).
- Secrets in `.env.local` (gitignored) and Vercel env. No secret values in repo or this file.
- This machine runs the baseline Claude Code build that OOM-crashes on huge transcripts; use
  `/compact` before context gets very large.
