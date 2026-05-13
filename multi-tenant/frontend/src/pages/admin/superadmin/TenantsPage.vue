<template>
  <q-page class="q-pa-md">
    <!-- Header -->
    <div class="row items-center q-mb-lg">
      <div class="col">
        <div class="text-h4 text-weight-bold">Tenants</div>
        <div class="text-subtitle2 text-grey-6">Manage all tenants in the system</div>
      </div>
      <div class="col-auto">
        <q-btn
          color="primary"
          label="New Tenant"
          icon="add"
          unelevated
          @click="openCreateDialog"
        />
      </div>
    </div>

    <!-- Filters -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-sm-6 col-md-4">
        <q-input
          v-model="filters.search"
          outlined
          dense
          placeholder="Search by name or slug..."
          clearable
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
      <div class="col-12 col-sm-4 col-md-3">
        <q-select
          v-model="filters.status"
          outlined
          dense
          clearable
          label="Status"
          :options="statusOptions"
          emit-value
          map-options
        />
      </div>
    </div>

    <!-- Table -->
    <q-table
      :rows="filteredTenants"
      :columns="columns"
      :loading="loading"
      row-key="id"
      flat
      bordered
      :rows-per-page-options="[10, 25, 50]"
    >
      <!-- Status badge -->
      <template #body-cell-status="props">
        <q-td :props="props">
          <q-badge
            :color="statusColor(props.row.status)"
            :label="props.row.status"
          />
        </q-td>
      </template>

      <!-- Created at -->
      <template #body-cell-createdAt="props">
        <q-td :props="props">
          {{ formatDate(props.row.createdAt) }}
        </q-td>
      </template>

      <!-- Actions -->
      <template #body-cell-actions="props">
        <q-td :props="props" auto-width>
          <q-btn
            :label="props.row.status === 'ACTIVE' ? 'Suspend' : 'Activate'"
            :color="props.row.status === 'ACTIVE' ? 'warning' : 'positive'"
            size="sm"
            flat
            dense
            class="q-mr-xs"
            @click="confirmStatusChange(props.row)"
          />
          <q-btn
            label="Impersonate"
            color="primary"
            size="sm"
            flat
            dense
            @click="impersonate(props.row)"
          />
        </q-td>
      </template>

      <!-- Loading slot -->
      <template #loading>
        <q-inner-loading showing color="primary" />
      </template>
    </q-table>

    <!-- Create Tenant Dialog -->
    <q-dialog v-model="createDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Create New Tenant</div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-form ref="createForm" class="q-gutter-md" @submit.prevent="submitCreate">
            <q-input
              v-model="form.name"
              label="Tenant Name *"
              outlined
              :rules="[(v) => !!v || 'Name is required']"
              @update:model-value="onNameChange"
            />
            <q-input
              v-model="form.slug"
              label="Slug *"
              outlined
              hint="URL-friendly identifier"
              :rules="[
                (v) => !!v || 'Slug is required',
                (v) => /^[a-z0-9-]+$/.test(v) || 'Only lowercase letters, numbers, and hyphens',
              ]"
            />
            <q-select
              v-model="form.plan"
              label="Plan *"
              outlined
              :options="planOptions"
              emit-value
              map-options
              :rules="[(v) => !!v || 'Plan is required']"
            />
          </q-form>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right">
          <q-btn flat label="Cancel" @click="createDialog = false" />
          <q-btn
            color="primary"
            label="Create"
            :loading="creating"
            unelevated
            @click="submitCreate"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { superadminService } from 'src/services/superadmin.service'
import { useAuthStore } from 'src/stores/auth-store'
import type { Tenant } from 'src/types'

const $q = useQuasar()
const router = useRouter()
const authStore = useAuthStore()

// State
const tenants = ref<Tenant[]>([])
const loading = ref(false)
const creating = ref(false)
const createDialog = ref(false)

const form = ref({
  name: '',
  slug: '',
  plan: 'free',
})

const filters = ref({
  search: '',
  status: '',
})

// Table columns
const columns = [
  { name: 'name', label: 'Name', field: 'name', align: 'left' as const, sortable: true },
  { name: 'slug', label: 'Slug', field: 'slug', align: 'left' as const, sortable: true },
  { name: 'status', label: 'Status', field: 'status', align: 'left' as const, sortable: true },
  { name: 'plan', label: 'Plan', field: 'plan', align: 'left' as const, sortable: true },
  { name: 'createdAt', label: 'Created', field: 'createdAt', align: 'left' as const, sortable: true },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'right' as const },
]

const statusOptions = [
  { label: 'Pending', value: 'PENDING' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Suspended', value: 'SUSPENDED' },
]

const planOptions = [
  { label: 'Free', value: 'free' },
  { label: 'Starter', value: 'starter' },
  { label: 'Pro', value: 'pro' },
]

// Form ref
const createForm = ref<{ validate: () => Promise<boolean>; resetValidation: () => void } | null>(null)

// Computed: client-side filtering
const filteredTenants = computed(() => {
  let result = tenants.value

  if (filters.value.search.trim()) {
    const q = filters.value.search.toLowerCase()
    result = result.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.slug.toLowerCase().includes(q)
    )
  }

  if (filters.value.status) {
    result = result.filter((t) => t.status === filters.value.status)
  }

  return result
})

// Auto-generate slug from name
function onNameChange(name: string) {
  form.value.slug = name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

function statusColor(status: string): string {
  switch (status) {
    case 'ACTIVE':
      return 'positive'
    case 'PENDING':
      return 'warning'
    case 'SUSPENDED':
      return 'negative'
    default:
      return 'grey'
  }
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function openCreateDialog() {
  form.value = { name: '', slug: '', plan: 'free' }
  createForm.value?.resetValidation()
  createDialog.value = true
}

function confirmStatusChange(tenant: Tenant) {
  const newStatus = tenant.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'
  const action = newStatus === 'SUSPENDED' ? 'suspend' : 'activate'

  $q.dialog({
    title: 'Confirm',
    message: `Are you sure you want to ${action} tenant "${tenant.name}"?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await superadminService.updateTenant(tenant.id, { status: newStatus })
      const idx = tenants.value.findIndex((t) => t.id === tenant.id)
      if (idx !== -1) {
        tenants.value[idx] = { ...tenants.value[idx], status: newStatus }
      }
      $q.notify({
        type: 'positive',
        message: `Tenant ${action}d successfully.`,
        position: 'top',
      })
    } catch (err) {
      $q.notify({
        type: 'negative',
        message: `Failed to ${action} tenant.`,
        position: 'top',
      })
    }
  })
}

async function impersonate(tenant: Tenant) {
  try {
    const result = await superadminService.impersonate(tenant.id)
    authStore.startImpersonation(result.accessToken, {
      id: result.tenantId,
      name: result.tenantName,
    })
    await router.push('/admin/dashboard')
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: 'Failed to impersonate tenant.',
      position: 'top',
    })
  }
}

async function submitCreate() {
  const valid = await createForm.value?.validate()
  if (!valid) return

  creating.value = true
  try {
    await superadminService.createTenant({ ...form.value })
    createDialog.value = false
    $q.notify({
      type: 'positive',
      message: `Tenant "${form.value.name}" created successfully.`,
      position: 'top',
    })
    await loadTenants()
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: 'Failed to create tenant.',
      position: 'top',
    })
  } finally {
    creating.value = false
  }
}

async function loadTenants() {
  loading.value = true
  try {
    const response = await superadminService.listTenants({ page: 1, limit: 10 })
    tenants.value = response.data ?? response
  } catch (err) {
    console.error('Failed to load tenants:', err)
    $q.notify({
      type: 'negative',
      message: 'Failed to load tenants.',
      position: 'top',
    })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void loadTenants()
})
</script>
