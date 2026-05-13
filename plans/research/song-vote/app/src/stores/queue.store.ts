import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface SongRequest {
  id: string
  song: string
  artist: string
  requester: string
  votes: number
  pinned: boolean
  approved: boolean
  skipped: boolean
  createdAt: string
}

const STORAGE_KEY = 'songvote:queue'

export const useQueueStore = defineStore('queue', () => {
  const requests = ref<SongRequest[]>(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'))

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requests.value))
  }

  const sortedQueue = computed(() => {
    return [...requests.value]
      .filter(r => r.approved && !r.skipped)
      .sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
        return b.votes - a.votes
      })
  })

  const pendingRequests = computed(() =>
    requests.value.filter(r => !r.approved && !r.skipped)
  )

  function addRequest(song: string, artist: string, requester: string) {
    requests.value.push({
      id: crypto.randomUUID(),
      song,
      artist,
      requester,
      votes: 0,
      pinned: false,
      approved: false,
      skipped: false,
      createdAt: new Date().toISOString()
    })
    save()
  }

  function vote(id: string) {
    const r = requests.value.find(r => r.id === id)
    if (r) { r.votes++; save() }
  }

  function approveRequest(id: string) {
    const r = requests.value.find(r => r.id === id)
    if (r) { r.approved = true; save() }
  }

  function skipRequest(id: string) {
    const r = requests.value.find(r => r.id === id)
    if (r) { r.skipped = true; save() }
  }

  function pinRequest(id: string) {
    // unpin all, then pin the selected one
    requests.value.forEach(r => r.pinned = false)
    const r = requests.value.find(r => r.id === id)
    if (r) { r.pinned = true; save() }
  }

  function clearSkipped() {
    requests.value = requests.value.filter(r => !r.skipped)
    save()
  }

  return { requests, sortedQueue, pendingRequests, addRequest, vote, approveRequest, skipRequest, pinRequest, clearSkipped }
})
