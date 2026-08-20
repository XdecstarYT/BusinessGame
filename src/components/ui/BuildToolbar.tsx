import { useRef, useState } from 'react'
import { useBuildTool, type BuildTool } from '../../stores/useBuildTool'
import { useStoreLayout } from '../../stores/useStoreLayout'
import { FIXTURE_DEFINITIONS, FLOOR_COST, WALL_COST } from '../../data/fixtureDefinitions'
import { exportBlueprintToJSON, importBlueprintFromJSON, loadFromSlot, saveToSlot } from '../../hooks/useSaveGame'

const TOOL_OPTIONS: { tool: BuildTool; label: string; cost: number }[] = [
  { tool: 'floor', label: 'Floor', cost: FLOOR_COST },
  { tool: 'wall', label: 'Wall', cost: WALL_COST },
  { tool: 'shelf', label: FIXTURE_DEFINITIONS.shelf.label, cost: FIXTURE_DEFINITIONS.shelf.cost },
  { tool: 'checkout', label: FIXTURE_DEFINITIONS.checkout.label, cost: FIXTURE_DEFINITIONS.checkout.cost },
]

const btnBase =
  'px-3 py-1.5 rounded-md text-sm font-medium transition-colors border'

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

  const floorCount = useStoreLayout((s) => Object.keys(s.floors).length)
  const wallCount = useStoreLayout((s) => Object.keys(s.walls).length)
  const fixtureCount = useStoreLayout((s) => Object.keys(s.fixtures).length)

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
      {status && <div className="rounded-full bg-black/80 text-white text-xs px-3 py-1">{status}</div>}

      <div className="flex items-center gap-2 bg-black/70 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg">
        {TOOL_OPTIONS.map((opt) => (
          <button
            key={opt.tool}
            onClick={() => setTool(opt.tool)}
            className={`${btnBase} ${
              tool === opt.tool
                ? 'bg-emerald-500 border-emerald-400 text-white'
                : 'bg-white/10 border-white/10 text-white/80 hover:bg-white/20'
            }`}
          >
            {opt.label}
            <span className="ml-1.5 text-[10px] opacity-70">${opt.cost}</span>
          </button>
        ))}

        <div className="w-px h-6 bg-white/20 mx-1" />

        <button
          onClick={rotateSelection}
          disabled={tool !== 'shelf' && tool !== 'checkout'}
          className={`${btnBase} bg-white/10 border-white/10 text-white/80 hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10`}
          title="Rotate selection"
        >
          ⟳ Rotate
        </button>

        <button
          onClick={undo}
          disabled={pastLength === 0}
          className={`${btnBase} bg-white/10 border-white/10 text-white/80 hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10`}
        >
          Undo
        </button>
        <button
          onClick={redo}
          disabled={futureLength === 0}
          className={`${btnBase} bg-white/10 border-white/10 text-white/80 hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-white/10`}
        >
          Redo
        </button>

        <div className="w-px h-6 bg-white/20 mx-1" />

        {[0, 1, 2].map((slot) => (
          <div key={slot} className="flex gap-0.5">
            <button
              onClick={() => handleSave(slot)}
              className={`${btnBase} bg-white/10 border-white/10 text-white/80 hover:bg-white/20`}
              title={`Save to slot ${slot + 1}`}
            >
              💾{slot + 1}
            </button>
            <button
              onClick={() => handleLoad(slot)}
              className={`${btnBase} bg-white/10 border-white/10 text-white/80 hover:bg-white/20`}
              title={`Load slot ${slot + 1}`}
            >
              📂{slot + 1}
            </button>
          </div>
        ))}

        <div className="w-px h-6 bg-white/20 mx-1" />

        <button onClick={handleExport} className={`${btnBase} bg-white/10 border-white/10 text-white/80 hover:bg-white/20`}>
          Export
        </button>
        <button onClick={handleImportClick} className={`${btnBase} bg-white/10 border-white/10 text-white/80 hover:bg-white/20`}>
          Import
        </button>
        <input ref={fileInputRef} type="file" accept="application/json" onChange={handleImportFile} className="hidden" />

        <div className="w-px h-6 bg-white/20 mx-1" />

        <button
          onClick={() => confirm('Clear entire store layout?') && clearAll()}
          className={`${btnBase} bg-red-500/20 border-red-500/30 text-red-200 hover:bg-red-500/30`}
        >
          Clear
        </button>
      </div>

      <div className="text-[11px] text-white/60 bg-black/50 rounded-full px-3 py-0.5">
        {floorCount} floor · {wallCount} wall · {fixtureCount} fixture — left-click place, right-click remove
      </div>
    </div>
  )
}
