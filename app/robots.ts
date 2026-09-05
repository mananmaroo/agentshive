/opt/homebrew/Library/Homebrew/cmd/shellenv.sh: line 18: /bin/ps: Operation not permitted
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Allow AI fetchers (Claude, GPT, Perplexity) to read /api/agents/*/raw
        // so users can paste the install command directly into their AI tool.
        userAgent: '*',
        allow: ['/api/agents/'],
        disallow: ['/dashboard', '/profile', '/auth/', '/agents/upload', '/employees/dashboard', '/employees/admin', '/employees/setup', '/employees/checkout'],
      },
    ],
    sitemap: 'https://agentshive.net/sitemap.xml',
  };
}
