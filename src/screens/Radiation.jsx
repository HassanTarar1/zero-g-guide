import { useEffect, useState } from 'react'
import { CONSUMPTION } from '../data/nasaData'
import { fetchSolarFlares, timeAgo, cachedFetch } from '../lib/astro'

const ENVIRONMENTS = [
  { id: 'iss', label: 'ISS / LEO — hab day', dose: 0.5, hint: '≈0.5 mSv/day inside the station' },
  { id: 'moon', label: 'Moon — hab day', dose: 1.4, hint: '≈1.4 mSv/day (LRO CRaTER)' },
  { id: 'mars', label: 'Mars — hab day', dose: 0.7, hint: '≈0.7 mSv/day (Curiosity RAD)' },
  { id: 'eva', label: 'EVA (spacewalk)', dose: 1.0, hint: 'suit adds ≈1 mSv per EVA hour-bundle' },
  { id: 'spe', label: 'Solar particle event', dose: 4.0, hint: 'unsheltered event ≈ several mSv' },
]

const LIMIT = CONSUMPTION.radiationCareerLimitMSv
const STORE_KEY = 'zgg-dose-log'

const PRESETS = [
  ['🧪 1 week on Mars', 'mars', 7],
  ['🧪 30 days on ISS', 'iss', 30],
  ['🚪 1 EVA', 'eva', 1],
  ['⚡ 1 SEP event', 'spe', 1],
  ['🌕 1 week on Moon', 'moon', 7],
]

export default function Radiation() {
  const [entries, setEntries] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || [] } catch { return [] }
  })
  const [env, setEnv] = useState('mars')
  const [days, setDays] = useState(1)
  const [flares, setFlares] = useState(null)

  useEffect(() => { localStorage.setItem(STORE_KEY, JSON.stringify(entries)) }, [entries])

  useEffect(() => {
    let cancelled = false
    const ctrl = new AbortController()
    cachedFetch('flr30', () => fetchSolarFlares(30, ctrl.signal))
      .then((f) => { if (!cancelled) setFlares(f) })
      .catch(() => { if (!cancelled) setFlares('err') })
    return () => { cancelled = true; ctrl.abort() }
  }, [])

  const total = entries.reduce((a, e) => a + e.dose * e.count, 0)
  const pct = Math.min(100, (total / LIMIT) * 100)
  const selected = ENVIRONMENTS.find((e) => e.id === env)

  const addEntry = (envId, count) => {
    const e = ENVIRONMENTS.find((x) => x.id === envId)
    setEntries((prev) => [{ id: Date.now() + Math.random(), env: e.id, label: e.label, dose: e.dose, count: Math.max(1, Number(count) || 1), date: new Date().toISOString() }, ...prev])
  }

  const recentBigFlare = flares && flares !== 'err' && flares.length && /X|M/.test(flares[0].classType)

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h2 className="font-display text-2xl font-black tracking-wide text-white">☢️ Radiation Manager</h2>
      <p className="text-sm text-slate-400">
        Track cumulative career dose against NASA's limit (~{LIMIT} mSv). Dose rates come from NASA measurements:
        Curiosity's RAD instrument on Mars, LRO's CRaTER at the Moon, and ISS telemetry in orbit.
      </p>

      {/* Flare watch */}
      {recentBigFlare && (
        <div className="mt-4 rounded-xl border border-amber-500/50 bg-amber-500/10 p-4">
          <p className="text-sm font-semibold text-amber-200">
            ⚠️ Solar flare watch: {flares[0].classType}-class event {timeAgo(flares[0].peakTime)}. Avoid EVA scheduling until the environment settles.
          </p>
        </div>
      )}

      {/* Dose gauge */}
      <div className="mt-4 rounded-2xl border border-slate-700/60 bg-slate-900/70 p-5 backdrop-blur">
        <div className="flex items-baseline justify-between">
          <h3 className="font-display text-sm font-bold tracking-wide text-white">CAREER DOSE LEDGER</h3>
          <span className="text-sm text-slate-400">{Math.round(total)} / {LIMIT} mSv</span>
        </div>
        <div className="mt-3 h-4 overflow-hidden rounded-full bg-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-700 ${pct > 80 ? 'bg-rose-500' : pct > 50 ? 'bg-amber-400' : 'bg-lime-400'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-1 flex justify-between text-[11px] text-slate-500">
          <span>0</span>
          <span>NASA career limit ≈ {LIMIT} mSv (varies by age & sex per NASA-STD-3001)</span>
          <span>{LIMIT}</span>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {/* Add entry */}
        <div className="rounded-2xl border border-slate-700/60 bg-slate-900/70 p-5 backdrop-blur">
          <h3 className="font-display text-sm font-bold tracking-wide text-white">LOG EXPOSURE</h3>

          {/* Quick presets */}
          <div className="mt-3 flex flex-wrap gap-2">
            {PRESETS.map(([label, envId, count]) => (
              <button
                key={label}
                onClick={() => addEntry(envId, count)}
                className="rounded-full border border-slate-600 bg-slate-950/50 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-cyan-400 hover:text-cyan-300"
              >
                {label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[10px] text-slate-500">Presets add a realistic mission-week of exposure in one tap.</p>

          <label className="mt-4 block text-xs font-semibold text-slate-400">Environment / event</label>
          <select
            value={env}
            onChange={(e) => setEnv(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-600 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-cyan-400"
          >
            {ENVIRONMENTS.map((e) => <option key={e.id} value={e.id}>{e.label}</option>)}
          </select>
          <p className="mt-1 text-[11px] text-slate-500">{selected.hint}</p>
          <label className="mt-3 block text-xs font-semibold text-slate-400">Number of days / events</label>
          <input
            type="number" min="1" max="1000" value={days}
            onChange={(e) => setDays(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-600 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-cyan-400"
          />
          <button
            onClick={() => addEntry(env, days)}
            className="mt-4 w-full rounded-xl bg-cyan-500 py-3 font-bold text-slate-950 transition hover:bg-cyan-400"
          >
            + Add {(selected.dose * (Number(days) || 1)).toFixed(1)} mSv to ledger
          </button>
          {entries.length > 0 && (
            <button onClick={() => setEntries([])} className="mt-2 w-full text-xs text-slate-500 hover:text-rose-400">Clear ledger</button>
          )}
        </div>

        {/* Ledger */}
        <div className="rounded-2xl border border-slate-700/60 bg-slate-900/70 p-5 backdrop-blur">
          <h3 className="font-display text-sm font-bold tracking-wide text-white">LEDGER ({entries.length})</h3>
          <div className="mt-3 max-h-64 space-y-1.5 overflow-y-auto pr-1">
            {entries.length === 0 && (
              <p className="text-sm text-slate-400">
                Empty. Log a simulated week on Mars (7 days) to see how a long mission eats into the career budget.
              </p>
            )}
            {entries.map((e) => (
              <div key={e.id} className="flex items-center justify-between rounded-lg bg-slate-950/50 px-3 py-2 text-sm">
                <div>
                  <p className="font-semibold text-slate-200">{e.label}</p>
                  <p className="text-[11px] text-slate-500">×{e.count} · {new Date(e.date).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-black text-amber-300">+{(e.dose * e.count).toFixed(1)}</span>
                  <button onClick={() => setEntries(entries.filter((x) => x.id !== e.id))} className="text-slate-600 hover:text-rose-400">✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Guidance */}
      <div className="mt-4 rounded-2xl border border-slate-700/60 bg-slate-900/70 p-5 backdrop-blur">
        <h3 className="font-display text-sm font-bold tracking-wide text-white">OPERATIONAL GUIDANCE</h3>
        <ul className="mt-3 list-disc space-y-2 text-sm text-slate-300">
          <li><span className="font-bold text-white">EVA is the dose multiplier:</span> a spacesuit is thin shielding — check the flare watch before every EVA.</li>
          <li><span className="font-bold text-white">Storm shelters pay for themselves:</span> water-walled shelters cut solar-event dose by ~80% — that's the same shelter module in the Trainer.</li>
          <li><span className="font-bold text-white">Destination matters:</span> the Moon is ~2× the Mars surface dose-rate because it lacks even Mars' thin atmosphere.</li>
        </ul>
      </div>
    </div>
  )
}
