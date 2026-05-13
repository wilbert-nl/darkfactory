<template>
  <q-page class="q-pa-md">
    <q-tabs v-model="tab" class="text-primary q-mb-md" align="left">
      <q-tab name="post" label="Post Itinerary" icon="add_location" />
      <q-tab name="my" label="My Itineraries" icon="luggage" />
    </q-tabs>

    <!-- Post Itinerary -->
    <div v-if="tab === 'post'">
      <q-card style="max-width: 680px; margin: 0 auto" class="q-pa-sm">
        <q-card-section>
          <div class="text-h6">Post Your Dream Trip</div>
          <div class="text-caption text-grey-6">Travel agencies will compete to offer you the best deal</div>
        </q-card-section>
        <q-card-section class="q-gutter-md">
          <q-input v-model="form.destination" label="Destination *" outlined dense placeholder="e.g. Bali, Japan, Morocco" />
          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-input v-model="form.startDate" label="Start Date *" outlined dense type="date" />
            </div>
            <div class="col-6">
              <q-input v-model="form.endDate" label="End Date *" outlined dense type="date" />
            </div>
          </div>
          <q-input v-model.number="form.groupSize" label="Group Size *" outlined dense type="number" />
          <q-select v-model="form.budget" :options="budgetOptions" label="Budget per Person *" outlined dense />
          <q-select
            v-model="form.preferences"
            :options="preferenceOptions"
            label="Travel Style / Preferences"
            outlined dense
            multiple
            use-chips
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn unelevated color="primary" label="Post Itinerary" icon="send" @click="postItinerary" />
        </q-card-actions>
      </q-card>
    </div>

    <!-- My Itineraries -->
    <div v-if="tab === 'my'">
      <div v-if="store.itineraries.length === 0" class="text-center q-pa-xl text-grey-6">
        <q-icon name="travel_explore" size="64px" />
        <div class="text-h6 q-mt-md">No itineraries yet</div>
        <div>Post your dream trip and get competing offers!</div>
        <q-btn class="q-mt-md" color="primary" label="Post a Trip" @click="tab = 'post'" />
      </div>

      <div v-for="it in store.itineraries" :key="it.id" class="q-mb-lg">
        <q-card>
          <q-card-section class="row items-center no-wrap">
            <div class="col">
              <div class="row items-center q-gutter-sm">
                <q-icon name="flight_takeoff" color="primary" />
                <span class="text-h6">{{ it.destination }}</span>
                <q-badge :color="it.status === 'accepted' ? 'positive' : 'warning'">{{ it.status }}</q-badge>
              </div>
              <div class="text-caption text-grey-6">
                {{ it.startDate }} → {{ it.endDate }} · {{ it.groupSize }} people · {{ it.budget }}
              </div>
              <div class="q-mt-xs">
                <q-chip v-for="p in it.preferences" :key="p" size="sm" color="secondary" text-color="white">{{ p }}</q-chip>
              </div>
            </div>
          </q-card-section>

          <!-- Bids -->
          <q-separator />
          <q-card-section>
            <div class="text-subtitle2 q-mb-sm">Agency Bids</div>
            <div class="row q-col-gutter-md">
              <div v-for="bid in store.getBidsForItinerary(it.id).slice(0, 3)" :key="bid.id" class="col-12 col-sm-4">
                <q-card flat bordered :class="it.acceptedBidId === bid.id ? 'bg-positive-1' : ''">
                  <q-card-section class="q-pb-none">
                    <div class="row items-center justify-between">
                      <span class="text-weight-bold text-body2">{{ bid.agency }}</span>
                      <div class="row items-center q-gutter-xs">
                        <q-icon name="star" color="warning" size="14px" />
                        <span class="text-caption">{{ bid.rating }}</span>
                      </div>
                    </div>
                    <div class="text-primary text-subtitle1 text-weight-bold">{{ bid.price }}</div>
                    <div class="text-caption text-grey-6">{{ bid.duration }}</div>
                  </q-card-section>
                  <q-card-section class="q-pt-xs">
                    <div class="text-body2 text-grey-7 q-mb-xs">{{ bid.description }}</div>
                    <div>
                      <q-chip v-for="inc in bid.includes" :key="inc" size="xs" color="info" text-color="white">{{ inc }}</q-chip>
                    </div>
                  </q-card-section>
                  <q-card-actions>
                    <q-btn
                      v-if="it.status !== 'accepted'"
                      unelevated color="primary" size="sm" label="Accept Bid"
                      @click="acceptBid(it.id, bid.id)"
                    />
                    <q-chip v-else-if="it.acceptedBidId === bid.id" color="positive" text-color="white" icon="check">Accepted</q-chip>
                  </q-card-actions>
                </q-card>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTravelStore } from 'src/stores/travel.store'
import { useQuasar } from 'quasar'

const store = useTravelStore()
const $q = useQuasar()
const tab = ref('post')

const budgetOptions = ['Under $500', '$500-$1,000', '$1,000-$2,000', '$2,000-$5,000', '$5,000-$10,000', '$10,000+']
const preferenceOptions = ['Adventure', 'Luxury', 'Budget', 'Family-friendly', 'Honeymoon', 'Cultural', 'Wellness/Spa', 'Beach', 'Mountain', 'Food & Wine', 'Pilgrimage', 'Halal Tourism', 'Accessible Travel']

const form = ref({
  destination: '',
  startDate: '',
  endDate: '',
  groupSize: 2,
  budget: '',
  preferences: [] as string[]
})

function postItinerary() {
  if (!form.value.destination || !form.value.startDate || !form.value.endDate || !form.value.budget) {
    $q.notify({ type: 'negative', message: 'Please fill in all required fields' })
    return
  }
  store.addItinerary({
    destination: form.value.destination,
    startDate: form.value.startDate,
    endDate: form.value.endDate,
    groupSize: form.value.groupSize,
    budget: form.value.budget,
    preferences: form.value.preferences
  })
  form.value = { destination: '', startDate: '', endDate: '', groupSize: 2, budget: '', preferences: [] }
  tab.value = 'my'
  $q.notify({ type: 'positive', message: 'Itinerary posted! Agencies are now reviewing your request.' })
}

function acceptBid(itineraryId: string, bidId: string) {
  store.acceptBid(itineraryId, bidId)
  $q.notify({ type: 'positive', message: 'Bid accepted! The agency will contact you shortly.' })
}
</script>
