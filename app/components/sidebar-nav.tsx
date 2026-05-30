'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Zap, BookOpen, Folder, HelpCircle, Coffee, FileText, Users, LogOut } from 'lucide-react';
import { useAuth } from '@/app/lib/auth-context';

export function SidebarNav() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const handleLogOut = async () => {
    await signOut();
    window.location.reload();
  };

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  const navItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Zap, label: 'Browse Agents', href: '/agents' },
    { icon: BookOpen, label: 'Learn', href: '/learn-videos' },
    { icon: FileText, label: 'Blog', href: '/blog' },
    { icon: Folder, label: 'Categories', href: '/categories' },
    { icon: HelpCircle, label: 'FAQ', href: '/faq' },
    { icon: Users, label: 'Request Agent', href: '/request-agent' },
    { icon: Coffee, label: 'Donate', href: '/donate' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#0d0d1a] border-r border-slate-800 overflow-y-auto pt-6">
      {/* Logo */}
      <Link href="/" className="px-6 mb-8 block">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-indigo-600 bg-clip-text text-transparent">
          Agentshive
        </h1>
      </Link>

      {/* User Section */}
      {user && (
        <div className="px-6 mb-6 pb-6 border-b border-slate-800">
          <p className="text-sm font-semibold text-indigo-300">@{user.username}</p>
          <Link
            href="/agents/upload"
            className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg block text-center mt-2 transition"
          >
            Upload Agent
          </Link>
        </div>
      )}

      {/* Navigation */}
      <nav className="px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                active
                  ? 'bg-indigo-900/50 text-indigo-300 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Auth Section */}
      <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-800 bg-[#0d0d1a]">
        {user ? (
          <button
            onClick={handleLogOut}
            className="w-full flex items-center gap-2 text-slate-300 hover:text-indigo-400 transition text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        ) : (
          <div className="space-y-2">
            <Link
              href="/auth/login"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg block text-center transition text-sm"
            >
              Log In
            </Link>
            <Link
              href="/auth/signup"
              className="w-full bg-slate-800 hover:bg-slate-700 text-indigo-300 px-3 py-2 rounded-lg block text-center transition text-sm border border-slate-700"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
