'use client';

import { useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';

function SubKittLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="20" height="20">
        <path
          d="M47 19 C47 13 38 11 30 13 C20 15.5 17 23 27 27.5 C41 33 44 39 37 46.5 C31 53 21 51.5 17 45"
          fill="none" stroke="white" strokeWidth="7.5" strokeLinecap="round"
        />
      </svg>
      <span className="font-semibold text-white tracking-tight text-[15px]">SubKitt</span>
    </div>
  );
}

function DemoCard() {
  return (
    <div className="rounded-2xl border border-white/[0.09] bg-white/[0.03] overflow-hidden h-full">

      {/* Commit input */}
      <div className="border-b border-white/[0.07]">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-white/[0.05]">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-white/[0.1]" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/[0.1]" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/[0.1]" />
          </div>
          <span className="text-[11px] text-neutral-600 font-mono ml-1">git log — last 7 days</span>
        </div>
        <div className="px-5 py-4 font-mono space-y-4">
          <div>
            <p className="text-[10px] text-neutral-700 mb-1">commit a1b2c3d · 2 days ago</p>
            <p className="text-[13px] text-green-400">feat: add OAuth flow to settings page</p>
            <p className="text-[10px] text-neutral-600 mt-1">+847 −12 · 6 files</p>
          </div>
          <div className="border-t border-white/[0.05] pt-4">
            <p className="text-[10px] text-neutral-700 mb-1">commit f8e7d6c · 4 days ago</p>
            <p className="text-[13px] text-green-400">feat: launch stripe billing</p>
            <p className="text-[10px] text-neutral-600 mt-1">+1,203 −88 · 11 files</p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 px-5 py-2.5">
        <div className="flex-1 h-px bg-white/[0.06]" />
        <span className="text-[10px] text-neutral-700 uppercase tracking-widest">SubKitt</span>
        <div className="flex-1 h-px bg-white/[0.06]" />
      </div>

      {/* Tweet output */}
      <div className="border-t border-white/[0.07]">
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.05]">
          <span className="text-[11px] text-neutral-600">Monday drafts</span>
          <span className="text-[10px] bg-white/[0.06] text-neutral-500 px-2 py-0.5 rounded-full italic">example</span>
        </div>
        <div className="divide-y divide-white/[0.05]">
          {[
            { n: 1, text: "Just shipped OAuth into SubKitt. If you've ever fought GitHub's token refresh flow on a Tuesday, this one's for you." },
            { n: 2, text: "Stripe billing is live. Took longer than expected — mostly because I kept second-guessing the subscription logic. Shipped it anyway." },
          ].map(({ n, text }) => (
            <div key={n} className="px-5 py-3.5">
              <span className="text-[10px] text-neutral-700 font-mono block mb-1.5">{n} / 5</span>
              <p className="text-[13px] text-neutral-200 leading-relaxed">{text}</p>
            </div>
          ))}
          <div className="px-5 py-2.5 text-[11px] text-neutral-700">+ 3 more drafts in your inbox</div>
        </div>
      </div>

    </div>
  );
}

export default function Home() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const supabase = createBrowserClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    const { error } = await supabase.from('waitlist').insert({
      email: email.toLowerCase().trim(),
      referrer: typeof document !== 'undefined' ? document.referrer : null,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    });
    if (error) {
      if (error.code === '23505') setStatus('success');
      else { setStatus('error'); setErrorMsg(error.message); }
    } else {
      setStatus('success');
    }
  }

  return (
    <main className="min-h-screen bg-[#080808] text-white overflow-x-hidden">

      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-[700px] h-[600px] rounded-full bg-white/[0.02] blur-[120px]" />
      </div>

      {/* Navbar */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-white/[0.07] bg-[#080808]/75 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-8 h-14 flex items-center justify-between">
          <SubKittLogo />
          <nav className="hidden md:flex items-center gap-8">
            <a href="#how" className="text-sm text-neutral-500 hover:text-white transition-colors">How it works</a>
            <a href="#founder" className="text-sm text-neutral-500 hover:text-white transition-colors">About</a>
          </nav>
          <a
            href="/login"
            className="flex items-center gap-2 bg-white text-[#080808] text-sm font-semibold px-4 py-2 rounded-lg hover:bg-neutral-200 transition-colors"
          >
            Get Started
          </a>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-8">

        {/* Hero — two column */}
        <section className="pt-32 pb-24 grid lg:grid-cols-[1fr_520px] gap-16 items-center min-h-[90vh]">

          {/* Left: text */}
          <div>
            <div className="inline-flex items-center gap-2.5 border border-white/[0.1] bg-white/[0.04] rounded-full px-4 py-1.5 mb-10">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shrink-0" />
              <span className="text-xs text-neutral-400 tracking-wide">Early access · 50% off for first 50</span>
            </div>

            <h1 className="text-[56px] lg:text-[72px] xl:text-[80px] font-bold tracking-[-0.03em] leading-[1.04] mb-7">
              <span className="bg-gradient-to-b from-white via-white to-neutral-600 bg-clip-text text-transparent">
                You ship.<br />
                Your work turns<br />
                into inbound.
              </span>
            </h1>

            <p className="text-[17px] text-neutral-500 max-w-md mb-10 leading-relaxed">
              SubKitt reads your commits and writes 5 ready-to-post tweet drafts — delivered to your inbox every Monday morning.
            </p>

            <div className="flex flex-wrap items-center gap-3 mb-5">
              <a
                href="/login"
                className="flex items-center gap-2.5 bg-white text-[#080808] font-semibold px-6 py-3 rounded-xl text-sm hover:bg-neutral-100 transition-all hover:shadow-[0_0_40px_rgba(255,255,255,0.12)]"
              >
                Get Started — it&apos;s free
              </a>

              {status === 'success' ? (
                <span className="text-sm text-green-400">You&apos;re on the list.</span>
              ) : (
                <form onSubmit={handleSubmit} className="flex items-center gap-1">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Or join the waitlist"
                    required
                    disabled={status === 'loading'}
                    className="bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/[0.25] w-48 disabled:opacity-50 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="text-neutral-500 hover:text-white transition-colors px-3 py-3 text-sm disabled:opacity-40"
                  >
                    {status === 'loading' ? '···' : '→'}
                  </button>
                </form>
              )}
            </div>

            {status === 'error' && <p className="text-red-400 text-xs mb-3">{errorMsg}</p>}
            <p className="text-xs text-neutral-700">No card required. No spam.</p>
          </div>

          {/* Right: demo card */}
          <div className="hidden lg:block">
            <DemoCard />
          </div>
        </section>

        {/* Who it's for */}
        <section className="pb-24">
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] px-10 py-10">
            <span className="text-[11px] uppercase tracking-[0.14em] text-neutral-600 block mb-5">Who it&apos;s for</span>
            <p className="text-xl lg:text-2xl text-neutral-300 leading-relaxed font-medium max-w-3xl">
              Solo technical founders building SaaS. You ship often but your X timeline is a ghost town. You know building in public is the cheat code — but you&apos;d rather stay in the codebase.
            </p>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="pb-24">
          <div className="flex items-center justify-between mb-12">
            <span className="text-[11px] uppercase tracking-[0.14em] text-neutral-600">How it works</span>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { n: '01', title: 'Connect GitHub', body: 'SubKitt watches your repos and tracks what you actually ship — features, releases, big commits. Not noise.' },
              { n: '02', title: 'Get drafts Monday', body: 'Every Monday morning, 5 tweet drafts land in your inbox. No prompts, no blank page — just your work, packaged.' },
              { n: '03', title: 'Post in 30 seconds', body: 'Pick a draft, tweak it if you want, post it. Your whole week of work, shared in under a minute.' },
              { n: '04', title: 'See what\'s working', body: 'Every batch tells you which pattern from last week performed best — and explains why this week\'s drafts lean that way. Not a black box.' },
            ].map(({ n, title, body }) => (
              <div key={n} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-8 hover:bg-white/[0.04] hover:border-white/[0.12] transition-all">
                <span className="text-[11px] font-mono text-neutral-700 block mb-8">{n}</span>
                <h3 className="font-semibold text-white mb-3 text-[15px]">{title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Philosophy */}
        <section className="pb-24 max-w-3xl">
          <p className="text-2xl lg:text-[28px] text-neutral-300 leading-[1.5] font-medium mb-5">
            Technical founders ship more than they post. The work is there — the audience isn&apos;t, because turning code into content is a second job nobody has time for.
          </p>
          <p className="text-lg text-neutral-600 leading-relaxed">
            You tried to become a creator and it killed your velocity. You&apos;re not a creator — you&apos;re a builder.{' '}
            <span className="text-neutral-400">Stay in the code. SubKitt handles the distribution.</span>
          </p>
        </section>

        {/* CTA block */}
        <section className="pb-24">
          <div className="relative rounded-2xl border border-white/[0.08] bg-white/[0.02] px-12 py-16 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
            <div className="absolute -top-20 -left-20 w-[400px] h-[300px] bg-white/[0.03] rounded-full blur-[100px] pointer-events-none" />
            <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold tracking-[-0.02em] mb-3">
                  Stop building in silence.
                </h2>
                <p className="text-neutral-500 text-[16px]">
                  Get started and connect GitHub in 30 seconds.
                </p>
                <p className="text-neutral-600 text-sm mt-2">
                  $19/month after early access. First 50 users locked in at <span className="text-neutral-400">$9.50/month forever.</span>
                </p>
              </div>
              <a
                href="/login"
                className="flex items-center gap-2.5 bg-white text-[#080808] font-semibold px-7 py-3.5 rounded-xl text-sm hover:bg-neutral-100 transition-all hover:shadow-[0_0_60px_rgba(255,255,255,0.15)] shrink-0"
              >
                Get Started — it&apos;s free
              </a>
            </div>
          </div>
        </section>

        {/* Founder note */}
        <section id="founder" className="pb-20 pt-10 border-t border-white/[0.06]">
          <div className="flex gap-4 items-start max-w-lg">
            <div className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/[0.1] shrink-0 flex items-center justify-center text-sm font-semibold text-neutral-400">H</div>
            <div>
              <p className="text-neutral-300 leading-relaxed mb-2">
                I&apos;m Hassan. Solo, technical, broke student, building in public.
              </p>
              <p className="text-neutral-600 text-sm leading-relaxed mb-5">
                I got tired of shipping code nobody saw. I refused to waste build time on Twitter growth hacks. So I built the tool I needed.
              </p>
              <div className="flex gap-5">
                <a href="https://x.com/CheemaEdu" target="_blank" rel="noopener noreferrer" className="text-sm text-neutral-600 hover:text-neutral-300 transition-colors">@CheemaEdu on X →</a>
                <a href="https://github.com/Hassan-Cheema/subkitt" target="_blank" rel="noopener noreferrer" className="text-sm text-neutral-600 hover:text-neutral-300 transition-colors">GitHub →</a>
              </div>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
