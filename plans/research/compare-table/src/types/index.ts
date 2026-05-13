export interface Comparison {
  id: string
  title: string
  createdAt: number
  updatedAt: number
}

export interface Item {
  id: string
  comparisonId: string
  name: string
  position: number
}

export interface Criterion {
  id: string
  comparisonId: string
  name: string
  weight: number // 1.0–5.0
  position: number
}

export interface Score {
  itemId: string
  criterionId: string
  score: number | null // 0–10, null = unset
}

export interface ComparisonData {
  comparison: Comparison
  items: Item[]
  criteria: Criterion[]
  scores: Score[]
}

export interface WeightedScore {
  itemId: string
  score: number // 0–10 normalized weighted average
  rank: number
}

export interface Template {
  id: string
  name: string
  description: string
  icon: string
  defaultItems: string[]
  defaultCriteria: Array<{ name: string; weight: number }>
}
