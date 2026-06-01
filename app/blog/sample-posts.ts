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
  external_url?: string;
}

// Curated reading list of high-signal AI agent posts.
// Every external_url verified HTTP 200 at time of publish; if any 404 later,
// just remove that entry.
export const samplePosts: BlogPost[] = [
  {
    id: 'anthropic-building-effective-agents',
    title: 'Building effective agents',
    slug: 'building-effective-agents',
    excerpt:
      "Anthropic's canonical taxonomy of agent patterns — workflows vs agents, prompt chaining, routing, orchestrator-workers, evaluator-optimizer — with the guiding principle: start simple.",
    category: 'Engineering',
    author: { username: 'Anthropic — Erik Schluntz & Barry Zhang' },
    featured_image_url:
      'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&h=600&fit=crop',
    published_at: '2024-12-19',
    view_count: 0,
    external_url: 'https://www.anthropic.com/engineering/building-effective-agents',
  },
  {
    id: 'anthropic-mcp-launch',
    title: 'Introducing the Model Context Protocol',
    slug: 'mcp-launch',
    excerpt:
      "The official launch post explaining MCP as an open standard that replaces N×M custom connectors between AI assistants and data sources.",
    category: 'Announcement',
    author: { username: 'Anthropic' },
    featured_image_url:
      'https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=1200&h=600&fit=crop',
    published_at: '2024-11-25',
    view_count: 0,
    external_url: 'https://www.anthropic.com/news/model-context-protocol',
  },
  {
    id: 'anthropic-context-engineering',
    title: 'Effective context engineering for AI agents',
    slug: 'context-engineering',
    excerpt:
      "Why context engineering supersedes prompt engineering for agents. Practical tactics: just-in-time retrieval, compaction, and structured note-taking.",
    category: 'Engineering',
    author: { username: 'Anthropic Applied AI' },
    featured_image_url:
      'https://images.unsplash.com/photo-1516321318423-f06f70d504f0?w=1200&h=600&fit=crop',
    published_at: '2025-09-29',
    view_count: 0,
    external_url: 'https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents',
  },
  {
    id: 'anthropic-writing-tools',
    title: 'Writing effective tools for agents — with agents',
    slug: 'writing-tools-for-agents',
    excerpt:
      "Iterative, eval-driven approach to designing tools for agents: namespacing, token efficiency, and using Claude Code to auto-optimize tool descriptions.",
    category: 'Engineering',
    author: { username: 'Anthropic' },
    featured_image_url:
      'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=1200&h=600&fit=crop',
    published_at: '2025-09-11',
    view_count: 0,
    external_url: 'https://www.anthropic.com/engineering/writing-tools-for-agents',
  },
  {
    id: 'langchain-multi-agent-architectures',
    title: 'Choosing the right multi-agent architecture',
    slug: 'multi-agent-architectures',
    excerpt:
      "Subagents, skills, handoffs, routers — four multi-agent patterns and when to graduate from a single agent.",
    category: 'Engineering',
    author: { username: 'LangChain — Sydney Runkle' },
    featured_image_url:
      'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&h=600&fit=crop',
    published_at: '2026-01-14',
    view_count: 0,
    external_url: 'https://www.langchain.com/blog/choosing-the-right-multi-agent-architecture',
  },
  {
    id: 'langchain-benchmark',
    title: 'Benchmarking multi-agent architectures',
    slug: 'benchmarking-multi-agent',
    excerpt:
      "Empirical benchmark of single-agent vs swarm vs supervisor architectures on τ-bench. Some optimizations yield ~50% improvements.",
    category: 'Engineering',
    author: { username: 'LangChain — Will Fu-Hinthorn' },
    featured_image_url:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=600&fit=crop',
    published_at: '2025-06-10',
    view_count: 0,
    external_url: 'https://www.langchain.com/blog/benchmarking-multi-agent-architectures',
  },
  {
    id: 'hf-smolagents',
    title: 'Introducing smolagents: simple agents that write actions in code',
    slug: 'smolagents',
    excerpt:
      "Hugging Face's lightweight code-writing agent library, with a clear primer on what an agent is and when to use one.",
    category: 'Tutorial',
    author: { username: 'Hugging Face — Aymeric Roucher et al.' },
    featured_image_url:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=600&fit=crop',
    published_at: '2024-12-31',
    view_count: 0,
    external_url: 'https://huggingface.co/blog/smolagents',
  },
  {
    id: 'hamel-evals',
    title: 'LLM Evals: everything you need to know',
    slug: 'llm-evals-faq',
    excerpt:
      "A definitive FAQ on evaluating LLM and agentic systems — error analysis, human annotation, and production deployment lessons.",
    category: 'Engineering',
    author: { username: 'Hamel Husain & Shreya Shankar' },
    featured_image_url:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=600&fit=crop',
    published_at: '2026-01-15',
    view_count: 0,
    external_url: 'https://hamel.dev/blog/posts/evals-faq/',
  },
  {
    id: 'applied-llms',
    title: "What we've learned from a year of building with LLMs",
    slug: 'year-with-llms',
    excerpt:
      "Tactical, operational, and strategic lessons from six practitioners shipping LLM products in production.",
    category: 'Engineering',
    author: { username: 'Yan, Bischof, Frye, Husain, Liu, Shankar' },
    featured_image_url:
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=600&fit=crop',
    published_at: '2024-06-08',
    view_count: 0,
    external_url: 'https://applied-llms.org/',
  },
  {
    id: 'simon-six-months',
    title: 'The last six months in LLMs, illustrated by pelicans on bicycles',
    slug: 'six-months-in-llms',
    excerpt:
      "Keynote-style tour of the agent/LLM landscape from late 2024 through mid-2025, scored against the pelican-on-a-bicycle benchmark.",
    category: 'Community',
    author: { username: 'Simon Willison' },
    featured_image_url:
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&h=600&fit=crop',
    published_at: '2025-06-06',
    view_count: 0,
    external_url: 'https://simonwillison.net/2025/Jun/6/six-months-in-llms/',
  },
  {
    id: 'n8n-ai-agents-explained',
    title: 'AI agents explained: from theory to practical deployment',
    slug: 'n8n-ai-agents-explained',
    excerpt:
      "Introduction to agent types and a practical walkthrough of building a natural-language data analyst agent in n8n + LangChain.",
    category: 'Tutorial',
    author: { username: 'n8n — Yulia Dmitrievna & Eduard Parsadanyan' },
    featured_image_url:
      'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&h=600&fit=crop',
    published_at: '2025-02-10',
    view_count: 0,
    external_url: 'https://blog.n8n.io/ai-agents/',
  },
  {
    id: 'n8n-ai-tutorial',
    title: 'Build an AI workflow in n8n',
    slug: 'n8n-ai-workflow-tutorial',
    excerpt:
      "Official n8n step-by-step tutorial for assembling a working AI chat agent in their visual workflow runtime.",
    category: 'Integration',
    author: { username: 'n8n Docs' },
    featured_image_url:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=600&fit=crop',
    published_at: '2025-01-01',
    view_count: 0,
    external_url: 'https://docs.n8n.io/advanced-ai/intro-tutorial/',
  },
  {
    id: 'anthropic-prompt-engineering',
    title: 'Prompt engineering for Claude',
    slug: 'prompt-engineering-claude',
    excerpt:
      "Anthropic's canonical entry point to prompt engineering, with guidance specifically tuned for agentic workflows.",
    category: 'Tutorial',
    author: { username: 'Anthropic Docs' },
    featured_image_url:
      'https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=1200&h=600&fit=crop',
    published_at: '2025-01-01',
    view_count: 0,
    external_url: 'https://platform.claude.com/docs/en/docs/build-with-claude/prompt-engineering/overview',
  },
];
