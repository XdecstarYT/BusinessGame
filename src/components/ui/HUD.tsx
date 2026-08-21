import { useState } from 'react'
import { useGameMode } from '../../stores/useGameMode'
import { useFinance } from '../../stores/useFinance'
import { useGameClock, formatClock } from '../../stores/useGameClock'
import { useCustomers } from '../../stores/useCustomers'
import { useStoreAtmosphere } from '../../stores/useStoreAtmosphere'
import { useReputation } from '../../stores/useReputation'
import { useStoreLayout } from '../../stores/useStoreLayout'
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

type Panel = 'inventory' | 'finance' | 'staff' | 'marketing' | 'supply' | 'corporate' | 'hq' | 'achievements' | 'analytics' | null

export function HUD() {
  const mode = useGameMode((s) => s.mode)
  const setMode = useGameMode((s) => s.setMode)

  const cash = useFinance((s) => s.cash)
  const day = useGameClock((s) => s.day)
  const clockLabel = useGameClock((s) => formatClock(s.dayProgress))
  const activeCustomers = useCustomers((s) => s.activeCount)
  const events = useCustomers((s) => s.events)
  const cleanliness = useStoreAtmosphere((s) => s.cleanliness)
  const reputation = useReputation((s) => s.score)
  const walkLevel = useStoreLayout((s) => s.activeLevel)

  const [panel, setPanel] = useState<Panel>(null)
  const togglePanel = (p: Panel) => setPanel((current) => (current === p ? null : p))

  return (
    <div className="pointer-events-none absolute inset-0 select-none">
      <div className="pointer-events-auto absolute top-4 left-4 flex items-center gap-3 bg-black/70 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg">
        <span className="text-white font-semibold tracking-wide text-sm">🏪 Retail Empire</span>
        <div className="w-px h-5 bg-white/20" />
        <button
          onClick={() => setMode('build')}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            mode === 'build' ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
          }`}
        >
          🔨 Build
        </button>
        <button
          onClick={() => setMode('walk')}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            mode === 'walk' ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
          }`}
        >
          🚶 Walk
        </button>
        <button
          onClick={() => setMode('city')}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            mode === 'city' ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
          }`}
        >
          🗺️ City
        </button>
      </div>

      <div className="pointer-events-auto absolute top-4 right-4 flex flex-col items-end gap-2">
        <div className="flex items-center gap-3 flex-wrap justify-end max-w-lg bg-black/70 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg text-white text-sm">
          <span className="font-semibold text-emerald-400">${cash.toFixed(2)}</span>
          <div className="w-px h-5 bg-white/20" />
          <span className="text-white/70" title={SEASON_LABELS[seasonForDay(day)].label}>
            {dayOfWeekLabel(day)} D{day} · {clockLabel} {SEASON_LABELS[seasonForDay(day)].icon}
          </span>
          {activeHoliday(day) && (
            <span className="text-amber-300 text-xs" title={activeHoliday(day)!.label}>
              {activeHoliday(day)!.icon} {activeHoliday(day)!.label}
            </span>
          )}
          <div className="w-px h-5 bg-white/20" />
          <span className="text-white/70">🧍 {activeCustomers}</span>
          <div className="w-px h-5 bg-white/20" />
          <span className={`text-white/70 ${cleanliness < 40 ? 'text-red-400' : ''}`}>🧹 {Math.round(cleanliness)}%</span>
          <div className="w-px h-5 bg-white/20" />
          <span className={`text-white/70 ${reputation < 40 ? 'text-red-400' : ''}`} title="Reputation">
            ⭐ {Math.round(reputation)}%
          </span>
        </div>

        {mode !== 'city' && (
        <div className="flex items-center gap-2 flex-wrap justify-end max-w-md bg-black/70 backdrop-blur-sm rounded-xl px-3 py-1.5 shadow-lg">
          <button
            onClick={() => togglePanel('inventory')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              panel === 'inventory' ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            📦 Inventory
          </button>
          <button
            onClick={() => togglePanel('staff')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              panel === 'staff' ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            👥 Staff
          </button>
          <button
            onClick={() => togglePanel('marketing')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              panel === 'marketing' ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            📣 Marketing
          </button>
          <button
            onClick={() => togglePanel('supply')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              panel === 'supply' ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            🚚 Supply
          </button>
          <button
            onClick={() => togglePanel('corporate')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              panel === 'corporate' ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            🏦 Corporate
          </button>
          <button
            onClick={() => togglePanel('hq')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              panel === 'hq' ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            🏢 HQ
          </button>
          <button
            onClick={() => togglePanel('achievements')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              panel === 'achievements' ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            🏆 Achievements
          </button>
          <button
            onClick={() => togglePanel('analytics')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              panel === 'analytics' ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            📊 Analytics
          </button>
          <button
            onClick={() => togglePanel('finance')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              panel === 'finance' ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            💰 Finance
          </button>
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

      {mode !== 'city' && panel === 'inventory' && <InventoryPanel onClose={() => setPanel(null)} />}
      {mode !== 'city' && panel === 'staff' && <StaffPanel onClose={() => setPanel(null)} />}
      {mode !== 'city' && panel === 'marketing' && <MarketingPanel onClose={() => setPanel(null)} />}
      {mode !== 'city' && panel === 'supply' && <SupplyChainPanel onClose={() => setPanel(null)} />}
      {mode !== 'city' && panel === 'corporate' && <CorporateFinancePanel onClose={() => setPanel(null)} />}
      {mode !== 'city' && panel === 'hq' && <HQPanel onClose={() => setPanel(null)} />}
      {mode !== 'city' && panel === 'achievements' && <AchievementsPanel onClose={() => setPanel(null)} />}
      {mode !== 'city' && panel === 'analytics' && <AnalyticsPanel onClose={() => setPanel(null)} />}
      {mode !== 'city' && panel === 'finance' && <FinancePanel onClose={() => setPanel(null)} />}
      {mode === 'city' && <CityMapPanel onClose={() => setMode('build')} />}

      {mode === 'walk' && (
        <>
          <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-xs bg-black/60 rounded-full px-3 py-1">
            Click to look around · WASD to move · Esc to release cursor · walk onto stairs to change floors
          </div>
          <div className="pointer-events-none absolute bottom-6 right-4 text-white/80 text-xs bg-black/60 rounded-full px-3 py-1">
            🏢 {walkLevel === 0 ? 'Ground Floor' : `Floor ${walkLevel + 1}`}
          </div>
        </>
      )}

      {mode === 'build' && <BuildToolbar />}

      <EventModal />
      <AchievementToast />
    </div>
  )
}
