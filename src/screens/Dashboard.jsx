import { useEffect, useState } from 'react'
import { fetchISS, fetchSolarFlares, fetchSEPEvents, earthMarsDistanceKm, moonDistanceKm, lightDelaySeconds, fmtDelay, fmtKm, timeAgo } from '../lib/astro'

function Card({ title, badge, children }) {
  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-900/70 p-5 backdrop-blur">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-bold tracking-wide text-white">{title}</h3>
        {badge}
      </div>
      <div className="mt-3">{children}</div>
    </div>
  )
}

function Stat({ label, value, sub }) {
  return (
    <div className="rounded-xl bg-slate-950/50 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-0.5 text-lg font-black text-white">{value}</p>
      {sub && <p className="text-[11px] text-slate-400">{sub}</p>}
    </div>
  )
}

export default function Dashboard({ onInfo }) {
  const [iss, setIss] = useState(null)
  const [flares, setFlares] = useState(null)
  const [seps, setSeps] = useState(null)
  const [liveErr, setLiveErr] = useState('')
  const [now] = useState(() => new Date())

  const marsKm = earthMarsDistanceKm(now)
  const moonKm = moonDistanceKm(now)
  const marsDelay = lightDelaySeconds(marsKm)
  const moonDelay = lightDelaySeconds(moonKm)

  useEffect(() => {
    let cancelled = false
    const ctrl = new AbortController()
    fetchISS(ctrl.signal)
      .then((d) => { if (!cancelled) { setIss(d); setLiveErr('') } })
      .catch((e) => { if (!cancelled) setLiveErr('Live telemetry unreachable') })
    const id = setInterval(() => {
      fetchISS(ctrl.signal).then((d) => { if (!cancelled) setIss(d) }).catch(() => {})
    }, 15000)
    return () => { cancelled = true; clearInterval(id); ctrl.abort() }
  }, [])

  useEffect(() => {
    let cancelled = false
    const ctrl = new AbortController()
    Promise.allSettled([fetchSolarFlares(30, ctrl.signal), fetchSEPEvents(90, ctrl.signal)])
      .then(([f, s]) => {
        if (cancelled) return
        setFlares(f.status === 'fulfilled' ? f.value : 'err')
        setSeps(s.status === 'fulfilled' ? s.value : 'err')
      })
    return () => { cancelled = true; ctrl.abort() }
  }, [])

  // Advisory logic: recent significant flare or any recent SEP
  const significant = (flares && flares !== 'err') ? flares.filter((f) => /X|M/.test(f.classType)) : []
  const latest = (flares && flares !== 'err' && flares.length) ? flares[0] : null
  const latestSep = (seps && seps !== 'err' && seps.length) ? seps[0] : null
  const advisory =
    latestSep
      ? { level: 'rose', text: `Solar energetic particle event detected (${timeAgo(latestSep.eventTime)}). EVA operations: shelter protocol review required before exposure.` }
      : latest && /X/.test(latest.classType) && Date.now() - new Date(latest.peakTime).getTime() < 48 * 3_600_000
        ? { level: 'rose', text: `X-class solar flare observed ${timeAgo(latest.peakTime)} (region ${latest.activeRegionNum ?? '—'}). Expect elevated radiation environment; postpone non-critical EVA.` }
        : latest && /M/.test(latest.classType) && Date.now() - new Date(latest.peakTime).getTime() < 48 * 3_600_000
          ? { level: 'amber', text: `M-class solar flare observed ${timeAgo(latest.peakTime)} (region ${latest.activeRegionNum ?? '—'}). Maintain radiation awareness; review dosimeter logs.` }
          : null

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h2 className="font-display text-2xl font-black tracking-wide text-white">📊 Ops Dashboard</h2>
      <p className="text-sm text-slate-400">Live mission-environment status for the crew. Data refreshes automatically.</p>

      {/* Advisory banner */}
      {advisory && (
        <div className={`mt-4 rounded-xl border p-4 ${advisory.level === 'rose' ? 'alert-pulse border-rose-500/60 bg-rose-500/10' : 'border-amber-500/50 bg-amber-500/10'}`}>
          <p className={`font-semibold ${advisory.level === 'rose' ? 'text-rose-200' : 'text-amber-200'}`}>
            {advisory.level === 'rose' ? '🚨 RADIATION ADVISORY — ' : '⚠️ SOLAR ACTIVITY — '}{advisory.text}
          </p>
        </div>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {/* ISS telemetry */}
        <Card
          title="🛰️ ISS TELEMETRY (LIVE)"
          badge={<span className="rounded-full border border-lime-500/40 bg-lime-500/10 px-2 py-0.5 text-[10px] font-bold text-lime-300">LIVE · 15 s refresh</span>}
        >
          {liveErr && <p className="text-sm text-slate-400">{liveErr} — the assistant works offline for everything else.</p>}
          {!iss && !liveErr && <p className="text-sm text-slate-400">Acquiring station telemetry…</p>}
          {iss && (
            <div className="grid grid-cols-2 gap-2">
              <Stat label="Position" value={`${iss.latitude.toFixed(1)}°, ${iss.longitude.toFixed(1)}°`} sub={iss.visibility === 'day' ? '☀️ in sunlight' : '🌙 in eclipse (night)'} />
              <Stat label="Altitude" value={`${iss.altitude.toFixed(0)} km`} sub={`velocity ${Math.round(iss.velocity).toLocaleString()} km/h`} />
              <Stat label="Solar exposure" value={iss.visibility === 'day' ? 'ARRAYS CHARGING' : 'ON BATTERIES'} sub="computed from live sunlight state" />
              <Stat label="Orbit period" value="~92 min" sub="16 sunrises / day for the crew" />
            </div>
          )}
        </Card>

        {/* Comm delay */}
        <Card
          title="📡 ONE-WAY LIGHT-DELAY (COMPUTED LIVE)"
          badge={<span className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold text-cyan-300">REAL-TIME MATH</span>}
        >
          <div className="grid grid-cols-3 gap-2">
            <Stat label="ISS / LEO" value="real-time" sub="voice loops with MCC" />
            <Stat label="Moon" value={fmtDelay(moonDelay)} sub={`${fmtKm(moonKm)} km`} />
            <Stat label="Mars" value={fmtDelay(marsDelay)} sub={`${fmtKm(marsKm)} km`} />
          </div>
          <p className="mt-3 text-xs leading-relaxed text-slate-400">
            Distance to Mars changes every day as both planets orbit — the delay is computed right now from orbital
            mechanics (speed of light 299,792 km/s). At this distance, a question and its answer costs{' '}
            <span className="font-bold text-white">{fmtDelay(marsDelay * 2)}</span> of round-trip silence.
            <span className="text-slate-500"> This is why crews need onboard decision support — and why the Trainer exists.</span>
          </p>
        </Card>

        {/* Solar activity */}
        <Card
          title="☀️ SPACE WEATHER — NASA DONKI (LIVE)"
          badge={<span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-300">NASA api.nasa.gov</span>}
        >
          {flares === 'err' && <p className="text-sm text-slate-400">DONKI unreachable (rate-limited key or offline) — advisories resume automatically.</p>}
          {!flares && <p className="text-sm text-slate-400">Querying NASA space-weather database…</p>}
          {flares && flares !== 'err' && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <Stat label="Flares (30 d)" value={flares.length} sub={`significant (M/X): ${significant.length}`} />
                <Stat label="SEP events (90 d)" value={seps && seps !== 'err' ? seps.length : '—'} sub="solar energetic particles" />
              </div>
              <div className="mt-3 space-y-1 text-xs">
                {flares.slice(0, 5).map((f) => (
                  <div key={f.flrID} className="flex items-center justify-between rounded-lg bg-slate-950/50 px-3 py-1.5">
                    <span className="font-bold text-amber-300">Class {f.classType}</span>
                    <span className="text-slate-400">{new Date(f.peakTime).toLocaleString()} · {timeAgo(f.peakTime)}</span>
                  </div>
                ))}
                {flares.length === 0 && <p className="text-slate-400">No flares recorded in the last 30 days — quiet Sun.</p>}
              </div>
            </>
          )}
        </Card>

        {/* Why it matters */}
        <Card title="🧭 WHY THIS MATTERS">
          <ul className="list-disc space-y-2 text-sm text-slate-300">
            <li><span className="font-bold text-white">Autonomy window:</span> the light-delay above is the time a crew must act <em>before</em> Earth can even answer — every protocol in the Advisor assumes it.</li>
            <li><span className="font-bold text-white">Radiation is the #1 career constraint:</span> NASA caps astronaut career dose around 600 mSv; solar events are its biggest wildcard.</li>
            <li><span className="font-bold text-white">Solar power is a resource with weather:</span> the ISS sunlight state above is the same physics that makes dust storms deadly for Mars bases.</li>
          </ul>
          <button onClick={onInfo} className="mt-3 text-xs font-bold text-cyan-300 hover:underline">See all NASA data sources →</button>
        </Card>
      </div>
    </div>
  )
}
