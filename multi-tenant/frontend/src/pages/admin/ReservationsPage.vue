<template>
  <q-page padding>
    <div class="text-h5 text-weight-bold q-mb-md">Reservations</div>

    <!-- Filter Bar -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="row q-gutter-md items-end">
          <q-select
            v-model="filters.status"
            :options="statusOptions"
            label="Status"
            dense
            outlined
            clearable
            emit-value
            map-options
            style="min-width: 160px"
          />

          <q-input
            v-model="filters.dateFrom"
            label="Date From"
            dense
            outlined
            style="min-width: 160px"
          >
            <template #append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="filters.dateFrom" mask="YYYY-MM-DD" minimal>
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>

          <q-input
            v-model="filters.dateTo"
            label="Date To"
            dense
            outlined
            style="min-width: 160px"
          >
            <template #append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="filters.dateTo" mask="YYYY-MM-DD" minimal>
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup label="Close" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>

          <q-btn color="primary" label="Apply Filters" icon="filter_list" @click="applyFilters" />
          <q-btn flat label="Clear" @click="clearFilters" />
        </div>
      </q-card-section>
    </q-card>

    <!-- Table -->
    <q-table
      :rows="reservations"
      :columns="columns"
      row-key="id"
      :loading="loading"
      v-model:pagination="pagination"
      @request="onRequest"
      binary-state-sort
    >
      <template #body-cell-status="props">
        <q-td :props="props">
          <q-badge
            :color="statusColor(props.row.status)"
            :label="props.row.status"
            class="text-uppercase"
          />
        </q-td>
      </template>

      <template #body-cell-actions="props">
        <q-td :props="props">
          <q-btn
            flat
            round
            dense
            icon="visibility"
            color="grey-7"
            class="q-mr-xs"
            @click="openDetail(props.row)"
          >
            <q-tooltip>View Details</q-tooltip>
          </q-btn>

          <template v-if="props.row.status === 'PENDING'">
            <q-btn
              flat
              round
              dense
              icon="check_circle"
              color="primary"
              class="q-mr-xs"
              @click="confirmReservation(props.row)"
            >
              <q-tooltip>Confirm</q-tooltip>
            </q-btn>
          </template>

          <template v-if="props.row.status === 'CONFIRMED'">
            <q-btn
              flat
              round
              dense
              icon="task_alt"
              color="positive"
              class="q-mr-xs"
              @click="completeReservation(props.row)"
            >
              <q-tooltip>Complete</q-tooltip>
            </q-btn>
          </template>

          <template v-if="props.row.status === 'PENDING' || props.row.status === 'CONFIRMED'">
            <q-btn
              flat
              round
              dense
              icon="cancel"
              color="negative"
              @click="cancelReservation(props.row)"
            >
              <q-tooltip>Cancel</q-tooltip>
            </q-btn>
          </template>
        </q-td>
      </template>
    </q-table>

    <!-- Detail Dialog -->
    <q-dialog v-model="detailDialog" maximized transition-show="slide-up" transition-hide="slide-down">
      <q-card>
        <q-bar class="bg-primary text-white">
          <q-icon name="event_note" />
          <div class="q-ml-sm text-weight-bold">Reservation Details</div>
          <q-space />
          <q-btn dense flat icon="close" v-close-popup />
        </q-bar>

        <q-card-section v-if="selected">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-list bordered separator rounded>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>Customer</q-item-label>
                    <q-item-label>{{ selected.customerName }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>Date</q-item-label>
                    <q-item-label>{{ selected.date }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>Time Slot</q-item-label>
                    <q-item-label>{{ selected.timeSlot }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>Product</q-item-label>
                    <q-item-label>{{ selected.productName }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>Status</q-item-label>
                    <q-item-label>
                      <q-badge :color="statusColor(selected.status)" :label="selected.status" class="text-uppercase" />
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>

            <div class="col-12 col-md-6">
              <div class="text-subtitle2 q-mb-sm">Metadata</div>
              <pre class="bg-grey-2 rounded-borders q-pa-md text-body2" style="overflow-x: auto">{{ JSON.stringify(selected.metadata, null, 2) }}</pre>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useQuasar, QTableProps } from 'quasar'
import { reservationsService } from 'src/services/reservations.service'
import type { Reservation } from 'src/types'

const $q = useQuasar()

// State
const reservations = ref<Reservation[]>([])
const loading = ref(false)
const detailDialog = ref(false)
const selected = ref<Reservation | null>(null)

const filters = ref({
  status: '',
  dateFrom: '',
  dateTo: '',
})

const pagination = ref({
  page: 1,
  rowsPerPage: 15,
  rowsNumber: 0,
  sortBy: 'date',
  descending: true,
})

// Table columns
const columns: QTableProps['columns'] = [
  { name: 'customerName', label: 'Customer', field: 'customerName', sortable: true, align: 'left' },
  { name: 'date', label: 'Date', field: 'date', sortable: true, align: 'left' },
  { name: 'timeSlot', label: 'Time Slot', field: 'timeSlot', align: 'left' },
  { name: 'product', label: 'Product', field: 'productName', align: 'left' },
  { name: 'status', label: 'Status', field: 'status', sortable: true, align: 'center' },
  { name: 'actions', label: 'Actions', field: 'id', align: 'center' },
]

const statusOptions = [
  { label: 'Pending', value: 'PENDING' },
  { label: 'Confirmed', value: 'CONFIRMED' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' },
]

function statusColor(status: string): string {
  const map: Record<string, string> = {
    PENDING: 'orange',
    CONFIRMED: 'blue',
    COMPLETED: 'green',
    CANCELLED: 'red',
  }
  return map[status] ?? 'grey'
}

// Data fetching
async function loadReservations(page = 1, rowsPerPage = 15, sortBy = 'date', descending = true) {
  loading.value = true
  try {
    const params = {
      page,
      limit: rowsPerPage,
      sortBy,
      descending,
      ...(filters.value.status && { status: filters.value.status }),
      ...(filters.value.dateFrom && { dateFrom: filters.value.dateFrom }),
      ...(filters.value.dateTo && { dateTo: filters.value.dateTo }),
    }
    const result = await reservationsService.findAll(params)
    reservations.value = result.data
    pagination.value.rowsNumber = result.total
  } catch {
    $q.notify({ type: 'negative', message: 'Failed to load reservations' })
  } finally {
    loading.value = false
  }
}

function onRequest(props: { pagination: typeof pagination.value }) {
  const { page, rowsPerPage, sortBy, descending } = props.pagination
  pagination.value = { ...pagination.value, page, rowsPerPage, sortBy, descending }
  void loadReservations(page, rowsPerPage, sortBy, descending)
}

function applyFilters() {
  pagination.value.page = 1
  void loadReservations(1, pagination.value.rowsPerPage, pagination.value.sortBy, pagination.value.descending)
}

function clearFilters() {
  filters.value = { status: '', dateFrom: '', dateTo: '' }
  applyFilters()
}

// Detail dialog
function openDetail(reservation: Reservation) {
  selected.value = reservation
  detailDialog.value = true
}

// Status updates
async function updateStatus(reservation: Reservation, status: string) {
  try {
    await reservationsService.updateStatus(reservation.id, status)
    reservation.status = status as Reservation['status']
    $q.notify({ type: 'positive', message: `Reservation ${status.toLowerCase()}` })
  } catch {
    $q.notify({ type: 'negative', message: 'Failed to update reservation' })
  }
}

function confirmReservation(reservation: Reservation) {
  void updateStatus(reservation, 'CONFIRMED')
}

function completeReservation(reservation: Reservation) {
  void updateStatus(reservation, 'COMPLETED')
}

function cancelReservation(reservation: Reservation) {
  $q.dialog({
    title: 'Cancel Reservation',
    message: `Cancel reservation for ${reservation.customerName}? This cannot be undone.`,
    cancel: true,
    persistent: true,
    ok: { color: 'negative', label: 'Cancel Reservation' },
  }).onOk(() => {
    void updateStatus(reservation, 'CANCELLED')
  })
}

// Mount
onMounted(() => {
  void loadReservations()
})
</script>
