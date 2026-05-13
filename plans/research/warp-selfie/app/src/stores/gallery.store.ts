import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Composite {
  id: string
  selfie: string
  destination: string
  result: string
  createdAt: number
}

export const useGalleryStore = defineStore('gallery', () => {
  const composites = ref<Composite[]>(JSON.parse(localStorage.getItem('ws-gallery') || '[]'))

  function save() {
    localStorage.setItem('ws-gallery', JSON.stringify(composites.value))
  }

  function addComposite(destination: string): Composite {
    const id = crypto.randomUUID()
    const c: Composite = {
      id,
      selfie: '',
      destination,
      result: `https://picsum.photos/seed/${id}/400/500`,
      createdAt: Date.now()
    }
    composites.value.unshift(c)
    save()
    return c
  }

  return { composites, addComposite }
})
