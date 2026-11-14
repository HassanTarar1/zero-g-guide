import { LOCATIONS } from '../data/nasaData'

export default function TrainerHub({ onStart, onInfo }) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h2 className="text-xl font-bold tracking-tight text-white">Comm-Delay Simulation</h2>
      <p className="mt-1 max-w-3xl text-sm text-slate-400">
        A scenario exercise in autonomous decision-making. When Earth is minutes away, crews must make resource and
        radiation calls alone. Every constraint below is drawn from the same data as the operational modules.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {Object.values(LOCATIONS).map((l) => (
          <div key={l.key} className="rounded border border-slate-800 bg-[#0c1220] p-5">
            <div className="flex items-baseline justify-between">
              <h3 className="text-base font-bold text-white">{l.name}</h3>
              <span className="num text-[10px] uppercase tracking-widest text-slate-500">{l.missionSols} sols</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-slate-800 bg-slate-800 text-center">
              <div className="bg-slate-950/60 px-2 py-1.5">
                <p className="text-[9px] uppercase tracking-widest text-slate-500">Dose rate</p>
                <p className="num text-xs font-bold text-slate-200">{l.radiationMSvPerDay} mSv/sol</p>
              </div>
              <div className="bg-slate-950/60 px-2 py-1.5">
                <p className="text-[9px] uppercase tracking-widest text-slate-500">Surface sunlight</p>
                <p className="num text-xs font-bold text-slate-200">×{l.solarFactor}</p>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">{l.blurb}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded border border-slate-800 bg-[#0c1220] p-5">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Training objectives</h3>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-slate-400">
          <li>Balance life support, power, radiation shielding and food — the four budgets of every real outpost.</li>
          <li>Respond to solar particle events, dust storms, micrometeoroid strikes and moonquakes under comm delay.</li>
          <li>Learn the procedure behind each decision in the Protocol Advisor.</li>
          <li>Every knowledge check uses verified NASA science; wrong answers carry a full explanation.</li>
        </ul>
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <button
            onClick={onStart}
            className="rounded bg-cyan-500 px-6 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
          >
            Begin scenario
          </button>
          <button onClick={onInfo} className="text-xs font-semibold text-slate-400 hover:text-cyan-400">
            Data sources →
          </button>
        </div>
      </div>
    </div>
  )
}
