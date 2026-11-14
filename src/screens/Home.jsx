import { SOURCES } from '../data/nasaData'

const KPIS = [
  ['Live data feeds', '6'],
  ['NASA sources cited', '12'],
  ['Max one-way comm delay', '22 min'],
  ['Simulated mission length', '100 sols'],
]

const MODULES = [
  {
    n: '01',
    title: 'Ops Dashboard',
    desc: 'ISS telemetry and sunlight state, real-time Earth–Moon–Mars light-delay computed from orbital elements, NOAA space-weather alert feed and NASA DONKI event history. An EVA GO/NO-GO engine synthesizes all of it with the crew dose ledger.',
    tab: 'dashboard',
  },
  {
    n: '02',
    title: 'Radiation Manager',
    desc: 'Career-dose ledger against NASA’s ~600 mSv limit, with measured environments (Curiosity RAD on Mars, LRO CRaTER at the Moon, ISS). Includes a shielding calculator and a 14-sol surface-rotation planner.',
    tab: 'radiation',
  },
  {
    n: '03',
    title: 'Protocol Advisor',
    desc: 'Searchable operational checklists for fire, cabin depressurization, CO₂ rise, solar particle events, power failure, medical emergency and comm blackouts — for the window when Earth cannot respond.',
    tab: 'advisor',
  },
  {
    n: '04',
    title: 'Comm-Delay Simulation',
    desc: 'A scenario exercise in which crews practice life-support, power and radiation trade-offs under delay, using the same consumption rates and dose data as the operational modules.',
    tab: 'trainer',
  },
]

export default function Home({ go, onInfo, onAbout }) {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-14 pt-12">
      {/* Hero */}
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-400">
        NASA Space Apps Challenge 2026 — Junior Astronaut Mission Trainer
      </p>
      <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
        Mission support for crews operating beyond real-time Earth contact.
      </h1>
      <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-slate-400">
        A one-way message to Mars currently takes minutes — up to roughly 22 in the worst case. Zero-G Guide
        turns live agency data into the three things a crew needs when silence is part of the schedule:
        an environmental picture, a radiation budget, and procedures they can execute without help.
      </p>

      <div className="mt-7 flex flex-wrap gap-3">
        <button
          onClick={() => go('dashboard')}
          className="rounded bg-cyan-500 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-400"
        >
          Open live dashboard
        </button>
        <button
          onClick={() => go('trainer')}
          className="rounded border border-slate-600 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-400"
        >
          Run the simulation
        </button>
        <button onClick={onAbout} className="px-2 py-3 text-sm font-semibold text-slate-400 transition hover:text-slate-200">
          About the project →
        </button>
      </div>

      {/* KPI strip */}
      <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded border border-slate-800 bg-slate-800 sm:grid-cols-4">
        {KPIS.map(([label, value]) => (
          <div key={label} className="bg-[#0c1220] px-4 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">{label}</p>
            <p className="num mt-1 text-xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* Modules */}
      <h2 className="mt-12 text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500">Capabilities</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {MODULES.map((m) => (
          <button
            key={m.n}
            onClick={() => go(m.tab)}
            className="group rounded border border-slate-800 bg-[#0c1220] p-5 text-left transition hover:border-slate-600"
          >
            <div className="flex items-baseline gap-3">
              <span className="num text-[11px] font-bold text-cyan-500">{m.n}</span>
              <h3 className="text-base font-bold text-white">{m.title}</h3>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">{m.desc}</p>
            <p className="mt-3 text-[11px] font-semibold text-slate-500 transition group-hover:text-cyan-400">Open module →</p>
          </button>
        ))}
      </div>

      {/* Problem */}
      <h2 className="mt-12 text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500">Why it matters</h2>
      <div className="mt-4 grid gap-px overflow-hidden rounded border border-slate-800 bg-slate-800 sm:grid-cols-3">
        {[
          ['Comm delay is not negotiable', 'Light speed sets the autonomy window. Beyond low Earth orbit, crews must act before Earth can answer — so the decision support has to be onboard.'],
          ['Radiation is the career ceiling', 'NASA caps astronaut lifetime dose around 600 mSv. One solar particle event can consume a year of budget in hours.'],
          ['Resources behave like weather', 'Solar power, water and food all interact with the environment. Planning without the environmental picture is guesswork.'],
        ].map(([t, d]) => (
          <div key={t} className="bg-[#0c1220] p-5">
            <p className="text-sm font-bold text-white">{t}</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">{d}</p>
          </div>
        ))}
      </div>

      <footer className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-5 text-xs text-slate-500">
        <p>
          Team Zero-G Guide ·{' '}
          <a
            href="https://www.spaceappschallenge.org/2026/challenges/junior-astronaut-mission-trainer/"
            target="_blank"
            rel="noreferrer"
            className="text-slate-400 underline decoration-slate-700 underline-offset-2 hover:text-cyan-400"
          >
            NASA Space Apps Challenge 2026
          </a>
        </p>
        <p>
          {SOURCES.length} documented sources · no NASA branding used ·{' '}
          <button onClick={onInfo} className="font-semibold text-slate-400 hover:text-cyan-400">data provenance</button>
        </p>
      </footer>
    </div>
  )
}
