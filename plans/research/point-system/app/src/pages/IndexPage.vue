<template>
  <q-page class="q-pa-md">
    <!-- View Mode Toggle -->
    <div class="row items-center q-mb-md">
      <q-btn-toggle
        v-model="store.viewMode"
        :options="[{label:'Admin',value:'admin'},{label:'Member',value:'member'}]"
        color="primary"
        text-color="primary"
        toggle-color="primary"
        @update:model-value="store.setViewMode($event)"
      />
    </div>

    <!-- ADMIN VIEW -->
    <div v-if="store.viewMode === 'admin'">
      <div class="text-h5 q-mb-md">Point Actions</div>

      <!-- Add Action -->
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="text-subtitle1 q-mb-sm">New Point Action</div>
          <div class="row q-gutter-sm">
            <q-input v-model="newAction.name" label="Action Name" class="col-12 col-md-4" dense />
            <q-input v-model.number="newAction.points" label="Points Value" type="number" class="col-12 col-md-2" dense />
            <q-input v-model="newAction.description" label="Description" class="col-12 col-md-4" dense />
            <q-btn color="primary" icon="add" label="Add" class="col-auto" @click="addAction" dense />
          </div>
        </q-card-section>
      </q-card>

      <!-- Actions List -->
      <q-list bordered separator>
        <q-item v-for="a in store.actions" :key="a.id">
          <q-item-section avatar>
            <q-avatar color="primary" text-color="white" size="36px">{{ a.points }}</q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ a.name }}</q-item-label>
            <q-item-label caption>{{ a.description }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn flat round icon="delete" size="sm" color="negative" @click="store.removeAction(a.id)" />
          </q-item-section>
        </q-item>
      </q-list>

      <!-- Leaderboard Preview -->
      <div class="text-h6 q-mt-lg q-mb-sm">Leaderboard</div>
      <q-list bordered>
        <q-item v-for="(m, i) in store.leaderboard" :key="m.id">
          <q-item-section avatar>
            <q-badge :color="i === 0 ? 'amber-7' : i === 1 ? 'grey-5' : i === 2 ? 'brown-5' : 'grey-3'" :label="String(i + 1)" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ m.name }}</q-item-label>
            <q-item-label caption>{{ m.badges.join(', ') || 'No badges yet' }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <div class="text-weight-bold">{{ m.totalPoints }} pts</div>
            <div class="text-caption" :class="`text-${store.getLevel(m.totalPoints).color}`">{{ store.getLevel(m.totalPoints).name }}</div>
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <!-- MEMBER VIEW -->
    <div v-else>
      <!-- My Stats -->
      <div class="row q-gutter-md q-mb-md">
        <q-card class="bg-primary text-white col-auto q-pa-sm">
          <div class="text-caption">My Points</div>
          <div class="text-h4">{{ store.myMember?.totalPoints || 0 }}</div>
          <div class="text-caption" v-if="store.myMember">{{ store.getLevel(store.myMember.totalPoints).name }} Level</div>
        </q-card>
        <q-card class="col-auto q-pa-sm">
          <div class="text-caption">My Badges</div>
          <div class="row q-gutter-xs q-mt-xs">
            <q-badge v-for="b in store.myMember?.badges" :key="b" color="amber-7" :label="b" />
            <span v-if="!store.myMember?.badges?.length" class="text-grey text-caption">Earn points to get badges!</span>
          </div>
        </q-card>
      </div>

      <!-- Level progress -->
      <div class="q-mb-md">
        <div class="text-subtitle2 q-mb-xs">Level Progress</div>
        <div class="row q-gutter-xs">
          <q-badge v-for="lv in store.levels" :key="lv.name" :color="(store.myMember?.totalPoints || 0) >= lv.min ? lv.color : 'grey-3'" :label="lv.name + ' (' + lv.min + '+)'" />
        </div>
      </div>

      <q-tabs v-model="memberTab" class="q-mb-md" indicator-color="primary">
        <q-tab name="actions" label="Available Actions" />
        <q-tab name="leaderboard" label="Leaderboard" />
        <q-tab name="history" label="My History" />
      </q-tabs>

      <!-- Available Actions -->
      <div v-if="memberTab === 'actions'">
        <q-list bordered separator>
          <q-item v-for="a in store.actions" :key="a.id">
            <q-item-section avatar>
              <q-avatar color="positive" text-color="white" size="40px">+{{ a.points }}</q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ a.name }}</q-item-label>
              <q-item-label caption>{{ a.description }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn color="positive" label="Claim" size="sm" @click="claim(a.id)" />
            </q-item-section>
          </q-item>
        </q-list>
      </div>

      <!-- Leaderboard -->
      <div v-if="memberTab === 'leaderboard'">
        <q-list bordered>
          <q-item v-for="(m, i) in store.leaderboard" :key="m.id" :class="m.id === 'me' ? 'bg-blue-1' : ''">
            <q-item-section avatar>
              <div class="text-h6">{{ i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1 }}</div>
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ m.name }} {{ m.id === 'me' ? '(You)' : '' }}</q-item-label>
              <q-item-label caption>{{ store.getLevel(m.totalPoints).name }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <div class="text-weight-bold text-primary">{{ m.totalPoints }} pts</div>
            </q-item-section>
          </q-item>
        </q-list>
      </div>

      <!-- History -->
      <div v-if="memberTab === 'history'">
        <div v-if="!myHistory.length" class="text-grey">No history yet. Claim some actions!</div>
        <q-list bordered separator>
          <q-item v-for="h in myHistory" :key="h.id">
            <q-item-section avatar>
              <q-icon name="star" color="amber-7" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ h.actionName }}</q-item-label>
              <q-item-label caption>{{ new Date(h.at).toLocaleString() }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <span class="text-positive text-weight-bold">+{{ h.points }} pts</span>
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { usePointsStore } from 'src/stores/points'
import { useQuasar } from 'quasar'

const store = usePointsStore()
const $q = useQuasar()
const memberTab = ref('actions')

const newAction = reactive({ name: '', points: 10, description: '' })

const myHistory = computed(() => store.history.filter(h => h.memberId === 'me'))

function addAction() {
  if (!newAction.name.trim()) return
  store.addAction(newAction.name, newAction.points, newAction.description)
  Object.assign(newAction, { name: '', points: 10, description: '' })
}

function claim(actionId: string) {
  store.claimPoints(actionId)
  const action = store.actions.find(a => a.id === actionId)
  $q.notify({ color: 'positive', message: `+${action?.points} points claimed!`, icon: 'star' })
}
</script>
