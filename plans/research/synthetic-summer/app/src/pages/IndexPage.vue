<template>
  <!-- Light therapy overlay -->
  <div v-if="lightTherapyOn" class="light-overlay" :style="lightOverlayStyle" />

  <q-page class="q-pa-md">
    <!-- Hero -->
    <div class="text-center q-mb-lg" style="background:linear-gradient(135deg,#fff8e1,#fff3cd);border-radius:16px;padding:24px">
      <q-icon name="wb_sunny" size="3rem" color="orange" class="sun-spin" />
      <div class="text-h4 text-weight-bold text-orange q-mt-sm">Your Virtual Summer Escape</div>
      <div class="text-subtitle1 text-grey-7">Beat the winter blues with ambient sounds, light therapy, and mood tracking</div>
      <div v-if="mood.streak > 0" class="q-mt-sm">
        <q-chip color="orange" text-color="white" icon="local_fire_department">
          {{ mood.streak }}-day streak!
        </q-chip>
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <!-- Left Column -->
      <div class="col-12 col-md-6">
        <!-- Ambient Sound Player -->
        <q-card flat bordered class="q-mb-md">
          <q-card-section>
            <div class="text-h6 q-mb-md">
              <q-icon name="headphones" class="q-mr-sm text-primary" />Ambient Sounds
              <q-chip v-if="playingSound" color="positive" text-color="white" size="sm" class="q-ml-sm">LIVE</q-chip>
            </div>
            <div class="row q-gutter-sm q-mb-md">
              <q-card
                v-for="sound in sounds"
                :key="sound.id"
                class="sound-card cursor-pointer col-5"
                :class="{ 'sound-active': playingSound === sound.id }"
                flat bordered
                @click="toggleSound(sound)"
              >
                <div class="sound-bg" :style="{ background: sound.bg }">
                  <q-icon :name="playingSound === sound.id ? 'pause' : sound.icon" color="white" size="2rem" />
                </div>
                <q-card-section class="q-pa-xs text-center">
                  <div class="text-caption text-weight-bold">{{ sound.name }}</div>
                </q-card-section>
              </q-card>
            </div>

            <div v-if="playingSound" class="q-mb-sm">
              <div class="text-caption text-grey-7 q-mb-xs">Volume</div>
              <q-slider v-model="soundVolume" :min="0" :max="100" :step="5" color="orange" label />
              <!-- Animated equalizer bars -->
              <div class="eq-bars q-mt-sm">
                <div v-for="i in 20" :key="i" class="eq-bar" :style="{ height: Math.abs(Math.sin(i * 0.7 + animFrame * 0.1)) * 30 + 4 + 'px', animationDelay: i * 0.05 + 's' }" />
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Light Therapy Timer -->
        <q-card flat bordered class="q-mb-md">
          <q-card-section>
            <div class="text-h6 q-mb-md"><q-icon name="light_mode" class="q-mr-sm text-orange" />Light Therapy</div>
            <q-banner v-if="lightTherapyOn" class="bg-yellow-1 q-mb-md" rounded>
              <template #avatar><q-icon name="wb_sunny" color="orange" /></template>
              Light therapy active — {{ timerDisplay }} remaining
            </q-banner>

            <div class="q-mb-md">
              <div class="text-caption text-grey-7 q-mb-xs">Intensity</div>
              <q-slider v-model="lightIntensity" :min="10" :max="100" :step="10" color="orange" label :label-value="lightIntensity + '%'" />
            </div>

            <div class="q-mb-md">
              <div class="text-caption text-grey-7 q-mb-xs">Duration</div>
              <div class="row q-gutter-xs">
                <q-btn
                  v-for="d in [5, 10, 20, 30]"
                  :key="d"
                  :outline="timerDuration !== d"
                  :unelevated="timerDuration === d"
                  color="orange"
                  :label="d + 'min'"
                  size="sm"
                  @click="timerDuration = d"
                />
              </div>
            </div>

            <div class="row q-gutter-sm">
              <q-btn
                :color="lightTherapyOn ? 'negative' : 'orange'"
                :icon="lightTherapyOn ? 'stop' : 'play_arrow'"
                :label="lightTherapyOn ? 'Stop Session' : 'Start Session'"
                @click="toggleLightTherapy"
                unelevated
              />
              <q-chip v-if="lightTherapyOn" color="orange" text-color="white">
                {{ timerDisplay }}
              </q-chip>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Right Column -->
      <div class="col-12 col-md-6">
        <!-- Mood Tracker -->
        <q-card flat bordered class="q-mb-md">
          <q-card-section>
            <div class="text-h6 q-mb-md"><q-icon name="sentiment_satisfied_alt" class="q-mr-sm text-secondary" />Daily Mood Tracker</div>

            <div class="text-subtitle2 q-mb-sm">How are you feeling today?</div>
            <div class="row q-gutter-sm q-mb-md justify-center">
              <q-btn
                v-for="e in moodEmojis"
                :key="e.rating"
                flat
                round
                :class="{ 'mood-selected': todayRating === e.rating }"
                @click="todayRating = e.rating"
                size="xl"
              >
                <span style="font-size:2rem">{{ e.emoji }}</span>
                <q-tooltip>{{ e.label }}</q-tooltip>
              </q-btn>
            </div>

            <q-input
              v-model="moodNote"
              label="Optional note (how's the weather affecting you?)"
              outlined
              autogrow
              class="q-mb-md"
              dense
            />

            <q-btn
              color="secondary"
              icon="save"
              label="Log Mood"
              :disable="!todayRating"
              @click="logTodayMood"
              unelevated
            />

            <!-- Recent mood history -->
            <div v-if="mood.entries.length" class="q-mt-md">
              <div class="text-caption text-grey-7 q-mb-xs">Recent Mood History</div>
              <div class="row q-gutter-xs">
                <div
                  v-for="entry in mood.entries.slice(0, 14)"
                  :key="entry.date"
                  class="mood-dot"
                  :style="{ background: moodColor(entry.rating) }"
                  :title="`${entry.date}: ${moodEmojis.find(e=>e.rating===entry.rating)?.emoji}`"
                >
                  <q-tooltip>{{ entry.date }}: {{ moodEmojis.find(e => e.rating === entry.rating)?.emoji }} {{ moodEmojis.find(e => e.rating === entry.rating)?.label }}</q-tooltip>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Pomodoro Summer Mode -->
        <q-card flat bordered class="q-mb-md">
          <q-card-section>
            <div class="text-h6 q-mb-md"><q-icon name="timer" class="q-mr-sm text-accent" />Summer Mode Pomodoro</div>
            <div class="text-center q-pa-md">
              <div class="text-h2 text-weight-bold text-orange">{{ pomodoroDisplay }}</div>
              <div class="text-caption text-grey-6 q-mb-md">{{ pomodoroPhase }}</div>
              <div class="row q-gutter-sm justify-center">
                <q-btn
                  :color="pomodoroRunning ? 'negative' : 'orange'"
                  :icon="pomodoroRunning ? 'pause' : 'play_arrow'"
                  :label="pomodoroRunning ? 'Pause' : (pomodoroSeconds < pomodoroTotal ? 'Resume' : 'Start')"
                  @click="togglePomodoro"
                  unelevated
                />
                <q-btn flat icon="refresh" color="grey" @click="resetPomodoro" />
              </div>
              <q-linear-progress
                :value="1 - pomodoroSeconds / pomodoroTotal"
                color="orange"
                class="q-mt-md"
                size="8px"
                rounded
              />
            </div>
          </q-card-section>
        </q-card>

        <!-- Wellness Tips -->
        <q-card flat bordered>
          <q-card-section>
            <div class="text-h6 q-mb-md"><q-icon name="spa" class="q-mr-sm text-positive" />Today's Wellness Tips</div>
            <q-list dense>
              <q-item v-for="tip in tips" :key="tip">
                <q-item-section avatar><q-icon name="check_circle" color="positive" size="sm" /></q-item-section>
                <q-item-section><q-item-label class="text-caption">{{ tip }}</q-item-label></q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from 'vue'
import { useQuasar } from 'quasar'
import { useMoodStore } from 'src/stores/mood.store'

const $q = useQuasar()
const mood = useMoodStore()

// Sounds
const sounds = [
  { id: 'beach', name: 'Beach Waves', bg: 'linear-gradient(135deg,#74b9ff,#0984e3)', icon: 'waves' },
  { id: 'birds', name: 'Tropical Birds', bg: 'linear-gradient(135deg,#55efc4,#00b894)', icon: 'flutter_dash' },
  { id: 'rain', name: 'Warm Rain', bg: 'linear-gradient(135deg,#636e72,#b2bec3)', icon: 'water_drop' },
  { id: 'cafe', name: 'Outdoor Cafe', bg: 'linear-gradient(135deg,#fdcb6e,#e17055)', icon: 'local_cafe' },
  { id: 'jungle', name: 'Jungle', bg: 'linear-gradient(135deg,#00b894,#6c5ce7)', icon: 'forest' },
  { id: 'sunset', name: 'Sunset Breeze', bg: 'linear-gradient(135deg,#fd79a8,#fdcb6e)', icon: 'wb_twilight' },
]
const playingSound = ref('')
const soundVolume = ref(70)
const animFrame = ref(0)
let animInterval: ReturnType<typeof setInterval> | null = null

function toggleSound(sound: { id: string }) {
  if (playingSound.value === sound.id) {
    playingSound.value = ''
    if (animInterval) { clearInterval(animInterval); animInterval = null }
  } else {
    playingSound.value = sound.id
    if (!animInterval) {
      animInterval = setInterval(() => { animFrame.value++ }, 100)
    }
  }
}

// Light Therapy
const lightTherapyOn = ref(false)
const lightIntensity = ref(60)
const timerDuration = ref(20)
const timerSeconds = ref(0)
let timerInterval: ReturnType<typeof setInterval> | null = null

const timerDisplay = computed(() => {
  const remaining = timerDuration.value * 60 - timerSeconds.value
  const m = Math.floor(remaining / 60).toString().padStart(2, '0')
  const s = (remaining % 60).toString().padStart(2, '0')
  return `${m}:${s}`
})

const lightOverlayStyle = computed(() => ({
  opacity: lightIntensity.value / 200,
  background: `rgba(255, 180, 50, ${lightIntensity.value / 100})`
}))

function toggleLightTherapy() {
  if (lightTherapyOn.value) {
    lightTherapyOn.value = false
    timerSeconds.value = 0
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null }
  } else {
    lightTherapyOn.value = true
    timerSeconds.value = 0
    timerInterval = setInterval(() => {
      timerSeconds.value++
      if (timerSeconds.value >= timerDuration.value * 60) {
        lightTherapyOn.value = false
        timerSeconds.value = 0
        clearInterval(timerInterval!)
        timerInterval = null
        $q.notify({ type: 'positive', message: `Light therapy session complete! (${timerDuration.value} min)` })
      }
    }, 1000)
  }
}

// Mood
const moodEmojis = [
  { rating: 1, emoji: '😔', label: 'Very Low' },
  { rating: 2, emoji: '😕', label: 'Low' },
  { rating: 3, emoji: '😐', label: 'Neutral' },
  { rating: 4, emoji: '🙂', label: 'Good' },
  { rating: 5, emoji: '😄', label: 'Great' },
]
const todayRating = ref(0)
const moodNote = ref('')

function moodColor(rating: number) {
  const colors = ['#c10015', '#e17055', '#fdcb6e', '#55efc4', '#00b894']
  return colors[rating - 1] || '#ccc'
}

function logTodayMood() {
  mood.logMood(todayRating.value, moodNote.value)
  moodNote.value = ''
  $q.notify({ type: 'positive', message: 'Mood logged! Keep it up.' })
}

// Pomodoro
const WORK_SECS = 25 * 60
const BREAK_SECS = 5 * 60
const pomodoroRunning = ref(false)
const pomodoroSeconds = ref(WORK_SECS)
const pomodoroTotal = ref(WORK_SECS)
const pomodoroIsWork = ref(true)
let pomodoroInterval: ReturnType<typeof setInterval> | null = null

const pomodoroDisplay = computed(() => {
  const m = Math.floor(pomodoroSeconds.value / 60).toString().padStart(2, '0')
  const s = (pomodoroSeconds.value % 60).toString().padStart(2, '0')
  return `${m}:${s}`
})

const pomodoroPhase = computed(() =>
  pomodoroIsWork.value ? '☀️ Summer Focus Mode (25 min)' : '🌊 Beach Break (5 min)'
)

function togglePomodoro() {
  if (pomodoroRunning.value) {
    pomodoroRunning.value = false
    if (pomodoroInterval) { clearInterval(pomodoroInterval); pomodoroInterval = null }
  } else {
    pomodoroRunning.value = true
    pomodoroInterval = setInterval(() => {
      pomodoroSeconds.value--
      if (pomodoroSeconds.value <= 0) {
        pomodoroIsWork.value = !pomodoroIsWork.value
        pomodoroSeconds.value = pomodoroIsWork.value ? WORK_SECS : BREAK_SECS
        pomodoroTotal.value = pomodoroIsWork.value ? WORK_SECS : BREAK_SECS
        $q.notify({ type: 'info', message: pomodoroIsWork.value ? 'Back to focus! You got this.' : 'Break time! Imagine the beach...' })
      }
    }, 1000)
  }
}

function resetPomodoro() {
  pomodoroRunning.value = false
  if (pomodoroInterval) { clearInterval(pomodoroInterval); pomodoroInterval = null }
  pomodoroIsWork.value = true
  pomodoroSeconds.value = WORK_SECS
  pomodoroTotal.value = WORK_SECS
}

const tips = [
  'Open a window for natural light, even in winter',
  '10 minutes of ambient sounds can reduce cortisol by 27%',
  'Vitamin D: aim for 1000-2000 IU daily during dark months',
  'Cold-country tip: warm-toned lighting bulbs boost serotonin',
  'Schedule a "virtual holiday" — plan your next real getaway today',
  'Movement + sunlight simulation is more effective than either alone',
]

onBeforeUnmount(() => {
  if (animInterval) clearInterval(animInterval)
  if (timerInterval) clearInterval(timerInterval)
  if (pomodoroInterval) clearInterval(pomodoroInterval)
})
</script>

<style scoped>
.light-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  pointer-events: none;
  z-index: 9999;
  mix-blend-mode: multiply;
  transition: opacity 0.5s;
}
.sun-spin {
  animation: spin 8s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.sound-card {
  cursor: pointer;
  transition: all 0.2s;
  overflow: hidden;
  border-radius: 8px !important;
}
.sound-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
.sound-active { border: 2px solid var(--q-primary) !important; }
.sound-bg {
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.mood-selected {
  background: rgba(255, 143, 0, 0.15) !important;
  border-radius: 50%;
}
.mood-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.2s;
}
.mood-dot:hover { transform: scale(1.2); }
.eq-bars {
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 36px;
  padding: 4px;
  background: #f5f5f5;
  border-radius: 6px;
}
.eq-bar {
  flex: 1;
  background: var(--q-primary);
  border-radius: 2px;
  animation: eq 0.5s ease-in-out infinite alternate;
  opacity: 0.8;
}
@keyframes eq {
  from { transform: scaleY(0.5); }
  to { transform: scaleY(1); }
}
</style>
