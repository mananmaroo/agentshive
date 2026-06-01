-- /api/agents/:id/raw queries agent_files via the anon Supabase client.
-- If RLS is on without a SELECT policy for `anon`, the query returns 0 rows
-- even when the data is there — which is what we're seeing in prod.
--
-- This script:
--   1. Confirms data is actually in agent_files (sanity check, paste output back)
--   2. Adds a public SELECT policy so anon can read agent file content
--   3. Re-verifies the seed migration didn't get rolled back
-- Run in Supabase SQL editor.

-- 1. Sanity check: how many claude_md rows exist?
SELECT COUNT(*) AS claude_md_rows FROM agent_files WHERE file_type = 'claude_md';

-- 2. Allow public read on agent_files (the content is public anyway —
-- it's served unauthenticated from /api/agents/:id/raw).
ALTER TABLE agent_files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read agent files" ON agent_files;

CREATE POLICY "Public can read agent files"
  ON agent_files
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- 3. Verify each agent has exactly one claude.md row visible to anon
SELECT a.id, a.title, COUNT(f.id) AS claude_md_visible
FROM agents a
LEFT JOIN agent_files f
  ON f.agent_id = a.id AND f.file_type = 'claude_md'
GROUP BY a.id, a.title
ORDER BY a.title;
