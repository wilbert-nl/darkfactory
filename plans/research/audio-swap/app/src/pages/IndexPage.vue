<template>
  <q-page class="q-pa-md">
    <!-- Hero -->
    <div class="text-center q-mb-lg">
      <div class="text-h4 text-weight-bold text-primary q-mb-sm">Replace Audio in Your Video</div>
      <div class="text-subtitle1 text-grey-7">Upload video, swap audio track, download the result — in 4 simple steps</div>
    </div>

    <!-- Stepper -->
    <q-stepper v-model="step" animated flat bordered class="q-mb-lg">
      <!-- Step 1: Upload Video -->
      <q-step :name="1" title="Upload Video" icon="videocam" :done="step > 1">
        <div class="q-mb-md text-subtitle2">Upload your video file</div>
        <q-file
          v-model="videoFile"
          label="Choose video (MP4, MOV, WebM)"
          accept="video/*"
          outlined
          class="q-mb-md"
        >
          <template #prepend><q-icon name="movie" /></template>
        </q-file>

        <div v-if="videoFile" class="q-mb-md">
          <q-card flat bordered class="bg-blue-1">
            <q-card-section class="q-pa-sm">
              <div class="row items-center">
                <q-icon name="check_circle" color="positive" class="q-mr-sm" />
                <div>
                  <div class="text-weight-bold">{{ videoFile.name }}</div>
                  <div class="text-caption text-grey-7">{{ (videoFile.size / 1024 / 1024).toFixed(2) }} MB</div>
                </div>
              </div>
            </q-card-section>
          </q-card>
          <!-- Mock waveform -->
          <div class="waveform q-mt-md q-pa-sm" style="background:#f0f4f8;border-radius:8px;overflow:hidden">
            <div class="text-caption text-grey-6 q-mb-xs">Original audio waveform (preview)</div>
            <svg width="100%" height="60" viewBox="0 0 400 60">
              <g v-for="i in 80" :key="i">
                <rect
                  :x="i * 5"
                  :y="30 - Math.abs(Math.sin(i * 0.4) * 25)"
                  width="3"
                  :height="Math.abs(Math.sin(i * 0.4) * 25) * 2"
                  fill="#1976d2"
                  opacity="0.6"
                />
              </g>
            </svg>
          </div>
        </div>

        <q-stepper-navigation>
          <q-btn color="primary" label="Next" :disable="!videoFile" @click="step = 2" />
        </q-stepper-navigation>
      </q-step>

      <!-- Step 2: Upload/Record Audio -->
      <q-step :name="2" title="New Audio" icon="mic" :done="step > 2">
        <div class="q-mb-md text-subtitle2">Upload replacement audio or record a voiceover</div>

        <q-tabs v-model="audioTab" class="q-mb-md" dense>
          <q-tab name="upload" icon="upload_file" label="Upload Audio" />
          <q-tab name="royalty" icon="library_music" label="Royalty-Free" />
          <q-tab name="record" icon="mic" label="Record" />
        </q-tabs>

        <q-tab-panels v-model="audioTab" animated>
          <q-tab-panel name="upload">
            <q-file
              v-model="audioFile"
              label="Choose audio file (MP3, WAV, OGG)"
              accept="audio/*"
              outlined
            >
              <template #prepend><q-icon name="audio_file" /></template>
            </q-file>
            <div v-if="audioFile" class="q-mt-md">
              <q-chip color="positive" text-color="white" icon="check_circle">{{ audioFile.name }}</q-chip>
            </div>
          </q-tab-panel>

          <q-tab-panel name="royalty">
            <q-list bordered separator>
              <q-item
                v-for="track in royaltyTracks"
                :key="track.id"
                clickable
                :active="selectedTrack === track.id"
                active-class="bg-blue-1"
                @click="selectedTrack = track.id; audioFile = null"
              >
                <q-item-section avatar>
                  <q-btn flat round :icon="playingTrack === track.id ? 'pause' : 'play_arrow'" color="primary" size="sm"
                    @click.stop="togglePlay(track)" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ track.name }}</q-item-label>
                  <q-item-label caption>{{ track.genre }} · {{ track.duration }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-icon v-if="selectedTrack === track.id" name="check_circle" color="positive" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-tab-panel>

          <q-tab-panel name="record">
            <div class="text-center q-pa-md">
              <q-btn
                :color="isRecording ? 'negative' : 'primary'"
                :icon="isRecording ? 'stop' : 'mic'"
                :label="isRecording ? 'Stop Recording' : 'Start Recording'"
                @click="toggleRecord"
                size="lg"
                round
                class="q-mb-md"
              />
              <div v-if="isRecording" class="text-negative q-mt-sm">
                <q-icon name="fiber_manual_record" class="blink" /> Recording... {{ recordSeconds }}s
              </div>
              <div v-if="recordedBlob" class="q-mt-md">
                <audio controls :src="recordedUrl" class="full-width" />
              </div>
            </div>
          </q-tab-panel>
        </q-tab-panels>

        <q-stepper-navigation class="q-mt-md">
          <q-btn flat color="primary" label="Back" @click="step = 1" class="q-mr-sm" />
          <q-btn color="primary" label="Next" :disable="!audioFile && !selectedTrack && !recordedBlob" @click="step = 3" />
        </q-stepper-navigation>
      </q-step>

      <!-- Step 3: Alignment -->
      <q-step :name="3" title="Alignment" icon="tune" :done="step > 3">
        <div class="q-mb-md text-subtitle2">Adjust audio timing and levels</div>

        <div class="q-mb-md">
          <div class="text-caption text-grey-7 q-mb-xs">Audio Offset (seconds)</div>
          <q-slider v-model="offset" :min="-30" :max="30" :step="0.5" label label-always class="q-mx-sm" />
          <div class="text-caption text-center text-grey-6">{{ offset >= 0 ? '+' : '' }}{{ offset }}s</div>
        </div>

        <div class="q-mb-md">
          <div class="text-caption text-grey-7 q-mb-xs">Original Audio Volume (mute = 0)</div>
          <q-slider v-model="originalVolume" :min="0" :max="100" :step="5" label label-always class="q-mx-sm" color="warning" />
        </div>

        <div class="q-mb-md">
          <div class="text-caption text-grey-7 q-mb-xs">New Audio Volume</div>
          <q-slider v-model="newVolume" :min="0" :max="100" :step="5" label label-always class="q-mx-sm" color="positive" />
        </div>

        <div class="row q-gutter-sm">
          <q-toggle v-model="fadeIn" label="Fade In" />
          <q-toggle v-model="fadeOut" label="Fade Out" />
          <q-toggle v-model="trimToVideo" label="Trim audio to video length" />
        </div>

        <q-stepper-navigation class="q-mt-md">
          <q-btn flat color="primary" label="Back" @click="step = 2" class="q-mr-sm" />
          <q-btn color="primary" label="Preview & Export" @click="step = 4" />
        </q-stepper-navigation>
      </q-step>

      <!-- Step 4: Preview & Download -->
      <q-step :name="4" title="Preview & Download" icon="download">
        <div class="q-mb-md text-subtitle2">Your export is ready</div>

        <q-card flat bordered class="q-mb-md bg-green-1">
          <q-card-section>
            <div class="row items-center q-gutter-md">
              <q-icon name="check_circle" color="positive" size="2rem" />
              <div>
                <div class="text-weight-bold">Export Summary</div>
                <div class="text-caption">Video: {{ videoFile?.name }}</div>
                <div class="text-caption">New audio: {{ audioFile?.name || (selectedTrack ? royaltyTracks.find(t=>t.id===selectedTrack)?.name : 'Recorded voiceover') }}</div>
                <div class="text-caption">Offset: {{ offset }}s · Original vol: {{ originalVolume }}% · New vol: {{ newVolume }}%</div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Mock video preview -->
        <div class="video-preview q-mb-md" style="background:#000;border-radius:8px;height:200px;display:flex;align-items:center;justify-content:center">
          <div class="text-center text-white">
            <q-icon name="play_circle_outline" size="4rem" class="cursor-pointer" @click="$q.notify({type:'info',message:'Preview would play here in production'})" />
            <div class="text-caption">Click to preview (mock)</div>
          </div>
        </div>

        <div class="row q-gutter-sm">
          <q-btn color="primary" icon="download" label="Download MP4" @click="mockDownload" unelevated />
          <q-btn color="secondary" icon="download" label="Download MOV" @click="mockDownload" outline />
        </div>

        <q-stepper-navigation class="q-mt-md">
          <q-btn flat color="primary" label="Back" @click="step = 3" class="q-mr-sm" />
          <q-btn flat color="grey" label="Start New Project" @click="resetAll" />
        </q-stepper-navigation>
      </q-step>
    </q-stepper>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const step = ref(1)
const audioTab = ref('upload')
const videoFile = ref<File | null>(null)
const audioFile = ref<File | null>(null)
const selectedTrack = ref('')
const playingTrack = ref('')
const offset = ref(0)
const originalVolume = ref(0)
const newVolume = ref(100)
const fadeIn = ref(true)
const fadeOut = ref(true)
const trimToVideo = ref(true)
const isRecording = ref(false)
const recordSeconds = ref(0)
const recordedBlob = ref<Blob | null>(null)
const recordedUrl = ref('')

const royaltyTracks = [
  { id: '1', name: 'Summer Breeze', genre: 'Ambient', duration: '3:24' },
  { id: '2', name: 'Ocean Waves', genre: 'Nature', duration: '5:00' },
  { id: '3', name: 'Upbeat Corporate', genre: 'Corporate', duration: '2:45' },
  { id: '4', name: 'Cinematic Epic', genre: 'Cinematic', duration: '4:10' },
  { id: '5', name: 'Lo-Fi Chill', genre: 'Lo-Fi', duration: '3:55' },
]

let recordInterval: ReturnType<typeof setInterval> | null = null

function togglePlay(track: { id: string }) {
  playingTrack.value = playingTrack.value === track.id ? '' : track.id
}

function toggleRecord() {
  if (isRecording.value) {
    isRecording.value = false
    if (recordInterval) clearInterval(recordInterval)
    // simulate recorded blob
    recordedBlob.value = new Blob([], { type: 'audio/webm' })
    recordedUrl.value = ''
    $q.notify({ type: 'positive', message: `Recorded ${recordSeconds.value}s of audio` })
  } else {
    isRecording.value = true
    recordSeconds.value = 0
    recordedBlob.value = null
    recordInterval = setInterval(() => { recordSeconds.value++ }, 1000)
  }
}

function mockDownload() {
  $q.notify({ type: 'positive', message: 'Download started (mock — no actual processing in this demo)' })
}

function resetAll() {
  step.value = 1
  videoFile.value = null
  audioFile.value = null
  selectedTrack.value = ''
  offset.value = 0
  originalVolume.value = 0
  newVolume.value = 100
  recordedBlob.value = null
}
</script>

<style scoped>
.blink {
  animation: blink 1s step-start infinite;
}
@keyframes blink {
  50% { opacity: 0; }
}
</style>
