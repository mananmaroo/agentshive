export type Agent = {
  id: string;
  title: string;
  description: string;
  creator_id: string;
  category: string[];
  tags: string[];
  claude_md_file: string;
  repository_url?: string;
  homepage_url?: string;
  license: string;
  version: string;
  downloads_count: number;
  views_count: number;
  average_rating: number;
  rating_count: number;
  verified: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
  creator?: User;
};

export type User = {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  github_username?: string;
  created_at: string;
};

export type Comment = {
  id: string;
  agent_id: string;
  user_id: string;
  content: string;
  upvotes: number;
  created_at: string;
  user?: User;
};

export type Rating = {
  id: string;
  agent_id: string;
  user_id: string;
  rating: number;
  created_at: string;
};
