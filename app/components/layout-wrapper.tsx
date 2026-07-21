'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { SidebarNav } from './sidebar-nav';
import { SiteFooter } from './site-footer';

export function LayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isExperienceChoice = pathname === '/';

  return (
    <>
      {!isExperienceChoice && <SidebarNav />}
      <div
        className={`${isExperienceChoice ? '' : 'ml-16'} min-h-screen flex flex-col bg-slate-950 overflow-x-hidden`}
      >
        <main className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
