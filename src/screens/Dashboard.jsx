import { useEffect, useState } from 'react'
import {
  fetchISS, fetchSolarFlares, fetchSEPEvents, fetchNoaaAlerts, fetchEpicEarth, fetchCuriosityPhotos,
  earthMarsDistanceKm, moonDistanceKm, lightDelaySeconds, fmtDelay, fmtKm, timeAgo, moonPhase, cachedFetch,
} from '../lib/astro'

const RADIATION_LIMIT = 600

function Card({ title, badge, children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-slate-700/60 bg-slate-900/70 p-5 backdrop-blur ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-display text-xs font-bold tracking-widest text-slate-300">{title}</h3>
        {badge}
      </div>
      <div className="mt-3">{children}</div>
    </div>
  )
}

function Stat({ label, value, sub }) {
  return (
    <div className="rounded-xl bg-slate-950/50 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-0.5 text-base font-black text-white tabular-nums">{value}</p>
      {sub && <p className="text-[10px] text-slate-400">{sub}</p>}
    </div>
  )
}

const SourceBadge = ({ text, tone = 'cyan' }) => {
  const tones = { cyan: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300', lime: 'border-lime-500/40 bg-lime-500/10 text-lime-300', amber: 'border-amber-500/40 bg-amber-500/10 text-amber-300' }
  return <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-black tracking-wider ${tones[tone]}`}>{text}</span>
}

/* ---------- EVA GO / NO-GO decision engine ---------- */

function EvaGoNoGo({ noaa, flares, seps }) {
  const now = Date.now()
  const hoursAgo = (iso) => (now - new Date(iso).getTime()) / 3_600_000

  let verdict = 'GO'
  const reasons = []
  let total = 0
  try {
    total = (JSON.parse(localStorage.getItem('zgg-dose-log')) || []).reduce((a, e) => a + e.dose * e.count, 0)
  } catch { /* ignore */ }
  const budgetPct = total / RADIATION_LIMIT

  if (budgetPct > 0.85) {
    verdict = verdict === 'NO-GO' ? verdict : 'CAUTION'
    reasons.push(['amber', `Career dose ledger at ${(budgetPct * 100).toFixed(0)}% of NASA limit — minimize exposure hours.`])
  }
  if (noaa && noaa !== 'err') {
    const rad = noaa.filter((a) => /Solar Radiation/i.test(a.message) && hoursAgo(a.issue_datetime) < 24)
    const geo = noaa.filter((a) => /Geomagnetic/i.test(a.message) && hoursAgo(a.issue_datetime) < 24)
    if (rad.length) {
      verdict = 'NO-GO'
      reasons.push(['rose', `NOAA SWPC solar-radiation alert active (issued ${timeAgo(rad[0].issue_datetime)}).`])
    }
    if (geo.length && verdict !== 'NO-GO') {
      verdict = 'CAUTION'
      reasons.push(['amber', 'NOAA geomagnetic alert active — comm/GNSS degradation possible during EVA.'])
    }
  }
  if (seps && seps !== 'err' && seps.length && hoursAgo(seps[0].eventTime) < 72) {
    verdict = 'NO-GO'
    reasons.push(['rose', `Solar energetic particle event ${timeAgo(seps[0].eventTime)} (NASA DONKI) — particle flux still elevated.`])
  }
  if (flares && flares !== 'err' && flares.length) {
    const f = flares[0]
    if (/X/.test(f.classType) && hoursAgo(f.peakTime) < 24) {
      verdict = 'NO-GO'
      reasons.push(['rose', `X-class solar flare ${timeAgo(f.peakTime)} — worst-case SEP follows the big ones.`])
    } else if (/X/.test(f.classType) && hoursAgo(f.peakTime) < 48 && verdict !== 'NO-GO') {
      verdict = 'CAUTION'
      reasons.push(['amber', `X-class flare ${timeAgo(f.peakTime)} — aftershock environment.`])
    } else if (/M/.test(f.classType) && hoursAgo(f.peakTime) < 24 && verdict === 'GO') {
      verdict = 'CAUTION'
      reasons.push(['amber', `M-class flare ${timeAgo(f.peakTime)}.`])
    }
  }
  if (reasons.length === 0) reasons.push(['lime', 'No active space-weather alerts; dose budget has headroom.'])

  const styles = {
    GO: 'border-lime-500/50 bg-lime-500/10 text-lime-300',
    CAUTION: 'border-amber-500/50 bg-amber-500/10 text-amber-300',
    'NO-GO': 'alert-pulse border-rose-500/60 bg-rose-500/10 text-rose-300',
  }

  return (
    <Card
      title="EVA GO / NO-GO ADVISORY"
      badge={<SourceBadge text="DECISION ENGINE" tone="cyan" />}
      className="lg:col-span-2"
    >
      <div className="flex flex-wrap items-center gap-5">
        <div className={`grid h-28 w-36 shrink-0 place-items-center rounded-xl border-2 ${styles[verdict]}`}>
          <div className="text-center">
            <p className="font-display text-3xl font-black tracking-wider">{verdict}</p>
            <p className="text-[10px] font-bold tracking-widest">FOR EVA OPS</p>
          </div>
        </div>
        <div className="min-w-0 flex-1 space-y-1.5">
          {reasons.map(([tone, text], i) => (
            <p key={i} className={`text-sm leading-relaxed ${tone === 'rose' ? 'text-rose-200' : tone === 'amber' ? 'text-amber-200' : 'text-lime-200'}`}>
              • {text}
            </p>
          ))}
          <p className="pt-1 text-[10px] text-slate-500">
            Synthesizes live NOAA SWPC alerts, NASA DONKI events and the crew dose ledger (Radiation module). Advisories only — final call belongs to flight control.
          </p>
        </div>
      </div>
    </Card>
  )
}

/* ---------- ISS ground-track plot ---------- */

function IssMap({ trail }) {
  const W = 320, H = 160
  const px = (lon) => ((lon + 180) / 360) * W
  const py = (lat) => ((90 - lat) / 180) * H
  const meridians = [-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150]
  const parallels = [-60, -30, 0, 30, 60]
  const last = trail[trail.length - 1]
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mt-1 w-full rounded-xl bg-slate-950/60">
      {meridians.map((lon) => <line key={`m${lon}`} x1={px(lon)} y1={0} x2={px(lon)} y2={H} stroke="#1e293b" strokeWidth="1" />)}
      {parallels.map((lat) => <line key={`p${lat}`} x1={0} y1={py(lat)} x2={W} y2={py(lat)} stroke={lat === 0 ? '#164e63' : '#1e293b'} strokeWidth="1" />)}
      {trail.length > 1 && (
        <polyline
          points={trail.map((t) => `${px(t.lon)},${py(t.lat)}`).join(' ')}
          fill="none" stroke="#38bdf8" strokeWidth="1.5" opacity="0.75"
        />
      )}
      {last && (
        <>
          <circle cx={px(last.lon)} cy={py(last.lat)} r="5" fill="none" stroke="#f43f5e" strokeWidth="1.5" />
          <circle cx={px(last.lon)} cy={py(last.lat)} r="2.2" fill="#f43f5e" />
        </>
      )}
      <text x="6" y="10" fill="#475569" fontSize="8">90°N</text>
      <text x="6" y={py(0) - 3} fill="#164e63" fontSize="8">equator</text>
      <text x="6" y={H - 4} fill="#475569" fontSize="8">90°S</text>
    </svg>
  )
}

/* ---------- Main dashboard ---------- */

export default function Dashboard({ onInfo }) {
  const [iss, setIss] = useState(null)
  const [trail, setTrail] = useState([])
  const [noaa, setNoaa] = useState(null)
  const [flares, setFlares] = useState(null)
  const [seps, setSeps] = useState(null)
  const [epic, setEpic] = useState(null)
  const [mars, setMars] = useState(null)
  const [sync, setSync] = useState(null)

  const [now] = useState(() => new Date())
  const marsKm = earthMarsDistanceKm(now)
  const moonKm = moonDistanceKm(now)
  const marsDelay = lightDelaySeconds(marsKm)
  const moonDelay = lightDelaySeconds(moonKm)
  const mp = moonPhase(now)

  useEffect(() => {
    let cancelled = false
    const ctrl = new AbortController()
    const load = (p, set, flag = null) =>
      p.then((d) => { if (!cancelled) { set(d); setSync(new Date()) } })
        .catch(() => { if (!cancelled && flag) set(flag) })

    const loadIss = () => load(fetchISS(ctrl.signal).then((d) => {
      setTrail((t) => {
        const last = t[t.length - 1]
        if (last && Math.abs(last.lat - d.latitude) < 0.3 && Math.abs(last.lon - d.longitude) < 0.3) return t
        return [...t.slice(-59), { lat: d.latitude, lon: d.longitude }]
      })
      return d
    }), setIss)

    const loadFeeds = () => {
      load(cachedFetch('noaa', () => fetchNoaaAlerts(ctrl.signal)), setNoaa, 'err')
      load(cachedFetch('flr30', () => fetchSolarFlares(30, ctrl.signal)), setFlares, 'err')
      load(cachedFetch('sep90', () => fetchSEPEvents(90, ctrl.signal)), setSeps, 'err')
      load(cachedFetch('epic', fetchEpicEarth), setEpic, 'err')
      load(cachedFetch('marsphotos', fetchCuriosityPhotos), setMars, 'err')
    }

    loadIss()
    loadFeeds()
    const issId = setInterval(loadIss, 15000)
    const feedId = setInterval(loadFeeds, 5 * 60_000) // cache TTL makes this cheap
    return () => { cancelled = true; clearInterval(issId); clearInterval(feedId); ctrl.abort() }
  }, [])

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="font-display text-2xl font-black tracking-wide text-white">Ops Dashboard</h2>
          <p className="text-sm text-slate-400">Live mission-environment picture for the crew.</p>
        </div>
        <p className="text-[10px] text-slate-500">
          {sync ? `Last sync ${sync.toLocaleTimeString()} · ISS 15 s · feeds cached 5 min` : 'Syncing live feeds…'}
        </p>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <EvaGoNoGo noaa={noaa} flares={flares} seps={seps} />

        {/* ISS telemetry + ground track */}
        <Card title="ISS TELEMETRY & GROUND TRACK" badge={<SourceBadge text="LIVE · 15s" tone="lime" />}>
          {!iss && <p className="text-sm text-slate-400">Acquiring station telemetry…</p>}
          {iss && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <Stat label="Position" value={`${iss.latitude.toFixed(1)}°, ${iss.longitude.toFixed(1)}°`} sub={iss.visibility === 'day' ? 'in sunlight' : 'in eclipse'} />
                <Stat label="Alt / velocity" value={`${iss.altitude.toFixed(0)} km`} sub={`${Math.round(iss.velocity).toLocaleString()} km/h`} />
              </div>
              <IssMap trail={trail} />
              <p className="mt-1 text-[10px] text-slate-500">
                {iss.visibility === 'day' ? '☀️ Arrays charging (sunlit pass)' : '🌙 On batteries (eclipse pass)'} · trail = live downlink history this session
              </p>
            </>
          )}
        </Card>

        {/* Delay board */}
        <Card title="COMM DELAY BOARD" badge={<SourceBadge text="COMPUTED" tone="cyan" />}>
          <div className="grid grid-cols-3 gap-2">
            <Stat label="ISS / LEO" value="real-time" sub="MCC voice loops" />
            <Stat label="Moon" value={fmtDelay(moonDelay)} sub={`${fmtKm(moonKm)} km`} />
            <Stat label="Mars" value={fmtDelay(marsDelay)} sub={`${fmtKm(marsKm)} km`} />
          </div>
          <p className="mt-3 text-xs leading-relaxed text-slate-400">
            Earth–Mars distance changes daily as both planets orbit; delay computed from low-precision ephemerides at
            light speed (299,792 km/s). A question and its answer to Mars right now costs{' '}
            <span className="font-bold text-white tabular-nums">{fmtDelay(marsDelay * 2)}</span> of round-trip silence.
          </p>
        </Card>

        {/* Space weather feed */}
        <Card title="SPACE WEATHER ALERT FEED" badge={<SourceBadge text="NOAA SWPC · LIVE" tone="amber" />}>
          {!noaa && <p className="text-sm text-slate-400">Reading NOAA alert feed…</p>}
          {noaa === 'err' && <p className="text-sm text-slate-400">Feed unreachable right now — advisories resume automatically.</p>}
          {noaa && noaa !== 'err' && (
            <div className="space-y-1.5 text-xs">
              {(() => {
                const relevant = noaa.filter((a) => /ALERT|WARNING|WATCH/i.test(a.message.split('\n')[0])).slice(0, 3)
                if (relevant.length === 0) return <p className="text-slate-400">No active ALERT/WARNING/WATCH — quiet conditions per NOAA SWPC.</p>
                return relevant.map((a) => {
                  const head = a.message.split('\n').find((l) => /^(ALERT|WARNING|WATCH)/i.test(l)) || a.message.slice(0, 90)
                  return (
                    <div key={a.product_id} className="rounded-lg bg-slate-950/50 px-3 py-2">
                      <p className="font-bold text-amber-300">{head.trim()}</p>
                      <p className="text-[10px] text-slate-500">issued {new Date(a.issue_datetime).toLocaleString()} · {timeAgo(a.issue_datetime)}</p>
                    </div>
                  )
                })
              })()}
            </div>
          )}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Stat label="Flares, 30 d (DONKI)" value={flares && flares !== 'err' ? flares.length : '—'} sub={`M/X-class: ${flares && flares !== 'err' ? flares.filter((f) => /X|M/.test(f.classType)).length : '—'}`} />
            <Stat label="SEP events, 90 d" value={seps && seps !== 'err' ? seps.length : '—'} sub="solar energetic particles" />
          </div>
        </Card>

        {/* Moon */}
        <Card title="MOON & LUNAR LIGHTING" badge={<SourceBadge text="COMPUTED" tone="cyan" />}>
          <div className="grid grid-cols-3 gap-2">
            <Stat label="Phase" value={mp.name} sub={null} />
            <Stat label="Illuminated" value={`${(mp.illum * 100).toFixed(0)}%`} />
            <Stat label="Next full moon" value={new Date(Date.now() + mp.daysToFull * 86_400_000).toLocaleDateString()} sub={`in ${mp.daysToFull.toFixed(1)} d`} />
          </div>
          <p className="mt-3 text-xs leading-relaxed text-slate-400">
            Lunar illumination drives surface solar-power budgets: Artemis-class polar bases plan EVA and energy
            storage around the <span className="font-bold text-white">14-day lunar night</span>. Next new moon:{' '}
            <span className="text-white tabular-nums">{new Date(Date.now() + mp.daysToNew * 86_400_000).toLocaleDateString()}</span>.
          </p>
        </Card>

        {/* Environment today */}
        <Card title="TODAY ON MARS — CURIOSITY LATEST" badge={<SourceBadge text="NASA/JPL · LIVE" tone="amber" />}>
          {!mars && <p className="text-sm text-slate-400">Fetching latest downlink…</p>}
          {mars === 'err' && <p className="text-sm text-slate-400">Photo feed unreachable (rate limit) — retry in a few minutes.</p>}
          {mars && mars !== 'err' && (
            <>
              <div className="grid grid-cols-3 gap-2">
                {mars.map((p, i) => (
                  <div key={i} className="overflow-hidden rounded-xl border border-slate-700/50 bg-slate-950/40">
                    <img src={p.img} alt={`Curiosity ${p.camera}`} className="h-24 w-full object-cover" loading="lazy" />
                    <div className="p-2">
                      <p className="text-[10px] font-bold text-slate-200">{p.camera}</p>
                      <p className="text-[9px] text-slate-500">Sol {p.sol} · {p.date}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-[10px] text-slate-500">Latest images downlinked from Gale Crater via the Mars Relay Network.</p>
            </>
          )}
        </Card>

        <Card title="TODAY'S EARTH — DSCOVR/EPIC FROM L1" badge={<SourceBadge text="NASA EPIC · LIVE" tone="amber" />}>
          {!epic && <p className="text-sm text-slate-400">Fetching full-disc image…</p>}
          {epic === 'err' && <p className="text-sm text-slate-400">EPIC feed unreachable right now.</p>}
          {epic && epic !== 'err' && (
            <div className="flex gap-4">
              <img src={epic.url} alt="Earth full disc" className="h-32 w-32 shrink-0 rounded-full object-cover ring-1 ring-slate-600" loading="lazy" />
              <div className="text-xs leading-relaxed text-slate-400">
                <p className="font-bold text-slate-200">Full sunlit disc of Earth</p>
                <p className="mt-1">From DSCOVR, 1.5 million km sunward at Lagrange point 1, {new Date(epic.date).toLocaleString()}.</p>
                <p className="mt-2 italic">"{epic.caption?.replace(/\s+/g, ' ').slice(0, 140)}…"</p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Provenance */}
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3 text-[10px] text-slate-500">
        <span className="font-bold tracking-wider text-slate-400">DATA PROVENANCE:</span>
        <span>ISS telemetry — wheretheiss.at (community tracking service)</span>
        <span>Space weather — NOAA SWPC + NASA DONKI</span>
        <span>Mars imagery — NASA/JPL Mars Photos API</span>
        <span>Earth imagery — NASA EPIC/DSCOVR</span>
        <span>Delays & moon phase — computed from orbital elements</span>
        <button onClick={onInfo} className="font-bold text-cyan-400 hover:underline">full source list →</button>
      </div>
    </div>
  )
}
