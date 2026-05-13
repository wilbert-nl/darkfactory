import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface WardrobeItem {
  id: string
  productName: string
  productImage: string
  resultImage: string
  size: string
  savedAt: number
}

export const useWardrobeStore = defineStore('wardrobe', () => {
  const items = ref<WardrobeItem[]>(JSON.parse(localStorage.getItem('fm-wardrobe') || '[]'))

  function save() {
    localStorage.setItem('fm-wardrobe', JSON.stringify(items.value))
  }

  function addItem(item: Omit<WardrobeItem, 'id' | 'savedAt'>) {
    const entry: WardrobeItem = { ...item, id: crypto.randomUUID(), savedAt: Date.now() }
    items.value.unshift(entry)
    save()
    return entry
  }

  function removeItem(id: string) {
    items.value = items.value.filter(i => i.id !== id)
    save()
  }

  return { items, addItem, removeItem }
})
