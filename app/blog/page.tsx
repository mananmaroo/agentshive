'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, User, ArrowRight } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  author: { username: string; avatar_url?: string };
  featured_image_url?: string;
  published_at: string;
  view_count: number;
}

const samplePosts: BlogPost[] = [
  {
    id: '1',
    title: 'Getting Started with Claude Agents: A Beginner\'s Guide',
    slug: 'getting-started-claude-agents',
    excerpt:
      'Learn how to build your first Claude agent from scratch. We\'ll cover the basics, best practices, and common pitfalls to avoid.',
    category: 'Tutorial',
    author: { username: 'alexchen', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' },
    featured_image_url:
      'https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=600&h=300&fit=crop',
    published_at: '2026-05-25',
    view_count: 234,
  },
  {
    id: '2',
    title: 'Building Production-Ready Agents: Lessons From 6 Months in Prod',
    slug: 'production-ready-agents',
    excerpt:
      'A deep dive into what we learned after deploying agents to production. Error handling, monitoring, and scaling considerations.',
    category: 'Engineering',
    author: { username: 'sarahdev', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
    featured_image_url:
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=300&fit=crop',
    published_at: '2026-05-20',
    view_count: 456,
  },
  {
    id: '3',
    title: 'Prompt Engineering Tips for Better Agent Performance',
    slug: 'prompt-engineering-tips',
    excerpt:
      'Master the art of writing effective prompts. These techniques have helped our community build agents with 90%+ accuracy.',
    category: 'Tips & Tricks',
    author: { username: 'promptmaster', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Master' },
    featured_image_url:
      'https://images.unsplash.com/photo-1516321318423-f06f70d504f0?w=600&h=300&fit=crop',
    published_at: '2026-05-15',
    view_count: 678,
  },
  {
    id: '4',
    title: 'AgentStack v2.0 Released: What\'s New',
    slug: 'agentstack-v2-release',
    excerpt:
      'We\'ve completely redesigned AgentStack. Check out the new features, improved performance, and what\'s coming next.',
    category: 'Announcement',
    author: { username: 'agentstack_team', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Team' },
    featured_image_url:
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=300&fit=crop',
    published_at: '2026-05-10',
    view_count: 1230,
  },
  {
    id: '5',
    title: 'Integrating External APIs with Your Claude Agents',
    slug: 'integrating-apis',
    excerpt:
      'Step-by-step guide to connecting your agents with external APIs. Includes examples with popular services like Stripe and GitHub.',
    category: 'Integration',
    author: { username: 'apiintegrator', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=API' },
    featured_image_url:
      'https://images.unsplash.com/photo-1516534775068-bb57c960209f?w=600&h=300&fit=crop',
    published_at: '2026-05-05',
    view_count: 345,
  },
  {
    id: '6',
    title: 'Community Spotlight: Amazing Agents Built With AgentStack',
    slug: 'community-spotlight-may',
    excerpt:
      'We showcase 5 incredible agents created by our community this month. From automation to data analysis, they\'re all amazing.',
    category: 'Community',
    author: { username: 'community_manager', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Community' },
    featured_image_url:
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=300&fit=crop',
    published_at: '2026-05-01',
    view_count: 567,
  },
];

const categories = ['All', 'Tutorial', 'Engineering', 'Tips & Tricks', 'Announcement', 'Integration', 'Community'];

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>(samplePosts);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const query = selectedCategory === 'All' ? '' : `?category=${selectedCategory}`;
        const response = await fetch(`/api/blog/posts${query}`);
        if (response.ok) {
          const data = await response.json();
          setPosts(data);
        }
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [selectedCategory]);

  const filteredPosts =
    selectedCategory === 'All'
      ? posts
      : posts.filter((p) => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 flex flex-col">
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-amber-900 mb-4">Agentshive Blog</h1>
          <p className="text-xl text-amber-700">
            Tips, tutorials, and stories from the AI agent community
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex items-center justify-center gap-3 mb-12 flex-wrap">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg transition font-medium ${
                selectedCategory === category
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-amber-700">Loading posts...</div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-amber-700">No posts found in this category</div>
          </div>
        ) : (
          <div className="space-y-6 mb-12">
            {filteredPosts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group"
              >
                <div className="bg-white border border-amber-300 rounded-lg overflow-hidden hover:border-amber-500 hover:bg-amber-50 transition">
                  <div className="flex flex-col md:flex-row">
                    {/* Image */}
                    {post.featured_image_url && (
                      <div className="relative h-40 md:h-auto md:w-48 bg-amber-100 overflow-hidden flex-shrink-0">
                        <img
                          src={post.featured_image_url}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="bg-amber-200 text-amber-900 px-3 py-1 rounded-full text-xs font-semibold">
                            {post.category}
                          </span>
                        </div>

                        <h2 className="text-2xl font-bold text-amber-900 group-hover:text-amber-700 transition mb-2 line-clamp-2">
                          {post.title}
                        </h2>

                        <p className="text-amber-800 mb-4 line-clamp-2">
                          {post.excerpt}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-amber-700 text-sm">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {post.author.username}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(post.published_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </div>
                          <div className="text-xs">
                            {post.view_count.toLocaleString()} views
                          </div>
                        </div>

                        <ArrowRight className="w-5 h-5 text-amber-700 group-hover:text-amber-600 transition" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-300 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-amber-900 mb-4">
            Have a Story to Share?
          </h2>
          <p className="text-amber-800 mb-6">
            Write a blog post about your agent, tips, or experiences and join our community of writers.
          </p>
          <a
            href="mailto:blog@agentshive.net"
            className="inline-block bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg transition font-semibold"
          >
            Submit a Post
          </a>
        </section>
      </main>
    </div>
  );
}
