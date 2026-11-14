import { useEffect, useState } from 'react'
import { SOURCES } from '../data/nasaData'

/**
 * Home screen with a LIVE NASA "Cadet Briefing" pulled from the
 * Astronomy Picture of the Day (APOD) API (api.nasa.gov, DEMO_KEY).
 */
export default function Home({ onStart, onInfo, onAbout }) {
  const [apod, setApod] = useState(null)
  const [apodError, setApodError] = useState(false)

  useEffect(() => {
    let cancelled = false
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), 8000)
    fetch('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY', { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data) => { if (!cancelled) setApod(data) })
      .catch(() => { if (!cancelled) setApodError(true) })
      .finally(() => clearTimeout(t))
    return () => { cancelled = true; ctrl.abort() }
  }, [])

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      {/* Hero */}
      <div className="text-center">
        <div className="mb-4 text-7xl animate-float-rocket">🚀</div>
        <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl">
          Zero-G <span className="text-cyan-400">Guide</span>
        </h1>
        <p className="mt-2 text-lg font-semibold text-amber-300">Junior Astronaut Mission Trainer</p>
        <p className="mx-auto mt-4 max-w-2xl text-slate-300">
          Cadet — your mission is to run a <span className="text-white font-semibold">real NASA-data-powered outpost</span> on
          the Moon or Mars. Balance <span className="text-cyan-300">life support</span>, <span className="text-amber-300">power</span>,{' '}
          <span className="text-rose-300">radiation shielding</span> and <span className="text-lime-300">food</span> through dust
          storms, solar flares and 14-day lunar nights. Survive the full mission to graduate.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onStart}
            className="rounded-xl bg-cyan-500 px-8 py-4 text-lg font-bold text-slate-950 shadow-lg shadow-cyan-500/30 transition hover:scale-105 hover:bg-cyan-400"
          >
            ▶ Start Mission Training
          </button>
          <button onClick={onInfo} className="rounded-xl border border-slate-600 px-6 py-4 font-semibold text-slate-200 transition hover:border-cyan-400 hover:text-cyan-300">
            📡 NASA Data Used
          </button>
          <button onClick={onAbout} className="rounded-xl border border-slate-600 px-6 py-4 font-semibold text-slate-200 transition hover:border-cyan-400 hover:text-cyan-300">
            ℹ️ About
          </button>
        </div>
      </div>

      {/* How it works */}
      <div className="mt-12 grid gap-4 sm:grid-cols-3">
        {[
          { icon: '🛰️', title: '1. Build your base', text: 'Spend mission credits on solar arrays, RTG generators, greenhouses, water recyclers and radiation shelters.' },
          { icon: '⏱️', title: '2. Fly sol by sol', text: 'Every sol your crew eats, drinks, breathes and absorbs radiation — using real NASA consumption and dose data.' },
          { icon: '🧠', title: '3. Learn & decide', text: 'Random events force hard trade-offs, and Mission Academy quizzes teach real NASA science for bonus resources.' },
        ].map((c) => (
          <div key={c.title} className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-5 backdrop-blur">
            <div className="text-3xl">{c.icon}</div>
            <h3 className="mt-2 font-bold text-white">{c.title}</h3>
            <p className="mt-1 text-sm text-slate-300">{c.text}</p>
          </div>
        ))}
      </div>

      {/* Live NASA APOD */}
      <div className="mt-12 rounded-2xl border border-slate-700/60 bg-slate-900/60 p-5 backdrop-blur">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white">🛰️ Cadet Briefing of the Day</h3>
          <span className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
            LIVE via NASA APOD API
          </span>
        </div>
        {apodError && (
          <p className="mt-3 text-sm text-slate-400">
            (Couldn’t reach the NASA APOD API right now — rate limits or offline. The game itself doesn’t need it.)
          </p>
        )}
        {!apod && !apodError && <p className="mt-3 text-sm text-slate-400">Contacting NASA…</p>}
        {apod && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {apod.media_type === 'image' ? (
              <img src={apod.url} alt={apod.title} className="h-48 w-full rounded-xl object-cover sm:h-full" loading="lazy" />
            ) : (
              <div className="grid h-full place-items-center rounded-xl bg-slate-800 p-4 text-5xl">🌌</div>
            )}
            <div>
              <p className="font-bold text-amber-300">{apod.title}</p>
              <p className="mt-1 text-xs text-slate-500">{apod.date}</p>
              <p className="mt-2 line-clamp-6 text-sm text-slate-300">{apod.explanation}</p>
            </div>
          </div>
        )}
      </div>

      {/* Credits */}
      <footer className="mt-12 pb-8 text-center text-sm text-slate-500">
        <p>
          Built by <span className="font-semibold text-slate-300">Team Zero-G Guide</span> for the{' '}
          <a href="https://www.spaceappschallenge.org/2026/challenges/junior-astronaut-mission-trainer/" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">
            NASA Space Apps Challenge 2026 — Junior Astronaut Mission Trainer
          </a>
        </p>
        <p className="mt-2">Uses {SOURCES.length} NASA data sources · No NASA logos or branding used</p>
      </footer>
    </div>
  )
}
