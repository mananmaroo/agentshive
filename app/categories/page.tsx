'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Folder } from 'lucide-react';

interface Category {
  name: string;
  count: number;
}

const defaultCategories: Category[] = [
  { name: 'Data Science', count: 0 },
  { name: 'Automation', count: 0 },
  { name: 'Content Creation', count: 0 },
  { name: 'Customer Support', count: 0 },
  { name: 'Analytics', count: 0 },
  { name: 'Code Generation', count: 0 },
  { name: 'Research', count: 0 },
  { name: 'Productivity', count: 0 },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/agents/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col">
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Browse by Category
          </h1>
          <p className="text-xl text-slate-400">
            Explore agents organized by category
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-slate-400">Loading categories...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={`/agents?category=${encodeURIComponent(category.name)}`}
                className="bg-white border border-slate-700 rounded-lg p-6 hover:border-amber-500 hover:bg-slate-800 transition group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-slate-700 rounded-lg flex items-center justify-center group-hover:bg-amber-300 transition">
                    <Folder className="w-6 h-6 text-slate-400" />
                  </div>
                  <div className="bg-slate-800 px-3 py-1 rounded-full">
                    <span className="text-sm text-white font-semibold">{category.count}</span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-white group-hover:text-slate-400 transition">
                  {category.name}
                </h3>
                <p className="text-slate-400 text-sm mt-2">
                  {category.count} agent{category.count !== 1 ? 's' : ''}
                </p>
              </Link>
            ))}
          </div>
        )}

        {/* Featured Section */}
        <div className="mt-16 bg-gradient-to-r from-indigo-900/50 to-indigo-800/50 border border-slate-700 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-4">
            Can't find what you're looking for?
          </h2>
          <p className="text-slate-300 mb-6">
            Request a custom agent built to your specifications. Our team will help bring your vision to life.
          </p>
          <Link
            href="/request-agent"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition font-semibold"
          >
            Request a Custom Agent
          </Link>
        </div>
      </main>
    </div>
  );
}
