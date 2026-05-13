<script setup lang="ts">
import { ref } from 'vue'
import { useQueueStore } from 'src/stores/queue.store'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const store = useQueueStore()

const activeView = ref<'audience' | 'dj'>('audience')

// Audience form
const songForm = ref({ song: '', artist: '', requester: '' })

function submitRequest() {
  if (!songForm.value.song.trim() || !songForm.value.artist.trim()) {
    $q.notify({ type: 'negative', message: 'Please enter song and artist name' })
    return
  }
  store.addRequest(songForm.value.song.trim(), songForm.value.artist.trim(), songForm.value.requester.trim() || 'Anonymous')
  $q.notify({ type: 'positive', message: 'Song requested! Vote for it in the queue.' })
  songForm.value = { song: '', artist: '', requester: '' }
}

// Track user votes (per session)
const userVotes = ref<Set<string>>(new Set())
function voteForSong(id: string) {
  if (userVotes.value.has(id)) {
    $q.notify({ message: 'You already voted for this song!', type: 'warning', timeout: 1500 })
    return
  }
  store.vote(id)
  userVotes.value.add(id)
  $q.notify({ type: 'positive', message: 'Vote cast!', timeout: 1000 })
}
</script>

<template>
  <q-page class="q-pa-none">
    <!-- View Toggle -->
    <div class="row bg-grey-2 q-pa-sm q-gutter-sm justify-center">
      <q-btn
        :outline="activeView !== 'audience'"
        :color="activeView === 'audience' ? 'primary' : 'grey'"
        label="Audience View"
        icon="people"
        @click="activeView = 'audience'"
        dense
      />
      <q-btn
        :outline="activeView !== 'dj'"
        :color="activeView === 'dj' ? 'accent' : 'grey'"
        label="DJ Dashboard"
        icon="headphones"
        @click="activeView = 'dj'"
        dense
      />
    </div>

    <!-- AUDIENCE VIEW -->
    <div v-if="activeView === 'audience'" class="q-pa-md">
      <!-- Request Form -->
      <q-card class="q-mb-md" flat bordered>
        <q-card-section>
          <div class="text-h6 q-mb-sm">
            <q-icon name="music_note" class="q-mr-xs" />Request a Song
          </div>
          <div class="column q-gutter-sm">
            <q-input v-model="songForm.song" label="Song Name *" outlined dense placeholder="e.g. Bohemian Rhapsody" />
            <q-input v-model="songForm.artist" label="Artist *" outlined dense placeholder="e.g. Queen" />
            <q-input v-model="songForm.requester" label="Your Name (optional)" outlined dense placeholder="Anonymous" />
            <q-btn color="primary" label="Submit Request" icon="send" @click="submitRequest" />
          </div>
        </q-card-section>
      </q-card>

      <!-- Live Queue -->
      <div class="text-h6 q-mb-sm">
        <q-icon name="queue_music" class="q-mr-xs" />Live Queue
        <q-badge :label="store.sortedQueue.length" color="primary" class="q-ml-sm" />
      </div>

      <div v-if="store.sortedQueue.length === 0" class="text-grey text-center q-mt-lg">
        <q-icon name="music_off" size="48px" /><br />
        No songs in queue yet. Be the first to request!
      </div>

      <q-list bordered separator class="rounded-borders">
        <q-item v-for="(req, idx) in store.sortedQueue" :key="req.id">
          <q-item-section avatar>
            <div class="text-h6 text-grey text-center" style="width:32px">
              <q-icon v-if="req.pinned" name="push_pin" color="orange" />
              <span v-else>{{ idx + 1 }}</span>
            </div>
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-weight-bold">{{ req.song }}</q-item-label>
            <q-item-label caption>{{ req.artist }} · requested by {{ req.requester }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <div class="column items-center">
              <q-btn
                round
                :color="userVotes.has(req.id) ? 'positive' : 'primary'"
                :icon="userVotes.has(req.id) ? 'thumb_up' : 'thumb_up_off_alt'"
                dense
                @click="voteForSong(req.id)"
              />
              <div class="text-weight-bold text-center q-mt-xs">{{ req.votes }}</div>
            </div>
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <!-- DJ DASHBOARD -->
    <div v-if="activeView === 'dj'" class="q-pa-md">
      <div class="text-h6 q-mb-md">
        <q-icon name="dashboard" class="q-mr-xs" />DJ Dashboard
      </div>

      <!-- Pending Approvals -->
      <div class="text-subtitle1 text-weight-bold q-mb-sm">
        Pending Requests
        <q-badge :label="store.pendingRequests.length" color="orange" class="q-ml-xs" />
      </div>

      <div v-if="store.pendingRequests.length === 0" class="text-grey q-mb-md">
        No pending requests
      </div>

      <q-list bordered separator class="rounded-borders q-mb-md">
        <q-item v-for="req in store.pendingRequests" :key="req.id">
          <q-item-section>
            <q-item-label class="text-weight-bold">{{ req.song }}</q-item-label>
            <q-item-label caption>{{ req.artist }} · by {{ req.requester }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <div class="row q-gutter-xs">
              <q-btn
                dense round icon="check" color="positive" size="sm"
                @click="store.approveRequest(req.id)"
              >
                <q-tooltip>Approve</q-tooltip>
              </q-btn>
              <q-btn
                dense round icon="close" color="negative" size="sm"
                @click="store.skipRequest(req.id)"
              >
                <q-tooltip>Reject</q-tooltip>
              </q-btn>
            </div>
          </q-item-section>
        </q-item>
      </q-list>

      <!-- Queue Management -->
      <div class="row items-center justify-between q-mb-sm">
        <div class="text-subtitle1 text-weight-bold">
          Approved Queue
          <q-badge :label="store.sortedQueue.length" color="primary" class="q-ml-xs" />
        </div>
        <q-btn flat dense color="negative" label="Clear Skipped" icon="delete_sweep" @click="store.clearSkipped()" />
      </div>

      <q-list bordered separator class="rounded-borders">
        <q-item v-for="(req, idx) in store.sortedQueue" :key="req.id">
          <q-item-section avatar>
            <div class="text-h6 text-grey text-center" style="width:28px">
              <q-icon v-if="req.pinned" name="push_pin" color="orange" />
              <span v-else>{{ idx + 1 }}</span>
            </div>
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-weight-bold">{{ req.song }}</q-item-label>
            <q-item-label caption>{{ req.artist }} · by {{ req.requester }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <div class="row items-center q-gutter-xs">
              <div class="column items-center">
                <q-icon name="thumb_up" color="primary" size="16px" />
                <span class="text-caption text-weight-bold">{{ req.votes }}</span>
              </div>
              <q-btn
                dense round :icon="req.pinned ? 'push_pin' : 'push_pin'" size="sm"
                :color="req.pinned ? 'orange' : 'grey'"
                @click="store.pinRequest(req.id)"
              >
                <q-tooltip>{{ req.pinned ? 'Unpin' : 'Pin to top' }}</q-tooltip>
              </q-btn>
              <q-btn
                dense round icon="skip_next" color="grey" size="sm"
                @click="store.skipRequest(req.id)"
              >
                <q-tooltip>Skip</q-tooltip>
              </q-btn>
            </div>
          </q-item-section>
        </q-item>
        <q-item v-if="store.sortedQueue.length === 0">
          <q-item-section class="text-grey text-center">No songs in queue</q-item-section>
        </q-item>
      </q-list>
    </div>
  </q-page>
</template>
