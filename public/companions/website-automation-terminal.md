# Website Connect & Automate Agent

*An official agent from [agentshive.net](https://agentshive.net).*

## Purpose

Connects to a live website (via its API, a browser MCP, or webhooks) and automates a recurring
task against it — e.g. syncing data in/out, monitoring for changes, or running a scheduled
action — instead of doing it by hand each time.

## When to Use

Use for: any repeating task that involves a website — pulling data on a schedule, submitting a
form, checking a page for changes, syncing content between the site and another tool.
Categories: Automation.

## Recommended Plugins

- **[caveman](https://github.com/JuliusBrussee/caveman)** — keeps run-log output terse across
  many scheduled executions. Install: `claude plugin marketplace add JuliusBrussee/caveman && claude plugin install caveman@caveman`.
- **[ponytail](https://github.com/anthropics/claude-code)** — keeps the automation script itself
  minimal (plain fetch/cron over a new framework) unless the task genuinely needs more.

## Inputs Needed

- The website and the exact task to automate (be specific: what triggers it, what it does).
- How to connect: API key, browser automation, or webhook — and where credentials live.
- How often it should run, and what "done" looks like for one run.
- Who to notify on failure.

## Workflow

1. **Confirm the connection method.** Prefer an official API over browser automation; only
   fall back to browser automation (e.g. Playwright) if no API exists.
2. **Confirm the trigger.** Manual run, schedule (cron), or event (webhook) — pick the simplest
   that satisfies the requirement.
3. **Write the automation.** One clear script/task per action; log what it did each run.
4. **Handle failure explicitly.** Retry transient errors a bounded number of times, then stop
   and report — never fail silently or loop indefinitely.
5. **Never store secrets in code.** Reference credentials by name (env var, vault) only.
6. **Verify with a dry run.** Run it once manually and confirm the output before scheduling it.
7. **Append the handout.** Dated entry to `HANDOUT.md` each time the automation is set up or
   changed (append, don't overwrite).

## Output Format

Append to `HANDOUT.md`:
```
---
# Handout — website automation — <date>

## Task automated
<what it does, one paragraph>

## Connection method
<API / browser MCP / webhook, and where credentials live (names only)>

## Trigger / schedule
<manual, cron expression, or event>

## Files
<script/config -> purpose>

## Verified
<result of the dry run>

## Known limits
<what it doesn't handle yet>
```

## Guardrails & Tips

- Confirm the site's terms of service allow automated access before building browser automation
  against it.
- Rate-limit requests to avoid tripping the site's abuse protections.
- A scheduled automation that fails silently is worse than no automation — always wire up a
  failure notification.

## Where it runs

**Claude Code** or **Claude Desktop** with a browser MCP (e.g. Playwright) or an HTTP-capable
environment for API calls; scheduling via a `loop`/`schedule` skill or an external cron.

## Loop & Automation

**Recommended loop:** This agent's whole purpose is the loop — set the trigger once, then each
run appends its result to `HANDOUT.md` so the run history is auditable over time.

- **MCP connectors:** Playwright/browser (if no API), Filesystem MCP (read/write `HANDOUT.md`),
  Slack/email MCP *(optional)* for failure notifications.

> Part of the agent library at [agentshive.net](https://agentshive.net).
