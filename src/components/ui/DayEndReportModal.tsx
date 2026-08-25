import { useDayReport } from '../../stores/useDayReport'
import { WEATHER_DEFINITIONS } from '../../stores/useWeather'
import { Icon } from './icons'

export function DayEndReportModal() {
  const visible = useDayReport((s) => s.visible)
  const report = useDayReport((s) => s.report)
  const dismiss = useDayReport((s) => s.dismiss)

  if (!visible || !report) return null
  const weatherDef = WEATHER_DEFINITIONS[report.weather]

  return (
    <div className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px] z-50">
      <div className="hud-panel-enter w-[26rem] max-w-[92vw] rounded-2xl border border-white/10 bg-gradient-to-b from-[#1c1f29]/98 to-[#111319]/98 backdrop-blur-xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.85)] ring-1 ring-white/[0.06] overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10 flex items-center gap-3 bg-gradient-to-r from-emerald-500/10 to-transparent">
          <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-400/30">
            <Icon name="report" size={18} className="text-emerald-300" />
          </span>
          <div>
            <div className="font-bold text-white tracking-wide">Day {report.day} Complete</div>
            <div className="text-[11px] text-white/50 flex items-center gap-1">
              {weatherDef.icon} {weatherDef.label}
            </div>
          </div>
        </div>
        <div className="px-5 py-4 space-y-1.5 text-xs">
          <Row label="Revenue" value={`$${report.revenue.toFixed(2)}`} />
          <Row label="COGS" value={`-$${report.cogs.toFixed(2)}`} />
          <Row label="Rent" value={`-$${report.rent.toFixed(2)}`} />
          <Row label="Payroll" value={`-$${report.payroll.toFixed(2)}`} />
          {report.shrinkage > 0 && <Row label="Shrinkage" value={`-$${report.shrinkage.toFixed(2)}`} />}
          {report.marketing > 0 && <Row label="Marketing" value={`-$${report.marketing.toFixed(2)}`} />}
          <Row label="Taxes" value={`-$${report.taxes.toFixed(2)}`} />
          <div className="h-px bg-white/10 my-2" />
          <Row label="Net profit" value={`$${report.netProfit.toFixed(2)}`} emphasize positive={report.netProfit >= 0} />
          <div className="h-px bg-white/10 my-2" />
          <Row label="Customers served" value={`${report.customersServed}`} />
          {report.bestSale && <Row label="Best sale" value={`$${report.bestSale.amount.toFixed(2)} (${report.bestSale.label})`} />}
          {report.complaints > 0 && <Row label="Complaints" value={`${report.complaints}`} positive={false} />}
          <div className="h-px bg-white/10 my-2" />
          <Row label="Cash on hand" value={`$${report.cashAfter.toFixed(2)}`} emphasize />
        </div>
        <div className="px-5 pb-5">
          <button
            onClick={dismiss}
            className="w-full px-3 py-2.5 rounded-xl bg-emerald-500/90 border border-emerald-400/50 text-white text-sm font-semibold hover:bg-emerald-400 transition-colors shadow-[0_0_16px_-4px_rgba(52,211,153,0.7)]"
          >
            Continue to Build
          </button>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, emphasize, positive }: { label: string; value: string; emphasize?: boolean; positive?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-white/60">{label}</span>
      <span
        className={
          emphasize
            ? 'font-bold text-sm'
            : positive === undefined
              ? 'font-medium'
              : positive
                ? 'font-medium text-emerald-400'
                : 'font-medium text-red-400'
        }
      >
        {value}
      </span>
    </div>
  )
}
