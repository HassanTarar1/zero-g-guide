import { LOCATIONS } from '../data/nasaData'

export default function TrainerHub({ onStart, onInfo }) {
  return (
    <div className="px-5 py-5">
      <div className="max-w-4xl">
        <p className="kicker">Simulation / Comm-delay drill</p>
        <div className="mt-1 border-b border-slate-700 pb-3">
          <h1 className="text-[17px] font-semibold tracking-tight text-slate-100">Resource and radiation exercise</h1>
          <p className="mt-1 max-w-[80ch] text-[12.5px] leading-relaxed text-slate-500">
            A scenario in autonomous decision-making. Life support, power, food and shielding are drawn down at
            published rates; events interrupt the plan. The crew resolves them without a real-time link, then reads
            the outcome.
          </p>
        </div>

        <h2 className="kicker mt-4">Select a station</h2>
        <div className="mt-1.5 border-t border-slate-700">
          {Object.values(LOCATIONS).map((l) => (
            <div key={l.key} className="border-b border-slate-800 py-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-[13px] font-semibold text-slate-100">{l.name}</h3>
                <span className="num text-[10px] text-slate-600">{l.missionSols} SOLS</span>
              </div>
              <p className="mt-1 max-w-[78ch] text-[12px] leading-relaxed text-slate-400">{l.blurb}</p>
              <div className="num mt-1.5 flex flex-wrap gap-x-5 gap-y-0.5 text-[10.5px] text-slate-500">
                <span>DOSE {l.radiationMSvPerDay} mSv/sol</span>
                <span>SURFACE SUN ×{l.solarFactor}</span>
                <span>LIGHT TIME {l.key === 'mars' ? '4–22 min' : '<1 s'}</span>
              </div>
            </div>
          ))}
        </div>

        <h2 className="kicker mt-5">Training objectives</h2>
        <ul className="mt-1.5 max-w-[80ch] list-disc space-y-1 pl-5 text-[12.5px] leading-relaxed text-slate-400">
          <li>Balance the four budgets of an outpost: life support, power, radiation and food.</li>
          <li>Resolve solar particle events, dust storms, micrometeoroid strikes and moonquakes without Earth support.</li>
          <li>Read the procedure behind each decision; every knowledge check cites a NASA measurement.</li>
          <li>Finish 100 sols without exhausting consumables, power or the crew dose budget.</li>
        </ul>

        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-800 pt-4">
          <button
            onClick={onStart}
            className="bg-cyan-500 px-4 py-2 text-[12px] font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            Begin scenario
          </button>
          <button onClick={onInfo} className="text-[11px] text-slate-500 hover:text-slate-300">
            Data sources →
          </button>
        </div>
      </div>
    </div>
  )
}
