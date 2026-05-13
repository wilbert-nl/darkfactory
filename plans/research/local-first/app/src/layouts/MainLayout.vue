<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-dark text-white">
      <q-toolbar>
        <q-btn flat round icon="menu" @click="drawer = !drawer" />
        <q-icon name="lock" size="24px" class="q-mr-sm" />
        <q-toolbar-title>LocalFirst — Privacy Utilities</q-toolbar-title>
        <q-chip color="positive" text-color="white" icon="shield" label="100% Local" />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="drawer" :width="220" bordered class="bg-grey-10 text-white">
      <q-list dark padding>
        <q-item-label header class="text-grey-5 text-caption">TOOLS</q-item-label>
        <q-item
          v-for="tool in tools"
          :key="tool.id"
          clickable
          v-ripple
          :active="activeTool === tool.id"
          active-class="bg-primary text-white"
          @click="activeTool = tool.id; drawer = false"
        >
          <q-item-section avatar>
            <q-icon :name="tool.icon" />
          </q-item-section>
          <q-item-section>{{ tool.label }}</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view :active-tool="activeTool" />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const drawer = ref(true)
const activeTool = ref('password')

const tools = [
  { id: 'password', label: 'Password Generator', icon: 'password' },
  { id: 'notes', label: 'Note Vault', icon: 'note_alt' },
  { id: 'hasher', label: 'File Hasher', icon: 'fingerprint' },
  { id: 'converter', label: 'Unit Converter', icon: 'swap_horiz' }
]
</script>
