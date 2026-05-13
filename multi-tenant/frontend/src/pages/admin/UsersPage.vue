<template>
  <q-page padding>
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h5">Users</div>
      <q-btn
        color="primary"
        icon="person_add"
        label="Invite User"
        no-caps
        unelevated
        @click="inviteDialog = true"
      />
    </div>

    <q-table
      :rows="users"
      :columns="columns"
      row-key="id"
      :loading="loading"
      v-model:pagination="pagination"
      binary-state-sort
      flat
      bordered
      @request="onRequest"
    >
      <!-- Name -->
      <template #body-cell-name="{ row }">
        <q-td>
          {{ row.firstName }} {{ row.lastName }}
        </q-td>
      </template>

      <!-- Role -->
      <template #body-cell-role="{ row }">
        <q-td>
          <q-badge
            :color="row.role === 'tenant_owner' ? 'primary' : 'grey-6'"
            :label="row.role === 'tenant_owner' ? 'Owner' : 'User'"
          />
        </q-td>
      </template>

      <!-- Status -->
      <template #body-cell-status="{ row }">
        <q-td>
          <q-chip
            dense
            :color="row.isActive ? 'positive' : 'negative'"
            text-color="white"
            :label="row.isActive ? 'Active' : 'Inactive'"
            size="sm"
          />
        </q-td>
      </template>

      <!-- createdAt -->
      <template #body-cell-createdAt="{ row }">
        <q-td>
          {{ formatDate(row.createdAt) }}
        </q-td>
      </template>

      <!-- Actions -->
      <template #body-cell-actions="{ row }">
        <q-td class="q-gutter-x-sm" style="min-width: 260px">
          <q-select
            :model-value="row.role"
            :options="roleOptions"
            dense
            outlined
            emit-value
            map-options
            style="min-width: 140px; display: inline-flex"
            @update:model-value="(newRole: string) => handleRoleChange(row.id, newRole)"
          />
          <q-toggle
            :model-value="row.isActive"
            color="positive"
            @update:model-value="(val: boolean) => handleStatusToggle(row, val)"
          />
        </q-td>
      </template>
    </q-table>

    <!-- Invite Dialog -->
    <q-dialog v-model="inviteDialog" persistent>
      <q-card style="min-width: 360px">
        <q-card-section>
          <div class="text-h6">Invite User</div>
        </q-card-section>

        <q-card-section class="q-pt-none column q-gutter-md">
          <q-input
            v-model="inviteEmail"
            label="Email address"
            type="email"
            outlined
            dense
            autofocus
          />
          <q-select
            v-model="inviteRole"
            label="Role"
            :options="roleOptions"
            emit-value
            map-options
            outlined
            dense
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" no-caps v-close-popup @click="resetInviteForm" />
          <q-btn
            unelevated
            color="primary"
            label="Send Invite"
            no-caps
            :loading="inviteLoading"
            :disable="!inviteEmail"
            @click="handleInvite"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useQuasar, QTableProps } from 'quasar'
import { usersService } from 'src/services/users.service'
import type { TenantUser } from 'src/types'

const $q = useQuasar()

// ── State ────────────────────────────────────────────────────────────────────
const users = ref<TenantUser[]>([])
const loading = ref(false)
const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
})

const inviteDialog = ref(false)
const inviteLoading = ref(false)
const inviteEmail = ref('')
const inviteRole = ref<string>('tenant_user')

// ── Config ───────────────────────────────────────────────────────────────────
const roleOptions = [
  { label: 'Owner', value: 'tenant_owner' },
  { label: 'User', value: 'tenant_user' },
]

const columns: QTableProps['columns'] = [
  { name: 'name', label: 'Name', field: 'firstName', align: 'left', sortable: true },
  { name: 'email', label: 'Email', field: 'email', align: 'left', sortable: true },
  { name: 'role', label: 'Role', field: 'role', align: 'left' },
  { name: 'status', label: 'Status', field: 'isActive', align: 'center' },
  { name: 'createdAt', label: 'Created', field: 'createdAt', align: 'left', sortable: true },
  { name: 'actions', label: 'Actions', field: 'id', align: 'left' },
]

// ── Data fetching ─────────────────────────────────────────────────────────────
async function fetchUsers (page: number, rowsPerPage: number) {
  loading.value = true
  try {
    const result = await usersService.list({ page, limit: rowsPerPage })
    users.value = result.data ?? result.items ?? result
    pagination.value.rowsNumber = result.total ?? 0
  } catch {
    $q.notify({ type: 'negative', message: 'Failed to load users.' })
  } finally {
    loading.value = false
  }
}

function onRequest (props: { pagination: { page: number; rowsPerPage: number } }) {
  const { page, rowsPerPage } = props.pagination
  pagination.value.page = page
  pagination.value.rowsPerPage = rowsPerPage
  void fetchUsers(page, rowsPerPage)
}

onMounted(() => {
  void fetchUsers(pagination.value.page, pagination.value.rowsPerPage)
})

// ── Role change ───────────────────────────────────────────────────────────────
async function handleRoleChange (userId: string, newRole: string) {
  try {
    await usersService.updateRole(userId, newRole)
    $q.notify({ type: 'positive', message: 'Role updated.' })
    void fetchUsers(pagination.value.page, pagination.value.rowsPerPage)
  } catch {
    $q.notify({ type: 'negative', message: 'Failed to update role.' })
  }
}

// ── Status toggle ─────────────────────────────────────────────────────────────
function handleStatusToggle (row: TenantUser, newValue: boolean) {
  if (!newValue) {
    $q.dialog({
      title: 'Deactivate User',
      message: `Deactivate ${row.firstName} ${row.lastName}?`,
      cancel: true,
      persistent: true,
    }).onOk(async () => {
      await applyStatusChange(row.id, false)
    })
  } else {
    void applyStatusChange(row.id, true)
  }
}

async function applyStatusChange (userId: string, isActive: boolean) {
  try {
    await usersService.setStatus(userId, isActive)
    $q.notify({ type: 'positive', message: `User ${isActive ? 'activated' : 'deactivated'}.` })
    void fetchUsers(pagination.value.page, pagination.value.rowsPerPage)
  } catch {
    $q.notify({ type: 'negative', message: 'Failed to update status.' })
  }
}

// ── Invite ────────────────────────────────────────────────────────────────────
async function handleInvite () {
  inviteLoading.value = true
  try {
    await usersService.invite(inviteEmail.value, inviteRole.value)
    inviteDialog.value = false
    resetInviteForm()
    $q.notify({ type: 'positive', message: 'Invitation sent.' })
    void fetchUsers(pagination.value.page, pagination.value.rowsPerPage)
  } catch {
    $q.notify({ type: 'negative', message: 'Failed to send invitation.' })
  } finally {
    inviteLoading.value = false
  }
}

function resetInviteForm () {
  inviteEmail.value = ''
  inviteRole.value = 'tenant_user'
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate (iso: string): string {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
</script>
