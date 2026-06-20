# Agentshive — Launch Checklist & Legal Notes

> Not legal advice — general guidance. Confirm entity/IP specifics with a lawyer in your
> country of residence.

## Legal — what to do before tomorrow (and what to skip)

**Patent — SKIP.** A web registry of agent definitions almost certainly isn't patentable, it's
slow ($) and, importantly, a public launch can destroy patentability in most countries
(outside the US there's usually no grace period for public disclosure). Don't let it block you.
Only pause if you have a genuinely novel technical method — then talk to an attorney *before*
disclosing.

**LLC / company — NOT required to launch.** You can launch as an individual today. Form an
entity when you (a) start taking payments, (b) get real users/liability, or (c) want to look
official. Options:
- Global solo founder wanting a US entity + Stripe payments → **Stripe Atlas** (Delaware) is the
  common path.
- Otherwise register where you legally reside.
Do it within the first few weeks, not tonight.

**Trademark — do the cheap part now, file later.**
- Tonight (15 min, cheap/free): a quick clearance search — USPTO TESS (US), EUIPO (EU), and your
  national registry — to confirm "Agentshive" isn't already taken in software/SaaS classes.
- Tonight: **grab the handles + domains** — @agentshive on IG/X/TikTok/LinkedIn, and
  agentshive.com/.ai if available. This is the real time-sensitive move (squatters move fast).
- Filing the actual trademark is a months-long process — do it in the coming weeks, not tonight.

**Most important legal items for launch day (bigger than the LLC):**
- [ ] **Privacy Policy** page — you collect signups/emails; the Personal Assistant companion
  references Gmail. Cover what you store and GDPR/CCPA basics.
- [ ] **Terms of Service** page.
- [ ] Cookie/analytics notice if you have EU traffic.
- [ ] A contact email (e.g. team@agentshive.net) reachable.

## Site readiness (check on production)
- [ ] Signup + login work; download gate redirects logged-out users to signup.
- [ ] Mobile looks right (already fixed) and loads fast.
- [ ] Link previews: Open Graph image renders when you paste agentshive.net into IG DM / X / LinkedIn.
- [ ] Analytics installed (Plausible or GA4) so you can see launch traffic.
- [ ] Error monitoring (optional: Sentry) for launch-day surprises.
- [ ] 404 and empty states don't look broken.

## Assets ready
- [ ] 5+ reels exported (lead with #3 Visualizer, #2 PA, #5 speed).
- [ ] Product Hunt gallery images — reuse `reel-shots/*.png` (home, companions, browse).
- [ ] Link-in-bio set (Linktree or direct to agentshive.net).
- [ ] Posts copied from LAUNCH_POSTS.md.

## Launch-day sequence
1. **12:01am PT** — Product Hunt goes live (schedule the day before). Post your maker comment immediately.
2. Morning — LinkedIn + X thread + first IG reel.
3. Midday — Reddit (r/ClaudeAI, r/SideProject) — value-first, link in first comment.
4. Optional — Show HN.
5. All day — reply to every comment within the first hour of each post.
6. DM 10–20 people who'd genuinely find it useful and ask them to try + comment.

## Paid boosting (after organic signal)
- Wait ~48h; boost only the 2–3 reels with the best **completion rate + saves**.
- Use **Meta Ads Manager → Reels placement**, objective **Traffic (link clicks)** or **Profile
  visits** — not the one-tap "Boost".
- Audience: interests like *Anthropic/Claude, ChatGPT, OpenAI, Cursor, GitHub, automation,
  no-code, indie hackers*; ages 18–40; keep it broad and let Meta optimize.
- Budget: **$5–10/day per winning reel for 3–4 days.** Kill any ad with CPC above ~$0.30–0.50.
- Later: retarget video viewers + profile visitors.

## First-week metrics to watch
- Signups, agent downloads, reel completion rate, profile visits → site clicks, PH rank.
- Double down on whichever agent/companion gets the most downloads — make more reels about it.
