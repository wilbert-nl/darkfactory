<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated :style="{ backgroundColor: tenant?.primaryColor || 'var(--q-primary)' }">
      <q-toolbar>
        <q-btn flat dense round icon="menu" @click="drawerOpen = !drawerOpen" />
        <q-toolbar-title>
          <span class="text-white">{{ tenant?.name || 'Admin' }}</span>
        </q-toolbar-title>

        <q-btn flat round dense icon="account_circle" class="text-white">
          <q-menu>
            <q-list style="min-width: 160px">
              <q-item-label header>{{ currentUser?.firstName }} {{ currentUser?.lastName }}</q-item-label>
              <q-item-label caption class="q-px-md">{{ currentUser?.email }}</q-item-label>
              <q-separator />
              <q-item clickable @click="handleLogout">
                <q-item-section avatar><q-icon name="logout" /></q-item-section>
                <q-item-section>Logout</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="drawerOpen" show-if-above :width="220" :breakpoint="700" bordered>
      <q-scroll-area class="fit">
        <div class="q-pa-md">
          <q-img v-if="tenant?.logoUrl" :src="tenant.logoUrl" style="height: 40px; width: auto; max-width: 140px" fit="contain" class="q-mb-md" />
          <div v-else class="text-h6 q-mb-md text-weight-bold">{{ tenant?.name }}</div>
        </div>
        <q-list padding>
          <q-item clickable to="/admin/dashboard" active-class="text-primary">
            <q-item-section avatar><q-icon name="dashboard" /></q-item-section>
            <q-item-section>Dashboard</q-item-section>
          </q-item>
          <q-item clickable to="/admin/users" active-class="text-primary">
            <q-item-section avatar><q-icon name="group" /></q-item-section>
            <q-item-section>Users</q-item-section>
          </q-item>
          <q-item clickable to="/admin/products" active-class="text-primary">
            <q-item-section avatar><q-icon name="inventory_2" /></q-item-section>
            <q-item-section>Products</q-item-section>
          </q-item>
          <q-item clickable to="/admin/reservations" active-class="text-primary">
            <q-item-section avatar><q-icon name="event" /></q-item-section>
            <q-item-section>Reservations</q-item-section>
          </q-item>
          <q-item clickable to="/admin/orders" active-class="text-primary">
            <q-item-section avatar><q-icon name="receipt_long" /></q-item-section>
            <q-item-section>Orders</q-item-section>
          </q-item>
          <q-separator class="q-my-sm" />
          <q-item clickable to="/admin/settings" active-class="text-primary">
            <q-item-section avatar><q-icon name="settings" /></q-item-section>
            <q-item-section>Settings</q-item-section>
          </q-item>
          <q-item v-if="isSuperAdmin" clickable to="/superadmin/tenants" active-class="text-primary">
            <q-item-section avatar><q-icon name="admin_panel_settings" /></q-item-section>
            <q-item-section>Super Admin</q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTenant } from 'src/composables/useTenant'
import { useAuth } from 'src/composables/useAuth'

const { tenant } = useTenant()
const { currentUser, logout, isSuperAdmin } = useAuth()
const router = useRouter()
const drawerOpen = ref(false)

async function handleLogout() {
  await logout()
  await router.push('/auth/login')
}
</script>
