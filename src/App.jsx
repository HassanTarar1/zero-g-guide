import { useMemo, useState } from 'react'
import Home from './screens/Home.jsx'
import Dashboard from './screens/Dashboard.jsx'
import Radiation from './screens/Radiation.jsx'
import Advisor from './screens/Advisor.jsx'
import TrainerHub from './screens/TrainerHub.jsx'
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

const TABS = [
  ['dashboard', '📊 Dashboard'],
  ['radiation', '☢️ Radiation'],
  ['advisor', '📋 Protocols'],
  ['trainer', '🎓 Trainer'],
]

function Nav({ screen, go }) {
  const inTrainer = ['setup', 'game', 'end'].includes(screen)
  if (inTrainer) return null
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-2.5">
        <button onClick={() => go('home')} className="text-left">
          <span className="font-display text-sm font-black tracking-widest text-white">ZERO-G GUIDE</span>
          <span className="ml-2 hidden text-[11px] text-slate-500 sm:inline">onboard assistant</span>
        </button>
        <nav className="flex flex-wrap gap-1">
          {TABS.map(([id, label]) => (
            <button
              key={id}
              onClick={() => go(id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                screen === id ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  )
}

export default function App() {
  const [screen, setScreen] = useState('home')
  const [sim, setSim] = useState(null)
  const [infoTab, setInfoTab] = useState('data')

  const go = (s) => {
    setScreen(s)
    window.scrollTo({ top: 0 })
  }

  const launch = (locationKey, modules, creditsLeft) => {
    setSim(createInitialState(locationKey, modules, creditsLeft))
    go('game')
  }

  const showGame = screen === 'game' && sim && sim.status === 'running'
  const showEnd = screen === 'game' && sim && sim.status !== 'running'

  return (
    <div className="relative min-h-screen">
      <Stars />
      <Nav screen={screen} go={go} />
      <div className="relative z-10">
        {screen === 'home' && (
          <Home
            go={go}
            onInfo={() => { setInfoTab('data'); go('info') }}
            onAbout={() => { setInfoTab('about'); go('info') }}
          />
        )}
        {screen === 'dashboard' && <Dashboard onInfo={() => { setInfoTab('data'); go('info') }} />}
        {screen === 'radiation' && <Radiation />}
        {screen === 'advisor' && <Advisor />}
        {screen === 'trainer' && <TrainerHub onStart={() => go('setup')} onInfo={() => { setInfoTab('data'); go('info') }} />}
        {screen === 'setup' && <Setup onBack={() => go('trainer')} onLaunch={launch} />}
        {showGame && <Game sim={sim} setSim={setSim} onQuit={() => { setSim(null); go('trainer') }} />}
        {showEnd && <End sim={sim} onRestart={() => { setSim(null); go('setup') }} onHome={() => { setSim(null); go('trainer') }} onInfo={() => { setInfoTab('data'); go('info') }} />}
        {screen === 'info' && <Info tab={infoTab} setTab={setInfoTab} onBack={() => go('home')} />}
      </div>
    </div>
  )
}
