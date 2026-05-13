import { defineStore } from 'pinia'
import { ref } from 'vue'

const PRO_KEY = 'compare-table-pro'
const FREE_LIMIT = 3

export const useProStore = defineStore('pro', () => {
  const isPro = ref(localStorage.getItem(PRO_KEY) === 'true')

  function enablePro(): void {
    isPro.value = true
    localStorage.setItem(PRO_KEY, 'true')
  }

  function canCreateComparison(currentCount: number): boolean {
    return isPro.value || currentCount < FREE_LIMIT
  }

  return { isPro, enablePro, canCreateComparison, FREE_LIMIT }
})
