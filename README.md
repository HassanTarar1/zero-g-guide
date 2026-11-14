# Zero-G Guide — onboard mission support

**Team Zero-G Guide · NASA Space Apps Challenge 2026**
Challenge: [Build a Junior Astronaut Mission Trainer](https://www.spaceappschallenge.org/2026/challenges/junior-astronaut-mission-trainer/)

A browser-based decision aid for crews operating beyond real-time Earth contact. It converts live
space-weather measurements, crew dose state and computed light-time into a prioritized advisory log —
each entry with its evidence, its source and the actions to take.

## Modules

**01 · Console.** NOAA GOES X-ray flare class, ≥10 MeV and ≥100 MeV proton flux, planetary K index and
SWPC alerts are read live. Advisories are ranked critical → info and acknowledged into a watch log.
One-way light time to Mars and the Moon is computed from orbital elements at light speed. Earth (EPIC)
and Mars (Curiosity) downlink frames are shown with their timestamps.

**02 · Radiation.** Career dose ledger against the ~600 mSv limit, using measured environments: Mars
0.7 mSv/sol (Curiosity RAD), Moon 1.4 mSv/sol (LRO CRaTER), ISS 0.5 mSv/sol. Shielding transmission is
applied per source, and a 14-sol rotation planner flags EVA conflicts on storm-watch sols.

**03 · Procedures.** Eight checklists for the interval when Earth cannot answer: fire, depressurization,
CO₂ rise, solar particle event, power failure, medical emergency, comm blackout, dust storm.

**04 · Simulation.** A resource and radiation exercise under comm delay. Consumables follow ISS per-crew
rates, solar output scales with each world's measured insolation, and hazards interrupt the plan with no
real-time link.

## Data

Live NASA data: [EPIC/DSCOVR](https://epic.gsfc.nasa.gov/), [JPL rover photos](https://api.nasa.gov/),
[NASA Image and Video Library](https://images.nasa.gov/). Partner data: [NOAA SWPC](https://www.swpc.noaa.gov/),
[wheretheiss.at](https://wheretheiss.at/). Physical constants and dose rates from NASA fact sheets, RAD,
CRaTER, ISS ECLSS and NASA-STD-3001. The full list is on the app's **Data & method** screen.

Primary space-weather feeds need no API key. Failed sources are shown as unavailable rather than
substituted.

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
reviewed, tested and revised by humans. No AI-generated images, audio or video are used. NASA imagery is
fetched from NASA's public APIs at runtime. No NASA logos, flags or mission identifiers are used.

© Team Zero-G Guide, 2026.
