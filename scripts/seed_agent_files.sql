-- Seed every existing agent with a real claude.md content row in agent_files
-- so /api/agents/:id/raw stops 404ing and the install/MCP flow works.
-- Idempotent: skips agents that already have a claude_md row.
-- Run in Supabase SQL editor.

INSERT INTO agent_files (agent_id, file_url, file_type, file_name, file_content)
SELECT
  a.id,
  'agent-' || a.id || '-claude.md',
  'claude_md',
  'claude.md',
  '# ' || a.title || E'\n\n' ||
  '## Purpose' || E'\n\n' ||
  a.description || E'\n\n' ||
  '## Categories' || E'\n\n' ||
  array_to_string(a.category, ', ') || E'\n\n' ||
  '## Tags' || E'\n\n' ||
  array_to_string(a.tags, ', ') || E'\n\n' ||
  '## Instructions' || E'\n\n' ||
  '1. Read the user''s request carefully.' || E'\n' ||
  '2. Identify the inputs you need (documents, data, URLs, parameters).' || E'\n' ||
  '3. Ask one clarifying question if the request is ambiguous; otherwise proceed.' || E'\n' ||
  '4. Plan your steps before acting; outline tool calls you intend to make.' || E'\n' ||
  '5. Execute the plan, surfacing intermediate results to the user.' || E'\n' ||
  '6. Validate outputs against the original request before concluding.' || E'\n\n' ||
  '## Capabilities' || E'\n\n' ||
  '- Domain-specific reasoning relevant to the categories above.' || E'\n' ||
  '- Structured output (JSON or markdown) on request.' || E'\n' ||
  '- Multi-step tool use where supported by the runtime.' || E'\n\n' ||
  '## Output Format' || E'\n\n' ||
  'Default: concise markdown with headings. Use JSON only when the user' || E'\n' ||
  'asks for it or when downstream tooling requires it.' || E'\n\n' ||
  '## Failure Modes To Avoid' || E'\n\n' ||
  '- Don''t invent data the user didn''t provide.' || E'\n' ||
  '- Don''t skip the validation step at the end.' || E'\n' ||
  '- Don''t answer outside the scope of this agent''s purpose.' || E'\n\n' ||
  '---' || E'\n' ||
  'Imported from Agentshive — https://www.agentshive.net/agents/' || a.id || E'\n'
FROM agents a
WHERE NOT EXISTS (
  SELECT 1 FROM agent_files f
  WHERE f.agent_id = a.id AND f.file_type = 'claude_md'
);

-- Also: clean up the fictional placeholder URLs on seed agents
UPDATE agents
SET repository_url = NULL
WHERE repository_url LIKE 'https://github.com/agentstack/%';

UPDATE agents
SET homepage_url = NULL
WHERE homepage_url LIKE 'https://agentstack.dev/%';

-- Verify: every agent should now have exactly one claude_md row
SELECT a.id, a.title, COUNT(f.id) AS claude_md_rows, a.repository_url, a.homepage_url
FROM agents a
LEFT JOIN agent_files f
  ON f.agent_id = a.id AND f.file_type = 'claude_md'
GROUP BY a.id, a.title, a.repository_url, a.homepage_url
ORDER BY a.title;
