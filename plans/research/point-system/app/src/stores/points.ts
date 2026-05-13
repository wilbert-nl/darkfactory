import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type ViewMode = 'admin' | 'member'

export interface PointAction {
  id: string
  name: string
  points: number
  description: string
}

export interface HistoryEntry {
  id: string
  memberId: string
  actionId: string
  actionName: string
  points: number
  at: number
}

export interface Member {
  id: string
  name: string
  totalPoints: number
  badges: string[]
}

const LEVELS = [
  { name: 'Bronze', min: 0, color: 'brown-5' },
  { name: 'Silver', min: 200, color: 'grey-5' },
  { name: 'Gold', min: 500, color: 'amber-7' },
  { name: 'Platinum', min: 1000, color: 'blue-grey-5' }
]

const STORAGE_KEY = 'pointsystem-data'

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') } catch { return {} }
}

export const usePointsStore = defineStore('points', () => {
  const stored = load()
  const viewMode = ref<ViewMode>(stored.viewMode || 'admin')
  const actions = ref<PointAction[]>(stored.actions || [
    { id: '1', name: 'Post Content', points: 10, description: 'Share a post in the community' },
    { id: '2', name: 'Comment', points: 5, description: 'Leave a comment on a post' },
    { id: '3', name: 'Refer a Friend', points: 50, description: 'Invite someone who joins' },
    { id: '4', name: 'Daily Login', points: 2, description: 'Log in to the platform' },
  ])
  const members = ref<Member[]>(stored.members || [
    { id: 'me', name: 'You', totalPoints: 0, badges: [] },
    { id: 'alice', name: 'Alice', totalPoints: 320, badges: ['Early Adopter'] },
    { id: 'bob', name: 'Bob', totalPoints: 150, badges: [] },
    { id: 'charlie', name: 'Charlie', totalPoints: 780, badges: ['Power User', 'Referrer'] },
  ])
  const history = ref<HistoryEntry[]>(stored.history || [])

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ viewMode: viewMode.value, actions: actions.value, members: members.value, history: history.value }))
  }

  function setViewMode(m: ViewMode) { viewMode.value = m; save() }

  function addAction(name: string, points: number, description: string) {
    actions.value.push({ id: crypto.randomUUID(), name, points, description })
    save()
  }

  function removeAction(id: string) {
    actions.value = actions.value.filter(a => a.id !== id)
    save()
  }

  function claimPoints(actionId: string) {
    const action = actions.value.find(a => a.id === actionId)
    const me = members.value.find(m => m.id === 'me')
    if (!action || !me) return
    me.totalPoints += action.points
    history.value.unshift({ id: crypto.randomUUID(), memberId: 'me', actionId, actionName: action.name, points: action.points, at: Date.now() })
    // Add badges
    const level = getLevel(me.totalPoints)
    if (!me.badges.includes(level.name)) { me.badges.push(level.name) }
    save()
  }

  function getLevel(points: number) {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (points >= LEVELS[i].min) return LEVELS[i]
    }
    return LEVELS[0]
  }

  const leaderboard = computed(() => [...members.value].sort((a, b) => b.totalPoints - a.totalPoints))
  const myMember = computed(() => members.value.find(m => m.id === 'me')!)
  const levels = LEVELS

  return { viewMode, actions, members, history, leaderboard, myMember, levels, setViewMode, addAction, removeAction, claimPoints, getLevel }
})
