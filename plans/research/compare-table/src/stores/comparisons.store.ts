import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useDatabase } from 'src/composables/useDatabase'
import type { Comparison, Item, Criterion, Score, ComparisonData, WeightedScore } from 'src/types'

export const useComparisonsStore = defineStore('comparisons', () => {
  const { run, query } = useDatabase()

  const comparisons = ref<Comparison[]>([])
  const currentComparison = ref<Comparison | null>(null)
  const currentItems = ref<Item[]>([])
  const currentCriteria = ref<Criterion[]>([])
  const currentScores = ref<Score[]>([])

  // ── List ─────────────────────────────────────────────────────────────────

  function loadAll(): void {
    comparisons.value = query<Comparison>(
      'SELECT id, title, created_at, updated_at FROM comparisons ORDER BY updated_at DESC'
    )
  }

  function createComparison(title: string): Comparison {
    const now = Date.now()
    const c: Comparison = { id: crypto.randomUUID(), title, createdAt: now, updatedAt: now }
    run('INSERT INTO comparisons (id, title, created_at, updated_at) VALUES (?, ?, ?, ?)', [
      c.id,
      c.title,
      c.createdAt,
      c.updatedAt,
    ])
    comparisons.value.unshift(c)
    return c
  }

  function deleteComparison(id: string): void {
    run('DELETE FROM comparisons WHERE id = ?', [id])
    comparisons.value = comparisons.value.filter((c) => c.id !== id)
    if (currentComparison.value?.id === id) clearCurrent()
  }

  function updateTitle(id: string, title: string): void {
    const now = Date.now()
    run('UPDATE comparisons SET title = ?, updated_at = ? WHERE id = ?', [title, now, id])
    const c = comparisons.value.find((x) => x.id === id)
    if (c) { c.title = title; c.updatedAt = now }
    if (currentComparison.value?.id === id) {
      currentComparison.value.title = title
      currentComparison.value.updatedAt = now
    }
  }

  // ── Load single ───────────────────────────────────────────────────────────

  function loadComparison(id: string): void {
    const rows = query<Comparison>(
      'SELECT id, title, created_at, updated_at FROM comparisons WHERE id = ?',
      [id]
    )
    currentComparison.value = rows[0] ?? null
    currentItems.value = query<Item>(
      'SELECT id, comparison_id, name, position FROM items WHERE comparison_id = ? ORDER BY position',
      [id]
    )
    currentCriteria.value = query<Criterion>(
      'SELECT id, comparison_id, name, weight, position FROM criteria WHERE comparison_id = ? ORDER BY position',
      [id]
    )
    currentScores.value = query<Score>(
      `SELECT s.item_id, s.criterion_id, s.score
       FROM scores s
       JOIN items i ON s.item_id = i.id
       WHERE i.comparison_id = ?`,
      [id]
    )
  }

  function clearCurrent(): void {
    currentComparison.value = null
    currentItems.value = []
    currentCriteria.value = []
    currentScores.value = []
  }

  // ── Items (columns) ────────────────────────────────────────────────────────

  function addItem(comparisonId: string, name = 'New Item'): Item {
    const pos = currentItems.value.length
    const item: Item = { id: crypto.randomUUID(), comparisonId, name, position: pos }
    run('INSERT INTO items (id, comparison_id, name, position) VALUES (?, ?, ?, ?)', [
      item.id,
      item.comparisonId,
      item.name,
      item.position,
    ])
    currentItems.value.push(item)
    touchComparison(comparisonId)
    return item
  }

  function removeItem(id: string): void {
    run('DELETE FROM items WHERE id = ?', [id])
    currentItems.value = currentItems.value.filter((it) => it.id !== id)
    currentScores.value = currentScores.value.filter((s) => s.itemId !== id)
    reorderItems()
  }

  function renameItem(id: string, name: string): void {
    run('UPDATE items SET name = ? WHERE id = ?', [name, id])
    const it = currentItems.value.find((x) => x.id === id)
    if (it) it.name = name
  }

  function reorderItems(): void {
    currentItems.value.forEach((it, i) => {
      it.position = i
      run('UPDATE items SET position = ? WHERE id = ?', [i, it.id])
    })
  }

  // ── Criteria (rows) ────────────────────────────────────────────────────────

  function addCriterion(comparisonId: string, name = 'New Criterion'): Criterion {
    const pos = currentCriteria.value.length
    const cr: Criterion = { id: crypto.randomUUID(), comparisonId, name, weight: 3, position: pos }
    run(
      'INSERT INTO criteria (id, comparison_id, name, weight, position) VALUES (?, ?, ?, ?, ?)',
      [cr.id, cr.comparisonId, cr.name, cr.weight, cr.position]
    )
    currentCriteria.value.push(cr)
    touchComparison(comparisonId)
    return cr
  }

  function removeCriterion(id: string): void {
    run('DELETE FROM criteria WHERE id = ?', [id])
    currentCriteria.value = currentCriteria.value.filter((cr) => cr.id !== id)
    currentScores.value = currentScores.value.filter((s) => s.criterionId !== id)
    reorderCriteria()
  }

  function renameCriterion(id: string, name: string): void {
    run('UPDATE criteria SET name = ? WHERE id = ?', [name, id])
    const cr = currentCriteria.value.find((x) => x.id === id)
    if (cr) cr.name = name
  }

  function setWeight(criterionId: string, weight: number): void {
    run('UPDATE criteria SET weight = ? WHERE id = ?', [weight, criterionId])
    const cr = currentCriteria.value.find((x) => x.id === criterionId)
    if (cr) cr.weight = weight
  }

  function reorderCriteria(): void {
    currentCriteria.value.forEach((cr, i) => {
      cr.position = i
      run('UPDATE criteria SET position = ? WHERE id = ?', [i, cr.id])
    })
  }

  // ── Scores (cells) ─────────────────────────────────────────────────────────

  function setScore(itemId: string, criterionId: string, score: number | null): void {
    run(
      `INSERT INTO scores (item_id, criterion_id, score) VALUES (?, ?, ?)
       ON CONFLICT(item_id, criterion_id) DO UPDATE SET score = excluded.score`,
      [itemId, criterionId, score]
    )
    const existing = currentScores.value.find(
      (s) => s.itemId === itemId && s.criterionId === criterionId
    )
    if (existing) {
      existing.score = score
    } else {
      currentScores.value.push({ itemId, criterionId, score })
    }
  }

  function getScore(itemId: string, criterionId: string): number | null {
    return (
      currentScores.value.find((s) => s.itemId === itemId && s.criterionId === criterionId)
        ?.score ?? null
    )
  }

  // ── Weighted scores ────────────────────────────────────────────────────────

  const weightedScores = computed<WeightedScore[]>(() => {
    const raw = currentItems.value.map((item) => {
      let weightedSum = 0
      let totalWeight = 0
      currentCriteria.value.forEach((cr) => {
        const s = currentScores.value.find(
          (sc) => sc.itemId === item.id && sc.criterionId === cr.id
        )
        if (s?.score !== null && s?.score !== undefined) {
          weightedSum += s.score * cr.weight
          totalWeight += cr.weight
        }
      })
      const score = totalWeight > 0 ? weightedSum / totalWeight : 0
      return { itemId: item.id, score }
    })

    // Sort descending to assign ranks
    const sorted = [...raw].sort((a, b) => b.score - a.score)
    return raw.map((r) => ({
      ...r,
      rank: sorted.findIndex((s) => s.itemId === r.itemId) + 1,
    }))
  })

  // ── Snapshot for sharing ───────────────────────────────────────────────────

  function getSnapshot(): ComparisonData | null {
    if (!currentComparison.value) return null
    return {
      comparison: { ...currentComparison.value },
      items: currentItems.value.map((i) => ({ ...i })),
      criteria: currentCriteria.value.map((c) => ({ ...c })),
      scores: currentScores.value.map((s) => ({ ...s })),
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  function touchComparison(id: string): void {
    const now = Date.now()
    run('UPDATE comparisons SET updated_at = ? WHERE id = ?', [now, id])
    const c = comparisons.value.find((x) => x.id === id)
    if (c) c.updatedAt = now
  }

  return {
    comparisons,
    currentComparison,
    currentItems,
    currentCriteria,
    currentScores,
    weightedScores,
    loadAll,
    createComparison,
    deleteComparison,
    updateTitle,
    loadComparison,
    clearCurrent,
    addItem,
    removeItem,
    renameItem,
    addCriterion,
    removeCriterion,
    renameCriterion,
    setWeight,
    setScore,
    getScore,
    getSnapshot,
  }
})
