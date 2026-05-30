import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./lib/auth-context";
import { SidebarNav } from "./components/sidebar-nav";
import { SiteFooter } from "./components/site-footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Agentshive",
  description: "Open registry for Claude agents",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-white flex flex-col">
        <AuthProvider>
          <SidebarNav />
          <div className="flex flex-col flex-1">
            <main className="ml-64 flex-1 bg-gradient-to-br from-amber-50 via-white to-orange-50">
              {children}
            </main>
            <footer className="ml-64">
              <SiteFooter />
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
