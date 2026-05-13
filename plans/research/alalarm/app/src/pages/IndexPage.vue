<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAlarmStore } from 'src/stores/alarm.store'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const store = useAlarmStore()

const showDialog = ref(false)
const form = ref({
  name: '',
  notes: '',
  category: 'water' as 'medication' | 'water' | 'exercise' | 'focus' | 'custom',
  intervalValue: 30,
  intervalUnit: 'minutes' as 'minutes' | 'hours' | 'days',
  windowStart: '08:00',
  windowEnd: '22:00',
  snoozeDelay: 5,
  active: true
})

const categories = [
  { label: 'Medication', value: 'medication' },
  { label: 'Water', value: 'water' },
  { label: 'Exercise', value: 'exercise' },
  { label: 'Focus', value: 'focus' },
  { label: 'Custom', value: 'custom' }
]

const intervalUnits = [
  { label: 'Minutes', value: 'minutes' },
  { label: 'Hours', value: 'hours' },
  { label: 'Days', value: 'days' }
]

function resetForm() {
  form.value = {
    name: '',
    notes: '',
    category: 'water',
    intervalValue: 30,
    intervalUnit: 'minutes',
    windowStart: '08:00',
    windowEnd: '22:00',
    snoozeDelay: 5,
    active: true
  }
}

function openDialog() {
  resetForm()
  showDialog.value = true
}

function addAlarm() {
  if (!form.value.name.trim()) {
    $q.notify({ type: 'negative', message: 'Please enter an alarm name' })
    return
  }
  store.addAlarm({ ...form.value })
  showDialog.value = false
  $q.notify({ type: 'positive', message: 'Alarm added!' })
}

function formatInterval(alarm: any) {
  return `Every ${alarm.intervalValue} ${alarm.intervalUnit}`
}

function formatWindow(alarm: any) {
  return `${alarm.windowStart} – ${alarm.windowEnd}`
}

// Browser notification + interval check
let intervalId: ReturnType<typeof setInterval> | null = null

async function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    await Notification.requestPermission()
  }
}

function getIntervalMs(value: number, unit: string) {
  if (unit === 'minutes') return value * 60 * 1000
  if (unit === 'hours') return value * 60 * 60 * 1000
  return value * 24 * 60 * 60 * 1000
}

function isInWindow(start: string, end: string): boolean {
  const now = new Date()
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  const nowMins = now.getHours() * 60 + now.getMinutes()
  const startMins = sh * 60 + sm
  const endMins = eh * 60 + em
  return nowMins >= startMins && nowMins <= endMins
}

function checkAlarms() {
  const now = Date.now()
  store.alarms.forEach(alarm => {
    if (!alarm.active) return
    if (!isInWindow(alarm.windowStart, alarm.windowEnd)) return
    const lastMs = alarm.lastTriggered ? new Date(alarm.lastTriggered).getTime() : 0
    const intervalMs = getIntervalMs(alarm.intervalValue, alarm.intervalUnit)
    if (now - lastMs >= intervalMs) {
      store.incrementStreak(alarm.id)
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`Alalarm: ${alarm.name}`, {
          body: alarm.notes || `Time for your ${alarm.category} reminder!`,
          icon: '/favicon.ico'
        })
      } else {
        $q.notify({
          type: 'info',
          message: `Alarm: ${alarm.name}`,
          caption: alarm.notes || `${alarm.category} reminder`,
          timeout: alarm.snoozeDelay * 1000
        })
      }
    }
  })
}

onMounted(async () => {
  await requestNotificationPermission()
  intervalId = setInterval(checkAlarms, 30000) // check every 30s
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})
</script>

<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h5 text-weight-bold">My Alarms</div>
      <q-btn color="primary" icon="add" label="Add Alarm" @click="openDialog" />
    </div>

    <div v-if="store.alarms.length === 0" class="column items-center q-mt-xl text-grey">
      <q-icon name="alarm_off" size="64px" />
      <div class="text-h6 q-mt-md">No alarms yet</div>
      <div class="text-body2">Tap "Add Alarm" to create your first reminder</div>
    </div>

    <div class="row q-gutter-md">
      <q-card
        v-for="alarm in store.alarms"
        :key="alarm.id"
        class="col-12 col-sm-5"
        :class="{ 'opacity-50': !alarm.active }"
      >
        <q-card-section>
          <div class="row items-center no-wrap">
            <q-icon
              :name="store.categoryIcons[alarm.category]"
              :color="store.categoryColors[alarm.category]"
              size="32px"
              class="q-mr-sm"
            />
            <div class="col">
              <div class="text-h6">{{ alarm.name }}</div>
              <div class="text-caption text-grey">{{ alarm.notes }}</div>
            </div>
            <q-toggle v-model="alarm.active" @update:model-value="store.toggleAlarm(alarm.id)" color="primary" />
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pt-sm">
          <div class="row q-gutter-sm text-body2">
            <q-chip icon="schedule" :label="formatInterval(alarm)" size="sm" />
            <q-chip icon="wb_sunny" :label="formatWindow(alarm)" size="sm" />
            <q-chip icon="snooze" :label="`Snooze ${alarm.snoozeDelay}m`" size="sm" />
          </div>
          <div class="row items-center q-mt-sm">
            <q-icon name="local_fire_department" color="orange" class="q-mr-xs" />
            <span class="text-weight-bold">{{ alarm.streak }}</span>
            <span class="text-caption text-grey q-ml-xs">streak</span>
            <q-badge
              :color="store.categoryColors[alarm.category]"
              :label="alarm.category"
              class="q-ml-auto"
            />
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat icon="delete" color="negative" dense @click="store.deleteAlarm(alarm.id)" />
        </q-card-actions>
      </q-card>
    </div>

    <!-- Add Alarm Dialog -->
    <q-dialog v-model="showDialog" persistent>
      <q-card style="min-width: 340px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">New Alarm</div>
        </q-card-section>

        <q-card-section class="q-gutter-sm">
          <q-input
            v-model="form.name"
            label="Alarm Name *"
            outlined
            dense
            placeholder="e.g. Take ibuprofen"
          />
          <q-input
            v-model="form.notes"
            label="Notes"
            outlined
            dense
            placeholder="e.g. Take with food"
          />
          <q-select
            v-model="form.category"
            :options="categories"
            label="Category"
            outlined
            dense
            emit-value
            map-options
          />
          <div class="row q-gutter-sm">
            <q-input
              v-model.number="form.intervalValue"
              label="Every"
              type="number"
              outlined
              dense
              class="col"
              :min="1"
            />
            <q-select
              v-model="form.intervalUnit"
              :options="intervalUnits"
              outlined
              dense
              emit-value
              map-options
              class="col"
            />
          </div>
          <div class="row q-gutter-sm">
            <q-input
              v-model="form.windowStart"
              label="Start Time"
              type="time"
              outlined
              dense
              class="col"
            />
            <q-input
              v-model="form.windowEnd"
              label="End Time"
              type="time"
              outlined
              dense
              class="col"
            />
          </div>
          <q-input
            v-model.number="form.snoozeDelay"
            label="Snooze Delay (minutes)"
            type="number"
            outlined
            dense
            :min="1"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn color="primary" label="Add Alarm" @click="addAlarm" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>
