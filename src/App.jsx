import { useMemo, useState } from 'react'
import Home from './screens/Home.jsx'
import Setup from './screens/Setup.jsx'
import Game from './screens/Game.jsx'
import End from './screens/End.jsx'
import Info from './screens/Info.jsx'
import { createInitialState } from './lib/simulation'

function Stars() {
  const stars = useMemo(
    () =>
      Array.from({ length: 70 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() * 2 + 1,
        delay: Math.random() * 3,
      })),
    [],
  )
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {stars.map((s) => (
        <div
          key={s.id}
          className="star-twinkle absolute rounded-full bg-white"
          style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, animationDelay: `${s.delay}s` }}
        />
      ))}
    </div>
  )
}

export default function App() {
  const [screen, setScreen] = useState('home') // home | setup | game | end | info
  const [sim, setSim] = useState(null) // the live simulation state
  const [infoTab, setInfoTab] = useState('data')

  const go = (s) => setScreen(s)

  const launch = (locationKey, modules, creditsLeft) => {
    setSim(createInitialState(locationKey, modules, creditsLeft))
    go('game')
  }

  const showGame = screen === 'game' && sim && sim.status === 'running'
  const showEnd = screen === 'game' && sim && sim.status !== 'running'

  return (
    <div className="relative min-h-screen">
      <Stars />
      <div className="relative z-10">
        {screen === 'home' && (
          <Home onStart={() => go('setup')} onInfo={() => { setInfoTab('data'); go('info') }} onAbout={() => { setInfoTab('about'); go('info') }} />
        )}
        {screen === 'setup' && <Setup onBack={() => go('home')} onLaunch={launch} />}
        {showGame && <Game sim={sim} setSim={setSim} onQuit={() => { setSim(null); go('home') }} />}
        {showEnd && <End sim={sim} onRestart={() => { setSim(null); go('setup') }} onHome={() => { setSim(null); go('home') }} onInfo={() => { setInfoTab('data'); go('info') }} />}
        {screen === 'info' && <Info tab={infoTab} setTab={setInfoTab} onBack={() => go('home')} />}
      </div>
    </div>
  )
}
