import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface MoodEntry {
  date: string // YYYY-MM-DD
  rating: number // 1-5
  note: string
}

export const useMoodStore = defineStore('mood', () => {
  const entries = ref<MoodEntry[]>(JSON.parse(localStorage.getItem('ss-mood') || '[]'))

  function save() {
    localStorage.setItem('ss-mood', JSON.stringify(entries.value))
  }

  function logMood(rating: number, note: string) {
    const date = new Date().toISOString().split('T')[0]
    const existing = entries.value.findIndex(e => e.date === date)
    if (existing >= 0) {
      entries.value[existing] = { date, rating, note }
    } else {
      entries.value.unshift({ date, rating, note })
    }
    save()
  }

  const streak = computed(() => {
    if (!entries.value.length) return 0
    let count = 0
    let d = new Date()
    for (let i = 0; i < 30; i++) {
      const key = d.toISOString().split('T')[0]
      if (entries.value.find(e => e.date === key)) count++
      else break
      d.setDate(d.getDate() - 1)
    }
    return count
  })

  return { entries, logMood, streak }
})
