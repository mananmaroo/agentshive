// Generates LinkedIn "coming soon" graphics + a recorded demo video for Agentshive.
// Outputs to: C:\Users\maroo\Downloads\Agentshive Marketing\linkedin\graphics
//   node scripts/gen_linkedin_assets.mjs
import { chromium } from 'playwright';
import { mkdir, rename, readdir } from 'node:fs/promises';

const OUT = 'C:/Users/maroo/Downloads/Agentshive Marketing/linkedin/graphics';
await mkdir(OUT, { recursive: true });

const FONT = `-apple-system,'Segoe UI',system-ui,sans-serif`;
const MONO = `'Cascadia Code',Consolas,'Courier New',monospace`;

// shared page shell
const shell = (w, h, inner) => `<!doctype html><html><head><meta charset="utf-8"><style>
  *{margin:0;box-sizing:border-box}
  html,body{width:${w}px;height:${h}px;overflow:hidden}
  body{font-family:${FONT}}
  .logo{display:inline-flex;align-items:center;gap:14px}
  .logo .mark{width:54px;height:54px;border-radius:14px;background:linear-gradient(135deg,#6366f1,#4338ca);
    display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:30px}
  .logo .name{color:#fff;font-weight:800;font-size:30px;letter-spacing:-.5px}
</style></head><body>${inner}</body></html>`;

const graphics = [
  // 1. Coming-soon banner (LinkedIn landscape 1200x627)
  {
    name: 'coming-soon-banner', w: 1200, h: 627,
    html: (w, h) => shell(w, h, `
    <div style="width:${w}px;height:${h}px;background:radial-gradient(1200px 600px at 80% -10%,#312e81 0%,#0b1120 55%);
      padding:64px 72px;display:flex;flex-direction:column;justify-content:space-between;position:relative;overflow:hidden">
      <div style="position:absolute;right:-80px;top:-80px;font-size:340px;opacity:.06">🐝</div>
      <div class="logo"><div class="mark">A</div><div class="name">Agentshive</div></div>
      <div>
        <div style="display:inline-block;background:rgba(99,102,241,.18);border:1px solid rgba(129,140,248,.5);
          color:#c7d2fe;font-weight:700;font-size:18px;padding:8px 18px;border-radius:999px;letter-spacing:2px">COMING SOON</div>
        <h1 style="color:#fff;font-size:62px;line-height:1.05;margin:22px 0 14px;letter-spacing:-1.5px;font-weight:800">
          The open registry for<br><span style="color:#818cf8">AI agents</span></h1>
        <p style="color:#94a3b8;font-size:24px;max-width:760px;line-height:1.4">
          Discover, install &amp; share ready-made agents — for Claude&nbsp;Code, Codex, n8n &amp; LangChain. One file, one command.</p>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between">
        <span style="color:#fbbf24;font-weight:700;font-size:22px">⚡ Launching June&nbsp;3</span>
        <span style="color:#cbd5e1;font-weight:600;font-size:22px">agentshive.net</span>
      </div>
    </div>`),
  },
  // 2. Coming-soon square (1080x1080)
  {
    name: 'coming-soon-square', w: 1080, h: 1080,
    html: (w, h) => shell(w, h, `
    <div style="width:${w}px;height:${h}px;background:radial-gradient(900px 700px at 50% 0%,#312e81 0%,#0b1120 60%);
      padding:90px;display:flex;flex-direction:column;justify-content:space-between;text-align:center;align-items:center;position:relative;overflow:hidden">
      <div style="position:absolute;left:50%;top:58%;transform:translate(-50%,-50%);font-size:560px;opacity:.05">🐝</div>
      <div class="logo" style="gap:18px"><div class="mark" style="width:66px;height:66px;font-size:38px">A</div>
        <div class="name" style="font-size:40px">Agentshive</div></div>
      <div style="position:relative">
        <div style="display:inline-block;background:rgba(99,102,241,.18);border:1px solid rgba(129,140,248,.5);
          color:#c7d2fe;font-weight:700;font-size:22px;padding:10px 24px;border-radius:999px;letter-spacing:4px;margin-bottom:30px">COMING SOON</div>
        <h1 style="color:#fff;font-size:84px;line-height:1.04;letter-spacing:-2px;font-weight:800;margin-bottom:26px">
          Stop rewriting<br>the same agent</h1>
        <p style="color:#94a3b8;font-size:30px;max-width:780px;line-height:1.45;margin:0 auto">
          A GitHub-style registry for AI agents. Grab a proven one and install it in seconds.</p>
      </div>
      <div style="color:#fbbf24;font-weight:700;font-size:30px">⚡ Launching June&nbsp;3 &nbsp;·&nbsp; <span style="color:#cbd5e1">agentshive.net</span></div>
    </div>`),
  },
  // 3. Comedy: the messy folder (1080x1080)
  {
    name: 'meme-the-folder', w: 1080, h: 1080,
    html: (w, h) => shell(w, h, `
    <div style="width:${w}px;height:${h}px;background:#0b1120;padding:80px 70px;display:flex;flex-direction:column;justify-content:center">
      <h2 style="color:#fff;font-size:46px;font-weight:800;margin-bottom:36px">Your <span style="color:#818cf8">.claude/agents/</span> folder right now:</h2>
      <div style="background:#0d1424;border:1px solid #1e293b;border-radius:16px;padding:34px 38px;font-family:${MONO};font-size:30px;line-height:2.05;color:#cbd5e1">
        <div>📄 research-agent.md</div>
        <div>📄 research-agent-v2.md</div>
        <div>📄 research-agent-FINAL.md</div>
        <div>📄 research-agent-FINAL-final.md</div>
        <div>📄 research-agent-USE-THIS-ONE.md</div>
        <div>📄 research-agent-actually-final.md</div>
        <div style="color:#64748b">📄 asdf.md</div>
      </div>
      <p style="color:#e2e8f0;font-size:34px;font-weight:700;margin-top:40px">There's a better way. 🐝</p>
      <p style="color:#94a3b8;font-size:26px;margin-top:8px">Agentshive — install the good one. Coming June 3.</p>
    </div>`),
  },
  // 4. Comedy: 2am prompt rewriting (1080x1080)
  {
    name: 'meme-2am', w: 1080, h: 1080,
    html: (w, h) => shell(w, h, `
    <div style="width:${w}px;height:${h}px;background:radial-gradient(800px 800px at 50% 120%,#1e1b4b 0%,#0b1120 60%);
      padding:90px;display:flex;flex-direction:column;justify-content:center;gap:30px">
      <div style="color:#64748b;font-size:40px;font-weight:600">Nobody:</div>
      <div style="color:#64748b;font-size:40px;font-weight:600">Absolutely nobody:</div>
      <div style="color:#fff;font-size:54px;font-weight:800;line-height:1.2;margin-top:10px">
        Me, at 2am, rewriting my system prompt for the 11th time so the agent <span style="color:#818cf8">finally</span> behaves: 😵‍💫</div>
      <div style="margin-top:50px;border-top:1px solid #1e293b;padding-top:36px">
        <p style="color:#e2e8f0;font-size:34px;font-weight:700">Or… just grab one that already works. 🐝</p>
        <p style="color:#94a3b8;font-size:26px;margin-top:8px">Agentshive — coming June 3 · agentshive.net</p>
      </div>
    </div>`),
  },
];

const browser = await chromium.launch();
const ctx = await browser.newContext({ deviceScaleFactor: 2 });
for (const g of graphics) {
  const page = await ctx.newPage();
  await page.setViewportSize({ width: g.w, height: g.h });
  await page.setContent(g.html(g.w, g.h), { waitUntil: 'networkidle' });
  await page.screenshot({ path: `${OUT}/${g.name}.png` });
  console.log('image  ✓', `${g.name}.png  (${g.w}x${g.h})`);
  await page.close();
}
await ctx.close();

// ---- Demo video recorded from the live site ----
console.log('recording demo video…');
const vctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, recordVideo: { dir: OUT, size: { width: 1280, height: 720 } } });
const vp = await vctx.newPage();
try {
  await vp.goto('https://www.agentshive.net/', { waitUntil: 'networkidle', timeout: 45000 });
  await vp.waitForTimeout(1800);
  await vp.mouse.wheel(0, 700); await vp.waitForTimeout(1500);
  await vp.mouse.wheel(0, 700); await vp.waitForTimeout(1500);
  await vp.goto('https://www.agentshive.net/agents', { waitUntil: 'networkidle', timeout: 45000 });
  await vp.waitForTimeout(2000);
  await vp.mouse.wheel(0, 600); await vp.waitForTimeout(1500);
  await vp.goto('https://www.agentshive.net/agents/45022f26-9e1a-420d-a518-553fc450ac7b', { waitUntil: 'networkidle', timeout: 45000 });
  await vp.waitForTimeout(2000);
  await vp.mouse.wheel(0, 900); await vp.waitForTimeout(2200);
  await vp.mouse.wheel(0, 900); await vp.waitForTimeout(2200);
} catch (e) { console.log('  (video nav note:', e.message + ')'); }
const video = vp.video();
await vctx.close();
if (video) {
  const p = await video.path();
  await rename(p, `${OUT}/agentshive-demo.webm`).catch(async () => {});
  console.log('video  ✓ agentshive-demo.webm');
}
await browser.close();
console.log('\nAll assets in:', OUT);
console.log(await readdir(OUT));
