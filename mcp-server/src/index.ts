#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';

const API_BASE =
  process.env.AGENTSHIVE_API ?? 'https://agentstack-nu.vercel.app';

interface AgentSummary {
  id: string;
  title: string;
  description: string;
  category: string[];
  tags: string[];
  average_rating: number;
  rating_count: number;
  downloads_count: number;
  views_count: number;
  verified: boolean;
}

async function searchAgents(args: {
  query?: string;
  category?: string;
  sortBy?: 'trending' | 'newest' | 'rating' | 'downloads';
  limit?: number;
}): Promise<AgentSummary[]> {
  const params = new URLSearchParams();
  if (args.query) params.set('search', args.query);
  if (args.category) params.set('category', args.category);
  if (args.sortBy) params.set('sortBy', args.sortBy);
  if (args.limit) params.set('limit', String(args.limit));

  const res = await fetch(`${API_BASE}/api/agents?${params.toString()}`);
  if (!res.ok) throw new Error(`Search failed: ${res.status} ${res.statusText}`);
  const body = await res.json();
  return body.agents ?? body.data ?? body;
}

async function getAgent(id: string) {
  const res = await fetch(`${API_BASE}/api/agents/${id}`);
  if (!res.ok) throw new Error(`Agent not found: ${id}`);
  const body = await res.json();
  return body.data ?? body;
}

async function fetchRawAgent(id: string): Promise<string> {
  const res = await fetch(`${API_BASE}/api/agents/${id}/raw`);
  if (!res.ok) {
    throw new Error(
      `Could not fetch claude.md for agent ${id}: ${res.status} ${res.statusText}`
    );
  }
  return res.text();
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'agent';
}

const server = new Server(
  { name: 'agentshive', version: '0.1.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'search_agents',
      description:
        'Search the Agentshive registry for AI agents. Returns a list of matching agents with id, title, description, category, and stats.',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Free-text search across title, description, and tags' },
          category: { type: 'string', description: 'Filter by category, e.g. "Code Generation"' },
          sortBy: {
            type: 'string',
            enum: ['trending', 'newest', 'rating', 'downloads'],
            description: 'Sort order (default: trending)',
          },
          limit: { type: 'number', description: 'Max results to return (default: 10)' },
        },
      },
    },
    {
      name: 'get_agent',
      description: 'Get full details for a single Agentshive agent by its ID.',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Agent UUID' },
        },
        required: ['id'],
      },
    },
    {
      name: 'install_agent',
      description:
        'Download an agent\'s claude.md from Agentshive and write it to the local filesystem. Default destination is .claude/agents/<slug>.md in the current working directory.',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'Agent UUID' },
          destination: {
            type: 'string',
            description:
              'Optional absolute or relative path to write to. Defaults to .claude/agents/<title-slug>.md',
          },
        },
        required: ['id'],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args } = req.params;

  try {
    if (name === 'search_agents') {
      const agents = await searchAgents((args ?? {}) as any);
      const limited = agents.slice(0, ((args as any)?.limit as number) ?? 10);
      const summary = limited.map((a) => ({
        id: a.id,
        title: a.title,
        description: a.description,
        category: a.category,
        rating: `${a.average_rating?.toFixed?.(1) ?? '0.0'} (${a.rating_count ?? 0})`,
        downloads: a.downloads_count ?? 0,
        url: `${API_BASE}/agents/${a.id}`,
      }));
      return {
        content: [
          {
            type: 'text',
            text:
              summary.length === 0
                ? 'No agents found.'
                : `Found ${summary.length} agent(s):\n\n${JSON.stringify(summary, null, 2)}`,
          },
        ],
      };
    }

    if (name === 'get_agent') {
      const id = (args as any)?.id as string;
      if (!id) throw new Error('id is required');
      const agent = await getAgent(id);
      return {
        content: [{ type: 'text', text: JSON.stringify(agent, null, 2) }],
      };
    }

    if (name === 'install_agent') {
      const id = (args as any)?.id as string;
      if (!id) throw new Error('id is required');

      const [agent, content] = await Promise.all([
        getAgent(id),
        fetchRawAgent(id),
      ]);

      const defaultPath = join(
        process.cwd(),
        '.claude',
        'agents',
        `${slugify(agent.title)}.md`
      );
      const destInput = (args as any)?.destination as string | undefined;
      const dest = destInput ? resolve(destInput) : defaultPath;

      await mkdir(dirname(dest), { recursive: true });
      await writeFile(dest, content, 'utf8');

      return {
        content: [
          {
            type: 'text',
            text: `Installed "${agent.title}" → ${dest}\n\n${content.length} bytes written.`,
          },
        ],
      };
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (err: any) {
    return {
      isError: true,
      content: [{ type: 'text', text: `Error: ${err.message ?? String(err)}` }],
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('agentshive-mcp running on stdio');
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
