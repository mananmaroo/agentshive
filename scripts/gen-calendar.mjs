import { writeFileSync } from 'node:fs';

const START = new Date(Date.UTC(2026, 5, 20)); // 2026-06-20 (launch day)
const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const fmt = (off) => {
  const d = new Date(START.getTime() + off * 86400000);
  return { date: d.toISOString().slice(0, 10), wd: WD[d.getUTCDay()], day: off + 1 };
};

const REELS = [
  { r: 3, t: 'Document Visualizer (doc -> deck)' },
  { r: 2, t: 'Personal Assistant (email -> to-do)' },
  { r: 5, t: 'Install in 10 seconds' },
  { r: 1, t: 'Stop re-prompting your AI' },
  { r: 6, t: 'Cancel these 5 subscriptions' },
  { r: 8, t: 'ChatGPT talks, this does' },
  { r: 13, t: '3 things AI should do automatically' },
  { r: 12, t: 'Before/after: manual vs agent' },
  { r: 9, t: 'No lock-in (any LLM)' },
  { r: 7, t: 'POV: 5pm, report not started' },
  { r: 16, t: 'Messy notes -> action items' },
  { r: 4, t: 'Smart Coder (handoff / save tokens)' },
  { r: 11, t: 'Agent of the day' },
  { r: 17, t: 'Read papers 10x faster (students)' },
  { r: 15, t: 'Submit your own agent (creators)' },
  { r: 18, t: 'Free market research (founders)' },
  { r: 19, t: 'Stop copy-pasting prompts' },
  { r: 10, t: 'Founder reel (face)' },
  { r: 14, t: 'Milestone / build-in-public' },
  { r: 20, t: 'What should I build next? (engagement)' },
];

const rows = [];
// 20 reels spread evenly across 30 days
REELS.forEach((reel, i) => {
  const off = Math.round((i * 29) / (REELS.length - 1));
  const f = fmt(off);
  rows.push([f.date, f.wd, f.day, 'Reel', `R${reel.r} — ${reel.t}`,
    'IG Reels + YouTube Shorts + TikTok; repurpose to X + LinkedIn',
    `Script: MARKETING_REELS R${reel.r}. Post ~11am & 6pm; reply to comments in first hour.`, 'Planned']);
});

// Non-reel posts (offset -> rows)
const extras = [
  [0, 'Launch', 'Product Hunt launch', 'Product Hunt', 'Go live 12:01am PT; post maker comment immediately (LAUNCH_POSTS).'],
  [0, 'Launch', 'Launch thread', 'X', 'Use LAUNCH_POSTS X thread.'],
  [0, 'Launch', 'Launch post', 'LinkedIn', 'Use LAUNCH_POSTS LinkedIn.'],
  [0, 'Launch', 'Launch (value-first)', 'Reddit (r/SideProject, r/ClaudeAI)', 'Text post; link in first comment.'],
  [3, 'Post', 'Value post: "how it works"', 'Reddit (r/artificial)', 'No hard sell; answer questions.'],
  [6, 'Post', 'Build-in-public update', 'LinkedIn + X', 'What shipped this week + a demo clip.'],
  [7, 'Carousel', '5 free agents to try', 'Instagram + LinkedIn', '5-slide carousel; CTA agentshive.net.'],
  [10, 'Post', 'Value / mini-AMA', 'Reddit (r/ChatGPT)', 'Share a workflow; invite requests.'],
  [13, 'Thread', 'Deep-dive: portable agents', 'X', 'Explain no-lock-in; link.'],
  [14, 'Milestone', 'Downloads/signups milestone', 'All platforms', 'Use real numbers; thank early users.'],
  [17, 'Carousel', 'How to install an agent', 'Instagram + LinkedIn', 'Step-by-step carousel.'],
  [20, 'Post', 'Value post: agent roundup', 'Reddit (r/SideProject)', 'Top agents of the month.'],
  [21, 'Post', 'Creator angle: publish yours', 'LinkedIn', 'Invite creators to submit.'],
  [24, 'Thread', 'Best agents this month', 'X', 'Roundup + link.'],
  [27, 'Carousel', 'Behind the build', 'Instagram + LinkedIn', 'Story of building Agentshive.'],
  [29, 'Recap', 'Month recap + "build next?"', 'All platforms', 'Recap wins; ask what to build next.'],
];
extras.forEach(([off, type, topic, plat, note]) => {
  const f = fmt(off);
  rows.push([f.date, f.wd, f.day, type, topic, plat, note, 'Planned']);
});

rows.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : a[3] === 'Reel' ? 1 : -1));

const header = ['Date', 'Weekday', 'Day', 'Type', 'Topic / Content', 'Platforms', 'Caption / Notes', 'Status'];
const esc = (v) => { const s = String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
const csv = [header, ...rows].map((r) => r.map(esc).join(',')).join('\r\n');
writeFileSync('CONTENT_CALENDAR.csv', csv + '\r\n');
console.log(`wrote CONTENT_CALENDAR.csv — ${rows.length} scheduled items (${REELS.length} reels) over 30 days`);
