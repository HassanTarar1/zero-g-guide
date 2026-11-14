import { LOCATIONS, CONSUMPTION, MODULES, EVENTS, QUIZ } from '../data/nasaData'

export function createInitialState(locationKey, modules, creditsLeft) {
  const loc = LOCATIONS[locationKey]
  return {
    locationKey,
    sol: 1,
    crew: 4,
    o2: CONSUMPTION.startO2,
    water: CONSUMPTION.startWater,
    food: CONSUMPTION.startFood,
    battery: 60,
    credits: creditsLeft,
    morale: 100,
    totalDose: 0,
    stormSols: 0,
    modules: { solar: 0, rtg: 0, battery: 0, recycler: 0, greenhouse: 0, shelter: 0, medbay: 0, ...modules },
    log: [`🚀 Mission started at ${loc.name}. Crew of ${4} cadets. Good luck, commander!`],
    pendingEvent: null,
    pendingQuiz: null,
    status: 'running', // running | gameover | victory
    gameOverReason: '',
    lastTick: null, // per-sol summary for the log/HUD
  }
}

export function batteryMax(s) {
  return s.modules.battery * CONSUMPTION.batteryMax
}

export function isDaylight(s) {
  const sol = s.sol
  if (s.locationKey === 'moon') return sol % 28 === 0 ? false : sol % 28 <= 14
  return true // each Mars sol contains a day; battery smooths the night
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v))
}

/**
 * Advance one sol. Returns a new state (pure).
 * If a random event fires, state.pendingEvent is set and the tick is already applied.
 */
export function tick(state) {
  if (state.status !== 'running') return state
  const d = structuredClone(state)
  const loc = LOCATIONS[d.locationKey]

  // ---- Power ----
  const daylight = isDaylight(d)
  const stormFactor = d.stormSols > 0 ? 0.2 : 1
  let production =
    d.modules.solar * MODULES.solar.output * loc.solarFactor * (daylight ? 1 : 0) * stormFactor +
    d.modules.rtg * MODULES.rtg.output
  let demand =
    CONSUMPTION.basePower +
    d.modules.greenhouse * CONSUMPTION.greenhousePower +
    (d.modules.recycler ? CONSUMPTION.recyclerPower : 0)

  let outage = false
  const maxB = batteryMax(d)
  if (production >= demand) {
    d.battery = Math.min(maxB, d.battery + (production - demand) * 0.6)
  } else {
    let deficit = demand - production
    if (d.battery >= deficit) {
      d.battery -= deficit
    } else {
      deficit -= d.battery
      d.battery = 0
      outage = deficit > 0
    }
  }

  // ---- Consumables ----
  const o2Use = d.crew * CONSUMPTION.o2PerCrewPerSol * (outage ? 1.25 : 1)
  const waterUse = d.crew * CONSUMPTION.waterPerCrewPerSol * (d.modules.recycler ? 0.07 : 1) * (outage ? 1.1 : 1)
  const foodProd = outage ? 0 : d.modules.greenhouse * 1.2
  d.o2 -= o2Use
  d.water -= waterUse
  d.food += foodProd - d.crew * CONSUMPTION.foodPerCrewPerSol

  // ---- Radiation ----
  const dose = loc.radiationMSvPerDay * (d.stormSols > 0 ? 1.2 : 1)
  d.totalDose += dose

  // ---- Morale ----
  let moraleDelta = d.modules.medbay ? -1 : -2.5
  const pct = (v, start) => v / start
  const critical =
    pct(d.o2, CONSUMPTION.startO2) < 0.2 ||
    pct(d.water, CONSUMPTION.startWater) < 0.2 ||
    pct(d.food, CONSUMPTION.startFood) < 0.2 ||
    d.battery + production - demand < 10
  if (critical) moraleDelta -= 6
  if (outage) moraleDelta -= 10
  d.morale = clamp(d.morale + moraleDelta, 0, 100)

  // ---- Economy ----
  d.credits += CONSUMPTION.dailyCredits
  if (d.stormSols > 0) d.stormSols -= 1

  d.log.unshift(
    `${loc.flag} ${loc.solLabel} ${d.sol}: power ${production >= demand ? '✅' : '⚠️'} ` +
      `O₂ −${o2Use.toFixed(1)}kg, H₂O −${waterUse.toFixed(1)}L, dose +${dose.toFixed(1)} mSv` +
      (outage ? ' · POWER OUTAGE!' : '') +
      (d.stormSols > 0 ? ' · 🌪️ dust storm' : ''),
  )
  if (d.log.length > 60) d.log.length = 60

  // ---- Move to next sol ----
  d.sol += 1

  // ---- Roll a random event (not on the first two sols) ----
  let event = null
  if (d.sol > 2 && Math.random() < 0.22) {
    const pool = EVENTS.filter((e) => e.condition(d))
    const total = pool.reduce((a, e) => a + e.weight, 0)
    let r = Math.random() * total
    for (const e of pool) {
      r -= e.weight
      if (r <= 0) {
        event = e
        break
      }
    }
  }
  d.pendingEvent = event

  // ---- Mission Academy quiz every 15 sols ----
  if (!event && d.sol > 1 && d.sol % 15 === 0) {
    d.pendingQuiz = QUIZ[Math.floor(Math.random() * QUIZ.length)]
  }

  // ---- Win / lose checks ----
  if (d.o2 <= 0 || d.water <= 0 || d.food <= 0) {
    d.status = 'gameover'
    d.gameOverReason =
      d.o2 <= 0
        ? 'Oxygen ran out. NASA’s life-support engineers design multiple backup systems for exactly this reason.'
        : d.water <= 0
          ? 'Water ran out. Water is life — the ISS recovers 93% of its water to avoid this.'
          : 'Food ran out. Remember: a greenhouse regrows food, shipments don’t.'
  } else if (d.morale <= 0) {
    d.status = 'gameover'
    d.gameOverReason =
      'Crew morale collapsed. Long missions are as much a human challenge as an engineering one.'
  } else if (d.totalDose >= CONSUMPTION.radiationCareerLimitMSv) {
    d.status = 'gameover'
    d.gameOverReason = `Cumulative radiation dose hit ${Math.round(d.totalDose)} mSv — above NASA’s ~600 mSv career limit. Mission control evacuated the crew.`
  } else if (d.sol > loc.missionSols) {
    d.status = 'victory'
  }

  d.lastTick = { outage, production, demand }
  return d
}

export function resolveEvent(state, choiceIndex) {
  const d = structuredClone(state)
  const event = d.pendingEvent
  if (!event) return d
  const loc = LOCATIONS[d.locationKey]
  const result = event.choices[choiceIndex].result(d, loc)
  d.pendingEvent = null
  d.lastEventResult = { title: event.title, text: result }
  return d
}

export function answerQuiz(state, optionIndex) {
  const d = structuredClone(state)
  const q = d.pendingQuiz
  if (!q) return d
  const correct = optionIndex === q.answer
  if (correct) {
    d.credits += 20
    d.morale = clamp(d.morale + 10, 0, 100)
    d.log.unshift(`🎓 Mission Academy passed: +20 credits, morale +10.`)
  } else {
    d.log.unshift(`🎓 Mission Academy review completed — study the explanation!`)
  }
  d.pendingQuiz = null
  d.lastQuizResult = { correct, why: q.why }
  return d
}

export function buildModule(state, moduleId) {
  const d = structuredClone(state)
  const m = MODULES[moduleId]
  if (d.credits < m.cost || d.modules[moduleId] >= m.max) return state
  d.credits -= m.cost
  d.modules[moduleId] += 1
  d.log.unshift(`🔧 Built ${m.name} (−${m.cost} credits).`)
  return d
}

export function finalScore(s) {
  const loc = LOCATIONS[s.locationKey]
  const survived = Math.min(s.sol, loc.missionSols) - 1
  const survival = survived * 10
  const economy = s.credits * 2
  const health = Math.round(s.morale * 3)
  const radiationBonus = Math.max(0, Math.round(1000 - s.totalDose) / 2)
  return {
    survived,
    survival,
    economy,
    health,
    radiationBonus: Math.round(radiationBonus),
    total: Math.round(survival + economy + health + radiationBonus),
  }
}
