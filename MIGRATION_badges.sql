-- ============================================
-- Badges migration
-- badges: trust/status flags GRANTED by admins (never self-serve).
-- badges_acknowledged: which badges the user has already seen the banner for
--   (so we only show the "you earned a badge" banner once per badge).
-- ============================================
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS badges TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS badges_acknowledged TEXT[] NOT NULL DEFAULT '{}';
