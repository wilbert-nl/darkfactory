import LZString from 'lz-string'
import type { ComparisonData } from 'src/types'

const MAX_ITEMS = 10
const MAX_CRITERIA = 20

export function useShareLink() {
  function encode(data: ComparisonData): string {
    const json = JSON.stringify(data)
    return LZString.compressToEncodedURIComponent(json)
  }

  function decode(encoded: string): ComparisonData | null {
    try {
      const json = LZString.decompressFromEncodedURIComponent(encoded)
      if (!json) return null
      return JSON.parse(json) as ComparisonData
    } catch {
      return null
    }
  }

  function isOversized(data: ComparisonData): boolean {
    return data.items.length > MAX_ITEMS || data.criteria.length > MAX_CRITERIA
  }

  function getShareUrl(data: ComparisonData): string {
    const encoded = encode(data)
    // Query param within the hash — never sent to server
    const base = `${window.location.origin}${window.location.pathname}#/shared`
    return `${base}?d=${encoded}`
  }

  function decodeFromUrl(): ComparisonData | null {
    const hash = window.location.hash // e.g. "#/shared?d=<encoded>"
    const qIdx = hash.indexOf('?')
    if (qIdx === -1) return null
    const params = new URLSearchParams(hash.slice(qIdx + 1))
    const d = params.get('d')
    if (!d) return null
    return decode(d)
  }

  return { encode, decode, getShareUrl, decodeFromUrl, isOversized }
}
