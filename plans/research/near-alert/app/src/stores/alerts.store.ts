import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface LocationAlert {
  id: string
  name: string
  lat: number
  lng: number
  radius: number // km
  message: string
  active: boolean
  triggered: boolean
  createdAt: string
}

const STORAGE_KEY = 'nearalert:alerts'

export const useAlertsStore = defineStore('alerts', () => {
  const alerts = ref<LocationAlert[]>(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'))

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts.value))
  }

  function addAlert(alert: Omit<LocationAlert, 'id' | 'createdAt' | 'triggered'>) {
    alerts.value.push({
      ...alert,
      id: crypto.randomUUID(),
      triggered: false,
      createdAt: new Date().toISOString()
    })
    save()
  }

  function deleteAlert(id: string) {
    alerts.value = alerts.value.filter(a => a.id !== id)
    save()
  }

  function toggleAlert(id: string) {
    const alert = alerts.value.find(a => a.id === id)
    if (alert) {
      alert.active = !alert.active
      alert.triggered = false
      save()
    }
  }

  function triggerAlert(id: string) {
    const alert = alerts.value.find(a => a.id === id)
    if (alert) {
      alert.triggered = true
      save()
    }
  }

  // Haversine formula - returns distance in km
  function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLng/2)**2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }

  function checkProximity(userLat: number, userLng: number) {
    alerts.value.forEach(alert => {
      if (!alert.active || alert.triggered) return
      const dist = haversine(userLat, userLng, alert.lat, alert.lng)
      if (dist <= alert.radius) {
        triggerAlert(alert.id)
      }
    })
  }

  return { alerts, addAlert, deleteAlert, toggleAlert, triggerAlert, checkProximity, haversine }
})
