<template>
  <q-page class="q-pa-md">
    <!-- Hero -->
    <div class="text-center q-mb-lg">
      <div class="text-h4 text-weight-bold text-primary q-mb-sm">Place Yourself Anywhere</div>
      <div class="text-subtitle1 text-grey-7">Upload your selfie, pick a destination, and get a realistic AI composite photo</div>
    </div>

    <div class="row q-col-gutter-md">
      <!-- Left Panel: Upload + Destinations -->
      <div class="col-12 col-md-6">
        <!-- Upload Selfie -->
        <q-card flat bordered class="q-mb-md">
          <q-card-section>
            <div class="text-h6 q-mb-md"><q-icon name="person" class="q-mr-sm text-primary" />Upload Your Selfie</div>
            <div
              class="upload-zone q-mb-md"
              :class="{ 'upload-zone--has-file': selfieFile }"
              @click="triggerFileInput"
              @dragover.prevent
              @drop.prevent="onDrop"
            >
              <div v-if="!selfieFile" class="text-center q-pa-xl">
                <q-icon name="add_photo_alternate" size="3rem" color="grey-5" />
                <div class="text-grey-6 q-mt-sm">Click or drag & drop your selfie here</div>
                <div class="text-caption text-grey-5">JPG, PNG, WebP</div>
              </div>
              <div v-else class="text-center q-pa-md">
                <q-avatar size="120px">
                  <img :src="selfiePreview" />
                </q-avatar>
                <div class="text-caption q-mt-sm text-grey-7">{{ selfieFile.name }}</div>
                <q-btn flat size="sm" icon="close" @click.stop="selfieFile = null; selfiePreview = ''" />
              </div>
            </div>
            <input ref="fileInput" type="file" accept="image/*" style="display:none" @change="onFileSelect" />

            <q-btn
              flat
              color="primary"
              icon="shuffle"
              label="Surprise Me"
              @click="surpriseMe"
              class="full-width"
            />
          </q-card-section>
        </q-card>

        <!-- Destination Picker -->
        <q-card flat bordered>
          <q-card-section>
            <div class="text-h6 q-mb-md"><q-icon name="place" class="q-mr-sm text-secondary" />Choose Destination</div>
            <div class="row q-gutter-sm">
              <div
                v-for="dest in destinations"
                :key="dest.id"
                class="dest-card cursor-pointer col-5"
                :class="{ 'dest-selected': selectedDest === dest.id }"
                @click="selectedDest = dest.id"
              >
                <div class="dest-bg" :style="{ background: dest.bg }">
                  <div class="dest-overlay">
                    <q-icon :name="dest.icon" color="white" size="1.5rem" />
                  </div>
                </div>
                <div class="dest-label">
                  <div class="text-caption text-weight-bold">{{ dest.name }}</div>
                  <div class="text-caption text-grey-6">{{ dest.country }}</div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Right Panel: Generate + Gallery -->
      <div class="col-12 col-md-6">
        <!-- Generate Button -->
        <q-card flat bordered class="q-mb-md">
          <q-card-section>
            <div class="text-h6 q-mb-md"><q-icon name="auto_awesome" class="q-mr-sm text-accent" />Generate Composite</div>
            <q-btn
              color="primary"
              label="Generate My Photo"
              icon="auto_awesome"
              :disable="!selfieFile || !selectedDest"
              :loading="generating"
              @click="generate"
              unelevated
              size="lg"
              class="full-width q-mb-md"
            >
              <template #loading>
                <q-spinner-dots color="white" />
                &nbsp;AI Compositing...
              </template>
            </q-btn>

            <!-- Loading state -->
            <div v-if="generating" class="text-center q-pa-md">
              <q-linear-progress indeterminate color="primary" class="q-mb-sm" />
              <div class="text-caption text-grey-6">Removing background... compositing with {{ destinations.find(d=>d.id===selectedDest)?.name }}... applying lighting...</div>
            </div>

            <!-- Latest result -->
            <div v-if="latestResult">
              <q-img :src="latestResult" class="rounded-borders" style="max-height:300px;object-fit:cover" />
              <div class="row q-gutter-sm q-mt-sm">
                <q-btn flat icon="download" label="Download" color="primary" size="sm" @click="$q.notify({type:'positive',message:'Download started (watermarked preview)'})" />
                <q-btn flat icon="share" label="Share" color="secondary" size="sm" />
                <q-btn flat icon="save" label="Save" color="positive" size="sm" @click="$q.notify({type:'positive',message:'Saved to gallery'})" />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Gallery -->
        <q-card v-if="gallery.composites.length" flat bordered>
          <q-card-section>
            <div class="text-h6 q-mb-md"><q-icon name="photo_library" class="q-mr-sm text-primary" />Saved Composites</div>
            <div class="row q-gutter-sm">
              <q-card
                v-for="c in gallery.composites.slice(0, 6)"
                :key="c.id"
                flat
                bordered
                class="col-5"
              >
                <q-img :src="c.result" :ratio="4/5" />
                <q-card-section class="q-pa-xs text-center">
                  <div class="text-caption">{{ c.destination }}</div>
                </q-card-section>
              </q-card>
            </div>
          </q-card-section>
        </q-card>

        <!-- Empty state -->
        <div v-else class="text-center q-mt-xl text-grey-5">
          <q-icon name="photo_camera" size="4rem" />
          <div class="q-mt-sm">Upload a selfie and pick a destination to start!</div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { useGalleryStore } from 'src/stores/gallery.store'

const $q = useQuasar()
const gallery = useGalleryStore()

const selfieFile = ref<File | null>(null)
const selfiePreview = ref('')
const selectedDest = ref('')
const generating = ref(false)
const latestResult = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

const destinations = [
  { id: 'paris', name: 'Eiffel Tower', country: 'Paris, France', bg: 'linear-gradient(135deg,#74b9ff,#a29bfe)', icon: 'location_city' },
  { id: 'tokyo', name: 'Shibuya', country: 'Tokyo, Japan', bg: 'linear-gradient(135deg,#fd79a8,#fdcb6e)', icon: 'temple_buddhist' },
  { id: 'nyc', name: 'Times Square', country: 'New York, USA', bg: 'linear-gradient(135deg,#636e72,#2d3436)', icon: 'location_city' },
  { id: 'bali', name: 'Tanah Lot', country: 'Bali, Indonesia', bg: 'linear-gradient(135deg,#00b894,#55efc4)', icon: 'beach_access' },
  { id: 'santorini', name: 'Oia Village', country: 'Santorini, Greece', bg: 'linear-gradient(135deg,#0984e3,#74b9ff)', icon: 'villa' },
  { id: 'safari', name: 'Safari Plains', country: 'Kenya, Africa', bg: 'linear-gradient(135deg,#e17055,#fdcb6e)', icon: 'nature' },
  { id: 'sydney', name: 'Opera House', country: 'Sydney, Australia', bg: 'linear-gradient(135deg,#0984e3,#00cec9)', icon: 'theater_comedy' },
  { id: 'dubai', name: 'Burj Khalifa', country: 'Dubai, UAE', bg: 'linear-gradient(135deg,#fdcb6e,#e17055)', icon: 'domain' },
]

function triggerFileInput() {
  fileInput.value?.click()
}

function onFileSelect(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    selfieFile.value = file
    selfiePreview.value = URL.createObjectURL(file)
  }
}

function onDrop(e: DragEvent) {
  const file = e.dataTransfer?.files[0]
  if (file && file.type.startsWith('image/')) {
    selfieFile.value = file
    selfiePreview.value = URL.createObjectURL(file)
  }
}

function surpriseMe() {
  const random = destinations[Math.floor(Math.random() * destinations.length)]
  selectedDest.value = random.id
  $q.notify({ type: 'info', message: `Destination set to ${random.name}!` })
}

async function generate() {
  if (!selfieFile.value || !selectedDest.value) return
  generating.value = true
  latestResult.value = ''
  await new Promise(r => setTimeout(r, 3000))
  const dest = destinations.find(d => d.id === selectedDest.value)
  const id = crypto.randomUUID()
  latestResult.value = `https://picsum.photos/seed/${id}/400/500`
  gallery.addComposite(dest?.name || selectedDest.value)
  generating.value = false
  $q.notify({ type: 'positive', message: 'Composite generated!' })
}
</script>

<style scoped>
.upload-zone {
  border: 2px dashed #ccc;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.upload-zone:hover { border-color: var(--q-primary); background: #f8f4ff; }
.upload-zone--has-file { border-color: var(--q-positive); border-style: solid; }
.dest-card {
  border: 2px solid transparent;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
}
.dest-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
.dest-selected { border-color: var(--q-primary) !important; }
.dest-bg {
  height: 70px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.dest-overlay { display: flex; align-items: center; justify-content: center; }
.dest-label { padding: 4px 8px; background: white; }
</style>
