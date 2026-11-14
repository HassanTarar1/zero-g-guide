import { SOURCES } from '../data/nasaData'

const MODULES = [
  {
    icon: '📊',
    title: 'Ops Dashboard',
    text: 'Live ISS telemetry, real-time Earth–Moon–Mars light-delay calculator, and NASA DONKI space-weather advisories.',
    tab: 'dashboard',
    cta: 'Open dashboard',
  },
  {
    icon: '☢️',
    title: 'Radiation Manager',
    text: 'Career-dose ledger against NASA’s ~600 mSv limit, with live solar-flare watch before EVA planning.',
    tab: 'radiation',
    cta: 'Open ledger',
  },
  {
    icon: '📋',
    title: 'Protocol Advisor',
    text: 'Searchable emergency checklists — fire, cabin leak, CO₂, radiation storms — for the moment Earth can’t answer.',
    tab: 'advisor',
    cta: 'Browse protocols',
  },
  {
    icon: '🎓',
    title: 'Autonomy Trainer',
    text: 'Scenario trainer where crews practice the same trade-offs with real NASA life-support and dose data.',
    tab: 'trainer',
    cta: 'Start training',
  },
]

export default function Home({ go, onInfo, onAbout }) {
  return (
    <div className="mx-auto max-w-5xl px-4 pb-12 pt-10">
      {/* Hero */}
      <div className="text-center">
        <span className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-4 py-1.5 text-xs font-bold tracking-wide text-cyan-300">
          NASA SPACE APPS CHALLENGE 2026 · JUNIOR ASTRONAUT MISSION TRAINER
        </span>
        <h1 className="font-display mt-5 text-4xl font-black tracking-widest sm:text-6xl">
          <span className="text-gradient">ZERO-G GUIDE</span>
        </h1>
        <p className="font-display mt-2 text-base font-bold tracking-wide text-slate-200 sm:text-xl">
          The onboard assistant for astronauts when Earth can’t answer
        </p>
        <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-slate-400">
          A one-way message to Mars takes up to <span className="font-bold text-white">22 minutes</span>. During a solar
          radiation storm, that gap is dangerous. Zero-G Guide watches <span className="font-bold text-white">live NASA data</span> —
          space weather, station telemetry, orbital mechanics — and gives crews the advisories, dose ledgers,
          emergency protocols and autonomy training they need before, during and after the silence.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => go('dashboard')}
            className="glow-cyan rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-8 py-4 font-display text-lg font-black tracking-wide text-slate-950 transition hover:scale-105"
          >
            ▶ Open Live Dashboard
          </button>
          <button onClick={() => go('trainer')} className="rounded-xl border border-slate-600 px-6 py-4 font-semibold text-slate-200 transition hover:border-cyan-400 hover:text-cyan-300">
            🎓 Autonomy Trainer
          </button>
          <button onClick={onAbout} className="rounded-xl border border-slate-600 px-6 py-4 font-semibold text-slate-200 transition hover:border-cyan-400 hover:text-cyan-300">
            ℹ️ About
          </button>
        </div>
      </div>

      {/* Module grid */}
      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        {MODULES.map((m) => (
          <button
            key={m.title}
            onClick={() => go(m.tab)}
            className="group rounded-2xl border border-slate-700/60 bg-slate-900/60 p-5 text-left backdrop-blur transition hover:-translate-y-0.5 hover:border-cyan-400/60"
          >
            <div className="text-3xl">{m.icon}</div>
            <h3 className="font-display mt-2 font-bold tracking-wide text-white">{m.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-300">{m.text}</p>
            <p className="mt-3 text-xs font-bold text-cyan-300 opacity-0 transition group-hover:opacity-100">{m.cta} →</p>
          </button>
        ))}
      </div>

      {/* The problem strip */}
      <div className="mt-10 rounded-2xl border border-slate-700/60 bg-slate-900/60 p-6 backdrop-blur">
        <h3 className="font-display text-sm font-bold tracking-wide text-white">THE REAL PROBLEM WE SOLVE</h3>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          {[
            ['⏱️', 'Comm delay is physics', 'Light-speed makes real-time help impossible beyond LEO. Autonomy is not optional — it’s a trained skill.'],
            ['☢️', 'Radiation is the career ceiling', 'NASA limits astronauts to ~600 mSv lifetime. Solar particle events can blow through monthly budgets in hours.'],
            ['🏜️', 'Resources have weather', 'Solar power, water and food all interact with the environment — dust storms, eclipses, contamination.'],
          ].map(([i, t, d]) => (
            <div key={t}>
              <div className="text-2xl">{i}</div>
              <p className="mt-1 font-bold text-white">{t}</p>
              <p className="mt-1 text-sm text-slate-400">{d}</p>
            </div>
          ))}
        </div>
      </div>

      <footer className="mt-12 pb-4 text-center text-sm text-slate-500">
        <p>
          Built by <span className="font-semibold text-slate-300">Team Zero-G Guide</span> for the{' '}
          <a href="https://www.spaceappschallenge.org/2026/challenges/junior-astronaut-mission-trainer/" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">
            NASA Space Apps Challenge 2026
          </a>
        </p>
        <p className="mt-2">
          Uses {SOURCES.length}+ NASA data sources · No NASA logos or branding used ·
          <button onClick={onInfo} className="ml-1 text-cyan-400 hover:underline">see them all</button>
        </p>
      </footer>
    </div>
  )
}
