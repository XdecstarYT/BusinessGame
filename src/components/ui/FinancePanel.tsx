import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { DAILY_RENT, useFinance } from '../../stores/useFinance'
import { useStaff } from '../../stores/useStaff'
import { useGameClock } from '../../stores/useGameClock'
import { computeDaySummary } from '../../systems/financeTick'
import { PanelShell } from './PanelShell'
import { sectionLabel } from './theme'

interface FinancePanelProps {
  onClose: () => void
  top?: number
}

export function FinancePanel({ onClose, top }: FinancePanelProps) {
  const cash = useFinance((s) => s.cash)
  const dailyRevenue = useFinance((s) => s.dailyRevenue)
  const dailyCogs = useFinance((s) => s.dailyCogs)
  const dailyShrinkage = useFinance((s) => s.dailyShrinkage)
  const dailyMarketing = useFinance((s) => s.dailyMarketing)
  const history = useFinance((s) => s.history)
  const payroll = useStaff((s) => s.totalDailyPayroll())
  const day = useGameClock((s) => s.day)

  const grossProfit = dailyRevenue - dailyCogs
  const estimatedSummary = computeDaySummary({
    day,
    revenue: dailyRevenue,
    cogs: dailyCogs,
    rent: DAILY_RENT,
    payroll,
    shrinkage: dailyShrinkage,
    marketing: dailyMarketing,
  })
  const chartData = history.map((d) => ({ day: `D${d.day}`, profit: Math.round(d.profit * 100) / 100 }))

  return (
    <PanelShell icon="dollar" title="Finance" onClose={onClose} top={top}>
      <div className="px-4 py-3 space-y-1.5">
        <Row label="Cash on hand" value={`$${cash.toFixed(2)}`} emphasize />
        <Row label="Revenue (today)" value={`$${dailyRevenue.toFixed(2)}`} />
        <Row label="COGS (today)" value={`$${dailyCogs.toFixed(2)}`} />
        <Row label="Gross profit (today)" value={`$${grossProfit.toFixed(2)}`} positive={grossProfit >= 0} />
        <Row label="Rent (due at close)" value={`$${DAILY_RENT.toFixed(2)}`} />
        <Row label="Payroll (due at close)" value={`$${payroll.toFixed(2)}`} />
        <Row label="Shrinkage (theft, today)" value={`$${dailyShrinkage.toFixed(2)}`} positive={dailyShrinkage === 0} />
        <Row label="Marketing (today)" value={`$${dailyMarketing.toFixed(2)}`} />
        <Row label="Taxes (est., due at close)" value={`$${estimatedSummary.taxes.toFixed(2)}`} />
      </div>

      <div className="px-4 py-3 border-t border-white/10">
        <div className={sectionLabel}>Daily profit history</div>
        {chartData.length === 0 ? (
          <div className="text-xs text-white/40 italic">Profit history appears after your first full day.</div>
        ) : (
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#111318', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: 'rgba(255,255,255,0.7)' }}
                  formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Profit']}
                />
                <Bar dataKey="profit" radius={[3, 3, 0, 0]} isAnimationActive={false}>
                  {chartData.map((d, i) => (
                    <Cell key={i} fill={d.profit >= 0 ? '#34d399' : '#f87171'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </PanelShell>
  )
}

function Row({ label, value, emphasize, positive }: { label: string; value: string; emphasize?: boolean; positive?: boolean }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-white/60">{label}</span>
      <span
        className={
          emphasize
            ? 'font-semibold text-sm'
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
