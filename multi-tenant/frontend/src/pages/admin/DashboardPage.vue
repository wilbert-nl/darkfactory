<template>
  <q-page padding>
    <div class="text-h5 q-mb-lg">Dashboard</div>

    <!-- Stat Cards -->
    <div class="row q-col-gutter-md q-mb-xl">
      <div
        v-for="stat in stats"
        :key="stat.key"
        class="col-6 col-md-3"
      >
        <q-card flat bordered class="full-height">
          <q-card-section class="column items-center text-center q-pa-lg">
            <template v-if="loading">
              <q-skeleton type="circle" size="48px" class="q-mb-md" />
              <q-skeleton type="text" width="60px" class="q-mb-sm" style="font-size: 2rem" />
              <q-skeleton type="text" width="80px" />
            </template>
            <template v-else>
              <q-icon
                :name="stat.icon"
                size="48px"
                :color="stat.color"
                class="q-mb-md"
              />
              <div class="text-h4 text-weight-bold">
                {{ stat.value !== null ? stat.value : '-' }}
              </div>
              <div class="text-caption text-grey-6 text-uppercase letter-spacing-wide">
                {{ stat.label }}
              </div>
            </template>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="text-subtitle1 text-weight-medium q-mb-md">Quick Actions</div>
    <div class="row q-gutter-sm">
      <q-btn
        outline
        label="Add Product"
        icon="add"
        color="primary"
        :to="{ path: '/admin/products' }"
        no-caps
      />
      <q-btn
        outline
        label="New Reservation"
        icon="event"
        color="secondary"
        :to="{ path: '/admin/reservations' }"
        no-caps
      />
      <q-btn
        outline
        label="Invite User"
        icon="person_add"
        color="accent"
        :to="{ path: '/admin/users' }"
        no-caps
      />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { productsService } from 'src/services/products.service'
import { reservationsService } from 'src/services/reservations.service'
import { ordersService } from 'src/services/orders.service'
import { usersService } from 'src/services/users.service'

interface StatCard {
  key: string
  label: string
  icon: string
  color: string
  value: number | null
}

const loading = ref(true)

const stats = ref<StatCard[]>([
  { key: 'products', label: 'Products', icon: 'inventory_2', color: 'primary', value: null },
  { key: 'reservations', label: 'Reservations', icon: 'event', color: 'secondary', value: null },
  { key: 'orders', label: 'Orders', icon: 'receipt_long', color: 'positive', value: null },
  { key: 'users', label: 'Users', icon: 'group', color: 'accent', value: null },
])

onMounted(async () => {
  loading.value = true

  const results = await Promise.allSettled([
    productsService.list({ limit: 1 }),
    reservationsService.list({ limit: 1 }),
    ordersService.list({ limit: 1 }),
    usersService.list({ limit: 1 }),
  ])

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      stats.value[index]!.value = result.value.total ?? 0
    }
    // On rejection, value stays null → renders as '-'
  })

  loading.value = false
})
</script>
