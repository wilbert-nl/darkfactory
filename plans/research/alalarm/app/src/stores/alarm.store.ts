import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Alarm {
  id: string
  name: string
  notes: string
  category: 'medication' | 'water' | 'exercise' | 'focus' | 'custom'
  intervalValue: number
  intervalUnit: 'minutes' | 'hours' | 'days'
  windowStart: string
  windowEnd: string
  snoozeDelay: number
  active: boolean
  streak: number
  lastTriggered: string | null
  createdAt: string
}

const STORAGE_KEY = 'alalarm:alarms'

export const useAlarmStore = defineStore('alarm', () => {
  const alarms = ref<Alarm[]>(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'))

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alarms.value))
  }

  function addAlarm(alarm: Omit<Alarm, 'id' | 'createdAt' | 'streak' | 'lastTriggered'>) {
    alarms.value.push({
      ...alarm,
      id: crypto.randomUUID(),
      streak: 0,
      lastTriggered: null,
      createdAt: new Date().toISOString()
    })
    save()
  }

  function toggleAlarm(id: string) {
    const alarm = alarms.value.find(a => a.id === id)
    if (alarm) {
      alarm.active = !alarm.active
      save()
    }
  }

  function deleteAlarm(id: string) {
    alarms.value = alarms.value.filter(a => a.id !== id)
    save()
  }

  function incrementStreak(id: string) {
    const alarm = alarms.value.find(a => a.id === id)
    if (alarm) {
      alarm.streak++
      alarm.lastTriggered = new Date().toISOString()
      save()
    }
  }

  const categoryColors: Record<Alarm['category'], string> = {
    medication: 'red',
    water: 'blue',
    exercise: 'green',
    focus: 'purple',
    custom: 'orange'
  }

  const categoryIcons: Record<Alarm['category'], string> = {
    medication: 'medication',
    water: 'water_drop',
    exercise: 'fitness_center',
    focus: 'psychology',
    custom: 'alarm'
  }

  return { alarms, addAlarm, toggleAlarm, deleteAlarm, incrementStreak, categoryColors, categoryIcons }
})
