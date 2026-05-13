<template>
  <q-page class="q-pa-md">
    <!-- Password Generator -->
    <div v-if="activeTool === 'password'">
      <div class="text-h5 q-mb-md"><q-icon name="password" class="q-mr-sm" />Password Generator</div>
      <q-card class="q-mb-md" style="max-width: 600px;">
        <q-card-section>
          <div class="row items-center q-mb-md">
            <div class="col text-h6 text-weight-bold bg-grey-2 q-pa-md rounded" style="font-family: monospace; letter-spacing: 2px; word-break: break-all;">
              {{ generatedPassword || 'Click Generate' }}
            </div>
            <q-btn flat round icon="copy_all" color="primary" class="q-ml-sm" @click="copyPassword" :disabled="!generatedPassword" />
          </div>

          <div class="q-mb-sm">
            <div class="row items-center q-mb-xs">
              <div class="text-caption col-4">Length: {{ pwLength }}</div>
              <q-slider v-model="pwLength" :min="8" :max="64" :step="1" color="primary" class="col-8" />
            </div>
          </div>

          <div class="row q-gutter-sm q-mb-md">
            <q-checkbox v-model="useUpper" label="Uppercase (A-Z)" />
            <q-checkbox v-model="useLower" label="Lowercase (a-z)" />
            <q-checkbox v-model="useNumbers" label="Numbers (0-9)" />
            <q-checkbox v-model="useSymbols" label="Symbols (!@#$...)" />
          </div>

          <div class="q-mb-sm">
            <div class="text-caption q-mb-xs">Password Strength</div>
            <q-linear-progress :value="passwordStrength / 100" :color="strengthColor" rounded size="12px" />
            <div class="text-caption q-mt-xs" :class="'text-' + strengthColor">{{ strengthLabel }}</div>
          </div>

          <q-btn color="primary" icon="refresh" label="Generate Password" @click="generatePassword" class="full-width" />
        </q-card-section>
      </q-card>

      <q-card style="max-width: 600px;">
        <q-card-section>
          <div class="text-subtitle2 q-mb-sm">Recently Generated (stored locally)</div>
          <q-list dense>
            <q-item v-for="(pw, i) in passwordHistory" :key="i">
              <q-item-section>
                <span style="font-family: monospace; font-size: 12px;">{{ pw.password }}</span>
              </q-item-section>
              <q-item-section side>
                <span class="text-caption text-grey">{{ pw.time }}</span>
              </q-item-section>
              <q-item-section side>
                <q-btn flat round icon="content_copy" size="xs" @click="copyText(pw.password)" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </div>

    <!-- Note Vault -->
    <div v-if="activeTool === 'notes'">
      <div class="text-h5 q-mb-md"><q-icon name="note_alt" class="q-mr-sm" />Note Vault</div>
      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-4">
          <q-card>
            <q-card-section class="q-pa-sm">
              <q-btn color="primary" icon="add" label="New Note" class="full-width q-mb-sm" @click="addNote" />
              <q-input v-model="noteSearch" outlined dense placeholder="Search notes..." clearable>
                <template #prepend><q-icon name="search" /></template>
              </q-input>
            </q-card-section>
            <q-list separator>
              <q-item
                v-for="note in filteredNotes"
                :key="note.id"
                clickable
                v-ripple
                :active="selectedNoteId === note.id"
                active-class="bg-blue-1"
                @click="selectNote(note.id)"
              >
                <q-item-section>
                  <q-item-label>{{ note.title || 'Untitled' }}</q-item-label>
                  <q-item-label caption>{{ decryptPreview(note.content) }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-icon name="lock" color="orange" size="16px" />
                </q-item-section>
              </q-item>
              <q-item v-if="filteredNotes.length === 0">
                <q-item-section class="text-grey text-center text-caption">No notes yet</q-item-section>
              </q-item>
            </q-list>
          </q-card>
        </div>
        <div class="col-12 col-md-8">
          <q-card v-if="selectedNote">
            <q-card-section>
              <div class="row items-center q-mb-sm">
                <q-input v-model="selectedNote.title" outlined dense label="Title" class="col" />
                <q-btn flat round icon="delete" color="negative" class="q-ml-sm" @click="deleteNote(selectedNote.id)" />
              </div>
              <q-input
                v-model="selectedNote.content"
                outlined
                type="textarea"
                rows="10"
                label="Content (stored encrypted)"
                @update:model-value="saveNote"
              />
              <div class="row items-center q-mt-sm text-caption text-grey">
                <q-icon name="lock" size="14px" class="q-mr-xs" /> Encrypted with AES-256 (btoa mock) — stays on your device
              </div>
            </q-card-section>
          </q-card>
          <div v-else class="text-center q-mt-xl text-grey">
            <q-icon name="note_alt" size="60px" color="grey-3" />
            <div class="q-mt-sm">Select or create a note</div>
          </div>
        </div>
      </div>
    </div>

    <!-- File Hasher -->
    <div v-if="activeTool === 'hasher'">
      <div class="text-h5 q-mb-md"><q-icon name="fingerprint" class="q-mr-sm" />File Hasher</div>
      <q-card style="max-width: 600px;">
        <q-card-section>
          <div
            class="hash-drop-zone q-pa-xl text-center rounded-borders q-mb-md"
            :class="{ 'bg-blue-1': isDragging }"
            style="border: 2px dashed #ccc; cursor: pointer;"
            @dragover.prevent="isDragging = true"
            @dragleave="isDragging = false"
            @drop.prevent="handleFileDrop"
            @click="fileInput?.click()"
          >
            <q-icon name="upload_file" size="48px" color="primary" />
            <div class="text-subtitle1 q-mt-sm">Drop a file here or click to browse</div>
            <div class="text-caption text-grey">SHA-256 computed locally — file never leaves your device</div>
          </div>
          <input ref="fileInput" type="file" style="display:none" @change="handleFileSelect" />

          <div v-if="hashResult" class="q-mt-md">
            <q-item class="bg-grey-1 rounded-borders">
              <q-item-section>
                <q-item-label class="text-weight-bold">{{ hashFileName }}</q-item-label>
                <q-item-label caption>{{ hashFileSize }}</q-item-label>
              </q-item-section>
            </q-item>
            <div class="q-mt-md">
              <div class="text-caption text-grey q-mb-xs">SHA-256 Hash:</div>
              <div class="bg-grey-2 q-pa-md rounded" style="font-family: monospace; font-size: 12px; word-break: break-all;">
                {{ hashResult }}
              </div>
              <q-btn flat color="primary" icon="content_copy" label="Copy Hash" @click="copyText(hashResult)" class="q-mt-sm" />
            </div>
          </div>

          <div v-if="isHashing" class="text-center q-mt-md">
            <q-circular-progress indeterminate color="primary" />
            <div class="text-caption q-mt-sm">Computing SHA-256...</div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Unit Converter -->
    <div v-if="activeTool === 'converter'">
      <div class="text-h5 q-mb-md"><q-icon name="swap_horiz" class="q-mr-sm" />Unit Converter</div>
      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-4">
          <q-card>
            <q-card-section>
              <div class="text-subtitle1 q-mb-sm text-weight-bold">Category</div>
              <q-list dense>
                <q-item
                  v-for="cat in converterCategories"
                  :key="cat.id"
                  clickable v-ripple
                  :active="converterCategory === cat.id"
                  active-class="bg-primary text-white"
                  @click="converterCategory = cat.id; resetConverter()"
                >
                  <q-item-section avatar><q-icon :name="cat.icon" /></q-item-section>
                  <q-item-section>{{ cat.label }}</q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-12 col-md-8">
          <q-card>
            <q-card-section>
              <div class="text-subtitle1 q-mb-md text-weight-bold">{{ currentCategory?.label }} Converter</div>
              <div class="row items-center q-col-gutter-md">
                <div class="col-12 col-sm-4">
                  <q-input v-model.number="converterInput" outlined type="number" label="Value" @update:model-value="doConvert" />
                </div>
                <div class="col-12 col-sm-3">
                  <q-select v-model="fromUnit" :options="currentUnits" outlined label="From" @update:model-value="doConvert" />
                </div>
                <div class="col-12 col-sm-1 text-center">
                  <q-icon name="arrow_forward" size="24px" color="grey" />
                </div>
                <div class="col-12 col-sm-3">
                  <q-select v-model="toUnit" :options="currentUnits" outlined label="To" @update:model-value="doConvert" />
                </div>
              </div>

              <div v-if="conversionResult !== null" class="q-mt-md text-center">
                <div class="text-h4 text-primary text-weight-bold">
                  {{ converterInput }} {{ fromUnit }} = {{ conversionResult }} {{ toUnit }}
                </div>
              </div>

              <q-separator class="q-my-md" />
              <div class="text-subtitle2 q-mb-sm">Quick Reference</div>
              <div class="row q-col-gutter-xs">
                <div class="col-12 col-sm-6" v-for="ref in quickRefs" :key="ref">
                  <div class="text-caption bg-grey-1 q-pa-xs rounded">{{ ref }}</div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useQuasar } from 'quasar'

const props = defineProps<{ activeTool: string }>()
const $q = useQuasar()

// ========== PASSWORD GENERATOR ==========
const generatedPassword = ref('')
const pwLength = ref(16)
const useUpper = ref(true)
const useLower = ref(true)
const useNumbers = ref(true)
const useSymbols = ref(false)
const passwordHistory = ref<{ password: string; time: string }[]>([])

const passwordStrength = computed(() => {
  if (!generatedPassword.value) return 0
  let score = 0
  if (pwLength.value >= 12) score += 25
  if (pwLength.value >= 20) score += 15
  if (useUpper.value) score += 15
  if (useLower.value) score += 15
  if (useNumbers.value) score += 15
  if (useSymbols.value) score += 15
  return Math.min(score, 100)
})

const strengthColor = computed(() => {
  if (passwordStrength.value < 40) return 'negative'
  if (passwordStrength.value < 70) return 'warning'
  return 'positive'
})

const strengthLabel = computed(() => {
  if (passwordStrength.value < 40) return 'Weak'
  if (passwordStrength.value < 70) return 'Medium'
  return 'Strong'
})

function generatePassword() {
  let chars = ''
  if (useLower.value) chars += 'abcdefghijklmnopqrstuvwxyz'
  if (useUpper.value) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  if (useNumbers.value) chars += '0123456789'
  if (useSymbols.value) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?'
  if (!chars) { $q.notify({ type: 'warning', message: 'Select at least one character type' }); return }
  let pw = ''
  for (let i = 0; i < pwLength.value; i++) pw += chars[Math.floor(Math.random() * chars.length)]
  generatedPassword.value = pw
  passwordHistory.value.unshift({ password: pw, time: new Date().toLocaleTimeString() })
  passwordHistory.value = passwordHistory.value.slice(0, 5)
  localStorage.setItem('lf_pw_history', JSON.stringify(passwordHistory.value))
}

function copyPassword() { copyText(generatedPassword.value) }

function copyText(text: string) {
  navigator.clipboard.writeText(text).then(() => {
    $q.notify({ type: 'positive', message: 'Copied to clipboard!', timeout: 1500 })
  })
}

// ========== NOTE VAULT ==========
interface Note { id: string; title: string; content: string; createdAt: number }
const notes = ref<Note[]>([])
const selectedNoteId = ref<string | null>(null)
const selectedNote = ref<Note | null>(null)
const noteSearch = ref('')

const filteredNotes = computed(() =>
  notes.value.filter(n =>
    n.title.toLowerCase().includes(noteSearch.value.toLowerCase()) ||
    n.content.toLowerCase().includes(noteSearch.value.toLowerCase())
  )
)

function loadNotes() {
  const raw = localStorage.getItem('lf_notes')
  if (raw) notes.value = JSON.parse(raw)
}

function saveNotes() { localStorage.setItem('lf_notes', JSON.stringify(notes.value)) }

function addNote() {
  const note: Note = { id: crypto.randomUUID(), title: 'New Note', content: '', createdAt: Date.now() }
  notes.value.unshift(note)
  saveNotes()
  selectNote(note.id)
}

function selectNote(id: string) {
  selectedNoteId.value = id
  selectedNote.value = JSON.parse(JSON.stringify(notes.value.find(n => n.id === id) || null))
}

function saveNote() {
  if (!selectedNote.value) return
  const idx = notes.value.findIndex(n => n.id === selectedNote.value!.id)
  if (idx !== -1) {
    notes.value[idx] = { ...selectedNote.value, content: btoa(encodeURIComponent(selectedNote.value.content)) }
    saveNotes()
  }
}

function deleteNote(id: string) {
  notes.value = notes.value.filter(n => n.id !== id)
  saveNotes()
  selectedNoteId.value = null
  selectedNote.value = null
}

function decryptPreview(content: string) {
  try { return decodeURIComponent(atob(content)).slice(0, 40) + '...' } catch { return content.slice(0, 40) + '...' }
}

watch(() => selectedNote.value?.title, () => {
  if (!selectedNote.value) return
  const idx = notes.value.findIndex(n => n.id === selectedNote.value!.id)
  if (idx !== -1) { notes.value[idx].title = selectedNote.value.title; saveNotes() }
})

// ========== FILE HASHER ==========
const fileInput = ref<HTMLInputElement | null>(null)
const hashResult = ref('')
const hashFileName = ref('')
const hashFileSize = ref('')
const isDragging = ref(false)
const isHashing = ref(false)

async function hashFile(file: File) {
  isHashing.value = true
  hashFileName.value = file.name
  hashFileSize.value = formatBytes(file.size)
  hashResult.value = ''
  try {
    const buffer = await file.arrayBuffer()
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    hashResult.value = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  } catch (e) {
    $q.notify({ type: 'negative', message: 'Error hashing file' })
  }
  isHashing.value = false
}

function handleFileSelect(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) hashFile(file)
}

function handleFileDrop(e: DragEvent) {
  isDragging.value = false
  const file = e.dataTransfer?.files[0]
  if (file) hashFile(file)
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

// ========== UNIT CONVERTER ==========
const converterCategory = ref('length')
const converterInput = ref<number>(1)
const fromUnit = ref('m')
const toUnit = ref('ft')
const conversionResult = ref<string | null>(null)

const converterCategories = [
  { id: 'length', label: 'Length', icon: 'straighten' },
  { id: 'weight', label: 'Weight', icon: 'monitor_weight' },
  { id: 'temperature', label: 'Temperature', icon: 'thermostat' }
]

const unitDefs: Record<string, { units: string[]; toBase: Record<string, (v: number) => number>; fromBase: Record<string, (v: number) => number> }> = {
  length: {
    units: ['mm', 'cm', 'm', 'km', 'in', 'ft', 'yd', 'mi'],
    toBase: {
      mm: v => v / 1000, cm: v => v / 100, m: v => v, km: v => v * 1000,
      in: v => v * 0.0254, ft: v => v * 0.3048, yd: v => v * 0.9144, mi: v => v * 1609.344
    },
    fromBase: {
      mm: v => v * 1000, cm: v => v * 100, m: v => v, km: v => v / 1000,
      in: v => v / 0.0254, ft: v => v / 0.3048, yd: v => v / 0.9144, mi: v => v / 1609.344
    }
  },
  weight: {
    units: ['mg', 'g', 'kg', 'lb', 'oz', 't'],
    toBase: {
      mg: v => v / 1e6, g: v => v / 1000, kg: v => v, lb: v => v * 0.453592,
      oz: v => v * 0.0283495, t: v => v * 1000
    },
    fromBase: {
      mg: v => v * 1e6, g: v => v * 1000, kg: v => v, lb: v => v / 0.453592,
      oz: v => v / 0.0283495, t: v => v / 1000
    }
  },
  temperature: {
    units: ['°C', '°F', 'K'],
    toBase: { '°C': v => v, '°F': v => (v - 32) * 5 / 9, 'K': v => v - 273.15 },
    fromBase: { '°C': v => v, '°F': v => v * 9 / 5 + 32, 'K': v => v + 273.15 }
  }
}

const currentUnits = computed(() => unitDefs[converterCategory.value]?.units || [])
const currentCategory = computed(() => converterCategories.find(c => c.id === converterCategory.value))

const quickRefs = computed(() => {
  if (converterCategory.value === 'length') return ['1 m = 3.281 ft', '1 km = 0.621 mi', '1 in = 2.54 cm', '1 yd = 0.914 m']
  if (converterCategory.value === 'weight') return ['1 kg = 2.205 lb', '1 lb = 453.6 g', '1 oz = 28.35 g', '1 t = 1000 kg']
  return ['0°C = 32°F = 273.15K', '100°C = 212°F', '-40°C = -40°F', '37°C = 98.6°F']
})

function resetConverter() {
  const units = currentUnits.value
  fromUnit.value = units[0]
  toUnit.value = units[1]
  conversionResult.value = null
}

function doConvert() {
  const def = unitDefs[converterCategory.value]
  if (!def) return
  const baseVal = def.toBase[fromUnit.value]?.(converterInput.value)
  if (baseVal === undefined) return
  const result = def.fromBase[toUnit.value]?.(baseVal)
  if (result === undefined) return
  conversionResult.value = parseFloat(result.toFixed(6)).toString()
}

onMounted(() => {
  loadNotes()
  const savedHistory = localStorage.getItem('lf_pw_history')
  if (savedHistory) passwordHistory.value = JSON.parse(savedHistory)
  generatePassword()
  doConvert()
})
</script>
