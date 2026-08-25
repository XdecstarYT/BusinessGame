import { useMemo, useState } from 'react'
import { PRODUCTS, PRODUCT_CATEGORIES, PRODUCT_MAP, SHELF_CAPACITY, QUALITY_TIER_LABELS, type QualityTier } from '../../data/products'
import { useFinance } from '../../stores/useFinance'
import { useInventory, getEffectivePrice } from '../../stores/useInventory'
import { useGameClock } from '../../stores/useGameClock'
import { useStoreLayout } from '../../stores/useStoreLayout'
import { PanelShell } from './PanelShell'
import { rowBase, btn, sectionLabel, selectCls, inputCls } from './theme'

interface InventoryPanelProps {
  onClose: () => void
  top?: number
}

const PROMO_DISCOUNT = 20
const PROMO_DURATION_DAYS = 3

const smallBtn = btn.ghost

const TIER_COLOR: Record<QualityTier, string> = {
  budget: 'text-white/35',
  standard: 'text-white/50',
  premium: 'text-amber-300/80',
}

export function InventoryPanel({ onClose, top }: InventoryPanelProps) {
  const cash = useFinance((s) => s.cash)
  const stockroom = useInventory((s) => s.stockroom)
  const shelfStock = useInventory((s) => s.shelfStock)
  const priceOverrides = useInventory((s) => s.priceOverrides)
  const promotions = useInventory((s) => s.promotions)
  const totalStockroomUnits = useInventory((s) => s.totalStockroomUnits())
  const stockroomCapacity = useInventory((s) => s.stockroomCapacity())
  const orderProduct = useInventory((s) => s.orderProduct)
  const assignProduct = useInventory((s) => s.assignProduct)
  const restockShelf = useInventory((s) => s.restockShelf)
  const adjustPrice = useInventory((s) => s.adjustPrice)
  const resetPrice = useInventory((s) => s.resetPrice)
  const startPromotion = useInventory((s) => s.startPromotion)
  const clearPromotion = useInventory((s) => s.clearPromotion)
  const currentDay = useGameClock((s) => s.day)

  const shelves = Object.values(useStoreLayout((s) => s.fixtures)).filter((f) => f.category === 'shelf')

  const [category, setCategory] = useState<string>('All')
  const [search, setSearch] = useState('')

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase()
    return PRODUCTS.filter((p) => (category === 'All' || p.category === category) && (!query || p.name.toLowerCase().includes(query)))
  }, [category, search])

  return (
    <PanelShell icon="box" title="Inventory" onClose={onClose} top={top}>
      <div className="px-4 py-3">
        <div className={sectionLabel}>
          Stockroom: {totalStockroomUnits} / {stockroomCapacity} units
        </div>
        <div className="flex gap-1.5 mb-2">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={`${selectCls} flex-1`}>
            <option value="All" className="text-black">
              All categories
            </option>
            {PRODUCT_CATEGORIES.map((c) => (
              <option key={c} value={c} className="text-black">
                {c}
              </option>
            ))}
          </select>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" className={`${inputCls} w-24`} />
        </div>

        {filteredProducts.length === 0 && <div className="text-xs text-white/40 italic">No products match.</div>}
        {filteredProducts.map((product) => {
          const qty = stockroom[product.id] ?? 0
          const overridden = product.id in priceOverrides
          const promo = promotions[product.id]
          const promoActive = !!promo && promo.expiresDay >= currentDay
          const effectivePrice = getEffectivePrice(product.id, currentDay)

          return (
            <div key={product.id} className={rowBase + ' flex-col items-stretch gap-1'}>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: product.color }} />
                <div className="flex-1 min-w-0" title={product.description}>
                  <div className="text-xs font-medium truncate">
                    {product.name} <span className="text-white/40 font-normal">— {product.brand}</span>
                  </div>
                  <div className="text-[10px] text-white/50">
                    ${product.costPrice.toFixed(2)} cost · {qty} in stock ·{' '}
                    <span className={TIER_COLOR[product.qualityTier]}>{QUALITY_TIER_LABELS[product.qualityTier]}</span>
                  </div>
                </div>
                <button className={smallBtn} disabled={cash < product.costPrice * 10} onClick={() => orderProduct(product.id, 10)}>
                  +10
                </button>
                <button className={smallBtn} disabled={cash < product.costPrice * 50} onClick={() => orderProduct(product.id, 50)}>
                  +50
                </button>
              </div>
              <div className="flex items-center gap-1.5 text-[10px]">
                <span className="text-white/50">Price:</span>
                <button className={smallBtn} onClick={() => adjustPrice(product.id, -0.25)}>
                  −
                </button>
                <span className={`w-14 text-center ${promoActive ? 'text-emerald-400' : overridden ? 'text-amber-300' : ''}`}>
                  ${effectivePrice.toFixed(2)}
                </span>
                <button className={smallBtn} onClick={() => adjustPrice(product.id, 0.25)}>
                  +
                </button>
                {overridden && (
                  <button className={smallBtn} onClick={() => resetPrice(product.id)} title={`Base $${product.retailPrice.toFixed(2)}`}>
                    Reset
                  </button>
                )}
                <span className="flex-1" />
                {promoActive ? (
                  <button className={`${smallBtn} text-emerald-300`} onClick={() => clearPromotion(product.id)}>
                    🏷️ -{promo.discountPercent}% (D{promo.expiresDay}) ✕
                  </button>
                ) : (
                  <button
                    className={smallBtn}
                    onClick={() => startPromotion(product.id, PROMO_DISCOUNT, currentDay, PROMO_DURATION_DAYS)}
                  >
                    🏷️ Run -{PROMO_DISCOUNT}%/{PROMO_DURATION_DAYS}d
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="px-4 py-3 border-t border-white/10">
        <div className={sectionLabel}>Shelves ({shelves.length})</div>
        {shelves.length === 0 && <div className="text-xs text-white/40 italic">Place a shelf in Build Mode first.</div>}
        {shelves.map((shelf) => {
          const stock = shelfStock[shelf.id]
          const fillRatio = stock ? stock.quantity / SHELF_CAPACITY : 0
          const product = stock?.productId ? PRODUCT_MAP[stock.productId] : undefined
          return (
            <div key={shelf.id} className={rowBase + ' flex-col items-stretch gap-1'}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium flex-1">
                  Shelf @ ({shelf.cell.x}, {shelf.cell.z})
                </span>
                <select
                  value={stock?.productId ?? ''}
                  onChange={(e) => e.target.value && assignProduct(shelf.id, e.target.value)}
                  className={`${selectCls} max-w-[7.5rem]`}
                >
                  <option value="" disabled>
                    Assign…
                  </option>
                  {PRODUCT_CATEGORIES.map((cat) => (
                    <optgroup key={cat} label={cat} className="text-black">
                      {PRODUCTS.filter((p) => p.category === cat).map((p) => (
                        <option key={p.id} value={p.id} className="text-black">
                          {p.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <button
                  className={smallBtn}
                  disabled={!stock?.productId}
                  onClick={() => restockShelf(shelf.id, SHELF_CAPACITY)}
                >
                  Restock
                </button>
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-emerald-400 transition-all"
                  style={{ width: `${Math.min(fillRatio, 1) * 100}%` }}
                />
              </div>
              <div className="text-[10px] text-white/40">
                {stock?.quantity ?? 0} / {SHELF_CAPACITY} units
                {product && ` · selling at $${getEffectivePrice(product.id, currentDay).toFixed(2)}`}
              </div>
            </div>
          )
        })}
      </div>
    </PanelShell>
  )
}
