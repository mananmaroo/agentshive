# Agentshive — Marketing & Growth Plan (June 2026)

## 1. Business Viability — Honest Assessment

**Short answer: yes, Agentshive can become a business — but not yet, and not via ads-first growth.**
It's a two-sided marketplace; value comes from supply (good agents) attracting demand (installers), which attracts more supply. Monetization before ~10k MAU would kill the flywheel.

### Monetization ladder (in order of when to turn each on)

| Stage | Trigger | Revenue stream |
|---|---|---|
| Now | — | Donations (already live), affiliate links (Claude Pro, hosting) |
| ~10k MAU | Real traffic | Sponsored/featured agent listings for AI tool companies ($200–500/mo per slot) |
| ~25k MAU | Creator demand | Pro accounts: private agents, analytics, custom profile ($5–9/mo) |
| ~50k MAU | Org demand | **Teams/Enterprise: private registries for companies** (the GitHub model — this is the real business, $49–199/mo per org) |
| Mature | Paid-agent demand | Marketplace take-rate (15–20%) on paid agents |

### Risks to be honest about
- **Platform risk:** Anthropic/OpenAI could ship first-party agent registries (Anthropic already has a plugin/skills ecosystem). Mitigation: be runtime-neutral (Claude Code + Codex + n8n + LangChain) — the "Docker Hub for agents," not a single-vendor catalog.
- **Free competition:** GitHub awesome-lists and gists. Mitigation: ratings, one-command install, discovery, and creator profiles are the moat — curation beats lists.
- **Cold start:** Need ~200–500 genuinely good agents before organic traffic compounds.

**Verdict:** Viable as a bootstrap/indie business reaching $1–10k MRR within 12 months if traction comes; venture-scale only if it becomes *the* default registry. Strong résumé/credibility asset either way.

---

## 2. The 100k-Users-in-3-Months Question — Real Math

Paid acquisition alone **cannot** get there on an indie budget:

| Channel | Realistic cost per signup (dev audience) | 100k users would cost |
|---|---|---|
| LinkedIn ads | $30–80 | $3M–8M |
| Instagram ads | $5–20 (low intent) | $500k–2M |

**Realistic targets:** 8–15k registered users in 3 months (organic-led + $1–2k total ad spend), 100k in 12–18 months if the viral loops below work. The companies that hit 100k in a quarter did it with virality, not ads.

### What actually drives the curve (priority order)

1. **SEO / programmatic pages** (now shipped: sitemap, OG images, metadata). Every agent page is a landing page. Target long-tail: "claude code agent for X". Add 5–10 new quality agents weekly.
2. **Launch moments:** Product Hunt launch, Hacker News "Show HN", r/ClaudeAI, r/LocalLLaMA, r/n8n, X/Twitter AI-builder community, LinkedIn organic. Each can deliver 1–5k visits in a day. Stagger them (one big launch every 3–4 weeks).
3. **Creator-led viral loop:** every uploader shares their own agent page. Give creators: download-count badges (`![installs](...)` for their GitHub READMEs), "Agent of the Week" features, leaderboard. **This is the highest-leverage build item.**
4. **Short-form video (Instagram Reels / TikTok / YouTube Shorts):** 30-second screen recordings of an agent doing something impressive — "I automated my job applications with one curl command." Organic Reels >> paid Reels for this audience.
5. **Paid ads as amplifier only:** $500–1,000/mo total. Instagram: retarget + boost the best-performing organic Reels. LinkedIn: skip paid ads at first (too expensive); use organic company-page posts + founder posts instead. If testing LinkedIn paid, only retargeting ($10/day cap).

### 3-month calendar

| Month | Focus | Goal |
|---|---|---|
| 1 | Seed supply: 100+ quality agents, creator badges, Product Hunt launch | 2,000 users |
| 2 | Show HN + Reddit launches, 3 Reels/week, start $500/mo IG ads on winners | 6,000 users |
| 3 | "Agent of the Week" + leaderboard, partnerships with AI newsletters/YouTubers, scale winning ads | 12,000–15,000 users |

---

## 3. Ad Strategy

### Instagram (awareness + retargeting)
- Audience: 22–40, interests: AI tools, ChatGPT, programming, productivity, automation; lookalikes from signups once >1k.
- Formats: Reels (primary), carousel (educational), story ads (retargeting).
- Budget split: 70% Reels boosts of proven organic content, 30% cold carousel tests.
- KPI: cost per landing-page view < $0.30; cost per signup < $5.

### LinkedIn (organic-first)
- Company page (already exists: /company/agentshive99) + founder personal posts 3×/week: agent spotlights, build-in-public metrics, "how I built X" threads.
- Paid only for retargeting site visitors, $10/day cap, single-image ads.
- KPI: organic post impressions, follower growth; paid CTR > 0.6%.

---

## 4. Canva AI Prompts

**Brand kit to set first in Canva:** Background `#0A0A14` (near-black navy), Primary `#6366F1` (indigo), Accent `#C7D2FE` (light indigo), White text, font Inter/Geist-style geometric sans, motif: hexagons/honeycomb + subtle starfield.

### Instagram square posts (1080×1080) — Magic Design / Magic Media

1. "Dark navy tech poster, 1080x1080, subtle starfield background, glowing indigo honeycomb hexagon pattern on the right edge, large bold white headline 'Stop building AI agents from scratch', subheadline in light indigo 'Install ready-made agents in one command', a sleek dark terminal window mockup showing one line of code glowing indigo, footer 'agentshive.net' in monospace font, minimal, premium developer-tool aesthetic like Vercel or Linear"

2. "Minimal dark tech infographic, 1080x1080, deep navy background #0A0A14, headline 'What is an AI agent registry?', three glowing indigo hexagon icons in a vertical row labeled 'Discover', 'Install', 'Share', short white caption under each, thin indigo divider lines, footer 'agentshive.net — free & open', clean geometric sans-serif, generous spacing, Notion-meets-Vercel style"

3. "Bold statement post, 1080x1080, near-black background with faint hexagonal grid texture, giant indigo-to-violet gradient text '1 command.', second line in white 'Any AI agent. Installed.', small terminal snippet pill below in monospace 'curl agentshive.net/...', tiny bee/hexagon logo mark top left, ultra minimal, high contrast, developer meme-card energy"

4. "Before/after split layout, 1080x1080, dark navy theme, left half labeled 'Before' showing a messy pile of browser tabs and docs icons in dull gray, right half labeled 'After' showing one clean glowing terminal line and a checkmark in indigo, headline at top in white 'Setting up an AI agent', footer 'agentshive.net', flat vector illustration style, subtle glow effects"

### Instagram Reels covers / Stories (1080×1920)

5. "Vertical Reel cover, 1080x1920, dark starfield background, large white headline at top third 'I automated my job applications with AI', glowing indigo arrow pointing down to a dark terminal mockup, bold pill button graphic 'watch how →', hexagon accents in corners, energetic but premium developer aesthetic"

6. "Vertical story ad, 1080x1920, deep navy gradient to indigo at bottom, centered phone-style mockup of a dark website showing AI agent cards with star ratings, headline above in bold white 'The app store for AI agents', CTA pill at bottom 'agentshive.net — it's free', floating hexagon particles, modern SaaS promo style"

### LinkedIn (1200×627 single image / 1080×1080 carousel)

7. "LinkedIn ad banner, 1200x627, dark professional tech design, deep navy background with subtle honeycomb pattern fading from the right edge, left-aligned bold white headline 'Your team is rebuilding agents your industry already solved', indigo subheadline 'Browse the open AI agent registry', small terminal snippet graphic bottom left, logo text 'Agentshive' top left, enterprise SaaS aesthetic like Datadog or GitHub ads"

8. "LinkedIn carousel slide template, 1080x1080, dark navy, big indigo slide number top left inside a hexagon outline, white headline area mid-page, light indigo body text area below, thin progress dots at bottom, footer 'agentshive.net', consistent minimal developer-tool design system, 6-slide series titled '6 AI agents that save you 5 hours a week'"

9. "LinkedIn ad, 1200x627, split design: left 60% dark navy with white headline 'GitHub changed how we share code. This changes how we share AI agents.' and indigo CTA button mockup 'Explore free →', right 40% screenshot frame of a dark mode website with agent cards and ratings, professional, credible, no clipart"

### Launch & community assets

10. "Product Hunt launch banner, 1270x760, dark navy starfield, centered glowing indigo hexagon logo with a stylized bee silhouette, headline 'Agentshive — the open registry for AI agents', subline 'Discover, rate & install agents for Claude Code, Codex, n8n', confetti made of tiny hexagons, celebratory but sleek"

11. "Quote/testimonial card, 1080x1080, dark navy, large indigo opening quote mark, white quote text placeholder in elegant sans-serif, below it a small circular avatar placeholder with name and role in light gray, hexagon watermark bottom right, footer 'agentshive.net', editorial minimal style"

12. "Stat flex card, 1080x1080, near-black background, one giant gradient indigo-to-violet number '10,000+' filling upper half, white label 'agent downloads and counting', tiny upward trend line graphic in indigo, footer 'agentshive.net — join the hive', bold typographic poster style"

### Magic Media (AI image) prompts for backgrounds/hero art

13. "Futuristic honeycomb made of glowing indigo light panels floating in dark space, some cells containing small glowing robot icons, deep navy background, soft volumetric glow, 3D render, dark premium tech wallpaper, no text"

14. "Isometric 3D illustration of tiny glowing robots carrying code files into a large hexagonal hive structure, dark navy scene lit with indigo and violet neon, soft shadows, premium developer-tool brand illustration style, no text"

15. "Abstract swarm of light particles forming a hexagon over a dark terminal window, indigo and cyan glow on near-black background, cinematic depth of field, wide banner composition, no text"

> Tip: generate 3–4 variants of each, then A/B test — keep whichever gets >1% CTR organic before putting ad spend behind it.
