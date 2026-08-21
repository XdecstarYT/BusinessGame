import { useState } from 'react'
import { useGameMode, type TimeScale } from '../../stores/useGameMode'
import { useFinance } from '../../stores/useFinance'
import { useGameClock, formatClock } from '../../stores/useGameClock'
import { useCustomers } from '../../stores/useCustomers'
import { useStoreAtmosphere } from '../../stores/useStoreAtmosphere'
import { useReputation } from '../../stores/useReputation'
import { useStoreLayout } from '../../stores/useStoreLayout'
import { useWeather, WEATHER_DEFINITIONS } from '../../stores/useWeather'
import { useGoals } from '../../stores/useGoals'
import { BuildToolbar } from './BuildToolbar'
import { InventoryPanel } from './InventoryPanel'
import { FinancePanel } from './FinancePanel'
import { StaffPanel } from './StaffPanel'
import { MarketingPanel } from './MarketingPanel'
import { CityMapPanel } from './CityMapPanel'
import { SupplyChainPanel } from './SupplyChainPanel'
import { CorporateFinancePanel } from './CorporateFinancePanel'
import { HQPanel } from './HQPanel'
import { dayOfWeekLabel, seasonForDay, activeHoliday } from '../../systems/calendar'
import { SEASON_LABELS } from '../../data/calendar'
import { EventModal } from './EventModal'
import { AchievementToast } from './AchievementToast'
import { AchievementsPanel } from './AchievementsPanel'
import { AnalyticsPanel } from './AnalyticsPanel'
import { LiveTicker } from './LiveTicker'
import { DayEndReportModal } from './DayEndReportModal'
import { GoalToast } from './GoalToast'
import { TouchControls } from './TouchControls'
import { resetLiveCustomers } from '../../systems/customerSimulation'
import { isTouchDevice } from '../../systems/touchInput'
import { Icon, type IconName } from './icons'
import { chromeBar, navBtn, dockBtn, statChip, divider, btn } from './theme'

const SPEED_OPTIONS: TimeScale[] = [1, 2, 4]

type Panel = 'inventory' | 'finance' | 'staff' | 'marketing' | 'supply' | 'corporate' | 'hq' | 'achievements' | 'analytics' | null

const PANEL_DOCK: { key: Exclude<Panel, null>; label: string; icon: IconName }[] = [
  { key: 'inventory', label: 'Inventory', icon: 'box' },
  { key: 'staff', label: 'Staff', icon: 'users' },
  { key: 'marketing', label: 'Marketing', icon: 'megaphone' },
  { key: 'supply', label: 'Supply Chain', icon: 'truck' },
  { key: 'corporate', label: 'Corporate', icon: 'bank' },
  { key: 'hq', label: 'HQ', icon: 'building' },
  { key: 'achievements', label: 'Achievements', icon: 'trophy' },
  { key: 'analytics', label: 'Analytics', icon: 'barChart' },
  { key: 'finance', label: 'Finance', icon: 'dollar' },
]

export function HUD() {
  const mode = useGameMode((s) => s.mode)
  const setMode = useGameMode((s) => s.setMode)
  const phase = useGameMode((s) => s.phase)
  const startDay = useGameMode((s) => s.startDay)
  const endDay = useGameMode((s) => s.endDay)
  const cameraStyle = useGameMode((s) => s.cameraStyle)
  const setCameraStyle = useGameMode((s) => s.setCameraStyle)
  const timeScale = useGameMode((s) => s.timeScale)
  const setTimeScale = useGameMode((s) => s.setTimeScale)
  const paused = useGameMode((s) => s.paused)
  const togglePaused = useGameMode((s) => s.togglePaused)

  const cash = useFinance((s) => s.cash)
  const day = useGameClock((s) => s.day)
  const clockLabel = useGameClock((s) => formatClock(s.dayProgress))
  const activeCustomers = useCustomers((s) => s.activeCount)
  const events = useCustomers((s) => s.events)
  const cleanliness = useStoreAtmosphere((s) => s.cleanliness)
  const reputation = useReputation((s) => s.score)
  const walkLevel = useStoreLayout((s) => s.activeLevel)
  const weather = useWeather((s) => s.current)
  const weatherDef = WEATHER_DEFINITIONS[weather]
  const goal = useGoals((s) => s.goal)
  const goalProgress = useGoals((s) => s.progress)
  const goalDaysIntoWeek = useGoals((s) => s.daysIntoWeek)

  const handleEndDay = () => {
    useGameClock.getState().forceRollover()
    resetLiveCustomers()
    endDay()
  }

  const [panel, setPanel] = useState<Panel>(null)
  const togglePanel = (p: Panel) => setPanel((current) => (current === p ? null : p))
  const [isTouch] = useState(() => isTouchDevice())

  return (
    <div
      className="pointer-events-none absolute inset-0 select-none"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      {mode === 'walk' && isTouch && <TouchControls />}

      {/* Top-left: brand + phase controls */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 max-w-[min(30rem,46vw)]">
        <div className={`${chromeBar} flex-wrap gap-1 px-2.5 py-2`}>
          <div className="flex items-center gap-2 pl-1 pr-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 text-[#04140d] shadow-[0_0_14px_-2px_rgba(52,211,153,0.7)]">
              <Icon name="building" size={15} />
            </span>
            <span className="text-white font-extrabold tracking-wide text-[14px]">RETAIL EMPIRE</span>
          </div>
          <div className={divider} />
          {phase === 'build' ? (
            <>
              <button onClick={() => setMode('build')} className={navBtn(mode === 'build')}>
                <Icon name="build" size={15} />
                Build
              </button>
              <button onClick={() => setMode('walk')} className={navBtn(mode === 'walk')}>
                <Icon name="walk" size={15} />
                Walk
              </button>
              <button onClick={() => setMode('city')} className={navBtn(mode === 'city')}>
                <Icon name="city" size={15} />
                City
              </button>
              <div className={divider} />
              <button onClick={startDay} className={`${btn.gold} flex items-center gap-1.5 ml-0.5`} title="Open the store and run a live day">
                <Icon name="play" size={13} />
                Start Day
              </button>
            </>
          ) : (
            <>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] font-semibold bg-red-500/15 border border-red-400/30 text-red-300">
                <span className="relative flex w-2 h-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-400" />
                </span>
                Store Open
              </span>
              <button
                onClick={handleEndDay}
                className={`${btn.ghost} flex items-center gap-1.5 !py-1.5 ml-0.5`}
                title="Close the store early and return to planning"
              >
                <Icon name="stop" size={12} />
                End Day
              </button>
            </>
          )}
        </div>

        {phase === 'play' && (
          <div className={`${chromeBar} flex-wrap gap-1.5 px-2.5 py-2`}>
            <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/40 mr-0.5">Speed</span>
            {SPEED_OPTIONS.map((s) => (
              <button key={s} onClick={() => setTimeScale(s)} className={navBtn(timeScale === s && !paused)}>
                {s}x
              </button>
            ))}
            <button onClick={togglePaused} className={navBtn(paused)} title={paused ? 'Resume' : 'Pause'}>
              <Icon name={paused ? 'play' : 'pause'} size={14} />
            </button>
            <div className={divider} />
            <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/40 mr-0.5">View</span>
            <button onClick={() => setCameraStyle('freeroam')} className={navBtn(cameraStyle === 'freeroam')} title="Free-roam camera">
              <Icon name="walk" size={14} />
            </button>
            <button onClick={() => setCameraStyle('cinematic')} className={navBtn(cameraStyle === 'cinematic')} title="Cinematic camera">
              <Icon name="camera" size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Top-right: live stat readout + panel dock */}
      <div className="pointer-events-auto absolute top-4 right-4 flex flex-col items-end gap-2 max-w-[min(32rem,46vw)]">
        <div className={`${chromeBar} gap-3 flex-wrap justify-end px-4 py-2 text-sm`}>
          <span className="flex items-center gap-1.5">
            <Icon name="dollar" size={15} className="text-emerald-400" />
            <span className="font-extrabold text-emerald-400 text-base tracking-tight">${cash.toFixed(2)}</span>
          </span>
          <div className={divider} />
          <span className={statChip} title={SEASON_LABELS[seasonForDay(day)].label}>
            <Icon name="calendar" size={14} className="text-white/40" />
            <span className="text-[13px]">
              {dayOfWeekLabel(day)} D{day} · {clockLabel} {SEASON_LABELS[seasonForDay(day)].icon}
            </span>
          </span>
          {activeHoliday(day) && (
            <span className="text-amber-300 text-xs" title={activeHoliday(day)!.label}>
              {activeHoliday(day)!.icon} {activeHoliday(day)!.label}
            </span>
          )}
          <div className={divider} />
          <span className={statChip} title={weatherDef.label}>
            <span className="text-sm leading-none">{weatherDef.icon}</span>
          </span>
          <div className={divider} />
          <span className={statChip} title="Customers in store">
            <Icon name="person" size={14} className="text-white/40" />
            <span className="text-[13px]">{activeCustomers}</span>
          </span>
          <div className={divider} />
          <span className={statChip} title="Cleanliness">
            <Icon name="droplet" size={14} className={cleanliness < 40 ? 'text-red-400' : 'text-white/40'} />
            <span className={`text-[13px] ${cleanliness < 40 ? 'text-red-400' : ''}`}>{Math.round(cleanliness)}%</span>
          </span>
          <div className={divider} />
          <span className={statChip} title="Reputation">
            <Icon name="star" size={14} className={reputation < 40 ? 'text-red-400' : 'text-amber-300'} />
            <span className={`text-[13px] ${reputation < 40 ? 'text-red-400' : ''}`}>{Math.round(reputation)}%</span>
          </span>
          <div className={divider} />
          <span className={statChip} title={goal.label}>
            <Icon name="target" size={14} className="text-sky-300" />
            <span className="text-[13px]">
              {goal.kind === 'reputationFloor' ? `${goalDaysIntoWeek}/7d` : `${Math.round(goalProgress)}/${goal.target}`}
            </span>
          </span>
        </div>

        {phase === 'build' && mode !== 'city' && (
          <div className={`${chromeBar} flex-wrap justify-end gap-1 px-2 py-1.5`}>
            {PANEL_DOCK.map(({ key, label, icon }) => (
              <button key={key} onClick={() => togglePanel(key)} className={dockBtn(panel === key)} title={label}>
                <Icon name={icon} size={16} />
              </button>
            ))}
          </div>
        )}
      </div>

      {events.length > 0 && (
        <div className="pointer-events-none absolute bottom-4 right-4 flex flex-col items-end gap-1">
          {events.slice(0, 3).map((event, i) => (
            <div key={i} className="text-[11px] text-white/80 bg-black/60 rounded-full px-3 py-1" style={{ opacity: 1 - i * 0.25 }}>
              {event}
            </div>
          ))}
        </div>
      )}

      {phase === 'build' && mode !== 'city' && panel === 'inventory' && <InventoryPanel onClose={() => setPanel(null)} />}
      {phase === 'build' && mode !== 'city' && panel === 'staff' && <StaffPanel onClose={() => setPanel(null)} />}
      {phase === 'build' && mode !== 'city' && panel === 'marketing' && <MarketingPanel onClose={() => setPanel(null)} />}
      {phase === 'build' && mode !== 'city' && panel === 'supply' && <SupplyChainPanel onClose={() => setPanel(null)} />}
      {phase === 'build' && mode !== 'city' && panel === 'corporate' && <CorporateFinancePanel onClose={() => setPanel(null)} />}
      {phase === 'build' && mode !== 'city' && panel === 'hq' && <HQPanel onClose={() => setPanel(null)} />}
      {phase === 'build' && mode !== 'city' && panel === 'achievements' && <AchievementsPanel onClose={() => setPanel(null)} />}
      {phase === 'build' && mode !== 'city' && panel === 'analytics' && <AnalyticsPanel onClose={() => setPanel(null)} />}
      {phase === 'build' && mode !== 'city' && panel === 'finance' && <FinancePanel onClose={() => setPanel(null)} />}
      {phase === 'build' && mode === 'city' && <CityMapPanel onClose={() => setMode('build')} />}

      {mode === 'walk' && (
        <>
          <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-xs bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/10">
            {isTouch
              ? phase === 'play'
                ? 'Joystick to move · drag right side to look — store is open, simulation running'
                : 'Joystick to move · drag right side to look · walk onto stairs to change floors'
              : phase === 'play'
                ? 'Click to look around · WASD to move · Esc to release cursor — store is open, simulation running'
                : 'Click to look around · WASD to move · Esc to release cursor · walk onto stairs to change floors'}
          </div>
          <div className="pointer-events-none absolute bottom-6 right-4 flex items-center gap-1.5 text-white/80 text-xs bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/10">
            <Icon name="building" size={12} className="text-white/50" />
            {walkLevel === 0 ? 'Ground Floor' : `Floor ${walkLevel + 1}`}
          </div>
        </>
      )}

      {mode === 'build' && <BuildToolbar />}
      {phase === 'play' && <LiveTicker />}

      <EventModal />
      <AchievementToast />
      <GoalToast />
      <DayEndReportModal />
    </div>
  )
}
