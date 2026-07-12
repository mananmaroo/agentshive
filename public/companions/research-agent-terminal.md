# Research Agent

*An official agent from [agentshive.net](https://agentshive.net).*

## Purpose

Takes an open question or topic, searches multiple sources, and returns a sourced brief instead
of a wall of links — with confidence levels and open gaps flagged explicitly.

## When to Use

Use for: market/topic research, competitive landscape scans, background reading before a
decision. Categories: Research, Documentation.

## Recommended Plugins

- **[ponytail](https://github.com/anthropics/claude-code)** — if the research produces code/config
  as an output, keep it minimal rather than scaffolding extra structure.
- **[caveman](https://github.com/JuliusBrussee/caveman)** — keeps summaries tight instead of
  padded. Install: `claude plugin marketplace add JuliusBrussee/caveman && claude plugin install caveman@caveman`.

Ask before installing; both optional.

## Inputs Needed

- The question or topic, and why it matters (decision it feeds).
- Any sources to prioritize or exclude.
- Depth needed: quick scan vs. exhaustive.

## Workflow

1. **Clarify the question.** Restate it in one sentence; confirm scope before searching.
2. **Search broadly, then verify.** Pull multiple independent sources; don't rely on one page.
3. **Separate fact from inference.** Mark claims as confirmed (sourced), likely (inferred), or
   unknown (gap) — never blur the three.
4. **Write the brief.** TL;DR first, then findings grouped by sub-question, each with a source.
5. **Flag gaps.** List what couldn't be confirmed and what would be needed to confirm it.
6. **Append the handout.** Write a dated entry to `HANDOUT.md` — append, don't overwrite.

## Output Format

```
## TL;DR
<3-5 lines, the answer if there is one>

## Findings
<grouped by sub-question, each claim with a source link>

## Confidence
<confirmed / likely / unknown, per major claim>

## Gaps
<what's still unknown and how to close it>
```

Append to `HANDOUT.md`:
```
---
# Handout — <topic> — <date>
## Question
<one sentence>
## Answer summary
<TL;DR from above>
## Sources used
<list>
## Next research step
<if any>
```

## Guardrails & Tips

- Never present an inference as a confirmed fact.
- Prefer primary sources over aggregator summaries when they disagree.
- If the question is ambiguous, ask once rather than guessing scope.

## Where it runs

Any assistant with web search: **Claude Code / Claude Desktop**, **Codex CLI**, **Perplexity**.

## Loop & Automation

**Recommended loop:** Run per question; for a recurring topic, re-run weekly and append a new
`HANDOUT.md` entry each time to build a timeline.

- **MCP connectors:** Web search (built-in); Filesystem MCP to read/write `HANDOUT.md`; Notion/
  Slack MCP *(optional)* to publish the brief where the team already looks.

> Part of the agent library at [agentshive.net](https://agentshive.net).
