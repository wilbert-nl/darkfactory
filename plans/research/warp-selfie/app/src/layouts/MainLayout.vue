<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-icon name="travel_explore" size="sm" class="q-mr-sm" />
        <q-toolbar-title>WarpSelfie</q-toolbar-title>
        <q-chip color="orange" text-color="white" size="sm">5 Free Credits</q-chip>
      </q-toolbar>
    </q-header>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>
