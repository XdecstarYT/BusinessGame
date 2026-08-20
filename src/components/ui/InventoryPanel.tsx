import { PRODUCTS, SHELF_CAPACITY, STOCKROOM_CAPACITY } from '../../data/products'
import { useFinance } from '../../stores/useFinance'
import { useInventory } from '../../stores/useInventory'
import { useStoreLayout } from '../../stores/useStoreLayout'

interface InventoryPanelProps {
  onClose: () => void
}

const rowBase = 'flex items-center gap-2 py-1.5 border-b border-white/10 last:border-b-0'
const smallBtn =
  'px-2 py-1 rounded text-[11px] font-medium bg-white/10 border border-white/10 text-white/80 hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10'

export function InventoryPanel({ onClose }: InventoryPanelProps) {
  const cash = useFinance((s) => s.cash)
  const stockroom = useInventory((s) => s.stockroom)
  const shelfStock = useInventory((s) => s.shelfStock)
  const totalStockroomUnits = useInventory((s) => s.totalStockroomUnits())
  const orderProduct = useInventory((s) => s.orderProduct)
  const assignProduct = useInventory((s) => s.assignProduct)
  const restockShelf = useInventory((s) => s.restockShelf)

  const shelves = Object.values(useStoreLayout((s) => s.fixtures)).filter((f) => f.category === 'shelf')

  return (
    <div className="pointer-events-auto absolute top-20 right-4 w-80 max-h-[28rem] overflow-y-auto bg-black/80 backdrop-blur-sm rounded-xl shadow-lg text-white">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 sticky top-0 bg-black/90 backdrop-blur-sm rounded-t-xl">
        <span className="font-semibold text-sm">📦 Inventory</span>
        <button onClick={onClose} className="text-white/60 hover:text-white text-sm">
          ✕
        </button>
      </div>

      <div className="px-4 py-3">
        <div className="text-[11px] text-white/50 mb-2">
          Stockroom: {totalStockroomUnits} / {STOCKROOM_CAPACITY} units
        </div>
        {PRODUCTS.map((product) => {
          const qty = stockroom[product.id] ?? 0
          return (
            <div key={product.id} className={rowBase}>
              <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: product.color }} />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium truncate">{product.name}</div>
                <div className="text-[10px] text-white/50">
                  ${product.costPrice.toFixed(2)} cost · ${product.retailPrice.toFixed(2)} retail · {qty} in stock
                </div>
              </div>
              <button
                className={smallBtn}
                disabled={cash < product.costPrice * 10}
                onClick={() => orderProduct(product.id, 10)}
              >
                +10
              </button>
              <button
                className={smallBtn}
                disabled={cash < product.costPrice * 50}
                onClick={() => orderProduct(product.id, 50)}
              >
                +50
              </button>
            </div>
          )
        })}
      </div>

      <div className="px-4 py-3 border-t border-white/10">
        <div className="text-[11px] text-white/50 mb-2">Shelves ({shelves.length})</div>
        {shelves.length === 0 && <div className="text-xs text-white/40 italic">Place a shelf in Build Mode first.</div>}
        {shelves.map((shelf) => {
          const stock = shelfStock[shelf.id]
          const fillRatio = stock ? stock.quantity / SHELF_CAPACITY : 0
          return (
            <div key={shelf.id} className={rowBase + ' flex-col items-stretch gap-1'}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium flex-1">
                  Shelf @ ({shelf.cell.x}, {shelf.cell.z})
                </span>
                <select
                  value={stock?.productId ?? ''}
                  onChange={(e) => e.target.value && assignProduct(shelf.id, e.target.value)}
                  className="bg-white/10 border border-white/10 rounded text-[11px] px-1 py-0.5 text-white max-w-[7.5rem]"
                >
                  <option value="" disabled>
                    Assign…
                  </option>
                  {PRODUCTS.map((p) => (
                    <option key={p.id} value={p.id} className="text-black">
                      {p.name}
                    </option>
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
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
