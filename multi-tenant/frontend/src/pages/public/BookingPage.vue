<template>
  <q-page class="q-pa-md">
    <!-- Success state -->
    <div v-if="bookingResult" class="row justify-center">
      <div class="col-12 col-sm-10 col-md-6">
        <q-card class="text-center q-pa-lg">
          <q-icon name="check_circle" color="positive" size="80px" class="q-mb-md" />
          <div class="text-h5 text-weight-bold q-mb-sm">Booking Confirmed!</div>
          <div class="text-body1 text-grey-7 q-mb-lg">
            Your booking has been successfully created.
          </div>

          <q-separator class="q-mb-md" />

          <div class="text-left q-gutter-sm">
            <div class="row">
              <span class="text-weight-bold col-4">Booking ID:</span>
              <span class="col text-grey-8">{{ bookingResult.id }}</span>
            </div>
            <div class="row">
              <span class="text-weight-bold col-4">Product:</span>
              <span class="col text-grey-8">{{ selectedProduct?.name }}</span>
            </div>
            <div class="row">
              <span class="text-weight-bold col-4">Date:</span>
              <span class="col text-grey-8">{{ selectedDate }}</span>
            </div>
            <div class="row">
              <span class="text-weight-bold col-4">Time:</span>
              <span class="col text-grey-8">{{ selectedSlot }}</span>
            </div>
            <div class="row">
              <span class="text-weight-bold col-4">Name:</span>
              <span class="col text-grey-8">{{ form.customerName }}</span>
            </div>
            <div class="row">
              <span class="text-weight-bold col-4">Email:</span>
              <span class="col text-grey-8">{{ form.customerEmail }}</span>
            </div>
          </div>

          <q-btn
            color="primary"
            label="Book Another"
            class="q-mt-lg"
            unelevated
            @click="resetBooking"
          />
        </q-card>
      </div>
    </div>

    <!-- Stepper -->
    <div v-else>
      <div class="text-h4 text-weight-bold q-mb-lg">Book a Service</div>

      <q-stepper
        v-model="step"
        :vertical="$q.screen.lt.sm"
        color="primary"
        animated
        flat
        bordered
      >
        <!-- Step 1: Product selection -->
        <q-step :name="1" title="Select Product" icon="inventory_2" :done="step > 1">
          <div v-if="loadingProducts" class="row q-col-gutter-md q-mt-sm">
            <div v-for="n in 3" :key="n" class="col-12 col-sm-6 col-md-4">
              <q-card>
                <q-skeleton height="120px" square />
                <q-card-section>
                  <q-skeleton type="text" class="text-h6" />
                  <q-skeleton type="text" width="60%" />
                </q-card-section>
              </q-card>
            </div>
          </div>

          <div v-else class="row q-col-gutter-md q-mt-sm">
            <div
              v-for="product in products"
              :key="product.id"
              class="col-12 col-sm-6 col-md-4"
            >
              <q-card
                clickable
                :class="[
                  'cursor-pointer transition-all',
                  selectedProduct?.id === product.id
                    ? 'border-primary shadow-4'
                    : 'border-grey',
                ]"
                style="border: 2px solid transparent"
                :style="
                  selectedProduct?.id === product.id
                    ? 'border-color: var(--q-primary)'
                    : 'border-color: #e0e0e0'
                "
                @click="selectedProduct = product"
              >
                <q-img
                  v-if="product.imageUrl"
                  :src="product.imageUrl"
                  :ratio="16 / 9"
                >
                  <template #error>
                    <div class="absolute-full flex flex-center bg-grey-3">
                      <q-icon name="image_not_supported" size="32px" color="grey-5" />
                    </div>
                  </template>
                </q-img>
                <div v-else class="bg-grey-3 flex flex-center" style="height: 120px">
                  <q-icon name="image" size="32px" color="grey-5" />
                </div>

                <q-card-section>
                  <div class="row items-center no-wrap">
                    <div class="col text-subtitle1 text-weight-medium">{{ product.name }}</div>
                    <q-icon
                      v-if="selectedProduct?.id === product.id"
                      name="check_circle"
                      color="primary"
                      size="20px"
                    />
                  </div>
                  <div class="text-body2 text-primary text-weight-bold">
                    ${{ (product.price / 100).toFixed(2) }}
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>

          <q-stepper-navigation class="q-mt-md">
            <q-btn
              color="primary"
              label="Next"
              :disable="!selectedProduct"
              unelevated
              @click="step = 2"
            />
          </q-stepper-navigation>
        </q-step>

        <!-- Step 2: Date & Time -->
        <q-step :name="2" title="Date & Time" icon="event" :done="step > 2">
          <div class="row q-col-gutter-lg q-mt-sm">
            <div class="col-12 col-sm-auto">
              <q-date
                v-model="selectedDate"
                :options="futureDatesOnly"
                @update:model-value="onDateChange"
              />
            </div>

            <div class="col-12 col-sm">
              <div class="text-subtitle1 text-weight-medium q-mb-md">
                Available Time Slots
                <span v-if="selectedDate" class="text-grey-6 text-body2 q-ml-xs">
                  for {{ selectedDate }}
                </span>
              </div>

              <div v-if="!selectedDate" class="text-body2 text-grey-5">
                Please select a date to see available slots.
              </div>

              <div v-else-if="loadingSlots" class="q-gutter-sm">
                <q-skeleton v-for="n in 6" :key="n" type="QBtn" width="80px" />
              </div>

              <div v-else-if="availableSlots.length === 0" class="text-body2 text-grey-5">
                No slots available for this date.
              </div>

              <div v-else class="q-gutter-sm">
                <q-btn
                  v-for="slot in availableSlots"
                  :key="slot.time"
                  :label="slot.time"
                  :color="selectedSlot === slot.time ? 'primary' : 'grey-3'"
                  :text-color="selectedSlot === slot.time ? 'white' : 'dark'"
                  :disable="!slot.available"
                  size="sm"
                  unelevated
                  @click="selectedSlot = slot.time"
                />
              </div>
            </div>
          </div>

          <q-stepper-navigation class="q-mt-md">
            <q-btn flat label="Back" class="q-mr-sm" @click="step = 1" />
            <q-btn
              color="primary"
              label="Next"
              :disable="!selectedDate || !selectedSlot"
              unelevated
              @click="step = 3"
            />
          </q-stepper-navigation>
        </q-step>

        <!-- Step 3: Customer info -->
        <q-step :name="3" title="Your Details" icon="person" :done="step > 3">
          <q-form ref="customerForm" class="q-mt-sm" @submit.prevent>
            <div class="row q-col-gutter-md" style="max-width: 600px">
              <div class="col-12">
                <q-input
                  v-model="form.customerName"
                  label="Full Name *"
                  outlined
                  :rules="[(v) => !!v || 'Name is required']"
                />
              </div>
              <div class="col-12">
                <q-input
                  v-model="form.customerEmail"
                  label="Email Address *"
                  outlined
                  type="email"
                  :rules="[
                    (v) => !!v || 'Email is required',
                    (v) => /.+@.+\..+/.test(v) || 'Enter a valid email',
                  ]"
                />
              </div>
              <div class="col-12">
                <q-input
                  v-model="form.customerPhone"
                  label="Phone Number (optional)"
                  outlined
                  type="tel"
                />
              </div>
              <div class="col-12">
                <q-input
                  v-model="form.notes"
                  label="Notes (optional)"
                  outlined
                  type="textarea"
                  rows="3"
                />
              </div>
            </div>
          </q-form>

          <q-stepper-navigation class="q-mt-md">
            <q-btn flat label="Back" class="q-mr-sm" @click="step = 2" />
            <q-btn
              color="primary"
              label="Next"
              unelevated
              @click="validateAndProceed"
            />
          </q-stepper-navigation>
        </q-step>

        <!-- Step 4: Confirm -->
        <q-step :name="4" title="Confirm" icon="check_circle">
          <div class="q-mt-sm" style="max-width: 500px">
            <q-card bordered flat>
              <q-card-section>
                <div class="text-h6 q-mb-md">Booking Summary</div>

                <q-list dense>
                  <q-item>
                    <q-item-section>
                      <q-item-label overline>Product</q-item-label>
                      <q-item-label class="text-body1">{{ selectedProduct?.name }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item>
                    <q-item-section>
                      <q-item-label overline>Date</q-item-label>
                      <q-item-label class="text-body1">{{ selectedDate }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item>
                    <q-item-section>
                      <q-item-label overline>Time</q-item-label>
                      <q-item-label class="text-body1">{{ selectedSlot }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item>
                    <q-item-section>
                      <q-item-label overline>Name</q-item-label>
                      <q-item-label class="text-body1">{{ form.customerName }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item>
                    <q-item-section>
                      <q-item-label overline>Email</q-item-label>
                      <q-item-label class="text-body1">{{ form.customerEmail }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-separator v-if="form.customerPhone" />
                  <q-item v-if="form.customerPhone">
                    <q-item-section>
                      <q-item-label overline>Phone</q-item-label>
                      <q-item-label class="text-body1">{{ form.customerPhone }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-separator v-if="form.notes" />
                  <q-item v-if="form.notes">
                    <q-item-section>
                      <q-item-label overline>Notes</q-item-label>
                      <q-item-label class="text-body1">{{ form.notes }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-card>
          </div>

          <q-stepper-navigation class="q-mt-md">
            <q-btn flat label="Back" class="q-mr-sm" @click="step = 3" />
            <q-btn
              color="primary"
              label="Confirm Booking"
              :loading="submitting"
              unelevated
              @click="submitBooking"
            />
          </q-stepper-navigation>
        </q-step>
      </q-stepper>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { productsService } from 'src/services/products.service'
import { reservationsService } from 'src/services/reservations.service'
import { useTenant } from 'src/composables/useTenant'
import { useRoute } from 'vue-router'
import type { Product, AvailabilitySlot, Reservation } from 'src/types'

const $q = useQuasar()
const route = useRoute()
const { tenant } = useTenant()

// Step state
const step = ref(1)

// Data
const products = ref<Product[]>([])
const selectedProduct = ref<Product | null>(null)
const selectedDate = ref('')
const availableSlots = ref<AvailabilitySlot[]>([])
const selectedSlot = ref('')

// Form
const form = ref({
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  notes: '',
})

// Loading states
const loadingProducts = ref(false)
const loadingSlots = ref(false)
const submitting = ref(false)

// Result
const bookingResult = ref<Reservation | null>(null)

// Form ref
const customerForm = ref<{ validate: () => Promise<boolean> } | null>(null)

function futureDatesOnly(dateStr: string): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const [year, month, day] = dateStr.split('/').map(Number)
  const d = new Date(year, month - 1, day)
  return d >= today
}

async function onDateChange(date: string) {
  if (!selectedProduct.value || !date) return
  selectedSlot.value = ''
  loadingSlots.value = true
  try {
    const result = await reservationsService.getAvailability(selectedProduct.value.id, date)
    availableSlots.value = result
  } catch (err) {
    console.error('Failed to load availability:', err)
    availableSlots.value = []
  } finally {
    loadingSlots.value = false
  }
}

async function validateAndProceed() {
  const valid = await customerForm.value?.validate()
  if (valid) {
    step.value = 4
  }
}

async function submitBooking() {
  if (!selectedProduct.value) return

  submitting.value = true
  try {
    const result = await reservationsService.createPublic({
      productId: selectedProduct.value.id,
      date: selectedDate.value,
      timeSlot: selectedSlot.value,
      customerName: form.value.customerName,
      customerEmail: form.value.customerEmail,
      customerPhone: form.value.customerPhone,
      notes: form.value.notes,
      guestCustomer: {
        name: form.value.customerName,
        email: form.value.customerEmail,
      },
    })
    bookingResult.value = result
  } catch (err) {
    $q.notify({
      type: 'negative',
      message: 'Failed to create booking. Please try again.',
      position: 'top',
    })
  } finally {
    submitting.value = false
  }
}

function resetBooking() {
  step.value = 1
  selectedProduct.value = null
  selectedDate.value = ''
  selectedSlot.value = ''
  availableSlots.value = []
  form.value = {
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    notes: '',
  }
  bookingResult.value = null
}

async function loadProducts() {
  loadingProducts.value = true
  try {
    const response = await productsService.listPublic({ limit: 100 })
    products.value = response.data ?? response

    const preselectedId = route.query.productId as string | undefined
    if (preselectedId) {
      const match = products.value.find((p) => p.id === preselectedId)
      if (match) {
        selectedProduct.value = match
      }
    }
  } catch (err) {
    console.error('Failed to load products:', err)
  } finally {
    loadingProducts.value = false
  }
}

onMounted(() => {
  void loadProducts()
})
</script>
