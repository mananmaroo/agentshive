export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  author: { username: string; avatar_url?: string };
  featured_image_url?: string;
  published_at: string;
  view_count: number;
  content?: string;
}

export const samplePosts: BlogPost[] = [
  {
    id: '1',
    title: "Getting Started with AI Agents: A Beginner's Guide",
    slug: 'getting-started-ai-agents',
    excerpt:
      "Learn how to build your first AI agent from scratch — whether you use Claude Code, Codex, n8n, or LangChain. Basics, best practices, and common pitfalls.",
    category: 'Tutorial',
    author: { username: 'alexchen', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' },
    featured_image_url:
      'https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=1200&h=600&fit=crop',
    published_at: '2026-05-25',
    view_count: 234,
    content:
      "An AI agent is a runtime that takes a prompt + tools and works toward an outcome. Whether you pick Claude Code, Codex, n8n, or LangChain, the fundamentals are the same:\n\n1. Define the agent's purpose in a clear system prompt.\n2. Give it the smallest set of tools it needs to succeed.\n3. Test on real examples before publishing.\n\nThis post walks through each step using a research-summarizer agent as a working example.",
  },
  {
    id: '2',
    title: 'Building Production-Ready Agents: Lessons From 6 Months in Prod',
    slug: 'production-ready-agents',
    excerpt:
      "A deep dive into what we learned after deploying agents to production. Error handling, monitoring, and scaling considerations.",
    category: 'Engineering',
    author: { username: 'sarahdev', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
    featured_image_url:
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=600&fit=crop',
    published_at: '2026-05-20',
    view_count: 456,
    content:
      "Six months ago we shipped our first agent to production. Here is what broke, what worked, and what we would do differently:\n\n- Retry policies matter more than model choice for tail latency.\n- Token budgets need explicit ceilings per turn, not just per session.\n- Observability beats unit tests for agents — capture every tool call.\n\nFull writeup with code samples below.",
  },
  {
    id: '3',
    title: 'Prompt Engineering Tips for Better Agent Performance',
    slug: 'prompt-engineering-tips',
    excerpt:
      "Master the art of writing effective prompts. These techniques have helped our community build agents with 90%+ accuracy.",
    category: 'Tips & Tricks',
    author: { username: 'promptmaster', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Master' },
    featured_image_url:
      'https://images.unsplash.com/photo-1516321318423-f06f70d504f0?w=1200&h=600&fit=crop',
    published_at: '2026-05-15',
    view_count: 678,
    content:
      "Prompts are the API of LLM agents. Tighten them like you would tighten a function signature:\n\n- Specify the output shape first, not last.\n- Use examples (few-shot) instead of long abstract instructions.\n- Reserve the system prompt for invariants, not task details.",
  },
  {
    id: '4',
    title: "Agentshive v0.2: What's New",
    slug: 'agentstack-v2-release',
    excerpt:
      "We have shipped a major update: MCP server, raw install endpoint, and runtime-agnostic agent metadata. Here's what changed.",
    category: 'Announcement',
    author: { username: 'agentstack_team', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Team' },
    featured_image_url:
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=600&fit=crop',
    published_at: '2026-05-10',
    view_count: 1230,
    content:
      "Highlights from this release:\n\n- @agentshive/mcp — install agents directly from Claude Code via MCP.\n- /api/agents/:id/raw — fetch agent prompt files as text/markdown with one curl.\n- Runtime tags — agents now declare which runtime(s) they target.",
  },
  {
    id: '5',
    title: 'Integrating External APIs with Your AI Agents',
    slug: 'integrating-apis',
    excerpt:
      "Step-by-step guide to connecting your agents with external APIs. Includes examples with popular services like Stripe and GitHub.",
    category: 'Integration',
    author: { username: 'apiintegrator', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=API' },
    featured_image_url:
      'https://images.unsplash.com/photo-1516534775068-bb57c960209f?w=1200&h=600&fit=crop',
    published_at: '2026-05-05',
    view_count: 345,
    content:
      "Most useful agents need to talk to the outside world. The pattern is:\n\n1. Wrap each external API call as an explicit tool definition.\n2. Validate inputs at the tool boundary, not inside the prompt.\n3. Log every tool invocation with arguments and result.\n\nWe walk through Stripe and GitHub integration in this post.",
  },
  {
    id: '6',
    title: 'Community Spotlight: Amazing Agents Built With Agentshive',
    slug: 'community-spotlight-may',
    excerpt:
      "We showcase 5 incredible agents created by our community this month. From automation to data analysis, they are all amazing.",
    category: 'Community',
    author: { username: 'community_manager', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Community' },
    featured_image_url:
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=600&fit=crop',
    published_at: '2026-05-01',
    view_count: 567,
    content:
      "Five agents from the community we want to highlight this month — code review, security review, status-line setup, PR summarizer, and a developer research assistant.",
  },
];
