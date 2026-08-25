import { useRef, useState } from 'react'
import { useBuildTool, type BuildTool } from '../../stores/useBuildTool'
import { useStoreLayout } from '../../stores/useStoreLayout'
import { FIXTURE_DEFINITIONS, FLOOR_COST, WALL_COST } from '../../data/fixtureDefinitions'
import { exportBlueprintToJSON, importBlueprintFromJSON, loadFromSlot, saveToSlot } from '../../hooks/useSaveGame'
import { STARTER_BLUEPRINTS } from '../../data/starterBlueprints'
import { chromeBar, btn, divider } from './theme'

const TOOL_OPTIONS: { tool: BuildTool; label: string; cost: number }[] = [
  { tool: 'floor', label: 'Floor', cost: FLOOR_COST },
  { tool: 'wall', label: 'Wall', cost: WALL_COST },
  { tool: 'shelf', label: FIXTURE_DEFINITIONS.shelf.label, cost: FIXTURE_DEFINITIONS.shelf.cost },
  { tool: 'checkout', label: FIXTURE_DEFINITIONS.checkout.label, cost: FIXTURE_DEFINITIONS.checkout.cost },
  { tool: 'stairs', label: FIXTURE_DEFINITIONS.stairs.label, cost: FIXTURE_DEFINITIONS.stairs.cost },
  { tool: 'decoration', label: FIXTURE_DEFINITIONS.decoration.label, cost: FIXTURE_DEFINITIONS.decoration.cost },
]

const btnBase = 'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border'
const toolBtn = (active: boolean) =>
  `${btnBase} ${
    active
      ? 'bg-emerald-500 border-emerald-400 text-white shadow-[0_0_14px_-3px_rgba(52,211,153,0.8)]'
      : 'bg-white/[0.06] border-white/10 text-white/75 hover:bg-white/[0.12] hover:border-white/20'
  }`

export function BuildToolbar() {
  const tool = useBuildTool((s) => s.tool)
  const setTool = useBuildTool((s) => s.setTool)
  const rotateSelection = useBuildTool((s) => s.rotateSelection)

  const pastLength = useStoreLayout((s) => s.past.length)
  const futureLength = useStoreLayout((s) => s.future.length)
  const undo = useStoreLayout((s) => s.undo)
  const redo = useStoreLayout((s) => s.redo)
  const clearAll = useStoreLayout((s) => s.clearAll)
  const serialize = useStoreLayout((s) => s.serialize)
  const loadBlueprint = useStoreLayout((s) => s.loadBlueprint)

  const floorCount = useStoreLayout((s) =>
    Object.keys(s.activeLevel === 0 ? s.floors : (s.upperLevels[s.activeLevel]?.floors ?? {})).length,
  )
  const wallCount = useStoreLayout((s) =>
    Object.keys(s.activeLevel === 0 ? s.walls : (s.upperLevels[s.activeLevel]?.walls ?? {})).length,
  )
  const fixtureCount = useStoreLayout((s) =>
    Object.keys(s.activeLevel === 0 ? s.fixtures : (s.upperLevels[s.activeLevel]?.fixtures ?? {})).length,
  )
  const activeLevel = useStoreLayout((s) => s.activeLevel)
  const maxLevel = useStoreLayout((s) => s.maxLevel)
  const setActiveLevel = useStoreLayout((s) => s.setActiveLevel)
  const addLevel = useStoreLayout((s) => s.addLevel)

  const [status, setStatus] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const flash = (msg: string) => {
    setStatus(msg)
    window.setTimeout(() => setStatus(null), 2000)
  }

  const handleSave = async (slot: number) => {
    await saveToSlot(slot, serialize(`Store — Slot ${slot + 1}`))
    flash(`Saved to slot ${slot + 1}`)
  }

  const handleLoad = async (slot: number) => {
    const blueprint = await loadFromSlot(slot)
    if (!blueprint) {
      flash(`Slot ${slot + 1} is empty`)
      return
    }
    loadBlueprint(blueprint)
    flash(`Loaded slot ${slot + 1}`)
  }

  const handleExport = () => {
    const json = exportBlueprintToJSON(serialize('Exported Store'))
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'retail-empire-blueprint.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportClick = () => fileInputRef.current?.click()

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      loadBlueprint(importBlueprintFromJSON(text))
      flash('Blueprint imported')
    } catch {
      flash('Import failed — invalid file')
    } finally {
      event.target.value = ''
    }
  }

  return (
    <div className="pointer-events-auto absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
      {status && <div className="rounded-full bg-[#171a22]/95 border border-white/10 text-white text-xs px-3 py-1 shadow-lg">{status}</div>}

      <div className={`${chromeBar} px-3 py-1.5 max-w-[94vw] overflow-x-auto`}>
        <div className="flex items-center gap-1.5 w-max">
          <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/40 mr-1 shrink-0">Level</span>
          {Array.from({ length: maxLevel + 1 }, (_, level) => (
            <button
              key={level}
              onClick={() => setActiveLevel(level)}
              className={`${toolBtn(activeLevel === level)} px-2.5 py-1 text-xs shrink-0`}
            >
              {level === 0 ? 'Ground' : level + 1}
            </button>
          ))}
          <button onClick={addLevel} className={`${btn.ghost} !text-xs shrink-0`} title="Add a new floor above">
            + Add Floor
          </button>
        </div>
      </div>

      <div className={`${chromeBar} px-3 py-2 max-w-[94vw] overflow-x-auto`}>
        <div className="flex items-center gap-2 w-max">
          {TOOL_OPTIONS.map((opt) => (
            <button key={opt.tool} onClick={() => setTool(opt.tool)} className={`${toolBtn(tool === opt.tool)} shrink-0`}>
              {opt.label}
              <span className="ml-1.5 text-[10px] opacity-70">${opt.cost}</span>
            </button>
          ))}

          <div className={`${divider} shrink-0`} />

          <button
            onClick={rotateSelection}
            disabled={tool !== 'shelf' && tool !== 'checkout' && tool !== 'stairs'}
            className={`${btn.ghost} shrink-0`}
            title="Rotate selection"
          >
            ⟳ Rotate
          </button>

          <button onClick={undo} disabled={pastLength === 0} className={`${btn.ghost} shrink-0`}>
            Undo
          </button>
          <button onClick={redo} disabled={futureLength === 0} className={`${btn.ghost} shrink-0`}>
            Redo
          </button>

          <div className={`${divider} shrink-0`} />

          {[0, 1, 2].map((slot) => (
            <div key={slot} className="flex gap-0.5 shrink-0">
              <button onClick={() => handleSave(slot)} className={btn.ghost} title={`Save to slot ${slot + 1}`}>
                💾{slot + 1}
              </button>
              <button onClick={() => handleLoad(slot)} className={btn.ghost} title={`Load slot ${slot + 1}`}>
                📂{slot + 1}
              </button>
            </div>
          ))}

          <div className={`${divider} shrink-0`} />

          <button onClick={handleExport} className={`${btn.ghost} shrink-0`}>
            Export
          </button>
          <button onClick={handleImportClick} className={`${btn.ghost} shrink-0`}>
            Import
          </button>
          <input ref={fileInputRef} type="file" accept="application/json" onChange={handleImportFile} className="hidden" />

          <div className={`${divider} shrink-0`} />

          <select
            value=""
            onChange={(e) => {
              const template = STARTER_BLUEPRINTS.find((b) => b.name === e.target.value)
              if (template && confirm(`Load starter template "${template.name}"? This replaces your current layout.`)) {
                loadBlueprint(template)
                flash(`Loaded "${template.name}"`)
              }
            }}
            className="shrink-0 bg-white/[0.06] border border-white/10 rounded-lg text-sm px-2 py-1.5 text-white/80 focus:outline-none focus:border-emerald-400/50"
          >
            <option value="" disabled>
              Starter templates…
            </option>
            {STARTER_BLUEPRINTS.map((b) => (
              <option key={b.name} value={b.name} className="text-black">
                {b.name}
              </option>
            ))}
          </select>

          <div className={`${divider} shrink-0`} />

          <button onClick={() => confirm('Clear entire store layout?') && clearAll()} className={`${btn.danger} shrink-0`}>
            Clear
          </button>
        </div>
      </div>

      <div className="text-[11px] text-white/60 bg-[#171a22]/90 border border-white/10 rounded-full px-3 py-0.5 shadow">
        {activeLevel === 0 ? 'Ground' : `Level ${activeLevel + 1}`} — {floorCount} floor · {wallCount} wall · {fixtureCount} fixture —
        left-click place, right-click remove
      </div>
      {activeLevel > 0 && (
        <div className="text-[11px] text-amber-300/80 bg-[#171a22]/90 border border-white/10 rounded-full px-3 py-0.5 shadow">
          Note: customers and staff currently only shop the ground floor — upper floors are buildable and walkable.
        </div>
      )}
    </div>
  )
}
