'use client';

import { useState, useCallback } from 'react';
import {
  PROPOSALS,
  REGIONS,
  SURVEY_URL,
  EMAIL_FALLBACK,
  DEADLINE,
  Proposal,
  Region,
  Stance,
} from '@/lib/proposals';

// ─── Impact badge colours ───────────────────────────────────────────────────
const impactColour: Record<string, string> = {
  High:   'bg-red-100 text-red-800 border-red-200',
  Medium: 'bg-amber-100 text-amber-800 border-amber-200',
  Low:    'bg-green-100 text-green-700 border-green-200',
};

const typeColour: Record<string, string> = {
  Conservation: 'bg-forest text-white',
  Clarification:'bg-slate-500 text-white',
  Enforcement:  'bg-river text-white',
  Management:   'bg-sage text-white',
  Relevancy:    'bg-parchment text-bark border border-bark/20',
};

// ─── Proposal Card ─────────────────────────────────────────────────────────
function ProposalCard({ p, onClick }: { p: Proposal; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="proposal-card text-left w-full bg-white border border-parchment rounded-lg p-5 flex flex-col gap-3 cursor-pointer hover:border-forest/30"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-xs text-slate font-medium tracking-widest">
          #{String(p.id).padStart(2, '0')}
        </span>
        <span className={`text-xs font-mono px-2 py-0.5 rounded-full border ${impactColour[p.impact]}`}>
          {p.impact} impact
        </span>
      </div>

      <h3 className="font-display font-semibold text-bark leading-snug" style={{ fontSize: '1.05rem' }}>
        {p.title}
      </h3>

      <p className="text-sm text-slate leading-relaxed line-clamp-3">{p.change}</p>

      <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
        <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${typeColour[p.type]}`}>
          {p.type}
        </span>
        {p.species.slice(0, 2).map((s) => (
          <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-mist text-slate font-mono">
            {s}
          </span>
        ))}
      </div>
    </button>
  );
}

// ─── Step indicators ────────────────────────────────────────────────────────
function Steps({ current }: { current: 1 | 2 | 3 }) {
  const steps = ['Understand', 'Your take', 'Draft & send'];
  return (
    <div className="flex items-center gap-0 mb-6">
      {steps.map((label, i) => {
        const n = i + 1;
        const done    = n < current;
        const active  = n === current;
        return (
          <div key={label} className="flex items-center gap-0 flex-1">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-medium border-2 ${
                  done   ? 'bg-forest border-forest text-white' :
                  active ? 'bg-clay border-clay text-white' :
                           'bg-cream border-parchment text-slate'
                }`}
              >
                {done ? '✓' : n}
              </div>
              <span className={`text-xs font-mono whitespace-nowrap ${active ? 'text-clay font-medium' : 'text-slate'}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 mb-5 ${done ? 'bg-forest' : 'bg-parchment'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Comment Modal ──────────────────────────────────────────────────────────
function CommentModal({ proposal, onClose }: { proposal: Proposal; onClose: () => void }) {
  const [step, setStep]       = useState<1 | 2 | 3>(1);
  const [stance, setStance]   = useState<Stance | null>(null);
  const [whyCare, setWhyCare] = useState('');
  const [draft, setDraft]     = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied]   = useState(false);
  const [error, setError]     = useState('');

  const generateDraft = useCallback(async () => {
    if (!stance) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposalId: proposal.id, stance, whyCare }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setDraft(data.comment);
      setStep(3);
    } catch (e) {
      setError('Could not generate comment. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [proposal.id, stance, whyCare]);

  const copyAndOpen = () => {
    navigator.clipboard.writeText(draft).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
    window.open(SURVEY_URL, '_blank');
  };

  const emailFallback = () => {
    const subject = encodeURIComponent(`Public Comment – Proposal ${proposal.id}: ${proposal.title}`);
    const body = encodeURIComponent(
      `To: FWP Fishing Regulations Scoping\n\nProposal ${proposal.id}: ${proposal.title}\n\n${draft}\n\n---\nSubmitted via FWP comment portal`
    );
    window.open(`mailto:${EMAIL_FALLBACK}?subject=${subject}&body=${body}`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ backgroundColor: 'rgba(27,58,45,0.55)', backdropFilter: 'blur(3px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="slide-up bg-cream w-full sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-forest text-cream p-5 rounded-t-2xl sm:rounded-t-2xl flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-sage text-xs tracking-widest mb-0.5">PROPOSAL #{String(proposal.id).padStart(2, '0')}</p>
            <h2 className="font-display text-xl leading-tight">{proposal.title}</h2>
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {proposal.regions.slice(0, 2).map((r) => (
                <span key={r} className="text-xs font-mono bg-forest/60 border border-sage/30 text-sage px-2 py-0.5 rounded-full">
                  {r}
                </span>
              ))}
            </div>
          </div>
          <button onClick={onClose} className="text-sage hover:text-cream transition-colors mt-1 text-2xl leading-none flex-shrink-0">
            ×
          </button>
        </div>

        <div className="p-5 sm:p-6 flex flex-col gap-5">
          <Steps current={step} />

          {/* Step 1 – Understand the proposal */}
          {step === 1 && (
            <div className="fade-in flex flex-col gap-4">
              <div className="bg-parchment border border-clay/20 rounded-lg p-4">
                <p className="font-mono text-xs text-clay tracking-widest mb-2 uppercase">What changes</p>
                <p className="text-bark leading-relaxed">{proposal.change}</p>
              </div>

              <div className="bg-white border border-parchment rounded-lg p-4">
                <p className="font-mono text-xs text-slate tracking-widest mb-2 uppercase">Why FWP proposes this</p>
                <p className="text-slate leading-relaxed text-[0.95rem]">{proposal.rationale}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <div>
                  <p className="font-mono text-xs text-slate mb-1">Species affected</p>
                  <div className="flex flex-wrap gap-1">
                    {proposal.species.map((s) => (
                      <span key={s} className="text-xs bg-mist text-slate px-2 py-0.5 rounded-full font-mono">{s}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="font-mono text-xs text-slate mb-1">Water</p>
                  <span className="text-xs bg-river/10 text-river px-2 py-0.5 rounded-full font-mono">{proposal.waterbody}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 bg-clay text-white font-mono font-medium py-3 px-5 rounded-lg hover:bg-amber-600 transition-colors text-sm"
                >
                  I want to comment →
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-3 border border-parchment text-slate font-mono text-sm rounded-lg hover:bg-parchment transition-colors"
                >
                  Skip
                </button>
              </div>
            </div>
          )}

          {/* Step 2 – Stance + why you care */}
          {step === 2 && (
            <div className="fade-in flex flex-col gap-5">
              <div>
                <p className="font-mono text-xs text-slate tracking-widest mb-3 uppercase">Your position on this proposal</p>
                <div className="flex gap-3 flex-wrap">
                  {(['Support', 'Oppose', 'Modify'] as Stance[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setStance(s)}
                      className={`stance-btn flex-1 py-3 px-4 rounded-lg border-2 font-mono font-medium text-sm transition-all ${
                        stance === s
                          ? s === 'Support' ? 'active-support' : s === 'Oppose' ? 'active-oppose' : 'active-modify'
                          : 'border-parchment text-slate hover:border-slate'
                      }`}
                    >
                      {s === 'Support' ? '✓ Support' : s === 'Oppose' ? '✗ Oppose' : '↗ Modify'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-mono text-xs text-slate tracking-widest mb-2 uppercase">
                  Why do you care about this? <span className="text-parchment normal-case">(optional — makes your comment unique)</span>
                </label>
                <textarea
                  value={whyCare}
                  onChange={(e) => setWhyCare(e.target.value)}
                  placeholder="e.g. I've fished the Vermillion every June for 15 years and the cutthroat population has visibly declined since the bait-fishing crowd found it…"
                  rows={4}
                  maxLength={600}
                  className="w-full bg-white border border-parchment rounded-lg p-3 text-bark placeholder-slate/50 focus:outline-none focus:border-forest resize-none text-[1rem] leading-relaxed font-body"
                />
                <p className="text-xs text-slate/60 font-mono mt-1">{whyCare.length}/600</p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm font-mono">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="px-5 py-3 border border-parchment text-slate font-mono text-sm rounded-lg hover:bg-parchment transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={generateDraft}
                  disabled={!stance || loading}
                  className="flex-1 bg-forest text-cream font-mono font-medium py-3 px-5 rounded-lg hover:bg-forest/90 transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="spinner w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <circle cx="12" cy="12" r="10" strokeOpacity={0.25} />
                        <path d="M12 2a10 10 0 0 1 10 10" />
                      </svg>
                      Drafting your comment…
                    </>
                  ) : (
                    'Draft my comment →'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 3 – Review draft + submit */}
          {step === 3 && (
            <div className="fade-in flex flex-col gap-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-mono text-xs text-slate tracking-widest uppercase">Your draft</p>
                  <button
                    onClick={generateDraft}
                    className="text-xs font-mono text-river hover:text-forest transition-colors"
                  >
                    ↻ Regenerate
                  </button>
                </div>
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={10}
                  className="w-full bg-white border border-parchment rounded-lg p-4 text-bark focus:outline-none focus:border-forest resize-none text-[1rem] leading-relaxed font-body"
                />
                <p className="text-xs text-slate/60 font-mono mt-1">Edit freely — make it yours before sending.</p>
              </div>

              {/* How to submit instructions */}
              <div className="bg-forest/5 border border-forest/15 rounded-lg p-4">
                <p className="font-mono text-xs text-forest tracking-widest mb-2 uppercase">How to submit</p>
                <ol className="text-sm text-slate space-y-1.5 list-decimal list-inside leading-relaxed">
                  <li>Click <strong className="text-bark">Copy & Open Survey</strong> — your comment copies to clipboard and the FWP survey opens in a new tab.</li>
                  <li>In the survey, select <strong className="text-bark">Proposal {proposal.id}</strong> from the dropdown.</li>
                  <li>Paste your comment into the text box and hit <strong className="text-bark">Submit</strong>.</li>
                </ol>
                <p className="text-xs text-slate/70 font-mono mt-3">Deadline: {DEADLINE}</p>
              </div>

              <div className="flex gap-3 flex-col sm:flex-row">
                <button
                  onClick={copyAndOpen}
                  className="flex-1 bg-forest text-cream font-mono font-medium py-3 px-5 rounded-lg hover:bg-forest/90 transition-colors text-sm flex items-center justify-center gap-2"
                >
                  {copied ? (
                    <><span>✓</span> Copied! Survey is opening…</>
                  ) : (
                    <><span>📋</span> Copy &amp; Open Survey</>
                  )}
                </button>
                <button
                  onClick={emailFallback}
                  className="px-5 py-3 border border-parchment text-slate font-mono text-sm rounded-lg hover:bg-parchment transition-colors whitespace-nowrap"
                >
                  ✉ Send by email
                </button>
              </div>

              <button
                onClick={() => setStep(2)}
                className="text-xs font-mono text-slate/60 hover:text-slate transition-colors text-center"
              >
                ← Change stance or why you care
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function Home() {
  const [activeRegion, setActiveRegion] = useState<Region | 'All'>('Region 1 – Northwest');
  const [selected, setSelected] = useState<Proposal | null>(null);
  const [search, setSearch] = useState('');

  const filtered = PROPOSALS.filter((p) => {
    const matchRegion =
      activeRegion === 'All' ||
      p.regions.includes(activeRegion) ||
      p.regions.includes('Statewide');
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.waterbody.toLowerCase().includes(q) ||
      p.species.some((s) => s.toLowerCase().includes(q));
    return matchRegion && matchSearch;
  });

  const regionTabs: Array<Region | 'All'> = [
    'All',
    'Region 1 – Northwest',
    'Region 2 – Missoula',
    'Region 3 – Southwest',
    'Region 4 – Central',
    'Region 5 – Southeast',
    'Region 6 – Northeast',
    'Region 7 – Eastern',
  ];

  return (
    <div className="min-h-screen">
      {/* ── Header ── */}
      <header style={{ background: 'var(--forest)' }} className="text-cream">
        <div className="max-w-5xl mx-auto px-5 py-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="font-mono text-sage text-xs tracking-widest mb-2 uppercase">Montana Fish, Wildlife &amp; Parks</p>
              <h1 className="font-display text-3xl sm:text-4xl font-bold leading-tight">
                2027–28 Fishing<br className="sm:hidden" /> Regulation Comments
              </h1>
              <p className="text-sage mt-2 text-[1rem]">
                41 proposals · Public comment open through <strong className="text-cream">{DEADLINE}</strong>
              </p>
            </div>
            <div className="bg-forest/50 border border-sage/20 rounded-lg p-3 text-sm font-mono text-sage flex-shrink-0">
              <p className="text-xs uppercase tracking-widest text-sage/70 mb-1">Days remaining</p>
              <DaysLeft />
            </div>
          </div>
        </div>
      </header>

      {/* ── Region tabs ── */}
      <div style={{ background: 'var(--bark)' }} className="sticky top-0 z-40 shadow-md overflow-x-auto">
        <div className="max-w-5xl mx-auto px-5">
          <div className="flex gap-0 min-w-max">
            {regionTabs.map((r) => (
              <button
                key={r}
                onClick={() => setActiveRegion(r)}
                className={`px-4 py-3 text-xs font-mono whitespace-nowrap transition-colors border-b-2 ${
                  activeRegion === r
                    ? 'border-clay text-clay'
                    : 'border-transparent text-cream/60 hover:text-cream'
                }`}
              >
                {r === 'All' ? 'All Regions' : r.replace(' – ', '\u00A0')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Search + count ── */}
      <div className="max-w-5xl mx-auto px-5 py-5 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <p className="text-slate font-mono text-sm">
          Showing <strong className="text-bark">{filtered.length}</strong> proposals
          {activeRegion !== 'All' && <> for <span className="text-river">{activeRegion}</span></>}
          {activeRegion === 'All' && ' statewide'}
          {activeRegion !== 'All' && activeRegion !== 'Statewide' && (
            <span className="text-slate/60"> (includes statewide proposals)</span>
          )}
        </p>
        <input
          type="search"
          placeholder="Search by species, water, or keyword…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-white border border-parchment rounded-lg px-3 py-2 text-sm font-mono text-bark placeholder-slate/50 focus:outline-none focus:border-forest w-full sm:w-64"
        />
      </div>

      {/* ── Grid ── */}
      <main className="max-w-5xl mx-auto px-5 pb-16">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-slate font-mono">
            No proposals match your search.{' '}
            <button onClick={() => setSearch('')} className="text-river hover:underline">
              Clear search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((p) => (
              <ProposalCard key={p.id} p={p} onClick={() => setSelected(p)} />
            ))}
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer style={{ background: 'var(--parchment)', borderTop: '1px solid #EDE7D6' }} className="py-8">
        <div className="max-w-5xl mx-auto px-5 flex flex-col sm:flex-row gap-3 justify-between items-center text-sm text-slate font-mono">
          <p>Comments go directly to Montana FWP — not stored by this app.</p>
          <div className="flex gap-4">
            <a href={SURVEY_URL} target="_blank" rel="noreferrer" className="hover:text-forest transition-colors">
              FWP Survey ↗
            </a>
            <a href={`mailto:${EMAIL_FALLBACK}`} className="hover:text-forest transition-colors">
              {EMAIL_FALLBACK}
            </a>
          </div>
        </div>
      </footer>

      {/* ── Modal ── */}
      {selected && <CommentModal proposal={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

// ── Countdown ───────────────────────────────────────────────────────────────
function DaysLeft() {
  const deadline = new Date('2026-05-31T23:59:59-06:00');
  const now = new Date();
  const days = Math.max(0, Math.ceil((deadline.getTime() - now.getTime()) / 86400000));
  return (
    <span className="text-2xl font-display font-bold text-cream">
      {days} <span className="text-sm font-mono font-normal text-sage">days</span>
    </span>
  );
}
