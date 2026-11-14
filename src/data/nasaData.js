/**
 * NASA DATA used in Zero-G Guide.
 * Every number here comes from a real, citable NASA source (see SOURCES below).
 * No NASA logos or branding are used anywhere in this project.
 */

export const LOCATIONS = {
  mars: {
    key: 'mars',
    name: 'Mars Base Ares',
    flag: '🔴',
    blurb:
      'A long-duration outpost on Mars. Days (sols) last 24h 39m, sunlight is weak, dust storms can darken your solar panels, and radiation is a constant companion.',
    missionSols: 100,
    solLabel: 'Sol',
    // RAD instrument on NASA's Curiosity rover measured an average surface dose-rate of ~0.7 mSv/day on Mars.
    radiationMSvPerDay: 0.7,
    // Mars receives roughly 43% of the sunlight Earth gets (NASA planetary fact sheet: ~589 W/m² vs 1361 W/m²).
    solarFactor: 0.43,
    avgTempC: -63, // NASA Mars fact sheet average surface temperature
    tempRange: [-95, -5], // measured by NASA's InSight lander near the equator
    dustStormChance: 0.12, // fraction of sols affected by dust events
    gravityG: 0.38,
  },
  moon: {
    key: 'moon',
    name: 'Moon Base Tranquility',
    flag: '🌕',
    blurb:
      'An outpost on the Moon. A lunar day/night cycle lasts ~28 Earth days (14 days of light, 14 of darkness). No atmosphere means solar flares hit fast and hard, and the lunar night is brutally cold.',
    missionSols: 84, // 3 full lunar day/night cycles
    solLabel: 'Day',
    // Data from NASA's Lunar Reconnaissance Orbiter (CRaTER) indicate a lunar surface dose-rate
    // of roughly ~1.4 mSv/day — about twice the Mars surface dose-rate.
    radiationMSvPerDay: 1.4,
    solarFactor: 1.0,
    avgTempC: -20,
    tempRange: [-173, 127], // NASA Moon fact sheet day/night extremes
    gravityG: 0.17,
  },
}

/**
 * Life-support consumption per crew member, based on NASA ISS data:
 *  - ~0.84 kg O2 / person / day
 *  - ~3.5 L water / person / day (ISS recovers ~93% of water via recycling)
 *  - ~1.83 kg food / person / day
 */
export const CONSUMPTION = {
  o2PerCrewPerSol: 0.84, // kg
  waterPerCrewPerSol: 3.5, // L
  foodPerCrewPerSol: 1.83, // kg
  basePower: 30, // units/sol for life support + habitat systems
  greenhousePower: 10, // units/sol per greenhouse
  recyclerPower: 5, // units/sol
  oxygenPower: 8, // units/sol per O2 generator
  oxygenWater: 1, // L water consumed per O2 generator per sol (electrolysis)
  oxygenProd: 0.9, // kg O2 produced per O2 generator per sol
  startO2: 120, // kg stock
  startWater: 180, // L stock
  startFood: 160, // kg stock
  batteryMax: 150, // per battery bank
  dailyCredits: 3, // mission funding per sol
  radiationCareerLimitMSv: 600, // NASA astronaut career radiation limit
  setupCredits: 120,
}

export const MODULES = {
  solar: {
    id: 'solar',
    name: 'Solar Array',
    icon: '🔆',
    cost: 30,
    max: 4,
    output: 45,
    desc: 'Produces 45 power per sol in daylight (× location sunlight). No power at night or in a dust storm.',
    effect: '⚡ +45 power/sol in daylight',
  },
  rtg: {
    id: 'rtg',
    name: 'RTG Nuclear Generator',
    icon: '☢️',
    cost: 45,
    max: 2,
    output: 25,
    desc: 'Radioisotope thermoelectric generator — works day, night and in storms. Curiosity and Perseverance rovers power themselves this way.',
    effect: '⚡ +25 power/sol, always on',
  },
  oxygen: {
    id: 'oxygen',
    name: 'O₂ Generator',
    icon: '⚗️',
    cost: 35,
    max: 2,
    output: 0,
    desc: 'Electrolysis like the ISS Oxygen Generation System: splits water into oxygen to breathe. Needs power and water stock.',
    effect: '🫁 +0.9 O₂/sol each (uses ⚡8 + 💧1)',
  },
  battery: {
    id: 'battery',
    name: 'Battery Bank',
    icon: '🔋',
    cost: 25,
    max: 2,
    output: 0,
    desc: 'Stores surplus daytime power (+150 units) and discharges it during the night. Essential on the Moon.',
    effect: '🔋 +150 storage',
  },
  recycler: {
    id: 'recycler',
    name: 'Water Recycler',
    icon: '💧',
    cost: 35,
    max: 1,
    output: 0,
    desc: 'The ISS recovers about 93% of its water. This cuts your crew’s daily water loss by 93%.',
    effect: '💧 water loss −93%',
  },
  greenhouse: {
    id: 'greenhouse',
    name: 'Greenhouse',
    icon: '🌱',
    cost: 40,
    max: 2,
    output: 12,
    desc: 'Grows 1.2 food/sol each (needs 12 power/sol). On the Moon it needs grow-lights at night.',
    effect: '🌱 +1.2 food/sol each',
  },
  shelter: {
    id: 'shelter',
    name: 'Radiation Shelter',
    icon: '🛡️',
    cost: 30,
    max: 1,
    output: 0,
    desc: 'A shielded storm room. Cuts solar-flare radiation dose by 80%, like the safe areas NASA designs into deep-space habitats.',
    effect: '🛡️ flare dose −80%',
  },
  medbay: {
    id: 'medbay',
    name: 'Med Bay',
    icon: '🏥',
    cost: 20,
    max: 1,
    output: 0,
    desc: 'Keeps the crew healthy and motivated: slows morale loss and softens incident penalties.',
    effect: '🙂 morale −slower',
  },
}

/**
 * Random events. effect(draft) mutates a draft state copy; must return a human-readable result string.
 * d = draft state, loc = LOCATIONS[d.locationKey]
 */
export const EVENTS = [
  {
    id: 'solarFlare',
    title: '☀️ Solar Particle Event!',
    text: 'NASA’s monitoring network has detected a solar flare racing toward your base. Radiation levels are spiking.',
    condition: () => true,
    weight: 3,
    choices: [
      {
        label: '🛡️ Shelter in place for the sol (shelter cuts dose −80%)',
        result: (d, loc) => {
          const shielded = d.modules.shelter > 0
          const dose = loc.radiationMSvPerDay * 4 * (shielded ? 0.2 : 1)
          d.totalDose += dose
          d.morale -= shielded ? 4 : 10
          d.log.push(`Solar flare: crew sheltered. Dose +${dose.toFixed(1)} mSv${shielded ? ' (shelter helped!)' : ''}.`)
          return shielded
            ? `The shelter did its job — dose +${dose.toFixed(1)} mSv, crew safe.`
            : `No shelter built! Dose +${dose.toFixed(1)} mSv. Morale −10.`
        },
      },
      {
        label: '💪 Keep working through the flare',
        result: (d, loc) => {
          const dose = loc.radiationMSvPerDay * 6
          d.totalDose += dose
          d.credits += 8
          d.morale -= 3
          d.log.push(`Solar flare: crew kept working. Dose +${dose.toFixed(1)} mSv, +8 credits earned.`)
          return `Brave move — +8 credits earned, but dose +${dose.toFixed(1)} mSv.`
        },
      },
    ],
  },
  {
    id: 'dustStorm',
    title: '🌪️ Dust Storm Inbound!',
    text: 'A dust storm is sweeping across the region. Solar output will drop by 80% until it passes. (This is exactly what happened to NASA’s InSight lander and Opportunity rover!)',
    condition: (d) => d.locationKey === 'mars',
    weight: 4,
    choices: [
      {
        label: '🪫 Power down non-essentials and ride it out',
        result: (d) => {
          d.stormSols += 5
          d.morale -= 6
          d.log.push('Dust storm: solar output −80% for 5 sols. Crew power-saving mode.')
          return 'Solar output −80% for the next 5 sols. Morale −6.'
        },
      },
      {
        label: '🔋 Burn batteries to keep everything running',
        result: (d) => {
          d.stormSols += 5
          d.battery = Math.max(0, d.battery - 60)
          d.log.push('Dust storm: solar −80% for 5 sols; batteries drained 60 units.')
          return 'Batteries drained −60 units keeping systems live. Storm still −80% solar for 5 sols.'
        },
      },
    ],
  },
  {
    id: 'micrometeorite',
    title: '☄️ Micrometeorite Strike!',
    text: 'A tiny rock moving faster than a rifle bullet punched a pinhole in a water line.',
    condition: () => true,
    weight: 3,
    choices: [
      {
        label: '🔧 Patch it immediately (−5 credits)',
        result: (d) => {
          if (d.credits >= 5) {
            d.credits -= 5
            d.water -= 6
            d.log.push('Micrometeorite: water line patched fast. Lost 6 L.')
            return 'Quick patch! Only 6 L of water lost (−5 credits).'
          }
          d.water -= 18
          d.log.push('Micrometeorite: no credits to patch. Lost 18 L.')
          return 'No credits for a proper patch — 18 L of water lost!'
        },
      },
      {
        label: '🕒 Repair at the end of the sol',
        result: (d) => {
          d.water -= 18
          d.morale -= 4
          d.log.push('Micrometeorite: slow repair. Lost 18 L, morale −4.')
          return '18 L of water lost before repairs finished. Morale −4.'
        },
      },
    ],
  },
  {
    id: 'greenhouseBlight',
    title: '🥀 Greenhouse Blight!',
    text: 'A fungus is spreading through your greenhouse crops — the same challenge NASA studies for growing food in space.',
    condition: (d) => d.modules.greenhouse > 0,
    weight: 2,
    choices: [
      {
        label: '🧪 Treat with antifungal treatment (−10 credits)',
        result: (d) => {
          if (d.credits >= 10) {
            d.credits -= 10
            d.food -= 8
            d.log.push('Greenhouse blight treated. Food −8 kg.')
            return 'Blight treated! Food stock −8 kg, greenhouse saved.'
          }
          d.food -= 20
          d.log.push('Greenhouse blight: no credits, lost 20 kg food.')
          return 'No credits to treat it — 20 kg of food lost!'
        },
      },
      {
        label: '✂️ Remove infected plants',
        result: (d) => {
          d.food -= 16
          d.log.push('Greenhouse blight: infected plants removed. Food −16 kg.')
          return 'Infected plants removed — 16 kg of food lost.'
        },
      },
    ],
  },
  {
    id: 'moonquake',
    title: '🌙 Moonquake!',
    text: 'The lunar crust just shifted — real Apollo missions recorded thousands of moonquakes. Power lines are rattling.',
    condition: (d) => d.locationKey === 'moon',
    weight: 3,
    choices: [
      {
        label: '⚡ Emergency shutdown for one day',
        result: (d) => {
          d.battery = Math.max(0, d.battery - 40)
          d.morale -= 5
          d.log.push('Moonquake: emergency shutdown, battery −40, morale −5.')
          return 'Systems rebooted. Battery −40, morale −5.'
        },
      },
      {
        label: '🔧 Send crew out to fix lines in the dark (risky)',
        result: (d) => {
          d.battery = Math.max(0, d.battery - 15)
          d.morale -= 2
          d.credits += 6
          d.log.push('Moonquake: crew fixed lines in EVA, +6 credits, morale −2.')
          return 'Lines fixed overnight! +6 credits, morale −2.'
        },
      },
    ],
  },
  {
    id: 'crewBirthday',
    title: '🎂 Crew Birthday!',
    text: 'A crewmate is celebrating a birthday 300,000 km from the nearest bakery.',
    condition: () => true,
    weight: 2,
    choices: [
      {
        label: '🎉 Throw a party (−5 food, +15 morale)',
        result: (d) => {
          d.food -= 5
          d.morale = Math.min(100, d.morale + 15)
          d.log.push('Birthday party! Food −5, morale +15.')
          return 'Great party! Morale +15, food −5.'
        },
      },
      {
        label: '📝 Push through the mission plan',
        result: (d) => {
          d.morale -= 8
          d.credits += 4
          d.log.push('No birthday party... morale −8, +4 credits.')
          return 'Work continued. +4 credits, but morale −8.'
        },
      },
    ],
  },
  {
    id: 'supplyDrop',
    title: '📦 Supply Capsule Arrived!',
    text: 'A robotic cargo lander touched down safely with fresh supplies.',
    condition: () => true,
    weight: 3,
    choices: [
      {
        label: '📦 Take the supplies (O₂ +25, water +40, food +30)',
        result: (d) => {
          d.o2 += 25
          d.water += 40
          d.food += 30
          d.log.push('Supply capsule: O₂ +25, water +40, food +30.')
          return 'Supplies secured! O₂ +25, water +40 L, food +30 kg.'
        },
      },
      {
        label: '🔩 Salvage the capsule for parts (+15 credits)',
        result: (d) => {
          d.credits += 15
          d.log.push('Supply capsule salvaged: +15 credits.')
          return 'Capsule salvaged — +15 credits for upgrades.'
        },
      },
    ],
  },
]

/** Mission Academy quiz — every question teaches a real NASA fact. */
export const QUIZ = [
  {
    q: 'A sol (a day on Mars) lasts about…',
    options: ['24 hours', '24 hours 39 minutes', '30 hours', '12 hours'],
    answer: 1,
    why: 'A Martian sol is 24h 39m — close enough to an Earth day that NASA engineers on the Curiosity and Perseverance teams actually switch to "Mars time".',
  },
  {
    q: 'How much radiation does the surface of Mars expose you to each day (measured by the RAD instrument on NASA’s Curiosity rover)?',
    options: ['0.007 mSv', '0.7 mSv', '70 mSv', '7,000 mSv'],
    answer: 1,
    why: 'RAD measured ~0.7 mSv/day on the Martian surface — roughly 25× what people receive on Earth per day from natural sources.',
  },
  {
    q: 'Why do solar panels fail during Martian dust storms?',
    options: ['Dust blocks sunlight', 'Dust freezes the panels', 'Dust is magnetic', 'Dust melts the wiring'],
    answer: 0,
    why: 'Dust dims the Sun by up to ~90%. NASA’s Opportunity rover was lost after a global dust storm blocked its solar panels in 2018.',
  },
  {
    q: 'How long is one full day/night cycle on the Moon?',
    options: ['24 hours', '7 days', 'about 28 Earth days', '365 days'],
    answer: 2,
    why: 'One lunar day+night lasts ~28 Earth days — about 14 days of sunlight followed by 14 days of darkness. That’s why lunar bases need big batteries or nuclear power.',
  },
  {
    q: 'What percent of water does the ISS recycling system recover?',
    options: ['25%', '50%', '93%', '0% — they don’t recycle'],
    answer: 2,
    why: 'NASA’s Environmental Control and Life Support System recovers ~93% of water — even from humidity in cabin air and (yes) urine.',
  },
  {
    q: 'Which power source works during a 14-day lunar night?',
    options: ['Solar panels', 'Wind turbines', 'RTG / nuclear fission', 'Bicycles'],
    answer: 2,
    why: 'Solar is useless during the 14-day lunar night, so NASA is developing nuclear fission surface power for future Artemis bases.',
  },
  {
    q: 'How much food does one astronaut eat per day on the ISS?',
    options: ['~0.18 kg', '~1.83 kg', '~18 kg', '~45 kg'],
    answer: 1,
    why: 'Astronauts eat about 1.83 kg (4 lbs) of packaged food daily — and NASA is testing growing salad crops aboard the ISS.',
  },
  {
    q: 'NASA’s career radiation limit for astronauts is about…',
    options: ['60 mSv', '600 mSv', '6,000 mSv', 'There is none'],
    answer: 1,
    why: 'NASA limits astronauts to roughly a 600 mSv lifetime dose, depending on age and sex — that’s why shielding decisions matter so much.',
  },
  {
    q: 'Why is the Moon’s temperature more extreme than Mars’s?',
    options: ['No atmosphere to hold heat', 'It is closer to the Sun', 'It is made of cheese', 'The Earth heats it'],
    answer: 0,
    why: 'With no atmosphere, lunar surface swings from −173 °C at night to +127 °C at noon. Mars’s thin atmosphere moderates it to about −95 to −5 °C.',
  },
  {
    q: 'What is the main advantage of a greenhouse on Mars over food shipped from Earth?',
    options: ['It regrows continuously', 'It needs no power', 'It works without water', 'It tastes better'],
    answer: 0,
    why: 'Shipped food is finite — every kg costs thousands of dollars to land. Regenerative growth (like NASA’s Veggie experiments on the ISS) is key for long missions.',
  },
]

/** Rotating real NASA facts shown as tips during play. */
export const TIPS = [
  '💡 The ISS crew sees 16 sunrises and 16 sunsets every day — it orbits Earth every 90 minutes.',
  '💡 NASA’s Curiosity and Perseverance rovers are powered by plutonium RTGs — just like our ☢️ module.',
  '💡 Astronauts drink recycled water on the ISS — even from humidity in the cabin air and urine.',
  '💡 A global dust storm silenced NASA’s Opportunity rover forever in 2018. Fly safe, commander!',
  '💡 Some craters at the Moon’s south pole haven’t seen sunlight in billions of years — perfect for hunting ice.',
  '💡 NASA’s Veggie experiment grew lettuce aboard the ISS in 2015 — the astronauts ate space salad!',
  '💡 Sunsets on Mars are blue — its fine dust scatters light differently than Earth’s atmosphere.',
  '💡 Radiation on the Martian surface is about 25× stronger than natural background radiation on Earth.',
  '💡 A Martian sol is only 39 minutes longer than an Earth day — NASA engineers on rover teams live on “Mars time”.',
  '💡 NASA is developing nuclear fission power for Artemis Moon bases — solar alone can’t survive the 14-day night.',
]

/** Public NASA data sources used. Shown in the app and submitted with the project. */
export const SOURCES = [
  {
    name: 'RAD Instrument, NASA Curiosity Rover — Mars surface radiation (~0.7 mSv/day)',
    url: 'https://science.nasa.gov/mission/mars-science-laboratory-curiosity/',
    used: 'Mars daily radiation dose in the simulation and Solar Flare event math',
  },
  {
    name: 'NASA Lunar Reconnaissance Orbiter (CRaTER) — lunar radiation environment',
    url: 'https://science.nasa.gov/mission/lunar-reconnaissance-orbiter/',
    used: 'Moon daily radiation dose (~1.4 mSv/day) and flare penalties',
  },
  {
    name: 'NASA NSSDC Mars Fact Sheet (solar irradiance, temperature, sol length)',
    url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html',
    used: 'Mars solar strength (≈43% of Earth), average temp (−63 °C), sol length (24h 39m)',
  },
  {
    name: 'NASA NSSDC Moon Fact Sheet (day/night cycle, temperature extremes)',
    url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html',
    used: '28-day lunar cycle, −173 °C to +127 °C temperature swing',
  },
  {
    name: 'NASA InSight Lander — Mars weather measurements',
    url: 'https://science.nasa.gov/mission/insight/',
    used: 'Mars surface temperature range shown in base briefings',
  },
  {
    name: 'NASA ISS Environmental Control & Life Support System (water recycling, consumption rates)',
    url: 'https://www.nasa.gov/international-space-station/',
    used: 'Per-crew O₂ (0.84 kg/day), water (3.5 L/day), food (1.83 kg/day) and 93% water recovery',
  },
  {
    name: 'NASA Astronomy Picture of the Day (APOD) API — live "Cadet Briefing"',
    url: 'https://api.nasa.gov',
    used: 'Live astronomy image + explanation on the home screen',
  },
  {
    name: 'NASA Image and Video Library API (images-api.nasa.gov)',
    url: 'https://images.nasa.gov',
    used: 'Live NASA imagery gallery in the Data Sources screen',
  },
]
