<template>
  <q-page class="q-pa-md">
    <!-- New Decision Dialog -->
    <q-dialog v-model="showNewDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">New Decision</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-input v-model="newName" label="Decision Name" autofocus />
          <q-input v-model="newContext" label="Context / Notes" class="q-mt-sm" type="textarea" rows="2" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn color="primary" label="Create" @click="createDecision" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Decision Canvas Dialog -->
    <q-dialog v-model="showCanvas" maximized>
      <q-card v-if="activeDecision">
        <q-bar>
          <div class="text-h6">{{ activeDecision.name }}</div>
          <q-space />
          <q-btn dense flat icon="close" v-close-popup />
        </q-bar>
        <q-card-section>
          <div class="text-caption text-grey q-mb-sm">{{ activeDecision.context }}</div>

          <!-- Weighted Score Bar -->
          <div class="q-mb-md">
            <div class="row items-center q-mb-xs">
              <span class="text-positive q-mr-sm">PRO {{ proScore(activeDecision) }}</span>
              <q-linear-progress
                :value="proRatio(activeDecision)"
                color="positive"
                track-color="negative"
                size="20px"
                rounded
                class="col"
              />
              <span class="text-negative q-ml-sm">CON {{ conScore(activeDecision) }}</span>
            </div>
            <div class="text-center text-weight-bold" :class="proScore(activeDecision) > conScore(activeDecision) ? 'text-positive' : proScore(activeDecision) < conScore(activeDecision) ? 'text-negative' : 'text-grey'">
              {{ proScore(activeDecision) > conScore(activeDecision) ? 'LEANING PRO' : proScore(activeDecision) < conScore(activeDecision) ? 'LEANING CON' : 'TIED' }}
            </div>
          </div>

          <!-- Add Item -->
          <div class="row q-gutter-sm q-mb-md">
            <q-input v-model="newItemText" label="Pro or Con" class="col" dense />
            <q-select v-model="newItemType" :options="['pro','con']" label="Type" dense style="width:90px" />
            <q-select v-model="newItemWeight" :options="[1,2,3,4,5]" label="Weight" dense style="width:90px" />
            <q-btn color="primary" icon="add" dense @click="addItem" />
          </div>

          <!-- Items List -->
          <div class="row q-gutter-sm">
            <div class="col-12 col-md-5">
              <div class="text-subtitle2 text-positive q-mb-xs">PROS</div>
              <q-list bordered separator>
                <q-item v-for="item in activeDecision.items.filter(i => i.type === 'pro')" :key="item.id">
                  <q-item-section>
                    <q-item-label>{{ item.text }}</q-item-label>
                    <q-item-label caption>Weight: {{ item.weight }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-btn flat round icon="delete" size="sm" color="negative" @click="removeItem(item.id)" />
                  </q-item-section>
                </q-item>
                <q-item v-if="!activeDecision.items.filter(i => i.type === 'pro').length">
                  <q-item-section><q-item-label class="text-grey">No pros yet</q-item-label></q-item-section>
                </q-item>
              </q-list>
            </div>
            <div class="col-12 col-md-5">
              <div class="text-subtitle2 text-negative q-mb-xs">CONS</div>
              <q-list bordered separator>
                <q-item v-for="item in activeDecision.items.filter(i => i.type === 'con')" :key="item.id">
                  <q-item-section>
                    <q-item-label>{{ item.text }}</q-item-label>
                    <q-item-label caption>Weight: {{ item.weight }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-btn flat round icon="delete" size="sm" color="negative" @click="removeItem(item.id)" />
                  </q-item-section>
                </q-item>
                <q-item v-if="!activeDecision.items.filter(i => i.type === 'con').length">
                  <q-item-section><q-item-label class="text-grey">No cons yet</q-item-label></q-item-section>
                </q-item>
              </q-list>
            </div>
          </div>

          <!-- Devil's Advocate -->
          <div class="q-mt-md">
            <q-btn
              color="deep-purple"
              icon="psychology"
              label="Devil's Advocate"
              @click="devilsAdvocate"
              :loading="devilLoading"
            />
            <q-card v-if="devilArgument" class="q-mt-sm bg-deep-purple-1">
              <q-card-section>
                <div class="text-subtitle2 text-deep-purple">Devil's Advocate Says:</div>
                <div>{{ devilArgument }}</div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Export -->
          <div class="q-mt-md">
            <q-btn flat icon="download" label="Export to Text" @click="exportText" />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Dashboard -->
    <div class="row items-center q-mb-md">
      <div class="text-h5 col">My Decisions</div>
      <q-btn color="primary" icon="add" label="New Decision" @click="showNewDialog = true" />
    </div>

    <div v-if="!store.decisions.length" class="text-center text-grey q-mt-xl">
      <q-icon name="balance" size="4em" />
      <div class="text-h6 q-mt-sm">No decisions yet</div>
      <div>Create one to get started</div>
    </div>

    <div class="row q-gutter-md">
      <q-card
        v-for="d in store.decisions"
        :key="d.id"
        class="col-12 col-md-5 cursor-pointer"
        @click="openDecision(d)"
      >
        <q-card-section>
          <div class="text-h6">{{ d.name }}</div>
          <div class="text-caption text-grey">{{ d.context }}</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <div class="row items-center q-gutter-xs">
            <q-badge color="positive">PRO {{ store.proScore(d) }}</q-badge>
            <q-badge color="negative">CON {{ store.conScore(d) }}</q-badge>
            <q-badge :color="store.proScore(d) > store.conScore(d) ? 'positive' : store.proScore(d) < store.conScore(d) ? 'negative' : 'grey'">
              {{ store.proScore(d) > store.conScore(d) ? 'Leaning Pro' : store.proScore(d) < store.conScore(d) ? 'Leaning Con' : 'Tied' }}
            </q-badge>
          </div>
          <q-linear-progress
            :value="proRatio(d)"
            color="positive"
            track-color="negative"
            size="8px"
            rounded
            class="q-mt-sm"
          />
        </q-card-section>
        <q-card-actions>
          <q-btn flat icon="open_in_full" label="Open" />
          <q-space />
          <q-btn flat icon="delete" color="negative" @click.stop="store.deleteDecision(d.id)" />
        </q-card-actions>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useDecisionsStore } from 'src/stores/decisions'
import type { Decision } from 'src/stores/decisions'
import { useQuasar } from 'quasar'

const store = useDecisionsStore()
const $q = useQuasar()

const showNewDialog = ref(false)
const showCanvas = ref(false)
const newName = ref('')
const newContext = ref('')
const activeDecision = ref<Decision | null>(null)
const newItemText = ref('')
const newItemType = ref<'pro' | 'con'>('pro')
const newItemWeight = ref(3)
const devilLoading = ref(false)
const devilArgument = ref('')

function createDecision() {
  if (!newName.value.trim()) return
  store.addDecision(newName.value.trim(), newContext.value.trim())
  newName.value = ''
  newContext.value = ''
  showNewDialog.value = false
}

function openDecision(d: Decision) {
  activeDecision.value = d
  devilArgument.value = ''
  showCanvas.value = true
}

function proScore(d: Decision) { return store.proScore(d) }
function conScore(d: Decision) { return store.conScore(d) }
function proRatio(d: Decision) {
  const total = store.proScore(d) + store.conScore(d)
  return total === 0 ? 0.5 : store.proScore(d) / total
}

function addItem() {
  if (!activeDecision.value || !newItemText.value.trim()) return
  store.addItem(activeDecision.value.id, newItemText.value.trim(), newItemWeight.value, newItemType.value)
  newItemText.value = ''
  // Re-find to get reactive reference
  activeDecision.value = store.decisions.find(d => d.id === activeDecision.value!.id) || activeDecision.value
}

function removeItem(itemId: string) {
  if (!activeDecision.value) return
  store.removeItem(activeDecision.value.id, itemId)
  activeDecision.value = store.decisions.find(d => d.id === activeDecision.value!.id) || activeDecision.value
}

function devilsAdvocate() {
  if (!activeDecision.value) return
  const d = activeDecision.value
  const isProWinning = store.proScore(d) >= store.conScore(d)
  devilLoading.value = true
  setTimeout(() => {
    const mockArguments = isProWinning
      ? [
          `Consider this: even though the pros outweigh the cons, you may be underestimating the long-term impact of "${d.items.filter(i => i.type === 'con')[0]?.text || 'the hidden risks'}". Confirmation bias often makes us inflate the weight of pros we already believe in.`,
          `The cons you've listed might be understated. What happens in 6 months if the worst case con materializes? Have you stress-tested the decision against that scenario?`,
          `You seem to be leaning towards this decision already. Ask yourself: if the outcome were reversed, would you still make the same choice? Sunk cost bias can skew your perception.`
        ]
      : [
          `Despite the cons, consider that "${d.items.filter(i => i.type === 'pro')[0]?.text || 'the main benefit'}" may have compounding value over time that your current weight doesn't capture.`,
          `The cons might feel heavy now, but are they temporary obstacles or permanent constraints? Short-term pain vs long-term gain is worth reassessing.`,
          `Are your cons based on fear of the unknown? Humans systematically overweight potential losses. Try re-rating each con with fresh eyes.`
        ]
    devilArgument.value = mockArguments[Math.floor(Math.random() * mockArguments.length)]
    devilLoading.value = false
  }, 1200)
}

function exportText() {
  if (!activeDecision.value) return
  const d = activeDecision.value
  const pros = d.items.filter(i => i.type === 'pro').map(i => `  + ${i.text} (weight: ${i.weight})`).join('\n')
  const cons = d.items.filter(i => i.type === 'con').map(i => `  - ${i.text} (weight: ${i.weight})`).join('\n')
  const text = `DECISION: ${d.name}\nCONTEXT: ${d.context}\n\nPROS (total: ${store.proScore(d)}):\n${pros || '  (none)'}\n\nCONS (total: ${store.conScore(d)}):\n${cons || '  (none)'}\n\nVERDICT: ${store.proScore(d) > store.conScore(d) ? 'Leaning PRO' : store.proScore(d) < store.conScore(d) ? 'Leaning CON' : 'TIED'}`
  const blob = new Blob([text], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${d.name.replace(/\s+/g, '-')}.txt`
  a.click()
  URL.revokeObjectURL(url)
}
</script>
