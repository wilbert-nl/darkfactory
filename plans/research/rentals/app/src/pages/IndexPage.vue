<template>
  <q-page class="q-pa-md">
    <q-tabs v-model="tab" class="text-primary q-mb-md" align="left">
      <q-tab name="browse" label="Browse" icon="search" />
      <q-tab name="list" label="List Item" icon="add_box" />
      <q-tab name="myrentals" label="My Rentals" icon="history" />
    </q-tabs>

    <!-- Browse Listings -->
    <div v-if="tab === 'browse'">
      <div class="row q-col-gutter-md q-mb-md">
        <div class="col-12 col-sm-4">
          <q-input v-model="search" label="Search items..." outlined dense clearable>
            <template #prepend><q-icon name="search" /></template>
          </q-input>
        </div>
        <div class="col-12 col-sm-4">
          <q-select v-model="filterCategory" :options="['All', ...categoryOptions]" label="Category" outlined dense />
        </div>
      </div>

      <div class="row q-col-gutter-md">
        <div v-for="listing in filteredListings" :key="listing.id" class="col-12 col-sm-6 col-md-4">
          <q-card>
            <q-card-section class="q-pb-none">
              <div class="row items-start justify-between no-wrap">
                <div class="col">
                  <div class="text-subtitle1 text-weight-bold">{{ listing.title }}</div>
                  <div class="text-caption text-grey-6">by {{ listing.owner }}</div>
                </div>
                <q-badge :color="listing.available ? 'positive' : 'negative'" class="q-ml-sm">
                  {{ listing.available ? 'Available' : 'Booked' }}
                </q-badge>
              </div>
              <q-chip size="sm" color="primary" text-color="white" class="q-mt-xs">{{ listing.category }}</q-chip>
            </q-card-section>
            <q-card-section class="q-pt-sm">
              <div class="text-body2 text-grey-7 q-mb-sm" style="min-height: 48px">{{ listing.description }}</div>
              <div class="row items-center justify-between">
                <div>
                  <span class="text-h6 text-primary">${{ listing.pricePerDay }}</span>
                  <span class="text-caption text-grey-6">/day</span>
                </div>
                <div class="text-caption text-grey-6">Deposit: ${{ listing.deposit }}</div>
              </div>
            </q-card-section>
            <q-card-actions>
              <q-btn
                unelevated color="primary" label="Book Now"
                :disable="!listing.available"
                @click="openBookDialog(listing)"
                class="full-width"
              />
            </q-card-actions>
          </q-card>
        </div>
      </div>
    </div>

    <!-- List Item Form -->
    <div v-if="tab === 'list'">
      <q-card style="max-width: 640px; margin: 0 auto" class="q-pa-sm">
        <q-card-section>
          <div class="text-h6">List Your Item</div>
          <div class="text-caption text-grey-6">Earn money from items sitting idle</div>
        </q-card-section>
        <q-card-section class="q-gutter-md">
          <q-input v-model="listForm.title" label="Item Title *" outlined dense />
          <q-input v-model="listForm.description" label="Description *" type="textarea" rows="3" outlined />
          <q-select v-model="listForm.category" :options="categoryOptions" label="Category *" outlined dense />
          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-input v-model.number="listForm.pricePerDay" label="Price/Day ($) *" type="number" outlined dense />
            </div>
            <div class="col-6">
              <q-input v-model.number="listForm.deposit" label="Deposit ($) *" type="number" outlined dense />
            </div>
          </div>
          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-input v-model="listForm.availableFrom" label="Available From *" type="date" outlined dense />
            </div>
            <div class="col-6">
              <q-input v-model="listForm.availableTo" label="Available To *" type="date" outlined dense />
            </div>
          </div>
          <q-input v-model="listForm.owner" label="Your Name *" outlined dense placeholder="Display name for renters" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn unelevated color="primary" label="List Item" @click="submitListing" />
        </q-card-actions>
      </q-card>
    </div>

    <!-- My Rentals -->
    <div v-if="tab === 'myrentals'">
      <div v-if="store.bookings.length === 0" class="text-center q-pa-xl text-grey-6">
        <q-icon name="inventory_2" size="64px" />
        <div class="text-h6 q-mt-md">No bookings yet</div>
        <div>Browse listings and book something!</div>
      </div>
      <q-list v-else bordered separator class="rounded-borders">
        <q-item v-for="b in store.bookings" :key="b.id" class="q-py-md">
          <q-item-section>
            <q-item-label class="text-weight-bold">{{ b.listingTitle }}</q-item-label>
            <q-item-label caption>from {{ b.owner }}</q-item-label>
            <q-item-label caption>{{ b.fromDate }} → {{ b.toDate }} ({{ b.totalDays }} days)</q-item-label>
          </q-item-section>
          <q-item-section side>
            <div class="text-subtitle2 text-primary q-mb-xs">${{ b.totalCost.toFixed(2) }}</div>
            <q-badge :color="b.status === 'confirmed' ? 'positive' : b.status === 'returned' ? 'grey' : 'warning'">{{ b.status }}</q-badge>
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <!-- Book Dialog -->
    <q-dialog v-model="bookDialog">
      <q-card style="min-width: 380px">
        <q-card-section>
          <div class="text-h6">Book: {{ selectedListing?.title }}</div>
          <div class="text-caption text-grey-6">${{ selectedListing?.pricePerDay }}/day · Deposit: ${{ selectedListing?.deposit }}</div>
        </q-card-section>
        <q-card-section class="q-gutter-md">
          <q-input v-model="bookForm.fromDate" label="From Date *" type="date" outlined dense />
          <q-input v-model="bookForm.toDate" label="To Date *" type="date" outlined dense />
          <div v-if="bookForm.fromDate && bookForm.toDate && selectedListing" class="text-subtitle1 text-primary">
            Total: ${{ calcTotal() }} ({{ calcDays() }} days)
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn unelevated color="primary" label="Confirm Booking" @click="confirmBooking" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRentalsStore, type Listing } from 'src/stores/rentals.store'
import { useQuasar } from 'quasar'

const store = useRentalsStore()
const $q = useQuasar()
const tab = ref('browse')
const search = ref('')
const filterCategory = ref('All')

const categoryOptions = ['Power Tools', 'Electronics', 'Outdoor', 'Event', 'Vehicles', 'Sports', 'Party', 'Kitchen', 'Other']

const filteredListings = computed(() =>
  store.listings.filter(l => {
    const matchSearch = !search.value || l.title.toLowerCase().includes(search.value.toLowerCase()) || l.description.toLowerCase().includes(search.value.toLowerCase())
    const matchCat = filterCategory.value === 'All' || l.category === filterCategory.value
    return matchSearch && matchCat
  })
)

const listForm = ref({ title: '', description: '', category: '', pricePerDay: 25, deposit: 100, availableFrom: '', availableTo: '', owner: '' })
const bookDialog = ref(false)
const selectedListing = ref<Listing | null>(null)
const bookForm = ref({ fromDate: '', toDate: '' })

function openBookDialog(listing: Listing) {
  selectedListing.value = listing
  bookForm.value = { fromDate: '', toDate: '' }
  bookDialog.value = true
}

function calcDays() {
  if (!bookForm.value.fromDate || !bookForm.value.toDate) return 0
  return Math.max(1, Math.ceil((new Date(bookForm.value.toDate).getTime() - new Date(bookForm.value.fromDate).getTime()) / 86400000))
}

function calcTotal() {
  if (!selectedListing.value) return 0
  return (calcDays() * selectedListing.value.pricePerDay).toFixed(2)
}

function confirmBooking() {
  if (!bookForm.value.fromDate || !bookForm.value.toDate) {
    $q.notify({ type: 'negative', message: 'Please select dates' })
    return
  }
  store.book(selectedListing.value!.id, bookForm.value.fromDate, bookForm.value.toDate)
  bookDialog.value = false
  tab.value = 'myrentals'
  $q.notify({ type: 'positive', message: 'Booking confirmed!' })
}

function submitListing() {
  if (!listForm.value.title || !listForm.value.category || !listForm.value.owner) {
    $q.notify({ type: 'negative', message: 'Please fill in all required fields' })
    return
  }
  store.addListing({
    title: listForm.value.title,
    description: listForm.value.description,
    category: listForm.value.category,
    pricePerDay: listForm.value.pricePerDay,
    deposit: listForm.value.deposit,
    availableFrom: listForm.value.availableFrom,
    availableTo: listForm.value.availableTo,
    owner: listForm.value.owner
  })
  listForm.value = { title: '', description: '', category: '', pricePerDay: 25, deposit: 100, availableFrom: '', availableTo: '', owner: '' }
  tab.value = 'browse'
  $q.notify({ type: 'positive', message: 'Item listed successfully!' })
}
</script>
