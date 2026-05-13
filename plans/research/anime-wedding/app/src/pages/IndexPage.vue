<template>
  <q-page class="q-pa-md">
    <!-- Hero -->
    <div class="text-center q-mb-lg">
      <div class="text-h4 text-weight-bold text-primary q-mb-sm">Transform Your Wedding into Anime</div>
      <div class="text-subtitle1 text-grey-7">Upload your video, choose an art style, and receive a beautiful anime-style highlight reel</div>
    </div>

    <!-- Upload Section -->
    <q-card class="q-mb-lg" flat bordered>
      <q-card-section>
        <div class="text-h6 q-mb-md"><q-icon name="cloud_upload" class="q-mr-sm text-primary" />Upload Wedding Video</div>
        <q-file
          v-model="uploadedFile"
          label="Choose video file (MP4, MOV — max 500MB)"
          accept="video/*"
          outlined
          :rules="[val => !val || val.size < 500 * 1024 * 1024 || 'File too large']"
          class="q-mb-md"
        >
          <template #prepend><q-icon name="videocam" /></template>
        </q-file>

        <div v-if="uploadedFile" class="q-mb-md">
          <q-chip color="positive" text-color="white" icon="check_circle">
            {{ uploadedFile.name }} ({{ (uploadedFile.size / 1024 / 1024).toFixed(1) }} MB)
          </q-chip>
        </div>

        <!-- Style Selector -->
        <div class="text-subtitle2 q-mb-sm text-weight-medium">Choose Art Style</div>
        <div class="row q-gutter-sm q-mb-md">
          <q-card
            v-for="style in styles"
            :key="style.id"
            class="style-card cursor-pointer col-5 col-sm-2"
            :class="{ 'style-selected': selectedStyle === style.id }"
            flat
            bordered
            @click="selectedStyle = style.id"
          >
            <div class="style-thumb" :style="{ background: style.bg }">
              <q-icon :name="style.icon" size="2rem" color="white" />
            </div>
            <q-card-section class="q-pa-sm text-center">
              <div class="text-caption text-weight-bold">{{ style.name }}</div>
              <div class="text-caption text-grey-6">{{ style.desc }}</div>
            </q-card-section>
          </q-card>
        </div>

        <q-btn
          color="primary"
          label="Convert to Anime"
          icon="auto_awesome"
          :disable="!uploadedFile || !selectedStyle"
          @click="startConversion"
          unelevated
          size="lg"
          class="full-width"
        />
      </q-card-section>
    </q-card>

    <!-- Processing Queue -->
    <q-card v-if="store.jobs.length" class="q-mb-lg" flat bordered>
      <q-card-section>
        <div class="text-h6 q-mb-md"><q-icon name="queue" class="q-mr-sm text-secondary" />Processing Queue</div>
        <q-list separator>
          <q-item v-for="job in store.jobs" :key="job.id">
            <q-item-section avatar>
              <q-icon
                :name="job.status === 'done' ? 'check_circle' : job.status === 'failed' ? 'error' : 'hourglass_empty'"
                :color="job.status === 'done' ? 'positive' : job.status === 'failed' ? 'negative' : 'warning'"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ job.filename }}</q-item-label>
              <q-item-label caption>Style: {{ styles.find(s => s.id === job.style)?.name }} · {{ job.status }}</q-item-label>
              <q-linear-progress
                v-if="job.status === 'processing'"
                :value="job.progress / 100"
                color="primary"
                class="q-mt-xs"
                animated
              />
            </q-item-section>
            <q-item-section side>
              <q-chip :color="statusColor(job.status)" text-color="white" size="sm">
                {{ job.status === 'processing' ? Math.round(job.progress) + '%' : job.status }}
              </q-chip>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>

    <!-- Results Gallery -->
    <q-card v-if="doneJobs.length" flat bordered>
      <q-card-section>
        <div class="text-h6 q-mb-md"><q-icon name="photo_library" class="q-mr-sm text-accent" />Result Gallery</div>
        <div class="row q-gutter-md">
          <q-card
            v-for="job in doneJobs"
            :key="job.id"
            class="col-5 col-sm-3"
            flat
            bordered
          >
            <q-img :src="job.resultThumb" :ratio="4/3" />
            <q-card-section class="q-pa-sm">
              <div class="text-caption text-weight-bold">{{ job.filename }}</div>
              <div class="text-caption text-grey-6">{{ styles.find(s => s.id === job.style)?.name }}</div>
            </q-card-section>
            <q-card-actions align="right" class="q-pa-xs">
              <q-btn flat round icon="download" color="primary" size="sm">
                <q-tooltip>Download (watermarked preview)</q-tooltip>
              </q-btn>
              <q-btn flat round icon="share" color="secondary" size="sm">
                <q-tooltip>Share</q-tooltip>
              </q-btn>
            </q-card-actions>
          </q-card>
        </div>
      </q-card-section>
    </q-card>

    <!-- Empty state -->
    <div v-if="!store.jobs.length" class="text-center q-mt-xl text-grey-5">
      <q-icon name="movie" size="4rem" />
      <div class="text-subtitle1 q-mt-sm">No conversions yet. Upload a video to get started!</div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useJobStore } from 'src/stores/job.store'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const store = useJobStore()

const uploadedFile = ref<File | null>(null)
const selectedStyle = ref('')

const styles = [
  { id: 'ghibli', name: 'Studio Ghibli', desc: 'Soft & magical', bg: 'linear-gradient(135deg,#74b9ff,#a29bfe)', icon: 'forest' },
  { id: 'shonen', name: 'Shonen Action', desc: 'Bold & dynamic', bg: 'linear-gradient(135deg,#fd79a8,#e17055)', icon: 'bolt' },
  { id: 'manhwa', name: 'Manhwa', desc: 'Webtoon style', bg: 'linear-gradient(135deg,#55efc4,#00b894)', icon: 'menu_book' },
  { id: 'shinkai', name: 'Makoto Shinkai', desc: 'Atmospheric', bg: 'linear-gradient(135deg,#0984e3,#6c5ce7)', icon: 'star' },
  { id: 'chibi', name: 'Chibi', desc: 'Cute & fun', bg: 'linear-gradient(135deg,#fdcb6e,#e84393)', icon: 'face' },
  { id: 'cel', name: 'Classic Cel', desc: 'Traditional anime', bg: 'linear-gradient(135deg,#b2bec3,#636e72)', icon: 'palette' },
]

const doneJobs = computed(() => store.jobs.filter(j => j.status === 'done'))

function statusColor(status: string) {
  if (status === 'done') return 'positive'
  if (status === 'failed') return 'negative'
  if (status === 'processing') return 'primary'
  return 'warning'
}

function startConversion() {
  if (!uploadedFile.value || !selectedStyle.value) return
  const job = store.addJob(uploadedFile.value.name, selectedStyle.value)
  uploadedFile.value = null
  $q.notify({ type: 'positive', message: 'Job queued! Processing started...' })
  store.simulateProcessing(job.id)
}
</script>

<style scoped>
.style-card {
  transition: all 0.2s;
  min-width: 100px;
}
.style-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
.style-selected {
  border: 2px solid var(--q-primary) !important;
  box-shadow: 0 0 0 2px rgba(233,30,140,0.2);
}
.style-thumb {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
