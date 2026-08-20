import { useFinance } from '../../stores/useFinance'
import { useCorporateFinance } from '../../stores/useCorporateFinance'
import { LOAN_OFFERS, FUNDING_ROUNDS, IPO_VALUATION_THRESHOLD, INSURANCE_DAILY_PREMIUM, INSURANCE_REIMBURSEMENT_RATE } from '../../data/finance'

interface CorporateFinancePanelProps {
  onClose: () => void
}

const smallBtn =
  'px-2 py-1 rounded text-[11px] font-medium bg-white/10 border border-white/10 text-white/80 hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10'

export function CorporateFinancePanel({ onClose }: CorporateFinancePanelProps) {
  const cash = useFinance((s) => s.cash)
  const creditScore = useCorporateFinance((s) => s.creditScore)
  const activeLoan = useCorporateFinance((s) => s.activeLoan)
  const insuranceActive = useCorporateFinance((s) => s.insuranceActive)
  const fundingRoundsTaken = useCorporateFinance((s) => s.fundingRoundsTaken)
  const isPublic = useCorporateFinance((s) => s.isPublic)
  const events = useCorporateFinance((s) => s.events)
  const quarterlyReports = useCorporateFinance((s) => s.quarterlyReports)
  const takeLoan = useCorporateFinance((s) => s.takeLoan)
  const toggleInsurance = useCorporateFinance((s) => s.toggleInsurance)
  const launchFundingRound = useCorporateFinance((s) => s.launchFundingRound)
  const launchIPO = useCorporateFinance((s) => s.launchIPO)
  const currentValuation = useCorporateFinance((s) => s.currentValuation)

  const valuation = currentValuation()
  const ipoReady = !isPublic && valuation >= IPO_VALUATION_THRESHOLD

  return (
    <div className="pointer-events-auto absolute top-36 right-4 w-96 max-h-[28rem] overflow-y-auto bg-black/80 backdrop-blur-sm rounded-xl shadow-lg text-white">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 sticky top-0 bg-black/90 backdrop-blur-sm rounded-t-xl">
        <span className="font-semibold text-sm">🏦 Corporate {isPublic && <span className="text-emerald-400 text-[10px] ml-1">PUBLIC</span>}</span>
        <button onClick={onClose} className="text-white/60 hover:text-white text-sm">
          ✕
        </button>
      </div>

      <div className="px-4 py-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-white/60">Credit score</span>
          <span className={`font-semibold ${creditScore >= 70 ? 'text-emerald-400' : creditScore >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
            {Math.round(creditScore)}/100
          </span>
        </div>
        <div className="flex items-center justify-between text-xs mb-3">
          <span className="text-white/60">Est. valuation</span>
          <span className="font-semibold">${Math.round(valuation).toLocaleString()}</span>
        </div>

        {/* Loan */}
        <div className="mb-3">
          <div className="text-[11px] text-white/50 mb-1">Loan</div>
          {activeLoan ? (
            <div className="text-[10px] bg-white/5 rounded px-2 py-1.5">
              <div className="font-medium">{activeLoan.label}</div>
              <div className="text-white/50 mt-0.5">
                ${activeLoan.remaining.toFixed(2)} remaining · ${activeLoan.dailyPayment.toFixed(2)}/day
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {LOAN_OFFERS.map((offer) => (
                <div key={offer.id} className="flex items-center justify-between text-[10px] bg-white/5 rounded px-2 py-1.5">
                  <div>
                    <div className="font-medium">{offer.label}</div>
                    <div className="text-white/50">
                      ${offer.principal.toLocaleString()} · needs {offer.minCreditScore}+ credit · {offer.termDays}d term
                    </div>
                  </div>
                  <button className={smallBtn} disabled={creditScore < offer.minCreditScore} onClick={() => takeLoan(offer.id)}>
                    Take
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Insurance */}
        <div className="mb-3">
          <div className="flex items-center justify-between">
            <div className="text-[11px] text-white/50">
              Insurance — ${INSURANCE_DAILY_PREMIUM}/day, covers {Math.round(INSURANCE_REIMBURSEMENT_RATE * 100)}% of theft losses
            </div>
            <button
              className={smallBtn}
              onClick={toggleInsurance}
              style={insuranceActive ? { borderColor: 'rgba(52,211,153,0.5)', color: '#34d399' } : undefined}
            >
              {insuranceActive ? 'Active — Cancel' : 'Activate'}
            </button>
          </div>
        </div>

        {/* Funding rounds */}
        <div className="mb-3">
          <div className="text-[11px] text-white/50 mb-1">Investor funding (one-time each)</div>
          <div className="flex flex-col gap-1">
            {FUNDING_ROUNDS.map((round) => {
              const taken = fundingRoundsTaken.includes(round.id)
              const eligible = valuation >= round.minValuation
              return (
                <div key={round.id} className="flex items-center justify-between text-[10px] bg-white/5 rounded px-2 py-1.5">
                  <div>
                    <div className="font-medium">{round.label}</div>
                    <div className="text-white/50">
                      {round.equityPercent}% equity · needs ${round.minValuation.toLocaleString()}+ valuation
                    </div>
                  </div>
                  <button className={smallBtn} disabled={taken || !eligible} onClick={() => launchFundingRound(round.id)}>
                    {taken ? 'Raised' : 'Raise'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* IPO */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-[11px] text-white/50">
            <span>IPO — needs ${IPO_VALUATION_THRESHOLD.toLocaleString()}+ valuation</span>
            <button className={smallBtn} disabled={!ipoReady} onClick={() => launchIPO()}>
              {isPublic ? 'Public' : 'Go Public'}
            </button>
          </div>
        </div>

        {quarterlyReports.length > 0 && (
          <div className="mb-3">
            <div className="text-[11px] text-white/50 mb-1">Quarterly earnings</div>
            <div className="flex flex-col gap-1">
              {quarterlyReports.slice(0, 3).map((report, i) => (
                <div key={i} className="text-[10px] text-white/60 bg-white/5 rounded px-2 py-1">
                  Day {report.quarterEndDay}: ${report.revenue.toFixed(0)} revenue,{' '}
                  <span className={report.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}>${report.profit.toFixed(0)} profit</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {events.length > 0 && (
          <div>
            <div className="text-[11px] text-white/50 mb-1">Recent activity</div>
            <div className="flex flex-col gap-1">
              {events.slice(0, 4).map((event, i) => (
                <div key={i} className="text-[10px] text-white/50">
                  {event}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-[10px] text-white/30 italic mt-3">Cash on hand: ${cash.toFixed(2)}</div>
      </div>
    </div>
  )
}
