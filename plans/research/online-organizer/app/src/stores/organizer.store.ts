import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Task {
  id: string
  title: string
  done: boolean
  dueDate: string
  createdAt: string
}

export interface Habit {
  id: string
  name: string
  icon: string
  streak: number
  logs: string[] // ISO dates
  createdAt: string
}

export interface ScheduleEvent {
  id: string
  title: string
  day: string // 'Mon' | 'Tue' ...
  time: string
  color: string
}

export interface Note {
  id: string
  title: string
  content: string
  updatedAt: string
}

export const useOrganizerStore = defineStore('organizer', () => {
  const tasks = ref<Task[]>(JSON.parse(localStorage.getItem('oo:tasks') || '[]'))
  const habits = ref<Habit[]>(JSON.parse(localStorage.getItem('oo:habits') || '[]'))
  const events = ref<ScheduleEvent[]>(JSON.parse(localStorage.getItem('oo:events') || '[]'))
  const notes = ref<Note[]>(JSON.parse(localStorage.getItem('oo:notes') || '[]'))

  function saveTasks() { localStorage.setItem('oo:tasks', JSON.stringify(tasks.value)) }
  function saveHabits() { localStorage.setItem('oo:habits', JSON.stringify(habits.value)) }
  function saveEvents() { localStorage.setItem('oo:events', JSON.stringify(events.value)) }
  function saveNotes() { localStorage.setItem('oo:notes', JSON.stringify(notes.value)) }

  // Tasks
  function addTask(title: string, dueDate = '') {
    tasks.value.push({ id: crypto.randomUUID(), title, done: false, dueDate, createdAt: new Date().toISOString() })
    saveTasks()
  }
  function toggleTask(id: string) {
    const t = tasks.value.find(t => t.id === id)
    if (t) { t.done = !t.done; saveTasks() }
  }
  function deleteTask(id: string) {
    tasks.value = tasks.value.filter(t => t.id !== id)
    saveTasks()
  }

  // Habits
  function addHabit(name: string, icon = 'star') {
    habits.value.push({ id: crypto.randomUUID(), name, icon, streak: 0, logs: [], createdAt: new Date().toISOString() })
    saveHabits()
  }
  function toggleHabitToday(id: string) {
    const h = habits.value.find(h => h.id === id)
    if (!h) return
    const today = new Date().toISOString().split('T')[0]
    const idx = h.logs.indexOf(today)
    if (idx >= 0) {
      h.logs.splice(idx, 1)
      h.streak = Math.max(0, h.streak - 1)
    } else {
      h.logs.push(today)
      h.streak++
    }
    saveHabits()
  }
  function isHabitDoneToday(id: string) {
    const h = habits.value.find(h => h.id === id)
    if (!h) return false
    return h.logs.includes(new Date().toISOString().split('T')[0])
  }
  function deleteHabit(id: string) {
    habits.value = habits.value.filter(h => h.id !== id)
    saveHabits()
  }

  // Events
  function addEvent(event: Omit<ScheduleEvent, 'id'>) {
    events.value.push({ ...event, id: crypto.randomUUID() })
    saveEvents()
  }
  function deleteEvent(id: string) {
    events.value = events.value.filter(e => e.id !== id)
    saveEvents()
  }

  // Notes
  function addNote(title: string) {
    notes.value.push({ id: crypto.randomUUID(), title, content: '', updatedAt: new Date().toISOString() })
    saveNotes()
  }
  function updateNote(id: string, content: string) {
    const n = notes.value.find(n => n.id === id)
    if (n) { n.content = content; n.updatedAt = new Date().toISOString(); saveNotes() }
  }
  function deleteNote(id: string) {
    notes.value = notes.value.filter(n => n.id !== id)
    saveNotes()
  }

  return {
    tasks, habits, events, notes,
    addTask, toggleTask, deleteTask,
    addHabit, toggleHabitToday, isHabitDoneToday, deleteHabit,
    addEvent, deleteEvent,
    addNote, updateNote, deleteNote
  }
})
