import { useEffect, useState } from 'react'
import Home from './screens/Home.jsx'
import Console from './screens/Console.jsx'
import Radiation from './screens/Radiation.jsx'
import Advisor from './screens/Advisor.jsx'
import TrainerHub from './screens/TrainerHub.jsx'
import Setup from './screens/Setup.jsx'
import Game from './screens/Game.jsx'
import End from './screens/End.jsx'
import Info from './screens/Info.jsx'
import { createInitialState } from './lib/simulation'

const MODULES = [
  { id: 'console', n: '01', label: 'Console', sub: 'Advisory log' },
  { id: 'radiation', n: '02', label: 'Radiation', sub: 'Dose ledger' },
  { id: 'advisor', n: '03', label: 'Procedures', sub: 'Checklists' },
  { id: 'trainer', n: '04', label: 'Simulation', sub: 'Comm-delay drill' },
]

const SHARED = {
  console: 'console',
  radiation: 'radiation',
  advisor: 'advisor',
  trainer: 'trainer',
  setup: 'trainer',
  game: 'trainer',
  end: 'trainer',
}

function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return now.toISOString().slice(11, 19) + 'Z'
}

function Wordmark() {
  return (
    <div className="border-b border-slate-800 px-4 py-4">
      <p className="text-[12px] font-semibold tracking-[0.16em] text-slate-100">ZERO-G GUIDE</p>
      <p className="kicker mt-1">Onboard mission support</p>
    </div>
  )
}

function Rail({ screen, go }) {
  const clock = useClock()
  const active = SHARED[screen] ?? screen
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-52 flex-col border-r border-slate-800 bg-[#0d0e10] md:flex">
      <Wordmark />
      <nav className="flex-1 py-2">
        {MODULES.map((m) => {
          const on = active === m.id
          return (
            <button
              key={m.id}
              onClick={() => go(m.id)}
              className={`group flex w-full items-start gap-3 border-l-2 px-4 py-2.5 text-left transition ${
                on ? 'border-cyan-400 bg-[#15161a]' : 'border-transparent hover:bg-[#131417]'
              }`}
            >
              <span className={`num pt-0.5 text-[10px] ${on ? 'text-cyan-400' : 'text-slate-600'}`}>{m.n}</span>
              <span>
                <span className={`block text-[12px] font-medium ${on ? 'text-slate-100' : 'text-slate-300'}`}>
                  {m.label}
                </span>
                <span className="block text-[10px] text-slate-600">{m.sub}</span>
              </span>
            </button>
          )
        })}
      </nav>
      <div className="border-t border-slate-800 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 bg-lime-400" />
          <span className="num text-[10px] text-slate-400">LINK ACTIVE</span>
        </div>
        <p className="num mt-1 text-[10px] text-slate-600">{clock}</p>
        <button onClick={() => go('info')} className="mt-2 text-[10px] text-slate-500 underline decoration-slate-700 underline-offset-2 hover:text-slate-300">
          Data &amp; method
        </button>
      </div>
    </aside>
  )
}

function TopBar({ screen, go }) {
  const active = SHARED[screen] ?? screen
  return (
    <div className="sticky top-0 z-30 border-b border-slate-800 bg-[#0b0c0d]/95 backdrop-blur md:hidden">
      <div className="flex items-center justify-between px-4 py-2.5">
        <button onClick={() => go('home')} className="text-[11px] font-semibold tracking-[0.16em] text-slate-100">
          ZERO-G GUIDE
        </button>
        <button onClick={() => go('info')} className="kicker">Data</button>
      </div>
      <div className="flex overflow-x-auto border-t border-slate-800">
        {MODULES.map((m) => (
          <button
            key={m.id}
            onClick={() => go(m.id)}
            className={`shrink-0 border-b-2 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] ${
              active === m.id ? 'border-cyan-400 text-slate-100' : 'border-transparent text-slate-500'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function StatusStrip({ screen, go }) {
  const clock = useClock()
  return (
    <div className="mt-8 border-t border-slate-800 bg-[#0d0e10]">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-x-5 gap-y-1 px-5 py-2.5 text-[10px] text-slate-600">
        <span className="num">ZGG 0.9.0</span>
        <span className="num">{clock}</span>
        <span>NOAA SWPC · NASA EPIC · NASA/JPL · wheretheiss.at</span>
        <span className="ml-auto flex items-center gap-4">
          <button onClick={() => go('home')} className="hover:text-slate-300">Brief</button>
          <button onClick={() => go('info')} className="hover:text-slate-300">Method</button>
        </span>
      </div>
    </div>
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
    <div className="min-h-screen">
      <Rail screen={screen} go={go} />
      <div className="md:pl-52">
        <TopBar screen={screen} go={go} />
        <main className="mx-auto min-h-[calc(100vh-72px)] max-w-[1400px]">
          {screen === 'home' && (
            <Home
              go={go}
              onInfo={() => { setInfoTab('data'); go('info') }}
              onAbout={() => { setInfoTab('about'); go('info') }}
            />
          )}
          {screen === 'console' && <Console onInfo={() => { setInfoTab('data'); go('info') }} onRadiation={() => go('radiation')} />}
          {screen === 'radiation' && <Radiation />}
          {screen === 'advisor' && <Advisor />}
          {screen === 'trainer' && <TrainerHub onStart={() => go('setup')} onInfo={() => { setInfoTab('data'); go('info') }} />}
          {screen === 'setup' && <Setup onBack={() => go('trainer')} onLaunch={launch} />}
          {showGame && <Game sim={sim} setSim={setSim} onQuit={() => { setSim(null); go('trainer') }} />}
          {showEnd && <End sim={sim} onRestart={() => { setSim(null); go('setup') }} onHome={() => { setSim(null); go('trainer') }} onInfo={() => { setInfoTab('data'); go('info') }} />}
          {screen === 'info' && <Info tab={infoTab} setTab={setInfoTab} onBack={() => go('home')} />}
        </main>
        <StatusStrip screen={screen} go={go} />
      </div>
    </div>
  )
}
