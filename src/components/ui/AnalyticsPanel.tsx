import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useFinance } from '../../stores/useFinance'
import { useAnalytics } from '../../stores/useAnalytics'
import { linearForecast } from '../../systems/forecast'
import { PanelShell } from './PanelShell'
import { btn, sectionLabel } from './theme'

interface AnalyticsPanelProps {
  onClose: () => void
  top?: number
}

const smallBtn = btn.ghost

const CATEGORY_COLORS = ['#34d399', '#60a5fa', '#f59e0b', '#f472b6', '#a78bfa', '#22d3ee', '#fb923c', '#a3e635', '#e879f9']

const FORECAST_HORIZON_DAYS = 7

export function AnalyticsPanel({ onClose, top }: AnalyticsPanelProps) {
  const history = useFinance((s) => s.history)
  const categoryRevenue = useAnalytics((s) => s.categoryRevenue)
  const showHeatmap = useAnalytics((s) => s.showHeatmap)
  const toggleHeatmap = useAnalytics((s) => s.toggleHeatmap)

  const categoryData = Object.entries(categoryRevenue)
    .map(([category, revenue]) => ({ category, revenue: Math.round(revenue * 100) / 100 }))
    .sort((a, b) => b.revenue - a.revenue)

  const profitSeries = history.map((d) => d.profit)
  const forecastedProfit = linearForecast(profitSeries, FORECAST_HORIZON_DAYS)
  const chartData = history.map((d) => ({ day: `D${d.day}`, profit: Math.round(d.profit * 100) / 100 }))

  return (
    <PanelShell icon="barChart" title="Analytics" onClose={onClose} width="w-96" top={top}>
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <span className={sectionLabel + ' mb-0'}>Traffic heatmap overlay</span>
          <button className={smallBtn} onClick={toggleHeatmap}>
            {showHeatmap ? 'Hide' : 'Show'}
          </button>
        </div>

        <div className="mb-3">
          <div className={sectionLabel}>Revenue by category (lifetime)</div>
          {categoryData.length === 0 ? (
            <div className="text-xs text-white/40 italic">No sales recorded yet.</div>
          ) : (
            <div style={{ height: Math.max(60, categoryData.length * 22) }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} layout="vertical" margin={{ top: 2, right: 12, left: 0, bottom: 2 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="category" width={70} tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.6)' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#111318', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, fontSize: 12 }}
                    formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Revenue']}
                  />
                  <Bar dataKey="revenue" radius={[0, 3, 3, 0]} isAnimationActive={false}>
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="mb-3">
          <div className={sectionLabel}>Daily profit history</div>
          {chartData.length === 0 ? (
            <div className="text-xs text-white/40 italic">Profit history appears after your first full day.</div>
          ) : (
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <Tooltip
                    contentStyle={{ background: '#111318', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, fontSize: 12 }}
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

        <div className={sectionLabel}>Simple forecast</div>
        {history.length < 2 ? (
          <div className="text-xs text-white/40 italic">Needs a couple days of history to project a trend.</div>
        ) : (
          <div className="text-xs bg-white/5 rounded-lg px-3 py-2">
            <span className="text-white/60">Projected daily profit in {FORECAST_HORIZON_DAYS} days: </span>
            <span className={forecastedProfit >= 0 ? 'text-emerald-400 font-medium' : 'text-red-400 font-medium'}>${forecastedProfit.toFixed(2)}</span>
            <div className="text-[10px] text-white/30 mt-1">Linear trend from your profit history — not a guarantee.</div>
          </div>
        )}
      </div>
    </PanelShell>
  )
}
