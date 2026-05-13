import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface ProCon {
  id: string
  text: string
  weight: number
  type: 'pro' | 'con'
}

export interface Decision {
  id: string
  name: string
  context: string
  items: ProCon[]
  createdAt: number
}

export const useDecisionsStore = defineStore('decisions', () => {
  const decisions = ref<Decision[]>(JSON.parse(localStorage.getItem('proconaid-decisions') || '[]'))

  function save() {
    localStorage.setItem('proconaid-decisions', JSON.stringify(decisions.value))
  }

  function addDecision(name: string, context: string): Decision {
    const d: Decision = { id: crypto.randomUUID(), name, context, items: [], createdAt: Date.now() }
    decisions.value.unshift(d)
    save()
    return d
  }

  function deleteDecision(id: string) {
    decisions.value = decisions.value.filter(d => d.id !== id)
    save()
  }

  function addItem(decisionId: string, text: string, weight: number, type: 'pro' | 'con') {
    const d = decisions.value.find(d => d.id === decisionId)
    if (!d) return
    d.items.push({ id: crypto.randomUUID(), text, weight, type })
    save()
  }

  function removeItem(decisionId: string, itemId: string) {
    const d = decisions.value.find(d => d.id === decisionId)
    if (!d) return
    d.items = d.items.filter(i => i.id !== itemId)
    save()
  }

  function proScore(decision: Decision): number {
    const pros = decision.items.filter(i => i.type === 'pro')
    return pros.reduce((acc, i) => acc + i.weight, 0)
  }

  function conScore(decision: Decision): number {
    const cons = decision.items.filter(i => i.type === 'con')
    return cons.reduce((acc, i) => acc + i.weight, 0)
  }

  return { decisions, addDecision, deleteDecision, addItem, removeItem, proScore, conScore }
})
