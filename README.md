# Zero-G Guide — Junior Astronaut Mission Trainer

**Team Zero-G Guide · NASA Space Apps Challenge 2026**
Challenge: [Build a Junior Astronaut Mission Trainer](https://www.spaceappschallenge.org/2026/challenges/junior-astronaut-mission-trainer/)

A browser game where junior astronauts run a **lunar or Martian outpost** and learn to balance the
four budgets real mission planners juggle: **life support, power, radiation shielding, and food** —
all using **real, citable NASA data**.

## What it does

- Cadets choose **Moon Base Tranquility** or **Mars Base Ares**, then build their base with mission
  credits: solar arrays, RTG nuclear generators, batteries, water recyclers, greenhouses, radiation
  shelters, and a med bay.
- Each sol, the crew consumes real ISS life-support rates (**0.84 kg O₂, 3.5 L water, 1.83 kg food
  per person per day**) while solar output scales with each world's real sunlight (Mars ≈ 43% of
  Earth's; the Moon has 14-day nights).
- Radiation accumulates from real dose measurements — **Curiosity RAD (Mars ≈ 0.7 mSv/day)** and
  **LRO CRaTER (Moon ≈ 1.4 mSv/day)** — and the mission ends if the crew passes NASA's ~600 mSv
  career limit.
- Random events based on real hazards (dust storms, solar particle events, micrometeoroid strikes,
  moonquakes) force trade-off decisions.
- **Mission Academy** quizzes teach real NASA science and reward correct answers.
- Live NASA data is pulled at runtime: the **Astronomy Picture of the Day API** (home screen) and
  the **NASA Image and Video Library API** (Data Sources screen).

## Running it

```bash
npm install
npm run dev      # development
npm run build    # production build in dist/
npm run preview  # serve the production build locally
```

## Deploying (public link for submission)

1. **GitHub Pages:** push this repo to GitHub, then enable Pages (Settings → Pages → Deploy from
   branch `main`, folder `/dist` — or use the Actions workflow). The Vite `base: './'` config means
   it works from any subfolder.
2. **Netlify Drop:** drag the `dist/` folder to https://app.netlify.com/drop for an instant public URL.

## Super Intelligence (SI) disclosure

Per Space Apps rules: this project's **code was developed with the assistance of AI (large language
model) tools**, directed, reviewed, and tested by the human team. **No AI-generated images, audio,
or video** are used. **No NASA logos, flags, or mission identifiers** are used anywhere. NASA imagery
shown via the live Image Library is fetched from NASA's official public API at runtime and is not
AI-generated.

## NASA data sources

Full list with links is in the app (📡 NASA Data Used) and in `src/data/nasaData.js`:

| Source | Used for |
|---|---|
| RAD instrument, Curiosity rover | Mars surface radiation (~0.7 mSv/day) |
| Lunar Reconnaissance Orbiter (CRaTER) | lunar radiation environment (~1.4 mSv/day) |
| NSSDC Mars Fact Sheet | solar irradiance, −63 °C average temp, 24h 39m sol |
| NSSDC Moon Fact Sheet | 28-day day/night cycle, −173 °C to +127 °C |
| InSight Lander | Mars weather measurements |
| ISS ECLSS | per-crew consumption rates, 93% water recovery |
| NASA APOD API (`api.nasa.gov`) | live "Cadet Briefing" |
| NASA Image Library API (`images-api.nasa.gov`) | live image gallery |

© Team Zero-G Guide, 2026. Built for the NASA Space Apps Challenge.
