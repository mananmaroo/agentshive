# @agentshive/mcp

MCP server that lets Claude Code, Codex, or any MCP-compatible client search and install agents from [Agentshive](https://agentstack-nu.vercel.app) directly.

## Tools

- `search_agents({ query?, category?, sortBy?, limit? })` — search the registry
- `get_agent({ id })` — full details for one agent
- `install_agent({ id, destination? })` — download the agent's claude.md to `.claude/agents/<slug>.md` (or a custom path)

## Quick start

```bash
cd mcp-server
npm install
npm run build
```

## Add to Claude Code

Edit `~/.claude/mcp.json` (or the project-local `.claude/mcp.json`):

```json
{
  "mcpServers": {
    "agentshive": {
      "command": "node",
      "args": ["/absolute/path/to/agentstack/mcp-server/dist/index.js"]
    }
  }
}
```

Then in Claude Code:

> *"Search Agentshive for research agents and install the top one."*

## Configuration

- `AGENTSHIVE_API` — override the API base URL (default: `https://agentstack-nu.vercel.app`)

## Publishing (later)

```bash
npm publish --access public
```

Once published, users can install with:

```bash
npx @agentshive/mcp
```

And point Claude Code at the bin via `npx @agentshive/mcp` instead of an absolute path.
