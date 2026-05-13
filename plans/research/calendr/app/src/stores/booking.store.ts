import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Appointment {
  id: string
  title: string
  date: string
  time: string
  duration: number
  clientName: string
  notes: string
  cancelled: boolean
  createdAt: string
}

const STORAGE_KEY = 'calendr:appointments'

export const useBookingStore = defineStore('booking', () => {
  const appointments = ref<Appointment[]>(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'))

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments.value))
  }

  function addAppointment(apt: Omit<Appointment, 'id' | 'createdAt' | 'cancelled'>) {
    appointments.value.push({
      ...apt,
      id: crypto.randomUUID(),
      cancelled: false,
      createdAt: new Date().toISOString()
    })
    save()
  }

  function cancelAppointment(id: string) {
    const apt = appointments.value.find(a => a.id === id)
    if (apt) {
      apt.cancelled = true
      save()
    }
  }

  function deleteAppointment(id: string) {
    appointments.value = appointments.value.filter(a => a.id !== id)
    save()
  }

  function getForDate(date: string) {
    return appointments.value
      .filter(a => a.date === date && !a.cancelled)
      .sort((a, b) => a.time.localeCompare(b.time))
  }

  return { appointments, addAppointment, cancelAppointment, deleteAppointment, getForDate }
})
