<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="text-h5 col">Orders</div>
    </div>

    <!-- Filters -->
    <div class="row q-gutter-sm q-mb-md">
      <q-select
        v-model="filters.status"
        :options="statusOptions"
        emit-value
        map-options
        clearable
        label="Status"
        outlined
        dense
        style="min-width: 160px"
        @update:model-value="loadOrders"
      />
    </div>

    <q-table
      :rows="orders"
      :columns="columns"
      row-key="id"
      :loading="loading"
      v-model:pagination="pagination"
      @request="onRequest"
      binary-state-sort
    >
      <template #body-cell-status="{ row }">
        <q-td>
          <q-badge :color="statusColor(row.status)" :label="row.status" />
        </q-td>
      </template>

      <template #body-cell-total="{ row }">
        <q-td>${{ (row.totalAmount / 100).toFixed(2) }}</q-td>
      </template>

      <template #body-cell-actions="{ row }">
        <q-td>
          <q-btn flat round dense size="sm" icon="visibility" @click="openDetail(row)">
            <q-tooltip>View detail</q-tooltip>
          </q-btn>
          <q-btn
            v-if="row.status === 'PENDING'"
            flat round dense size="sm" icon="play_arrow" color="primary"
            @click="updateStatus(row, 'PROCESSING')"
          >
            <q-tooltip>Process</q-tooltip>
          </q-btn>
          <q-btn
            v-if="row.status === 'PROCESSING'"
            flat round dense size="sm" icon="check_circle" color="positive"
            @click="updateStatus(row, 'COMPLETED')"
          >
            <q-tooltip>Complete</q-tooltip>
          </q-btn>
          <q-btn
            v-if="row.status === 'PENDING' || row.status === 'PROCESSING'"
            flat round dense size="sm" icon="cancel" color="negative"
            @click="confirmCancel(row)"
          >
            <q-tooltip>Cancel</q-tooltip>
          </q-btn>
        </q-td>
      </template>

      <template #no-data>
        <div class="full-width column flex-center text-grey q-pa-xl">
          <q-icon name="receipt_long" size="48px" class="q-mb-sm" />
          <div>No orders found</div>
        </div>
      </template>
    </q-table>

    <!-- Detail dialog -->
    <q-dialog v-model="detailDialog" maximized>
      <q-card v-if="selected">
        <q-card-section class="row items-center">
          <div class="text-h6">Order #{{ selected.id.slice(0, 8) }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-separator />
        <q-card-section class="scroll" style="max-height: 80vh">
          <q-list>
            <q-item>
              <q-item-section>
                <q-item-label overline>Status</q-item-label>
                <q-item-label><q-badge :color="statusColor(selected.status)" :label="selected.status" /></q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label overline>Total</q-item-label>
                <q-item-label>${{ (selected.totalAmount / 100).toFixed(2) }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label overline>Notes</q-item-label>
                <q-item-label>{{ selected.notes || '—' }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-item-label overline>Created</q-item-label>
                <q-item-label>{{ new Date(selected.createdAt).toLocaleString() }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>

          <div class="text-subtitle2 q-mt-md q-mb-sm">Items</div>
          <q-table
            :rows="selected.orderItems ?? []"
            :columns="itemColumns"
            row-key="id"
            flat
            dense
            hide-bottom
          >
            <template #body-cell-subtotal="{ row }">
              <q-td>${{ (row.subtotal / 100).toFixed(2) }}</q-td>
            </template>
            <template #body-cell-unitPrice="{ row }">
              <q-td>${{ (row.unitPrice / 100).toFixed(2) }}</q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { ordersService } from 'src/services/orders.service'
import type { Order } from 'src/types'

const $q = useQuasar()
const orders = ref<Order[]>([])
const loading = ref(false)
const detailDialog = ref(false)
const selected = ref<Order | null>(null)
const filters = ref({ status: '' })
const pagination = ref({ page: 1, rowsPerPage: 10, rowsNumber: 0 })

const statusOptions = [
  { label: 'Pending', value: 'PENDING' },
  { label: 'Processing', value: 'PROCESSING' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' },
]

const columns = [
  { name: 'id', label: 'Order ID', field: (r: Order) => r.id.slice(0, 8), sortable: false },
  { name: 'status', label: 'Status', field: 'status', sortable: true },
  { name: 'total', label: 'Total', field: 'totalAmount', sortable: true },
  { name: 'notes', label: 'Notes', field: (r: Order) => r.notes || '—', sortable: false },
  { name: 'createdAt', label: 'Created', field: (r: Order) => new Date(r.createdAt).toLocaleDateString(), sortable: true },
  { name: 'actions', label: 'Actions', field: 'actions', sortable: false },
]

const itemColumns = [
  { name: 'productName', label: 'Product', field: 'productName' },
  { name: 'quantity', label: 'Qty', field: 'quantity' },
  { name: 'unitPrice', label: 'Unit Price', field: 'unitPrice' },
  { name: 'subtotal', label: 'Subtotal', field: 'subtotal' },
]

function statusColor(status: string) {
  return { PENDING: 'orange', PROCESSING: 'blue', COMPLETED: 'positive', CANCELLED: 'negative' }[status] ?? 'grey'
}

async function loadOrders() {
  loading.value = true
  try {
    const res = await ordersService.list({
      page: pagination.value.page,
      limit: pagination.value.rowsPerPage,
      status: filters.value.status || undefined,
    })
    orders.value = res.data ?? (res as unknown as Order[])
    pagination.value.rowsNumber = res.total ?? orders.value.length
  } catch {
    $q.notify({ type: 'negative', message: 'Failed to load orders' })
  } finally {
    loading.value = false
  }
}

function onRequest(props: { pagination: typeof pagination.value }) {
  pagination.value = props.pagination
  void loadOrders()
}

function openDetail(order: Order) {
  selected.value = order
  detailDialog.value = true
}

async function updateStatus(order: Order, status: Order['status']) {
  try {
    const updated = await ordersService.updateStatus(order.id, status)
    const idx = orders.value.findIndex((o) => o.id === order.id)
    if (idx !== -1) orders.value[idx] = updated
    $q.notify({ type: 'positive', message: `Order ${status.toLowerCase()}` })
  } catch {
    $q.notify({ type: 'negative', message: 'Failed to update order' })
  }
}

function confirmCancel(order: Order) {
  $q.dialog({
    title: 'Cancel Order',
    message: 'Are you sure you want to cancel this order?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void updateStatus(order, 'CANCELLED')
  })
}

onMounted(loadOrders)
</script>
