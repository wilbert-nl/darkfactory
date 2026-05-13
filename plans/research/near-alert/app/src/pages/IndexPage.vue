<script setup lang="ts">
import { ref } from 'vue'
import { useAlertsStore } from 'src/stores/alerts.store'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const store = useAlertsStore()

const showDialog = ref(false)
const form = ref({
  name: '',
  lat: 0,
  lng: 0,
  radius: 1,
  message: '',
  active: true
})

// Simulation: mock current user location
const simLat = ref(52.3676)
const simLng = ref(4.9041)

const radiusOptions = [
  { label: '500m', value: 0.5 },
  { label: '1 km', value: 1 },
  { label: '2 km', value: 2 },
  { label: '5 km', value: 5 }
]

function openDialog() {
  form.value = {
    name: '',
    lat: 52.3676,
    lng: 4.9041,
    radius: 1,
    message: 'You are near your destination!',
    active: true
  }
  showDialog.value = true
}

function addAlert() {
  if (!form.value.name.trim()) {
    $q.notify({ type: 'negative', message: 'Please enter a destination name' })
    return
  }
  store.addAlert({ ...form.value })
  showDialog.value = false
  $q.notify({ type: 'positive', message: 'Alert added!' })
}

function simulateLocation() {
  // Check if user is near any alert
  const prevTriggered = store.alerts.filter(a => a.triggered).map(a => a.id)
  store.checkProximity(simLat.value, simLng.value)
  const newlyTriggered = store.alerts.filter(a => a.triggered && !prevTriggered.includes(a.id))

  newlyTriggered.forEach(alert => {
    $q.notify({
      type: 'warning',
      message: `You are near: ${alert.name}`,
      caption: alert.message,
      timeout: 5000
    })
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`NearAlert: ${alert.name}`, { body: alert.message })
    }
  })

  if (newlyTriggered.length === 0) {
    $q.notify({ message: 'Location simulated. No alerts triggered.', type: 'info', timeout: 2000 })
  }
}

function distanceToAlert(alert: any): string {
  const dist = store.haversine(simLat.value, simLng.value, alert.lat, alert.lng)
  if (dist < 1) return `${Math.round(dist * 1000)}m away`
  return `${dist.toFixed(1)}km away`
}
</script>

<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h5 text-weight-bold">Location Alerts</div>
      <q-btn color="primary" icon="add_location" label="Add Alert" @click="openDialog" />
    </div>

    <!-- Simulate Location Panel -->
    <q-card class="q-mb-md bg-blue-1" flat bordered>
      <q-card-section>
        <div class="text-subtitle2 text-weight-bold q-mb-sm">
          <q-icon name="my_location" class="q-mr-xs" /> Simulate Your Location
        </div>
        <div class="row q-gutter-sm">
          <q-input
            v-model.number="simLat"
            label="Latitude"
            type="number"
            outlined
            dense
            class="col"
            step="0.0001"
          />
          <q-input
            v-model.number="simLng"
            label="Longitude"
            type="number"
            outlined
            dense
            class="col"
            step="0.0001"
          />
          <q-btn color="secondary" icon="gps_fixed" label="Check" @click="simulateLocation" />
        </div>
        <div class="text-caption text-grey q-mt-xs">
          Enter coordinates and tap Check to simulate being at that location
        </div>
      </q-card-section>
    </q-card>

    <div v-if="store.alerts.length === 0" class="column items-center q-mt-xl text-grey">
      <q-icon name="location_off" size="64px" />
      <div class="text-h6 q-mt-md">No alerts set</div>
      <div class="text-body2">Tap "Add Alert" to set a location alarm</div>
    </div>

    <div class="row q-gutter-md">
      <q-card
        v-for="alert in store.alerts"
        :key="alert.id"
        class="col-12 col-sm-5"
        :class="alert.triggered ? 'bg-orange-1' : ''"
      >
        <q-card-section>
          <div class="row items-center no-wrap">
            <q-icon
              :name="alert.triggered ? 'notifications_active' : 'place'"
              :color="alert.triggered ? 'orange' : 'primary'"
              size="32px"
              class="q-mr-sm"
            />
            <div class="col">
              <div class="text-h6">{{ alert.name }}</div>
              <div class="text-caption text-grey">
                {{ alert.lat.toFixed(4) }}, {{ alert.lng.toFixed(4) }}
              </div>
              <div class="text-caption text-grey">Radius: {{ alert.radius >= 1 ? `${alert.radius}km` : `${alert.radius * 1000}m` }}</div>
            </div>
            <q-toggle
              v-model="alert.active"
              @update:model-value="store.toggleAlert(alert.id)"
              color="primary"
            />
          </div>

          <div class="q-mt-sm">
            <q-chip icon="near_me" :label="distanceToAlert(alert)" size="sm" color="blue-grey" text-color="white" />
            <q-chip v-if="alert.triggered" icon="check_circle" label="Triggered!" size="sm" color="orange" text-color="white" />
          </div>

          <div class="text-body2 q-mt-xs">{{ alert.message }}</div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat icon="delete" color="negative" dense @click="store.deleteAlert(alert.id)" />
        </q-card-actions>
      </q-card>
    </div>

    <!-- Add Alert Dialog -->
    <q-dialog v-model="showDialog" persistent>
      <q-card style="min-width: 340px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">New Location Alert</div>
        </q-card-section>

        <q-card-section class="q-gutter-sm">
          <q-input v-model="form.name" label="Destination Name *" outlined dense placeholder="e.g. Amsterdam Centraal" />
          <div class="row q-gutter-sm">
            <q-input
              v-model.number="form.lat"
              label="Latitude"
              type="number"
              outlined
              dense
              class="col"
              step="0.0001"
            />
            <q-input
              v-model.number="form.lng"
              label="Longitude"
              type="number"
              outlined
              dense
              class="col"
              step="0.0001"
            />
          </div>
          <q-select
            v-model="form.radius"
            :options="radiusOptions"
            label="Alert Radius"
            outlined
            dense
            emit-value
            map-options
          />
          <q-input
            v-model="form.message"
            label="Arrival Message"
            outlined
            dense
            placeholder="You are near your destination!"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn color="primary" label="Add Alert" @click="addAlert" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>
