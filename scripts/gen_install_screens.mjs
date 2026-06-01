// Renders beginner-friendly "terminal" screenshots for the How-to-install-and-run
// guide on the agent detail page. Outputs PNGs to public/install/.
//   node scripts/gen_install_screens.mjs
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const OUT = './public/install';
await mkdir(OUT, { recursive: true });

// A reusable mac-style terminal window. `lines` is an array of
// { t: text, c: optional color class } — `c` defaults to light grey.
function terminal(title, lines) {
  const body = lines.map(l => {
    const cls = l.c || 'fg';
    return `<div class="line ${cls}">${l.t}</div>`;
  }).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    * { box-sizing: border-box; }
    body { margin:0; background:#0b1120; font-family:'Segoe UI',system-ui,sans-serif; }
    .wrap { width:900px; padding:28px; }
    .win { background:#0d1424; border:1px solid #1e293b; border-radius:12px; overflow:hidden;
           box-shadow:0 18px 50px rgba(0,0,0,.5); }
    .bar { display:flex; align-items:center; gap:8px; padding:12px 16px; background:#111a2e;
           border-bottom:1px solid #1e293b; }
    .dot { width:12px; height:12px; border-radius:50%; }
    .r{background:#ff5f57}.y{background:#febc2e}.g{background:#28c840}
    .ttl { color:#64748b; font-size:13px; margin-left:10px; font-family:'Cascadia Code',Consolas,monospace; }
    .scr { padding:22px 24px; font-family:'Cascadia Code',Consolas,'Courier New',monospace;
           font-size:15px; line-height:1.9; min-height:300px; }
    .line { white-space:pre-wrap; word-break:break-all; }
    .fg { color:#cbd5e1; }
    .muted { color:#64748b; }
    .prompt { color:#818cf8; }
    .cmd { color:#e2e8f0; font-weight:600; }
    .ok { color:#34d399; }
    .warn { color:#fbbf24; }
    .agent { color:#a5b4fc; }
  </style></head><body><div class="wrap"><div class="win">
    <div class="bar"><div class="dot r"></div><div class="dot y"></div><div class="dot g"></div>
      <div class="ttl">${title}</div></div>
    <div class="scr">${body}</div>
  </div></div></body></html>`;
}

const steps = [
  {
    name: 'step1',
    title: 'Terminal — install Claude Code',
    lines: [
      { t: '<span class="prompt">$</span> <span class="cmd">npm install -g @anthropic-ai/claude-code</span>' },
      { t: 'added 1 package in 6s', c: 'muted' },
      { t: '' },
      { t: '<span class="prompt">$</span> <span class="cmd">claude</span>' },
      { t: 'Sign in to continue…', c: 'fg' },
      { t: '✓ Logged in as you@email.com', c: 'ok' },
      { t: '⚠ Running agents requires a Pro or Max plan', c: 'warn' },
      { t: '  (Claude Pro / Max for Claude Code · ChatGPT Plus for Codex)', c: 'muted' },
    ],
  },
  {
    name: 'step2',
    title: 'Terminal — add the agent',
    lines: [
      { t: '<span class="muted"># paste the install command from the agent page</span>' },
      { t: '<span class="prompt">$</span> <span class="cmd">curl -fsSL https://www.agentshive.net/api/agents/&lt;id&gt;/raw \\</span>' },
      { t: '<span class="cmd">      -o .claude/agents/my-agent.md</span>' },
      { t: '' },
      { t: '<span class="prompt">$</span> <span class="cmd">ls .claude/agents/</span>' },
      { t: 'my-agent.md', c: 'ok' },
      { t: '✓ Agent saved — Claude Code will pick it up automatically', c: 'ok' },
    ],
  },
  {
    name: 'step3',
    title: 'Terminal — run the agent',
    lines: [
      { t: '<span class="prompt">$</span> <span class="cmd">claude</span>' },
      { t: 'Welcome to Claude Code', c: 'muted' },
      { t: '' },
      { t: '<span class="prompt">&gt;</span> <span class="cmd">use the my-agent agent to process today\'s feedback emails</span>' },
      { t: '' },
      { t: '<span class="agent">● I\'ll run the my-agent workflow now…</span>' },
      { t: '<span class="agent">  ✓ Read 12 emails · sorted into 3 teams · drafted replies</span>' },
      { t: '<span class="ok">Done. Summary posted to #support.</span>' },
    ],
  },
];

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 900, height: 560 }, deviceScaleFactor: 2 });
for (const s of steps) {
  const page = await ctx.newPage();
  await page.setContent(terminal(s.title, s.lines), { waitUntil: 'networkidle' });
  const el = await page.$('.wrap');
  await el.screenshot({ path: `${OUT}/${s.name}.png` });
  console.log(`wrote ${OUT}/${s.name}.png`);
  await page.close();
}
await browser.close();
console.log('done');
