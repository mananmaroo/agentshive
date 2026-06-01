-- Clear fictional placeholder URLs on seed agents so the detail pages
-- stop showing broken external links. Run in Supabase SQL editor.

UPDATE agents
SET repository_url = NULL
WHERE repository_url LIKE 'https://github.com/agentstack/%';

UPDATE agents
SET homepage_url = NULL
WHERE homepage_url LIKE 'https://agentstack.dev/%';

-- Verify
SELECT id, title, repository_url, homepage_url
FROM agents
WHERE repository_url IS NOT NULL OR homepage_url IS NOT NULL;
