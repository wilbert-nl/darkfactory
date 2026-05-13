import { describe, it, expect, vi } from 'vitest'
import { usePdfExport } from 'src/composables/usePdfExport'
import type { ComparisonData, WeightedScore } from 'src/types'

// Mock jsPDF so no browser canvas needed in tests
vi.mock('jspdf', () => {
  const jsPDF = vi.fn().mockImplementation(() => ({
    setFontSize: vi.fn(),
    setFont: vi.fn(),
    setTextColor: vi.fn(),
    text: vi.fn(),
    save: vi.fn(),
  }))
  return { default: jsPDF }
})

vi.mock('jspdf-autotable', () => ({
  default: vi.fn(),
}))

const DATA: ComparisonData = {
  comparison: { id: 'c1', title: 'Test Export', createdAt: 1000, updatedAt: 1000 },
  items: [
    { id: 'i1', comparisonId: 'c1', name: 'A', position: 0 },
    { id: 'i2', comparisonId: 'c1', name: 'B', position: 1 },
  ],
  criteria: [
    { id: 'cr1', comparisonId: 'c1', name: 'Speed', weight: 4, position: 0 },
  ],
  scores: [
    { itemId: 'i1', criterionId: 'cr1', score: 8 },
    { itemId: 'i2', criterionId: 'cr1', score: 6 },
  ],
}

const SCORES: WeightedScore[] = [
  { itemId: 'i1', score: 8, rank: 1 },
  { itemId: 'i2', score: 6, rank: 2 },
]

describe('usePdfExport', () => {
  it('exportToPdf does not throw', () => {
    const { exportToPdf } = usePdfExport()
    expect(() => exportToPdf(DATA, SCORES)).not.toThrow()
  })
})
