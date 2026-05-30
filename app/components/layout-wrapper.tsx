'use client';

import { ReactNode } from 'react';
import { SidebarNav } from './sidebar-nav';
import { SiteFooter } from './site-footer';

export function LayoutWrapper({ children }: { children: ReactNode }) {
  return (
    <>
      <SidebarNav />
      <div className="ml-64 min-h-screen flex flex-col bg-gradient-to-br from-amber-50 via-white to-orange-50">
        <main className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </div>
    </>
  );
}
