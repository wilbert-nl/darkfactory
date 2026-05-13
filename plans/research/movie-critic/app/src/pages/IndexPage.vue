<template>
  <q-page class="q-pa-md">
    <!-- Role Switch -->
    <div class="row items-center q-mb-md">
      <q-btn-toggle
        v-model="store.role"
        :options="[{label:'Filmmaker',value:'filmmaker'},{label:'Critic',value:'critic'}]"
        color="primary"
        text-color="primary"
        toggle-color="primary"
        @update:model-value="store.setRole($event)"
      />
    </div>

    <!-- FILMMAKER VIEW -->
    <div v-if="store.role === 'filmmaker'">
      <div class="text-h5 q-mb-md">Submit Film for Review</div>

      <!-- Submit Form -->
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="text-subtitle1 q-mb-sm">New Film Submission</div>
          <div class="row q-gutter-sm">
            <q-input v-model="film.title" label="Film Title" class="col-12 col-md-5" dense />
            <q-select v-model="film.genre" :options="genres" label="Genre" class="col-12 col-md-3" dense />
            <q-input v-model.number="film.budget" label="Budget Offered ($)" type="number" class="col-12 col-md-2" dense />
          </div>
          <q-input v-model="film.synopsis" label="Synopsis" type="textarea" rows="2" dense class="q-mt-sm" />
          <div class="row q-gutter-sm q-mt-sm">
            <q-input v-model="film.screenerLink" label="Screener Link (Vimeo/etc)" class="col-12 col-md-6" dense />
            <q-select v-model="film.reviewType" :options="reviewTypes" label="Review Type" class="col-12 col-md-4" dense />
          </div>
        </q-card-section>
        <q-card-actions>
          <q-btn color="primary" label="Submit Film" @click="submitFilm" :disable="!film.title || !film.genre" />
        </q-card-actions>
      </q-card>

      <!-- My Submissions -->
      <div class="text-h6 q-mb-sm">My Submissions</div>
      <div v-if="!myFilms.length" class="text-grey">No submissions yet.</div>
      <q-list bordered separator>
        <q-item v-for="f in myFilms" :key="f.id">
          <q-item-section avatar>
            <q-icon name="movie" color="primary" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ f.title }}</q-item-label>
            <q-item-label caption>{{ f.genre }} | ${{ f.budget }} offered | {{ f.reviewType }}</q-item-label>
            <q-item-label caption>{{ f.synopsis.substring(0, 80) }}...</q-item-label>
            <div v-if="store.getReviewForFilm(f.id)" class="q-mt-xs">
              <q-badge color="positive">Reviewed</q-badge>
              <div class="text-caption q-mt-xs">Score: {{ store.getReviewForFilm(f.id)!.score }}/10 — {{ store.getReviewForFilm(f.id)!.critique.substring(0, 100) }}...</div>
            </div>
          </q-item-section>
          <q-item-section side>
            <q-badge :color="statusColor(f.status)">{{ f.status }}</q-badge>
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <!-- CRITIC VIEW -->
    <div v-else>
      <!-- Earnings -->
      <div class="row q-mb-md">
        <q-card class="bg-positive text-white q-pa-sm col-12 col-md-3">
          <div class="text-caption">Total Earnings</div>
          <div class="text-h5">${{ store.criticEarnings.toFixed(2) }}</div>
        </q-card>
      </div>

      <q-tabs v-model="criticTab" class="q-mb-md" indicator-color="primary">
        <q-tab name="browse" label="Browse Submissions" />
        <q-tab name="myreviews" label="My Reviews" />
      </q-tabs>

      <!-- Browse Submissions -->
      <div v-if="criticTab === 'browse'">
        <div v-if="!openFilms.length" class="text-grey">No open submissions.</div>
        <div class="row q-gutter-md">
          <q-card v-for="f in openFilms" :key="f.id" class="col-12 col-md-5">
            <q-card-section>
              <div class="text-h6">{{ f.title }}</div>
              <div class="text-caption text-grey">{{ f.genre }} | {{ f.reviewType }}</div>
              <div class="q-mt-xs">{{ f.synopsis }}</div>
              <div class="q-mt-sm"><q-badge color="primary">${{ f.budget }} offered</q-badge></div>
              <div class="text-caption q-mt-xs">Screener: <a :href="f.screenerLink" target="_blank">{{ f.screenerLink }}</a></div>
            </q-card-section>
            <q-card-actions v-if="f.status === 'open'">
              <q-btn color="primary" label="Accept Review" @click="store.acceptFilm(f.id)" />
            </q-card-actions>
            <q-card-section v-else-if="f.status === 'accepted' && !store.getReviewForFilm(f.id)">
              <div class="text-subtitle2 q-mb-sm">Submit Review</div>
              <q-input v-model.number="reviewDraft[f.id + '_score']" label="Score (1-10)" type="number" min="1" max="10" dense class="q-mb-sm" />
              <q-input v-model="reviewDraft[f.id + '_critique']" label="Written Critique" type="textarea" rows="3" dense />
              <q-btn class="q-mt-sm" color="positive" label="Submit Review" @click="submitReview(f)" />
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- My Reviews -->
      <div v-if="criticTab === 'myreviews'">
        <div v-if="!store.reviews.length" class="text-grey">No reviews submitted yet.</div>
        <q-list bordered separator>
          <q-item v-for="r in store.reviews" :key="r.id">
            <q-item-section>
              <q-item-label>{{ filmTitle(r.filmId) }}</q-item-label>
              <q-item-label caption>Score: {{ r.score }}/10</q-item-label>
              <q-item-label caption>{{ r.critique }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <div class="text-caption text-grey">{{ new Date(r.submittedAt).toLocaleDateString() }}</div>
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useMarketplaceStore } from 'src/stores/marketplace'
import type { Film } from 'src/stores/marketplace'
import { useQuasar } from 'quasar'

const store = useMarketplaceStore()
const $q = useQuasar()
const criticTab = ref('browse')

const genres = ['Drama', 'Comedy', 'Horror', 'Documentary', 'Thriller', 'Sci-Fi', 'Action', 'Romance', 'Animation']
const reviewTypes = ['Full Review', 'Quick Take', 'Festival Report', 'Distribution Report']

const film = reactive({
  title: '',
  genre: '',
  synopsis: '',
  screenerLink: '',
  reviewType: 'Full Review',
  budget: 150
})

const reviewDraft = reactive<Record<string, any>>({})

const myFilms = computed(() => store.films.filter(f => f.filmakerId === 'filmmaker-1'))
const openFilms = computed(() => store.films.filter(f => f.status !== 'reviewed'))

function statusColor(status: string) {
  return status === 'open' ? 'primary' : status === 'accepted' ? 'warning' : 'positive'
}

function filmTitle(filmId: string) {
  return store.films.find(f => f.id === filmId)?.title || filmId
}

function submitFilm() {
  if (!film.title || !film.genre) return
  store.submitFilm({ ...film })
  Object.assign(film, { title: '', genre: '', synopsis: '', screenerLink: '', reviewType: 'Full Review', budget: 150 })
  $q.notify({ color: 'positive', message: 'Film submitted successfully!', icon: 'check' })
}

function submitReview(f: Film) {
  const score = parseInt(reviewDraft[f.id + '_score']) || 5
  const critique = reviewDraft[f.id + '_critique'] || ''
  if (!critique.trim()) {
    $q.notify({ color: 'negative', message: 'Please write a critique before submitting.', icon: 'warning' })
    return
  }
  store.submitReview(f.id, score, critique)
  delete reviewDraft[f.id + '_score']
  delete reviewDraft[f.id + '_critique']
  $q.notify({ color: 'positive', message: `Review submitted! You earned $${(f.budget * 0.75).toFixed(2)}`, icon: 'check' })
}
</script>
