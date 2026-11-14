import { useEffect, useState } from 'react'
import {
  fetchISS, fetchSolarFlares, fetchSEPEvents, fetchNoaaAlerts, fetchEpicEarth, fetchCuriosityPhotos,
  earthMarsDistanceKm, moonDistanceKm, lightDelaySeconds, fmtDelay, fmtKm, timeAgo, moonPhase,
} from '../lib/astro'

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

function Stat({ label, value, sub, mono = true }) {
  return (
    <div className="rounded-xl bg-slate-950/50 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className={`mt-0.5 text-base font-black text-white ${mono ? 'tabular-nums' : ''}`}>{value}</p>
      {sub && <p className="text-[10px] text-slate-400">{sub}</p>}
    </div>
  )
}

const SourceBadge = ({ text, tone = 'cyan' }) => {
  const tones = { cyan: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300', lime: 'border-lime-500/40 bg-lime-500/10 text-lime-300', amber: 'border-amber-500/40 bg-amber-500/10 text-amber-300' }
  return <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-black tracking-wider ${tones[tone]}`}>{text}</span>
}

export default function Dashboard({ onInfo }) {
  const [iss, setIss] = useState(null)
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
    load(fetchISS(ctrl.signal), setIss)
    load(fetchNoaaAlerts(ctrl.signal), setNoaa, 'err')
    load(fetchSolarFlares(30, ctrl.signal), setFlares, 'err')
    load(fetchSEPEvents(90, ctrl.signal), setSeps, 'err')
    load(fetchEpicEarth(ctrl.signal), setEpic, 'err')
    load(fetchCuriosityPhotos(ctrl.signal), setMars, 'err')
    const id = setInterval(() => {
      fetchISS(ctrl.signal).then((d) => { if (!cancelled) setIss(d) }).catch(() => {})
    }, 15000)
    return () => { cancelled = true; clearInterval(id); ctrl.abort() }
  }, [])

  // ---- Advisory logic ----
  const noaaRelevant = (noaa && noaa !== 'err')
    ? noaa.filter((a) => /ALERT|WARNING|WATCH/i.test(a.message.split('\n')[0])).slice(0, 3)
    : []
  const significant = flares && flares !== 'err' ? flares.filter((f) => /X|M/.test(f.classType)) : []
  const latest = flares && flares !== 'err' && flares.length ? flares[0] : null
  const latestSep = seps && seps !== 'err' && seps.length ? seps[0] : null

  let advisory = null
  if (noaaRelevant.length && /Geomagnetic|K-index|Solar Radiation/i.test(noaaRelevant[0].message)) {
    const head = noaaRelevant[0].message.split('\n').find((l) => /^(ALERT|WARNING|WATCH)/i.test(l))
    advisory = { level: 'amber', text: `NOAA SWPC ${head?.trim() || 'space-weather alert in effect'} — issued ${timeAgo(noaaRelevant[0].issue_datetime)}.` }
  }
  if (latestSep) {
    advisory = { level: 'rose', text: `Solar energetic particle event in NASA DONKI records (${timeAgo(latestSep.eventTime)}). EVA operations: shelter protocol review required before exposure.` }
  } else if (latest && /X/.test(latest.classType) && Date.now() - new Date(latest.peakTime).getTime() < 48 * 3_600_000) {
    advisory = { level: 'rose', text: `X-class solar flare observed ${timeAgo(latest.peakTime)} (region ${latest.activeRegionNum ?? '—'}). Expect elevated radiation environment; postpone non-critical EVA.` }
  } else if (latest && /M/.test(latest.classType) && Date.now() - new Date(latest.peakTime).getTime() < 48 * 3_600_000) {
    advisory = { level: 'amber', text: `M-class solar flare observed ${timeAgo(latest.peakTime)} (region ${latest.activeRegionNum ?? '—'}). Maintain radiation awareness; review dosimeter ledger.` }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="font-display text-2xl font-black tracking-wide text-white">Ops Dashboard</h2>
          <p className="text-sm text-slate-400">Live mission-environment picture for the crew.</p>
        </div>
        <p className="text-[10px] text-slate-500">
          {sync ? `Last sync ${sync.toLocaleTimeString()} · ISS auto-refresh 15 s` : 'Syncing live feeds…'}
        </p>
      </div>

      {/* Advisory banner */}
      {advisory && (
        <div className={`mt-4 rounded-xl border p-4 ${advisory.level === 'rose' ? 'alert-pulse border-rose-500/60 bg-rose-500/10' : 'border-amber-500/50 bg-amber-500/10'}`}>
          <p className={`font-semibold ${advisory.level === 'rose' ? 'text-rose-200' : 'text-amber-200'}`}>
            {advisory.level === 'rose' ? 'RADIATION ADVISORY — ' : 'SPACE WEATHER — '}{advisory.text}
          </p>
        </div>
      )}

      {/* Row 1: telemetry + delay */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card
          title="ISS TELEMETRY"
          badge={<SourceBadge text="LIVE · 15s" tone="lime" />}
        >
          {!iss && <p className="text-sm text-slate-400">Acquiring station telemetry…</p>}
          {iss && (
            <div className="grid grid-cols-2 gap-2">
              <Stat label="Position" value={`${iss.latitude.toFixed(1)}°, ${iss.longitude.toFixed(1)}°`} sub={iss.visibility === 'day' ? 'in sunlight' : 'in eclipse (night)'} />
              <Stat label="Altitude" value={`${iss.altitude.toFixed(0)} km`} sub={`${Math.round(iss.velocity).toLocaleString()} km/h`} />
              <Stat label="Solar exposure" value={iss.visibility === 'day' ? 'ARRAYS CHARGING' : 'ON BATTERIES'} sub="from live sunlight state" />
              <Stat label="Orbit period" value="≈ 92 min" sub="crew sees 16 sunrises/day" />
            </div>
          )}
        </Card>

        <Card
          title="COMM DELAY BOARD"
          badge={<SourceBadge text="COMPUTED" tone="cyan" />}
        >
          <div className="grid grid-cols-3 gap-2">
            <Stat label="ISS / LEO" value="real-time" sub="MCC voice loops" />
            <Stat label="Moon" value={fmtDelay(moonDelay)} sub={`${fmtKm(moonKm)} km`} />
            <Stat label="Mars" value={fmtDelay(marsDelay)} sub={`${fmtKm(marsKm)} km`} />
          </div>
          <p className="mt-3 text-xs leading-relaxed text-slate-400">
            Earth–Mars distance changes daily as both planets orbit; the delay is computed from low-precision
            ephemerides (valid 2000–2100) at light speed (299,792 km/s). A question plus its answer to Mars right now
            costs <span className="font-bold text-white tabular-nums">{fmtDelay(marsDelay * 2)}</span> of round-trip silence.
          </p>
        </Card>
      </div>

      {/* Row 2: space weather */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card
          title="SPACE WEATHER ALERT FEED"
          badge={<SourceBadge text="NOAA SWPC · LIVE" tone="amber" />}
        >
          {!noaa && <p className="text-sm text-slate-400">Reading NOAA alert feed…</p>}
          {noaa === 'err' && <p className="text-sm text-slate-400">Feed unreachable right now — advisories resume automatically.</p>}
          {noaa && noaa !== 'err' && (
            <div className="space-y-1.5 text-xs">
              {noaaRelevant.length === 0 && <p className="text-slate-400">No active ALERT/WARNING/WATCH items — quiet conditions per NOAA SWPC.</p>}
              {noaaRelevant.map((a) => {
                const head = a.message.split('\n').find((l) => /^(ALERT|WARNING|WATCH)/i.test(l)) || a.message.slice(0, 90)
                return (
                  <div key={a.product_id} className="rounded-lg bg-slate-950/50 px-3 py-2">
                    <p className="font-bold text-amber-300">{head.trim()}</p>
                    <p className="text-[10px] text-slate-500">issued {new Date(a.issue_datetime).toLocaleString()} · {timeAgo(a.issue_datetime)}</p>
                  </div>
                )
              })}
            </div>
          )}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Stat label="Flares, 30 d (NASA DONKI)" value={flares && flares !== 'err' ? flares.length : '—'} sub={`M/X-class: ${significant.length}`} />
            <Stat label="SEP events, 90 d" value={seps && seps !== 'err' ? seps.length : '—'} sub="solar energetic particles" />
          </div>
        </Card>

        <Card
          title="MOON & LUNAR LIGHTING"
          badge={<SourceBadge text="COMPUTED" tone="cyan" />}
        >
          <div className="grid grid-cols-3 gap-2">
            <Stat label="Phase" value={mp.name} mono={false} />
            <Stat label="Illuminated" value={`${(mp.illum * 100).toFixed(0)}%`} />
            <Stat label="Next full moon" value={new Date(Date.now() + mp.daysToFull * 86_400_000).toLocaleDateString()} sub={`in ${mp.daysToFull.toFixed(1)} d`} />
          </div>
          <p className="mt-3 text-xs leading-relaxed text-slate-400">
            Lunar illumination decides surface solar-power budgets: Artemis-class polar bases plan EVA and energy
            storage around the <span className="font-bold text-white">14-day lunar night</span>. Next new moon:{' '}
            <span className="text-white tabular-nums">{new Date(Date.now() + mp.daysToNew * 86_400_000).toLocaleDateString()}</span>.
          </p>
        </Card>
      </div>

      {/* Row 3: environment today */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card
          title="TODAY ON MARS — CURIOSITY, LATEST PHOTOS"
          badge={<SourceBadge text="NASA/JPL · LIVE" tone="amber" />}
        >
          {!mars && <p className="text-sm text-slate-400">Fetching latest downlink…</p>}
          {mars === 'err' && <p className="text-sm text-slate-400">Photo feed unreachable (API rate limit) — retry later.</p>}
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

        <Card
          title="TODAY'S EARTH — DSCOVR/EPIC FROM L1"
          badge={<SourceBadge text="NASA EPIC · LIVE" tone="amber" />}
        >
          {!epic && <p className="text-sm text-slate-400">Fetching full-disc image…</p>}
          {epic === 'err' && <p className="text-sm text-slate-400">EPIC feed unreachable right now.</p>}
          {epic && epic !== 'err' && (
            <div className="flex gap-4">
              <img src={epic.url} alt="Earth full disc" className="h-32 w-32 shrink-0 rounded-full object-cover ring-1 ring-slate-600" loading="lazy" />
              <div className="text-xs leading-relaxed text-slate-400">
                <p className="font-bold text-slate-200">Full sunlit disc of Earth</p>
                <p className="mt-1">Taken from the DSCOVR spacecraft, 1.5 million km sunward at Lagrange point 1, {new Date(epic.date).toLocaleString()}.</p>
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
        <span>Space weather — NOAA SWPC alerts + NASA DONKI</span>
        <span>Mars imagery — NASA/JPL Mars Photos API</span>
        <span>Earth imagery — NASA EPIC/DSCOVR</span>
        <span>Delays & moon phase — computed from orbital elements</span>
        <button onClick={onInfo} className="font-bold text-cyan-400 hover:underline">full source list →</button>
      </div>
    </div>
  )
}
