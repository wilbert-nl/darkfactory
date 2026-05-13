<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-icon name="favorite" size="sm" class="q-mr-sm" />
        <q-toolbar-title>AnimeWedding</q-toolbar-title>
        <q-chip color="accent" text-color="white" size="sm">Beta</q-chip>
      </q-toolbar>
    </q-header>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>
