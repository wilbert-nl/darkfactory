<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-icon name="checkroom" size="sm" class="q-mr-sm" />
        <q-toolbar-title>FitMe — Virtual Try-On</q-toolbar-title>
        <q-chip color="purple" text-color="white" size="sm">3 free/day</q-chip>
      </q-toolbar>
    </q-header>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>
