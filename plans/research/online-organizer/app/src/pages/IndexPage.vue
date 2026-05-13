<script setup lang="ts">
import { ref } from 'vue'
import { useOrganizerStore } from 'src/stores/organizer.store'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const store = useOrganizerStore()

const activeTab = ref('tasks')

// Tasks
const newTaskTitle = ref('')
const newTaskDue = ref('')
function addTask() {
  if (!newTaskTitle.value.trim()) return
  store.addTask(newTaskTitle.value.trim(), newTaskDue.value)
  newTaskTitle.value = ''
  newTaskDue.value = ''
}

// Habits
const newHabitName = ref('')
const habitIcons = ['star', 'water_drop', 'fitness_center', 'book', 'bedtime', 'directions_run', 'self_improvement', 'eco']
const selectedHabitIcon = ref('star')
function addHabit() {
  if (!newHabitName.value.trim()) return
  store.addHabit(newHabitName.value.trim(), selectedHabitIcon.value)
  newHabitName.value = ''
}

// Schedule
const showEventDialog = ref(false)
const newEvent = ref({ title: '', day: 'Mon', time: '09:00', color: 'primary' })
const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const eventColors = [
  { label: 'Blue', value: 'primary' },
  { label: 'Teal', value: 'secondary' },
  { label: 'Purple', value: 'accent' },
  { label: 'Green', value: 'positive' },
  { label: 'Orange', value: 'warning' }
]
function addEvent() {
  if (!newEvent.value.title.trim()) return
  store.addEvent({ ...newEvent.value })
  showEventDialog.value = false
  newEvent.value = { title: '', day: 'Mon', time: '09:00', color: 'primary' }
}
function eventsForDay(day: string) {
  return store.events.filter(e => e.day === day).sort((a, b) => a.time.localeCompare(b.time))
}

// Notes
const newNoteTitle = ref('')
const selectedNote = ref<string | null>(null)
const editContent = ref('')
function addNote() {
  if (!newNoteTitle.value.trim()) return
  store.addNote(newNoteTitle.value.trim())
  newNoteTitle.value = ''
}
function selectNote(id: string) {
  selectedNote.value = id
  const note = store.notes.find(n => n.id === id)
  editContent.value = note?.content || ''
}
function saveNote() {
  if (selectedNote.value) {
    store.updateNote(selectedNote.value, editContent.value)
    $q.notify({ type: 'positive', message: 'Note saved', timeout: 1500 })
  }
}
</script>

<template>
  <q-page class="q-pa-none">
    <q-tabs v-model="activeTab" align="justify" class="bg-white shadow-1 text-primary">
      <q-tab name="tasks" icon="check_circle" label="Tasks" />
      <q-tab name="habits" icon="local_fire_department" label="Habits" />
      <q-tab name="schedule" icon="calendar_month" label="Schedule" />
      <q-tab name="notes" icon="note" label="Notes" />
    </q-tabs>

    <q-tab-panels v-model="activeTab" animated class="q-pa-md">

      <!-- TASKS TAB -->
      <q-tab-panel name="tasks">
        <div class="row q-gutter-sm q-mb-md">
          <q-input
            v-model="newTaskTitle"
            outlined
            dense
            placeholder="Add a task..."
            class="col"
            @keyup.enter="addTask"
          />
          <q-input v-model="newTaskDue" type="date" outlined dense class="col-auto" />
          <q-btn color="primary" icon="add" dense @click="addTask" />
        </div>

        <div v-if="store.tasks.length === 0" class="text-grey text-center q-mt-lg">
          <q-icon name="check_circle_outline" size="48px" /><br />
          No tasks yet. Add one above!
        </div>

        <q-list separator>
          <q-item
            v-for="task in store.tasks"
            :key="task.id"
            :class="task.done ? 'text-grey' : ''"
            dense
          >
            <q-item-section avatar>
              <q-checkbox :model-value="task.done" @update:model-value="store.toggleTask(task.id)" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label :class="task.done ? 'text-strike' : ''">{{ task.title }}</q-item-label>
              <q-item-label v-if="task.dueDate" caption class="text-grey">Due: {{ task.dueDate }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn flat dense icon="delete" color="negative" size="sm" @click="store.deleteTask(task.id)" />
            </q-item-section>
          </q-item>
        </q-list>
      </q-tab-panel>

      <!-- HABITS TAB -->
      <q-tab-panel name="habits">
        <div class="row q-gutter-sm q-mb-md items-center">
          <q-input
            v-model="newHabitName"
            outlined
            dense
            placeholder="New habit..."
            class="col"
            @keyup.enter="addHabit"
          />
          <div class="row q-gutter-xs">
            <q-btn
              v-for="icon in habitIcons"
              :key="icon"
              :icon="icon"
              dense
              flat
              round
              :color="selectedHabitIcon === icon ? 'primary' : 'grey'"
              @click="selectedHabitIcon = icon"
              size="sm"
            />
          </div>
          <q-btn color="primary" icon="add" dense @click="addHabit" />
        </div>

        <div v-if="store.habits.length === 0" class="text-grey text-center q-mt-lg">
          <q-icon name="repeat" size="48px" /><br />
          No habits yet. Add one above!
        </div>

        <q-list separator>
          <q-item v-for="habit in store.habits" :key="habit.id">
            <q-item-section avatar>
              <q-icon :name="habit.icon" :color="store.isHabitDoneToday(habit.id) ? 'positive' : 'grey'" size="28px" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ habit.name }}</q-item-label>
              <q-item-label caption>
                <q-icon name="local_fire_department" color="orange" size="14px" />
                {{ habit.streak }} day streak
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <div class="row items-center q-gutter-xs">
                <q-btn
                  :color="store.isHabitDoneToday(habit.id) ? 'positive' : 'grey'"
                  :icon="store.isHabitDoneToday(habit.id) ? 'check_circle' : 'radio_button_unchecked'"
                  round
                  dense
                  flat
                  @click="store.toggleHabitToday(habit.id)"
                />
                <q-btn flat dense icon="delete" color="negative" size="sm" @click="store.deleteHabit(habit.id)" />
              </div>
            </q-item-section>
          </q-item>
        </q-list>
      </q-tab-panel>

      <!-- SCHEDULE TAB -->
      <q-tab-panel name="schedule">
        <div class="row justify-end q-mb-md">
          <q-btn color="primary" icon="add" label="Add Event" @click="showEventDialog = true" />
        </div>

        <div class="row q-gutter-sm">
          <div v-for="day in weekDays" :key="day" class="col">
            <div class="text-weight-bold text-center text-caption text-primary q-mb-xs">{{ day }}</div>
            <div v-if="eventsForDay(day).length === 0" class="text-grey text-caption text-center">—</div>
            <q-card
              v-for="evt in eventsForDay(day)"
              :key="evt.id"
              flat
              bordered
              class="q-mb-xs"
              :class="`bg-${evt.color}-1`"
            >
              <q-card-section class="q-pa-xs">
                <div class="text-caption text-weight-bold">{{ evt.time }}</div>
                <div class="text-caption">{{ evt.title }}</div>
                <q-btn
                  flat dense icon="close" size="xs" color="negative"
                  @click="store.deleteEvent(evt.id)"
                  class="float-right"
                  style="margin-top:-4px"
                />
              </q-card-section>
            </q-card>
          </div>
        </div>

        <q-dialog v-model="showEventDialog">
          <q-card style="min-width: 300px">
            <q-card-section class="bg-primary text-white"><div class="text-h6">New Event</div></q-card-section>
            <q-card-section class="q-gutter-sm">
              <q-input v-model="newEvent.title" label="Title" outlined dense />
              <div class="row q-gutter-sm">
                <q-select
                  v-model="newEvent.day"
                  :options="weekDays"
                  label="Day"
                  outlined dense class="col"
                />
                <q-input v-model="newEvent.time" type="time" label="Time" outlined dense class="col" />
              </div>
              <q-select
                v-model="newEvent.color"
                :options="eventColors"
                label="Color"
                outlined dense emit-value map-options
              />
            </q-card-section>
            <q-card-actions align="right">
              <q-btn flat label="Cancel" v-close-popup />
              <q-btn color="primary" label="Add" @click="addEvent" />
            </q-card-actions>
          </q-card>
        </q-dialog>
      </q-tab-panel>

      <!-- NOTES TAB -->
      <q-tab-panel name="notes">
        <div class="row q-gutter-md" style="height: calc(100vh - 200px)">
          <!-- Notes list -->
          <div class="col-4">
            <div class="row q-gutter-sm q-mb-md">
              <q-input
                v-model="newNoteTitle"
                outlined dense
                placeholder="New note title..."
                class="col"
                @keyup.enter="addNote"
              />
              <q-btn color="primary" icon="add" dense @click="addNote" />
            </div>
            <q-list bordered separator>
              <q-item
                v-for="note in store.notes"
                :key="note.id"
                clickable
                :active="selectedNote === note.id"
                active-class="bg-blue-1"
                @click="selectNote(note.id)"
              >
                <q-item-section>
                  <q-item-label>{{ note.title }}</q-item-label>
                  <q-item-label caption>{{ new Date(note.updatedAt).toLocaleDateString() }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn flat dense icon="delete" size="sm" color="negative" @click.stop="store.deleteNote(note.id); selectedNote = null" />
                </q-item-section>
              </q-item>
              <q-item v-if="store.notes.length === 0">
                <q-item-section class="text-grey text-center">No notes yet</q-item-section>
              </q-item>
            </q-list>
          </div>

          <!-- Note editor -->
          <div class="col">
            <div v-if="!selectedNote" class="column items-center justify-center full-height text-grey">
              <q-icon name="edit_note" size="48px" />
              <div>Select a note to edit</div>
            </div>
            <div v-else class="column full-height">
              <q-input
                v-model="editContent"
                type="textarea"
                outlined
                class="col"
                style="font-family: monospace"
                placeholder="Start writing..."
                @blur="saveNote"
              />
              <q-btn color="primary" label="Save" icon="save" class="q-mt-sm self-end" @click="saveNote" />
            </div>
          </div>
        </div>
      </q-tab-panel>

    </q-tab-panels>
  </q-page>
</template>
