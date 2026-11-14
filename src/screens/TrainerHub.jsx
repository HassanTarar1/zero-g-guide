import { LOCATIONS } from '../data/nasaData'

export default function TrainerHub({ onStart, onInfo }) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <h2 className="font-display text-2xl font-black tracking-wide text-white">🎓 Comm-Delay Autonomy Trainer</h2>
      <p className="mt-1 text-sm text-slate-300">
        When Earth is minutes away, crews must make resource and radiation calls alone. This trainer puts you in
        command of a Moon or Mars outpost where every number is real NASA data — the same life-support rates, dose
        measurements and power physics that drive the Assistant modules.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {Object.values(LOCATIONS).map((l) => (
          <div key={l.key} className="rounded-2xl border border-slate-700/60 bg-slate-900/70 p-5 backdrop-blur">
            <div className="flex items-center gap-4">
              <div className={`h-14 w-14 shrink-0 rounded-full ${l.key === 'mars' ? 'planet-mars' : 'planet-moon'}`} />
              <div>
                <h3 className="font-bold text-white">{l.name}</h3>
                <p className="text-[11px] text-slate-400">{l.missionSols}-sol scenario · ☢️ {l.radiationMSvPerDay} mSv/day · ☀️ ×{l.solarFactor} solar</p>
              </div>
            </div>
            <p className="mt-2 text-sm text-slate-300">{l.blurb}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-slate-700/60 bg-slate-900/70 p-5 backdrop-blur">
        <h3 className="font-display text-sm font-bold tracking-wide text-white">TRAINING OBJECTIVES</h3>
        <ul className="mt-3 list-disc space-y-1.5 text-sm text-slate-300">
          <li>Balance life support, power, radiation shielding and food — the four budgets of every real outpost.</li>
          <li>React to solar particle events, dust storms, micrometeoroid strikes and moonquakes under comm delay.</li>
          <li>Learn the procedures behind each decision in the Protocol Advisor.</li>
          <li>Every question in Mission Academy uses verified NASA science — wrong answers teach too.</li>
        </ul>
        <button
          onClick={onStart}
          className="glow-cyan mt-5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-8 py-3.5 font-display text-lg font-black tracking-wide text-slate-950 transition hover:scale-105"
        >
          ▶ Begin Scenario
        </button>
        <button onClick={onInfo} className="ml-3 text-xs font-bold text-cyan-300 hover:underline">Data sources →</button>
      </div>
    </div>
  )
}
