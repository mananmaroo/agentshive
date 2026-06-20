import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "./lib/auth-context";
import { LayoutWrapper } from "./components/layout-wrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://agentshive.net"),
  title: {
    default: "Agentshive — The Open Registry for AI Agents",
    template: "%s | Agentshive",
  },
  description:
    "Discover, share, and install ready-made AI agents for Claude Code, Codex, n8n, LangChain and more. One-command install. Free and open.",
  keywords: [
    "AI agents",
    "agent registry",
    "Claude Code agents",
    "CLAUDE.md",
    "n8n workflows",
    "LangChain agents",
    "AI automation",
    "agent templates",
    "prompt library",
  ],
  applicationName: "Agentshive",
  openGraph: {
    type: "website",
    url: "https://agentshive.net",
    siteName: "Agentshive",
    title: "Agentshive — The Open Registry for AI Agents",
    description:
      "Discover, share, and install ready-made AI agents for Claude Code, Codex, n8n, LangChain and more. One-command install. Free and open.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Agentshive — The Open Registry for AI Agents",
    description:
      "Discover, share, and install ready-made AI agents for any runtime. One-command install. Free and open.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://agentshive.net",
  },
};

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Agentshive",
  url: "https://agentshive.net",
  description:
    "The open registry for AI agents — discover, share, and install agents for any runtime.",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://agentshive.net/agents?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <body className="bg-slate-950 text-slate-200">
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
            </Script>
          </>
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <AuthProvider>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
