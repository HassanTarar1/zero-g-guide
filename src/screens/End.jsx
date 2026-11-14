import { LOCATIONS, CONSUMPTION } from '../data/nasaData'
import { finalScore } from '../lib/simulation'

export default function End({ sim, onRestart, onHome, onInfo }) {
  const loc = LOCATIONS[sim.locationKey]
  const won = sim.status === 'victory'
  const score = finalScore(sim)

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 text-center">
      <div className="text-7xl">{won ? '🏅' : '🆘'}</div>
      <h1 className={`mt-3 text-4xl font-black ${won ? 'text-lime-400' : 'text-rose-400'}`}>
        {won ? 'Mission Complete, Commander!' : 'Mission Aborted'}
      </h1>
      <p className="mt-2 text-slate-300">
        {won
          ? `You kept the crew of ${loc.flag} ${loc.name} alive for all ${loc.missionSols} sols. You're ready for a NASA mission — cadet, you've graduated.`
          : sim.gameOverReason}
      </p>

      <div className="mt-8 rounded-2xl border border-slate-700/60 bg-slate-900/70 p-6 text-left backdrop-blur">
        <h3 className="text-center font-bold text-white">📊 Final Report</h3>
        <div className="mt-4 space-y-2 text-sm text-slate-300">
          <div className="flex justify-between"><span>{loc.solLabel}s survived</span><span className="font-bold text-white">{score.survived} × 10 = {score.survival}</span></div>
          <div className="flex justify-between"><span>Credits remaining</span><span className="font-bold text-white">{sim.credits} × 2 = {score.economy}</span></div>
          <div className="flex justify-between"><span>Final crew morale</span><span className="font-bold text-white">{Math.round(sim.morale)} × 3 = {score.health}</span></div>
          <div className="flex justify-between"><span>Radiation safety bonus</span><span className="font-bold text-white">+{score.radiationBonus}</span></div>
          <div className="mt-3 flex justify-between border-t border-slate-700 pt-3 text-lg">
            <span className="font-bold text-white">TOTAL SCORE</span>
            <span className="font-black text-amber-300">{score.total}</span>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-lg bg-slate-800 p-2"><span className="block text-slate-400">Lifetime dose</span><span className="font-bold text-rose-300">{Math.round(sim.totalDose)} mSv</span></div>
          <div className="rounded-lg bg-slate-800 p-2"><span className="block text-slate-400">Modules built</span><span className="font-bold text-cyan-300">{Object.values(sim.modules).reduce((a, b) => a + b, 0)}</span></div>
          <div className="rounded-lg bg-slate-800 p-2"><span className="block text-slate-400">Crew</span><span className="font-bold text-lime-300">4 alive</span></div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button onClick={onRestart} className="rounded-xl bg-cyan-500 px-6 py-3 font-bold text-slate-950 transition hover:bg-cyan-400">🔁 Fly Again</button>
        <button onClick={onInfo} className="rounded-xl border border-slate-600 px-6 py-3 font-semibold text-slate-200 hover:border-cyan-400 hover:text-cyan-300">📡 NASA Data Used</button>
        <button onClick={onHome} className="rounded-xl border border-slate-600 px-6 py-3 font-semibold text-slate-200 hover:border-cyan-400 hover:text-cyan-300">🏠 Home</button>
      </div>
    </div>
  )
}
