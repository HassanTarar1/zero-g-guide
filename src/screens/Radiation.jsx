import { useEffect, useMemo, useState } from 'react'
import { CONSUMPTION } from '../data/nasaData'
import { fetchSolarFlares, timeAgo, cachedFetch } from '../lib/astro'

const LIMIT = CONSUMPTION.radiationCareerLimitMSv
const STORE_KEY = 'zgg-dose-log'

const SOURCES = [
  { id: 'sep', name: 'Solar particle event (SEP)', base: 150, unit: 'mSv / event', ref: 'unsheltered event-scale dose' },
  { id: 'gcr', name: 'Galactic cosmic rays (GCR)', base: 0.7, unit: 'mSv / sol', ref: 'Mars surface — Curiosity RAD' },
]

const SHIELDING = [
  { id: 'none', name: 'Unshielded', sub: 'open surface', sep: 1.0, gcr: 1.0 },
  { id: 'suit', name: 'EVA suit', sub: '≈0.3 g/cm²', sep: 0.85, gcr: 0.75 },
  { id: 'hab', name: 'Habitat wall', sub: 'aluminum / composite', sep: 0.25, gcr: 0.6 },
  { id: 'regolith', name: 'Regolith overburden', sub: '2 m loose soil', sep: 0.08, gcr: 0.08 },
  { id: 'water', name: 'Water-wall shelter', sub: 'hydrogen-rich', sep: 0.05, gcr: 0.25 },
]

const ENVIRONMENTS = [
  { id: 'iss', label: 'ISS / LEO — habitat day', dose: 0.5 },
  { id: 'moon', label: 'Moon — habitat day', dose: 1.4 },
  { id: 'mars', label: 'Mars — habitat day', dose: 0.7 },
  { id: 'eva', label: 'EVA (spacewalk)', dose: 1.0 },
  { id: 'spe', label: 'Solar particle event', dose: 4.0 },
]

const PRESETS = [
  ['1 week, Mars surface', 'mars', 7],
  ['30 days, ISS', 'iss', 30],
  ['1 EVA', 'eva', 1],
  ['1 SEP event', 'spe', 1],
  ['1 week, Moon surface', 'moon', 7],
]

const ROTATION_DOSE = { EVA: 1.2, HAB: 0.7, SHELTER: 0.25 }
const ROTATION_CYCLE = ['HAB', 'EVA', 'SHELTER']

function Section({ title, aside, children }) {
  return (
    <div className="rounded border border-slate-800 bg-[#0c1220]">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2.5">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-300">{title}</h3>
        {aside}
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

const tone = {
  low: 'text-lime-400',
  mid: 'text-amber-400',
  high: 'text-rose-400',
}

export default function Radiation() {
  // ---- Ledger ----
  const [entries, setEntries] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || [] } catch { return [] }
  })
  const [env, setEnv] = useState('mars')
  const [days, setDays] = useState(1)
  const [flares, setFlares] = useState(null)

  // ---- Shielding calculator ----
  const [sourceId, setSourceId] = useState('sep')
  const [shieldId, setShieldId] = useState('hab')

  // ---- Rotation planner ----
  const [plan, setPlan] = useState(() => Array(14).fill('HAB'))
  const [storm, setStorm] = useState(() => new Set([4, 9]))

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
  const selectedEnv = ENVIRONMENTS.find((e) => e.id === env)

  const addEntry = (envId, count) => {
    const e = ENVIRONMENTS.find((x) => x.id === envId)
    setEntries((prev) => [
      { id: Date.now() + Math.random(), env: e.id, label: e.label, dose: e.dose, count: Math.max(1, Number(count) || 1), date: new Date().toISOString() },
      ...prev,
    ])
  }

  // Calculator math
  const source = SOURCES.find((s) => s.id === sourceId)
  const shield = SHIELDING.find((s) => s.id === shieldId)
  const transmission = shield[sourceId]
  const dose = source.base * transmission
  const reduction = (1 - transmission) * 100

  // Planner math
  const counts = useMemo(() => plan.reduce((acc, t) => ({ ...acc, [t]: (acc[t] || 0) + 1 }), {}), [plan])
  const planDose = plan.reduce((a, t) => a + ROTATION_DOSE[t], 0)
  const conflicts = plan.reduce((a, t, i) => a + (storm.has(i) && t === 'EVA' ? 1 : 0), 0)

  const rerollForecast = () => {
    const a = Math.floor(Math.random() * 14)
    let b = Math.floor(Math.random() * 14)
    if (b === a) b = (b + 1) % 14
    setStorm(new Set([a, b]))
  }

  const commitPlan = () => {
    if (!counts.EVA && !counts.HAB && !counts.SHELTER) return
    setEntries((prev) => [
      {
        id: Date.now(),
        env: 'plan',
        label: `14-sol rotation (${counts.EVA || 0} EVA / ${counts.HAB || 0} habitat / ${counts.SHELTER || 0} shelter)`,
        dose: planDose,
        count: 1,
        date: new Date().toISOString(),
      },
      ...prev,
    ])
  }

  const recentBigFlare = flares && flares !== 'err' && flares.length && /X|M/.test(flares[0].classType)

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h2 className="text-xl font-bold tracking-tight text-white">Radiation Manager</h2>
      <p className="mt-1 max-w-3xl text-sm text-slate-400">
        Cumulative dose against NASA's career limit, with measured environments and shielding trade-offs.
        Dose rates: Mars ≈ 0.7 mSv/sol (Curiosity RAD), Moon ≈ 1.4 mSv/sol (LRO CRaTER), ISS ≈ 0.5 mSv/sol.
      </p>

      {recentBigFlare && (
        <div className="mt-4 rounded border border-amber-500/40 bg-amber-500/5 px-4 py-3">
          <p className="text-sm font-semibold text-amber-300">
            Flare watch — latest event {flares[0].classType}-class, {timeAgo(flares[0].peakTime)}. Defer EVA scheduling until conditions settle.
          </p>
        </div>
      )}

      {/* Career ledger gauge */}
      <Section
        title="Career dose ledger"
        aside={<span className="num text-sm text-slate-400">{Math.round(total)} / {LIMIT} mSv</span>}
      >
        <div className="h-3 overflow-hidden rounded-sm bg-slate-800">
          <div
            className={`h-full transition-all duration-700 ${pct > 80 ? 'bg-rose-500' : pct > 50 ? 'bg-amber-400' : 'bg-lime-400'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-[10px] uppercase tracking-wider text-slate-500">
          <span>0 mSv</span>
          <span>NASA career limit ≈ {LIMIT} mSv (varies by age and sex)</span>
          <span>{LIMIT} mSv</span>
        </div>
      </Section>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {/* Shielding calculator */}
        <Section title="Shielding calculator" aside={<span className="text-[10px] uppercase tracking-widest text-slate-500">transmission model</span>}>
          <div className="flex gap-1 rounded-sm border border-slate-700 p-0.5">
            {SOURCES.map((s) => (
              <button
                key={s.id}
                onClick={() => setSourceId(s.id)}
                className={`flex-1 rounded-sm px-2 py-1.5 text-[11px] font-semibold transition ${
                  sourceId === s.id ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s.id === 'sep' ? 'SEP event' : 'GCR background'}
              </button>
            ))}
          </div>

          <div className="mt-3 space-y-1.5">
            {SHIELDING.map((s) => {
              const t = Math.round(s[sourceId] * 100)
              return (
                <button
                  key={s.id}
                  onClick={() => setShieldId(s.id)}
                  className={`flex w-full items-center justify-between rounded-sm border px-3 py-2 text-left transition ${
                    shieldId === s.id ? 'border-cyan-500/60 bg-cyan-500/10' : 'border-slate-800 hover:border-slate-600'
                  }`}
                >
                  <span>
                    <span className="text-sm font-semibold text-slate-200">{s.name}</span>
                    <span className="ml-2 text-[10px] text-slate-500">{s.sub}</span>
                  </span>
                  <span className={`num text-xs font-bold ${t <= 10 ? 'text-lime-400' : t <= 40 ? 'text-amber-400' : 'text-rose-400'}`}>{t}% pass</span>
                </button>
              )
            })}
          </div>

          <div className="mt-4 rounded-sm border border-slate-800 bg-slate-950/60 p-3">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500">Crew dose inside</p>
                <p className={`num text-2xl font-bold ${dose < 5 ? 'text-lime-400' : dose < 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                  {dose.toFixed(1)} <span className="text-sm font-medium text-slate-400">{source.unit}</span>
                </p>
              </div>
              <p className="num text-right text-[11px] text-slate-500">
                {source.base} mSv × {transmission.toFixed(2)} transmission
                <span className={`block text-sm font-bold ${reduction > 70 ? 'text-lime-400' : reduction > 40 ? 'text-amber-400' : 'text-rose-400'}`}>
                  {reduction.toFixed(0)}% reduction
                </span>
              </p>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-sm bg-slate-800">
              <div className="h-full bg-cyan-500" style={{ width: `${transmission * 100}%` }} />
            </div>
            <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
              Transmission values are illustrative ranges from published NASA shielding studies. Hydrogen-rich materials
              outperform aluminum against GCR; regolith provides effective mass shielding at Mars.
            </p>
          </div>
        </Section>

        {/* Rotation planner */}
        <Section
          title="14-sol surface rotation planner"
          aside={
            <button onClick={rerollForecast} className="text-[10px] font-semibold uppercase tracking-widest text-cyan-400 hover:text-cyan-300">
              New forecast
            </button>
          }
        >
          <p className="text-[11px] text-slate-500">Tap a sol to cycle HAB → EVA → SHELTER. Storm-watch sols are flagged.</p>
          <div className="mt-3 grid grid-cols-7 gap-1.5">
            {plan.map((t, i) => {
              const isStorm = storm.has(i)
              return (
                <button
                  key={i}
                  onClick={() => setPlan((p) => p.map((v, j) => (j === i ? ROTATION_CYCLE[(ROTATION_CYCLE.indexOf(v) + 1) % 3] : v)))}
                  className={`relative rounded-sm border py-2 text-center transition ${
                    t === 'EVA'
                      ? 'border-rose-500/50 bg-rose-500/10 text-rose-300'
                      : t === 'SHELTER'
                        ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300'
                        : 'border-slate-700 bg-slate-900/60 text-slate-400'
                  }`}
                  title={`Sol ${i + 1}: ${t}${isStorm ? ' (storm watch)' : ''}`}
                >
                  <span className="num block text-[9px] text-slate-500">{i + 1}</span>
                  <span className="block text-[10px] font-bold">{t === 'SHELTER' ? 'SHL' : t}</span>
                  {isStorm && <span className="absolute right-0.5 top-0.5 h-1 w-1 rounded-full bg-amber-400" />}
                </button>
              )
            })}
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-sm bg-slate-950/60 py-2">
              <p className="text-[9px] uppercase tracking-widest text-slate-500">Plan dose</p>
              <p className="num text-sm font-bold text-white">{planDose.toFixed(1)} mSv</p>
            </div>
            <div className="rounded-sm bg-slate-950/60 py-2">
              <p className="text-[9px] uppercase tracking-widest text-slate-500">EVAs</p>
              <p className="num text-sm font-bold text-white">{counts.EVA || 0}</p>
            </div>
            <div className="rounded-sm bg-slate-950/60 py-2">
              <p className="text-[9px] uppercase tracking-widest text-slate-500">Career after</p>
              <p className="num text-sm font-bold text-white">{Math.round(total + planDose)} mSv</p>
            </div>
          </div>

          <div className={`mt-3 rounded-sm border px-3 py-2 text-xs font-semibold ${
            conflicts > 0 ? 'border-amber-500/50 bg-amber-500/10 text-amber-300' : 'border-lime-500/40 bg-lime-500/5 text-lime-300'
          }`}>
            {conflicts > 0
              ? `${conflicts} EVA${conflicts > 1 ? 's' : ''} scheduled on storm-watch sols — move to HAB or SHELTER.`
              : 'No EVA / storm conflicts. Plan is internally consistent.'}
          </div>

          <button
            onClick={commitPlan}
            className="mt-3 w-full rounded-sm bg-cyan-500 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
          >
            Commit plan to dose ledger (+{planDose.toFixed(1)} mSv)
          </button>
        </Section>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {/* Ledger entries */}
        <Section title={`Ledger — ${entries.length} entries`} aside={
          entries.length > 0 && (
            <button onClick={() => setEntries([])} className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 hover:text-rose-400">
              Clear
            </button>
          )
        }>
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map(([label, envId, count]) => (
              <button
                key={label}
                onClick={() => addEntry(envId, count)}
                className="rounded-sm border border-slate-700 px-2.5 py-1 text-[11px] font-semibold text-slate-300 transition hover:border-cyan-500/60 hover:text-cyan-300"
              >
                {label}
              </button>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <select
              value={env}
              onChange={(e) => setEnv(e.target.value)}
              className="min-w-0 flex-1 rounded-sm border border-slate-700 bg-slate-950 px-2 py-2 text-xs text-slate-200 outline-none focus:border-cyan-500"
            >
              {ENVIRONMENTS.map((e) => <option key={e.id} value={e.id}>{e.label}</option>)}
            </select>
            <input
              type="number" min="1" max="1000" value={days}
              onChange={(e) => setDays(e.target.value)}
              className="num w-16 rounded-sm border border-slate-700 bg-slate-950 px-2 py-2 text-xs text-slate-200 outline-none focus:border-cyan-500"
            />
            <button
              onClick={() => addEntry(env, days)}
              className="rounded-sm border border-slate-600 px-3 py-2 text-xs font-bold text-slate-200 transition hover:border-cyan-500 hover:text-cyan-300"
            >
              Add
            </button>
          </div>
          <div className="mt-3 max-h-56 space-y-1 overflow-y-auto pr-1">
            {entries.length === 0 && (
              <p className="text-xs text-slate-500">
                No entries. Add a preset above, or plan a rotation and commit it. Expected contribution: {(selectedEnv.dose * (Number(days) || 1)).toFixed(1)} mSv.
              </p>
            )}
            {entries.map((e) => (
              <div key={e.id} className="flex items-center justify-between rounded-sm bg-slate-950/50 px-3 py-1.5 text-xs">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-300">{e.label}</p>
                  <p className="num text-[10px] text-slate-500">×{e.count} · {new Date(e.date).toLocaleDateString()}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className={`num font-bold ${e.dose * e.count > 50 ? 'text-rose-400' : 'text-amber-300'}`}>+{(e.dose * e.count).toFixed(1)}</span>
                  <button onClick={() => setEntries(entries.filter((x) => x.id !== e.id))} className="text-slate-600 hover:text-rose-400">✕</button>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Guidance */}
        <Section title="Operational guidance">
          <ul className="space-y-2 text-sm text-slate-400">
            <li><span className="font-semibold text-slate-200">EVA is the dose multiplier.</span> A suit is thin shielding — check flare watch before every surface excursion.</li>
            <li><span className="font-semibold text-slate-200">Shelters pay for themselves.</span> A water wall cuts SEP dose by roughly 95% while staying habitable.</li>
            <li><span className="font-semibold text-slate-200">Destination sets the baseline.</span> The Moon's surface dose rate is about twice Mars' because it lacks even a thin atmosphere.</li>
            <li><span className="font-semibold text-slate-200">Aluminum is not a GCR solution.</span> Secondary neutrons from metal shielding can raise effective dose — mass and hydrogen-rich layers win.</li>
          </ul>
        </Section>
      </div>
    </div>
  )
}
