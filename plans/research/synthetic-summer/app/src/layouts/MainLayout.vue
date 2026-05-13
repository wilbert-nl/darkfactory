<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated style="background: linear-gradient(135deg, #ff8f00, #f57c00)" class="text-white">
      <q-toolbar>
        <q-icon name="wb_sunny" size="sm" class="q-mr-sm" />
        <q-toolbar-title>SyntheticSummer</q-toolbar-title>
        <q-chip color="yellow-8" text-color="dark" size="sm">Wellness</q-chip>
      </q-toolbar>
    </q-header>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>
