import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { StoreBlueprint } from '../stores/useStoreLayout'

interface RetailEmpireDB extends DBSchema {
  blueprints: {
    key: string
    value: StoreBlueprint
  }
}

const DB_NAME = 'retail-empire'
const DB_VERSION = 1
const SLOT_COUNT = 3

let dbPromise: Promise<IDBPDatabase<RetailEmpireDB>> | null = null

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<RetailEmpireDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('blueprints')) {
          db.createObjectStore('blueprints')
        }
      },
    })
  }
  return dbPromise
}

export function slotKey(slot: number): string {
  return `slot-${slot}`
}

export async function saveToSlot(slot: number, blueprint: StoreBlueprint): Promise<void> {
  const db = await getDB()
  await db.put('blueprints', blueprint, slotKey(slot))
}

export async function loadFromSlot(slot: number): Promise<StoreBlueprint | undefined> {
  const db = await getDB()
  return db.get('blueprints', slotKey(slot))
}

export async function listSlots(): Promise<(StoreBlueprint | undefined)[]> {
  const db = await getDB()
  return Promise.all(Array.from({ length: SLOT_COUNT }, (_, i) => db.get('blueprints', slotKey(i))))
}

export function exportBlueprintToJSON(blueprint: StoreBlueprint): string {
  return JSON.stringify(blueprint, null, 2)
}

export function importBlueprintFromJSON(json: string): StoreBlueprint {
  const parsed = JSON.parse(json) as StoreBlueprint
  if (!parsed.floors || !parsed.walls || !parsed.fixtures) {
    throw new Error('Invalid blueprint file')
  }
  return parsed
}
