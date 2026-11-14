import { useState } from 'react'
import { PROTOCOLS } from '../data/protocols'

const SEV = {
  CRITICAL: 'text-rose-400',
  HIGH: 'text-orange-400',
  MODERATE: 'text-amber-400',
}

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
    <div className="px-5 py-5">
      <div className="max-w-4xl">
        <p className="kicker">Procedures / Autonomous operations</p>
        <div className="mt-1 border-b border-slate-700 pb-3">
          <h1 className="text-[17px] font-semibold tracking-tight text-slate-100">Emergency checklists</h1>
          <p className="mt-1 max-w-[80ch] text-[12.5px] leading-relaxed text-slate-500">
            Eight procedures for the interval when Earth cannot answer. Compiled from publicly documented NASA and ISS
            practice. A training aid, not a flight rule.
          </p>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter: fire, leak, CO₂, radiation, power, medical, delay, dust"
            className="w-full border border-slate-700 bg-slate-950 px-3 py-2 text-[12px] text-slate-100 outline-none placeholder:text-slate-600 focus:border-cyan-400"
          />
          <span className="num shrink-0 text-[10px] text-slate-600">{list.length} / {PROTOCOLS.length}</span>
        </div>

        <div className="mt-3 border-t border-slate-700">
          {list.map((p) => {
            const open = openId === p.id
            return (
              <div key={p.id} className="border-b border-slate-800">
                <button
                  onClick={() => setOpenId(open ? null : p.id)}
                  className="grid w-full grid-cols-[74px_1fr_18px] items-baseline gap-3 py-2.5 text-left transition hover:bg-[#131417]"
                >
                  <span className={`num text-[9.5px] uppercase tracking-[0.1em] ${SEV[p.severity] ?? 'text-slate-500'}`}>
                    {p.severity}
                  </span>
                  <span>
                    <span className="block text-[13px] font-medium text-slate-100">{p.title}</span>
                    <span className="mt-0.5 block text-[10.5px] text-slate-600">{p.tag} · {p.steps.length} steps</span>
                  </span>
                  <span className="num text-right text-[11px] text-slate-600">{open ? '−' : '+'}</span>
                </button>

                {open && (
                  <div className="pb-4 pl-[86px] pr-1">
                    <ol className="space-y-1.5">
                      {p.steps.map((s, i) => (
                        <li key={i} className="flex gap-3 text-[12.5px] leading-relaxed text-slate-300">
                          <span className="num w-3 shrink-0 text-slate-600">{i + 1}.</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ol>
                    <div className="mt-3 border-l-2 border-slate-700 pl-3">
                      <p className="text-[11.5px] leading-relaxed text-slate-400">
                        <span className="text-slate-300">Why. </span>{p.why}
                      </p>
                      <p className="mt-1 kicker text-slate-600">Source · {p.source}</p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
          {list.length === 0 && <p className="py-4 text-[12px] text-slate-500">No procedure matches "{query}".</p>}
        </div>
      </div>
    </div>
  )
}
