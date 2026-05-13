<template>
  <q-page class="q-pa-md">
    <!-- Onboarding questionnaire -->
    <div v-if="!store.completed">
      <q-card class="q-mb-md" style="max-width: 640px; margin: 0 auto">
        <q-card-section>
          <div class="text-h6">Compatibility Questionnaire</div>
          <div class="text-caption text-grey-6">Question {{ store.currentQ + 1 }} of {{ questions.length }}</div>
          <q-linear-progress :value="(store.currentQ + 1) / questions.length" color="primary" class="q-mt-sm" />
        </q-card-section>
        <q-card-section>
          <div class="text-subtitle1 text-weight-bold q-mb-md">{{ questions[store.currentQ].text }}</div>
          <q-option-group
            v-model="currentAnswer"
            :options="questions[store.currentQ].options"
            color="primary"
            type="radio"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Back" :disable="store.currentQ === 0" @click="store.prevQ" />
          <q-btn unelevated color="primary" :label="store.currentQ === questions.length - 1 ? 'Finish' : 'Next'" @click="nextQ" />
        </q-card-actions>
      </q-card>
    </div>

    <!-- Results -->
    <div v-else>
      <q-tabs v-model="tab" class="text-primary q-mb-md" align="left">
        <q-tab name="score" label="My Score" icon="favorite" />
        <q-tab name="matches" label="Browse Matches" icon="people" />
        <q-tab name="history" label="Match History" icon="history" />
      </q-tabs>

      <!-- Score breakdown -->
      <div v-if="tab === 'score'">
        <q-card style="max-width: 640px; margin: 0 auto">
          <q-card-section class="text-center">
            <div class="text-h5 q-mb-sm">Your Compatibility Profile</div>
            <q-circular-progress
              :value="store.overallScore"
              size="100px"
              :thickness="0.12"
              color="primary"
              track-color="grey-3"
              class="q-ma-md"
            >
              <div class="text-h5 text-primary">{{ store.overallScore }}%</div>
            </q-circular-progress>
          </q-card-section>
          <q-card-section>
            <div v-for="cat in categories" :key="cat.key" class="q-mb-md">
              <div class="row justify-between q-mb-xs">
                <span class="text-subtitle2">{{ cat.label }}</span>
                <span class="text-subtitle2 text-primary">{{ store.scores[cat.key] }}%</span>
              </div>
              <q-linear-progress :value="store.scores[cat.key] / 100" :color="cat.color" rounded size="12px" />
            </div>
          </q-card-section>
          <q-card-actions align="center">
            <q-btn flat color="negative" label="Retake Questionnaire" @click="store.reset" />
          </q-card-actions>
        </q-card>
      </div>

      <!-- Browse Matches -->
      <div v-if="tab === 'matches'">
        <div class="row q-col-gutter-md">
          <div v-for="match in mockMatches" :key="match.id" class="col-12 col-sm-6 col-md-4">
            <q-card>
              <q-card-section class="row items-center no-wrap">
                <q-avatar :color="match.color" text-color="white" size="56px" class="q-mr-md">{{ match.initials }}</q-avatar>
                <div class="col">
                  <div class="text-h6">{{ match.name }}</div>
                  <div class="text-caption text-grey-6">{{ match.age }} · {{ match.location }}</div>
                </div>
                <q-badge color="primary" class="text-subtitle2" style="font-size: 14px">{{ match.compat }}%</q-badge>
              </q-card-section>
              <q-card-section class="q-pt-none">
                <div class="text-body2 text-grey-7">{{ match.bio }}</div>
                <div class="q-mt-sm">
                  <q-chip v-for="tag in match.tags" :key="tag" size="sm" color="grey-2" text-color="dark">{{ tag }}</q-chip>
                </div>
              </q-card-section>
              <q-card-actions>
                <q-btn flat icon="close" color="negative" />
                <q-btn flat icon="favorite" color="primary" @click="addToHistory(match)" />
                <q-btn unelevated color="primary" label="Connect" class="q-ml-auto" @click="addToHistory(match)" />
              </q-card-actions>
            </q-card>
          </div>
        </div>
      </div>

      <!-- Match History -->
      <div v-if="tab === 'history'">
        <div v-if="store.matchHistory.length === 0" class="text-center q-pa-xl text-grey-6">
          <q-icon name="favorite_border" size="64px" />
          <div class="text-h6 q-mt-md">No matches yet</div>
          <div>Browse profiles and connect!</div>
        </div>
        <q-list v-else bordered separator class="rounded-borders">
          <q-item v-for="m in store.matchHistory" :key="m.id" class="q-py-md">
            <q-item-section avatar>
              <q-avatar :color="m.color" text-color="white">{{ m.initials }}</q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-bold">{{ m.name }}</q-item-label>
              <q-item-label caption>{{ m.age }} · {{ m.location }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-badge color="primary">{{ m.compat }}% match</q-badge>
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useDateStore } from 'src/stores/date.store'
import { useQuasar } from 'quasar'

const store = useDateStore()
const $q = useQuasar()
const tab = ref('score')
const currentAnswer = ref<string>('')

const questions = [
  { text: 'What matters most to you in a relationship?', options: [{ label: 'Emotional security', value: 'a' }, { label: 'Intellectual stimulation', value: 'b' }, { label: 'Adventure & fun', value: 'c' }, { label: 'Shared values', value: 'd' }] },
  { text: 'How do you prefer to spend weekends?', options: [{ label: 'Outdoors / active', value: 'a' }, { label: 'Cozy at home', value: 'b' }, { label: 'Social gatherings', value: 'c' }, { label: 'Pursuing hobbies', value: 'd' }] },
  { text: 'What is your attachment style?', options: [{ label: 'Secure', value: 'a' }, { label: 'Anxious', value: 'b' }, { label: 'Avoidant', value: 'c' }, { label: 'Fearful-avoidant', value: 'd' }] },
  { text: 'How important is physical affection?', options: [{ label: 'Very important', value: 'a' }, { label: 'Somewhat important', value: 'b' }, { label: 'Not a priority', value: 'c' }, { label: 'It depends', value: 'd' }] },
  { text: 'How do you handle conflict?', options: [{ label: 'Talk it out immediately', value: 'a' }, { label: 'Need time to process first', value: 'b' }, { label: 'Avoid conflict', value: 'c' }, { label: 'Seek compromise quickly', value: 'd' }] },
  { text: 'What is your love language?', options: [{ label: 'Words of affirmation', value: 'a' }, { label: 'Quality time', value: 'b' }, { label: 'Acts of service', value: 'c' }, { label: 'Physical touch', value: 'd' }] },
  { text: 'Career and ambition in a partner?', options: [{ label: 'Very driven/ambitious', value: 'a' }, { label: 'Work-life balance focused', value: 'b' }, { label: "Doesn't matter", value: 'c' }, { label: 'Creative/entrepreneurial', value: 'd' }] },
  { text: 'Family and kids — your stance?', options: [{ label: 'Want kids', value: 'a' }, { label: 'Open to kids', value: 'b' }, { label: "Don't want kids", value: 'c' }, { label: 'Already have kids', value: 'd' }] },
  { text: 'How do you feel about religion/spirituality?', options: [{ label: 'Very important to me', value: 'a' }, { label: 'Somewhat important', value: 'b' }, { label: 'Not religious but spiritual', value: 'c' }, { label: 'Secular / not relevant', value: 'd' }] },
  { text: 'Ideal living situation long-term?', options: [{ label: 'City apartment', value: 'a' }, { label: 'Suburban house', value: 'b' }, { label: 'Rural/countryside', value: 'c' }, { label: 'Traveling/nomadic', value: 'd' }] },
]

const categories = [
  { key: 'values', label: 'Shared Values', color: 'primary' },
  { key: 'lifestyle', label: 'Lifestyle', color: 'secondary' },
  { key: 'communication', label: 'Communication', color: 'positive' },
  { key: 'intimacy', label: 'Intimacy', color: 'accent' },
]

const mockMatches = [
  { id: 1, name: 'Sarah K.', initials: 'SK', age: 29, location: 'New York', compat: 91, color: 'pink-6', bio: 'Yoga instructor who loves hiking, reading, and cooking plant-based meals.', tags: ['Yoga', 'Hiking', 'Cooking'] },
  { id: 2, name: 'Emma L.', initials: 'EL', age: 31, location: 'Austin', compat: 84, color: 'purple-6', bio: 'Software engineer by day, amateur photographer on weekends.', tags: ['Tech', 'Photography', 'Travel'] },
  { id: 3, name: 'Aisha M.', initials: 'AM', age: 27, location: 'Chicago', compat: 78, color: 'deep-orange-6', bio: 'Teacher passionate about education equity, poetry, and jazz music.', tags: ['Teaching', 'Poetry', 'Jazz'] },
  { id: 4, name: 'Lena R.', initials: 'LR', age: 33, location: 'Seattle', compat: 72, color: 'teal-6', bio: 'Marine biologist and ocean conservationist. Avid scuba diver.', tags: ['Science', 'Scuba', 'Conservation'] },
  { id: 5, name: 'Mia T.', initials: 'MT', age: 28, location: 'Miami', compat: 68, color: 'indigo-6', bio: 'Entrepreneur running a sustainable fashion brand. Fitness enthusiast.', tags: ['Fashion', 'Fitness', 'Business'] },
  { id: 6, name: 'Clara B.', initials: 'CB', age: 30, location: 'Boston', compat: 65, color: 'green-6', bio: 'Doctor specializing in pediatrics. Board game fanatic and avid reader.', tags: ['Medicine', 'Board Games', 'Books'] },
]

watch(() => store.currentQ, () => { currentAnswer.value = store.answers[store.currentQ] || '' })

function nextQ() {
  if (!currentAnswer.value) {
    $q.notify({ type: 'warning', message: 'Please select an answer' })
    return
  }
  store.setAnswer(store.currentQ, currentAnswer.value)
  if (store.currentQ === questions.length - 1) {
    store.finishQuestionnaire()
  } else {
    store.nextQ()
    currentAnswer.value = store.answers[store.currentQ] || ''
  }
}

function addToHistory(match: typeof mockMatches[0]) {
  store.addMatch(match)
  $q.notify({ type: 'positive', message: `Connected with ${match.name}!` })
}
</script>
