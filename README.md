# Zero-G Guide — Junior Astronaut Mission Trainer

**Team Zero-G Guide · NASA Space Apps Challenge 2026**
Challenge: [Build a Junior Astronaut Mission Trainer](https://www.spaceappschallenge.org/2026/challenges/junior-astronaut-mission-trainer/)

Live: https://hassantarar1.github.io/zero-g-guide/

A ten-day Moon or Mars outpost game for children aged 4–14. One decision a day, two choices, three bars.
Every choice costs air, power or radiation, and the solar-storm day is priced against live NOAA space-weather
data. Free, no account, static site.

## How it plays

1. **Pick a base.** Mars is easier (radiation ×1.0); the Moon is harder (×1.3, no atmosphere).
2. **Ten days, one card each.** Two actions, each with its cost printed on the button.
3. **Watch three bars.** Air, power and radiation. The base also spends 5 air and 3 power a day on life
   support and heat. If any bar empties, the mission ends.
4. **Send science home.** Optional science reports turn a hollow survival into a full mission. Three is full
   marks; zero gets "The crew survived. Earth learned nothing."

The deck holds fourteen cards. Each run draws ten: the solar-storm card always lands on day 5, the moonquake
card is Moon-only, the dust-devil card is Mars-only, and the rest are shuffled and partly omitted, so two runs
differ.

## The live-data hook

Before play the app reads [NOAA SWPC](https://www.swpc.noaa.gov/) GOES X-ray flares and ≥10 MeV integral
proton flux. If proton flux is at or above the 10 pfu S1 threshold, or an X-class flare has just occurred, the
solar-storm card's radiation cost rises 90% and the card quotes the measured value. If the feed is down the
interface says so and falls back to the forecast — it never invents a number.

## Behind the game

The same measurements drive a mission console for older players, parents and judges:

- **Mission control** — NOAA GOES flare class, proton flux, planetary K index and SWPC alerts become a ranked
  advisory log, each entry with evidence, source and three crew actions. One-way light time to Mars and the
  Moon is computed from orbital elements at light speed.
- **Radiation** — career dose ledger against the ~600 mSv limit, per-source shielding transmission, 14-sol
  rotation planner.
- **Procedures** — eight checklists for fire, depressurization, CO₂ rise, solar particle event, power failure,
  medical emergency, comm blackout and dust storm.

## Data

Live NASA data: [EPIC/DSCOVR](https://epic.gsfc.nasa.gov/), [JPL rover photos](https://api.nasa.gov/),
[NASA Image and Video Library](https://images.nasa.gov/). Partner data: [NOAA SWPC](https://www.swpc.noaa.gov/),
[wheretheiss.at](https://wheretheiss.at/). Physical constants, dose rates and card sources from NASA fact
sheets, RAD, CRaTER, ISS ECLSS, NASA-STD-3001, the Apollo Lunar Surface Journal, Veggie and the Deep Space
Network. The full list is on the app's **Data & method** screen and in [SUBMISSION.md](SUBMISSION.md).

Primary space-weather feeds need no API key. Failed sources are shown as unavailable rather than substituted.

## Running it

```bash
npm install --ignore-scripts   # esbuild postinstall can fail under antivirus
npm run dev                    # development
npm run build                  # production build in dist/
npm run preview                # serve the production build
```

## Deploying

1. **GitHub Pages:** push to `main`, then Settings → Pages → Source: **GitHub Actions**. The included
   workflow builds and publishes. `base: './'` keeps the build portable to a project subpath.
2. **Netlify Drop:** drag `dist/` to https://app.netlify.com/drop for an instant URL.

## Super Intelligence disclosure

Code and interface text were produced with large language model assistance under team direction, then
reviewed, tested and revised by humans. No AI-generated images, audio or video are used. NASA and NOAA data
are fetched from public endpoints at runtime. No NASA logos, flags or mission identifiers are used.

© Team Zero-G Guide, 2026.
