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

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-slate-500 text-sm mb-10">Last updated: {EFFECTIVE}</p>

        <p className="text-slate-300 text-sm leading-relaxed mb-8">
          This Privacy Policy explains how Agentshive (&quot;we&quot;, &quot;us&quot;) collects,
          uses, and protects your information when you use agentshive.net (the &quot;Service&quot;).
          By using the Service you agree to this policy.
        </p>

        <Section title="Information we collect">
          <p>
            <strong className="text-white">Account information.</strong> When you sign up we collect
            your email address and a username. Authentication is handled by our infrastructure
            provider (Supabase).
          </p>
          <p>
            <strong className="text-white">Content you submit.</strong> If you upload or submit an
            agent or companion, we store the content and metadata you provide (title, description,
            tags, the definition file).
          </p>
          <p>
            <strong className="text-white">Usage data.</strong> We may collect basic, aggregated
            analytics such as pages visited, agent views and downloads, device/browser type, and
            approximate region, to understand and improve the Service.
          </p>
          <p>
            <strong className="text-white">We do not</strong> read your email, calendar, files, or
            other accounts. Agent &quot;companions&quot; that connect to services like Gmail run on
            your own machine in your own AI tool — those connections and any credentials stay with
            you and your chosen provider, never with Agentshive.
          </p>
        </Section>

        <Section title="How we use information">
          <ul className="list-disc pl-5 space-y-1">
            <li>To create and manage your account and let you download and publish agents.</li>
            <li>To operate, maintain, secure, and improve the Service.</li>
            <li>To measure interest in agents (view and download counts).</li>
            <li>To respond to your requests and communicate important updates.</li>
          </ul>
          <p>We do not sell your personal information.</p>
        </Section>

        <Section title="Service providers">
          <p>
            We share data only with vendors that help us run the Service, under their own privacy
            terms: <strong className="text-white">Supabase</strong> (database, authentication),
            {' '}<strong className="text-white">Vercel</strong> (hosting), and any privacy-respecting
            analytics provider we use. These providers process data on our behalf.
          </p>
        </Section>

        <Section title="Cookies">
          <p>
            We use cookies and similar technologies that are necessary to keep you signed in and to
            measure aggregate usage. You can control cookies through your browser settings; disabling
            them may affect login.
          </p>
        </Section>

        <Section title="Your rights (GDPR / CCPA)">
          <p>
            Depending on where you live, you may have the right to access, correct, export, or delete
            your personal data, and to object to or restrict certain processing. To exercise any of
            these rights, email us at{' '}
            <a href={`mailto:${CONTACT}`} className="text-indigo-400 hover:text-indigo-300">{CONTACT}</a>.
            We will respond within a reasonable time. You may also delete your account, which removes
            your account data from our active systems.
          </p>
        </Section>

        <Section title="Data retention">
          <p>
            We keep account and submitted content for as long as your account is active or as needed
            to provide the Service. We remove or anonymize data when it is no longer needed, subject
            to legal obligations.
          </p>
        </Section>

        <Section title="Security">
          <p>
            We use industry-standard measures to protect your data, but no method of transmission or
            storage is 100% secure. Use a strong, unique password.
          </p>
        </Section>

        <Section title="Children">
          <p>The Service is not directed to children under 13, and we do not knowingly collect their data.</p>
        </Section>

        <Section title="Changes to this policy">
          <p>
            We may update this policy from time to time. We will update the &quot;Last updated&quot;
            date above and, for material changes, provide additional notice.
          </p>
        </Section>

        <Section title="Contact">
          <p>
            Questions? Email{' '}
            <a href={`mailto:${CONTACT}`} className="text-indigo-400 hover:text-indigo-300">{CONTACT}</a>.
          </p>
        </Section>

        <div className="border-t border-slate-800 pt-6 mt-8 text-sm">
          <Link href="/terms" className="text-indigo-400 hover:text-indigo-300">Terms of Service →</Link>
        </div>
      </main>
    </div>
  );
}
