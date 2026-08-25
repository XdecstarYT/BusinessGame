import type { ReactNode } from 'react'
import { Icon, type IconName } from './icons'
import { panelContainer } from './theme'

interface PanelShellProps {
  icon: IconName
  title: ReactNode
  badge?: ReactNode
  onClose: () => void
  children: ReactNode
  width?: string
  position?: string
  /** Overrides `top` from `position` — used to clear the HUD chrome above
   * the panel when its actual rendered height varies (e.g. the stat bar
   * wrapping onto extra lines on a narrow phone screen). */
  top?: number
}

/** Shared header + glass container for every floating management panel —
 * keeps a single place that defines the "AAA dashboard" look (icon chip,
 * title, close button, panel chrome) so it stays consistent as panels are
 * added or edited. */
export function PanelShell({ icon, title, badge, onClose, children, width = 'w-80', position = 'top-36 right-4', top }: PanelShellProps) {
  return (
    <div
      className={`${panelContainer} ${position} ${width} max-w-[92vw] max-h-[min(28rem,62vh)] hud-panel-enter`}
      style={top !== undefined ? { top } : undefined}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 sticky top-0 bg-[#171a22]/95 backdrop-blur-xl z-10">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-400/25 text-emerald-300 shrink-0">
            <Icon name={icon} size={15} />
          </span>
          <span className="font-semibold text-[13px] tracking-wide truncate">{title}</span>
          {badge}
        </div>
        <button
          onClick={onClose}
          className="flex items-center justify-center w-6 h-6 rounded-md text-white/50 hover:text-white hover:bg-white/10 transition-colors shrink-0"
        >
          <Icon name="x" size={13} />
        </button>
      </div>
      {children}
    </div>
  )
}
