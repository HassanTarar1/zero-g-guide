import { useState } from 'react'
import { LOCATIONS, MODULES, CONSUMPTION } from '../data/nasaData'

export default function Setup({ onBack, onLaunch }) {
  const [locationKey, setLocationKey] = useState('mars')
  const [modules, setModules] = useState({ solar: 2, rtg: 0, battery: 0, recycler: 1, greenhouse: 0, shelter: 0, medbay: 0, oxygen: 0 })
  const spent = Object.entries(modules).reduce((a, [id, n]) => a + MODULES[id].cost * n, 0)
  const creditsLeft = CONSUMPTION.setupCredits - spent
  const loc = LOCATIONS[locationKey]

  const change = (id, delta) => {
    const m = MODULES[id]
    const next = modules[id] + delta
    if (next < 0 || next > m.max) return
    if (delta > 0 && m.cost > creditsLeft) return
    setModules({ ...modules, [id]: next })
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <button onClick={onBack} className="text-sm text-slate-400 hover:text-cyan-300">← Back</button>
      <h1 className="font-display mt-2 text-3xl font-black tracking-wide text-white">Mission Setup</h1>
      <p className="text-slate-400">Choose your outpost, then spend {CONSUMPTION.setupCredits} starting credits on hardware.</p>

      {/* Location picker */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {Object.values(LOCATIONS).map((l) => (
          <button
            key={l.key}
            onClick={() => setLocationKey(l.key)}
            className={`rounded-2xl border p-5 text-left transition ${
              locationKey === l.key ? 'border-cyan-400 bg-cyan-500/10 ring-2 ring-cyan-400/40' : 'border-slate-700 bg-slate-900/60 hover:border-slate-500'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`h-16 w-16 shrink-0 rounded-full ${l.key === 'mars' ? 'planet-mars' : 'planet-moon'}`} />
              <div>
                <h3 className="font-display text-lg font-bold tracking-wide text-white">{l.name}</h3>
                <p className="mt-1 text-sm text-slate-300">{l.blurb}</p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-slate-800 px-2 py-1 text-slate-300">☀️ sunlight ×{l.solarFactor}</span>
              <span className="rounded-full bg-slate-800 px-2 py-1 text-slate-300">☢️ {l.radiationMSvPerDay} mSv/day</span>
              <span className="rounded-full bg-slate-800 px-2 py-1 text-slate-300">🌡️ avg {l.avgTempC}°C</span>
              <span className="rounded-full bg-slate-800 px-2 py-1 text-slate-300">🎯 survive {l.missionSols} sols</span>
            </div>
          </button>
        ))}
      </div>

      {/* Module shop */}
      <h2 className="mt-8 text-xl font-bold text-white">🔧 Build your starting base</h2>
      <p className="mt-1 text-sm text-amber-300">
        👶 Beginner tip: 2× Solar Array + 1× Water Recycler (95 cr) is a solid start — add a ☢️ RTG or ⚗️ O₂ Generator once you earn more credits.
      </p>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {Object.values(MODULES).map((m) => (
          <div key={m.id} className="flex items-start gap-3 rounded-xl border border-slate-700/60 bg-slate-900/60 p-4">
            <div className="text-3xl">{m.icon}</div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-white">{m.name}</h4>
                <span className="rounded bg-amber-500/15 px-2 py-0.5 text-xs font-bold text-amber-300">{m.cost} cr</span>
              </div>
              <p className="mt-1 text-xs text-slate-400">{m.desc}</p>
              <div className="mt-2 flex items-center gap-2">
                <button onClick={() => change(m.id, -1)} disabled={modules[m.id] === 0}
                  className="h-8 w-8 rounded-lg bg-slate-800 font-bold text-white disabled:opacity-30">−</button>
                <span className="w-8 text-center font-bold text-white">{modules[m.id]}</span>
                <button onClick={() => change(m.id, 1)} disabled={modules[m.id] >= m.max || m.cost > creditsLeft}
                  className="h-8 w-8 rounded-lg bg-cyan-600 font-bold text-white disabled:opacity-30">+</button>
                <span className="text-xs text-slate-500">max {m.max}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Launch bar */}
      <div className="sticky bottom-4 mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-700 bg-slate-900/90 p-4 shadow-xl backdrop-blur">
        <div>
          <p className="text-sm text-slate-400">Destination: <span className="font-bold text-white">{loc.flag} {loc.name}</span></p>
          <p className="text-sm text-slate-400">
            Credits left: <span className={creditsLeft < 0 ? 'font-bold text-rose-400' : 'font-bold text-lime-400'}>{creditsLeft}</span>
            {creditsLeft < 0 && ' — overspent! Remove a module.'}
          </p>
        </div>
        <button
          onClick={() => onLaunch(locationKey, modules, creditsLeft)}
          disabled={creditsLeft < 0}
          className="glow-amber rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-8 py-3 font-display text-lg font-black tracking-wide text-slate-950 transition hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
        >
          🚀 Launch Mission
        </button>
      </div>
    </div>
  )
}
