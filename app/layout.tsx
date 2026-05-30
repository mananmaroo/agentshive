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
      <body className="bg-white">
        <AuthProvider>
          <div className="flex min-h-screen">
            <SidebarNav />
            <div className="flex flex-col flex-1 ml-64">
              <main className="flex-1 bg-gradient-to-br from-amber-50 via-white to-orange-50">
                {children}
              </main>
              <footer>
                <SiteFooter />
              </footer>
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
