import { LOCATIONS } from '../data/nasaData'
import { finalScore } from '../lib/simulation'

export default function End({ sim, onRestart, onHome, onInfo }) {
  const loc = LOCATIONS[sim.locationKey]
  const won = sim.status === 'victory'
  const score = finalScore(sim)

  return (
    <div className="px-5 py-8">
      <div className="max-w-2xl">
        <p className="kicker">Simulation / Debrief</p>
        <div className="mt-1 flex flex-wrap items-baseline justify-between gap-3 border-b border-slate-700 pb-3">
          <h1 className="text-[20px] font-semibold tracking-tight text-slate-100">
            {won ? 'Mission complete' : 'Mission terminated'}
          </h1>
          <span className={`num text-[11px] uppercase tracking-[0.12em] ${won ? 'text-lime-400' : 'text-rose-400'}`}>
            {won ? 'OBJECTIVE MET' : 'OBJECTIVE FAILED'}
          </span>
        </div>

        <p className="mt-3 max-w-[70ch] text-[12.5px] leading-relaxed text-slate-400">
          {won
            ? `${loc.name} outpost sustained for ${loc.missionSols} sols on the assigned consumables and dose budget.`
            : sim.gameOverReason}
        </p>

        <h2 className="kicker mt-5">Final report</h2>
        <table className="mt-1.5 w-full border-collapse text-[12px]">
          <tbody>
            {[
              [`${loc.solLabel}s survived`, `${score.survived} × 10`, score.survival],
              ['Credits remaining', `${sim.credits} × 2`, score.economy],
              ['Crew morale', `${Math.round(sim.morale)} × 3`, score.health],
              ['Radiation safety', '—', `+${score.radiationBonus}`],
            ].map(([k, mid, v]) => (
              <tr key={k} className="border-b border-slate-800">
                <td className="py-1.5 text-slate-400">{k}</td>
                <td className="num py-1.5 text-right text-slate-600">{mid}</td>
                <td className="num w-24 py-1.5 text-right text-slate-200">{v}</td>
              </tr>
            ))}
            <tr className="border-b border-slate-700">
              <td className="py-2 text-[12.5px] font-semibold text-slate-100">Total score</td>
              <td />
              <td className="num py-2 text-right text-[15px] font-semibold text-amber-400">{score.total}</td>
            </tr>
          </tbody>
        </table>

        <div className="mt-4 grid grid-cols-3 border border-slate-800 bg-[#111214] text-center">
          {[
            ['Lifetime dose', `${Math.round(sim.totalDose)} mSv`],
            ['Modules built', Object.values(sim.modules).reduce((a, b) => a + b, 0)],
            ['Crew', sim.crew],
          ].map(([k, v]) => (
            <div key={k} className="border-r border-slate-800 px-2 py-2 last:border-r-0">
              <p className="kicker">{k}</p>
              <p className="num mt-1 text-[12px] text-slate-200">{v}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button onClick={onRestart} className="bg-cyan-500 px-4 py-2 text-[12px] font-semibold text-slate-950 hover:bg-cyan-400">
            Run again
          </button>
          <button onClick={onInfo} className="border border-slate-700 px-4 py-2 text-[12px] text-slate-300 hover:border-slate-500">
            Data sources
          </button>
          <button onClick={onHome} className="border border-slate-700 px-4 py-2 text-[12px] text-slate-300 hover:border-slate-500">
            Simulation home
          </button>
        </div>
      </div>
    </div>
  )
}
