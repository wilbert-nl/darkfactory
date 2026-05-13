<template>
  <tr class="total-row">
    <td class="criterion-col text-weight-bold">Weighted Total</td>
    <td class="weight-col"></td>
    <td
      v-for="item in items"
      :key="item.id"
      class="item-col"
      :class="{ 'rank-1': getRank(item.id) === 1 }"
    >
      <div class="text-weight-bold text-h6">{{ getScore(item.id) }}</div>
      <div class="rank-badge">{{ getMedal(getRank(item.id)) }}</div>
    </td>
  </tr>
</template>

<script setup lang="ts">
import type { Item, WeightedScore } from 'src/types'

const props = defineProps<{
  items: Item[]
  weightedScores: WeightedScore[]
}>()

function getWs(itemId: string): WeightedScore | undefined {
  return props.weightedScores.find((w) => w.itemId === itemId)
}

function getScore(itemId: string): string {
  const ws = getWs(itemId)
  return ws && ws.score > 0 ? ws.score.toFixed(1) : '—'
}

function getRank(itemId: string): number {
  return getWs(itemId)?.rank ?? 99
}

function getMedal(rank: number): string {
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return ''
}
</script>
