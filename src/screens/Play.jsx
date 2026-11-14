import { useEffect, useState } from 'react'
import { CARDS, DAILY_COST, MISSIONS } from '../data/story.js'
import { fetchGoesFlares, fetchProtonFlux, cachedFetch } from '../lib/astro.js'

const DAYS = 10
const RAD_LIMIT = 100
const TARGET_REPORTS = 3
const START = { air: 100, power: 100, rad: 0 }

const INK = '#1c1a16'
const MUTED = '#6b6455'
const PAPER = '#f1ebdd'
const CARD = '#fbf7ec'
const TONES = { air: '#2f6690', power: '#a86a12', rad: '#a8433c', reports: '#4b6b3a' }

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n))
const signed = (n) => `${n < 0 ? '−' : n > 0 ? '+' : ''}${Math.abs(n)}`

function shuffle(list) {
  const out = [...list]
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** Ten cards per run: the solar-storm card lands on day 5, the rest vary. */
function buildDeck(missionKey) {
  const eligible = CARDS.filter(
    (c) => !(c.moonOnly && missionKey !== 'moon') && !(c.marsOnly && missionKey !== 'mars'),
  )
  const storm = eligible.find((c) => c.id === 'storm')
  const rest = shuffle(eligible.filter((c) => c.id !== 'storm')).slice(0, DAYS - 1)
  rest.splice(4, 0, storm)
  return rest.filter(Boolean)
}

function pfuText(n) {
  if (n === null || n === undefined) return '—'
  if (n >= 100) return String(Math.round(n))
  if (n >= 10) return n.toFixed(1)
  return n.toFixed(2)
}

function Effects({ effects, radFactor }) {
  const rows = []
  for (const key of ['air', 'power', 'rad', 'reports']) {
    let v = effects[key] || 0
    if (key === 'rad') v = Math.round(v * radFactor)
    if (v !== 0) rows.push([key, v])
  }
  return (
    <span className="flex flex-wrap gap-1.5">
      {rows.map(([key, v]) => (
        <span
          key={key}
          className="num inline-flex items-center gap-1 border px-1.5 py-0.5 text-[10.5px] font-medium"
          style={{ borderColor: TONES[key], color: TONES[key], background: '#fffdf7' }}
        >
          {key === 'reports' ? 'Science report' : key === 'rad' ? 'Radiation' : key === 'air' ? 'Air' : 'Power'}
          <span>{key === 'reports' ? `+${v}` : signed(v)}</span>
        </span>
      ))}
    </span>
  )
}

function Bar({ label, hint, value, tone, warn }) {
  const pct = clamp(value, 0, 100)
  return (
    <div role="group">
      <div className="flex items-baseline justify-between gap-1">
        <span className="text-[13px] font-semibold sm:text-[14px]">{label}</span>
        <span className="num text-[20px] font-semibold leading-none" style={{ color: warn ? '#a8433c' : INK }}>
          {Math.round(value)}
        </span>
      </div>
      <div
        className="play-track mt-2"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pct)}
      >
        <div className="play-fill" style={{ width: `${pct}%`, background: warn ? '#a8433c' : tone }} />
      </div>
      <p className="mt-1.5 text-[10.5px] leading-tight" style={{ color: MUTED }}>
        {hint}
      </p>
    </div>
  )
}

function SunLine({ sun }) {
  let text = 'Checking the Sun…'
  if (sun.state === 'down') text = 'No live Sun link right now. Using the saved forecast.'
  if (sun.state === 'live') {
    text = `NOAA GOES · proton flux ${pfuText(sun.pfu)} pfu${sun.flare ? ` · last flare ${sun.flare}` : ''}`
  }
  return (
    <p className="num text-[10.5px] leading-snug sm:text-[11px]" style={{ color: MUTED }} aria-live="polite">
      {text}
    </p>
  )
}

export default function Play({ go }) {
  const [phase, setPhase] = useState('start')
  const [mission, setMission] = useState(null)
  const [deck, setDeck] = useState([])
  const [pos, setPos] = useState(0)
  const [res, setRes] = useState(START)
  const [reports, setReports] = useState(0)
  const [result, setResult] = useState(null)
  const [sun, setSun] = useState({ state: 'loading', pfu: null, flare: null })

  useEffect(() => {
    let alive = true
    Promise.all([
      cachedFetch('protons', () => fetchProtonFlux()),
      cachedFetch('goesfl', () => fetchGoesFlares()),
    ])
      .then(([p, f]) => {
        if (!alive) return
        setSun({ state: 'live', pfu: p?.p10 ?? null, flare: f?.[0]?.classType ?? null })
      })
      .catch(() => {
        if (alive) setSun({ state: 'down', pfu: null, flare: null })
      })
    return () => {
      alive = false
    }
  }, [])

  const stormLive =
    sun.state === 'live' && ((sun.pfu ?? 0) >= 10 || /^X/i.test(sun.flare || ''))
  const card = deck[pos]

  const begin = (key) => {
    setMission(MISSIONS[key])
    setDeck(buildDeck(key))
    setPos(0)
    setRes(START)
    setReports(0)
    setResult(null)
    setPhase('day')
    window.scrollTo({ top: 0 })
  }

  const choose = (choice) => {
    const radFactor = mission.radFactor
    let effects = choice.effects
    if (card.id === 'storm' && stormLive && effects.rad) {
      effects = { ...effects, rad: Math.round(effects.rad * 1.9) }
    }

    const air = clamp(res.air + (effects.air || 0) + DAILY_COST.air, 0, 100)
    const power = clamp(res.power + (effects.power || 0) + DAILY_COST.power, 0, 100)
    const rad = clamp(res.rad + Math.round((effects.rad || 0) * radFactor), 0, RAD_LIMIT)
    const gained = effects.reports || 0

    const reason =
      air <= 0
        ? 'The air ran out. The crew had to leave the base.'
        : power <= 0
          ? 'The power ran out. The base went dark and cold.'
          : rad >= RAD_LIMIT
            ? 'The crew took too much radiation. They cannot stay outside any longer.'
            : null

    setRes({ air, power, rad })
    setReports((r) => r + gained)
    setResult({
      choice,
      deltas: { air: air - res.air, power: power - res.power, rad: rad - res.rad },
      gained,
      reason,
    })
    setPhase('feedback')
    window.scrollTo({ top: 0 })
  }

  const next = () => {
    if (result?.reason || pos + 1 >= DAYS) {
      setPhase('end')
    } else {
      setPos((p) => p + 1)
      setPhase('day')
    }
    window.scrollTo({ top: 0 })
  }

  const restart = () => {
    setPhase('start')
    setMission(null)
    setDeck([])
    setPos(0)
    setRes(START)
    setReports(0)
    setResult(null)
    window.scrollTo({ top: 0 })
  }

  const won = phase === 'end' && !result?.reason
  const fullMarks = won && reports >= TARGET_REPORTS
  const hollowWin = won && reports === 0

  return (
    <div className="play-surface flex min-h-screen flex-col">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 pb-5 pt-5 sm:px-7 sm:pt-7">
        <header className="flex items-end justify-between gap-4 border-b-2 pb-3" style={{ borderColor: INK }}>
          <div className="min-w-0">
            <p className="play-label">Zero-G Guide</p>
            <p className="font-serif text-[17px] font-semibold leading-tight sm:text-[19px]">
              Junior astronaut trainer
            </p>
          </div>
          {phase === 'start' ? (
            <p className="play-label hidden text-right sm:block">
              Live NASA &amp; NOAA data
              <br />
              No sign-in
            </p>
          ) : (
            <div className="text-right">
              <p className="play-label">Day</p>
              <p className="num text-[22px] font-semibold leading-none">
                {Math.min(pos + 1, DAYS)}
                <span style={{ color: MUTED }}>/{DAYS}</span>
              </p>
            </div>
          )}
        </header>

        {/* ---------------- Start ---------------- */}
        {phase === 'start' && (
          <main>
            <p className="play-label mt-7">Mission brief</p>
            <h1 className="font-serif mt-2 max-w-[24ch] text-[34px] font-semibold leading-[1.06] tracking-tight sm:text-[46px]">
              Keep the crew alive for ten days.
            </h1>
            <p className="mt-3 max-w-[52ch] text-[16px] leading-relaxed sm:text-[17px]" style={{ color: '#4a453a' }}>
              Every day you make one choice. Every choice takes something away. Watch three numbers, and keep them
              from running out.
            </p>

            <div className="mt-5 grid grid-cols-3 gap-2.5 border-y-2 py-3.5" style={{ borderColor: INK }}>
              {[
                ['Air', 'What the crew breathes.', TONES.air],
                ['Power', 'Heat, lights and tools.', TONES.power],
                ['Radiation', 'Sun damage. Keep it low.', TONES.rad],
              ].map(([label, hint, tone]) => (
                <div key={label} className="border-l-2 pl-2.5 first:border-l-0 first:pl-0" style={{ borderColor: '#cfc5b1' }}>
                  <p className="text-[13px] font-semibold" style={{ color: tone }}>
                    {label}
                  </p>
                  <p className="mt-0.5 text-[11.5px] leading-snug" style={{ color: MUTED }}>
                    {hint}
                  </p>
                </div>
              ))}
            </div>

            <p className="play-label mt-6">Choose a base</p>
            <div className="mt-2 grid gap-2.5 sm:grid-cols-2">
              {Object.values(MISSIONS).map((m) => (
                <button
                  key={m.key}
                  onClick={() => begin(m.key)}
                  className="play-choice flex flex-col items-start px-4 py-4 text-left"
                >
                  <span className="flex w-full items-start justify-between gap-2">
                    <span className="font-serif text-[26px] font-semibold leading-none">{m.name}</span>
                    <span className="play-label border px-1.5 py-0.5" style={{ borderColor: INK, color: INK }}>
                      {m.key === 'mars' ? 'Easier' : 'Harder'}
                    </span>
                  </span>
                  <span className="mt-2 text-[13.5px] leading-snug" style={{ color: '#4a453a' }}>
                    {m.line}
                  </span>
                  <span className="mt-3 w-full border-t pt-2" style={{ borderColor: '#cfc5b1' }}>
                    <span className="num text-[10.5px]" style={{ color: MUTED }}>
                      RADIATION ×{m.radFactor.toFixed(1)} · 10 DAYS · CREW OF 4
                    </span>
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-5 border-t-2 pt-3" style={{ borderColor: INK }}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <span className="play-label">Sun watch</span>
                <div className="w-full text-left sm:w-auto sm:text-right">
                  <SunLine sun={sun} />
                  <p className="text-[10.5px]" style={{ color: MUTED }}>
                    Proton flux above 10 pfu means a solar storm. We check the real Sun before you play.
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-6 text-[12px] leading-relaxed" style={{ color: MUTED }}>
              A choice that is free is not a choice. Air, power and radiation push against each other — just as they
              do for NASA mission planners.
            </p>
          </main>
        )}

        {/* ---------------- Day + feedback ---------------- */}
        {(phase === 'day' || phase === 'feedback') && card && (
          <main>
            <div className="mt-4 grid grid-cols-3 gap-x-4 gap-y-2">
              <Bar label="Air" hint="breathing" value={res.air} tone={TONES.air} warn={res.air <= 20} />
              <Bar label="Power" hint="heat and tools" value={res.power} tone={TONES.power} warn={res.power <= 20} />
              <Bar label="Radiation" hint="keep this low" value={res.rad} tone={TONES.rad} warn={res.rad >= 70} />
            </div>

            <div className="mt-4 flex items-center gap-1">
              {Array.from({ length: DAYS }, (_, i) => {
                const done = phase === 'feedback' ? i <= pos : i < pos
                return (
                  <span
                    key={i}
                    className="h-2.5 flex-1 border"
                    style={{ borderColor: INK, background: done ? INK : 'transparent' }}
                  />
                )
              })}
              <span className="num ml-2 text-[10.5px]" style={{ color: MUTED }}>
                {reports > 0 ? `${reports} report${reports === 1 ? '' : 's'}` : `${TARGET_REPORTS} reports = full marks`}
              </span>
            </div>

            {phase === 'day' && (
              <article className="play-card mt-5 px-4 py-4 sm:px-6 sm:py-5">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="play-label">Day {pos + 1} · Your decision</span>
                  <span className="play-label">{mission.name}</span>
                </div>
                <h2 className="font-serif mt-2 text-[27px] font-semibold leading-[1.1] tracking-tight sm:text-[33px]">
                  {card.title}
                </h2>
                <p className="mt-2 max-w-[54ch] text-[16px] leading-relaxed" style={{ color: '#4a453a' }}>
                  {card.text}
                </p>

                {card.id === 'storm' && (
                  <div className="mt-3 border-l-4 py-1 pl-3" style={{ borderColor: TONES.rad, background: '#f7f0e2' }}>
                    <p className="play-label" style={{ color: TONES.rad }}>
                      Live from the Sun
                    </p>
                    <p className="mt-0.5 text-[12.5px] leading-snug" style={{ color: '#4a453a' }}>
                      {sun.state === 'live'
                        ? stormLive
                          ? `Proton flux is ${pfuText(sun.pfu)} pfu. A storm is already reaching the base. Going outside now is dangerous.`
                          : `Proton flux is ${pfuText(sun.pfu)} pfu. The Sun is quiet, but forecasters expect particles.`
                        : sun.state === 'down'
                          ? 'No live Sun link right now. The forecast still calls for particles.'
                          : 'Checking the real Sun…'}
                    </p>
                  </div>
                )}

                <div className="mt-4 grid gap-2">
                  {card.choices.map((choice, i) => (
                    <button key={i} onClick={() => choose(choice)} className="play-choice flex w-full items-start gap-3 px-3.5 py-3 text-left">
                      <span className="num mt-0.5 text-[11px]" style={{ color: MUTED }}>
                        {i + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[16px] font-semibold leading-snug">{choice.label}</span>
                        <span className="mt-1.5 block">
                          <Effects effects={choice.effects} radFactor={mission.radFactor} />
                        </span>
                      </span>
                      <span aria-hidden className="mt-0.5 text-[17px]">
                        →
                      </span>
                    </button>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t pt-2.5" style={{ borderColor: '#cfc5b1' }}>
                  <span className="play-label">{card.id === 'storm' ? 'Forecast' : 'Sun watch'}</span>
                  {card.id === 'storm' ? (
                    <span className="text-[10.5px]" style={{ color: MUTED }}>
                      Storm card · exposure scales with live NOAA data
                    </span>
                  ) : (
                    <SunLine sun={sun} />
                  )}
                </div>
              </article>
            )}

            {phase === 'feedback' && result && (
              <article className="play-card mt-5 px-4 py-4 sm:px-6 sm:py-5">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="play-label">Day {pos + 1} · Result</span>
                  <span className="play-label">{result.choice.label}</span>
                </div>
                <h2 className="font-serif mt-2 text-[25px] font-semibold leading-[1.15] tracking-tight sm:text-[29px]">
                  {result.choice.outcome}
                </h2>

                <div className="mt-4 grid grid-cols-3 border-y-2" style={{ borderColor: INK }}>
                  {[
                    ['Air', result.deltas.air, TONES.air],
                    ['Power', result.deltas.power, TONES.power],
                    ['Radiation', result.deltas.rad, TONES.rad],
                  ].map(([label, value, tone], i) => (
                    <div
                      key={label}
                      className={`py-2.5 ${i > 0 ? 'border-l pl-3' : ''}`}
                      style={{ borderColor: '#cfc5b1' }}
                    >
                      <p className="play-label">{label}</p>
                      <p className="num mt-0.5 text-[24px] font-semibold leading-none" style={{ color: tone }}>
                        {value === 0 ? '0' : signed(value)}
                      </p>
                    </div>
                  ))}
                </div>

                <p className="mt-2 text-[11.5px] leading-snug" style={{ color: MUTED }}>
                  The base itself uses {Math.abs(DAILY_COST.air)} air and {Math.abs(DAILY_COST.power)} power every
                  day, before your choice.
                </p>

                {result.gained > 0 && (
                  <p className="mt-2 inline-block border px-2 py-1 text-[12px] font-medium" style={{ borderColor: TONES.reports, color: TONES.reports }}>
                    Science report sent. Total: {reports} of {TARGET_REPORTS} for full marks.
                  </p>
                )}

                {result.reason && (
                  <p className="mt-3 border-2 px-3 py-2 text-[14px] font-semibold leading-snug" style={{ borderColor: TONES.rad, color: TONES.rad }}>
                    {result.reason}
                  </p>
                )}

                <div className="mt-4 border-l-4 pl-3" style={{ borderColor: INK }}>
                  <p className="play-label">Why this is real</p>
                  <p className="mt-1 text-[13.5px] leading-relaxed" style={{ color: '#3f3a30' }}>
                    {card.science}
                  </p>
                  <p className="num mt-1 text-[10.5px]" style={{ color: MUTED }}>
                    Source · {card.source}
                  </p>
                </div>

                <button
                  onClick={next}
                  className="play-next mt-5 w-full px-4 py-3 text-[15px] font-semibold"
                  style={{ background: INK, color: PAPER }}
                >
                  {result.reason || pos + 1 >= DAYS ? 'See the mission report →' : 'Next day →'}
                </button>
              </article>
            )}

            <div className="mt-4 flex items-center justify-between gap-3">
              <button onClick={restart} className="text-[11px] underline underline-offset-2" style={{ color: MUTED }}>
                Start over
              </button>
              <span className="num text-[10.5px]" style={{ color: MUTED }}>
                {mission.name.toUpperCase()} · CREW 4
              </span>
            </div>
          </main>
        )}

        {/* ---------------- End ---------------- */}
        {phase === 'end' && (
          <main>
            <p className="play-label mt-7">Mission report · {mission.name}</p>
            <h1 className="font-serif mt-2 max-w-[26ch] text-[34px] font-semibold leading-[1.06] tracking-tight sm:text-[44px]">
              {won
                ? hollowWin
                  ? 'The crew survived. Earth learned nothing.'
                  : fullMarks
                    ? 'The crew made it. Full science.'
                    : 'The crew made it.'
                : `The mission ended on day ${pos + 1}.`}
            </h1>
            <p className="mt-3 max-w-[54ch] text-[16px] leading-relaxed" style={{ color: '#4a453a' }}>
              {won
                ? hollowWin
                  ? `Ten days on ${mission.name} with everyone alive, but no reports went home. Hiding is safe. It also leaves the next crew with nothing new.`
                  : fullMarks
                    ? `Ten days on ${mission.name}, all three science reports sent home. The crew is alive and Earth has the data. That is a good mission.`
                    : `Ten days on ${mission.name}. The crew is alive and ${reports} science report${reports === 1 ? '' : 's'} made it home.`
                : `${result?.reason ?? 'The base could not keep going.'} Every mission plan has a limit you only find by testing it.`}
            </p>

            <div className="mt-5 grid grid-cols-3 border-y-2" style={{ borderColor: INK }}>
              {[
                ['Days alive', won ? DAYS : pos],
                ['Reports', reports],
                ['Radiation', Math.round(res.rad)],
              ].map(([label, value], i) => (
                <div key={label} className={`py-3 ${i > 0 ? 'border-l pl-3' : ''}`} style={{ borderColor: '#cfc5b1' }}>
                  <p className="play-label">{label}</p>
                  <p className="num mt-1 text-[26px] font-semibold leading-none">{value}</p>
                </div>
              ))}
            </div>

            <p className="mt-2 text-[12px] leading-relaxed" style={{ color: MUTED }}>
              {won
                ? reports >= TARGET_REPORTS
                  ? 'Full marks for science. You kept the crew alive and sent useful data home.'
                  : `You sent ${reports} science report${reports === 1 ? '' : 's'}. Sending data home is how a mission helps the next one.`
                : `You sent ${reports} report${reports === 1 ? '' : 's'} before the base failed. That data still helps the next crew.`}
            </p>

            <h2 className="play-label mt-6">What you just learned</h2>
            <ul className="mt-2 grid gap-2 border-t-2 pt-3" style={{ borderColor: INK }}>
              {[
                ['01', 'Air and heat share one supply.', 'Every kilowatt spent warming the base is a kilowatt not cleaning the air.'],
                ['02', 'Radiation is the price of going outside.', 'A shelter costs power, but it protects the crew when the Sun turns active.'],
                [
                  '03',
                  'The Sun is real, not a prop.',
                  sun.state === 'live'
                    ? `Today NOAA measured ${pfuText(sun.pfu)} pfu of proton flux${sun.flare ? ` and a ${sun.flare} flare` : ''}.`
                    : 'Today the live feed was unavailable; the forecast used the last known values.',
                ],
              ].map(([n, lead, body]) => (
                <li key={n} className="grid grid-cols-[24px_1fr] gap-2">
                  <span className="num pt-0.5 text-[10.5px]" style={{ color: MUTED }}>
                    {n}
                  </span>
                  <span className="text-[13.5px] leading-relaxed">
                    <span className="font-semibold">{lead}</span> {body}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-wrap gap-2">
              <button onClick={restart} className="play-next px-4 py-2.5 text-[13.5px] font-semibold" style={{ background: INK, color: PAPER }}>
                Fly again
              </button>
              <button
                onClick={() => go('console')}
                className="border-2 px-4 py-2.5 text-[13.5px] font-semibold"
                style={{ borderColor: INK, background: CARD }}
              >
                See the real mission console
              </button>
              <button
                onClick={() => go('info')}
                className="border-2 px-4 py-2.5 text-[13.5px] font-semibold"
                style={{ borderColor: INK, background: CARD }}
              >
                Data &amp; method
              </button>
            </div>

            <p className="mt-6 border-t pt-3 text-[11px] leading-relaxed" style={{ borderColor: '#cfc5b1', color: MUTED }}>
              Sources behind the cards: NASA ISS life support, NASA/JPL Opportunity, NOAA SWPC GOES proton flux,
              NASA Veggie, NASA micrometeoroid protection, NASA water recovery, NASA Apollo seismometers, NASA
              Curiosity, NASA 3D printing, NASA Mars Fact Sheet, NASA Deep Space Network.
            </p>
          </main>
        )}

        <footer className="mt-auto pt-8">
          <div
            className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t pt-2.5 text-[10.5px]"
            style={{ borderColor: '#cfc5b1', color: MUTED }}
          >
            <span>Real data: NOAA SWPC · NASA · JPL · Team Zero-G Guide</span>
            <span className="flex items-center gap-4">
              <button onClick={() => go('console')} className="underline underline-offset-2 hover:text-[#1c1a16]">
                Mission control
              </button>
              <button onClick={() => go('info')} className="underline underline-offset-2 hover:text-[#1c1a16]">
                Data &amp; method
              </button>
            </span>
          </div>
        </footer>
      </div>
    </div>
  )
}
