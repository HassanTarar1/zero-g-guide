/**
 * Advisory engine.
 *
 * Pure function: live feed data + crew dose state + mission profile in,
 * prioritized, actionable advisories out. Every advisory cites its basis.
 */

const HOUR = 3_600_000
const CAREER_LIMIT = 600

export const SEVERITY_ORDER = { critical: 0, high: 1, medium: 2, info: 3 }

function fmtAge(ms) {
  const h = ms / HOUR
  if (h < 1) return `${Math.max(1, Math.round(h * 60))} min`
  if (h < 48) return `${Math.round(h)} h`
  return `${Math.round(h / 24)} d`
}

/**
 * @param {object} p
 * @param {'iss'|'moon'|'mars'} p.profile
 * @param {Array|'err'|null} p.noaa      NOAA SWPC alerts
 * @param {Array|'err'|null} p.flares    NOAA GOES X-ray flares (normalized)
 * @param {object|'err'|null} p.protons  NOAA GOES integral proton flux
 * @param {object|'err'|null} p.kp       NOAA planetary K index
 * @param {number} p.doseTotal           cumulative crew dose, mSv
 * @param {string} p.moonPhaseName
 * @param {number} p.moonIllum           0..1
 * @param {string} p.delayText           formatted one-way delay for the active profile
 * @param {Date} p.now
 */
export function buildAdvisories({ profile, noaa, flares, protons, kp, doseTotal = 0, moonPhaseName, moonIllum = 0, delayText, now = new Date() }) {
  const out = []
  const age = (iso) => now.getTime() - new Date(iso).getTime()
  const ageText = (iso) => `${fmtAge(age(iso))} ago`

  const flare = Array.isArray(flares) && flares.length ? flares[0] : null
  const alerts = Array.isArray(noaa) ? noaa : []
  const flux = protons && protons !== 'err' ? protons : null
  const kpNow = kp && kp !== 'err' ? kp.kp : null

  // --- Proton flux: the operational SEP indicator ---
  if (flux && flux.p10 >= 10) {
    const level = flux.p10 >= 100000 ? 'S5' : flux.p10 >= 10000 ? 'S4' : flux.p10 >= 1000 ? 'S3' : flux.p10 >= 100 ? 'S2' : 'S1'
    out.push({
      id: 'proton-storm',
      severity: flux.p10 >= 1000 ? 'critical' : 'high',
      title: 'Proton flux above S1 threshold',
      rationale: `≥10 MeV flux is ${flux.p10.toLocaleString('en-US', { maximumFractionDigits: 1 })} pfu against a 10 pfu threshold (${level}). Sustained flux raises crew dose inside any thin-walled volume.`,
      basis: 'NOAA SWPC — GOES integral proton flux',
      time: flux.updated ? `${flux.updated}Z` : null,
      actions: [
        'Move the crew to the storm shelter.',
        'Suspend EVA and surface work.',
        'Log the exposure window in the dose ledger.',
      ],
    })
  } else if (flux && flux.p10 >= 1) {
    out.push({
      id: 'proton-elevated',
      severity: 'medium',
      title: 'Proton flux elevated, below threshold',
      rationale: `≥10 MeV flux is ${flux.p10.toFixed(2)} pfu. Threshold is 10 pfu. EVA dose rates remain above habitat rates.`,
      basis: 'NOAA SWPC — GOES integral proton flux',
      time: flux.updated ? `${flux.updated}Z` : null,
      actions: ['Shorten any planned EVA.', 'Re-check flux before surface activity.'],
    })
  }

  // --- NOAA solar radiation alert ---
  const radAlert = alerts.find((a) => /Solar Radiation/i.test(a.message) && age(a.issue_datetime) < 24 * HOUR)
  if (radAlert) {
    out.push({
      id: 'noaa-rad',
      severity: 'critical',
      title: 'Solar radiation alert in effect',
      rationale: `SWPC issued the alert ${ageText(radAlert.issue_datetime)}. It remains in force until cancelled.`,
      basis: 'NOAA SWPC — alerts feed',
      time: radAlert.issue_datetime,
      actions: [
        'Treat radiation conditions as degraded.',
        'Restrict exposure to the shelter volume.',
        'Notify the flight surgeon at the next window.',
      ],
    })
  }

  // --- Recent significant flares ---
  if (flare && /X/.test(flare.classType) && age(flare.peakTime) < 24 * HOUR) {
    out.push({
      id: 'xflare',
      severity: 'high',
      title: `X-class flare ${ageText(flare.peakTime)}`,
      rationale: `GOES measured ${flare.classType}. Proton storms usually follow within hours.`,
      basis: 'NOAA SWPC — GOES X-ray flare list',
      time: flare.peakTime,
      actions: [
        'Stage suits and dosimeters for shelter.',
        'Defer non-critical EVA for 24 to 48 h.',
        'Watch the proton-flux advisory for follow-on activity.',
      ],
    })
  } else if (flare && /X/.test(flare.classType) && age(flare.peakTime) < 48 * HOUR) {
    out.push({
      id: 'xflare-after',
      severity: 'medium',
      title: 'Post-X-class environment',
      rationale: `Flare peak was ${ageText(flare.peakTime)}. Particle background can stay elevated for about 48 h.`,
      basis: 'NOAA SWPC — GOES X-ray flare list',
      time: flare.peakTime,
      actions: ['Maintain radiation watch.', 'Prefer habitat operations over surface EVA.'],
    })
  } else if (flare && /M/.test(flare.classType) && age(flare.peakTime) < 24 * HOUR) {
    out.push({
      id: 'mflare',
      severity: 'medium',
      title: `M-class flare ${ageText(flare.peakTime)}`,
      rationale: `GOES measured ${flare.classType}. M-class events can produce modest proton increases.`,
      basis: 'NOAA SWPC — GOES X-ray flare list',
      time: flare.peakTime,
      actions: ['Review dosimeter logs before scheduling exposure.', 'Keep any planned EVA short.'],
    })
  }

  // --- Geomagnetic activity ---
  const geoAlert = alerts.find((a) => /Geomagnetic/i.test(a.message) && age(a.issue_datetime) < 24 * HOUR)
  if (geoAlert || (kpNow !== null && kpNow >= 5)) {
    const level = kpNow !== null && kpNow >= 5 ? `G${Math.max(1, Math.min(5, Math.floor(kpNow) - 4))}` : null
    out.push({
      id: 'geomag',
      severity: kpNow !== null && kpNow >= 7 ? 'high' : 'medium',
      title: kpNow !== null && kpNow >= 5 ? `Geomagnetic storm, Kp ${kpNow.toFixed(0)}` : 'Geomagnetic disturbance',
      rationale: kpNow !== null && kpNow >= 5
        ? `Planetary K index is ${kpNow.toFixed(0)} (${level}). GNSS accuracy and HF links degrade.`
        : `SWPC geomagnetic alert issued ${ageText(geoAlert.issue_datetime)}. GNSS accuracy and HF links degrade.`,
      basis: 'NOAA SWPC — planetary K index / alerts feed',
      time: kpNow !== null && kpNow >= 5 ? kp.updated : geoAlert.issue_datetime,
      actions: ['Cross-check GNSS fixes against inertial nav.', 'Use relay windows for critical uplinks.'],
    })
  }

  // --- Career dose budget ---
  const pct = doseTotal / CAREER_LIMIT
  if (pct >= 0.85) {
    out.push({
      id: 'dose-high',
      severity: 'high',
      title: `Career dose at ${Math.round(pct * 100)}% of limit`,
      rationale: `${Math.round(doseTotal)} mSv against an approximate 600 mSv career limit. Remaining headroom constrains EVA.`,
      basis: 'Crew dose ledger × NASA-STD-3001 limit basis',
      time: null,
      actions: ['Cancel non-essential exposure.', 'Re-plan the rotation with shelter days.', 'Escalate to the flight surgeon.'],
    })
  } else if (pct >= 0.6) {
    out.push({
      id: 'dose-watch',
      severity: 'medium',
      title: `Career dose at ${Math.round(pct * 100)}% of limit`,
      rationale: 'Remaining career headroom argues for selective EVA scheduling.',
      basis: 'Crew dose ledger',
      time: null,
      actions: ['Trim EVA hours in the next rotation.', 'Prefer habitat instruments over surface excursions.'],
    })
  }

  // --- Profile-specific operations ---
  if (profile === 'mars') {
    out.push({
      id: 'mars-delay',
      severity: 'info',
      title: 'No real-time link',
      rationale: `One-way light time is ${delayText}. Decisions complete locally; Mission Control answers after the fact.`,
      basis: 'Computed from low-precision ephemerides at light speed',
      time: null,
      actions: ['Batch non-urgent requests for the next window.', 'Record the rationale for every autonomous decision.'],
    })
  } else if (profile === 'moon') {
    out.push({
      id: 'moon-cycle',
      severity: 'info',
      title: `Lunar cycle: ${moonPhaseName}, ${Math.round(moonIllum * 100)}% illuminated`,
      rationale: 'Surface solar input follows the 28-day cycle. Night removes generation for about 14 days.',
      basis: 'Computed lunar phase (mean synodic month)',
      time: null,
      actions: ['Check battery state against the coming night.', 'Schedule high-power work inside the illuminated window.'],
    })
  }

  if (out.length === 0) {
    out.push({
      id: 'nominal',
      severity: 'info',
      title: 'No active advisories',
      rationale: 'Solar, geomagnetic and dose parameters are inside limits.',
      basis: 'NOAA SWPC + crew dose ledger',
      time: null,
      actions: ['Continue planned operations.'],
    })
  }

  return out.sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])
}

/** Stable acknowledgement key — a new event of the same type re-surfaces. */
export function ackKey(a) {
  return `${a.id}:${a.time ?? 'static'}`
}
