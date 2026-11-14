/**
 * Emergency & operations protocol cards for the Protocol Advisor.
 * Content is based on publicly documented NASA/ISS operational knowledge
 * (crew procedures, NASA-STD-3001 requirements, public ISS references).
 * It is a training aid, not a substitute for official flight rules.
 */
export const PROTOCOLS = [
  {
    id: 'fire',
    title: 'Fire / Smoke Alarm',
    severity: 'CRITICAL',
    tag: 'Life Support',
    steps: [
      'Don breathing protection immediately — smoke, not heat, is the primary killer in microgravity.',
      'Shut down ventilation in the affected module to stop flame and smoke spread (no convection in microgravity — fire spreads via airflow).',
      'Fight the fire with the assigned extinguisher (CO₂/water-mist per module); never fan the flames.',
      'Isolate the module: close hatches and activate smoke detectors sweep procedures.',
      'Report state to Mission Control at the next comm window; log burned material for toxicology.',
    ],
    why: 'In microgravity flames form spherical low-flow fires that are hard to see; ventilation is their oxygen supply.',
    source: 'NASA ISS Crew Operations Manual (public summaries)',
  },
  {
    id: 'depress',
    title: 'Cabin Depressurization / Leak',
    severity: 'CRITICAL',
    tag: 'Habitat Integrity',
    steps: [
      'Confirm with pressure readings — locate the leak by listening at bulkheads or ultrasonic leak detector.',
      'Announce "Depress! Depress! Depress!" and move crew to safe haven / don masks if PO₂ falls.',
      'Isolate the leaking section by closing hatches to protect the rest of the habitat.',
      'Apply patch kit: adhesive patches and clamp blankets for micrometeoroid holes (the 2020 ISS leak was tracked this way).',
      'Re-pressurize from O₂/N₂ reserves, then schedule structural inspection at next safe window.',
    ],
    why: 'On the Moon/Mars, habitat pressure is the only thing between crew and vacuum — isolation buys time for repair.',
    source: 'NASA ISS Leak Localization procedures (public)',
  },
  {
    id: 'co2',
    title: 'CO₂ Partial Pressure Rising',
    severity: 'HIGH',
    tag: 'Life Support',
    steps: [
      'Check scrubber status — swap/regenerate the CO₂ removal unit (CDRA on ISS uses amine beds).',
      'Reduce physical exertion crew-wide; metabolic CO₂ output is the source.',
      'Ventilate: open internal flow between modules to even out local pockets (CO₂ pools in sleeping bags/head areas).',
      'If > 0.5% (5 mmHg): don O₂ masks and switch to backup scrubber path.',
      'Log the failure mode for the next regen cycle; watch for headache/irritability in crew.',
    ],
    why: 'CO₂ above ~0.5% causes cognitive impairment — exactly what a crew cannot afford during an emergency.',
    source: 'NASA human research on CO₂ exposure thresholds',
  },
  {
    id: 'spe',
    title: 'Solar Particle Event (Radiation Storm)',
    severity: 'CRITICAL',
    tag: 'Radiation',
    steps: [
      'Move crew immediately into the storm shelter (water-walled / shielded core).',
      'Abort all EVAs; if outside, return via the shortest route — spacesuits are thin shielding.',
      'Protect unshielded supplies (food, medicine, electronics) inside the shelter volume.',
      'Keep dosimeters active; record dose during the event for career records.',
      'After the event: review cumulative dose vs. career limits before scheduling any new EVA.',
    ],
    why: 'SEP doses can exceed monthly limits in hours; the water wall shelter is the single most protective asset.',
    source: 'NASA Space Radiation Analysis Group guidance',
  },
  {
    id: 'power',
    title: 'Power System Failure / Brownout',
    severity: 'HIGH',
    tag: 'Power',
    steps: [
      'Load-shed immediately: non-critical systems first (science racks, comfort loads, gym).',
      'Protect life support: O₂ generation, CO₂ scrubbing, thermal control, comms stay powered.',
      'Switch to battery bank / RTG; start rotating equipment to avoid deep discharge.',
      'On solar systems: check array orientation and dust/cover status after storms.',
      'Re-balance loads so discharge rate < charge capability at next sun-up.',
    ],
    why: 'Life support is the load you can never shed — everything else is negotiable.',
    source: 'ISS Electrical Power System (public overviews)',
  },
  {
    id: 'medical',
    title: 'Medical Emergency (No Earth Support)',
    severity: 'HIGH',
    tag: 'Crew Health',
    steps: [
      'Stabilize: airway, breathing, circulation — Crew Medical Officer leads, others assist.',
      'Use the Crew Medical Restraint System for exams/treatment in microgravity.',
      'Consult the onboard medical checklist and integrated medical library — designed for non-physician crews.',
      'Telemedicine only if a comm window exists; else document vitals for the next window.',
      'Pharmacy: check stowage locations and expiration; antimicrobial use requires allergy history check.',
    ],
    why: 'With a Mars comm delay of up to ~22 min one-way, crews must be their own first responders.',
    source: 'NASA exploration medical capabilities (public)',
  },
  {
    id: 'comm',
    title: 'Comm Blackout / Delay Management',
    severity: 'MODERATE',
    tag: 'Operations',
    steps: [
      'Compute current one-way light delay (Console module) — it defines your autonomy window.',
      'Pre-plan decisions: under delay, act first on life-support emergencies, report afterward.',
      'Batch non-urgent questions into the next comm window; draft reports while waiting.',
      'If using relay (TDRS/DSN windows are periodic): schedule critical tasks inside predicted windows.',
      'Log every decision with its rationale — Mission Control will reconstruct events later.',
    ],
    why: 'At Mars distance, no help is coming in real time — procedure autonomy is a trained skill, not an improvisation.',
    source: 'NASA autonomous mission operations research',
  },
  {
    id: 'dust',
    title: 'Dust Storm (Mars) / Contamination',
    severity: 'MODERATE',
    tag: 'Surface Ops',
    steps: [
      'Suspend all EVAs — fine dust blinds optics, abrades seals, and electrostatically clings to suits.',
      'Seal the habitat: dust locks/filters on; wipe-down protocol for returning suits.',
      'Shift power plan: solar output can drop >80% — verify battery state and RTG priority.',
      'Protect airlocks: aggressive brush/vacuum of suit exteriors before ingress (per Apollo & Mars mission designs).',
      'Monitor crew for irritation; perchlorate in Martian dust is toxic — no dust in the cabin.',
    ],
    why: 'Martian regolith contains perchlorates and is electrostatic — it is both an engineering and a toxicology hazard.',
    source: 'NASA Mars dust mitigation studies',
  },
]

export const SEVERITY_STYLES = {
  CRITICAL: 'bg-rose-500/15 text-rose-300 border-rose-500/40',
  HIGH: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
  MODERATE: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40',
}
