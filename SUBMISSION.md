# Zero-G Guide — Submission Kit

Ready-to-paste text for the Space Apps project form.

---

## Project Name

> Zero-G Guide

## Project Summary (≈170 words)

> Zero-G Guide is an onboard decision aid for crews operating beyond real-time Earth contact. At Mars, a
> question to Mission Control costs up to 44 minutes round trip, so the crew must decide first and explain
> later. Zero-G Guide reduces live space-weather measurements, the crew dose ledger and computed light-time
> into a prioritized advisory log: every entry carries its severity, its evidence, its source and the actions
> to take. Operators acknowledge advisories into a watch log, the way a real console does.
>
> Three supporting modules use the same numbers. A radiation manager tracks career dose against NASA's
> ~600 mSv limit, applies shielding transmission per source, and plans a 14-sol surface rotation. Eight
> emergency checklists cover the events Earth cannot answer in time. A comm-delay simulation turns the same
> constraints into a training exercise for junior astronauts, with knowledge checks tied to cited NASA
> measurements. Live sources include NOAA SWPC GOES X-ray and proton flux, NASA EPIC/DSCOVR imagery and
> NASA/JPL Curiosity frames. No feed is fabricated; unreachable sources are reported as unreachable.

## Project Details

> **What it does and how it works**
>
> The console is the product. A pure advisory engine takes four inputs — NOAA GOES X-ray flare class,
> integral proton flux, planetary K index and SWPC alerts — plus crew dose state and computed one-way light
> time, and returns a sorted list of advisories. Proton flux above 10 pfu at ≥10 MeV is treated as the S1
> threshold; a flare inside 24 hours raises a separate advisory; career dose above 60% changes the EVA
> posture. Each advisory carries a basis line naming the instrument or catalogue it came from, and three
> numbered crew actions. Acknowledged entries collapse into a watch log, and a new event of the same type
> re-surfaces.
>
> Light time is computed from low-precision orbital elements (Schlyter) and divided by the speed of light.
> The radiation module applies illustrative transmission values to an SEP event (150 mSv) and GCR background
> (0.7 mSv/sol at Mars, Curiosity RAD), then commits planned rotations into the same career ledger. The
> procedures module holds eight checklists written as ordered steps. The simulation consumes life support at
> ISS per-crew rates, scales solar output by each world's measured insolation, and resolves hazards without a
> real-time link.
>
> **Benefits**
>
> The project makes the autonomy problem concrete for students and useful as a demonstration for crews. A
> learner can see why a 10 pfu proton threshold matters, why a water wall beats aluminium against galactic
> cosmic rays, and why a decision made at Mars cannot wait for permission. Because the interface is modelled
> on operational software rather than a game, the same build can be used in a classroom, a hackathon review
> or a mission-support discussion without translation.
>
> **Tools and languages**
>
> React 18, Vite, Tailwind CSS, plain JavaScript. Frontend only, no server, no login. Static deployment.
> NASA data via EPIC, the JPL rover photos API and the NASA Image and Video Library; partner data via NOAA
> SWPC and wheretheiss.at.
>
> **Creativity**
>
> Most space-weather demonstrations show a dashboard of numbers. Zero-G Guide converts the numbers into
> instructions and keeps the evidence attached, which is the part that matters when the link is 22 minutes
> long. The same data model drives the training scenario, so a learner is practising against the same
> thresholds the console uses.
>
> **Factors considered**
>
> Rate limits and offline behaviour (five-minute response cache, honest unreachable states), no API key
> requirement for the primary space-weather feeds, keyboard-free operation, small payload (under 250 kB),
> no NASA branding, and an explicit SI disclosure.

## NASA data links

| Link Text | Link Url |
|---|---|
| NASA EPIC / DSCOVR — full-disc Earth imagery from Sun–Earth L1 | https://epic.gsfc.nasa.gov/ |
| NASA/JPL Mars rover photos API — Curiosity latest frames | https://api.nasa.gov/ |
| NASA Image and Video Library — imagery search | https://images.nasa.gov/ |
| RAD instrument, Curiosity rover — Mars surface dose (~0.7 mSv/sol) | https://science.nasa.gov/mission/mars-science-laboratory-curiosity/ |
| Lunar Reconnaissance Orbiter CRaTER — lunar radiation environment | https://science.nasa.gov/mission/lunar-reconnaissance-orbiter/ |
| NASA-STD-3001 — crew health and medical standards (career dose basis) | https://standards.nasa.gov/standard/NASA/NASA-STD-3001 |
| NASA NSSDC Mars Fact Sheet — insolation, temperature, sol length | https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html |
| NASA NSSDC Moon Fact Sheet — day/night cycle, temperature extremes | https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html |
| NASA InSight — Mars weather measurements | https://science.nasa.gov/mission/insight/ |
| ISS Environmental Control and Life Support System — consumables | https://www.nasa.gov/international-space-station/ |

## Space Agency Partner and other data

| Link Text | Link Url |
|---|---|
| NOAA SWPC — alerts, watches and warnings | https://services.swpc.noaa.gov/products/alerts.json |
| NOAA SWPC — GOES X-ray flares and integral proton flux | https://services.swpc.noaa.gov/json/goes/primary/ |
| NOAA SWPC — planetary K index (1-minute) | https://services.swpc.noaa.gov/json/planetary_k_index_1m.json |
| wheretheiss.at — ISS orbital position and sunlight state | https://wheretheiss.at/ |
| P. Schlyter — low-precision orbital elements (light-time computation) | https://stjarnhimlen.se/comp/ppcomp.html |
| React 18 / Vite / Tailwind CSS — build tooling | https://vite.dev/ |

## Super Intelligence (SI) disclosure

Select every option that matches actual use (LLM code assistance, chat). Suggested text:

> Code and interface text in this project were produced with the assistance of large language model tools
> under team direction, then reviewed, tested and revised by humans. No SI-generated images, audio or video
> appear in the project or the demo. NASA imagery is fetched from NASA's public APIs at runtime and is not
> generated. No NASA logos, flags or mission identifiers are used.

## 30-second demo script

1. **(0–4 s)** Console, Mars profile: "This is Zero-G Guide, an onboard assistant for crews beyond real-time Earth contact. One-way light time to Mars right now is about fifteen minutes."
2. **(4–11 s)** Point at the advisory log: "Live NOAA GOES proton flux, flare class and Kp feed a prioritized advisory list. This one is open; each entry names its source and the three actions to take."
3. **(11–18 s)** Radiation: pick the water-wall shelter. "One hundred and fifty milligray event dose becomes seven and a half inside the shelter. The rotation planner flags EVA on storm-watch sols."
4. **(18–25 s)** Simulation: advance a sol, open an event. "In the drill, the same constraints interrupt the plan with no link to Earth."
5. **(25–30 s)** Data screen: "Every number traces to a NASA or NOAA source. Built by Team Zero-G Guide."

Record with Xbox Game Bar (Win+G), browser full screen. Pre-open the Console, Radiation and Simulation tabs.

## Submission checklist

- [ ] GitHub repo public: `github.com/HassanTarar1/zero-g-guide`
- [ ] Live site deployed, public URL added to the form
- [ ] 30-second demo video uploaded and linked
- [ ] Summary and project details pasted
- [ ] NASA data links added (10 rows)
- [ ] Partner and other data links added (6 rows)
- [ ] SI options checked, disclosure pasted
- [ ] Confirmation checkboxes ticked
- [ ] Submitted before the deadline
