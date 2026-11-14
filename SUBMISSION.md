# Zero-G Guide — Submission Kit

Everything below is ready to paste into the Space Apps project submission form.

---

## Project Name

> Zero-G Guide

## Project Summary (≈170 words — limit 1500 chars)

> Zero-G Guide is the onboard assistant for astronauts when Earth can't answer. A one-way message to
> Mars takes up to ~22 minutes — during a solar radiation storm, that silence is dangerous. Zero-G
> Guide is a web application that watches live NASA data and gives crews (and future crews) four
> tools: an Ops Dashboard with live ISS telemetry, a real-time Earth–Moon–Mars light-delay calculator
> computed from orbital mechanics, and radiation advisories from NASA's DONKI space-weather database;
> a Radiation Manager that tracks cumulative career dose against NASA's ~600 mSv limit using dose
> rates measured by Curiosity's RAD instrument, LRO's CRaTER and ISS telemetry; a Protocol Advisor
> with searchable emergency checklists (fire, cabin leak, CO₂, radiation storms) built from public
> NASA/ISS operational knowledge; and a Comm-Delay Autonomy Trainer — a scenario simulator where
> junior astronauts practice the same life-support, power, radiation and food trade-offs with real
> NASA data. It addresses the challenge by training junior astronauts on the genuine constraints of
> deep-space operations while providing a functional live assistant.

## Project Details (suggested text)

> **What does it do / how does it work?**
> Zero-G Guide is a React web app with two phases. In the base-building phase, cadets choose a
> destination — Moon Base Tranquility or Mars Base Ares — and spend starting credits on infrastructure
> modules. In the mission phase, each "sol" the simulation drains oxygen, water and food at real
> ISS-derived per-crew rates, produces power from solar arrays (scaled by each world's real insolation,
> with 14-day lunar nights and Mars dust storms) and RTG generators, charges/discharges a battery bank,
> and accumulates radiation dose from NASA-measured rates. Random hazard events (solar particle events,
> dust storms, micrometeoroid strikes, greenhouse blight, moonquakes, supply drops) present two-choice
> trade-offs; every 15 sols a Mission Academy quiz tests real NASA science and rewards correct answers.
> The mission is won by surviving the full duration (100 sols on Mars, 84 days on the Moon) and lost if
> a resource hits zero, morale collapses, or cumulative radiation exceeds NASA's ~600 mSv career limit.
>
> **Benefits & intended impact:**
> Students aged ~9–15 (and adults!) internalize why nuclear power matters at the Moon's poles, why
> water recycling is life support, why radiation sheltering is a genuine mission decision, and why
> greenhouses beat shipped food — concepts they meet later in Artemis-era news. Teachers can run the
> game in a single classroom session. It works on any device with a browser, no install, no login.
>
> **Tools & languages:** React 18, Vite, Tailwind CSS, plain JavaScript. Frontend-only (no server
> needed). Live data via the NASA APOD API (api.nasa.gov) and NASA Image and Video Library API
> (images-api.nasa.gov). Deployed as a static site (GitHub Pages / Netlify).
>
> **Creativity:** Rather than abstract "resource bars", every number in the game is a real, citable
> NASA measurement — the game is a playable lesson plan. The SI-assisted build was directed and
> verified by the human team (see SI disclosure).
>
> **Factors considered:** age-appropriate reading level, one-session play length (~10–20 minutes),
> graceful offline behavior if NASA APIs are unreachable, no login/install requirements, and zero
> use of NASA branding (per Space Apps SI rules).

## NASA Data links (paste each row into the form)

| Link Text | Link Url |
|---|---|
| NASA DONKI (Space Weather Database Of Notifications) — live solar flare & SEP advisories | https://api.nasa.gov |
| NASA EPIC / DSCOVR — live full-disc Earth imagery from Sun–Earth L1 | https://epic.gsfc.nasa.gov |
| NASA Mars Curiosity Rover Photos API — "Today on Mars" latest downlink | https://api.nasa.gov |
| RAD Instrument, Curiosity Rover — Mars surface radiation dose (~0.7 mSv/day) | https://science.nasa.gov/mission/mars-science-laboratory-curiosity/ |
| Lunar Reconnaissance Orbiter (CRaTER) — lunar radiation environment (~1.4 mSv/day) | https://science.nasa.gov/mission/lunar-reconnaissance-orbiter/ |
| NASA NSSDC Mars Fact Sheet — insolation, temperature, sol length | https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html |
| NASA NSSDC Moon Fact Sheet — lunar day/night cycle, temperature extremes | https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html |
| NASA ISS Environmental Control and Life Support System — consumption and recycling rates | https://www.nasa.gov/international-space-station/ |
| NASA-STD-3001 — astronaut career radiation limit basis | https://www.nasa.gov/nasa-standards/ |
| NASA Astronomy Picture of the Day (APOD) API — live Cadet Briefing feature | https://api.nasa.gov |
| NASA Image and Video Library API — live gallery feature | https://images.nasa.gov |

### Space Agency Partner & Other Data (add under "Other Data")

| Link Text | Link Url |
|---|---|
| NOAA Space Weather Prediction Center — real-time space-weather alert feed (ALERT/WARNING/WATCH) | https://www.swpc.noaa.gov/ |
| wheretheiss.at — community ISS tracking telemetry (position, altitude, sunlight state) | https://wheretheiss.at/ |
| P. Schlyter low-precision orbital elements method — Earth–Mars–Moon distances and light-delay math | https://stjarnhimlen.se/comp/ppcomp.html |
| React 18 + Vite + Tailwind CSS (build tooling) | https://vitejs.dev/ |

## Super Intelligence (SI) disclosure

Select the options matching your actual use (code generation by LLM / chatbot). Suggested text:

> Code in this project was generated with the assistance of a large language model (chat-based AI)
> under the direction of the team, then reviewed, tested and modified by humans. No SI-generated
> images, audio or video are included in the project or the demo. No NASA logos, flags or mission
> identifiers are used anywhere. Imagery displayed by the live NASA Image Library / APOD features is
> fetched directly from NASA's official APIs at runtime and is not AI-generated.

## 30-second demo video script (record with screen capture)

1. **(0–4 s)** Home screen: "This is Zero-G Guide — a mission trainer where kids run a real Moon or Mars base."
2. **(4–10 s)** Setup screen: pick Mars, show building modules: "Cadets build solar arrays, nuclear generators, water recyclers and greenhouses."
3. **(10–18 s)** Game screen: click "Fly Next Sol" twice; point at gauges: "Every sol burns real NASA oxygen, water and food rates — and radiation accumulates."
4. **(18–25 s)** Trigger/solar flare event modal: "Real hazards force real trade-offs — like NASA's actual storm shelters."
5. **(25–30 s)** Mission Academy quiz → end screen: "Quizzes teach real NASA science. Zero-G Guide — from our team's GitHub, playable in any browser."

Record with Xbox Game Bar (Win+G), keep the browser full screen, pre-stage each screen in tabs.

## Submission checklist

- [ ] GitHub repo pushed and **public**: `github.com/HassanTarar1/zero-g-guide`
- [ ] Live site deployed with a **public URL** (GitHub Pages or Netlify drop of `dist/`)
- [ ] 30-second demo video uploaded (YouTube unlisted-public or Drive anyone-with-link) and linked
- [ ] Project summary + details pasted
- [ ] All 8 NASA data links added
- [ ] Other resources listed (React, Vite, Tailwind docs if desired)
- [ ] SI options checked + disclosure text pasted
- [ ] Both confirmation checkboxes ticked
- [ ] Submit before your local event's deadline
