import { useEffect, useRef, useState } from 'react'
import { LOCATIONS, MODULES, CONSUMPTION, TIPS } from '../data/nasaData'
import { tick, buildModule, resolveEvent, answerQuiz, orderResupply, crewParty, batteryMax, isDaylight } from '../lib/simulation'

const strip = (s) => (s ? s.replace(/\p{Extended_Pictographic}/gu, '').replace(/\s{2,}/g, ' ').trim() : s)

function Metric({ label, value, unit, pct, danger }) {
  return (
    <div className={`border-r border-slate-800 px-3 py-2 last:border-r-0 ${danger ? 'bg-rose-500/10' : ''}`}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="kicker">{label}</span>
        <span className={`num text-[12px] ${danger ? 'text-rose-400' : 'text-slate-200'}`}>
          {value}<span className="ml-0.5 text-[9px] text-slate-600">{unit}</span>
        </span>
      </div>
      <div className="mt-1 h-[3px] bg-slate-800">
        <div
          className={`h-full ${danger ? 'bg-rose-400' : pct > 50 ? 'bg-lime-500' : 'bg-amber-400'}`}
          style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
        />
      </div>
    </div>
  )
}

function Modal({ tag, tagClass, children }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#0b0c0d]/85 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto border border-slate-600 bg-[#111214]">
        <div className="flex items-center justify-between border-b border-slate-700 px-4 py-2">
          <span className={`num text-[10px] tracking-[0.12em] ${tagClass}`}>{tag}</span>
          <span className="num text-[9px] text-slate-600">SIM / DECISION</span>
        </div>
        <div className="p-4">{children}</div>
      </div>
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

  useEffect(() => {
    if (!auto) return
    const id = setInterval(() => {
      const s = simRef.current
      if (s.status !== 'running' || s.pendingEvent || s.pendingQuiz || s.lastEventResult || s.lastQuizResult) {
        setAuto(false)
        return
      }
      setSim(tick(s))
    }, 1100)
    return () => clearInterval(id)
  }, [auto, setSim])

  const alerts = []
  if (sim.lastTick?.outage) alerts.push('Power outage. Add solar, RTG or battery capacity.')
  if (sim.o2 / CONSUMPTION.startO2 < 0.15) alerts.push('Oxygen below 15%. Order resupply or build the O₂ generator.')
  if (sim.water / CONSUMPTION.startWater < 0.15) alerts.push('Water below 15%. Order resupply.')
  if (sim.food / CONSUMPTION.startFood < 0.15) alerts.push('Food below 15%. Order resupply or add a greenhouse.')
  if (sim.morale < 25) alerts.push('Crew morale below 25%. Schedule a rest period.')
  if (sim.totalDose / CONSUMPTION.radiationCareerLimitMSv > 0.6) alerts.push('Dose above 60% of career limit. Shelter during flares.')

  const solPct = Math.min(100, ((sim.sol - 1) / loc.missionSols) * 100)

  return (
    <div className="px-5 py-4">
      <div className="max-w-5xl">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-700 pb-2.5">
          <div>
            <p className="kicker">Simulation / {loc.name}</p>
            <h1 className="mt-1 text-[15px] font-semibold text-slate-100">
              SOL <span className="num">{Math.min(sim.sol, loc.missionSols)}</span>
              <span className="text-slate-600"> / {loc.missionSols}</span>
              <span className="mx-3 text-slate-700">·</span>
              CREW <span className="num">{sim.crew}</span>
              <span className="mx-3 text-slate-700">·</span>
              DOSE <span className="num">{Math.round(sim.totalDose)}</span>
              <span className="num text-slate-600">/{CONSUMPTION.radiationCareerLimitMSv} mSv</span>
              {sim.stormSols > 0 && <span className="num ml-3 text-amber-400">STORM {sim.stormSols} SOLS</span>}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="kicker">Credits</p>
              <p className="num text-[15px] text-amber-400">{sim.credits}</p>
            </div>
            <button onClick={onQuit} className="border border-slate-700 px-2.5 py-1 text-[10px] uppercase tracking-[0.1em] text-slate-500 hover:border-rose-500/60 hover:text-rose-400">
              Abort
            </button>
          </div>
        </div>

        <div className="mt-2 h-[3px] bg-slate-800">
          <div className="h-full bg-slate-400" style={{ width: `${solPct}%` }} />
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="mt-3 border-l-2 border-rose-400 bg-rose-500/5 py-1.5 pl-3">
            {alerts.map((a, i) => (
              <p key={i} className="text-[11.5px] leading-relaxed text-rose-300">{a}</p>
            ))}
          </div>
        )}

        {/* Telemetry */}
        <div className="mt-3 grid grid-cols-2 border border-slate-800 bg-[#111214] sm:grid-cols-3 lg:grid-cols-6">
          <Metric label="O₂" value={Math.max(0, Math.round(sim.o2))} unit="kg" pct={(sim.o2 / CONSUMPTION.startO2) * 100} danger={sim.o2 / CONSUMPTION.startO2 < 0.2} />
          <Metric label="Water" value={Math.max(0, Math.round(sim.water))} unit="L" pct={(sim.water / CONSUMPTION.startWater) * 100} danger={sim.water / CONSUMPTION.startWater < 0.2} />
          <Metric label="Food" value={Math.max(0, Math.round(sim.food))} unit="kg" pct={(sim.food / CONSUMPTION.startFood) * 100} danger={sim.food / CONSUMPTION.startFood < 0.2} />
          <Metric label="Battery" value={Math.max(0, Math.round(sim.battery))} unit="" pct={(sim.battery / Math.max(1, batteryMax(sim))) * 100} danger={batteryMax(sim) > 0 && sim.battery / batteryMax(sim) < 0.2} />
          <Metric label="Morale" value={Math.round(sim.morale)} unit="%" pct={sim.morale} danger={sim.morale < 25} />
          <Metric label="Sunlight" value={isDaylight(sim) ? (sim.stormSols > 0 ? 20 : 100) : 0} unit="%" pct={isDaylight(sim) ? (sim.stormSols > 0 ? 20 : 100) : 0} danger={false} />
        </div>

        <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_380px]">
          {/* Controls */}
          <div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSim(tick(sim))}
                disabled={paused}
                className="col-span-2 bg-cyan-500 py-2.5 text-[12px] font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {paused ? 'Decision pending' : `Advance one ${loc.solLabel}`}
              </button>
              <button
                onClick={() => setAuto(!auto)}
                className={`border px-3 py-2 text-[11px] font-medium transition ${
                  auto ? 'border-lime-500/60 bg-lime-500/10 text-lime-300' : 'border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                {auto ? 'Stop auto-advance' : 'Auto-advance'}
              </button>
              <button
                onClick={() => setSim(orderResupply(sim))}
                disabled={sim.credits < 25 || paused}
                className="border border-slate-700 px-3 py-2 text-[11px] font-medium text-slate-300 transition hover:border-amber-500/60 hover:text-amber-300 disabled:opacity-30"
                title="+30 kg O₂, +50 L water, +40 kg food"
              >
                Resupply <span className="num text-amber-400">−25</span>
              </button>
              <button
                onClick={() => setSim(crewParty(sim))}
                disabled={sim.credits < 10 || paused}
                className="border border-slate-700 px-3 py-2 text-[11px] font-medium text-slate-300 transition hover:border-slate-500 disabled:opacity-30"
                title="+15 morale, −3 kg food"
              >
                Crew rest <span className="num text-amber-400">−10</span>
              </button>
              <p className="col-span-2 px-0.5 text-[10.5px] leading-snug text-slate-600">{strip(tip)}</p>
            </div>

            {/* Construction */}
            <div className="mt-3 border border-slate-800 bg-[#111214]">
              <button onClick={() => setShowShop(!showShop)} className="flex w-full items-center justify-between border-b border-slate-800 px-3 py-2">
                <span className="kicker text-slate-300">Base construction</span>
                <span className="num text-[11px] text-slate-600">{showShop ? '−' : '+'}</span>
              </button>
              {showShop && (
                <div className="grid sm:grid-cols-2">
                  {Object.values(MODULES).map((m) => {
                    const owned = sim.modules[m.id]
                    const canBuild = sim.credits >= m.cost && owned < m.max
                    return (
                      <div key={m.id} className="flex items-center gap-3 border-b border-slate-800 px-3 py-2 sm:border-r last:border-r-0">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[11.5px] text-slate-200">
                            {m.name} <span className="num ml-1 text-[10px] text-slate-500">{owned}/{m.max}</span>
                          </p>
                          <p className="text-[10px] leading-snug text-slate-600">{strip(m.effect)}</p>
                        </div>
                        <button
                          onClick={() => setSim(buildModule(sim, m.id))}
                          disabled={!canBuild}
                          className="num shrink-0 border border-slate-700 px-2 py-1 text-[10.5px] text-amber-400 transition hover:border-amber-500/60 disabled:opacity-25"
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

          {/* Log */}
          <div className="border border-slate-800 bg-[#111214]">
            <div className="flex items-center justify-between border-b border-slate-800 px-3 py-2">
              <h3 className="kicker text-slate-300">Operations log</h3>
              <span className="num text-[9.5px] text-slate-600">{sim.log.length} ENTRIES</span>
            </div>
            <div className="max-h-[320px] overflow-y-auto px-3 py-2 lg:max-h-[420px]">
              {sim.log.map((l, i) => (
                <p key={i} className={`border-b border-slate-800/60 py-1 text-[11px] leading-snug last:border-0 ${i === 0 ? 'text-slate-200' : 'text-slate-500'}`}>
                  {strip(l)}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Event */}
      {sim.pendingEvent && (
        <Modal tag="EVENT" tagClass="text-amber-400">
          <h3 className="text-[15px] font-semibold text-slate-100">{strip(sim.pendingEvent.title)}</h3>
          <p className="mt-2 text-[12.5px] leading-relaxed text-slate-400">{sim.pendingEvent.text}</p>
          <div className="mt-4 border-t border-slate-800">
            {sim.pendingEvent.choices.map((c, i) => (
              <button
                key={i}
                onClick={() => { setAuto(false); setSim(resolveEvent(sim, i)) }}
                className="flex w-full gap-3 border-b border-slate-800 px-1 py-2.5 text-left text-[12.5px] text-slate-300 transition hover:bg-[#15161a] hover:text-slate-100"
              >
                <span className="num text-[10px] text-slate-600">{i + 1}.</span>
                <span>{strip(c.label)}</span>
              </button>
            ))}
          </div>
        </Modal>
      )}

      {/* Event result */}
      {sim.lastEventResult && !sim.pendingEvent && (
        <Modal tag="OUTCOME" tagClass="text-amber-400">
          <h3 className="text-[14px] font-semibold text-amber-300">{strip(sim.lastEventResult.title)}</h3>
          <p className="mt-2 text-[12.5px] leading-relaxed text-slate-300">{sim.lastEventResult.text}</p>
          <button
            onClick={() => setSim({ ...sim, lastEventResult: null })}
            className="mt-4 w-full bg-cyan-500 py-2.5 text-[12px] font-semibold text-slate-950 hover:bg-cyan-400"
          >
            Acknowledge
          </button>
        </Modal>
      )}

      {/* Quiz */}
      {sim.pendingQuiz && !sim.pendingEvent && !sim.lastEventResult && (
        <Modal tag="KNOWLEDGE CHECK" tagClass="text-lime-400">
          <h3 className="text-[14px] font-semibold text-slate-100">{sim.pendingQuiz.q}</h3>
          <div className="mt-3 border-t border-slate-800">
            {sim.pendingQuiz.options.map((o, i) => (
              <button
                key={i}
                onClick={() => { setAuto(false); setSim(answerQuiz(sim, i)) }}
                className="flex w-full gap-3 border-b border-slate-800 px-1 py-2.5 text-left text-[12.5px] text-slate-300 transition hover:bg-[#15161a] hover:text-slate-100"
              >
                <span className="num text-[10px] text-slate-600">{String.fromCharCode(65 + i)}.</span>
                <span>{o}</span>
              </button>
            ))}
          </div>
          <p className="mt-3 text-[10.5px] text-slate-600">Correct answer: +20 credits, +10 morale. Every question cites a NASA measurement.</p>
        </Modal>
      )}

      {/* Quiz result */}
      {sim.lastQuizResult && !sim.pendingQuiz && !sim.lastEventResult && (
        <Modal tag={sim.lastQuizResult.correct ? 'CORRECT' : 'REVIEW'} tagClass={sim.lastQuizResult.correct ? 'text-lime-400' : 'text-amber-400'}>
          <h3 className={`text-[14px] font-semibold ${sim.lastQuizResult.correct ? 'text-lime-400' : 'text-amber-300'}`}>
            {sim.lastQuizResult.correct ? 'Correct. +20 credits, +10 morale' : 'Incorrect'}
          </h3>
          <p className="mt-2 text-[12.5px] leading-relaxed text-slate-300">{sim.lastQuizResult.why}</p>
          <button
            onClick={() => setSim({ ...sim, lastQuizResult: null })}
            className="mt-4 w-full bg-cyan-500 py-2.5 text-[12px] font-semibold text-slate-950 hover:bg-cyan-400"
          >
            Continue
          </button>
        </Modal>
      )}
    </div>
  )
}
