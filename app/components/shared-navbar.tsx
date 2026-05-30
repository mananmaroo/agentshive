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
    <nav className="bg-amber-50/95 border-b border-amber-200 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-800 to-amber-600 bg-clip-text text-transparent">Agentshive</h1>
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/" className="text-amber-900 hover:text-amber-700 transition text-sm font-medium">
            Home
          </Link>
          <Link href="/learn-videos" className="text-amber-900 hover:text-amber-700 transition text-sm">
            Videos
          </Link>
          <Link href="/agents" className="text-amber-900 hover:text-amber-700 transition text-sm">
            Browse
          </Link>
          <Link href="/top-agents" className="text-amber-900 hover:text-amber-700 transition text-sm">
            Trending
          </Link>
          <Link href="/categories" className="text-amber-900 hover:text-amber-700 transition text-sm">
            Categories
          </Link>
          <Link href="/blog" className="text-amber-900 hover:text-amber-700 transition text-sm">
            Blog
          </Link>
          <Link href="/faq" className="text-amber-900 hover:text-amber-700 transition text-sm">
            FAQ
          </Link>
          <Link href="/support" className="text-amber-900 hover:text-amber-700 transition text-sm">
            Support
          </Link>

          {loading ? (
            <div className="text-amber-700 text-sm">Loading...</div>
          ) : user ? (
            <>
              <Link href="/profile" className="text-amber-900 hover:text-amber-700 transition text-sm">
                @{user.username}
              </Link>
              <Link href="/agents/upload" className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg transition text-sm">
                Upload
              </Link>
              <button
                onClick={handleLogOut}
                className="text-amber-900 hover:text-amber-700 transition text-sm flex items-center gap-1"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/signup" className="text-amber-900 hover:text-amber-700 transition text-sm">
                Sign Up
              </Link>
              <Link href="/auth/login" className="text-amber-900 hover:text-amber-700 transition text-sm">
                Log In
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
