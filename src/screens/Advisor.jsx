import { useState } from 'react'
import { PROTOCOLS, SEVERITY_STYLES } from '../data/protocols'

export default function Advisor() {
  const [query, setQuery] = useState('')
  const [openId, setOpenId] = useState(null)

  const q = query.trim().toLowerCase()
  const list = PROTOCOLS.filter(
    (p) =>
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.tag.toLowerCase().includes(q) ||
      p.steps.some((s) => s.toLowerCase().includes(q)),
  )

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <h2 className="text-xl font-bold tracking-tight text-white">Protocol Advisor</h2>
      <p className="text-sm text-slate-400">
        Emergency & operations checklists for the moment when Earth can't answer. Built from publicly documented
        NASA/ISS procedures — a training aid, not official flight rules.
      </p>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search: fire, leak, CO₂, radiation, power, medical, delay, dust…"
        className="mt-4 w-full rounded-xl border border-slate-600 bg-slate-950/70 px-4 py-3 text-white outline-none backdrop-blur focus:border-cyan-400"
      />

      <div className="mt-4 space-y-3">
        {list.map((p) => {
          const open = openId === p.id
          return (
            <div key={p.id} className="rounded-2xl border border-slate-700/60 bg-slate-900/70 backdrop-blur">
              <button
                onClick={() => setOpenId(open ? null : p.id)}
                className="flex w-full items-center justify-between gap-3 p-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black tracking-wider ${SEVERITY_STYLES[p.severity]}`}>
                    {p.severity}
                  </span>
                  <div>
                    <p className="font-bold text-white">{p.title}</p>
                    <p className="text-[11px] text-slate-500">{p.tag} · {p.steps.length} steps</p>
                  </div>
                </div>
                <span className="text-slate-400">{open ? '▾' : '▸'}</span>
              </button>
              {open && (
                <div className="animate-slide-up border-t border-slate-700/60 p-4">
                  <ol className="space-y-2">
                    {p.steps.map((s, i) => (
                      <li key={i} className="flex gap-3 text-sm text-slate-300">
                        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-cyan-500/15 text-xs font-black text-cyan-300">{i + 1}</span>
                        <span className="leading-relaxed">{s}</span>
                      </li>
                    ))}
                  </ol>
                  <div className="mt-4 rounded-xl bg-slate-950/50 p-3">
                    <p className="text-xs text-slate-400"><span className="font-bold text-amber-300">Why: </span>{p.why}</p>
                    <p className="mt-1 text-[11px] text-slate-500">Source: {p.source}</p>
                  </div>
                </div>
              )}
            </div>
          )
        })}
        {list.length === 0 && <p className="text-sm text-slate-400">No protocol matches "{query}".</p>}
      </div>
    </div>
  )
}
