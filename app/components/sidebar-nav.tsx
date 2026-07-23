'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Briefcase, Coffee, FileText, Folder, HelpCircle, Home, LogOut, Sparkles, Terminal, Users, Zap } from 'lucide-react';
import { useAuth } from '@/app/lib/auth-context';

export function SidebarNav() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const handleLogOut = async () => {
    try { await signOut(); } finally { window.location.href = '/'; }
  };
  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');
  const navItems = [
    { icon: Home, label: 'Registry Home', href: '/registry/home' },
    { icon: Zap, label: 'Browse Agents', href: '/agents' },
    { icon: Sparkles, label: 'Perfect Prompts', href: '/perfect-prompts' },
    { icon: Terminal, label: 'Companions', href: '/companions' },
    { icon: BookOpen, label: 'Learn', href: '/learn-videos' },
    { icon: FileText, label: 'Blog', href: '/blog' },
    { icon: Folder, label: 'Categories', href: '/categories' },
    { icon: HelpCircle, label: 'FAQ', href: '/faq' },
    { icon: Users, label: 'Request Agent', href: '/request-agent' },
    { icon: Coffee, label: 'Donate', href: '/donate' },
  ];

  return (
    <aside className="group fixed left-0 top-0 z-[60] flex h-screen w-16 flex-col overflow-x-hidden border-r border-slate-800 bg-[#0d0d1a] pt-3 transition-[width] duration-150 ease-out hover:w-64">
      <Link href="/" title="Choose AgentsHive experience" className="mb-3 block shrink-0 whitespace-nowrap px-4">
        <span className="bg-gradient-to-r from-indigo-400 to-indigo-600 bg-clip-text text-lg font-bold text-transparent">
          <span className="group-hover:hidden">A</span><span className="hidden group-hover:inline">AgentsHive</span>
        </span>
      </Link>

      {user && <div className="mb-2 shrink-0 whitespace-nowrap border-b border-slate-800 px-3 pb-2"><Link href="/profile" className="flex items-center gap-2 py-1 text-slate-300 hover:text-indigo-300"><span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-600 text-xs font-bold text-white">{user.avatar_url ? <img src={user.avatar_url} alt="" className="h-full w-full object-cover" /> : user.username.charAt(0).toUpperCase()}</span><span className="text-xs font-semibold opacity-0 transition-opacity group-hover:opacity-100">@{user.username}</span></Link></div>}

      <nav className="scrollbar-thin flex-1 space-y-0.5 overflow-y-auto overflow-x-hidden px-2">
        <Link href="/employees" className="flex items-center gap-3 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium text-emerald-300 transition-colors hover:bg-emerald-900/30"><Briefcase className="h-5 w-5 shrink-0" /><span className="opacity-0 transition-opacity group-hover:opacity-100">AI Employees</span></Link>
        <div className="my-2 border-t border-slate-800" />
        {navItems.map((item) => { const Icon=item.icon; const active=isActive(item.href); return <Link key={item.href} href={item.href} className={`flex items-center gap-3 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm transition-colors ${active?'bg-indigo-900/40 font-semibold text-indigo-300':'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'}`}><Icon className="h-5 w-5 shrink-0" /><span className="opacity-0 transition-opacity group-hover:opacity-100">{item.label}</span></Link>; })}
        {user && <Link href="/agents/upload" className="flex items-center gap-3 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium text-indigo-300 hover:bg-indigo-900/40"><Zap className="h-5 w-5 shrink-0" /><span className="opacity-0 transition-opacity group-hover:opacity-100">Upload Agent</span></Link>}
      </nav>

      <div className="shrink-0 whitespace-nowrap border-t border-slate-800 bg-[#0d0d1a] p-2">
        {user ? <button onClick={handleLogOut} className="flex w-full items-center gap-3 px-3 py-1.5 text-sm font-medium text-slate-400 hover:text-indigo-300"><LogOut className="h-4 w-4 shrink-0" /><span className="opacity-0 transition-opacity group-hover:opacity-100">Logout</span></button> : <div className="space-y-2 opacity-0 transition-opacity group-hover:opacity-100"><Link href="/auth/login" className="block rounded-lg bg-indigo-600 px-3 py-2 text-center text-xs text-white hover:bg-indigo-500">Log In</Link><Link href="/auth/signup" className="block rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-center text-xs text-indigo-300 hover:bg-slate-700">Sign Up</Link></div>}
      </div>
    </aside>
  );
}
