// Shared visual language for the HUD — every panel, toolbar, and stat
// readout pulls its container/button/text styling from here so the game
// reads as one designed interface instead of independently-styled screens.

export const panelContainer =
  'pointer-events-auto absolute overflow-y-auto rounded-2xl border border-white/10 bg-gradient-to-b from-[#1a1d27]/95 to-[#111319]/97 backdrop-blur-xl shadow-[0_24px_60px_-16px_rgba(0,0,0,0.75)] ring-1 ring-white/[0.06] text-white panel-scroll'

export const chromeBar =
  'pointer-events-auto flex items-center rounded-2xl border border-white/10 bg-gradient-to-b from-[#1a1d27]/92 to-[#111319]/92 backdrop-blur-xl shadow-[0_16px_40px_-14px_rgba(0,0,0,0.7)] ring-1 ring-white/[0.06]'

export const sectionLabel = 'text-[10px] font-semibold uppercase tracking-[0.08em] text-white/40 mb-1.5'

export const rowBase = 'flex items-center gap-2 py-1.5 border-b border-white/[0.06] last:border-b-0'

export const selectCls =
  'bg-white/[0.06] border border-white/10 rounded-md px-1.5 py-1 text-[11px] text-white/80 focus:outline-none focus:border-emerald-400/50 transition-colors'

export const inputCls =
  'bg-white/[0.06] border border-white/10 rounded-md px-2 py-1 text-[11px] text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-400/50 transition-colors'

export const btn = {
  ghost:
    'px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-white/[0.06] border border-white/10 text-white/75 hover:bg-white/[0.12] hover:border-white/20 hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-white/[0.06] disabled:hover:border-white/10 disabled:hover:text-white/75',
  accent:
    'px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-emerald-500/90 border border-emerald-400/50 text-white hover:bg-emerald-400 transition-colors shadow-[0_0_16px_-4px_rgba(52,211,153,0.7)] disabled:opacity-30 disabled:shadow-none disabled:bg-white/10 disabled:border-white/10 disabled:text-white/50',
  gold: 'px-3 py-1.5 rounded-lg text-[13px] font-bold bg-gradient-to-b from-amber-300 to-amber-500 text-[#241a05] hover:from-amber-200 hover:to-amber-400 transition-colors shadow-[0_0_20px_-4px_rgba(251,191,36,0.75)]',
  danger:
    'px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-red-500/10 border border-red-500/30 text-red-300 hover:bg-red-500/20 transition-colors',
} as const

export const navBtn = (active: boolean) =>
  `flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] font-semibold tracking-wide transition-all ${
    active
      ? 'bg-emerald-500 text-white shadow-[0_0_18px_-3px_rgba(52,211,153,0.8)]'
      : 'text-white/60 hover:text-white hover:bg-white/[0.08]'
  }`

export const dockBtn = (active: boolean) =>
  `relative flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
    active ? 'bg-emerald-500 text-white shadow-[0_0_14px_-2px_rgba(52,211,153,0.8)]' : 'text-white/55 hover:text-white hover:bg-white/[0.1]'
  }`

export const statChip = 'flex items-center gap-1.5 text-white/75'

export const divider = 'w-px h-5 bg-white/10'
