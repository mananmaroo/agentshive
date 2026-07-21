'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { SidebarNav } from './sidebar-nav';
import { SiteFooter } from './site-footer';

export function LayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isExperienceChoice = pathname === '/';
  const isBusinessExperience = pathname.startsWith('/employees');
  const usesAgentNavigation = !isExperienceChoice && !isBusinessExperience;

  return (
    <>
      {usesAgentNavigation && <SidebarNav />}
      <div
        className={`${usesAgentNavigation ? 'ml-16' : ''} min-h-screen flex flex-col bg-slate-950 overflow-x-hidden`}
      >
        <main className="flex-1">
          {children}
        </main>
        {!isBusinessExperience && <SiteFooter />}
      </div>
    </>
  );
}
