<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated :style="{ backgroundColor: tenant?.primaryColor || 'var(--q-primary)' }">
      <q-toolbar>
        <q-btn flat dense round icon="menu" class="lt-md" @click="drawerOpen = !drawerOpen" />
        <q-toolbar-title>
          <router-link to="/" class="text-white text-decoration-none flex items-center gap-2">
            <q-img v-if="tenant?.logoUrl" :src="tenant.logoUrl" style="height: 32px; width: auto; max-width: 120px" fit="contain" />
            <span v-else class="text-h6 text-white">{{ tenant?.name || 'Platform' }}</span>
          </router-link>
        </q-toolbar-title>

        <div class="gt-sm">
          <q-btn flat label="Products" to="/products" class="text-white" />
          <q-btn flat label="Book Now" to="/book" class="text-white" />
          <q-btn flat label="Login" to="/auth/login" class="text-white q-ml-sm" outline />
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="drawerOpen" class="lt-md" :width="240">
      <q-list>
        <q-item clickable to="/products" @click="drawerOpen = false">
          <q-item-section avatar><q-icon name="inventory_2" /></q-item-section>
          <q-item-section>Products</q-item-section>
        </q-item>
        <q-item clickable to="/book" @click="drawerOpen = false">
          <q-item-section avatar><q-icon name="calendar_today" /></q-item-section>
          <q-item-section>Book Now</q-item-section>
        </q-item>
        <q-separator />
        <q-item clickable to="/auth/login" @click="drawerOpen = false">
          <q-item-section avatar><q-icon name="login" /></q-item-section>
          <q-item-section>Login</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer class="bg-grey-9 text-white q-pa-md text-center">
      <div>{{ tenant?.name || 'Platform' }} &copy; {{ new Date().getFullYear() }}</div>
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTenant } from 'src/composables/useTenant'

const { tenant } = useTenant()
const drawerOpen = ref(false)
</script>
