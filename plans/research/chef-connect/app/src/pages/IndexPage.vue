<template>
  <q-page class="q-pa-md">
    <q-tabs v-model="tab" class="text-primary q-mb-md" align="left">
      <q-tab name="browse" label="Browse Chefs" icon="restaurant" />
      <q-tab name="orders" label="My Orders" icon="receipt_long" />
      <q-tab name="add" label="Become a Chef" icon="add_circle" />
    </q-tabs>

    <!-- Browse Chefs -->
    <div v-if="tab === 'browse'">
      <div class="row q-col-gutter-md">
        <div v-for="chef in store.chefs" :key="chef.id" class="col-12 col-sm-6 col-md-4">
          <q-card class="chef-card">
            <q-card-section class="row items-center no-wrap q-pb-none">
              <q-avatar color="primary" text-color="white" size="56px" class="q-mr-md">{{ chef.avatar }}</q-avatar>
              <div class="col">
                <div class="text-h6 q-mb-none">{{ chef.name }}</div>
                <div class="row items-center q-gutter-xs">
                  <q-badge color="secondary" class="text-caption">{{ chef.cuisine }}</q-badge>
                  <q-badge v-if="chef.verified" color="positive" icon="verified" class="text-caption">Verified</q-badge>
                </div>
              </div>
            </q-card-section>
            <q-card-section class="q-pt-sm">
              <div class="text-body2 text-grey-7 q-mb-sm">{{ chef.bio }}</div>
              <div class="row items-center justify-between">
                <div class="row items-center q-gutter-xs">
                  <q-icon name="star" color="warning" size="18px" />
                  <span class="text-subtitle2">{{ chef.rating }}</span>
                </div>
                <div class="text-subtitle1 text-primary text-weight-bold">${{ chef.price }}/meal</div>
              </div>
            </q-card-section>
            <q-card-actions>
              <q-btn flat color="primary" label="View Menu" @click="openOrderDialog(chef)" />
              <q-btn unelevated color="primary" label="Order Now" @click="openOrderDialog(chef)" />
            </q-card-actions>
          </q-card>
        </div>
      </div>
    </div>

    <!-- My Orders -->
    <div v-if="tab === 'orders'">
      <div v-if="store.orders.length === 0" class="text-center q-pa-xl text-grey-6">
        <q-icon name="receipt_long" size="64px" />
        <div class="text-h6 q-mt-md">No orders yet</div>
        <div>Browse chefs and place your first order!</div>
      </div>
      <q-list v-else bordered separator class="rounded-borders">
        <q-item v-for="order in store.orders" :key="order.id" class="q-py-md">
          <q-item-section avatar>
            <q-avatar color="primary" text-color="white">{{ order.chefName.split(' ').map(n=>n[0]).join('') }}</q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label class="text-weight-bold">{{ order.meal }}</q-item-label>
            <q-item-label caption>from {{ order.chefName }} · Qty: {{ order.qty }}</q-item-label>
            <q-item-label caption>{{ order.address }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <div class="text-subtitle2 text-primary q-mb-xs">${{ order.total.toFixed(2) }}</div>
            <q-badge :color="statusColor(order.status)">{{ order.status }}</q-badge>
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <!-- Add Chef Form -->
    <div v-if="tab === 'add'">
      <q-card class="q-pa-md" style="max-width: 600px; margin: 0 auto">
        <q-card-section>
          <div class="text-h6">Join as a Chef</div>
          <div class="text-caption text-grey-6">Share your home cooking with your community</div>
        </q-card-section>
        <q-card-section class="q-gutter-md">
          <q-input v-model="chefForm.name" label="Full Name *" outlined dense />
          <q-select v-model="chefForm.cuisine" :options="cuisineOptions" label="Cuisine Type *" outlined dense />
          <q-input v-model="chefForm.bio" label="Bio / Description *" type="textarea" rows="3" outlined />
          <q-input v-model.number="chefForm.price" label="Price per Meal ($) *" type="number" outlined dense />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn unelevated color="primary" label="Register as Chef" @click="submitChef" />
        </q-card-actions>
      </q-card>
    </div>

    <!-- Order Dialog -->
    <q-dialog v-model="orderDialog">
      <q-card style="min-width: 380px">
        <q-card-section>
          <div class="text-h6">Order from {{ selectedChef?.name }}</div>
        </q-card-section>
        <q-card-section class="q-gutter-md">
          <q-input v-model="orderForm.meal" label="Meal Name *" outlined dense placeholder="e.g. Kare-Kare, Jollof Rice" />
          <q-input v-model.number="orderForm.qty" label="Quantity *" type="number" outlined dense />
          <q-input v-model="orderForm.address" label="Delivery Address *" outlined dense />
          <div v-if="selectedChef" class="text-subtitle1 text-primary">
            Total: ${{ (selectedChef.price * (orderForm.qty || 1)).toFixed(2) }}
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn unelevated color="primary" label="Place Order" @click="placeOrder" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useChefStore, type Chef } from 'src/stores/chef.store'
import { useQuasar } from 'quasar'

const store = useChefStore()
const $q = useQuasar()
const tab = ref('browse')

const cuisineOptions = ['Filipino', 'West African', 'South Indian', 'Sichuan Chinese', 'Japanese', 'Mexican', 'Lebanese', 'Ethiopian', 'Korean', 'Thai', 'Other']

const chefForm = ref({ name: '', cuisine: '', bio: '', price: 15 })
const orderDialog = ref(false)
const selectedChef = ref<Chef | null>(null)
const orderForm = ref({ meal: '', qty: 1, address: '' })

function openOrderDialog(chef: Chef) {
  selectedChef.value = chef
  orderForm.value = { meal: '', qty: 1, address: '' }
  orderDialog.value = true
}

function placeOrder() {
  if (!selectedChef.value || !orderForm.value.meal || !orderForm.value.address) {
    $q.notify({ type: 'negative', message: 'Please fill in all fields' })
    return
  }
  store.addOrder({
    chefId: selectedChef.value.id,
    chefName: selectedChef.value.name,
    meal: orderForm.value.meal,
    qty: orderForm.value.qty,
    address: orderForm.value.address,
    total: selectedChef.value.price * orderForm.value.qty
  })
  orderDialog.value = false
  tab.value = 'orders'
  $q.notify({ type: 'positive', message: 'Order placed successfully!' })
}

function submitChef() {
  if (!chefForm.value.name || !chefForm.value.cuisine || !chefForm.value.bio) {
    $q.notify({ type: 'negative', message: 'Please fill in all required fields' })
    return
  }
  store.addChef({
    name: chefForm.value.name,
    cuisine: chefForm.value.cuisine,
    bio: chefForm.value.bio,
    price: chefForm.value.price
  })
  chefForm.value = { name: '', cuisine: '', bio: '', price: 15 }
  tab.value = 'browse'
  $q.notify({ type: 'positive', message: 'Chef profile created! Welcome aboard.' })
}

function statusColor(status: string) {
  return { pending: 'warning', confirmed: 'info', delivered: 'positive' }[status] || 'grey'
}
</script>
