import { SOURCES } from '../data/nasaData'

const MODULES = [
  {
    n: '01', title: 'Console', tab: 'console',
    what: 'Prioritized advisory log, re-evaluated on every sync.',
    detail: 'NOAA GOES X-ray and proton measurements, planetary K index, SWPC alerts, the crew dose ledger and the computed one-way light time are reduced to advisories. Each carries its source, its evidence and the actions to take. Advisories are acknowledged into a watch log.',
  },
  {
    n: '02', title: 'Radiation', tab: 'radiation',
    what: 'Career dose ledger, shielding calculator, 14-sol rotation planner.',
    detail: 'Dose against the ~600 mSv career limit using measured environments: Curiosity RAD at Mars (0.7 mSv/sol), LRO CRaTER at the Moon (1.4 mSv/sol), ISS (0.5 mSv/sol). Shielding transmission is applied per source, and planned rotations commit to the same ledger.',
  },
  {
    n: '03', title: 'Procedures', tab: 'advisor',
    what: 'Eight checklists for events Earth cannot answer in time.',
    detail: 'Fire, depressurization, CO₂ rise, solar particle event, power failure, medical emergency, comm blackout and dust storm. Written as numbered steps with decision points, not as advice.',
  },
  {
    n: '04', title: 'Simulation', tab: 'trainer',
    what: 'Resource and radiation exercise under comm delay.',
    detail: 'Life support, power, food and shielding are consumed at published rates. Events interrupt the plan; the crew resolves them without a real-time link. Every knowledge check is tied to a cited NASA measurement.',
  },
]

const FACTS = [
  ['Live feeds', '8'],
  ['Modules', '4'],
  ['Max light time', '22 min 17 s'],
  ['Simulated duration', '100 sols'],
]

export default function Home({ go, onInfo, onAbout }) {
  return (
    <div className="px-5 py-6">
      <div className="max-w-4xl">
        {/* Title block */}
        <p className="kicker">NASA Space Apps Challenge 2026 · Junior Astronaut Mission Trainer</p>
        <h1 className="mt-2 text-[26px] font-semibold leading-tight tracking-tight text-slate-100">
          Mission support for crews beyond real-time Earth contact.
        </h1>
        <p className="mt-3 max-w-[78ch] text-[13px] leading-relaxed text-slate-400">
          A browser-based decision aid for deep-space crews. It reads live space-weather and imagery feeds,
          computes the current light-time to Earth, and issues prioritized advisories with the evidence and the
          crew actions attached.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3 border-y border-slate-800 py-3">
          <button
            onClick={() => go('console')}
            className="bg-cyan-500 px-4 py-2 text-[12px] font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            Enter console
          </button>
          <button
            onClick={() => go('trainer')}
            className="border border-slate-600 px-4 py-2 text-[12px] font-medium text-slate-200 transition hover:border-slate-400"
          >
            Run simulation
          </button>
          <button onClick={onAbout} className="text-[12px] text-slate-400 hover:text-slate-200">
            Project notes
          </button>
          <span className="num ml-auto text-[10px] text-slate-600">TEAM ZERO-G GUIDE</span>
        </div>

        {/* Brief */}
        <h2 className="kicker mt-6">Brief</h2>
        <div className="mt-2 max-w-[82ch] space-y-2.5 text-[13px] leading-relaxed text-slate-400">
          <p>
            The constraint is not information. It is authority. At Mars, a question to Mission Control costs up to
            44 minutes round trip, so the crew has to decide first and explain later. Software built for that
            window has one job: put the next action, and the reason for it, in front of the crew.
          </p>
          <p>
            Zero-G Guide runs in the browser with no build-time data. Space-weather conditions, the Martian surface
            and Earth itself are read live; everything else is computed from published physical constants and NASA
            measurements. When a feed is unreachable the console says so rather than inventing a value.
          </p>
        </div>

        {/* Facts */}
        <div className="mt-5 grid grid-cols-2 gap-px border border-slate-800 bg-slate-800 sm:grid-cols-4">
          {FACTS.map(([k, v]) => (
            <div key={k} className="bg-[#111214] px-3 py-2.5">
              <p className="kicker">{k}</p>
              <p className="num mt-1 text-[13px] text-slate-200">{v}</p>
            </div>
          ))}
        </div>

        {/* Modules */}
        <h2 className="kicker mt-7">Modules</h2>
        <div className="mt-2 border-t border-slate-700">
          {MODULES.map((m) => (
            <button
              key={m.n}
              onClick={() => go(m.tab)}
              className="group grid w-full grid-cols-[28px_1fr] gap-3 border-b border-slate-800 py-3 text-left transition hover:bg-[#131417] sm:grid-cols-[28px_130px_1fr]"
            >
              <span className="num text-[10px] text-slate-600">{m.n}</span>
              <span>
                <span className="block text-[13px] font-semibold text-slate-100">{m.title}</span>
                <span className="mt-0.5 block text-[11px] text-slate-500 sm:hidden">{m.what}</span>
              </span>
              <span className="hidden sm:block">
                <span className="block text-[12px] text-slate-300">{m.what}</span>
                <span className="mt-1 block max-w-[80ch] text-[11.5px] leading-relaxed text-slate-500">{m.detail}</span>
              </span>
              <span className="col-span-2 text-[10px] text-slate-600 group-hover:text-slate-400 sm:hidden">Open →</span>
            </button>
          ))}
        </div>

        {/* Data */}
        <h2 className="kicker mt-7">Data</h2>
        <p className="mt-2 max-w-[80ch] text-[12px] leading-relaxed text-slate-500">
          NASA data is required for Global Award eligibility. Partner sources supply live space weather. Everything
          is read at request time; nothing is bundled or fabricated.
        </p>
        <table className="mt-2 w-full border-collapse text-[11.5px]">
          <thead>
            <tr className="border-y border-slate-700 text-left kicker">
              <th className="w-16 py-1.5 pr-3 font-normal">Type</th>
              <th className="py-1.5 pr-3 font-normal">Source</th>
              <th className="hidden py-1.5 font-normal sm:table-cell">Used for</th>
            </tr>
          </thead>
          <tbody>
            {SOURCES.map((s) => (
              <tr key={s.name} className="border-b border-slate-800 align-top">
                <td className="num py-1.5 pr-3 text-[9.5px] uppercase tracking-[0.08em] text-slate-600">{s.kind}</td>
                <td className="py-1.5 pr-3">
                  <a href={s.url} target="_blank" rel="noreferrer" className="text-slate-300 underline decoration-slate-700 underline-offset-2 hover:text-cyan-300">
                    {s.name}
                  </a>
                </td>
                <td className="hidden py-1.5 text-slate-500 sm:table-cell">{s.used}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-slate-600">
          <span>No NASA branding or logo used.</span>
          <span>Super Intelligence assistance disclosed.</span>
          <button onClick={onInfo} className="underline decoration-slate-700 underline-offset-2 hover:text-slate-300">
            Full provenance and method →
          </button>
        </div>
      </div>
    </div>
  )
}
