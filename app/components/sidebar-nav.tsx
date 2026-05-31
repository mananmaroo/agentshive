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
    <aside
      className="group fixed left-0 top-0 h-screen w-16 hover:w-64 bg-[#0d0d1a] border-r border-slate-800 overflow-hidden pt-6 transition-all duration-200 ease-out z-50"
    >
      {/* Logo */}
      <Link href="/" className="px-4 mb-8 block whitespace-nowrap">
        <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-indigo-600 bg-clip-text text-transparent">
          <span className="group-hover:hidden">A</span>
          <span className="hidden group-hover:inline">Agentshive</span>
        </h1>
      </Link>

      {/* User Section */}
      {user && (
        <div className="px-3 mb-4 pb-4 border-b border-slate-800 whitespace-nowrap">
          <p className="text-xs font-semibold text-indigo-300 opacity-0 group-hover:opacity-100 transition-opacity duration-150">@{user.username}</p>
          <Link
            href="/agents/upload"
            className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-lg block text-center mt-2 transition opacity-0 group-hover:opacity-100"
          >
            Upload Agent
          </Link>
        </div>
      )}

      {/* Navigation */}
      <nav className="px-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-150 whitespace-nowrap ${
                active
                  ? 'bg-indigo-900/40 text-indigo-300 font-semibold'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-150">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Auth Section */}
      <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-slate-800 bg-[#0d0d1a] whitespace-nowrap">
        {user ? (
          <button
            onClick={handleLogOut}
            className="w-full flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-indigo-300 transition text-sm font-medium"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-150">Logout</span>
          </button>
        ) : (
          <div className="space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <Link
              href="/auth/login"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-lg block text-center transition text-xs"
            >
              Log In
            </Link>
            <Link
              href="/auth/signup"
              className="w-full bg-slate-800 hover:bg-slate-700 text-indigo-300 px-3 py-2 rounded-lg block text-center transition text-xs border border-slate-700"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
