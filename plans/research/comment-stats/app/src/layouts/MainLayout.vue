<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-icon name="bar_chart" size="28px" class="q-mr-sm" />
        <q-toolbar-title>CommentStats</q-toolbar-title>
        <q-chip color="orange" text-color="white" label="YouTube Analytics" icon="youtube_searched_for" />
      </q-toolbar>
    </q-header>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>
