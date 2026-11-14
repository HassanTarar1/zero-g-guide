/**
 * Live astro math + NASA/live data fetchers for Zero-G Guide.
 *
 * Orbital math: low-precision ephemerides (P. Schlyter's method, valid 2000–2100,
 * accuracy ~1 arcmin / ~1% distance) — good enough for light-delay computations.
 * Ref: https://stjarnhimlen.se/comp/ppcomp.html
 */

const J2000 = Date.UTC(2000, 0, 1, 12, 0, 0)
const DAY_MS = 86_400_000
const AU_KM = 149_597_870.7
const EARTH_RADIUS_KM = 6378.137
const C_KM_S = 299_792.458 // speed of light

const rad = (d) => (d * Math.PI) / 180
const rev = (x) => x - 360 * Math.floor(x / 360)

export function daysSinceJ2000(date = new Date()) {
  return (date.getTime() - J2000) / DAY_MS
}

function eccentricAnomaly(Mdeg, e) {
  const M = rad(Mdeg)
  let E = M + e * Math.sin(M) * (1 + e * Math.cos(M))
  for (let i = 0; i < 12; i++) {
    const dE = (M - (E - e * Math.sin(E))) / (1 - e * Math.cos(E))
    E += dE
    if (Math.abs(dE) < 1e-9) break
  }
  return E
}

function position(el, d) {
  const N = rad(rev(el.N0 + el.Ndot * d))
  const i = rad(el.i0 + el.idot * d)
  const w = rad(rev(el.w0 + el.wdot * d))
  const e = el.e0 + el.edot * d
  const Mdeg = rev(el.M0 + el.Mdot * d)
  const E = eccentricAnomaly(Mdeg, e)
  const xv = el.a * (Math.cos(E) - e)
  const yv = el.a * Math.sqrt(1 - e * e) * Math.sin(E)
  const v = Math.atan2(yv, xv)
  const r = Math.sqrt(xv * xv + yv * yv)
  const vw = v + w
  const x = r * (Math.cos(N) * Math.cos(vw) - Math.sin(N) * Math.sin(vw) * Math.cos(i))
  const y = r * (Math.sin(N) * Math.cos(vw) + Math.cos(N) * Math.sin(vw) * Math.cos(i))
  const z = r * Math.sin(vw) * Math.sin(i)
  return { x, y, z, r }
}

// Schlyter orbital elements (epochs J2000)
const MARS = { N0: 49.5574, Ndot: 2.11081e-5, i0: 1.8497, idot: -1.78e-8, w0: 286.5016, wdot: 2.92961e-5, a: 1.523688, e0: 0.093405, edot: 2.516e-9, M0: 18.6021, Mdot: 0.529040565 }
const EARTH = { N0: 0, Ndot: 0, i0: 0, idot: 0, w0: 282.9404, wdot: 4.70935e-5, a: 1.00000011, e0: 0.01671, edot: -1.151e-9, M0: 356.047, Mdot: 0.9856002585 }
// Moon elements are GEOCENTRIC; a is in Earth radii.
const MOON = { N0: 125.1228, Ndot: -0.0529538083, i0: 5.1454, idot: 0, w0: 318.0634, wdot: 0.1643583218, a: 60.2666, e0: 0.0549, edot: 0, M0: 115.3654, Mdot: 13.0649929509 }

/** Current Earth–Mars distance in km (heliocentric difference of positions). */
export function earthMarsDistanceKm(date = new Date()) {
  const d = daysSinceJ2000(date)
  const e = position(EARTH, d)
  const m = position(MARS, d)
  const dx = m.x - e.x, dy = m.y - e.y, dz = m.z - e.z
  return Math.sqrt(dx * dx + dy * dy + dz * dz) * AU_KM
}

/** Current Earth–Moon distance in km. */
export function moonDistanceKm(date = new Date()) {
  const d = daysSinceJ2000(date)
  return position(MOON, d).r * EARTH_RADIUS_KM
}

export const lightDelaySeconds = (km) => km / C_KM_S

export function fmtDelay(seconds) {
  if (seconds < 1) return '<1 s'
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  return m > 0 ? `${m} m ${String(s).padStart(2, '0')} s` : `${s} s`
}

export function fmtKm(km) {
  return Math.round(km).toLocaleString('en-US')
}

/** Live ISS position/telemetry — wheretheiss.at open API (community service). */
export async function fetchISS(signal) {
  const r = await fetch('https://api.wheretheiss.at/v1/satellites/25544', { signal })
  if (!r.ok) throw new Error(`ISS API ${r.status}`)
  return r.json() // { latitude, longitude, altitude(km), velocity(km/h), visibility: 'day'|'night', timestamp }
}

/** NASA DONKI — solar flare events (last N days). */
export async function fetchSolarFlares(days = 30, signal) {
  const start = new Date(Date.now() - days * DAY_MS).toISOString().slice(0, 10)
  const r = await fetch(`https://api.nasa.gov/DONKI/FLR?startDate=${start}&api_key=DEMO_KEY`, { signal })
  if (!r.ok) throw new Error(`DONKI ${r.status}`)
  return r.json() // [{ flrID, classType, peakTime, sourceLocation, activeRegionNum, ... }]
}

/** NASA DONKI — solar energetic particle (SEP) events (last N days). */
export async function fetchSEPEvents(days = 90, signal) {
  const start = new Date(Date.now() - days * DAY_MS).toISOString().slice(0, 10)
  const r = await fetch(`https://api.nasa.gov/DONKI/SEP?startDate=${start}&api_key=DEMO_KEY`, { signal })
  if (!r.ok) throw new Error(`DONKI SEP ${r.status}`)
  return r.json()
}

/** NOAA SWPC — official real-time space-weather alerts/warnings/watches (Space Agency Partner data). */
export async function fetchNoaaAlerts(signal) {
  const r = await fetch('https://services.swpc.noaa.gov/products/alerts.json', { signal })
  if (!r.ok) throw new Error(`NOAA ${r.status}`)
  return r.json() // [{ product_id, issue_datetime, message }]
}

/** NASA EPIC — latest full-disc Earth image from DSCOVR at Sun–Earth L1. */
export async function fetchEpicEarth(signal) {
  const r = await fetch('https://api.nasa.gov/EPIC/api/natural?api_key=DEMO_KEY', { signal })
  if (!r.ok) throw new Error(`EPIC ${r.status}`)
  const list = await r.json()
  const latest = list?.[0]
  if (!latest) throw new Error('EPIC empty')
  const dt = latest.date.slice(0, 10).replaceAll('-', '/') // "YYYY/MM/DD"
  return {
    caption: latest.caption,
    date: latest.date,
    url: `https://epic.gsfc.nasa.gov/archive/natural/${dt}/jpg/${latest.image}.jpg`,
  }
}

/** NASA Mars Curiosity rover — latest published photos. */
export async function fetchCuriosityPhotos(signal) {
  const r = await fetch('https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/latest_photos?api_key=DEMO_KEY', { signal })
  if (!r.ok) throw new Error(`Mars photos ${r.status}`)
  const data = await r.json()
  return (data?.latest_photos || []).slice(0, 3).map((p) => ({
    img: p.img_src,
    date: p.earth_date,
    camera: p.camera?.full_name || '—',
    sol: p.sol,
  }))
}

/** Real Moon phase (mean synodic month, epoch 2000-01-06 18:14 UTC new moon). */
export function moonPhase(date = new Date()) {
  const synodic = 29.530588853 * DAY_MS
  const epochNewMoon = Date.UTC(2000, 0, 6, 18, 14)
  let frac = ((date.getTime() - epochNewMoon) % synodic) / synodic
  if (frac < 0) frac += 1
  const illum = (1 - Math.cos(2 * Math.PI * frac)) / 2
  const names = ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent']
  const name = names[Math.round(frac * 8) % 8]
  const daysToNew = (1 - frac) * synodic / DAY_MS
  const daysToFull = (frac < 0.5 ? 0.5 - frac : 1.5 - frac) * synodic / DAY_MS
  return { frac, illum, name, daysToNew, daysToFull }
}

export function timeAgo(iso) {
  const ms = Date.now() - new Date(iso).getTime()
  const h = Math.floor(ms / 3_600_000)
  if (h < 1) return `${Math.max(1, Math.floor(ms / 60_000))} min ago`
  if (h < 24) return `${h} h ago`
  return `${Math.floor(h / 24)} d ago`
}
