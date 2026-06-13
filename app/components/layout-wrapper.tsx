'use client';

import { ReactNode } from 'react';
import { SidebarNav } from './sidebar-nav';
import { SiteFooter } from './site-footer';

export function LayoutWrapper({ children }: { children: ReactNode }) {
  return (
    <>
      <SidebarNav />
      <div className="ml-16 min-h-screen flex flex-col bg-slate-950 overflow-x-hidden">
        <main className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
