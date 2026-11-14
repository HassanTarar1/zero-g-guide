/**
 * The 10-day mission deck.
 *
 * Every choice costs something. Effects are applied on top of the daily
 * base cost, so the feedback screen shows the full price of the decision.
 */

export const DAILY_COST = { air: -5, power: -3 }

export const MISSIONS = {
  mars: {
    key: 'mars',
    name: 'Mars',
    line: 'Red dust, thin air, cold nights.',
    intro: 'Your crew lands in a small base. Keep them alive for 10 days.',
    radiationNote: 'Mars has a thin atmosphere. It blocks a little radiation.',
    radFactor: 1,
  },
  moon: {
    key: 'moon',
    name: 'Moon',
    line: 'No air, no weather, two weeks of night.',
    intro: 'Your crew lands in a small base. Keep them alive for 10 days.',
    radiationNote: 'The Moon has no atmosphere. Radiation hits harder here.',
    radFactor: 1.3,
  },
}

export const CARDS = [
  {
    id: 'cold',
    title: 'The base is cold',
    text: 'The crew needs heat tonight.',
    choices: [
      { label: 'Turn up the heater', effects: { power: -15 }, outcome: 'The base is warm. The battery is lower.' },
      { label: 'Put on extra suits', effects: { air: -10 }, outcome: 'The crew stays warm, but the air supply drops.' },
    ],
    science: 'Heat and air both run on electricity. Power is never free.',
    source: 'NASA ISS life support',
  },
  {
    id: 'dust',
    title: 'Dust covers the solar panels',
    text: 'Power is falling and the storm is still blowing.',
    choices: [
      { label: 'Clean the panels outside', effects: { power: 18, rad: 16 }, outcome: 'The panels work again. The crew took a dose outside.' },
      { label: 'Wait for the storm to pass', effects: { power: -12, air: -4 }, outcome: 'The storm passes. The base ran on less power.' },
    ],
    science: 'In 2018 dust covered the Opportunity rover’s panels. It never woke up.',
    source: 'NASA/JPL Opportunity mission',
  },
  {
    id: 'storm',
    title: 'A solar storm is coming',
    text: 'Fast particles from the Sun will reach the base.',
    choices: [
      { label: 'Hide in the shelter', effects: { power: -12, rad: 2 }, outcome: 'The crew is safe. The shelter used power.' },
      { label: 'Keep working outside', effects: { power: 8, rad: 26 }, outcome: 'Work continues. The crew absorbed radiation.' },
    ],
    science: 'When proton flux passes 10 pfu, crews stop spacewalks and shelter.',
    source: 'NOAA SWPC GOES proton flux',
  },
  {
    id: 'scrubber',
    title: 'The air scrubber is clogged',
    text: 'Dust is blocking the filter. Carbon dioxide is rising.',
    choices: [
      { label: 'Fix it now', effects: { power: -12, air: 10 }, outcome: 'Fresh air again. The repair used power.' },
      { label: 'Wait until tomorrow', effects: { air: -16 }, outcome: 'The air got worse. The crew feels dizzy.' },
    ],
    science: 'ISS scrubbers remove carbon dioxide all day. Stopping them is dangerous.',
    source: 'NASA ISS life support',
  },
  {
    id: 'crop',
    title: 'The first crop is ready',
    text: 'Lettuce is growing under the lamps.',
    choices: [
      { label: 'Harvest and study it', effects: { air: 12, power: -10, reports: 1 }, outcome: 'The crew eats well and sends a plant sample report.' },
      { label: 'Let it grow one more day', effects: { air: 5, power: -3 }, outcome: 'A small harvest. Less power used, no report.' },
    ],
    science: 'Plants make oxygen, but grow lamps need electricity.',
    source: 'NASA Veggie experiment, ISS',
  },
  {
    id: 'rock',
    title: 'A rock hits the wall',
    text: 'A micrometeorite punched a small hole.',
    choices: [
      { label: 'Patch it from outside', effects: { rad: 12, power: -6, air: 6 }, outcome: 'The hole is sealed. The spacewalk cost radiation.' },
      { label: 'Seal the room and lose the storage', effects: { air: -8, power: -2 }, outcome: 'The leak stops. The crew lost supplies.' },
    ],
    science: 'Micrometeorites travel faster than a bullet. ISS modules use armor.',
    source: 'NASA ISS micrometeoroid protection',
  },
  {
    id: 'earth',
    title: 'Earth is calling',
    text: 'The antenna has one clear hour to send data home.',
    choices: [
      { label: 'Send the science report', effects: { power: -10, reports: 1 }, outcome: 'Data sent. Mission Control has the results.' },
      { label: 'Use the power for heat', effects: { power: -10, air: 8 }, outcome: 'The crew is warm. No report was sent.' },
    ],
    science: 'A message to Mars can take 22 minutes. There is no live call for help.',
    source: 'Computed light time, NASA ephemerides',
  },
  {
    id: 'leak',
    title: 'Water is leaking',
    text: 'A pipe is dripping under the floor.',
    choices: [
      { label: 'Fix it now', effects: { power: -8, air: 4 }, outcome: 'The leak stops. The repair used power.' },
      { label: 'Catch the water in a tank', effects: { power: 4, air: -6 }, outcome: 'The water is saved, but the air is drier.' },
    ],
    science: 'Water is heavy. Recycling it means fewer launches from Earth.',
    source: 'NASA ISS water recovery system',
  },
  {
    id: 'shake',
    title: 'The ground shakes',
    text: 'A moonquake rattles the base for almost a minute.',
    moonOnly: true,
    choices: [
      { label: 'Check the walls outside', effects: { rad: 10, power: -4, air: 5, reports: 1 }, outcome: 'No damage. The crew took a small dose and logged a report.' },
      { label: 'Stay inside and wait', effects: { air: -6, power: -6 }, outcome: 'The base is safe, but air and power dropped.' },
    ],
    science: 'Apollo astronauts left seismometers. The Moon still shakes.',
    source: 'NASA Apollo seismic experiment',
  },
  {
    id: 'devil',
    title: 'A dust devil spins past',
    text: 'It shakes the base and covers the windows.',
    marsOnly: true,
    choices: [
      { label: 'Check the walls outside', effects: { rad: 10, power: -4, air: 5, reports: 1 }, outcome: 'No damage. The crew took a small dose and logged a report.' },
      { label: 'Stay inside and wait', effects: { air: -6, power: -6 }, outcome: 'The base is safe, but air and power dropped.' },
    ],
    science: 'Dust devils on Mars can be taller than a house. Curiosity sees them often.',
    source: 'NASA Curiosity rover',
  },
  {
    id: 'pump',
    title: 'A pump breaks',
    text: 'The spare part is not on the shelf.',
    choices: [
      { label: 'Print it in the workshop', effects: { power: -14, air: 8 }, outcome: 'The pump runs again. Printing used power.' },
      { label: 'Wait for Earth’s next ship', effects: { air: -10 }, outcome: 'The air got worse while the crew waited.' },
    ],
    science: 'Astronauts already print tools on the ISS instead of waiting for a launch.',
    source: 'NASA 3D printing in space',
  },
  {
    id: 'battery',
    title: 'The batteries are cold',
    text: 'Cold batteries hold less power. Tonight will be colder still.',
    choices: [
      { label: 'Warm them with the heater', effects: { power: -10 }, outcome: 'The batteries recover. The heater took the power back.' },
      { label: 'Turn the heat down instead', effects: { air: -9, power: 4 }, outcome: 'The batteries recover. The crew is cold and the air is thinner.' },
    ],
    science: 'Batteries lose capacity in the cold. Mars nights drop below −70 °C.',
    source: 'NASA Mars Fact Sheet',
  },
  {
    id: 'sample',
    title: 'A rock sample looks strange',
    text: 'It might hold a clue about water. Studying it takes power.',
    choices: [
      { label: 'Study it tonight', effects: { power: -8, reports: 1 }, outcome: 'The lab runs all night. A report goes to Earth.' },
      { label: 'Put it in storage', effects: { power: -3 }, outcome: 'The sample is safe. The lab stayed cold.' },
    ],
    science: 'Curiosity reads rocks to learn what Mars was like long ago.',
    source: 'NASA Curiosity rover',
  },
  {
    id: 'antenna',
    title: 'The antenna is off target',
    text: 'Earth is drifting out of the beam. Fixing it means going outside.',
    choices: [
      { label: 'Fix it outside', effects: { rad: 12, power: -4, reports: 1 }, outcome: 'The link is back. The spacewalk cost radiation.' },
      { label: 'Wait for the next pass', effects: { power: -9 }, outcome: 'No report sent. The base kept the dish warm and ready.' },
    ],
    science: 'A deep-space dish must point at Earth with great precision.',
    source: 'NASA Deep Space Network',
  },
]

export const LESSON_SOURCES = [
  'NASA ISS life support',
  'NASA/JPL Opportunity mission',
  'NOAA SWPC GOES proton flux',
  'NASA Veggie experiment, ISS',
  'NASA ISS micrometeoroid protection',
  'Computed light time, NASA ephemerides',
  'NASA ISS water recovery system',
  'NASA Apollo seismic experiment',
  'NASA Curiosity rover',
  'NASA 3D printing in space',
  'NASA Mars Fact Sheet',
  'NASA Deep Space Network',
]
