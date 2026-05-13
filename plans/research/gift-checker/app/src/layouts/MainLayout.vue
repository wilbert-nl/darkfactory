<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-pink-7 text-white">
      <q-toolbar>
        <q-icon name="redeem" size="sm" class="q-mr-sm" />
        <q-toolbar-title>GiftChecker — Anti-Duplicate Gift Tracker</q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>
