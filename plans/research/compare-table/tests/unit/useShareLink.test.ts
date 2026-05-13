import { describe, it, expect } from 'vitest'
import { useShareLink } from 'src/composables/useShareLink'
import type { ComparisonData } from 'src/types'

const SAMPLE: ComparisonData = {
  comparison: { id: 'c1', title: 'Test', createdAt: 1000, updatedAt: 1000 },
  items: [
    { id: 'i1', comparisonId: 'c1', name: 'Item A', position: 0 },
    { id: 'i2', comparisonId: 'c1', name: 'Item B', position: 1 },
  ],
  criteria: [
    { id: 'cr1', comparisonId: 'c1', name: 'Speed', weight: 4, position: 0 },
    { id: 'cr2', comparisonId: 'c1', name: 'Cost', weight: 5, position: 1 },
  ],
  scores: [
    { itemId: 'i1', criterionId: 'cr1', score: 8 },
    { itemId: 'i1', criterionId: 'cr2', score: 6 },
    { itemId: 'i2', criterionId: 'cr1', score: 7 },
    { itemId: 'i2', criterionId: 'cr2', score: 9 },
  ],
}

describe('useShareLink', () => {
  const { encode, decode, isOversized, getShareUrl } = useShareLink()

  it('round-trips comparison data through encode/decode', () => {
    const encoded = encode(SAMPLE)
    const decoded = decode(encoded)
    expect(decoded).toEqual(SAMPLE)
  })

  it('returns null for invalid encoded string', () => {
    expect(decode('!!!invalid!!!')).toBeNull()
    expect(decode('')).toBeNull()
  })

  it('isOversized returns false for small comparison', () => {
    expect(isOversized(SAMPLE)).toBe(false)
  })

  it('isOversized returns true when items > 10', () => {
    const big: ComparisonData = {
      ...SAMPLE,
      items: Array.from({ length: 11 }, (_, i) => ({
        id: `i${i}`,
        comparisonId: 'c1',
        name: `Item ${i}`,
        position: i,
      })),
    }
    expect(isOversized(big)).toBe(true)
  })

  it('isOversized returns true when criteria > 20', () => {
    const big: ComparisonData = {
      ...SAMPLE,
      criteria: Array.from({ length: 21 }, (_, i) => ({
        id: `cr${i}`,
        comparisonId: 'c1',
        name: `Criterion ${i}`,
        weight: 3,
        position: i,
      })),
    }
    expect(isOversized(big)).toBe(true)
  })

  it('getShareUrl contains /shared and ?d= fragment', () => {
    const url = getShareUrl(SAMPLE)
    expect(url).toContain('#/shared')
    expect(url).toContain('?d=')
  })

  it('encoded data is shorter than raw JSON for large inputs', () => {
    const big: ComparisonData = {
      ...SAMPLE,
      items: Array.from({ length: 8 }, (_, i) => ({
        id: `i${i}`,
        comparisonId: 'c1',
        name: `Item ${i}`,
        position: i,
      })),
    }
    const raw = JSON.stringify(big)
    const compressed = encode(big)
    expect(compressed.length).toBeLessThan(raw.length)
  })
})
