import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  const shareDialogOpen = ref(false)
  const shareUrl = ref('')

  function openShareDialog(url: string): void {
    shareUrl.value = url
    shareDialogOpen.value = true
  }

  function closeShareDialog(): void {
    shareDialogOpen.value = false
    shareUrl.value = ''
  }

  return { shareDialogOpen, shareUrl, openShareDialog, closeShareDialog }
})
