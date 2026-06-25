# Multi-platform rewrite spec (internal — do not ship)

Goal: make every agent/companion read as runnable on **all major AI assistants** (Claude, OpenAI,
Perplexity) instead of Claude-only, and add agentshive.net as the author. Two file types, two recipes.

Platform model (use these exact mappings, no others):
- **Claude** → Claude Desktop (MCP via Settings → Connectors) **or** Claude Code (terminal).
- **OpenAI** → ChatGPT Desktop (MCP connectors) **or** Codex CLI (terminal).
- **Perplexity** → Perplexity desktop or web app (MCP via Connectors). **No terminal/CLI for Perplexity.**

General rules:
- Do NOT change Purpose, Workflow, Inputs, Output Format, Guardrails, or Professional References sections.
- Preserve each file's own MCP/tool specifics (Playwright, Gmail, Notion, filesystem, computer-use, etc.).
  Only generalize the *platform framing*, never drop a real tool requirement.
- Keep edits tight; match the file's existing tone.

================================================================================
## RECIPE A — Team agents  (files in AGENTS_CLAUDE_MD/team/*.md)
================================================================================

These are advisory, text-in/text-out agents. Each currently has TWO trailing sections:
  `## Running in Claude Code (MCP preflight)`  and  `## Running in Claude Terminal (browser & computer use)`

1) Add an author line immediately AFTER the H1 `# Title` line (blank line, then):
   `*An official agent from [agentshive.net](https://agentshive.net).*`

2) DELETE both `## Running in Claude Code ...` and `## Running in Claude Terminal ...` sections
   (everything from the first of those headers to end of file) and REPLACE with a single section:

```
## Where it runs

This agent is text-in, text-out, so it runs in any major AI assistant — pick desktop or terminal:

- **Claude** — Claude Desktop (add MCP servers under Settings → Connectors) or **Claude Code** in the terminal.
- **OpenAI** — ChatGPT Desktop (enable MCP connectors) or the **Codex CLI** in the terminal.
- **Perplexity** — the Perplexity desktop or web app (add MCP servers via Connectors).

<MCP_NOTE>

> Part of the agent library at [agentshive.net](https://agentshive.net).
```

   Replace `<MCP_NOTE>` based on what the OLD two sections said this specific agent needs:
   - If the agent needed NO MCP server (pure reasoning): 
     "This one is pure reasoning over the inputs you provide — no MCP server required. Filesystem read
     and web fetch are built into Claude Code and Codex; in a desktop or web app it works from pasted
     or attached content."
   - If it needed specific server(s) (e.g. Playwright, a warehouse connector): keep that requirement,
     framed tool-agnostically, e.g.:
     "To <do X> it needs the **<server>** MCP server — add it via Connectors in a desktop/web app, or
     `claude mcp add ...` in Claude Code / Codex. Filesystem and web fetch are otherwise built in."

================================================================================
## RECIPE B — Companions  (files in AGENTS_CLAUDE_MD/companions/*.md)
================================================================================

These are hands-on and DO real work via MCP → desktop/web only. Each has a `## Runtime & Requirements`
section that currently starts "Runs in Claude Code" and lists MCP servers / `claude mcp add` commands.

1) Add an author line immediately AFTER the H1 `# Title` line (blank line, then):
   `*An official companion from [agentshive.net](https://agentshive.net).*`

2) REPLACE the body of `## Runtime & Requirements` with this, preserving the file's OWN server list:

```
## Runtime & Requirements

This companion does real work through MCP tools, so run it in an **MCP-capable desktop or web app** — not a plain chat box:

- **Claude Desktop** — add servers under Settings → Connectors.
- **ChatGPT Desktop** — enable MCP connectors.
- **Perplexity** (desktop or web) — add servers via Connectors.

(In **Claude Code** you can also add servers from the terminal with `claude mcp add ...`.)

Connect these MCP servers before starting:
<SERVER_LIST — carry over the exact servers this file already listed, one per bullet, keeping any npx/config string as the "config" reference>

If a needed server isn't connected, tell the user exactly which one to add and wait.
<IF the original mentioned driving a native desktop app / computer-use, keep that line; else omit.>
```

3) Leave the file's existing closing line
   `> This is the hands-on companion to the **X** agent on agentshive.net.` as-is (that is the bottom author).
   If a file lacks it, add it.

Do not touch any other section.
