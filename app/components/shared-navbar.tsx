'use client';

import Link from 'next/link';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/app/lib/auth-context';

export function SharedNavbar() {
  const { user, loading, signOut } = useAuth();

  const handleLogOut = async () => {
    await signOut();
    window.location.reload();
  };

  return (
    <nav className="bg-slate-900/50 border-b border-slate-700 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
            AS
          </div>
          <h1 className="text-xl font-bold text-white">AgentStack</h1>
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/learn-videos" className="text-slate-300 hover:text-white transition text-sm">
            Videos
          </Link>
          <Link href="/agents" className="text-slate-300 hover:text-white transition text-sm">
            Browse
          </Link>
          <Link href="/top-agents" className="text-slate-300 hover:text-white transition text-sm">
            Trending
          </Link>
          <Link href="/categories" className="text-slate-300 hover:text-white transition text-sm">
            Categories
          </Link>
          <Link href="/blog" className="text-slate-300 hover:text-white transition text-sm">
            Blog
          </Link>
          <Link href="/faq" className="text-slate-300 hover:text-white transition text-sm">
            FAQ
          </Link>
          <Link href="/support" className="text-slate-300 hover:text-white transition text-sm">
            Support
          </Link>

          {loading ? (
            <div className="text-slate-400 text-sm">Loading...</div>
          ) : user ? (
            <>
              <Link href="/profile" className="text-slate-300 hover:text-white transition text-sm">
                @{user.username}
              </Link>
              <Link href="/agents/upload" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition text-sm">
                Upload
              </Link>
              <button
                onClick={handleLogOut}
                className="text-slate-300 hover:text-white transition text-sm flex items-center gap-1"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/signup" className="text-slate-300 hover:text-white transition text-sm">
                Sign Up
              </Link>
              <Link href="/auth/login" className="text-slate-300 hover:text-white transition text-sm">
                Log In
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
