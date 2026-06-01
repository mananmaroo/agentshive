'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';

interface Video {
  id: string;
  title: string;
  channel: string;
  category: string;
  duration: string;
  thumbnail: string;
  url: string;
  description: string;
}

const videos: Video[] = [
  {
    id: '1',
    title: 'Getting Started with AI Agents',
    channel: 'Anthropic',
    category: 'Beginner',
    duration: '12:34',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=400&h=225&fit=crop',
    url: 'https://www.youtube.com/results?search_query=getting+started+with+ai+agents+anthropic',
    description: 'Learn the fundamentals of building AI agents from scratch — works with any runtime',
  },
  {
    id: '2',
    title: 'Building Production-Ready Agents',
    channel: 'AI Dev Academy',
    category: 'Advanced',
    duration: '28:15',
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=225&fit=crop',
    url: 'https://www.youtube.com/results?search_query=building+production+ai+agents',
    description: 'Deep dive into production patterns and best practices',
  },
  {
    id: '3',
    title: 'Prompt Engineering for Agents',
    channel: 'Prompt Engineering Tips',
    category: 'Tips',
    duration: '15:42',
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f70d504f0?w=400&h=225&fit=crop',
    url: 'https://www.youtube.com/results?search_query=prompt+engineering+for+ai+agents',
    description: 'Master effective prompt writing for better agent performance',
  },
  {
    id: '4',
    title: 'Integrating with APIs in Agents',
    channel: 'Backend Basics',
    category: 'Integration',
    duration: '21:10',
    thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=225&fit=crop',
    url: 'https://www.youtube.com/results?search_query=ai+agent+api+integration+tutorial',
    description: 'Connect your agents to external APIs and services',
  },
  {
    id: '5',
    title: 'Testing & Debugging Agents',
    channel: 'QA Academy',
    category: 'Testing',
    duration: '18:55',
    thumbnail: 'https://images.unsplash.com/photo-1516534775068-bb57c960209f?w=400&h=225&fit=crop',
    url: 'https://www.youtube.com/results?search_query=testing+debugging+ai+agents',
    description: 'Strategies for testing and debugging your agents effectively',
  },
  {
    id: '6',
    title: 'Deploying Agents to Production',
    channel: 'DevOps Masters',
    category: 'Deployment',
    duration: '19:32',
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=225&fit=crop',
    url: 'https://www.youtube.com/results?search_query=deploying+ai+agents+to+production',
    description: 'Learn how to deploy agents safely and scale them for production',
  },
];

const categories = ['All', 'Beginner', 'Advanced', 'Tips', 'Integration', 'Testing', 'Deployment'];

export default function LearnVideosPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredVideos =
    selectedCategory === 'All'
      ? videos
      : videos.filter((v) => v.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col">
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Learn About Agents
          </h1>
          <p className="text-xl text-slate-400">
            Video tutorials from developers and AI experts
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

        {/* Videos Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredVideos.map((video) => (
            <a
              key={video.id}
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <div className="border border-slate-800 hover:border-slate-600 rounded-lg overflow-hidden transition-colors duration-200">
                {/* Thumbnail */}
                <div className="relative h-40 bg-slate-800 overflow-hidden">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition flex items-center justify-center">
                    <Play className="w-12 h-12 text-white fill-white group-hover:scale-125 transition" />
                  </div>
                  <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </span>
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-white font-semibold group-hover:text-slate-400 transition line-clamp-2">
                      {video.title}
                    </h3>
                  </div>

                  <p className="text-slate-400 text-sm mb-3 line-clamp-2">
                    {video.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-indigo-400 text-xs">
                      {video.channel}
                    </span>
                    <span className="bg-slate-800 text-white px-2 py-1 rounded text-xs">
                      {video.category}
                    </span>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>

        {filteredVideos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400">No videos found in this category</p>
          </div>
        )}

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-indigo-900/50 to-indigo-800/50 border border-slate-700 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Have a Tutorial to Share?
          </h2>
          <p className="text-slate-300 mb-6">
            Submit your agent tutorial video and help the community learn
          </p>
          <a
            href="mailto:videos@agentshive.net"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition font-semibold"
          >
            Submit Your Video
          </a>
        </section>
      </main>
    </div>
  );
}
