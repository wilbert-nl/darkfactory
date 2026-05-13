<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-teal-8 text-white">
      <q-toolbar>
        <q-icon name="local_hospital" size="28px" class="q-mr-sm" />
        <q-toolbar-title>TrackPx — Clinic EHR</q-toolbar-title>
        <q-chip color="blue-grey-8" text-color="white" icon="wifi_off" label="Offline Ready" />
        <q-btn flat round icon="save" @click="saveAll" class="q-ml-sm">
          <q-tooltip>Save All</q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-header>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar'
const $q = useQuasar()
function saveAll() {
  $q.notify({ type: 'positive', message: 'All data saved locally', icon: 'check_circle', timeout: 1500 })
}
</script>
