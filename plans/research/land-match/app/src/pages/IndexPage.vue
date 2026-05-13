<template>
  <q-page class="q-pa-md">
    <q-tabs v-model="tab" class="text-primary q-mb-md" align="left">
      <q-tab name="browse" label="Browse Listings" icon="terrain" />
      <q-tab name="post" label="Post Listing" icon="add_location_alt" />
    </q-tabs>

    <!-- Browse with filters -->
    <div v-if="tab === 'browse'">
      <q-card class="q-mb-md q-pa-sm" flat bordered>
        <div class="row q-col-gutter-md items-end">
          <div class="col-12 col-sm-3">
            <q-input v-model="filters.location" label="Location" outlined dense clearable>
              <template #prepend><q-icon name="place" /></template>
            </q-input>
          </div>
          <div class="col-12 col-sm-2">
            <q-select v-model="filters.zoning" :options="['All', ...zoningOptions]" label="Zoning" outlined dense />
          </div>
          <div class="col-6 col-sm-2">
            <q-input v-model.number="filters.minArea" label="Min Area (sqm)" type="number" outlined dense />
          </div>
          <div class="col-6 col-sm-2">
            <q-input v-model.number="filters.maxArea" label="Max Area (sqm)" type="number" outlined dense />
          </div>
          <div class="col-6 col-sm-2">
            <q-input v-model.number="filters.maxPrice" label="Max Price (₱)" type="number" outlined dense />
          </div>
          <div class="col-6 col-sm-1">
            <q-btn flat color="grey" icon="clear" @click="resetFilters" label="Clear" />
          </div>
        </div>
      </q-card>

      <div class="text-caption text-grey-6 q-mb-sm">{{ filteredListings.length }} listings found</div>

      <div class="row q-col-gutter-md">
        <div v-for="l in filteredListings" :key="l.id" class="col-12 col-sm-6 col-md-4">
          <q-card @click="openDetail(l)" class="cursor-pointer listing-card">
            <!-- Map placeholder -->
            <div class="map-placeholder row items-center justify-center bg-green-1" style="height: 120px">
              <div class="text-center">
                <q-icon name="map" color="primary" size="32px" />
                <div class="text-caption text-grey-7 q-mt-xs">{{ l.lat.toFixed(2) }}°N, {{ l.lng.toFixed(2) }}°E</div>
              </div>
            </div>

            <q-card-section class="q-pb-none">
              <div class="row items-start justify-between no-wrap">
                <div class="col">
                  <div class="text-subtitle1 text-weight-bold">{{ l.name }}</div>
                  <div class="row items-center q-gutter-xs q-mt-xs">
                    <q-icon name="place" size="14px" color="grey-6" />
                    <span class="text-caption text-grey-6">{{ l.location }}</span>
                  </div>
                </div>
                <div class="q-ml-sm">
                  <q-badge v-if="l.verified" color="positive" icon="verified">Verified</q-badge>
                  <q-badge v-else color="grey-5">Unverified</q-badge>
                </div>
              </div>
              <div class="q-mt-sm row q-gutter-sm">
                <q-chip size="sm" color="primary" text-color="white" icon="landscape">{{ l.zoning }}</q-chip>
                <q-chip size="sm" color="grey-3" text-color="dark" icon="straighten">{{ formatArea(l.areaSqm) }}</q-chip>
              </div>
            </q-card-section>

            <q-card-section class="q-pt-sm">
              <div class="text-h6 text-primary">₱{{ formatPrice(l.price) }}</div>
              <div class="text-caption text-grey-6">₱{{ pricePerSqm(l) }}/sqm</div>
              <div class="text-body2 text-grey-7 q-mt-xs ellipsis-2-lines">{{ l.description }}</div>
            </q-card-section>

            <q-card-actions class="q-pt-none">
              <q-btn flat icon="bookmark" :color="store.isSaved(l.id) ? 'primary' : 'grey'" @click.stop="store.toggleSave(l.id)" />
              <q-btn flat color="primary" label="View Details" @click.stop="openDetail(l)" class="q-ml-auto" />
            </q-card-actions>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Post Listing -->
    <div v-if="tab === 'post'">
      <q-card style="max-width: 680px; margin: 0 auto" class="q-pa-sm">
        <q-card-section>
          <div class="text-h6">Post a Land Listing</div>
          <div class="text-caption text-grey-6">Connect with serious buyers</div>
        </q-card-section>
        <q-card-section class="q-gutter-md">
          <q-input v-model="postForm.name" label="Parcel Name / Title *" outlined dense />
          <q-input v-model="postForm.location" label="Location (City, Province, Country) *" outlined dense />
          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-input v-model.number="postForm.areaSqm" label="Area (sqm) *" type="number" outlined dense />
            </div>
            <div class="col-6">
              <q-input v-model.number="postForm.price" label="Asking Price (₱) *" type="number" outlined dense />
            </div>
          </div>
          <q-select v-model="postForm.zoning" :options="zoningOptions" label="Zoning Type *" outlined dense />
          <q-input v-model="postForm.description" label="Description *" type="textarea" rows="3" outlined />
          <div class="row q-col-gutter-md">
            <div class="col-6">
              <q-input v-model.number="postForm.lat" label="Latitude" type="number" outlined dense placeholder="e.g. 14.5995" />
            </div>
            <div class="col-6">
              <q-input v-model.number="postForm.lng" label="Longitude" type="number" outlined dense placeholder="e.g. 120.9842" />
            </div>
          </div>
          <q-select
            v-model="postForm.documents"
            :options="documentOptions"
            label="Available Documents"
            outlined dense multiple use-chips
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn unelevated color="primary" label="Post Listing" icon="publish" @click="submitListing" />
        </q-card-actions>
      </q-card>
    </div>

    <!-- Detail Dialog -->
    <q-dialog v-model="detailDialog" maximized>
      <q-card v-if="selectedListing">
        <q-bar class="bg-primary text-white">
          <span>{{ selectedListing.name }}</span>
          <q-space />
          <q-btn flat round icon="close" v-close-popup />
        </q-bar>
        <q-card-section>
          <div class="row q-col-gutter-lg">
            <div class="col-12 col-md-6">
              <!-- Map placeholder -->
              <div class="map-placeholder row items-center justify-center bg-green-1 rounded-borders" style="height: 300px">
                <div class="text-center">
                  <q-icon name="map" color="primary" size="64px" />
                  <div class="text-subtitle1 text-primary q-mt-sm">Map View</div>
                  <div class="text-caption text-grey-7">{{ selectedListing.lat }}, {{ selectedListing.lng }}</div>
                  <div class="text-caption text-grey-6 q-mt-xs">(Interactive map available in production)</div>
                </div>
              </div>
            </div>
            <div class="col-12 col-md-6">
              <div class="text-h5 q-mb-xs">{{ selectedListing.name }}</div>
              <div class="row items-center q-gutter-sm q-mb-md">
                <q-icon name="place" color="grey-6" />
                <span class="text-subtitle2 text-grey-7">{{ selectedListing.location }}</span>
                <q-badge v-if="selectedListing.verified" color="positive" icon="verified">Verified</q-badge>
              </div>

              <div class="row q-col-gutter-md q-mb-md">
                <div class="col-6">
                  <div class="text-caption text-grey-6">Area</div>
                  <div class="text-subtitle1 text-weight-bold">{{ formatArea(selectedListing.areaSqm) }}</div>
                </div>
                <div class="col-6">
                  <div class="text-caption text-grey-6">Asking Price</div>
                  <div class="text-subtitle1 text-weight-bold text-primary">₱{{ formatPrice(selectedListing.price) }}</div>
                </div>
                <div class="col-6">
                  <div class="text-caption text-grey-6">Price/sqm</div>
                  <div class="text-subtitle1">₱{{ pricePerSqm(selectedListing) }}</div>
                </div>
                <div class="col-6">
                  <div class="text-caption text-grey-6">Zoning</div>
                  <q-chip size="sm" color="primary" text-color="white">{{ selectedListing.zoning }}</q-chip>
                </div>
              </div>

              <div class="text-subtitle2 q-mb-xs">Description</div>
              <div class="text-body2 text-grey-7 q-mb-md">{{ selectedListing.description }}</div>

              <div class="text-subtitle2 q-mb-xs">Document Checklist</div>
              <q-list dense>
                <q-item v-for="doc in allDocuments" :key="doc" class="q-pa-none q-mb-xs">
                  <q-item-section avatar>
                    <q-icon
                      :name="selectedListing.documents.includes(doc) ? 'check_circle' : 'cancel'"
                      :color="selectedListing.documents.includes(doc) ? 'positive' : 'negative'"
                      size="20px"
                    />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label :class="selectedListing.documents.includes(doc) ? '' : 'text-grey-5'">{{ doc }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat color="grey" label="Close" v-close-popup />
          <q-btn unelevated color="primary" label="Contact Seller" icon="message" @click="contactSeller" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useLandStore, type LandListing } from 'src/stores/land.store'
import { useQuasar } from 'quasar'

const store = useLandStore()
const $q = useQuasar()
const tab = ref('browse')

const zoningOptions = ['Agricultural', 'Residential', 'Commercial', 'Industrial', 'Mixed-use', 'Forest Land', 'Tourism']
const documentOptions = ['Title Deed', 'Tax Declaration', 'Survey Plan', 'Environmental Clearance', 'Environmental Compliance', 'Boundary Map', 'DENR Permit']
const allDocuments = ['Title Deed', 'Tax Declaration', 'Survey Plan', 'Environmental Clearance', 'Boundary Map']

const filters = ref({ location: '', zoning: 'All', minArea: null as number | null, maxArea: null as number | null, maxPrice: null as number | null })

const filteredListings = computed(() =>
  store.listings.filter(l => {
    if (filters.value.location && !l.location.toLowerCase().includes(filters.value.location.toLowerCase())) return false
    if (filters.value.zoning !== 'All' && l.zoning !== filters.value.zoning) return false
    if (filters.value.minArea && l.areaSqm < filters.value.minArea) return false
    if (filters.value.maxArea && l.areaSqm > filters.value.maxArea) return false
    if (filters.value.maxPrice && l.price > filters.value.maxPrice) return false
    return true
  })
)

function resetFilters() {
  filters.value = { location: '', zoning: 'All', minArea: null, maxArea: null, maxPrice: null }
}

const detailDialog = ref(false)
const selectedListing = ref<LandListing | null>(null)

function openDetail(l: LandListing) {
  selectedListing.value = l
  detailDialog.value = true
}

function formatArea(sqm: number) {
  if (sqm >= 10000) return `${(sqm / 10000).toFixed(2)} ha`
  return `${sqm.toLocaleString()} sqm`
}

function formatPrice(p: number) {
  if (p >= 1000000) return `${(p / 1000000).toFixed(2)}M`
  return p.toLocaleString()
}

function pricePerSqm(l: LandListing) {
  return Math.round(l.price / l.areaSqm).toLocaleString()
}

function contactSeller() {
  $q.notify({ type: 'positive', message: 'Message sent to seller! (Demo mode)' })
  detailDialog.value = false
}

const postForm = ref({
  name: '', location: '', areaSqm: 0, price: 0, zoning: '', description: '', lat: 0, lng: 0, documents: [] as string[]
})

function submitListing() {
  if (!postForm.value.name || !postForm.value.location || !postForm.value.zoning || !postForm.value.price || !postForm.value.areaSqm) {
    $q.notify({ type: 'negative', message: 'Please fill in all required fields' })
    return
  }
  if (postForm.value.price < 1) {
    $q.notify({ type: 'negative', message: 'Price must be greater than 0' })
    return
  }
  store.addListing({
    name: postForm.value.name,
    location: postForm.value.location,
    areaSqm: postForm.value.areaSqm,
    price: postForm.value.price,
    zoning: postForm.value.zoning,
    description: postForm.value.description,
    documents: postForm.value.documents,
    lat: postForm.value.lat || 14.5995,
    lng: postForm.value.lng || 120.9842
  })
  postForm.value = { name: '', location: '', areaSqm: 0, price: 0, zoning: '', description: '', lat: 0, lng: 0, documents: [] }
  tab.value = 'browse'
  $q.notify({ type: 'positive', message: 'Listing posted successfully!' })
}
</script>

<style scoped>
.listing-card:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  transform: translateY(-2px);
  transition: all 0.2s ease;
}
.ellipsis-2-lines {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
