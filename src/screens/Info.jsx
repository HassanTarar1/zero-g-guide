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
    <section className="mt-6">
      <h3 className="kicker">Live query · NASA Image and Video Library</h3>
      {err && <p className="mt-2 text-[12px] text-slate-500">Library unreachable. The rest of the app is unaffected.</p>}
      {!items && !err && <p className="mt-2 text-[12px] text-slate-500">Querying images-api.nasa.gov…</p>}
      {items && (
        <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((it, i) => (
            <figure key={i} className="border border-slate-800">
              {it.thumb && <img src={it.thumb} alt={it.title || 'NASA image'} className="h-28 w-full object-cover" loading="lazy" />}
              <figcaption className="line-clamp-2 px-2 py-1.5 text-[10.5px] leading-snug text-slate-500">{it.title}</figcaption>
            </figure>
          ))}
        </div>
      )}
    </section>
  )
}

const GROUPS = [
  ['nasa', 'NASA data'],
  ['partner', 'Partner data'],
  ['other', 'Other data'],
]

export default function Info({ tab, setTab, onBack }) {
  return (
    <div className="px-5 py-6">
      <div className="max-w-4xl">
        <p className="kicker">Reference</p>
        <div className="mt-1 flex flex-wrap items-baseline justify-between gap-3 border-b border-slate-700 pb-3">
          <h1 className="text-[17px] font-semibold text-slate-100">Data, method and disclosure</h1>
          <button onClick={onBack} className="text-[11px] text-slate-500 hover:text-slate-300">← Back</button>
        </div>

        <div className="mt-3 flex gap-0 border-b border-slate-800">
          {[['data', 'Sources'], ['about', 'Method']].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`-mb-px border-b-2 px-3 py-2 text-[10px] font-medium uppercase tracking-[0.12em] transition ${
                tab === id ? 'border-cyan-400 text-slate-100' : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'data' && (
          <div className="mt-5">
            <p className="max-w-[82ch] text-[13px] leading-relaxed text-slate-400">
              Values in this application come from two places: live fetches from the endpoints below, and arithmetic
              on published measurements. No number in the game's daily costs or card effects is invented. Where a
              feed is unavailable the interface reports it instead of substituting a value.
            </p>

            {GROUPS.map(([kind, title]) => {
              const list = SOURCES.filter((s) => s.kind === kind)
              if (!list.length) return null
              return (
                <section key={kind} className="mt-5">
                  <h2 className="kicker">{title}</h2>
                  <table className="mt-1.5 w-full border-collapse text-[11.5px]">
                    <tbody>
                      {list.map((s) => (
                        <tr key={s.name} className="border-b border-slate-800 align-top">
                          <td className="w-[46%] py-1.5 pr-4">
                            <a
                              href={s.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-slate-300 underline decoration-slate-700 underline-offset-2 hover:text-cyan-300"
                            >
                              {s.name}
                            </a>
                          </td>
                          <td className="py-1.5 text-slate-500">{s.used}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </section>
              )
            })}

            <NasaGallery />
          </div>
        )}

        {tab === 'about' && (
          <div className="mt-5 space-y-6">
            <section>
              <h2 className="kicker">What this is</h2>
              <p className="mt-2 max-w-[82ch] text-[13px] leading-relaxed text-slate-400">
                Zero-G Guide is a ten-day outpost game for ages 4–14. Each day presents one decision. Every choice costs
                air, power or radiation, and the mission ends when one of them runs out. The solar-storm decision is
                priced against live NOAA proton flux and flare data, so the risk the player sees is today's risk.
                Behind the game, the same measurements drive a mission console for older players and judges: a
                prioritized advisory log, a dose ledger and eight emergency procedures.
              </p>
            </section>

            <section>
              <h2 className="kicker">Method</h2>
              <ul className="mt-2 max-w-[82ch] list-disc space-y-1 pl-5 text-[12.5px] leading-relaxed text-slate-400">
                <li>The ten-day game charges 5 air and 3 power every day for life support and heat, then applies the chosen card. Radiation accumulates, with a ×1.3 lunar multiplier. The solar-storm card's exposure cost rises 90% when NOAA reports proton flux at or above 10 pfu or an X-class flare inside 24 hours.</li>
                <li>Earth–Mars and Earth–Moon light-time is computed from low-precision orbital elements (Schlyter), accurate to roughly 1% over 2000–2100, and divided by the speed of light.</li>
                <li>Proton flux above 10 pfu at ≥10 MeV is treated as the S1 threshold. Flare class, Kp and SWPC alerts are read live and never cached longer than five minutes.</li>
                <li>Consumables use ISS per-crew rates: 0.84 kg O₂, 3.5 L water and 1.83 kg food per crew-day.</li>
                <li>Radiation uses Curiosity RAD at Mars (0.7 mSv/sol) and LRO CRaTER at the Moon (1.4 mSv/sol), against an approximate 600 mSv career limit.</li>
                <li>Shielding transmission values are illustrative ranges from published NASA shielding studies, not a transport calculation.</li>
                <li>Scenario cards follow documented hazards: dust storms, solar particle events, micrometeoroid strikes and moonquakes recorded by Apollo seismometers.</li>
              </ul>
            </section>

            <section className="border border-amber-500/30 bg-amber-500/5 px-4 py-3">
              <h2 className="kicker text-amber-300">Super Intelligence disclosure</h2>
              <p className="mt-1.5 max-w-[82ch] text-[12.5px] leading-relaxed text-slate-400">
                This project was developed with assistance from large language model tools, as permitted by the
                challenge rules. All logic, interface and text were directed, reviewed and tested by the human team.
                No AI-generated imagery, audio or video is used. NASA imagery is fetched at runtime from NASA's public
                APIs. No NASA logos, flags or mission identifiers are used.
              </p>
            </section>

            <section>
              <h2 className="kicker">Team</h2>
              <p className="mt-2 text-[12.5px] text-slate-400">
                Team Zero-G Guide · NASA Space Apps Challenge 2026 · Challenge: Build a Junior Astronaut Mission Trainer.
              </p>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}
