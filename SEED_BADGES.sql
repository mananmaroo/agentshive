-- ============================================
-- Grant badges. Run AFTER MIGRATION_badges.sql.
-- Badges are admin-granted here in SQL — never through the app UI.
-- ============================================

-- Ensure official curator accounts exist (agentshive_team already seeded by
-- SEED_AGENTS.sql; add Claude & OpenAI as official template curators).
INSERT INTO users (username, email, bio, created_at) VALUES
  ('claude', 'claude@agentshive.net', 'Official Claude template collection', CURRENT_TIMESTAMP),
  ('openai', 'openai@agentshive.net', 'Official OpenAI template collection', CURRENT_TIMESTAMP),
  ('codex', 'codex@agentshive.net', 'Official Codex template collection', CURRENT_TIMESTAMP)
ON CONFLICT (email) DO NOTHING;

-- Helper pattern: add a badge without duplicating it.
--   badges = ARRAY(SELECT DISTINCT unnest(badges || '{X}'::text[]))

-- Founder → you
UPDATE users
SET badges = ARRAY(SELECT DISTINCT unnest(badges || '{founder}'::text[]))
WHERE email = 'maroomanan@gmail.com';

-- Official + Verified → agentshive_team
UPDATE users
SET badges = ARRAY(SELECT DISTINCT unnest(badges || '{team,verified}'::text[]))
WHERE username = 'agentshive_team';

-- Verified → Claude, OpenAI & Codex official template accounts
UPDATE users
SET badges = ARRAY(SELECT DISTINCT unnest(badges || '{verified}'::text[]))
WHERE username IN ('claude', 'openai', 'codex');

-- NOTE: 'sillyoctopus' and the other placeholder names were never real
-- accounts (they were username *suggestions* in the old profile UI), so there
-- is nothing to badge. If you want them as real official accounts, add them to
-- the INSERT above first, then grant here.

-- Verify the result:
-- SELECT username, email, badges FROM users WHERE badges <> '{}';
