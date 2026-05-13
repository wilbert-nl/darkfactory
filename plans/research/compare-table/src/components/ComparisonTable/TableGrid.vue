<template>
  <div class="comparison-table-wrapper">
    <table class="comparison-table">
      <!-- Header row: item names -->
      <thead>
        <tr>
          <th class="criterion-col">Criterion</th>
          <th class="weight-col">Weight</th>
          <th v-for="item in items" :key="item.id" class="item-col">
            <div class="column-flex">
              <template v-if="!readonly">
                <q-input
                  class="item-header-input"
                  dense
                  borderless
                  :model-value="item.name"
                  @update:model-value="(v) => emit('renameItem', item.id, String(v))"
                />
                <q-btn
                  flat
                  round
                  dense
                  size="xs"
                  icon="close"
                  color="negative"
                  @click="emit('removeItem', item.id)"
                />
              </template>
              <template v-else>
                <span class="text-weight-bold">{{ item.name }}</span>
              </template>
            </div>
          </th>
        </tr>
      </thead>

      <!-- Criterion rows -->
      <tbody>
        <tr v-for="criterion in criteria" :key="criterion.id">
          <td class="criterion-col">
            <div class="row items-center no-wrap gap-1">
              <template v-if="!readonly">
                <q-input
                  dense
                  borderless
                  style="flex: 1"
                  :model-value="criterion.name"
                  @update:model-value="(v) => emit('renameCriterion', criterion.id, String(v))"
                />
                <q-btn
                  flat
                  round
                  dense
                  size="xs"
                  icon="close"
                  color="negative"
                  @click="emit('removeCriterion', criterion.id)"
                />
              </template>
              <template v-else>
                <span>{{ criterion.name }}</span>
              </template>
            </div>
          </td>
          <td class="weight-col">
            <WeightSlider
              :model-value="criterion.weight"
              :readonly="readonly"
              @update:model-value="(v) => emit('setWeight', criterion.id, v)"
            />
          </td>
          <td v-for="item in items" :key="item.id" class="item-col">
            <ScoreCell
              :item-id="item.id"
              :criterion-id="criterion.id"
              :score="getScore(item.id, criterion.id)"
              :readonly="readonly"
              @update="(iid, cid, s) => emit('setScore', iid, cid, s)"
            />
          </td>
        </tr>
      </tbody>

      <!-- Total row -->
      <tfoot>
        <TotalRow :items="items" :weighted-scores="weightedScores" />
      </tfoot>
    </table>
  </div>
</template>

<script setup lang="ts">
import ScoreCell from './ScoreCell.vue'
import WeightSlider from './WeightSlider.vue'
import TotalRow from './TotalRow.vue'
import type { Item, Criterion, Score, WeightedScore } from 'src/types'

const props = defineProps<{
  items: Item[]
  criteria: Criterion[]
  scores: Score[]
  weightedScores: WeightedScore[]
  readonly?: boolean
}>()

const emit = defineEmits<{
  (e: 'renameItem', id: string, name: string): void
  (e: 'removeItem', id: string): void
  (e: 'renameCriterion', id: string, name: string): void
  (e: 'removeCriterion', id: string): void
  (e: 'setWeight', criterionId: string, weight: number): void
  (e: 'setScore', itemId: string, criterionId: string, score: number | null): void
}>()

function getScore(itemId: string, criterionId: string): number | null {
  return (
    props.scores.find((s) => s.itemId === itemId && s.criterionId === criterionId)?.score ?? null
  )
}
</script>

<style scoped>
.column-flex {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}
.gap-1 {
  gap: 4px;
}
</style>
