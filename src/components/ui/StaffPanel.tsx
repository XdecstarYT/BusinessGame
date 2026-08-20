import { SHIFT_WINDOWS, STAFF_ROLES, WAGE_STEP, type Shift, type StaffRole } from '../../data/staffDefinitions'
import { LIGHTING_MOODS, useStoreAtmosphere, type LightingMood } from '../../stores/useStoreAtmosphere'
import { useFinance } from '../../stores/useFinance'
import { useStaff } from '../../stores/useStaff'
import { useStoreLayout } from '../../stores/useStoreLayout'

interface StaffPanelProps {
  onClose: () => void
}

const smallBtn =
  'px-2 py-1 rounded text-[11px] font-medium bg-white/10 border border-white/10 text-white/80 hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10'

export function StaffPanel({ onClose }: StaffPanelProps) {
  const cash = useFinance((s) => s.cash)
  const roster = useStaff((s) => s.roster)
  const hire = useStaff((s) => s.hire)
  const fire = useStaff((s) => s.fire)
  const setShift = useStaff((s) => s.setShift)
  const adjustWage = useStaff((s) => s.adjustWage)
  const assignCashier = useStaff((s) => s.assignCashier)

  const cleanliness = useStoreAtmosphere((s) => s.cleanliness)
  const lightingMood = useStoreAtmosphere((s) => s.lightingMood)
  const setLightingMood = useStoreAtmosphere((s) => s.setLightingMood)

  const checkouts = Object.values(useStoreLayout((s) => s.fixtures)).filter((f) => f.category === 'checkout')
  const members = Object.values(roster)

  return (
    <div className="pointer-events-auto absolute top-20 right-4 w-80 max-h-[28rem] overflow-y-auto bg-black/80 backdrop-blur-sm rounded-xl shadow-lg text-white">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 sticky top-0 bg-black/90 backdrop-blur-sm rounded-t-xl">
        <span className="font-semibold text-sm">👥 Staff & Atmosphere</span>
        <button onClick={onClose} className="text-white/60 hover:text-white text-sm">
          ✕
        </button>
      </div>

      <div className="px-4 py-3">
        <div className="text-[11px] text-white/50 mb-2">Hire</div>
        <div className="flex flex-col gap-1.5">
          {(Object.values(STAFF_ROLES) as (typeof STAFF_ROLES)[StaffRole][]).map((def) => (
            <div key={def.role} className="flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium">{def.label}</div>
                <div className="text-[10px] text-white/50">${def.marketRate}/day · {def.description}</div>
              </div>
              <button className={smallBtn} disabled={cash < def.marketRate} onClick={() => hire(def.role)}>
                Hire
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 py-3 border-t border-white/10">
        <div className="text-[11px] text-white/50 mb-2">Roster ({members.length})</div>
        {members.length === 0 && <div className="text-xs text-white/40 italic">No staff hired yet.</div>}
        {members.map((member) => {
          const def = STAFF_ROLES[member.role]
          return (
            <div key={member.id} className="flex flex-col gap-1.5 py-2 border-b border-white/10 last:border-b-0">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: def.color }} />
                <span className="text-xs font-medium flex-1 truncate">{member.label}</span>
                <button className={smallBtn} onClick={() => fire(member.id)}>
                  Fire
                </button>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={member.shift}
                  onChange={(e) => setShift(member.id, e.target.value as Shift)}
                  className="bg-white/10 border border-white/10 rounded text-[11px] px-1 py-0.5 text-white flex-1"
                >
                  {Object.entries(SHIFT_WINDOWS).map(([shift, window]) => (
                    <option key={shift} value={shift} className="text-black">
                      {window.label}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-1 text-[11px]">
                  <button className={smallBtn} onClick={() => adjustWage(member.id, -WAGE_STEP)}>
                    −
                  </button>
                  <span className="w-12 text-center">${member.wage}</span>
                  <button className={smallBtn} onClick={() => adjustWage(member.id, WAGE_STEP)}>
                    +
                  </button>
                </div>
              </div>

              {member.role === 'cashier' && (
                <select
                  value={member.assignedFixtureId ?? ''}
                  onChange={(e) => assignCashier(member.id, e.target.value || null)}
                  className="bg-white/10 border border-white/10 rounded text-[11px] px-1 py-0.5 text-white"
                >
                  <option value="" className="text-black">
                    Unassigned
                  </option>
                  {checkouts.map((c) => (
                    <option key={c.id} value={c.id} className="text-black">
                      Checkout @ ({c.cell.x}, {c.cell.z})
                    </option>
                  ))}
                </select>
              )}

              <div className="flex items-center gap-2">
                <div className="h-1.5 flex-1 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className={`h-full transition-all ${member.morale >= 50 ? 'bg-emerald-400' : 'bg-red-400'}`}
                    style={{ width: `${member.morale}%` }}
                  />
                </div>
                <span className="text-[10px] text-white/40 w-16 text-right">Morale {Math.round(member.morale)}%</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="px-4 py-3 border-t border-white/10">
        <div className="text-[11px] text-white/50 mb-2">Atmosphere</div>
        <div className="flex items-center gap-2 mb-2">
          <div className="h-1.5 flex-1 rounded-full bg-white/10 overflow-hidden">
            <div
              className={`h-full transition-all ${cleanliness >= 50 ? 'bg-emerald-400' : 'bg-red-400'}`}
              style={{ width: `${cleanliness}%` }}
            />
          </div>
          <span className="text-[10px] text-white/40 w-24 text-right">Cleanliness {Math.round(cleanliness)}%</span>
        </div>
        <div className="flex gap-1.5">
          {(Object.keys(LIGHTING_MOODS) as LightingMood[]).map((mood) => (
            <button
              key={mood}
              onClick={() => setLightingMood(mood)}
              className={`${smallBtn} flex-1 ${lightingMood === mood ? 'bg-emerald-500 border-emerald-400 text-white' : ''}`}
            >
              {LIGHTING_MOODS[mood].label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
