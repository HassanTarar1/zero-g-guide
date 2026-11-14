# Zero-G Guide — Submission Kit

Everything below is ready to paste into the Space Apps project form.
Live site: https://hassantarar1.github.io/zero-g-guide/ · Repo: https://github.com/HassanTarar1/zero-g-guide

---

## Project Name

> Zero-G Guide — Junior Astronaut Mission Trainer

## Project Summary (≈160 words)

> Zero-G Guide is a ten-day Moon or Mars outpost game for children aged 4–14. Each day brings one decision and
> two choices, and every choice costs something: air to breathe, power for heat and tools, or radiation dose.
> The mission ends when any of the three runs out, so there is no free move and no dominant strategy — only
> trade-offs of the kind NASA mission planners face. The game is free, needs no account, and runs in any
> browser. Its solar-storm day is priced against live NOAA GOES proton flux and flare data, so the danger the
> child sees is today's real space weather. Short science notes explain each card in plain language and name
> their NASA source. A deeper mission console — live advisories, a radiation dose ledger and emergency
> procedures — is there for older players, parents and judges who want the real numbers behind the game.

## Project Details

> **What it does and how it works**
>
> Play starts with a choice of base. Mars is labelled Easier (radiation ×1.0) and the Moon Harder (×1.3),
> because the Moon has no atmosphere to absorb particles. The player then works through ten day-cards. Each
> card states a problem in one sentence — the base is cold, dust covers the solar panels, a rock sample looks
> strange — and offers two actions. Every action carries visible effect chips (air, power, radiation, science
> report), so the price of a decision is known before it is taken, not after. On top of the chosen action the
> base charges a fixed daily cost of 5 air and 3 power for life support and heat.
>
> The deck holds fourteen cards. Ten are drawn per run: the solar-storm card always falls on day 5, the
> moonquake card appears only on the Moon, the dust-devil card only on Mars, and the remaining cards are
> shuffled and partly omitted, so two runs are never identical. Radiation accumulates and is capped at 100.
> Optional science reports give the win a second dimension: surviving with none reads "The crew survived.
> Earth learned nothing," while three or more reads "The crew made it. Full science."
>
> **The live-data hook**
>
> The solar-storm card is the one card whose numbers change with the real Sun. The app reads NOAA SWPC GOES
> X-ray flares and ≥10 MeV integral proton flux before play. If proton flux is at or above the 10 pfu S1
> threshold, or an X-class flare has just occurred, the card's radiation exposure rises by 90% and the card
> says so, quoting the measured value. Otherwise the card explains that the Sun is quiet but particles are
> forecast. If the feed is unreachable the interface says so and falls back to the forecast rather than
> inventing a number.
>
> **Depth for older players**
>
> The mission console reuses the same NOAA feeds plus the planetary K index and SWPC alerts to produce a
> ranked advisory log, each entry carrying its evidence, source and three numbered crew actions. One-way
> light time to Mars and the Moon is computed from low-precision orbital elements at the speed of light. A
> radiation screen tracks career dose against the ~600 mSv limit with per-source shielding transmission. Eight
> checklists cover fire, depressurization, CO₂ rise, solar particle event, power failure, medical emergency,
> comm blackout and dust storm.
>
> **Tools and languages**
>
> React 18, Vite 6, Tailwind CSS v4, plain JavaScript. Frontend only, no server, no login, static deployment
> under 250 kB. NASA data via EPIC, the JPL rover photos API and the NASA Image and Video Library; partner
> data via NOAA SWPC and wheretheiss.at.
>
> **Creativity and factors considered**
>
> Most space-weather demos show a dashboard. This one turns the same measurements into a decision a
> nine-year-old can make and defend. Balance was tuned by simulation: always picking the first option wins
> about 35% of runs, always the second about 75%, random play about 82%, and reading the trade-offs about
> 100% — so attention is rewarded and a single blind habit is not. Rate limits and offline behaviour are
> handled with a five-minute cache and honest unavailable states. No NASA logos or branding are used, and SI
> use is disclosed below.

## NASA data links

| Link Text | Link Url |
|---|---|
| ISS Environmental Control and Life Support System — daily consumables | https://www.nasa.gov/international-space-station/ |
| NASA/JPL Opportunity rover — dust storms and solar power | https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/ |
| NASA Veggie — growing food on the ISS | https://science.nasa.gov/mission/veggie/ |
| NASA Deep Space Network — antenna pointing and light-time delay | https://www.nasa.gov/communicating-with-missions/dsn/ |
| NASA Apollo Lunar Surface Journal — seismometers and moonquakes | https://www.nasa.gov/history/alsj/ |
| RAD instrument, Curiosity — Mars surface dose (~0.7 mSv/sol) | https://science.nasa.gov/mission/mars-science-laboratory-curiosity/ |
| Lunar Reconnaissance Orbiter CRaTER — lunar radiation environment | https://science.nasa.gov/mission/lunar-reconnaissance-orbiter/ |
| NASA-STD-3001 — crew health standards, career dose basis | https://standards.nasa.gov/standard/NASA/NASA-STD-3001 |
| NASA EPIC / DSCOVR — full-disc Earth imagery from L1 | https://epic.gsfc.nasa.gov/ |
| NASA Open APIs — JPL rover photo frames | https://api.nasa.gov/ |
| NASA NSSDC Mars Fact Sheet — temperature, sol length, insolation | https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html |
| NASA NSSDC Moon Fact Sheet — day/night cycle, temperature extremes | https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html |

## Space Agency Partner and other data

| Link Text | Link Url |
|---|---|
| NOAA SWPC — alerts, watches and warnings | https://services.swpc.noaa.gov/products/alerts.json |
| NOAA SWPC — GOES X-ray flares (latest) | https://services.swpc.noaa.gov/json/goes/primary/xray-flares-latest.json |
| NOAA SWPC — GOES ≥10 MeV integral proton flux | https://services.swpc.noaa.gov/json/goes/primary/integral-protons-1-day.json |
| NOAA SWPC — planetary K index, 1-minute | https://services.swpc.noaa.gov/json/planetary_k_index_1m.json |
| wheretheiss.at — ISS position and sunlight state | https://wheretheiss.at/ |
| P. Schlyter — low-precision orbital elements for light-time | https://stjarnhimlen.se/comp/ppcomp.html |
| React 18 / Vite / Tailwind CSS — build tooling | https://vite.dev/ |

## Super Intelligence (SI) disclosure

Select every option that matches actual use (LLM code assistance, chat). Suggested text:

> Code and interface text in this project were produced with the assistance of large language model tools
> under team direction, then reviewed, tested and revised by humans. No SI-generated images, audio or video
> appear in the project or the demo. NASA and NOAA data are fetched from public endpoints at runtime and are
> not generated. No NASA logos, flags or mission identifiers are used.

## 30-second demo script

1. **(0–4 s)** Start screen. "This is Zero-G Guide, a ten-day outpost game for children. Pick Mars — easier — or the Moon."
2. **(4–9 s)** Click Mars. The first card appears. "One decision a day. Two choices. Every choice has a price, and it is printed on the button."
3. **(9–15 s)** Choose the costlier option. Feedback screen. "Air 78, power 84. The game shows exactly what that cost — and why it is real, with the NASA source."
4. **(15–21 s)** Run forward to day 5, the solar-storm card. "This card is priced by the real Sun: NOAA proton flux and the latest flare, read live before play."
5. **(21–26 s)** End screen. "Survive, and send science home. Three reports is a full mission."
6. **(26–30 s)** Click Mission control. "For older players, the same data drives a real advisory console. Team Zero-G Guide."

Record with Xbox Game Bar (Win+G) in browser full screen. Pre-open the game at the start screen and a second
tab on Mission control. Do one rehearsal run so day 5 is reachable in the take.

## Submission checklist

- [ ] GitHub repo public: `github.com/HassanTarar1/zero-g-guide`
- [ ] Pages enabled (Settings → Pages → Source: **GitHub Actions**) and deploy green
- [ ] Live URL added to the form: `https://hassantarar1.github.io/zero-g-guide/`
- [ ] 30-second demo video uploaded and linked
- [ ] Summary and project details pasted
- [ ] NASA data links added (12 rows)
- [ ] Partner and other data links added (7 rows)
- [ ] SI options checked, disclosure pasted
- [ ] Confirmation checkboxes ticked
- [ ] Submitted before the deadline
