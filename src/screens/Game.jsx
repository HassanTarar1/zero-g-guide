import { useEffect, useRef, useState } from 'react'
import { LOCATIONS, MODULES, CONSUMPTION, TIPS } from '../data/nasaData'
import { tick, buildModule, resolveEvent, answerQuiz, orderResupply, crewParty, batteryMax, isDaylight } from '../lib/simulation'

function Gauge({ icon, label, value, max, unit, danger }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  const C = 2 * Math.PI * 26
  const color = pct > 50 ? '#a3e635' : pct > 25 ? '#fbbf24' : '#f43f5e'
  return (
    <div className={`flex flex-col items-center rounded-xl border border-slate-700/60 bg-slate-900/70 p-2.5 backdrop-blur ${danger ? 'alert-pulse' : ''}`}>
      <div className="relative h-16 w-16">
        <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90">
          <circle cx="32" cy="32" r="26" fill="none" stroke="#1e293b" strokeWidth="6" />
          <circle
            cx="32" cy="32" r="26" fill="none" stroke={color} strokeWidth="6"
            strokeDasharray={`${(C * pct) / 100} ${C}`} strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <span className="absolute inset-0 grid place-items-center text-xl">{icon}</span>
      </div>
      <p className="mt-1 text-[11px] font-semibold text-slate-400">{label}</p>
      <p className={`text-sm font-black ${danger ? 'text-rose-400' : 'text-white'}`}>
        {Math.max(0, Math.round(value))}<span className="text-[10px] font-semibold text-slate-500">{unit}</span>
      </p>
    </div>
  )
}

/** Planet-horizon backdrop for the active mission. */
function Scene({ locationKey }) {
  const mars = locationKey === 'mars'
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-b ${mars ? 'from-[#0b1026] via-[#150d0c] to-[#2b130c]' : 'from-[#0b1026] via-[#0d1226] to-[#1e293b]'}`} />
      <div
        className={`absolute -bottom-[62%] left-1/2 h-[80vh] w-[170vw] -translate-x-1/2 rounded-[100%] ${
          mars ? 'bg-gradient-to-b from-[#b45309] via-[#7c2d12] to-[#431407]' : 'bg-gradient-to-b from-[#475569] via-[#1e293b] to-[#0f172a]'
        }`}
        style={{ boxShadow: '0 -30px 90px rgba(0,0,0,.65)' }}
      />
    </div>
  )
}

function Modal({ children }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="animate-slide-up w-full max-w-lg rounded-2xl border border-slate-600 bg-slate-900 p-6 shadow-2xl">{children}</div>
    </div>
  )
}

export default function Game({ sim, setSim, onQuit }) {
  const [showShop, setShowShop] = useState(true)
  const [auto, setAuto] = useState(false)
  const [tip] = useState(() => TIPS[Math.floor(Math.random() * TIPS.length)])
  const simRef = useRef(sim)
  simRef.current = sim

  const loc = LOCATIONS[sim.locationKey]
  const paused = sim.pendingEvent || sim.pendingQuiz || sim.lastEventResult || sim.lastQuizResult

  // Auto-fly: advance a sol every ~1.1s; stop when a decision is needed.
  useEffect(() => {
    if (!auto) return
    const id = setInterval(() => {
      const s = simRef.current
      if (
        s.status !== 'running' ||
        s.pendingEvent || s.pendingQuiz || s.lastEventResult || s.lastQuizResult
      ) {
        setAuto(false)
        return
      }
      setSim(tick(s))
    }, 1100)
    return () => clearInterval(id)
  }, [auto, setSim])

  const alerts = []
  if (sim.lastTick?.outage) alerts.push('🔌 Power outage! Build 🔆 Solar, ☢️ RTG or 🔋 Battery banks.')
  if (sim.o2 / CONSUMPTION.startO2 < 0.15) alerts.push('🫁 Oxygen critical — order a 📦 Resupply (25 cr) or build a ⚗️ O₂ Generator!')
  if (sim.water / CONSUMPTION.startWater < 0.15) alerts.push('💧 Water critical — order a 📦 Resupply (25 cr) now!')
  if (sim.food / CONSUMPTION.startFood < 0.15) alerts.push('🍲 Food critical — 📦 Resupply (25 cr) or add a 🌱 Greenhouse!')
  if (sim.morale < 25) alerts.push('😤 Morale collapsing — throw a 🎉 Movie Night (10 cr)!')
  if (sim.totalDose / CONSUMPTION.radiationCareerLimitMSv > 0.6) alerts.push('☢️ Radiation near NASA’s career limit — never work through solar flares, shelter!')

  const solPct = Math.min(100, ((sim.sol - 1) / loc.missionSols) * 100)

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <Scene locationKey={sim.locationKey} />
      {/* Header */}
      <div className="rounded-2xl border border-slate-700/60 bg-slate-900/70 p-4 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-black tracking-wide text-white">{loc.flag} {loc.name}</h1>
            <p className="text-sm text-slate-400">
              {loc.solLabel} <span className="font-bold text-cyan-300">{Math.min(sim.sol, loc.missionSols)}</span> / {loc.missionSols} ·
              Crew: {sim.crew} 🧑‍🚀 · ☢️ dose {Math.round(sim.totalDose)}/{CONSUMPTION.radiationCareerLimitMSv} mSv
              {sim.stormSols > 0 && <span className="ml-2 font-bold text-amber-300">🌪️ storm: {sim.stormSols} sols left</span>}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-500/15 px-4 py-2 text-center">
              <span className="text-xs font-semibold text-amber-200">CREDITS</span>
              <span className="ml-2 text-lg font-black text-amber-300">{sim.credits}</span>
            </div>
            <button onClick={onQuit} className="text-sm text-slate-500 hover:text-rose-400">Abort ✕</button>
          </div>
        </div>
        {/* Mission progress */}
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
          <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-lime-400 transition-all duration-700" style={{ width: `${solPct}%` }} />
        </div>
      </div>

      {/* Critical alerts */}
      {alerts.length > 0 && (
        <div className="mt-3 rounded-xl border border-rose-500/50 bg-rose-500/10 p-3">
          {alerts.map((a, i) => (
            <p key={i} className="text-sm font-semibold text-rose-200">🚨 {a}</p>
          ))}
        </div>
      )}

      {/* Gauges */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Gauge icon="🫁" label="Oxygen" value={sim.o2} max={CONSUMPTION.startO2} unit="kg" danger={sim.o2 / CONSUMPTION.startO2 < 0.2} />
        <Gauge icon="💧" label="Water" value={sim.water} max={CONSUMPTION.startWater} unit="L" danger={sim.water / CONSUMPTION.startWater < 0.2} />
        <Gauge icon="🍲" label="Food" value={sim.food} max={CONSUMPTION.startFood} unit="kg" danger={sim.food / CONSUMPTION.startFood < 0.2} />
        <Gauge icon="🔋" label="Battery" value={sim.battery} max={Math.max(1, batteryMax(sim))} unit="" danger={batteryMax(sim) > 0 && sim.battery / batteryMax(sim) < 0.2} />
        <Gauge icon="🙂" label="Morale" value={sim.morale} max={100} unit="%" danger={sim.morale < 25} />
        <Gauge icon="☀️" label="Sunlight now" value={isDaylight(sim) ? (sim.stormSols > 0 ? 20 : 100) : 0} max={100} unit="%" danger={false} />
      </div>

      {/* Main panel */}
      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        {/* Log */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-700/60 bg-slate-900/70 p-4 backdrop-blur">
          <h3 className="font-bold text-white">📋 Mission Log</h3>
          <div className="mt-2 max-h-72 space-y-1 overflow-y-auto pr-1 text-xs leading-relaxed text-slate-300">
            {sim.log.map((l, i) => (
              <p key={i} className={i === 0 ? 'text-cyan-200' : 'text-slate-400'}>{l}</p>
            ))}
          </div>
        </div>

        {/* Control panel */}
        <div className="lg:col-span-3 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setSim(tick(sim))}
              disabled={paused}
              className="glow-cyan col-span-2 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 py-4 font-display text-2xl font-black tracking-wide text-slate-950 transition hover:scale-[1.02] hover:from-cyan-300 hover:to-blue-400 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
            >
              {paused ? '⏸️ Decision pending…' : `▶ Fly Next ${loc.solLabel}`}
            </button>
            <button
              onClick={() => setAuto(!auto)}
              className={`rounded-xl px-4 py-3 font-bold transition ${
                auto ? 'bg-lime-500 text-slate-950' : 'border border-lime-500/50 text-lime-300 hover:bg-lime-500/10'
              }`}
            >
              {auto ? '⏸️ Stop auto-fly' : '⏩ Auto-fly'}
            </button>
            <button
              onClick={() => setSim(orderResupply(sim))}
              disabled={sim.credits < 25 || paused}
              className="rounded-xl border border-amber-500/50 px-4 py-3 font-bold text-amber-300 transition hover:bg-amber-500/10 disabled:opacity-30"
              title="+30 O₂, +50 water, +40 food"
            >
              📦 Resupply −25cr
            </button>
            <button
              onClick={() => setSim(crewParty(sim))}
              disabled={sim.credits < 10 || paused}
              className="rounded-xl border border-pink-500/50 px-4 py-3 font-bold text-pink-300 transition hover:bg-pink-500/10 disabled:opacity-30"
              title="+15 morale, −3 food"
            >
              🎉 Movie Night −10cr
            </button>
            <p className="col-span-2 px-1 text-xs text-slate-500">{tip}</p>
          </div>

          {/* Shop */}
          <div className="rounded-2xl border border-slate-700/60 bg-slate-900/70 p-4 backdrop-blur">
            <button onClick={() => setShowShop(!showShop)} className="flex w-full items-center justify-between font-bold text-white">
              <span>🔧 Base Construction</span>
              <span className="text-slate-400">{showShop ? '▾' : '▸'}</span>
            </button>
            {showShop && (
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {Object.values(MODULES).map((m) => {
                  const owned = sim.modules[m.id]
                  const canBuild = sim.credits >= m.cost && owned < m.max
                  return (
                    <div key={m.id} className="flex items-center gap-3 rounded-xl border border-slate-700/50 bg-slate-950/40 p-3">
                      <div className="text-2xl">{m.icon}</div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-white">{m.name} <span className="text-amber-300">×{owned}/{m.max}</span></p>
                        <p className="text-[11px] text-slate-400">{m.effect}</p>
                      </div>
                      <button
                        onClick={() => setSim(buildModule(sim, m.id))}
                        disabled={!canBuild}
                        className="shrink-0 rounded-lg bg-amber-400 px-3 py-2 text-sm font-black text-slate-950 transition hover:bg-amber-300 disabled:opacity-30"
                      >
                        +{m.cost}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Event modal */}
      {sim.pendingEvent && (
        <Modal>
          <h3 className="text-2xl font-black text-white">{sim.pendingEvent.title}</h3>
          <p className="mt-2 text-slate-300">{sim.pendingEvent.text}</p>
          <div className="mt-5 space-y-3">
            {sim.pendingEvent.choices.map((c, i) => (
              <button
                key={i}
                onClick={() => { setAuto(false); setSim(resolveEvent(sim, i)) }}
                className="w-full rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-4 py-3 text-left font-semibold text-cyan-200 transition hover:bg-cyan-500/25"
              >
                {c.label}
              </button>
            ))}
          </div>
        </Modal>
      )}

      {/* Event result */}
      {sim.lastEventResult && !sim.pendingEvent && (
        <Modal>
          <h3 className="text-xl font-black text-amber-300">{sim.lastEventResult.title} — outcome</h3>
          <p className="mt-3 text-slate-200">{sim.lastEventResult.text}</p>
          <button
            onClick={() => setSim({ ...sim, lastEventResult: null })}
            className="mt-5 w-full rounded-xl bg-cyan-500 py-3 font-bold text-slate-950 hover:bg-cyan-400"
          >
            Roger that, continuing ✔
          </button>
        </Modal>
      )}

      {/* Quiz modal */}
      {sim.pendingQuiz && !sim.pendingEvent && !sim.lastEventResult && (
        <Modal>
          <span className="rounded-full bg-lime-500/15 px-3 py-1 text-xs font-bold text-lime-300">🎓 MISSION ACADEMY</span>
          <h3 className="mt-3 text-xl font-black text-white">{sim.pendingQuiz.q}</h3>
          <div className="mt-4 space-y-2">
            {sim.pendingQuiz.options.map((o, i) => (
              <button
                key={i}
                onClick={() => { setAuto(false); setSim(answerQuiz(sim, i)) }}
                className="w-full rounded-xl border border-slate-600 px-4 py-3 text-left font-semibold text-slate-200 transition hover:border-lime-400 hover:text-lime-300"
              >
                {o}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-500">Correct answers earn +20 credits and +10 morale. Every question is real NASA science.</p>
        </Modal>
      )}

      {/* Quiz result */}
      {sim.lastQuizResult && !sim.pendingQuiz && !sim.lastEventResult && (
        <Modal>
          <h3 className={`text-2xl font-black ${sim.lastQuizResult.correct ? 'text-lime-400' : 'text-amber-300'}`}>
            {sim.lastQuizResult.correct ? '✅ Correct! +20 credits, +10 morale' : '📚 Good try, cadet!'}
          </h3>
          <p className="mt-3 text-slate-300">{sim.lastQuizResult.why}</p>
          <button
            onClick={() => setSim({ ...sim, lastQuizResult: null })}
            className="mt-5 w-full rounded-xl bg-cyan-500 py-3 font-bold text-slate-950 hover:bg-cyan-400"
          >
            Continue mission ✔
          </button>
        </Modal>
      )}
    </div>
  )
}
