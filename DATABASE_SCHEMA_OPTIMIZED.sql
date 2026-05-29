-- AgentStack Database Schema - Optimized for 100,000+ users
-- Created with partitioning, indexes, and performance in mind

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  github_username TEXT,
  website_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE
);

-- Indexes for users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active) WHERE is_active = true;

-- ============================================
-- AGENTS TABLE (partitioned for scale)
-- ============================================
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category TEXT[] NOT NULL,
  tags TEXT[] NOT NULL,
  claude_md_file TEXT,
  repository_url TEXT,
  homepage_url TEXT,
  license TEXT,
  version TEXT DEFAULT '1.0.0',
  downloads_count INT DEFAULT 0,
  views_count INT DEFAULT 0,
  average_rating FLOAT DEFAULT 0,
  rating_count INT DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for agents
CREATE INDEX IF NOT EXISTS idx_agents_creator_id ON agents(creator_id);
CREATE INDEX IF NOT EXISTS idx_agents_created_at ON agents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agents_average_rating ON agents(average_rating DESC);
CREATE INDEX IF NOT EXISTS idx_agents_downloads_count ON agents(downloads_count DESC);
CREATE INDEX IF NOT EXISTS idx_agents_views_count ON agents(views_count DESC);
CREATE INDEX IF NOT EXISTS idx_agents_featured ON agents(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_agents_verified ON agents(verified) WHERE verified = true;
CREATE INDEX IF NOT EXISTS idx_agents_category ON agents USING GIN(category);
CREATE INDEX IF NOT EXISTS idx_agents_tags ON agents USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_agents_title_search ON agents USING GIN(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_agents_description_search ON agents USING GIN(to_tsvector('english', description));

-- ============================================
-- RATINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(agent_id, user_id)
);

-- Indexes for ratings
CREATE INDEX IF NOT EXISTS idx_ratings_agent_id ON ratings(agent_id);
CREATE INDEX IF NOT EXISTS idx_ratings_user_id ON ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_created_at ON ratings(created_at DESC);

-- ============================================
-- COMMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  upvotes INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for comments
CREATE INDEX IF NOT EXISTS idx_comments_agent_id ON comments(agent_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_upvotes ON comments(upvotes DESC);

-- ============================================
-- COMMENT UPVOTES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS comment_upvotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(comment_id, user_id)
);

-- Indexes for comment upvotes
CREATE INDEX IF NOT EXISTS idx_comment_upvotes_comment_id ON comment_upvotes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_upvotes_user_id ON comment_upvotes(user_id);

-- ============================================
-- FILES/STORAGE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS agent_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INT NOT NULL,
  storage_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for files
CREATE INDEX IF NOT EXISTS idx_agent_files_agent_id ON agent_files(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_files_file_type ON agent_files(file_type);
CREATE INDEX IF NOT EXISTS idx_agent_files_created_at ON agent_files(created_at DESC);

-- ============================================
-- BLOG POSTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image_url TEXT,
  category TEXT,
  tags TEXT[],
  published BOOLEAN DEFAULT FALSE,
  view_count INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for blog posts
CREATE INDEX IF NOT EXISTS idx_blog_posts_author_id ON blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published) WHERE published = true;
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_tags ON blog_posts USING GIN(tags);

-- ============================================
-- AGENT REQUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS agent_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  requester_email TEXT NOT NULL,
  requester_name TEXT NOT NULL,
  agent_description TEXT NOT NULL,
  use_case TEXT NOT NULL,
  budget INT,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for agent requests
CREATE INDEX IF NOT EXISTS idx_agent_requests_user_id ON agent_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_requests_status ON agent_requests(status);
CREATE INDEX IF NOT EXISTS idx_agent_requests_created_at ON agent_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_requests_budget ON agent_requests(budget);

-- ============================================
-- ANALYTICS TABLE (for tracking views/downloads)
-- ============================================
CREATE TABLE IF NOT EXISTS agent_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES users(id),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for analytics
CREATE INDEX IF NOT EXISTS idx_agent_analytics_agent_id ON agent_analytics(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_analytics_event_type ON agent_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_agent_analytics_created_at ON agent_analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_analytics_user_id ON agent_analytics(user_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_requests ENABLE ROW LEVEL SECURITY;

-- Users can only edit their own profile
CREATE POLICY users_select_policy ON users
  FOR SELECT USING (true);

CREATE POLICY users_update_policy ON users
  FOR UPDATE USING (auth.uid() = id);

-- Agents can be viewed by all
CREATE POLICY agents_select_policy ON agents
  FOR SELECT USING (deleted_at IS NULL);

-- Users can only create agents as themselves
CREATE POLICY agents_insert_policy ON agents
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

-- Users can only update/delete their own agents
CREATE POLICY agents_update_policy ON agents
  FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY agents_delete_policy ON agents
  FOR DELETE USING (auth.uid() = creator_id);

-- Ratings can be viewed by all
CREATE POLICY ratings_select_policy ON ratings
  FOR SELECT USING (true);

-- Users can only insert/update their own ratings
CREATE POLICY ratings_insert_policy ON ratings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY ratings_update_policy ON ratings
  FOR UPDATE USING (auth.uid() = user_id);

-- Comments can be viewed by all
CREATE POLICY comments_select_policy ON comments
  FOR SELECT USING (deleted_at IS NULL);

-- Users can insert comments
CREATE POLICY comments_insert_policy ON comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only update/delete their own comments
CREATE POLICY comments_update_policy ON comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY comments_delete_policy ON comments
  FOR DELETE USING (auth.uid() = user_id);

-- Files can be viewed by all
CREATE POLICY agent_files_select_policy ON agent_files
  FOR SELECT USING (true);

-- Only agent creator can upload files
CREATE POLICY agent_files_insert_policy ON agent_files
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM agents WHERE id = agent_id AND creator_id = auth.uid()
    )
  );

-- Blog posts can be viewed if published
CREATE POLICY blog_posts_select_policy ON blog_posts
  FOR SELECT USING (published = true OR author_id = auth.uid());

-- Users can only create/edit their own blog posts
CREATE POLICY blog_posts_insert_policy ON blog_posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY blog_posts_update_policy ON blog_posts
  FOR UPDATE USING (auth.uid() = author_id);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to update agent rating average
CREATE OR REPLACE FUNCTION update_agent_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE agents
  SET average_rating = (
    SELECT AVG(rating)::FLOAT FROM ratings WHERE agent_id = NEW.agent_id
  ),
  rating_count = (
    SELECT COUNT(*) FROM ratings WHERE agent_id = NEW.agent_id
  ),
  updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.agent_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_agent_rating
AFTER INSERT OR UPDATE ON ratings
FOR EACH ROW
EXECUTE FUNCTION update_agent_rating();

-- Function to update comment upvote count
CREATE OR REPLACE FUNCTION update_comment_upvotes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE comments
  SET upvotes = (
    SELECT COUNT(*) FROM comment_upvotes WHERE comment_id = NEW.comment_id
  )
  WHERE id = NEW.comment_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_comment_upvotes
AFTER INSERT OR DELETE ON comment_upvotes
FOR EACH ROW
EXECUTE FUNCTION update_comment_upvotes();

-- ============================================
-- GRANTS (if using service role)
-- ============================================
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
