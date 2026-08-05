'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { samplePosts as sharedSamplePosts, BlogPost as SharedBlogPost } from './sample-posts';

type BlogPost = SharedBlogPost;

const categories = ['All', 'Tutorial', 'Engineering', 'Tips & Tricks', 'Announcement', 'Integration', 'Community'];

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>(sharedSamplePosts);
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
          if (Array.isArray(data.posts) && data.posts.length > 0) {
            setPosts(data.posts);
          } else {
            setPosts(sharedSamplePosts);
          }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col">
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Agentshive Blog</h1>
          <p className="text-xl text-slate-400">
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
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-white hover:bg-slate-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-slate-400">Loading posts...</div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-slate-400">No posts found in this category</div>
          </div>
        ) : (
          <div className="space-y-6 mb-12">
            {filteredPosts.map((post) => {
              const href = post.external_url ?? `/blog/${post.slug}`;
              const isExternal = Boolean(post.external_url);
              const linkProps = isExternal
                ? { href, target: '_blank' as const, rel: 'noopener noreferrer' }
                : { href };
              const LinkTag = isExternal ? 'a' : Link;
              return (
              <LinkTag
                key={post.id}
                {...linkProps}
                className="group block"
              >
                <div className="border border-slate-800 hover:border-slate-600 rounded-lg overflow-hidden transition-colors duration-200">
                  <div className="flex flex-col md:flex-row">
                    {/* Image */}
                    {post.featured_image_url && (
                      <div className="relative h-40 md:h-auto md:w-48 bg-slate-800 overflow-hidden flex-shrink-0">
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
                          <span className="bg-slate-700 text-white px-3 py-1 rounded-full text-xs font-semibold">
                            {post.category}
                          </span>
                        </div>

                        <h2 className="text-2xl font-bold text-white group-hover:text-slate-400 transition mb-2 line-clamp-2">
                          {post.title}
                        </h2>

                        <p className="text-slate-300 mb-4 line-clamp-2">
                          {post.excerpt}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-slate-400 text-sm">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {post.author.username}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <time dateTime={post.published_at} suppressHydrationWarning>
                              {new Date(post.published_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </time>
                          </div>
                          {post.view_count > 0 && (
                            <div className="text-xs">
                              {post.view_count.toLocaleString()} views
                            </div>
                          )}
                        </div>

                        <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-400 transition" />
                      </div>
                    </div>
                  </div>
                </div>
              </LinkTag>
              );
            })}
          </div>
        )}

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-indigo-900/50 to-indigo-800/50 border border-slate-700 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Have a Story to Share?
          </h2>
          <p className="text-slate-300 mb-6">
            Write a blog post about your agent, tips, or experiences and join our community of writers.
          </p>
          <a
            href="mailto:agentshive26@gmail.com"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition font-semibold"
          >
            Submit a Post
          </a>
        </section>
      </main>
    </div>
  );
}
