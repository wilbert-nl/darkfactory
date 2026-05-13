<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
      <!-- Left: Post a Request -->
      <div class="col-12 col-md-4">
        <q-card>
          <q-card-section class="bg-teal-8 text-white">
            <div class="text-h6">Post a Photo Request</div>
            <div class="text-caption">Get real photos from someone at the location</div>
          </q-card-section>
          <q-card-section class="q-gutter-md">
            <q-input v-model="newRequest.location" label="Location Description *" outlined placeholder="e.g. Shibuya Crossing, Tokyo" />
            <div class="row q-gutter-sm">
              <q-input v-model="newRequest.lat" label="Latitude" outlined dense type="number" class="col" placeholder="35.6595" />
              <q-input v-model="newRequest.lng" label="Longitude" outlined dense type="number" class="col" placeholder="139.7004" />
            </div>
            <q-btn size="sm" flat color="teal" icon="my_location" label="Use My Location" @click="useMyLocation" :loading="locating" />
            <q-input v-model="newRequest.description" label="What photos/info needed? *" outlined type="textarea" rows="3"
              placeholder="e.g. Current crowd level, street conditions, is the restaurant open?" />
            <q-input v-model="newRequest.priceOffer" label="Price Offer ($) *" outlined type="number" prefix="$" />
            <q-input v-model="newRequest.deadline" label="Deadline" outlined type="datetime-local" />
          </q-card-section>
          <q-card-actions align="right">
            <q-btn color="teal-8" icon="send" label="Post Request" @click="postRequest" :disable="!newRequest.location || !newRequest.description || !newRequest.priceOffer" />
          </q-card-actions>
        </q-card>

        <!-- Map View placeholder -->
        <q-card class="q-mt-md">
          <q-card-section class="bg-grey-2">
            <div class="text-subtitle2 text-grey-7">Location Map (Mock)</div>
          </q-card-section>
          <div style="height: 200px; background: linear-gradient(135deg, #e0f2f1 25%, #b2dfdb 75%); display: flex; align-items: center; justify-content: center; position: relative;">
            <!-- Mock map pins -->
            <div v-for="req in activeRequests" :key="req.id" :style="mapPinStyle(req)" class="absolute" @click="selectedRequest = req" style="cursor:pointer">
              <q-icon name="location_on" :color="req.status === 'Open' ? 'teal' : 'grey'" size="sm" />
              <q-tooltip>{{ req.location }} — ${{ req.priceOffer }}</q-tooltip>
            </div>
            <div class="text-teal-6 text-caption text-center q-pa-sm" style="background: rgba(255,255,255,0.8); border-radius: 8px;">
              <q-icon name="map" />
              Interactive map — {{ activeRequests.length }} open requests
            </div>
          </div>
        </q-card>
      </div>

      <!-- Right: Browse / Accept Requests -->
      <div class="col-12 col-md-8">
        <div class="row items-center q-mb-md">
          <div class="text-h6">Open Requests</div>
          <q-space />
          <q-btn-toggle
            v-model="viewMode"
            :options="[{ label: 'List', value: 'list', icon: 'list' }, { label: 'Cards', value: 'cards', icon: 'grid_view' }]"
            color="teal-8"
            flat
            toggle-color="teal-8"
          />
        </div>

        <div v-if="requests.length === 0" class="text-center q-pa-xl text-grey">
          <q-icon name="camera_alt" size="60px" color="teal-3" />
          <div class="q-mt-md">No photo requests yet. Post the first one!</div>
        </div>

        <div v-else>
          <!-- List view -->
          <q-list v-if="viewMode === 'list'" separator bordered class="rounded-borders">
            <q-item
              v-for="req in requests"
              :key="req.id"
              clickable
              v-ripple
              @click="selectedRequest = req"
              :class="selectedRequest?.id === req.id ? 'bg-teal-1' : ''"
            >
              <q-item-section avatar>
                <q-avatar :color="statusColor(req.status)" text-color="white" size="sm" :icon="statusIcon(req.status)" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-bold">{{ req.location }}</q-item-label>
                <q-item-label caption class="ellipsis">{{ req.description }}</q-item-label>
                <q-item-label caption>
                  <q-icon name="schedule" size="xs" /> {{ req.deadline ? req.deadline.slice(0, 16) : 'No deadline' }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <div class="column items-end q-gutter-xs">
                  <div class="text-h6 text-teal-8">${{ req.priceOffer }}</div>
                  <q-badge :color="statusColor(req.status)">{{ req.status }}</q-badge>
                </div>
              </q-item-section>
            </q-item>
          </q-list>

          <!-- Card view -->
          <div v-else class="row q-col-gutter-md">
            <div v-for="req in requests" :key="req.id" class="col-12 col-sm-6">
              <q-card :class="req.status !== 'Open' ? 'opacity-60' : ''" @click="selectedRequest = req" style="cursor:pointer">
                <!-- Mock location image -->
                <div :style="{ background: req.mapColor, height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }">
                  <q-icon name="location_on" size="40px" color="white" />
                </div>
                <q-card-section>
                  <div class="row">
                    <div class="col">
                      <div class="text-subtitle2">{{ req.location }}</div>
                      <div class="text-caption text-grey ellipsis">{{ req.description }}</div>
                    </div>
                    <q-badge :color="statusColor(req.status)" class="q-ml-sm self-start">{{ req.status }}</q-badge>
                  </div>
                  <div class="row items-center q-mt-sm">
                    <q-chip icon="place" size="sm" color="teal-1" text-color="teal-8">
                      {{ req.lat?.toFixed(4) }}, {{ req.lng?.toFixed(4) }}
                    </q-chip>
                    <q-space />
                    <div class="text-h6 text-teal-8">${{ req.priceOffer }}</div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Request Detail / Accept / Submit Dialog -->
    <q-dialog v-model="showDetail" full-width>
      <q-card v-if="selectedRequest" style="max-width: 700px">
        <q-card-section class="bg-teal-8 text-white">
          <div class="row items-center">
            <div>
              <div class="text-h6">{{ selectedRequest.location }}</div>
              <div class="text-caption">Posted {{ selectedRequest.postedAt }}</div>
            </div>
            <q-space />
            <q-badge :color="statusColor(selectedRequest.status)" class="text-subtitle2 q-pa-sm">{{ selectedRequest.status }}</q-badge>
          </div>
        </q-card-section>

        <q-card-section>
          <div class="q-mb-md">
            <div class="text-subtitle2">What's Needed</div>
            <div class="text-body2">{{ selectedRequest.description }}</div>
          </div>
          <div class="row q-gutter-md q-mb-md">
            <div>
              <div class="text-caption text-grey">Coordinates</div>
              <div>{{ selectedRequest.lat }}, {{ selectedRequest.lng }}</div>
            </div>
            <div>
              <div class="text-caption text-grey">Price Offer</div>
              <div class="text-h6 text-teal-8">${{ selectedRequest.priceOffer }}</div>
            </div>
            <div>
              <div class="text-caption text-grey">Deadline</div>
              <div>{{ selectedRequest.deadline || 'None' }}</div>
            </div>
          </div>

          <!-- Accept gig (if Open) -->
          <div v-if="selectedRequest.status === 'Open'">
            <q-btn color="teal-8" icon="check_circle" label="Accept this Gig" class="q-mb-md" @click="acceptGig(selectedRequest)" />
          </div>

          <!-- Submit delivery (if Accepted) -->
          <div v-if="selectedRequest.status === 'Accepted'">
            <q-separator class="q-mb-md" />
            <div class="text-subtitle2 q-mb-md">Submit Delivery</div>
            <div class="q-gutter-md">
              <div class="q-pa-md bg-grey-2 rounded-borders text-center">
                <q-icon name="add_photo_alternate" size="40px" color="grey-6" />
                <div class="text-caption text-grey">Upload photos (simulated)</div>
                <div class="row justify-center q-mt-sm q-gutter-xs">
                  <div
                    v-for="c in deliveryColors"
                    :key="c"
                    :style="{ background: c, width: '50px', height: '50px', borderRadius: '4px', cursor: 'pointer', border: submittedPhotos.includes(c) ? '3px solid #009688' : '3px solid transparent' }"
                    @click="togglePhoto(c)"
                  />
                </div>
                <div class="text-caption text-grey q-mt-xs">Click swatches to add/remove photos</div>
              </div>

              <div class="row q-gutter-sm">
                <q-input v-model="delivery.lat" label="Your GPS Lat" outlined dense type="number" class="col" />
                <q-input v-model="delivery.lng" label="Your GPS Lng" outlined dense type="number" class="col" />
                <q-btn size="sm" flat color="teal" icon="gps_fixed" @click="useMyDeliveryLocation" :loading="locating" />
              </div>

              <q-btn
                color="teal-8"
                icon="cloud_upload"
                label="Submit Delivery"
                :disable="submittedPhotos.length === 0"
                @click="submitDelivery(selectedRequest)"
              />
            </div>
          </div>

          <!-- GPS verification result -->
          <q-banner v-if="selectedRequest.gpsVerification" class="q-mt-md rounded-borders"
            :class="selectedRequest.gpsVerification.passed ? 'bg-positive text-white' : 'bg-negative text-white'">
            <template #avatar>
              <q-icon :name="selectedRequest.gpsVerification.passed ? 'gps_fixed' : 'gps_off'" />
            </template>
            <div class="text-bold">GPS Verification: {{ selectedRequest.gpsVerification.passed ? 'PASSED' : 'FAILED' }}</div>
            <div class="text-caption">{{ selectedRequest.gpsVerification.message }}</div>
            <div class="text-caption">Distance from target: {{ selectedRequest.gpsVerification.distanceKm.toFixed(2) }} km</div>
          </q-banner>

          <!-- Delivery photos preview -->
          <div v-if="selectedRequest.deliveryPhotos && selectedRequest.deliveryPhotos.length > 0" class="q-mt-md">
            <div class="text-subtitle2 q-mb-sm">Submitted Photos ({{ selectedRequest.deliveryPhotos.length }})</div>
            <div class="row q-gutter-sm">
              <div
                v-for="(color, i) in selectedRequest.deliveryPhotos"
                :key="i"
                :style="{ background: color, width: '80px', height: '80px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }"
              >
                <q-icon name="image" color="white" />
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Close" v-close-popup />
          <q-btn v-if="selectedRequest.status === 'Delivered'" color="positive" icon="check" label="Approve & Release Payment" @click="approveDelivery(selectedRequest)" />
          <q-btn v-if="selectedRequest.status === 'Delivered'" flat color="negative" label="Reject" @click="rejectDelivery(selectedRequest)" />
          <q-btn v-if="['Open', 'Accepted', 'Delivered'].includes(selectedRequest.status)" flat color="negative" label="Delete Request" @click="deleteRequest(selectedRequest.id)" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

interface GpsVerification {
  passed: boolean
  distanceKm: number
  message: string
}

interface Request {
  id: string
  location: string
  lat: number | null
  lng: number | null
  description: string
  priceOffer: number
  deadline: string
  status: 'Open' | 'Accepted' | 'Delivered' | 'Approved' | 'Rejected'
  postedAt: string
  mapColor: string
  deliveryPhotos?: string[]
  deliveryLat?: number
  deliveryLng?: number
  gpsVerification?: GpsVerification
}

const requests = ref<Request[]>([])
const selectedRequest = ref<Request | null>(null)
const viewMode = ref<'list' | 'cards'>('list')
const showDetail = ref(false)
const locating = ref(false)

const newRequest = ref({
  location: '',
  lat: null as number | null,
  lng: null as number | null,
  description: '',
  priceOffer: null as number | null,
  deadline: ''
})

const delivery = ref({ lat: null as number | null, lng: null as number | null })
const submittedPhotos = ref<string[]>([])
const deliveryColors = ['#4db6ac', '#81c784', '#ffb74d', '#e57373', '#ba68c8', '#4fc3f7']

const mapColors = ['#80cbc4', '#a5d6a7', '#ffe082', '#ef9a9a', '#ce93d8', '#81d4fa', '#ffcc80', '#f48fb1']

const activeRequests = computed(() => requests.value.filter(r => r.status === 'Open'))

watch(selectedRequest, (val) => {
  if (val) showDetail.value = true
})

function statusColor(status: string) {
  const map: Record<string, string> = {
    Open: 'teal',
    Accepted: 'warning',
    Delivered: 'primary',
    Approved: 'positive',
    Rejected: 'negative'
  }
  return map[status] || 'grey'
}

function statusIcon(status: string) {
  const map: Record<string, string> = {
    Open: 'radio_button_unchecked',
    Accepted: 'pending',
    Delivered: 'cloud_done',
    Approved: 'check_circle',
    Rejected: 'cancel'
  }
  return map[status] || 'help'
}

function mapPinStyle(req: Request) {
  // Place pins pseudo-randomly based on id hash
  const hash = req.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return {
    left: `${10 + (hash % 70)}%`,
    top: `${10 + ((hash * 13) % 60)}%`,
    position: 'absolute' as const
  }
}

function saveData() {
  localStorage.setItem('crowdshot_requests', JSON.stringify(requests.value))
}

function useMyLocation() {
  locating.value = true
  navigator.geolocation?.getCurrentPosition(
    (pos) => {
      newRequest.value.lat = +pos.coords.latitude.toFixed(6)
      newRequest.value.lng = +pos.coords.longitude.toFixed(6)
      locating.value = false
      $q.notify({ type: 'positive', message: 'Location detected!' })
    },
    () => {
      // Fallback mock
      newRequest.value.lat = 14.5995
      newRequest.value.lng = 120.9842
      locating.value = false
      $q.notify({ type: 'info', message: 'Using mock coordinates (Manila)' })
    }
  )
}

function useMyDeliveryLocation() {
  locating.value = true
  navigator.geolocation?.getCurrentPosition(
    (pos) => {
      delivery.value.lat = +pos.coords.latitude.toFixed(6)
      delivery.value.lng = +pos.coords.longitude.toFixed(6)
      locating.value = false
    },
    () => {
      delivery.value.lat = selectedRequest.value?.lat ? selectedRequest.value.lat + (Math.random() * 0.01 - 0.005) : 14.5995
      delivery.value.lng = selectedRequest.value?.lng ? selectedRequest.value.lng + (Math.random() * 0.01 - 0.005) : 120.9842
      locating.value = false
    }
  )
}

function togglePhoto(color: string) {
  const idx = submittedPhotos.value.indexOf(color)
  if (idx >= 0) {
    submittedPhotos.value.splice(idx, 1)
  } else {
    submittedPhotos.value.push(color)
  }
}

function postRequest() {
  const req: Request = {
    id: Date.now().toString(),
    location: newRequest.value.location,
    lat: newRequest.value.lat,
    lng: newRequest.value.lng,
    description: newRequest.value.description,
    priceOffer: Number(newRequest.value.priceOffer),
    deadline: newRequest.value.deadline,
    status: 'Open',
    postedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    mapColor: mapColors[requests.value.length % mapColors.length]
  }
  requests.value.unshift(req)
  saveData()
  newRequest.value = { location: '', lat: null, lng: null, description: '', priceOffer: null, deadline: '' }
  $q.notify({ type: 'positive', message: 'Request posted! Nearby photographers will be notified.' })
}

function deleteRequest(id: string) {
  requests.value = requests.value.filter(r => r.id !== id)
  saveData()
  showDetail.value = false
  selectedRequest.value = null
}

function acceptGig(req: Request) {
  req.status = 'Accepted'
  saveData()
  $q.notify({ type: 'positive', message: 'Gig accepted! Now go take the photos.' })
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function submitDelivery(req: Request) {
  req.deliveryPhotos = [...submittedPhotos.value]
  req.deliveryLat = delivery.value.lat ?? undefined
  req.deliveryLng = delivery.value.lng ?? undefined
  req.status = 'Delivered'

  // GPS verification
  if (req.lat && req.lng && delivery.value.lat && delivery.value.lng) {
    const dist = haversineKm(req.lat, req.lng, delivery.value.lat, delivery.value.lng)
    req.gpsVerification = {
      passed: dist < 1,
      distanceKm: dist,
      message: dist < 1
        ? `Photographer was within ${(dist * 1000).toFixed(0)}m of the requested location. GPS verified.`
        : `Photographer was ${dist.toFixed(2)}km from the requested location. Outside 1km threshold.`
    }
  } else {
    req.gpsVerification = {
      passed: true,
      distanceKm: 0,
      message: 'No coordinates provided — GPS verification skipped.'
    }
  }

  saveData()
  submittedPhotos.value = []
  delivery.value = { lat: null, lng: null }
  $q.notify({ type: 'positive', message: 'Delivery submitted! Waiting for requester approval.' })
}

function approveDelivery(req: Request) {
  req.status = 'Approved'
  saveData()
  showDetail.value = false
  $q.notify({ type: 'positive', message: `Payment of $${req.priceOffer} released to photographer!` })
}

function rejectDelivery(req: Request) {
  req.status = 'Rejected'
  saveData()
  $q.notify({ type: 'negative', message: 'Submission rejected. Dispute opened.' })
}

onMounted(() => {
  const saved = localStorage.getItem('crowdshot_requests')
  if (saved) {
    requests.value = JSON.parse(saved)
  } else {
    // Demo data
    requests.value = [
      {
        id: '1',
        location: 'Eiffel Tower, Paris',
        lat: 48.8584,
        lng: 2.2945,
        description: 'How crowded is it right now? Any queue at the entrance? Show ticket booth.',
        priceOffer: 15,
        deadline: '2026-04-29T20:00',
        status: 'Open',
        postedAt: '2026-04-29 10:00',
        mapColor: mapColors[0]
      },
      {
        id: '2',
        location: 'Shibuya Crossing, Tokyo',
        lat: 35.6595,
        lng: 139.7004,
        description: 'Current crowd density at scramble crossing. Video preferred.',
        priceOffer: 20,
        deadline: '2026-04-29T18:00',
        status: 'Accepted',
        postedAt: '2026-04-29 09:30',
        mapColor: mapColors[1]
      },
      {
        id: '3',
        location: 'Neon Museum, Las Vegas',
        lat: 36.1770,
        lng: -115.1357,
        description: 'Is the outdoor exhibit open? Any new neon signs installed?',
        priceOffer: 25,
        deadline: '',
        status: 'Open',
        postedAt: '2026-04-29 08:00',
        mapColor: mapColors[2]
      }
    ]
  }
})
</script>
