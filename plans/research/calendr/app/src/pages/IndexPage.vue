<script setup lang="ts">
import { ref, computed } from 'vue'
import { useBookingStore } from 'src/stores/booking.store'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const store = useBookingStore()

const showDialog = ref(false)
const form = ref({
  title: '',
  date: '',
  time: '',
  duration: 60,
  clientName: '',
  notes: ''
})

// Generate next 8 days
const days = computed(() => {
  const result = []
  const now = new Date()
  for (let i = 0; i < 8; i++) {
    const d = new Date(now)
    d.setDate(now.getDate() + i)
    const iso = d.toISOString().split('T')[0]
    const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    result.push({ iso, label, appointments: store.getForDate(iso) })
  }
  return result
})

function today() {
  return new Date().toISOString().split('T')[0]
}

function openDialog() {
  form.value = {
    title: '',
    date: today(),
    time: '09:00',
    duration: 60,
    clientName: '',
    notes: ''
  }
  showDialog.value = true
}

function addAppointment() {
  if (!form.value.title.trim()) {
    $q.notify({ type: 'negative', message: 'Please enter a title' })
    return
  }
  if (!form.value.date || !form.value.time) {
    $q.notify({ type: 'negative', message: 'Please set date and time' })
    return
  }
  store.addAppointment({ ...form.value })
  showDialog.value = false
  $q.notify({ type: 'positive', message: 'Appointment booked!' })
}

function formatTime(time: string, duration: number) {
  const [h, m] = time.split(':').map(Number)
  const end = new Date(2000, 0, 1, h, m + duration)
  const endStr = `${String(end.getHours()).padStart(2,'0')}:${String(end.getMinutes()).padStart(2,'0')}`
  return `${time} – ${endStr}`
}
</script>

<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h5 text-weight-bold">Appointments</div>
      <q-btn color="primary" icon="add" label="Book Appointment" @click="openDialog" />
    </div>

    <div v-for="day in days" :key="day.iso" class="q-mb-md">
      <div class="text-subtitle1 text-weight-bold text-primary q-mb-xs">
        {{ day.label }}
        <q-badge v-if="day.appointments.length" :label="day.appointments.length" color="primary" class="q-ml-xs" />
      </div>

      <div v-if="day.appointments.length === 0" class="text-grey text-caption q-pl-md">
        No appointments
      </div>

      <q-card
        v-for="apt in day.appointments"
        :key="apt.id"
        class="q-mb-sm"
        flat
        bordered
      >
        <q-card-section class="q-pa-sm">
          <div class="row items-start">
            <div class="col">
              <div class="text-weight-bold">{{ apt.title }}</div>
              <div class="text-caption text-grey row items-center">
                <q-icon name="schedule" size="14px" class="q-mr-xs" />
                {{ formatTime(apt.time, apt.duration) }} ({{ apt.duration }}min)
              </div>
              <div v-if="apt.clientName" class="text-caption text-grey row items-center">
                <q-icon name="person" size="14px" class="q-mr-xs" />
                {{ apt.clientName }}
              </div>
              <div v-if="apt.notes" class="text-caption text-grey">{{ apt.notes }}</div>
            </div>
            <div class="column items-end">
              <q-btn
                flat
                dense
                icon="cancel"
                color="negative"
                size="sm"
                @click="store.cancelAppointment(apt.id)"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Add Appointment Dialog -->
    <q-dialog v-model="showDialog" persistent>
      <q-card style="min-width: 340px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">New Appointment</div>
        </q-card-section>

        <q-card-section class="q-gutter-sm">
          <q-input v-model="form.title" label="Title *" outlined dense placeholder="e.g. Hair cut" />
          <q-input v-model="form.date" label="Date *" type="date" outlined dense />
          <q-input v-model="form.time" label="Time *" type="time" outlined dense />
          <q-input
            v-model.number="form.duration"
            label="Duration (minutes)"
            type="number"
            outlined
            dense
            :min="15"
          />
          <q-input v-model="form.clientName" label="Client Name" outlined dense placeholder="e.g. Jane Smith" />
          <q-input
            v-model="form.notes"
            label="Notes"
            type="textarea"
            outlined
            dense
            rows="2"
            placeholder="Any special notes..."
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn color="primary" label="Book" @click="addAppointment" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>
