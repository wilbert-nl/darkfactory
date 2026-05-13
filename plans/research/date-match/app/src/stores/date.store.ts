import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const STORAGE_KEY = 'date_match_state'

interface MatchRecord {
  id: number
  name: string
  initials: string
  age: number
  location: string
  compat: number
  color: string
  bio: string
  tags: string[]
}

export const useDateStore = defineStore('date', () => {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')

  const answers = ref<string[]>(saved.answers || [])
  const currentQ = ref<number>(saved.currentQ || 0)
  const completed = ref<boolean>(saved.completed || false)
  const scores = ref<Record<string, number>>(saved.scores || { values: 0, lifestyle: 0, communication: 0, intimacy: 0 })
  const matchHistory = ref<MatchRecord[]>(saved.matchHistory || [])

  const overallScore = computed(() => {
    const vals = Object.values(scores.value)
    return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0
  })

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      answers: answers.value,
      currentQ: currentQ.value,
      completed: completed.value,
      scores: scores.value,
      matchHistory: matchHistory.value
    }))
  }

  function setAnswer(idx: number, val: string) {
    answers.value[idx] = val
    save()
  }

  function nextQ() {
    currentQ.value++
    save()
  }

  function prevQ() {
    if (currentQ.value > 0) { currentQ.value--; save() }
  }

  function finishQuestionnaire() {
    // Calculate mock scores based on answers
    scores.value = {
      values: Math.floor(60 + Math.random() * 35),
      lifestyle: Math.floor(60 + Math.random() * 35),
      communication: Math.floor(60 + Math.random() * 35),
      intimacy: Math.floor(60 + Math.random() * 35),
    }
    completed.value = true
    save()
  }

  function addMatch(match: MatchRecord) {
    if (!matchHistory.value.find(m => m.id === match.id)) {
      matchHistory.value.push(match)
      save()
    }
  }

  function reset() {
    answers.value = []
    currentQ.value = 0
    completed.value = false
    scores.value = { values: 0, lifestyle: 0, communication: 0, intimacy: 0 }
    save()
  }

  return { answers, currentQ, completed, scores, overallScore, matchHistory, setAnswer, nextQ, prevQ, finishQuestionnaire, addMatch, reset }
})
