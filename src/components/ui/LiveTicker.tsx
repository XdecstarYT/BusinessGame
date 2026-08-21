import { useEffect, useState } from 'react'
import { useCompetitors } from '../../stores/useCompetitors'
import { useComplaints } from '../../stores/useComplaints'
import { useWeather } from '../../stores/useWeather'
import { useSupplyChain } from '../../stores/useSupplyChain'
import { Icon } from './icons'

const ROTATE_MS = 4200

/** A low-profile rotating ticker for Play phase — surfaces competitor
 * moves, customer complaints, weather shifts, and supply chain activity so
 * the "living store" feels like it has a world happening around it, without
 * competing with the sale/theft toast stack. */
export function LiveTicker() {
  const competitorEvents = useCompetitors((s) => s.events)
  const complaintEvents = useComplaints((s) => s.events)
  const weatherEvents = useWeather((s) => s.events)
  const supplyEvents = useSupplyChain((s) => s.events)

  const messages = [...competitorEvents.slice(0, 2), ...complaintEvents.slice(0, 2), ...weatherEvents.slice(0, 1), ...supplyEvents.slice(0, 2)]

  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (messages.length <= 1) return
    const id = setInterval(() => setIndex((i) => (i + 1) % messages.length), ROTATE_MS)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length])

  if (messages.length === 0) return null
  const message = messages[index % messages.length]

  return (
    <div className="pointer-events-none absolute bottom-20 left-1/2 -translate-x-1/2 max-w-xl">
      <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5 text-xs text-white/80 shadow-lg">
        <Icon name="report" size={12} className="text-white/40 shrink-0" />
        <span className="truncate">{message}</span>
      </div>
    </div>
  )
}
