export type FreeAgentCandidate = {
  title?: string | null;
  description?: string | null;
  tags?: string[] | null;
  category?: string[] | null;
};

// These signals mean the listing depends on a separate integration, runtime,
// or paid developer/AI service. We do not label those agents as Free without
// an explicit creator declaration and a real compatibility check.
const externalSignals = [
  'api', 'mcp', 'slack', 'jira', 'google-calendar', 'github', 'database',
  'cloud', 'email', 'playwright', 'rpa', 'social-media', 'youtube', 'linkedin',
  'web', 'scrap', 'browser', 'form', 'calendar', 'rss', 'monitoring', 'backup',
  'sql', 'ocr', 'invoice', 'voice', 'phone', 'desktop-app', 'electron',
  'claude-desktop', 'claude-code', 'codex', 'n8n', 'shopify', 'woocommerce',
];

export function isFreeAgent(agent: FreeAgentCandidate) {
  const tags = (agent.tags ?? []).map((tag) => tag.toLowerCase().trim());
  const text = [agent.title, agent.description, ...(agent.category ?? [])]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (/requires?\s+(a\s+)?(paid|pro|team|enterprise)|subscription required|api key required|paid api/i.test(text)) {
    return false;
  }

  return !externalSignals.some((signal) => tags.some((tag) => tag === signal || tag.includes(signal)));
}

export const freeAgentBadgeTitle =
  'Free to try with a free AI chat plan. External integrations may have separate costs.';
