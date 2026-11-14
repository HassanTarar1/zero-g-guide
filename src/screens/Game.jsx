import { useState } from 'react'
import { LOCATIONS, MODULES, CONSUMPTION } from '../data/nasaData'
import { tick, buildModule, resolveEvent, answerQuiz, batteryMax, isDaylight } from '../lib/simulation'

function Gauge({ icon, label, value, max, unit, danger }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  const color = pct > 50 ? 'bg-lime-400' : pct > 25 ? 'bg-amber-400' : 'bg-rose-500'
  return (
    <div className={`rounded-xl border border-slate-700/60 bg-slate-900/70 p-3 backdrop-blur ${danger ? 'alert-pulse' : ''}`}>
      <div className="flex items-baseline justify-between">
        <span className="text-xs font-semibold text-slate-400">{icon} {label}</span>
        <span className={`text-sm font-black ${danger ? 'text-rose-400' : 'text-white'}`}>
          {Math.max(0, Math.round(value))}<span className="text-[10px] font-semibold text-slate-500">{unit}</span>
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
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
  const loc = LOCATIONS[sim.locationKey]
  const paused = sim.pendingEvent || sim.pendingQuiz

  const nextSol = () => {
    if (paused) return
    setSim(tick(sim))
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-700/60 bg-slate-900/70 p-4 backdrop-blur">
        <div>
          <h1 className="text-xl font-black text-white">{loc.flag} {loc.name}</h1>
          <p className="text-sm text-slate-400">
            {loc.solLabel} <span className="font-bold text-cyan-300">{Math.min(sim.sol, loc.missionSols)}</span> / {loc.missionSols} ·
            Crew: {sim.crew} · ☢️ lifetime dose {Math.round(sim.totalDose)}/{CONSUMPTION.radiationCareerLimitMSv} mSv
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
          <button
            onClick={nextSol}
            disabled={paused}
            className="w-full rounded-2xl bg-cyan-500 py-5 text-2xl font-black text-slate-950 shadow-lg shadow-cyan-500/25 transition hover:scale-[1.02] hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
          >
            {paused ? '⏸️ Decision pending…' : '▶ Fly Next ' + loc.solLabel}
          </button>

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
                onClick={() => setSim(resolveEvent(sim, i))}
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
                onClick={() => setSim(answerQuiz(sim, i))}
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
