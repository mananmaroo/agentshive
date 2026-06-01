import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Calendar, User, ChevronLeft } from 'lucide-react';
import { samplePosts } from '../sample-posts';

export async function generateStaticParams() {
  return samplePosts.map((p) => ({ slug: p.slug }));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = samplePosts.find((p) => p.slug === slug);
  if (!post) notFound();
  if (post.external_url) redirect(post.external_url);

  return (
    <div className="min-h-screen bg-slate-950">
      <article className="max-w-3xl mx-auto px-4 py-12">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm mb-8"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Blog
        </Link>

        {post.featured_image_url && (
          <img
            src={post.featured_image_url}
            alt={post.title}
            className="w-full h-64 object-cover rounded-lg border border-slate-800 mb-8"
          />
        )}

        <span className="inline-block bg-slate-800 text-indigo-300 text-xs font-semibold px-3 py-1 rounded-full mb-4">
          {post.category}
        </span>

        <h1 className="text-4xl font-bold text-white mb-4">{post.title}</h1>

        <div className="flex items-center gap-4 text-slate-400 text-sm mb-8">
          <div className="flex items-center gap-1">
            <User className="w-4 h-4" />
            {post.author.username}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <time dateTime={post.published_at}>
              {new Date(post.published_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </time>
          </div>
          <div className="text-xs">{post.view_count.toLocaleString()} views</div>
        </div>

        <p className="text-lg text-slate-300 leading-relaxed mb-8">{post.excerpt}</p>

        {post.content && (
          <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed whitespace-pre-wrap">
            {post.content}
          </div>
        )}

        <div className="mt-16 pt-8 border-t border-slate-800">
          <Link
            href="/blog"
            className="text-indigo-400 hover:text-indigo-300 font-semibold"
          >
            ← More posts
          </Link>
        </div>
      </article>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = samplePosts.find((p) => p.slug === slug);
  if (!post) return { title: 'Post not found — Agentshive' };
  return {
    title: `${post.title} — Agentshive`,
    description: post.excerpt,
  };
}
