<template>
  <q-layout view="lHh Lpr lFf">
    <!-- Impersonation banner -->
    <div v-if="isImpersonating" class="bg-orange text-white q-pa-xs text-center text-caption row items-center justify-center gap-2">
      <q-icon name="warning" />
      Impersonating: <strong>{{ impersonatedTenant?.name }}</strong>
      <q-btn flat dense size="xs" label="End Session" @click="handleEndImpersonation" class="q-ml-sm" />
    </div>

    <q-header elevated class="bg-deep-purple-9">
      <q-toolbar>
        <q-btn flat dense round icon="menu" @click="drawerOpen = !drawerOpen" />
        <q-toolbar-title>
          <span class="text-white">Super Admin Panel</span>
        </q-toolbar-title>
        <q-badge color="orange" label="SUPER ADMIN" class="q-mr-sm" />
        <q-btn flat round dense icon="account_circle" class="text-white">
          <q-menu>
            <q-list style="min-width: 160px">
              <q-item-label header>{{ currentUser?.firstName }} {{ currentUser?.lastName }}</q-item-label>
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

    <q-drawer v-model="drawerOpen" show-if-above :width="220" :breakpoint="700" bordered class="bg-deep-purple-1">
      <q-scroll-area class="fit">
        <div class="q-pa-md text-deep-purple-9">
          <div class="text-h6 text-weight-bold">SuperAdmin</div>
          <div class="text-caption">Platform Management</div>
        </div>
        <q-list padding>
          <q-item clickable to="/superadmin/tenants" active-class="text-deep-purple">
            <q-item-section avatar><q-icon name="business" /></q-item-section>
            <q-item-section>All Tenants</q-item-section>
          </q-item>
          <q-separator class="q-my-sm" />
          <q-item clickable to="/admin/dashboard" active-class="text-deep-purple">
            <q-item-section avatar><q-icon name="arrow_back" /></q-item-section>
            <q-item-section>Back to Admin</q-item-section>
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
import { useAuth } from 'src/composables/useAuth'
import { useAuthStore } from 'src/stores/auth-store'

const { currentUser, logout, isImpersonating, impersonatedTenant } = useAuth()
const authStore = useAuthStore()
const router = useRouter()
const drawerOpen = ref(false)

async function handleLogout() {
  await logout()
  await router.push('/auth/login')
}

function handleEndImpersonation() {
  authStore.endImpersonation()
  void router.push('/superadmin/tenants')
}
</script>
