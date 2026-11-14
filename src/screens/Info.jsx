import { useEffect, useState } from 'react'
import { SOURCES } from '../data/nasaData'

/** Live NASA Image and Video Library search — no API key needed (images-api.nasa.gov). */
function NasaGallery() {
  const [items, setItems] = useState(null)
  const [err, setErr] = useState(false)

  useEffect(() => {
    let cancelled = false
    const ctrl = new AbortController()
    fetch('https://images-api.nasa.gov/search?q=mars%20surface&media_type=image', { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((data) => {
        if (cancelled) return
        const hits = (data?.collection?.items || []).slice(0, 6)
        setItems(hits.map((h) => ({ title: h.data?.[0]?.title, thumb: h.links?.[0]?.href })))
      })
      .catch(() => { if (!cancelled) setErr(true) })
    return () => { cancelled = true; ctrl.abort() }
  }, [])

  return (
    <div className="mt-6">
      <h3 className="font-bold text-white">🖼️ Live NASA Image Library (fetched now, no key required)</h3>
      {err && <p className="mt-2 text-sm text-slate-400">(Library unreachable right now — the game still works offline.)</p>}
      {!items && !err && <p className="mt-2 text-sm text-slate-400">Loading NASA images…</p>}
      {items && (
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((it, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-slate-700/50 bg-slate-950/40">
              {it.thumb && <img src={it.thumb} alt={it.title || 'NASA image'} className="h-28 w-full object-cover" loading="lazy" />}
              <p className="line-clamp-2 p-2 text-[11px] text-slate-400">{it.title}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Info({ tab, setTab, onBack }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <button onClick={onBack} className="text-sm text-slate-400 hover:text-cyan-300">← Back</button>
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => setTab('data')}
          className={`rounded-xl px-4 py-2 font-bold transition ${tab === 'data' ? 'bg-cyan-500 text-slate-950' : 'border border-slate-600 text-slate-300 hover:border-cyan-400'}`}
        >
          📡 NASA Data Used
        </button>
        <button
          onClick={() => setTab('about')}
          className={`rounded-xl px-4 py-2 font-bold transition ${tab === 'about' ? 'bg-cyan-500 text-slate-950' : 'border border-slate-600 text-slate-300 hover:border-cyan-400'}`}
        >
          ℹ️ About Zero-G Guide
        </button>
      </div>

      {tab === 'data' && (
        <div className="mt-6">
          <p className="text-slate-300">
            Zero-G Guide is powered by <span className="font-bold text-white">real NASA data</span>. Every simulation
            number below is sourced from a public NASA measurement or fact sheet — no made-up physics.
          </p>
          <div className="mt-4 space-y-3">
            {SOURCES.map((s) => (
              <a
                key={s.url}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="block rounded-xl border border-slate-700/60 bg-slate-900/60 p-4 transition hover:border-cyan-400/60"
              >
                <p className="font-bold text-cyan-300">{s.name}</p>
                <p className="mt-1 text-sm text-slate-400">Used for: {s.used}</p>
              </a>
            ))}
          </div>
          <NasaGallery />
        </div>
      )}

      {tab === 'about' && (
        <div className="mt-6 space-y-4 text-slate-300">
          <div className="rounded-xl border border-slate-700/60 bg-slate-900/60 p-5">
            <h3 className="font-bold text-white">Team Zero-G Guide</h3>
            <p className="mt-1 text-sm">NASA Space Apps Challenge 2026 · Challenge: <em>Build a Junior Astronaut Mission Trainer</em></p>
            <p className="mt-3 text-sm">
              Zero-G Guide turns the real engineering trade-offs of a lunar or Martian outpost into a game a 10-year-old
              can play in five minutes. Cadets manage the same four budgets real mission planners juggle — life support,
              power, radiation and food — using numbers measured by actual NASA instruments (Curiosity’s RAD, LRO’s
              CRaTER, InSight’s weather sensors, the ISS water recycler).
            </p>
          </div>
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5">
            <h3 className="font-bold text-amber-300">🤖 Super Intelligence (SI) Disclosure</h3>
            <p className="mt-2 text-sm">
              This project’s code was developed <span className="font-semibold">with the assistance of AI (large language model) tools</span> as
              permitted by the Space Apps Challenge rules. All simulation logic, UI and text were generated and then
              reviewed, tested and directed by the human team. No AI-generated images, audio or video are used; no NASA
              logos, flags or mission identifiers appear anywhere in this project. NASA imagery shown in the “Live NASA
              Image Library” section is fetched directly from NASA’s official public API at runtime and is not AI-generated.
            </p>
          </div>
          <div className="rounded-xl border border-slate-700/60 bg-slate-900/60 p-5">
            <h3 className="font-bold text-white">🔭 Design notes</h3>
            <ul className="mt-2 list-disc space-y-1 text-sm">
              <li>Consumables use ISS per-crew rates: 0.84 kg O₂/day, 3.5 L water/day, 1.83 kg food/day.</li>
              <li>Radiation uses Curiosity RAD (Mars ≈ 0.7 mSv/day) and LRO CRaTER (Moon ≈ 1.4 mSv/day) measurements, with NASA’s ~600 mSv career limit as a hard game-over.</li>
              <li>Solar output scales with each world’s real sunlight: Mars receives ≈ 43% of Earth’s insolation; the Moon has 14-day nights.</li>
              <li>Events are based on real hazards: Mars dust storms (RIP Opportunity), solar particle events, micrometeoroid strikes, moonquakes recorded by Apollo seismometers.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
