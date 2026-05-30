-- Create system user for seed agents
INSERT INTO users (username, email, bio, created_at)
VALUES (
  'agentshive_team',
  'team@agentshive.net',
  'Official Agentshive seed agents',
  CURRENT_TIMESTAMP
)
ON CONFLICT (email) DO NOTHING;

-- Agent 1: Customer Feedback Agent
INSERT INTO agents (
  title,
  description,
  creator_id,
  category,
  tags,
  downloads_count,
  views_count,
  average_rating,
  rating_count,
  verified,
  featured,
  created_at,
  updated_at
) VALUES (
  'Customer Feedback Distributor',
  'Intelligent customer service email agent that automatically categorizes incoming customer emails, distributes them to relevant teams via Slack, and manages the response workflow. Uses Claude AI to understand context and route feedback to the right teams.',
  (SELECT id FROM users WHERE username = 'agentshive_team' LIMIT 1),
  ARRAY['Automation', 'Customer Support'],
  ARRAY['slack', 'mcp', 'customer-service', 'email', 'automation'],
  0,
  0,
  5,
  1,
  true,
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Agent 2: Job Application Agent
INSERT INTO agents (
  title,
  description,
  creator_id,
  category,
  tags,
  downloads_count,
  views_count,
  average_rating,
  rating_count,
  verified,
  featured,
  created_at,
  updated_at
) VALUES (
  'AI Job Application Automation',
  'Comprehensive job application automation agent for AI/ML and Data Science roles. Searches multiple job boards (LinkedIn, Indeed, Greenhouse, etc.), evaluates positions against your criteria, tailors resumes and cover letters, and logs everything to a tracking spreadsheet. Perfect for batch job hunting.',
  (SELECT id FROM users WHERE username = 'agentshive_team' LIMIT 1),
  ARRAY['Data Analysis', 'Automation', 'Research'],
  ARRAY['job-search', 'automation', 'resume', 'cover-letter', 'ai-jobs', 'linkedin'],
  0,
  0,
  5,
  1,
  true,
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- Add Claude.md files for agents (references to markdown files)
-- Note: File URLs should point to GitHub raw content or Supabase storage
INSERT INTO agent_files (agent_id, file_url, file_type, file_name, created_at, updated_at)
SELECT
  (SELECT id FROM agents WHERE title = 'Customer Feedback Distributor' LIMIT 1),
  'https://raw.githubusercontent.com/mananmaroo/agentshive/main/AGENTS_CLAUDE_MD/customer-feedback-agent.md',
  'claude_md',
  'customer-feedback-agent.md',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
WHERE EXISTS (SELECT 1 FROM agents WHERE title = 'Customer Feedback Distributor' LIMIT 1);

INSERT INTO agent_files (agent_id, file_url, file_type, file_name, created_at, updated_at)
SELECT
  (SELECT id FROM agents WHERE title = 'AI Job Application Automation' LIMIT 1),
  'https://raw.githubusercontent.com/mananmaroo/agentshive/main/AGENTS_CLAUDE_MD/job-application-agent.md',
  'claude_md',
  'job-application-agent.md',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
WHERE EXISTS (SELECT 1 FROM agents WHERE title = 'AI Job Application Automation' LIMIT 1);
