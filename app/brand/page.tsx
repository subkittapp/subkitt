'use client'

import { useState } from 'react'

export default function BrandPage() {
  const [copiedToken, setCopiedToken] = useState<string | null>(null)

  function handleCopy(hex: string, label: string) {
    navigator.clipboard.writeText(hex)
    setCopiedToken(label)
    setTimeout(() => setCopiedToken(null), 2000)
  }

  const colorTokens = [
    { label: 'Background Obsidian', hex: '#050505', desc: 'Main background layout color' },
    { label: 'Card Obsidian', hex: '#0a0a0a', desc: 'Glass cards and navigation overlays' },
    { label: 'Border Charcoal', hex: '#171717', desc: 'Default borders and divider lines' },
    { label: 'Accent Emerald', hex: '#10b981', desc: 'Active states and waitlist highlights' },
    { label: 'Text Off-White', hex: '#fafafa', desc: 'Primary typography headers' },
    { label: 'Text Muted Gray', hex: '#a3a3a3', desc: 'Body paragraphs and subtitles' },
  ]

  return (
    <main className="relative min-h-screen bg-[#050505] text-neutral-100 selection:bg-neutral-850 pb-24 overflow-hidden flex flex-col justify-between">
      {/* Soft background glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-neutral-900/10 blur-[130px] pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[45%] h-[45%] rounded-full bg-neutral-950/20 blur-[130px] pointer-events-none" />

      {/* Header */}
      <nav className="max-w-5xl w-full mx-auto px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center font-bold text-white shadow-md">
            S
          </div>
          <span className="font-bold tracking-tight text-lg bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">SubKitt Brand Identity</span>
        </div>
        <a
          href="/"
          className="glass border border-neutral-800 hover:border-neutral-700 text-neutral-200 text-xs font-semibold px-4.5 py-2.5 rounded-xl transition active:scale-[0.98]"
        >
          Back to Home
        </a>
      </nav>

      {/* Main Body */}
      <div className="max-w-4xl w-full mx-auto px-6 py-12 z-10 space-y-16">
        
        {/* Intro */}
        <section className="space-y-4">
          <div className="inline-flex items-center gap-2 bg-neutral-900/60 border border-neutral-800/80 rounded-full px-3.5 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-widest">Brand Guidelines</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-neutral-200 to-neutral-500 bg-clip-text text-transparent">
            Sleek. Minimalist. Developer-First.
          </h1>
          <p className="text-neutral-400 text-sm leading-relaxed max-w-2xl">
            SubKitt is built for tech founders. Our visual system is designed to look clean, high-performance, and native to a developer&apos;s workspace. No fluff. Just precision.
          </p>
        </section>

        {/* Brand Mockup Image Sheet */}
        <section className="space-y-4">
          <h2 className="text-xs uppercase tracking-widest text-neutral-500 font-mono">Visual Identity Design Sheet</h2>
          <div className="border border-neutral-900 bg-neutral-950/40 rounded-3xl p-4 md:p-6 shadow-2xl overflow-hidden group">
            <img
              src="/subkitt_brand_mockup.png"
              alt="SubKitt Brand Mockup Assets"
              className="w-full rounded-2xl border border-neutral-900 group-hover:scale-[1.01] transition-transform duration-500 shadow-lg"
            />
          </div>
        </section>

        {/* Color Palette Tokens */}
        <section className="space-y-6">
          <div>
            <h2 className="text-xs uppercase tracking-widest text-neutral-500 font-mono">Color Token System</h2>
            <p className="text-xs text-neutral-400 mt-1">Click any color swatch to copy the HEX token code.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {colorTokens.map((token) => (
              <button
                key={token.label}
                onClick={() => handleCopy(token.hex, token.label)}
                className="glass border border-neutral-900 rounded-2xl p-5 flex flex-col justify-between h-32 text-left hover:border-neutral-800 transition duration-300 relative group active:scale-[0.99]"
              >
                <div className="flex justify-between items-start w-full">
                  <div>
                    <h3 className="text-xs font-bold text-neutral-200">{token.label}</h3>
                    <p className="text-[10px] text-neutral-500 mt-0.5">{token.desc}</p>
                  </div>
                  <div
                    className="w-5 h-5 rounded-md border border-neutral-850 shadow-inner shrink-0"
                    style={{ backgroundColor: token.hex }}
                  />
                </div>
                <div className="flex justify-between items-center w-full text-[10px] font-mono text-neutral-400 pt-3 border-t border-neutral-950">
                  <span>{token.hex}</span>
                  <span className="text-[9px] uppercase tracking-wider text-neutral-600 group-hover:text-neutral-400 transition-colors">
                    {copiedToken === token.label ? 'Copied ✓' : 'Click to copy'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Typography */}
        <section className="space-y-6">
          <div>
            <h2 className="text-xs uppercase tracking-widest text-neutral-500 font-mono">Typography System</h2>
            <p className="text-xs text-neutral-400 mt-1">High-impact sans-serif pairings optimized for readability.</p>
          </div>

          <div className="glass border border-neutral-900 rounded-2xl p-6 md:p-8 space-y-6">
            <div className="space-y-2 border-b border-neutral-900 pb-6">
              <span className="text-[10px] font-mono text-neutral-600 uppercase tracking-widest">Primary Brand Font — Geist Sans</span>
              <div className="flex flex-wrap items-baseline gap-4">
                <span className="text-4xl font-extrabold text-neutral-100">Aa Bb Cc</span>
                <span className="text-sm text-neutral-400">Regular, Semibold, Extrabold, Black</span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed max-w-xl">
                Used for headings, brand logs, buttons, and high-impact hero claims to express structure and modern technology values.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono text-neutral-600 uppercase tracking-widest">Secondary Code Font — Geist Mono</span>
              <div className="flex flex-wrap items-baseline gap-4">
                <span className="text-3xl font-mono text-neutral-300">const subkitt = true</span>
                <span className="text-xs text-neutral-500 font-mono">Monospace spec layout</span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed max-w-xl">
                Used for git commit samples, input tables, character count counters, status boards, and chronological history metadata headers.
              </p>
            </div>
          </div>
        </section>

        {/* Writing Style */}
        <section className="space-y-6">
          <div>
            <h2 className="text-xs uppercase tracking-widest text-neutral-500 font-mono">Voice & Tone parameters</h2>
            <p className="text-xs text-neutral-400 mt-1">The principles guiding SubKitt tweet draft compilation.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { title: '1. No Creator Fluff', desc: 'We do not draft threads about "10 tools I use to write code." We write direct updates about actual features shipped to production.' },
              { title: '2. Focus on the Outcome', desc: 'Drafts focus on the value shipped to developers or users. Show, don&apos;t just tell. Let code updates speak.' },
              { title: '3. Technical Precision', desc: 'Maintain technical accuracy. Use proper architectural terms, API definitions, and developer concepts cleanly.' },
              { title: '4. Absolute Velocity', desc: 'Drafts sound active, lightweight, and fast. Emphasize continuous progress and shipping frequency.' },
            ].map((p, idx) => (
              <div key={idx} className="glass border border-neutral-900 rounded-2xl p-5 space-y-2">
                <h3 className="text-xs font-bold text-neutral-250">{p.title}</h3>
                <p className="text-neutral-450 text-[11px] leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* Footer */}
      <footer className="max-w-5xl w-full mx-auto px-6 py-6 border-t border-neutral-900/60 flex items-center justify-between text-xs text-neutral-500">
        <span>© {new Date().getFullYear()} SubKitt. All rights reserved.</span>
        <span>Developer Aesthetics System</span>
      </footer>
    </main>
  )
}
