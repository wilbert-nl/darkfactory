<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-orange-8 text-white">
      <q-toolbar>
        <q-icon name="storefront" size="sm" class="q-mr-sm" />
        <q-toolbar-title>WeBuy — Classifieds with AI Condition Grading</q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>
