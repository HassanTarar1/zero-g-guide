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
    <div className="px-5 py-5">
      <div className="max-w-4xl pb-24">
        <button onClick={onBack} className="text-[11px] text-slate-500 hover:text-slate-300">← Back</button>
        <p className="kicker mt-3">Simulation / Configuration</p>
        <div className="mt-1 border-b border-slate-700 pb-3">
          <h1 className="text-[17px] font-semibold tracking-tight text-slate-100">Mission setup</h1>
          <p className="mt-1 max-w-[80ch] text-[12.5px] leading-relaxed text-slate-500">
            Select a station, then allocate {CONSUMPTION.setupCredits} credits of hardware. Consumption rates and
            radiation values are fixed by the selected environment.
          </p>
        </div>

        {/* Station */}
        <h2 className="kicker mt-4">Station</h2>
        <div className="mt-1.5 border-t border-slate-700">
          {Object.values(LOCATIONS).map((l) => {
            const on = locationKey === l.key
            return (
              <button
                key={l.key}
                onClick={() => setLocationKey(l.key)}
                className={`block w-full border-b border-l-2 px-3 py-3 text-left transition ${
                  on
                    ? 'border-b-slate-800 border-l-cyan-400 bg-[#15161a]'
                    : 'border-b-slate-800 border-l-transparent hover:bg-[#131417]'
                }`}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-[13px] font-semibold text-slate-100">{l.name}</h3>
                  <span className="num text-[10px] text-slate-600">{l.missionSols} SOLS</span>
                </div>
                <p className="mt-1 max-w-[76ch] text-[12px] leading-relaxed text-slate-400">{l.blurb}</p>
                <div className="num mt-1.5 flex flex-wrap gap-x-5 gap-y-0.5 text-[10.5px] text-slate-500">
                  <span>SUN ×{l.solarFactor}</span>
                  <span>{l.radiationMSvPerDay} mSv/sol</span>
                  <span>AVG {l.avgTempC} °C</span>
                  <span>ENDURANCE {l.missionSols} sols</span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Hardware */}
        <div className="mt-5 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="kicker">Hardware</h2>
          <span className="num text-[10px] text-slate-500">
            CREDITS {creditsLeft} / {CONSUMPTION.setupCredits}
          </span>
        </div>
        <p className="mt-1 text-[11.5px] text-slate-500">
          Starting loadout in use: 2 solar arrays + 1 water recycler. An RTG covers the lunar night.
        </p>

        <div className="mt-1.5 border-t border-slate-700">
          {Object.values(MODULES).map((m) => (
            <div key={m.id} className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-slate-800 py-2.5">
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-3">
                  <h3 className="text-[12.5px] font-medium text-slate-100">{m.name}</h3>
                  <span className="num text-[10px] text-amber-400">{m.cost} cr</span>
                  <span className="num text-[10px] text-slate-600">max {m.max}</span>
                </div>
                <p className="mt-0.5 max-w-[70ch] text-[11.5px] leading-snug text-slate-500">{m.desc}</p>
              </div>
              <div className="flex items-center gap-0">
                <button
                  onClick={() => change(m.id, -1)}
                  disabled={modules[m.id] === 0}
                  className="h-7 w-7 border border-slate-700 text-[13px] text-slate-300 transition hover:border-slate-500 disabled:opacity-25"
                >
                  −
                </button>
                <span className="num w-9 text-center text-[12px] text-slate-100">{modules[m.id]}</span>
                <button
                  onClick={() => change(m.id, 1)}
                  disabled={modules[m.id] >= m.max || m.cost > creditsLeft}
                  className="h-7 w-7 border border-slate-700 text-[13px] text-slate-300 transition hover:border-cyan-400 hover:text-cyan-300 disabled:opacity-25"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Launch bar */}
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-700 bg-[#0d0e10]/95 px-5 py-3 backdrop-blur md:left-52">
          <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4">
            <div className="num text-[10.5px] text-slate-500">
              <span className="text-slate-300">{loc.name}</span>
              <span className="mx-2 text-slate-700">|</span>
              CREDITS <span className={creditsLeft < 0 ? 'text-rose-400' : 'text-lime-400'}>{creditsLeft}</span>
              {creditsLeft < 0 && <span className="ml-2 text-rose-400">OVERSPENT</span>}
            </div>
            <button
              onClick={() => onLaunch(locationKey, modules, creditsLeft)}
              disabled={creditsLeft < 0}
              className="bg-cyan-500 px-5 py-2 text-[12px] font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-40"
            >
              Launch mission
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
