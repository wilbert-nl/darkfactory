<template>
  <q-page class="q-pa-md">
    <!-- URL Input -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6 q-mb-sm">YouTube Comments TTS Reader</div>
        <div class="row q-gutter-sm items-center">
          <q-input
            v-model="videoUrl"
            label="Paste YouTube Video URL"
            class="col"
            dense
            placeholder="https://www.youtube.com/watch?v=..."
          />
          <q-btn color="primary" label="Load Comments" @click="loadComments" :loading="loading" />
        </div>
      </q-card-section>
    </q-card>

    <div v-if="comments.length" class="row q-gutter-md">
      <!-- Left: Controls + Comments List -->
      <div class="col-12 col-md-5">
        <!-- TTS Controls -->
        <q-card class="q-mb-md">
          <q-card-section>
            <div class="text-subtitle1 q-mb-sm">Playback Controls</div>

            <!-- Voice selector -->
            <q-select
              v-model="selectedVoice"
              :options="voiceOptions"
              label="Voice"
              option-label="name"
              option-value="name"
              dense
              class="q-mb-sm"
            />

            <!-- Speed -->
            <div class="row items-center q-mb-sm">
              <div class="text-caption col-3">Speed: {{ speed }}x</div>
              <q-slider v-model="speed" :min="0.5" :max="2" :step="0.25" class="col" />
            </div>

            <!-- Controls -->
            <div class="row q-gutter-sm items-center">
              <q-btn
                :color="isPlaying ? 'negative' : 'primary'"
                :icon="isPlaying ? 'pause' : 'play_arrow'"
                :label="isPlaying ? 'Pause' : 'Play All'"
                @click="togglePlay"
                dense
              />
              <q-btn
                flat
                icon="skip_next"
                label="Skip"
                @click="skipComment"
                :disable="!isPlaying"
                dense
              />
              <q-btn
                flat
                icon="stop"
                label="Stop"
                @click="stopAll"
                :disable="!isPlaying && currentIndex === -1"
                dense
              />
            </div>

            <div class="q-mt-sm text-caption text-grey" v-if="currentIndex >= 0">
              Reading comment {{ currentIndex + 1 }} of {{ comments.length }}
            </div>
          </q-card-section>
        </q-card>

        <!-- Comments List -->
        <q-list bordered separator>
          <q-item
            v-for="(comment, i) in comments"
            :key="i"
            :class="currentIndex === i ? 'bg-blue-1' : ''"
          >
            <q-item-section avatar>
              <q-avatar size="32px" :color="currentIndex === i ? 'primary' : 'grey-4'" text-color="white">
                {{ comment.author[0] }}
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-bold text-caption">{{ comment.author }}</q-item-label>
              <q-item-label :class="currentIndex === i ? 'text-primary' : ''">{{ comment.text }}</q-item-label>
              <q-item-label caption>{{ comment.likes }} likes</q-item-label>
            </q-item-section>
            <q-item-section side v-if="currentIndex === i">
              <q-icon name="volume_up" color="primary" />
            </q-item-section>
          </q-item>
        </q-list>
      </div>

      <!-- Right: Now Playing -->
      <div class="col-12 col-md-6">
        <q-card style="min-height: 300px" :class="isPlaying ? 'bg-blue-1' : ''">
          <q-card-section>
            <div class="text-subtitle1 q-mb-sm">Now Reading</div>
            <div v-if="currentIndex >= 0" class="text-center q-pa-lg">
              <q-avatar size="64px" color="primary" text-color="white" class="q-mb-md">
                {{ comments[currentIndex]?.author[0] }}
              </q-avatar>
              <div class="text-h6">{{ comments[currentIndex]?.author }}</div>
              <div class="text-body1 q-mt-md" style="line-height: 1.8">{{ comments[currentIndex]?.text }}</div>
              <div class="text-caption text-grey q-mt-sm">{{ comments[currentIndex]?.likes }} likes</div>
            </div>
            <div v-else class="flex flex-center" style="height: 200px">
              <div class="text-center text-grey">
                <q-icon name="headphones" size="4em" />
                <div class="q-mt-sm">Press Play to start reading comments</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div v-else-if="!loading" class="text-center text-grey q-mt-xl">
      <q-icon name="youtube_searched_for" size="4em" />
      <div class="text-h6 q-mt-sm">No comments loaded</div>
      <div>Paste a YouTube URL above to load mock comments</div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

interface Comment {
  author: string
  text: string
  likes: number
}

const videoUrl = ref('')
const loading = ref(false)
const comments = ref<Comment[]>([])
const isPlaying = ref(false)
const currentIndex = ref(-1)
const speed = ref(1)
const selectedVoice = ref<SpeechSynthesisVoice | null>(null)
const voiceOptions = ref<SpeechSynthesisVoice[]>([])
let utterance: SpeechSynthesisUtterance | null = null

const mockComments: Comment[] = [
  { author: 'TechEnthusiast42', text: 'This is absolutely the best explanation I have ever seen on this topic. Thank you so much for putting this together!', likes: 1243 },
  { author: 'VideoWatcher99', text: 'I have watched this video three times already and I learn something new each time. Incredible content.', likes: 892 },
  { author: 'CuriousMind_77', text: 'Can you make a follow up video going deeper into the concepts at the 5 minute mark? That part really blew my mind.', likes: 567 },
  { author: 'LearnerForLife', text: 'Just subscribed after watching this. Your teaching style is so clear and easy to follow. Keep it up!', likes: 445 },
  { author: 'SkepticalSam', text: 'I disagree with the point made at around 8 minutes. There are other perspectives worth considering here.', likes: 312 },
  { author: 'HappyViewer2024', text: 'This came up in my recommendations and I am so glad it did. Instantly one of my favorite channels now.', likes: 289 },
  { author: 'QuestionEverything', text: 'Great video but I wish you had covered the edge cases more thoroughly. Still very helpful overall though.', likes: 201 },
  { author: 'FirstTimeHere', text: 'First time on this channel and wow what a video to start with. Going to binge watch everything now.', likes: 178 },
  { author: 'ExpertOpinion', text: 'As someone who has worked in this field for 10 years I can confirm this information is accurate and well presented.', likes: 156 },
  { author: 'JustPassingBy', text: 'The production quality on this channel keeps getting better and better. Amazing work as always.', likes: 134 },
]

onMounted(() => {
  function loadVoices() {
    const voices = window.speechSynthesis.getVoices()
    voiceOptions.value = voices
    if (voices.length > 0) selectedVoice.value = voices[0]
  }
  loadVoices()
  window.speechSynthesis.addEventListener('voiceschanged', loadVoices)
})

onUnmounted(() => {
  window.speechSynthesis.cancel()
})

function loadComments() {
  if (!videoUrl.value.trim()) {
    $q.notify({ color: 'warning', message: 'Please enter a YouTube URL first', icon: 'warning' })
    return
  }
  loading.value = true
  setTimeout(() => {
    comments.value = [...mockComments].sort((a, b) => b.likes - a.likes)
    loading.value = false
    currentIndex.value = -1
    isPlaying.value = false
    $q.notify({ color: 'positive', message: '10 comments loaded!', icon: 'comment' })
  }, 800)
}

function togglePlay() {
  if (isPlaying.value) {
    window.speechSynthesis.pause()
    isPlaying.value = false
  } else {
    if (currentIndex.value === -1) {
      currentIndex.value = 0
    }
    isPlaying.value = true
    readComment(currentIndex.value)
  }
}

function readComment(index: number) {
  if (index >= comments.value.length) {
    isPlaying.value = false
    currentIndex.value = -1
    $q.notify({ color: 'info', message: 'All comments have been read!', icon: 'done_all' })
    return
  }

  window.speechSynthesis.cancel()
  const comment = comments.value[index]
  utterance = new SpeechSynthesisUtterance(`${comment.author} says: ${comment.text}`)
  utterance.rate = speed.value
  if (selectedVoice.value) utterance.voice = selectedVoice.value

  utterance.onend = () => {
    if (isPlaying.value) {
      currentIndex.value = index + 1
      readComment(currentIndex.value)
    }
  }

  window.speechSynthesis.speak(utterance)
}

function skipComment() {
  window.speechSynthesis.cancel()
  const next = currentIndex.value + 1
  currentIndex.value = next
  if (isPlaying.value) readComment(next)
}

function stopAll() {
  window.speechSynthesis.cancel()
  isPlaying.value = false
  currentIndex.value = -1
}
</script>
