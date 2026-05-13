<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn flat round icon="table_chart" @click="router.push('/')" />
        <q-toolbar-title>
          <span class="cursor-pointer" @click="router.push('/')">CompareTable</span>
        </q-toolbar-title>
        <q-btn flat label="Templates" icon="dashboard" @click="router.push('/templates')" />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>
