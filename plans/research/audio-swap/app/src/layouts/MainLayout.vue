<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-icon name="swap_horiz" size="sm" class="q-mr-sm" />
        <q-toolbar-title>AudioSwap</q-toolbar-title>
        <q-chip color="teal" text-color="white" size="sm">Free</q-chip>
      </q-toolbar>
    </q-header>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>
