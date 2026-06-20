'use client';

import Link from 'next/link';

const EFFECTIVE = 'June 20, 2026';
const CONTACT = 'agentshive26@gmail.com';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold text-white mb-3">{title}</h2>
      <div className="text-slate-300 leading-relaxed space-y-3 text-sm">{children}</div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-white mb-2">Terms of Service</h1>
        <p className="text-slate-500 text-sm mb-10">Last updated: {EFFECTIVE}</p>

        <p className="text-slate-300 text-sm leading-relaxed mb-8">
          These Terms govern your use of Agentshive at agentshive.net (the &quot;Service&quot;). By
          accessing or using the Service, you agree to these Terms. If you do not agree, do not use
          the Service.
        </p>

        <Section title="The Service">
          <p>
            Agentshive is an open registry where users discover, download, and share AI agent
            definitions. Agents are text/Markdown files intended to be run in third-party AI tools
            (such as Claude Code, Codex, Cursor, Perplexity, and other LLMs).
          </p>
        </Section>

        <Section title="Accounts">
          <p>
            You are responsible for your account and for keeping your credentials secure. You must
            provide accurate information and be at least 13 years old. You are responsible for all
            activity under your account.
          </p>
        </Section>

        <Section title="Acceptable use">
          <p>You agree not to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Upload malicious code, malware, or content that violates any law or third-party right.</li>
            <li>Infringe intellectual property or post others&apos; confidential information.</li>
            <li>Abuse, scrape, overload, or attempt to disrupt the Service.</li>
            <li>Misrepresent the origin, authorship, or capabilities of an agent.</li>
          </ul>
        </Section>

        <Section title="Your content and license">
          <p>
            You retain ownership of agents and content you submit. By submitting content, you grant
            Agentshive a non-exclusive, worldwide, royalty-free license to host, display, and
            distribute it through the Service so that others can view and download it. You represent
            that you have the rights to submit it and to grant this license. You may remove your
            content at any time, after which we will stop distributing it within a reasonable period.
          </p>
        </Section>

        <Section title="Third-party tools and AI output">
          <p>
            Agents run in third-party AI tools that you choose and control. We do not control those
            tools or their output. You are responsible for reviewing what an agent does before
            relying on it — especially agents that take actions (sending email, moving files,
            calling external services). Use confirmation/draft modes where provided, and never share
            credentials you are not comfortable using.
          </p>
        </Section>

        <Section title="Intellectual property">
          <p>
            The Agentshive name, branding, and the Service itself are owned by us. These Terms do not
            grant you rights to our trademarks. Agent content belongs to its respective authors.
          </p>
        </Section>

        <Section title="Disclaimer of warranties">
          <p>
            The Service and all agents are provided &quot;as is&quot; and &quot;as available&quot;,
            without warranties of any kind, express or implied, including fitness for a particular
            purpose, accuracy, or non-infringement. We do not warrant that any agent will work, be
            safe, or produce correct results.
          </p>
        </Section>

        <Section title="Limitation of liability">
          <p>
            To the maximum extent permitted by law, Agentshive and its creators will not be liable
            for any indirect, incidental, special, consequential, or punitive damages, or any loss
            of data, profits, or revenue, arising from your use of the Service or any agent.
          </p>
        </Section>

        <Section title="Termination">
          <p>
            We may suspend or terminate access that violates these Terms. You may stop using the
            Service and delete your account at any time.
          </p>
        </Section>

        <Section title="Changes">
          <p>
            We may update these Terms. We will update the &quot;Last updated&quot; date and, for
            material changes, provide additional notice. Continued use after changes means you accept
            them.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Questions? Email{' '}
            <a href={`mailto:${CONTACT}`} className="text-indigo-400 hover:text-indigo-300">{CONTACT}</a>.
          </p>
        </Section>

        <div className="border-t border-slate-800 pt-6 mt-8 text-sm">
          <Link href="/privacy" className="text-indigo-400 hover:text-indigo-300">Privacy Policy →</Link>
        </div>
      </main>
    </div>
  );
}
