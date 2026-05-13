<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
      <!-- Left: Post Item -->
      <div class="col-12 col-md-4">
        <q-card>
          <q-card-section class="bg-orange-8 text-white">
            <div class="text-h6">Post an Item</div>
          </q-card-section>
          <q-card-section class="q-gutter-md">
            <q-input v-model="newListing.title" label="Title *" outlined />
            <q-input v-model="newListing.description" label="Description *" outlined type="textarea" rows="2" />
            <q-input v-model="newListing.price" label="Price ($)" outlined type="number" prefix="$" />
            <q-select v-model="newListing.category" :options="categories" label="Category" outlined />

            <!-- Photo upload placeholder + AI grader -->
            <div class="q-pa-md bg-grey-2 rounded-borders text-center">
              <q-icon name="add_photo_alternate" size="40px" color="grey-6" />
              <div class="text-caption text-grey q-mt-xs">Photo upload (simulated)</div>
              <div class="row q-gutter-xs justify-center q-mt-sm">
                <div
                  v-for="(color, i) in photoColors"
                  :key="i"
                  :style="{ background: color, width: '60px', height: '60px', borderRadius: '4px', cursor: 'pointer' }"
                  @click="selectPhoto(i)"
                  class="relative-position"
                >
                  <q-badge
                    v-if="selectedPhoto === i"
                    color="positive"
                    floating
                    rounded
                  >
                    <q-icon name="check" size="xs" />
                  </q-badge>
                </div>
              </div>
              <div class="text-caption text-grey q-mt-xs">Click a color swatch to simulate a photo</div>
            </div>

            <!-- AI Condition Grader -->
            <div>
              <q-btn
                color="accent"
                icon="psychology"
                label="Grade Condition with AI"
                class="full-width"
                @click="gradeCondition"
                :loading="grading"
                :disable="selectedPhoto === null"
              />
              <q-banner v-if="gradeResult" class="q-mt-sm rounded-borders" :class="gradeColors[gradeResult.grade]">
                <template #avatar>
                  <q-icon :name="gradeIcons[gradeResult.grade]" />
                </template>
                <div class="text-bold">Condition: {{ gradeResult.grade }}</div>
                <div class="text-caption">{{ gradeResult.reasoning }}</div>
                <div class="text-caption q-mt-xs">Score: {{ gradeResult.score }}/100</div>
              </q-banner>
            </div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn color="orange-8" icon="add_circle" label="Post Listing" @click="postListing" :disable="!newListing.title || !newListing.price" />
          </q-card-actions>
        </q-card>
      </div>

      <!-- Right: Browse Listings -->
      <div class="col-12 col-md-8">
        <div class="row items-center q-mb-md">
          <div class="text-h6">Browse Listings</div>
          <q-space />
          <q-input v-model="searchQuery" label="Search..." outlined dense style="max-width: 200px" clearable>
            <template #prepend><q-icon name="search" /></template>
          </q-input>
          <q-select v-model="filterCategory" :options="['All', ...categories]" label="Category" outlined dense class="q-ml-sm" style="max-width: 150px" />
        </div>

        <div v-if="filteredListings.length === 0" class="text-center q-pa-xl text-grey">
          <q-icon name="storefront" size="60px" color="orange-3" />
          <div class="q-mt-md">No listings yet. Post the first one!</div>
        </div>

        <div class="row q-col-gutter-md">
          <div v-for="listing in filteredListings" :key="listing.id" class="col-12 col-sm-6 col-lg-4">
            <q-card>
              <!-- Photo placeholder -->
              <div
                :style="{
                  background: listing.photoColor || '#e0e0e0',
                  height: '150px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }"
              >
                <q-icon name="image" size="40px" color="white" />
              </div>

              <q-card-section>
                <div class="row items-start">
                  <div class="col">
                    <div class="text-subtitle1 text-bold">{{ listing.title }}</div>
                    <div class="text-h6 text-orange-8">${{ listing.price }}</div>
                  </div>
                  <q-badge :color="conditionColor(listing.condition)" class="q-mt-xs">
                    {{ listing.condition || 'Ungraded' }}
                  </q-badge>
                </div>
                <div class="text-body2 text-grey-7 q-mt-xs ellipsis-2-lines">{{ listing.description }}</div>
                <div class="row q-gutter-xs q-mt-sm">
                  <q-chip size="sm" icon="category" color="orange-1" text-color="orange-8">{{ listing.category }}</q-chip>
                  <q-chip size="sm" :icon="escrowIcon(listing.escrowStatus)" :color="escrowColor(listing.escrowStatus)" text-color="white">
                    {{ listing.escrowStatus }}
                  </q-chip>
                </div>
              </q-card-section>

              <q-card-actions>
                <q-btn flat color="primary" label="Contact Seller" icon="message" size="sm" @click="contactSeller(listing)" />
                <q-space />
                <q-btn
                  color="orange-8"
                  label="Buy (Escrow)"
                  icon="lock"
                  size="sm"
                  @click="initEscrow(listing)"
                  :disable="listing.escrowStatus !== 'Pending'"
                />
              </q-card-actions>

              <!-- Escrow status detail -->
              <q-card-section v-if="listing.escrowStatus !== 'Pending'" class="q-pt-none">
                <q-linear-progress
                  :value="escrowProgress(listing.escrowStatus)"
                  :color="escrowColor(listing.escrowStatus)"
                  class="q-mt-xs"
                  rounded
                  size="8px"
                />
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
    </div>

    <!-- Contact Dialog -->
    <q-dialog v-model="showContactDialog">
      <q-card style="min-width: 320px">
        <q-card-section class="bg-orange-8 text-white">
          <div class="text-h6">Contact Seller</div>
        </q-card-section>
        <q-card-section v-if="contactListing">
          <div class="text-body2 q-mb-md">Regarding: <strong>{{ contactListing.title }}</strong> — ${{ contactListing.price }}</div>
          <q-input v-model="contactMessage" label="Your message" outlined type="textarea" rows="3" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn color="orange-8" label="Send Message" @click="sendMessage" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

interface Listing {
  id: string
  title: string
  description: string
  price: number
  category: string
  condition: string
  photoColor: string
  escrowStatus: 'Pending' | 'Secured' | 'Released'
  postedAt: string
}

const listings = ref<Listing[]>([])
const searchQuery = ref('')
const filterCategory = ref('All')
const showContactDialog = ref(false)
const contactListing = ref<Listing | null>(null)
const contactMessage = ref('')

const categories = ['Electronics', 'Clothing', 'Furniture', 'Books', 'Sports', 'Toys', 'Vehicles', 'Other']

const newListing = ref({
  title: '',
  description: '',
  price: null as number | null,
  category: 'Electronics'
})

const photoColors = ['#4fc3f7', '#81c784', '#ffb74d', '#e57373', '#ce93d8', '#80cbc4']
const selectedPhoto = ref<number | null>(null)
const grading = ref(false)

interface GradeResult {
  grade: 'Good' | 'Fair' | 'Poor'
  score: number
  reasoning: string
}

const gradeResult = ref<GradeResult | null>(null)

const gradeColors: Record<string, string> = {
  Good: 'bg-positive text-white',
  Fair: 'bg-warning text-dark',
  Poor: 'bg-negative text-white'
}
const gradeIcons: Record<string, string> = {
  Good: 'thumb_up',
  Fair: 'thumbs_up_down',
  Poor: 'thumb_down'
}

function conditionColor(condition: string) {
  if (condition === 'Good') return 'positive'
  if (condition === 'Fair') return 'warning'
  if (condition === 'Poor') return 'negative'
  return 'grey'
}

function escrowIcon(status: string) {
  if (status === 'Secured') return 'lock'
  if (status === 'Released') return 'check_circle'
  return 'lock_open'
}

function escrowColor(status: string) {
  if (status === 'Secured') return 'warning'
  if (status === 'Released') return 'positive'
  return 'grey'
}

function escrowProgress(status: string) {
  if (status === 'Secured') return 0.5
  if (status === 'Released') return 1
  return 0
}

function selectPhoto(i: number) {
  selectedPhoto.value = i
  gradeResult.value = null
}

async function gradeCondition() {
  if (selectedPhoto.value === null) return
  grading.value = true
  await new Promise(resolve => setTimeout(resolve, 1800))

  // Mock AI grades based on selected photo color
  const mockGrades: GradeResult[] = [
    { grade: 'Good', score: 87, reasoning: 'Item appears well-maintained with minimal signs of use. Surface is clean with no visible damage.' },
    { grade: 'Good', score: 78, reasoning: 'Item shows light wear consistent with normal use. No significant defects detected.' },
    { grade: 'Fair', score: 62, reasoning: 'Item has visible wear and minor scuffs. Functional but shows age. Price should reflect condition.' },
    { grade: 'Fair', score: 55, reasoning: 'Moderate signs of use detected. Some surface scratches present. Recommend disclosing in listing.' },
    { grade: 'Poor', score: 34, reasoning: 'Significant wear and damage visible. Item may need repair or parts. Price accordingly.' },
    { grade: 'Good', score: 82, reasoning: 'Appears to be in good working condition. Clean with minor cosmetic imperfections.' }
  ]
  gradeResult.value = mockGrades[selectedPhoto.value!]
  grading.value = false
}

function postListing() {
  const listing: Listing = {
    id: Date.now().toString(),
    title: newListing.value.title,
    description: newListing.value.description,
    price: Number(newListing.value.price) || 0,
    category: newListing.value.category,
    condition: gradeResult.value?.grade || 'Ungraded',
    photoColor: selectedPhoto.value !== null ? photoColors[selectedPhoto.value] : '#e0e0e0',
    escrowStatus: 'Pending',
    postedAt: new Date().toISOString()
  }
  listings.value.unshift(listing)
  localStorage.setItem('webuy_listings', JSON.stringify(listings.value))
  newListing.value = { title: '', description: '', price: null, category: 'Electronics' }
  selectedPhoto.value = null
  gradeResult.value = null
  $q.notify({ type: 'positive', message: 'Listing posted!' })
}

const filteredListings = computed(() => {
  return listings.value.filter(l => {
    const matchSearch = !searchQuery.value || l.title.toLowerCase().includes(searchQuery.value.toLowerCase()) || l.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchCategory = filterCategory.value === 'All' || l.category === filterCategory.value
    return matchSearch && matchCategory
  })
})

function contactSeller(listing: Listing) {
  contactListing.value = listing
  contactMessage.value = ''
  showContactDialog.value = true
}

function sendMessage() {
  $q.notify({ type: 'positive', message: 'Message sent to seller!' })
  showContactDialog.value = false
}

function initEscrow(listing: Listing) {
  listing.escrowStatus = 'Secured'
  localStorage.setItem('webuy_listings', JSON.stringify(listings.value))
  $q.notify({
    type: 'positive',
    message: `Escrow secured for "${listing.title}". Payment held until you confirm receipt.`,
    timeout: 4000
  })
  // Simulate release after showing secured
  setTimeout(() => {
    listing.escrowStatus = 'Released'
    localStorage.setItem('webuy_listings', JSON.stringify(listings.value))
  }, 5000)
}

onMounted(() => {
  const saved = localStorage.getItem('webuy_listings')
  if (saved) listings.value = JSON.parse(saved)

  // Add demo listings if none
  if (listings.value.length === 0) {
    listings.value = [
      {
        id: '1',
        title: 'iPhone 14 Pro 256GB',
        description: 'Excellent condition, used for 6 months. Comes with original box and charger.',
        price: 650,
        category: 'Electronics',
        condition: 'Good',
        photoColor: photoColors[0],
        escrowStatus: 'Pending',
        postedAt: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Herman Miller Aeron Chair',
        description: 'Classic size B. Some minor wear on armrests but fully functional.',
        price: 400,
        category: 'Furniture',
        condition: 'Fair',
        photoColor: photoColors[1],
        escrowStatus: 'Secured',
        postedAt: new Date().toISOString()
      },
      {
        id: '3',
        title: 'Nike Air Max 90 Size 10',
        description: 'Worn twice, basically new. Too small for me.',
        price: 80,
        category: 'Clothing',
        condition: 'Good',
        photoColor: photoColors[3],
        escrowStatus: 'Pending',
        postedAt: new Date().toISOString()
      }
    ]
  }
})
</script>
