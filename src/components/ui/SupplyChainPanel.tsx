import { useMemo, useState } from 'react'
import { PRODUCTS, PRODUCT_CATEGORIES, PRODUCT_MAP } from '../../data/products'
import { SUPPLIERS, SUPPLIER_MAP, RUSH_ORDER_MARKUP } from '../../data/suppliers'
import { WAREHOUSE_TIERS } from '../../data/warehouse'
import { contractUnitPrice } from '../../systems/supplyChainSim'
import { useFinance } from '../../stores/useFinance'
import { useInventory } from '../../stores/useInventory'
import { useSupplyChain } from '../../stores/useSupplyChain'
import { useGameClock } from '../../stores/useGameClock'

interface SupplyChainPanelProps {
  onClose: () => void
}

const QUICK_QUANTITIES = [50, 100, 200]

const rowBase = 'flex flex-col gap-1.5 py-2 border-b border-white/10 last:border-b-0'
const smallBtn =
  'px-2 py-1 rounded text-[11px] font-medium bg-white/10 border border-white/10 text-white/80 hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10'
const selectCls = 'bg-white/10 border border-white/10 rounded px-1.5 py-1 text-[11px] text-white/80'

export function SupplyChainPanel({ onClose }: SupplyChainPanelProps) {
  const cash = useFinance((s) => s.cash)
  const currentDay = useGameClock((s) => s.day)

  const warehouseTier = useInventory((s) => s.warehouseTier)
  const stockroomCapacity = useInventory((s) => s.stockroomCapacity())
  const totalStockroomUnits = useInventory((s) => s.totalStockroomUnits())
  const upgradeWarehouse = useInventory((s) => s.upgradeWarehouse)
  const orderProduct = useInventory((s) => s.orderProduct)

  const contracts = useSupplyChain((s) => s.contracts)
  const pendingOrders = useSupplyChain((s) => s.pendingOrders)
  const events = useSupplyChain((s) => s.events)
  const signContract = useSupplyChain((s) => s.signContract)
  const cancelContract = useSupplyChain((s) => s.cancelContract)
  const placeContractOrder = useSupplyChain((s) => s.placeContractOrder)

  const [category, setCategory] = useState<string>('All')
  const [search, setSearch] = useState('')
  const [pendingSupplierChoice, setPendingSupplierChoice] = useState<Record<string, string>>({})

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase()
    return PRODUCTS.filter((p) => (category === 'All' || p.category === category) && (!query || p.name.toLowerCase().includes(query)))
  }, [category, search])

  const nextTier = WAREHOUSE_TIERS[warehouseTier + 1]

  return (
    <div className="pointer-events-auto absolute top-36 right-4 w-96 max-h-[28rem] overflow-y-auto bg-black/80 backdrop-blur-sm rounded-xl shadow-lg text-white">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 sticky top-0 bg-black/90 backdrop-blur-sm rounded-t-xl">
        <span className="font-semibold text-sm">🚚 Supply Chain</span>
        <button onClick={onClose} className="text-white/60 hover:text-white text-sm">
          ✕
        </button>
      </div>

      <div className="px-4 py-3">
        <div className="text-[11px] text-white/50 mb-1">
          Warehouse: {WAREHOUSE_TIERS[warehouseTier].label} — {totalStockroomUnits} / {stockroomCapacity} units
        </div>
        {nextTier ? (
          <button
            className={`${smallBtn} w-full mb-3 text-center`}
            disabled={cash < nextTier.upgradeCost}
            onClick={() => upgradeWarehouse()}
          >
            Upgrade to {nextTier.label} — ${nextTier.upgradeCost.toLocaleString()} (+{nextTier.capacity - stockroomCapacity} capacity)
          </button>
        ) : (
          <div className="text-[10px] text-white/40 italic mb-3">Warehouse fully upgraded.</div>
        )}

        {pendingOrders.length > 0 && (
          <div className="mb-3">
            <div className="text-[11px] text-white/50 mb-1">In transit</div>
            <div className="flex flex-col gap-1">
              {pendingOrders.map((order) => {
                const product = PRODUCT_MAP[order.productId]
                const supplier = SUPPLIER_MAP[order.supplierId]
                const daysAway = order.arrivalDay - currentDay
                return (
                  <div key={order.id} className="text-[10px] text-white/60 bg-white/5 rounded px-2 py-1">
                    {order.quantity} {product?.name} from {supplier?.name} — {daysAway <= 0 ? 'arriving' : `${daysAway}d away`}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {events.length > 0 && (
          <div className="mb-3">
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

        <div className="flex gap-1.5 mb-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={selectCls}
          >
            <option value="All">All categories</option>
            {PRODUCT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="flex-1 bg-white/10 border border-white/10 rounded px-2 py-1 text-[11px] text-white/80 placeholder:text-white/30"
          />
        </div>

        <div className="flex flex-col">
          {filteredProducts.map((product) => {
            const supplierId = contracts[product.id]
            const supplier = supplierId ? SUPPLIER_MAP[supplierId] : undefined
            const chosenSupplierId = pendingSupplierChoice[product.id] ?? SUPPLIERS[0].id

            return (
              <div key={product.id} className={rowBase}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">{product.name}</span>
                  <span className="text-[10px] text-white/40">base ${product.costPrice.toFixed(2)}</span>
                </div>

                {supplier ? (
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-emerald-400">
                      Contracted: {supplier.name} ({supplier.origin}, {supplier.leadTimeDays}d, {Math.round(supplier.reliability * 100)}% reliable)
                    </span>
                    <button className={smallBtn} onClick={() => cancelContract(product.id)}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <select
                      value={chosenSupplierId}
                      onChange={(e) => setPendingSupplierChoice((s) => ({ ...s, [product.id]: e.target.value }))}
                      className={`${selectCls} flex-1`}
                    >
                      {SUPPLIERS.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} · x{s.priceMultiplier.toFixed(2)} · {s.leadTimeDays}d · {Math.round(s.reliability * 100)}%
                        </option>
                      ))}
                    </select>
                    <button className={smallBtn} onClick={() => signContract(product.id, chosenSupplierId)}>
                      Sign
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-1 flex-wrap">
                  {supplier &&
                    QUICK_QUANTITIES.map((qty) => {
                      const unitPrice = contractUnitPrice(product.costPrice, supplier, qty)
                      return (
                        <button
                          key={qty}
                          className={smallBtn}
                          disabled={cash < unitPrice * qty}
                          onClick={() => placeContractOrder(product.id, qty, currentDay)}
                          title={`Arrives in ${supplier.leadTimeDays}d`}
                        >
                          Order {qty} · ${unitPrice.toFixed(2)}/u
                        </button>
                      )
                    })}
                  <button
                    className={smallBtn}
                    disabled={cash < product.costPrice * RUSH_ORDER_MARKUP * 20}
                    onClick={() => orderProduct(product.id, 20)}
                    title="Instant, no contract needed, but marked up"
                  >
                    Rush 20 · ${(product.costPrice * RUSH_ORDER_MARKUP).toFixed(2)}/u
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
