-- ============================================
-- Social links migration
-- users already has github_username + website_url; add linkedin_url.
-- ============================================
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
