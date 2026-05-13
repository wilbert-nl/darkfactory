import { defineStore } from 'pinia'
import { ref } from 'vue'

export type Role = 'filmmaker' | 'critic'

export interface Film {
  id: string
  title: string
  genre: string
  synopsis: string
  screenerLink: string
  reviewType: string
  budget: number
  status: 'open' | 'accepted' | 'reviewed'
  filmakerId: string
  createdAt: number
}

export interface Review {
  id: string
  filmId: string
  criticId: string
  score: number
  critique: string
  submittedAt: number
}

const STORAGE_KEY = 'moviecritic-data'

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') } catch { return {} }
}

export const useMarketplaceStore = defineStore('marketplace', () => {
  const stored = load()
  const role = ref<Role>(stored.role || 'filmmaker')
  const films = ref<Film[]>(stored.films || [])
  const reviews = ref<Review[]>(stored.reviews || [])
  const criticEarnings = ref<number>(stored.criticEarnings || 0)

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ role: role.value, films: films.value, reviews: reviews.value, criticEarnings: criticEarnings.value }))
  }

  function setRole(r: Role) { role.value = r; save() }

  function submitFilm(f: Omit<Film, 'id' | 'status' | 'filmakerId' | 'createdAt'>) {
    films.value.unshift({ ...f, id: crypto.randomUUID(), status: 'open', filmakerId: 'filmmaker-1', createdAt: Date.now() })
    save()
  }

  function acceptFilm(filmId: string) {
    const f = films.value.find(f => f.id === filmId)
    if (f) { f.status = 'accepted'; save() }
  }

  function submitReview(filmId: string, score: number, critique: string) {
    const f = films.value.find(f => f.id === filmId)
    if (f) {
      f.status = 'reviewed'
      reviews.value.unshift({ id: crypto.randomUUID(), filmId, criticId: 'critic-1', score, critique, submittedAt: Date.now() })
      criticEarnings.value += f.budget * 0.75
      save()
    }
  }

  function getReviewForFilm(filmId: string) {
    return reviews.value.find(r => r.filmId === filmId)
  }

  return { role, films, reviews, criticEarnings, setRole, submitFilm, acceptFilm, submitReview, getReviewForFilm }
})
