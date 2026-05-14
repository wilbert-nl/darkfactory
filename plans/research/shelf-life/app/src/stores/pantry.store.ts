import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export type ItemStatus = 'active' | 'used' | 'wasted'
export type Urgency = 'expired' | 'soon' | 'fresh'

export interface PantryItem {
  id: string
  name: string
  category: string
  quantity: number
  unit: string
  location: string
  bestBefore: string // ISO YYYY-MM-DD
  addedAt: string // ISO datetime
  status: ItemStatus
  resolvedAt?: string // ISO datetime when marked used/wasted
  estValue?: number // optional user estimate
}

const STORAGE_KEY = 'shelflife:items:v1'
const SOON_THRESHOLD_DAYS = 3

function load(): PantryItem[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export const usePantryStore = defineStore('pantry', () => {
  const items = ref<PantryItem[]>(load())

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items.value))
    } catch {
      // localStorage may be full or unavailable — keep the in-memory state usable
    }
  }

  // Whole-day difference between today and an ISO date, in local time.
  function daysUntilExpiry(bestBefore: string): number {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const target = new Date(bestBefore + 'T00:00:00')
    return Math.round((target.getTime() - today.getTime()) / 86_400_000)
  }

  function urgency(item: PantryItem): Urgency {
    const days = daysUntilExpiry(item.bestBefore)
    if (days < 0) return 'expired'
    if (days <= SOON_THRESHOLD_DAYS) return 'soon'
    return 'fresh'
  }

  function addItem(item: Omit<PantryItem, 'id' | 'addedAt' | 'status' | 'resolvedAt'>) {
    items.value.push({
      ...item,
      id: crypto.randomUUID(),
      addedAt: new Date().toISOString(),
      status: 'active'
    })
    save()
  }

  function deleteItem(id: string) {
    items.value = items.value.filter((i) => i.id !== id)
    save()
  }

  function resolveItem(id: string, status: Exclude<ItemStatus, 'active'>) {
    const item = items.value.find((i) => i.id === id)
    if (item) {
      item.status = status
      item.resolvedAt = new Date().toISOString()
      save()
    }
  }

  const activeItems = computed(() =>
    [...items.value.filter((i) => i.status === 'active')].sort(
      (a, b) => daysUntilExpiry(a.bestBefore) - daysUntilExpiry(b.bestBefore)
    )
  )

  const expiringSoonCount = computed(
    () => activeItems.value.filter((i) => urgency(i) !== 'fresh').length
  )

  const savedValue = computed(() =>
    items.value
      .filter((i) => i.status === 'used')
      .reduce((sum, i) => sum + (i.estValue ?? 0), 0)
  )

  const wastedValue = computed(() =>
    items.value
      .filter((i) => i.status === 'wasted')
      .reduce((sum, i) => sum + (i.estValue ?? 0), 0)
  )

  return {
    items,
    activeItems,
    expiringSoonCount,
    savedValue,
    wastedValue,
    daysUntilExpiry,
    urgency,
    addItem,
    deleteItem,
    resolveItem
  }
})
