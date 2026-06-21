'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Terminal, Search, Download, Zap } from 'lucide-react';

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-start gap-3">
      <pre className="text-xs text-slate-300 flex-1 overflow-x-auto whitespace-pre-wrap break-words">{code}</pre>
      <button
        onClick={copy}
        className="flex-shrink-0 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded text-xs font-semibold transition"
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}

const cursorConfig = `{
  "mcpServers": {
    "agentshive": {
      "command": "npx",
      "args": ["-y", "agentshive-mcp"]
    }
  }
}`;

export default function McpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 text-indigo-300 text-xs font-medium px-3 py-1 rounded-full mb-4">
          <Zap className="w-3.5 h-3.5" />
          One-time setup
        </div>
        <h1 className="text-4xl font-bold text-white mb-3">Connect once, then just say the name</h1>
        <p className="text-lg text-slate-400 mb-10">
          Add the Agentshive MCP to your AI tool and you can search and install any agent in plain
          English — no URLs, no copy-paste, no downloads. Just:{' '}
          <span className="text-white font-medium">&quot;install the invoice extraction agent and run it.&quot;</span>
        </p>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-white mb-3">1. Add it (once)</h2>
          <p className="text-slate-400 text-sm mb-3">In Claude Code, run:</p>
          <CodeBlock code="claude mcp add agentshive -- npx -y agentshive-mcp" />
          <p className="text-slate-400 text-sm mt-4 mb-3">
            In Codex or Cursor, add this to your MCP config:
          </p>
          <CodeBlock code={cursorConfig} />
          <p className="text-xs text-slate-500 mt-3">
            Requires Node 18+. The first run downloads the server automatically via{' '}
            <code className="text-indigo-300">npx</code>.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-white mb-3">2. Then just ask</h2>
          <ul className="space-y-2 text-sm text-slate-300">
            <li className="bg-slate-800/40 border border-slate-700 rounded-lg px-4 py-3">&quot;Install the Smart Coder agent from Agentshive and use it.&quot;</li>
            <li className="bg-slate-800/40 border border-slate-700 rounded-lg px-4 py-3">&quot;Get the invoice extraction agent and run it.&quot;</li>
            <li className="bg-slate-800/40 border border-slate-700 rounded-lg px-4 py-3">&quot;Search Agentshive for a code review agent and install the top one.&quot;</li>
          </ul>
          <p className="text-slate-400 text-sm mt-4">
            Your tool installs the agent into <code className="text-indigo-300">.claude/agents/</code>{' '}
            and uses it — it stays on disk until you remove it.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-white mb-3">What it can do</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="border border-slate-700 rounded-lg p-4">
              <Search className="w-5 h-5 text-indigo-400 mb-2" />
              <p className="text-white text-sm font-semibold mb-1">Search</p>
              <p className="text-slate-400 text-xs">Find agents by topic, category, or popularity.</p>
            </div>
            <div className="border border-slate-700 rounded-lg p-4">
              <Terminal className="w-5 h-5 text-indigo-400 mb-2" />
              <p className="text-white text-sm font-semibold mb-1">Get details</p>
              <p className="text-slate-400 text-xs">Pull an agent&apos;s full description and metadata.</p>
            </div>
            <div className="border border-slate-700 rounded-lg p-4">
              <Download className="w-5 h-5 text-indigo-400 mb-2" />
              <p className="text-white text-sm font-semibold mb-1">Install</p>
              <p className="text-slate-400 text-xs">Write the agent file straight to your project.</p>
            </div>
          </div>
        </section>

        <div className="border-t border-slate-800 pt-6 text-sm text-slate-400">
          No MCP support in your tool (e.g. Claude.ai web or ChatGPT)? You can still{' '}
          <Link href="/agents" className="text-indigo-400 hover:text-indigo-300">browse agents</Link>{' '}
          and paste or download any definition directly.
        </div>
      </main>
    </div>
  );
}
