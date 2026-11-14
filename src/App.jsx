import { useState } from 'react'
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

const TABS = [
  ['dashboard', 'Dashboard'],
  ['radiation', 'Radiation'],
  ['advisor', 'Protocols'],
  ['trainer', 'Simulation'],
]

function Nav({ screen, go }) {
  const inTrainer = ['setup', 'game', 'end'].includes(screen)
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-[#0a0f1a]/90 backdrop-blur">
      <div className="mx-auto flex h-12 max-w-6xl items-center justify-between px-4">
        <button onClick={() => go('home')} className="flex items-baseline gap-2">
          <span className="text-[13px] font-extrabold tracking-[0.18em] text-white">ZERO-G GUIDE</span>
          <span className="hidden text-[10px] font-medium tracking-widest text-slate-500 sm:inline">MISSION SUPPORT</span>
        </button>
        {!inTrainer && (
          <nav className="flex h-full items-stretch">
            {TABS.map(([id, label]) => (
              <button
                key={id}
                onClick={() => go(id)}
                className={`border-b-2 px-3 text-[11px] font-semibold uppercase tracking-widest transition sm:px-4 ${
                  screen === id
                    ? 'border-cyan-400 text-cyan-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
        )}
        <div className="hidden items-center gap-2 sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-lime-400" />
          <span className="text-[10px] font-semibold tracking-widest text-slate-500">SIM ENV</span>
        </div>
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
      <div className="tech-grid pointer-events-none fixed inset-0 z-0" />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.05),transparent_60%)]" />
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
