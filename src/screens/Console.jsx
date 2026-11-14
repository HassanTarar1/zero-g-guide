import { useEffect, useMemo, useState } from 'react'
import {
  fetchISS, fetchGoesFlares, fetchProtonFlux, fetchKpIndex, fetchNoaaAlerts, fetchEpicEarth, fetchCuriosityPhotos,
  earthMarsDistanceKm, moonDistanceKm, lightDelaySeconds, fmtDelay, fmtKm, moonPhase, cachedFetch,
} from '../lib/astro'
import { buildAdvisories, ackKey } from '../lib/advisories'

const PROFILES = {
  iss: {
    key: 'iss', name: 'Low Earth orbit', sub: 'ISS expedition',
    doseRate: 0.5, sunlight: '92-min cycle', gravity: 'microgravity', temp: 'pressurized',
  },
  moon: {
    key: 'moon', name: 'Lunar surface', sub: 'Artemis-class outpost',
    doseRate: 1.4, sunlight: '28-day cycle', gravity: '0.17 g', temp: '−173 to +127 °C',
  },
  mars: {
    key: 'mars', name: 'Martian surface', sub: 'Ares-class outpost',
    doseRate: 0.7, sunlight: '43% of Earth', gravity: '0.38 g', temp: 'avg −63 °C',
  },
}

const ACK_KEY = 'zgg-ack'

const SEV = {
  critical: { label: 'CRITICAL', bar: 'bg-rose-400', text: 'text-rose-400', edge: 'border-l-rose-400' },
  high: { label: 'HIGH', bar: 'bg-orange-400', text: 'text-orange-400', edge: 'border-l-orange-400' },
  medium: { label: 'MEDIUM', bar: 'bg-amber-400', text: 'text-amber-400', edge: 'border-l-amber-400' },
  info: { label: 'INFO', bar: 'bg-sky-500', text: 'text-sky-500', edge: 'border-l-sky-500' },
}

function parseUtc(t) {
  if (!t) return null
  const s = String(t)
  const iso = s.includes('T') ? s : s.replace(' ', 'T')
  const d = new Date(/[zZ]$|[+-]\d\d:?\d\d$/.test(iso) ? iso : iso + 'Z')
  return Number.isNaN(d.getTime()) ? null : d
}

function fmtZ(t) {
  const d = parseUtc(t)
  return d ? d.toISOString().slice(11, 19) + 'Z' : '—'
}

function fmtShortZ(t) {
  const d = parseUtc(t)
  if (!d) return '—'
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  return `${String(d.getUTCDate()).padStart(2, '0')} ${months[d.getUTCMonth()]} ${d.toISOString().slice(11, 16)}Z`
}

function Row({ k, v, state, stateClass }) {
  return (
    <tr className="border-b border-slate-800/80 last:border-0">
      <td className="py-1.5 pr-3 text-slate-500">{k}</td>
      <td className="num py-1.5 text-right text-slate-200">{v}</td>
      <td className={`num w-16 py-1.5 pl-3 text-right text-[10px] ${stateClass ?? 'text-slate-600'}`}>{state ?? ''}</td>
    </tr>
  )
}

function Block({ title, aside, children }) {
  return (
    <section className="panel">
      <div className="panel-head">
        <h3 className="kicker text-slate-300">{title}</h3>
        {aside}
      </div>
      <div className="px-3 py-2">{children}</div>
    </section>
  )
}

function AdvisoryEntry({ a, n, acked, onAck }) {
  const s = SEV[a.severity]
  return (
    <article className={`border-b border-slate-800 border-l-2 ${s.edge} py-3.5 pl-3.5 pr-1`}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="num text-[10px] text-slate-600">A-{String(n).padStart(2, '0')}</span>
        <span className={`num text-[10px] font-medium tracking-[0.12em] ${s.text}`}>{s.label}</span>
        {a.time && <span className="num text-[10px] text-slate-600">{fmtShortZ(a.time)}</span>}
        <button
          onClick={onAck}
          disabled={acked}
          className={`ml-auto border px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] transition ${
            acked
              ? 'border-slate-800 text-slate-600'
              : 'border-slate-600 text-slate-300 hover:border-cyan-400 hover:text-cyan-300'
          }`}
        >
          {acked ? 'Acknowledged' : 'Acknowledge'}
        </button>
      </div>
      <h4 className="mt-1.5 text-[14px] font-semibold leading-snug text-slate-100">{a.title}</h4>
      <p className="mt-1 max-w-[78ch] text-[12.5px] leading-relaxed text-slate-400">{a.rationale}</p>
      <ol className="mt-2 space-y-0.5">
        {a.actions.map((act, i) => (
          <li key={i} className="flex gap-2.5 text-[12.5px] leading-relaxed text-slate-300">
            <span className="num w-3 shrink-0 text-slate-600">{i + 1}.</span>
            {act}
          </li>
        ))}
      </ol>
      <p className="mt-2 kicker text-slate-600">Source · {a.basis}</p>
    </article>
  )
}

export default function Console({ onInfo, onRadiation }) {
  const [profile, setProfile] = useState('mars')
  const [iss, setIss] = useState(null)
  const [noaa, setNoaa] = useState(null)
  const [flares, setFlares] = useState(null)
  const [protons, setProtons] = useState(null)
  const [kp, setKp] = useState(null)
  const [epic, setEpic] = useState(null)
  const [mars, setMars] = useState(null)
  const [sync, setSync] = useState(null)
  const [acks, setAcks] = useState(() => {
    try { return JSON.parse(localStorage.getItem(ACK_KEY)) || [] } catch { return [] }
  })
  const [doseTotal, setDoseTotal] = useState(0)

  useEffect(() => { localStorage.setItem(ACK_KEY, JSON.stringify(acks)) }, [acks])

  useEffect(() => {
    try {
      const entries = JSON.parse(localStorage.getItem('zgg-dose-log')) || []
      setDoseTotal(entries.reduce((a, e) => a + e.dose * e.count, 0))
    } catch { /* ignore */ }
  }, [profile])

  useEffect(() => {
    let cancelled = false
    const ctrl = new AbortController()
    const load = (p, set, flag = null) =>
      p.then((d) => { if (!cancelled) { set(d); setSync(new Date()) } })
        .catch(() => { if (!cancelled && flag) set(flag) })

    const loadIss = () => load(fetchISS(ctrl.signal), setIss)
    const loadFeeds = () => {
      load(cachedFetch('noaa', () => fetchNoaaAlerts(ctrl.signal)), setNoaa, 'err')
      load(cachedFetch('goesfl', () => fetchGoesFlares(ctrl.signal)), setFlares, 'err')
      load(cachedFetch('protons', () => fetchProtonFlux(ctrl.signal)), setProtons, 'err')
      load(cachedFetch('kp', () => fetchKpIndex(ctrl.signal)), setKp, 'err')
      load(cachedFetch('epic', fetchEpicEarth), setEpic, 'err')
      load(cachedFetch('marsphotos', fetchCuriosityPhotos), setMars, 'err')
    }
    loadIss()
    loadFeeds()
    const issId = setInterval(loadIss, 15000)
    const feedId = setInterval(loadFeeds, 5 * 60_000)
    return () => { cancelled = true; clearInterval(issId); clearInterval(feedId); ctrl.abort() }
  }, [])

  const now = useMemo(() => new Date(), [])
  const pr = PROFILES[profile]

  const delays = useMemo(() => {
    const marsKm = earthMarsDistanceKm(now)
    const moonKm = moonDistanceKm(now)
    return {
      mars: { km: marsKm, sec: lightDelaySeconds(marsKm) },
      moon: { km: moonKm, sec: lightDelaySeconds(moonKm) },
      iss: { km: 420, sec: 0.0014 },
    }
  }, [now])
  const delay = delays[profile]
  const delayText = profile === 'iss' ? '<1 s' : fmtDelay(delay.sec)

  const trend = useMemo(() => {
    const future = new Date(now.getTime() + 7 * 86_400_000)
    return earthMarsDistanceKm(future) - earthMarsDistanceKm(now)
  }, [now])

  const mp = moonPhase(now)
  const advisories = buildAdvisories({
    profile, noaa, flares, protons, kp, doseTotal,
    moonPhaseName: mp.name, moonIllum: mp.illum, delayText, now,
  })

  const feedsReady = noaa !== null && flares !== null && protons !== null
  const ackedSet = new Set(acks)
  const active = advisories.filter((a) => !ackedSet.has(ackKey(a)))
  const closed = advisories.filter((a) => ackedSet.has(ackKey(a)))

  const acknowledge = (a) => setAcks((prev) => [...prev, ackKey(a)])

  const worst = active.reduce((w, a) => {
    const order = { critical: 0, high: 1, medium: 2, info: 3 }
    return order[a.severity] < order[w] ? a.severity : w
  }, 'info')
  const watchLabel = worst === 'critical' ? 'SHELTER' : worst === 'high' ? 'CAUTION' : worst === 'medium' ? 'WATCH' : 'NOMINAL'
  const watchClass = worst === 'critical' ? 'text-rose-400' : worst === 'high' ? 'text-orange-400' : worst === 'medium' ? 'text-amber-400' : 'text-lime-400'

  const alerts = Array.isArray(noaa) ? noaa : []

  return (
    <div className="px-5 py-5">
      {/* Title block */}
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3 border-b border-slate-700 pb-3">
        <div>
          <p className="kicker">Console / Active watch</p>
          <h1 className="mt-1 text-[17px] font-semibold tracking-tight text-slate-100">
            {pr.name} <span className="text-slate-500">·</span> {pr.sub}
          </h1>
        </div>
        <div className="flex items-end gap-8">
          <div>
            <p className="kicker">Watch state</p>
            <p className={`num mt-1 text-[15px] font-medium tracking-[0.1em] ${watchClass}`}>{watchLabel}</p>
          </div>
          <div className="text-right">
            <p className="kicker">One-way light time</p>
            <p className="num mt-1 text-[17px] text-slate-100">{delayText}</p>
            <p className="num text-[10px] text-slate-600">{fmtKm(delay.km)} km</p>
          </div>
        </div>
      </div>

      {/* Profile tabs */}
      <div className="flex items-stretch border-b border-slate-800">
        {Object.values(PROFILES).map((p) => (
          <button
            key={p.key}
            onClick={() => setProfile(p.key)}
            className={`-mb-px border-b-2 px-3 py-2 text-[10px] font-medium uppercase tracking-[0.12em] transition ${
              profile === p.key ? 'border-cyan-400 text-slate-100' : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            {p.name}
          </button>
        ))}
        <span className="num ml-auto self-center pr-1 text-[10px] text-slate-600">
          {sync ? `SYNC ${sync.toISOString().slice(11, 19)}Z` : 'SYNCING'}
        </span>
      </div>

      <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1fr)_330px]">
        {/* Advisory log */}
        <section>
          <div className="flex items-baseline justify-between">
            <h2 className="kicker text-slate-300">Advisory log</h2>
            <span className="num text-[10px] text-slate-600">
              {active.length} OPEN · {closed.length} ACK
            </span>
          </div>
          <div className="mt-2 border-t border-slate-700">
            {active.map((a, i) => (
              <AdvisoryEntry key={ackKey(a)} a={a} n={i + 1} acked={false} onAck={() => acknowledge(a)} />
            ))}
            {!feedsReady && (
              <p className="border-b border-slate-800 py-4 text-[12px] text-slate-600">
                Waiting for live feeds. Advisories are re-evaluated at every sync.
              </p>
            )}
          </div>

          {closed.length > 0 && (
            <details className="mt-3 border border-slate-800">
              <summary className="cursor-pointer px-3 py-2 kicker text-slate-500">
                Acknowledged · {closed.length}
              </summary>
              <div className="border-t border-slate-800 px-3 py-2">
                {closed.map((a) => (
                  <p key={ackKey(a)} className="py-0.5 text-[11.5px] text-slate-600">
                    <span className="num mr-2">✓</span>{a.title}
                  </p>
                ))}
              </div>
            </details>
          )}
        </section>

        {/* Parameter rail */}
        <aside className="space-y-4">
          <Block title="Watch parameters">
            <table className="w-full text-[11.5px]">
              <tbody>
                <Row
                  k="Proton ≥10 MeV"
                  v={protons === 'err' ? 'n/a' : protons ? `${protons.p10.toFixed(2)} pfu` : '…'}
                  state={protons && protons !== 'err' ? (protons.p10 >= 10 ? 'STORM' : 'NOMINAL') : ''}
                  stateClass={protons && protons !== 'err' && protons.p10 >= 10 ? 'text-rose-400' : 'text-lime-500'}
                />
                <Row k="Proton ≥100 MeV" v={protons === 'err' ? 'n/a' : protons ? `${protons.p100.toFixed(3)} pfu` : '…'} />
                <Row k="Latest flare" v={flares === 'err' ? 'n/a' : Array.isArray(flares) && flares[0] ? flares[0].classType : '…'} />
                <Row k="Planetary K" v={kp === 'err' ? 'n/a' : kp ? kp.kp.toFixed(0) : '…'} state={kp && kp !== 'err' && kp.kp >= 5 ? 'ACTIVE' : ''} stateClass="text-amber-400" />
                <Row k="Alerts" v={Array.isArray(noaa) ? String(alerts.length) : noaa === 'err' ? 'n/a' : '…'} />
                <Row k="One-way delay" v={delayText} />
                <Row k="Dose rate" v={`${pr.doseRate} mSv/sol`} />
              </tbody>
            </table>
            <div className="mt-2 border-t border-slate-800 pt-2">
              <div className="flex justify-between text-[10px] text-slate-600">
                <span className="kicker">Crew dose</span>
                <span className="num">{Math.round(doseTotal)} / 600 mSv</span>
              </div>
              <div className="mt-1 h-1.5 bg-slate-800">
                <div
                  className={`h-full ${doseTotal / 600 > 0.8 ? 'bg-rose-400' : doseTotal / 600 > 0.5 ? 'bg-amber-400' : 'bg-lime-500'}`}
                  style={{ width: `${Math.min(100, (doseTotal / 600) * 100)}%` }}
                />
              </div>
              <button onClick={onRadiation} className="mt-1.5 text-[10px] text-slate-500 underline decoration-slate-700 underline-offset-2 hover:text-slate-300">
                Open dose ledger
              </button>
            </div>
          </Block>

          <Block title="Feed status" aside={<span className="num text-[10px] text-slate-600">{sync ? sync.toISOString().slice(11, 19) + 'Z' : '—'}</span>}>
            <table className="w-full text-[11.5px]">
              <tbody>
                <Row
                  k="ISS position"
                  v={iss ? `${iss.latitude.toFixed(2)}° ${iss.longitude.toFixed(2)}°` : '…'}
                  state={iss ? (iss.visibility === 'day' ? 'SUNLIT' : 'ECLIPSE') : ''}
                  stateClass="text-slate-500"
                />
                <Row k="NOAA alerts" v={noaa === 'err' ? 'n/a' : Array.isArray(noaa) ? `${alerts.length} items` : '…'} state={noaa === 'err' ? 'DOWN' : ''} stateClass="text-rose-400" />
                <Row k="GOES flares" v={flares === 'err' ? 'n/a' : Array.isArray(flares) ? `${flares.length} recent` : '…'} state={flares === 'err' ? 'DOWN' : ''} stateClass="text-rose-400" />
                <Row k="Proton flux" v={protons === 'err' ? 'n/a' : protons ? 'live' : '…'} state={protons === 'err' ? 'DOWN' : ''} stateClass="text-rose-400" />
                <Row k="EPIC Earth" v={epic === 'err' ? 'n/a' : epic ? 'live' : '…'} state={epic === 'err' ? 'DOWN' : ''} stateClass="text-rose-400" />
                <Row k="Curiosity" v={mars === 'err' ? 'n/a' : Array.isArray(mars) ? `${mars.length} frames` : '…'} state={mars === 'err' ? 'DOWN' : ''} stateClass="text-rose-400" />
              </tbody>
            </table>
          </Block>

          <Block title="Environment">
            <table className="w-full text-[11.5px]">
              <tbody>
                <Row k="Surface sunlight" v={pr.sunlight} />
                <Row k="Gravity" v={pr.gravity} />
                <Row k="Thermal" v={pr.temp} />
                <Row k="Lunar phase" v={`${Math.round(mp.illum * 100)}%`} state={mp.name.toUpperCase()} stateClass="text-slate-500" />
              </tbody>
            </table>
            {profile === 'mars' && (
              <p className="mt-2 border-t border-slate-800 pt-2 text-[10.5px] leading-snug text-slate-600">
                Range {trend < 0 ? 'closing' : 'opening'} by {fmtKm(Math.abs(trend))} km per 7 days.
              </p>
            )}
          </Block>
        </aside>
      </div>

      {/* Downlink imagery */}
      <div className="mt-5 grid gap-4 border-t border-slate-800 pt-4 sm:grid-cols-3">
        <figure className="flex gap-3">
          {mars && mars !== 'err' && mars[0] ? (
            <img src={mars[0].img} alt="Curiosity downlink" className="h-16 w-16 shrink-0 border border-slate-800 object-cover" loading="lazy" />
          ) : (
            <div className="h-16 w-16 shrink-0 border border-slate-800 bg-slate-900" />
          )}
          <figcaption className="min-w-0">
            <p className="kicker">Mars · Curiosity</p>
            {mars && mars !== 'err' && mars[0] ? (
              <>
                <p className="mt-0.5 truncate text-[11.5px] text-slate-300">{mars[0].camera}</p>
                <p className="num text-[10px] text-slate-600">SOL {mars[0].sol} · {mars[0].date}</p>
              </>
            ) : <p className="mt-0.5 text-[11.5px] text-slate-600">awaiting downlink</p>}
          </figcaption>
        </figure>

        <figure className="flex gap-3">
          {epic && epic !== 'err' ? (
            <img src={epic.url} alt="Earth from DSCOVR" className="h-16 w-16 shrink-0 border border-slate-800 object-cover" loading="lazy" />
          ) : (
            <div className="h-16 w-16 shrink-0 border border-slate-800 bg-slate-900" />
          )}
          <figcaption className="min-w-0">
            <p className="kicker">Earth · EPIC / DSCOVR</p>
            {epic && epic !== 'err' ? (
              <p className="num mt-0.5 text-[11px] text-slate-400">{fmtShortZ(epic.date)}</p>
            ) : <p className="mt-0.5 text-[11.5px] text-slate-600">awaiting downlink</p>}
            <p className="mt-0.5 text-[10px] text-slate-600">Full disc from Sun–Earth L1</p>
          </figcaption>
        </figure>

        <figure>
          <p className="kicker">Lunar phase</p>
          <p className="mt-0.5 text-[12px] text-slate-300">{mp.name}</p>
          <p className="num text-[10px] text-slate-600">
            {Math.round(mp.illum * 100)}% illuminated · next full {new Date(now.getTime() + mp.daysToFull * 86_400_000).toISOString().slice(0, 10)}
          </p>
        </figure>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-slate-800 pt-2.5 text-[10px] text-slate-600">
        <span className="kicker text-slate-500">Provenance</span>
        <span>ISS · wheretheiss.at</span>
        <span>Space weather · NOAA SWPC GOES X-ray, protons, Kp, alerts</span>
        <span>Imagery · NASA EPIC/DSCOVR, NASA/JPL Curiosity</span>
        <span>Light time · computed ephemerides</span>
        <button onClick={onInfo} className="text-slate-500 underline decoration-slate-700 underline-offset-2 hover:text-slate-300">full list</button>
      </div>
    </div>
  )
}
