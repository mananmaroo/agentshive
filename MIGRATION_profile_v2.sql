-- ============================================
-- Profile v2 migration
-- Adds self-reported onboarding fields + avatar storage bucket.
--
-- NOTE ON TIERS: experience_level is a SELF-REPORTED hint used for
-- personalization only. It is intentionally NOT a trust/reputation tier.
-- A real tier should later be DERIVED from activity (agents published,
-- downloads received, linked GitHub) — keep that logic separate so this
-- self-reported value can be superseded without a schema change.
-- ============================================

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS experience_level TEXT
    CHECK (experience_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  ADD COLUMN IF NOT EXISTS primary_interest TEXT
    CHECK (primary_interest IN ('building', 'browsing', 'learning', 'sharing')),
  ADD COLUMN IF NOT EXISTS onboarded_at TIMESTAMP WITH TIME ZONE;

-- ============================================
-- Avatars storage bucket (public read, owner-scoped writes)
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to read avatars (public bucket)
DROP POLICY IF EXISTS "Avatar public read" ON storage.objects;
CREATE POLICY "Avatar public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Writes happen server-side via the service role (see /api/avatar), which
-- bypasses RLS. No client-side write policy is granted on purpose.
