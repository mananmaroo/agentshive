-- First, create a system user for seed agents
-- Copy the UUID generated for user_id and use it below

INSERT INTO users (username, email, bio, created_at, updated_at)
VALUES (
  'agentshive_team',
  'team@agentshive.net',
  'Official Agentshive seed agents',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT DO NOTHING;

-- Get the user ID (you can also manually replace this with the UUID from above)
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
