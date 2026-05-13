<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-md">
      <!-- Left column: My Wishlists -->
      <div class="col-12 col-md-5">
        <q-card>
          <q-card-section class="bg-pink-7 text-white">
            <div class="row items-center">
              <div class="text-h6">My Wishlists</div>
              <q-space />
              <q-btn flat round icon="add" @click="showCreateWishlist = true" />
            </div>
          </q-card-section>

          <q-card-section v-if="wishlists.length === 0" class="text-center text-grey q-pa-lg">
            <q-icon name="card_giftcard" size="60px" color="pink-3" />
            <div class="q-mt-md">No wishlists yet. Create one!</div>
          </q-card-section>

          <q-list separator v-else>
            <q-expansion-item
              v-for="wl in wishlists"
              :key="wl.id"
              :label="wl.name"
              :caption="`${wl.occasion} · ${wl.date}`"
              icon="card_giftcard"
              expand-separator
              header-class="text-pink-7"
            >
              <template #header>
                <q-item-section avatar>
                  <q-avatar color="pink-1" text-color="pink-7" icon="card_giftcard" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ wl.name }}</q-item-label>
                  <q-item-label caption>{{ wl.occasion }} · {{ wl.date }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <div class="row items-center q-gutter-xs">
                    <q-badge color="pink-7">{{ wl.items.length }} items</q-badge>
                    <q-btn flat round icon="share" size="xs" color="pink-7" @click.stop="shareWishlist(wl)" />
                    <q-btn flat round icon="delete" size="xs" color="negative" @click.stop="deleteWishlist(wl.id)" />
                  </div>
                </q-item-section>
              </template>

              <q-card>
                <q-card-section>
                  <div class="row justify-between items-center q-mb-sm">
                    <div class="text-subtitle2">Items</div>
                    <q-btn size="sm" color="pink-7" icon="add" label="Add Item" @click="openAddItem(wl)" />
                  </div>
                  <q-list v-if="wl.items.length > 0">
                    <q-item v-for="item in wl.items" :key="item.id" class="q-pa-xs">
                      <q-item-section avatar>
                        <q-checkbox v-model="item.received" @update:model-value="saveData" color="positive" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label :class="item.received ? 'text-strike text-grey' : ''">{{ item.name }}</q-item-label>
                        <q-item-label caption>
                          {{ item.price ? '$' + item.price : 'No price' }}
                          <span v-if="item.priority"> · {{ item.priority }}</span>
                        </q-item-label>
                        <q-item-label caption v-if="item.url">
                          <a :href="item.url" target="_blank" class="text-pink-7">View Link</a>
                        </q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <div class="column items-end q-gutter-xs">
                          <q-badge v-if="item.received" color="positive" label="Received" />
                          <q-badge v-else-if="item.claimed" color="warning" label="Claimed" />
                          <q-badge v-if="item.claimed && !item.received" color="grey-4" text-color="grey-7">
                            <q-icon name="lock" size="xs" /> Claimed by someone
                          </q-badge>
                          <q-btn flat round icon="delete" size="xs" color="grey" @click="removeItem(wl, item.id)" />
                        </div>
                      </q-item-section>
                    </q-item>
                  </q-list>
                  <div v-else class="text-grey text-center q-pa-sm">No items yet</div>
                </q-card-section>
              </q-card>
            </q-expansion-item>
          </q-list>
        </q-card>
      </div>

      <!-- Right column: Browse & Claim -->
      <div class="col-12 col-md-7">
        <q-card>
          <q-card-section class="bg-teal text-white">
            <div class="row items-center">
              <div class="text-h6">Browse Wishlists</div>
              <q-space />
              <q-input
                v-model="browseLink"
                dense
                outlined
                dark
                placeholder="Paste wishlist link..."
                style="max-width: 280px"
              >
                <template #append>
                  <q-btn flat round icon="search" size="sm" @click="loadSharedWishlist" />
                </template>
              </q-input>
            </div>
          </q-card-section>

          <q-card-section v-if="sharedWishlist">
            <div class="row items-center q-mb-md">
              <div>
                <div class="text-h6">{{ sharedWishlist.name }}</div>
                <div class="text-caption text-grey">{{ sharedWishlist.occasion }} · {{ sharedWishlist.date }}</div>
              </div>
              <q-space />
              <q-btn flat icon="close" @click="sharedWishlist = null" />
            </div>

            <q-list separator>
              <q-item v-for="item in sharedWishlist.items" :key="item.id">
                <q-item-section avatar>
                  <q-icon
                    :name="item.claimed ? 'check_circle' : 'radio_button_unchecked'"
                    :color="item.claimed ? 'positive' : 'grey'"
                    size="sm"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label :class="item.claimed || item.received ? 'text-strike text-grey' : ''">
                    {{ item.name }}
                  </q-item-label>
                  <q-item-label caption>
                    {{ item.price ? '$' + item.price : 'No price set' }}
                    <q-badge v-if="item.priority" :color="priorityColor(item.priority)" class="q-ml-xs">{{ item.priority }}</q-badge>
                  </q-item-label>
                  <q-item-label caption v-if="item.url">
                    <a :href="item.url" target="_blank" class="text-primary">View item</a>
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <div class="column items-end q-gutter-xs">
                    <q-badge v-if="item.received" color="positive" label="Already Received" />
                    <q-badge v-else-if="item.claimed" color="orange" label="Already Claimed" />
                    <q-btn
                      v-else
                      size="sm"
                      color="teal"
                      label="Claim"
                      icon="volunteer_activism"
                      @click="claimItem(item)"
                    />
                    <q-btn
                      v-if="item.claimed && !item.received"
                      size="sm"
                      flat
                      color="grey"
                      label="Unclaim"
                      @click="unclaimItem(item)"
                    />
                  </div>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>

          <q-card-section v-else class="text-center q-pa-xl">
            <q-icon name="search" size="60px" color="teal-3" />
            <div class="q-mt-md text-grey">Paste a shared wishlist link above, or share your own via the button on a wishlist</div>
            <div class="q-mt-lg text-subtitle2">Your Wishlists (shareable)</div>
            <q-list dense class="q-mt-sm">
              <q-item v-for="wl in wishlists" :key="wl.id" clickable v-ripple @click="previewWishlist(wl)">
                <q-item-section>
                  <q-item-label>{{ wl.name }}</q-item-label>
                  <q-item-label caption>{{ wl.items.length }} items · {{ wl.occasion }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn flat round icon="share" size="sm" color="teal" @click.stop="shareWishlist(wl)" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>

        <!-- Gift Log -->
        <q-card class="q-mt-md">
          <q-card-section class="bg-purple-7 text-white">
            <div class="text-h6">Gift History Log</div>
          </q-card-section>
          <q-card-section>
            <q-btn color="purple-7" icon="add" label="Log a Gift" @click="showLogGift = true" class="q-mb-md" />
            <q-list v-if="giftLog.length > 0" separator>
              <q-item v-for="(entry, i) in giftLog" :key="i">
                <q-item-section avatar>
                  <q-avatar :color="entry.direction === 'given' ? 'purple-3' : 'teal-3'" text-color="white" size="sm">
                    <q-icon :name="entry.direction === 'given' ? 'send' : 'inbox'" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ entry.giftName }}</q-item-label>
                  <q-item-label caption>
                    {{ entry.direction === 'given' ? 'Gave to' : 'Received from' }} {{ entry.person }} · {{ entry.occasion }} · {{ entry.date }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-badge :color="entry.direction === 'given' ? 'purple' : 'teal'">{{ entry.direction }}</q-badge>
                </q-item-section>
              </q-item>
            </q-list>
            <div v-else class="text-grey text-center">No gift history yet</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Create Wishlist Dialog -->
    <q-dialog v-model="showCreateWishlist">
      <q-card style="min-width: 350px">
        <q-card-section class="bg-pink-7 text-white">
          <div class="text-h6">Create Wishlist</div>
        </q-card-section>
        <q-card-section class="q-gutter-md">
          <q-input v-model="newWishlist.name" label="Wishlist Name *" outlined />
          <q-select v-model="newWishlist.occasion" :options="occasions" label="Occasion" outlined />
          <q-input v-model="newWishlist.date" label="Event Date" outlined type="date" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn color="pink-7" label="Create" @click="createWishlist" :disable="!newWishlist.name" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Add Item Dialog -->
    <q-dialog v-model="showAddItem">
      <q-card style="min-width: 350px">
        <q-card-section class="bg-pink-7 text-white">
          <div class="text-h6">Add Item to Wishlist</div>
        </q-card-section>
        <q-card-section class="q-gutter-md">
          <q-input v-model="newItem.name" label="Item Name *" outlined />
          <q-input v-model="newItem.url" label="URL / Link" outlined />
          <q-input v-model="newItem.price" label="Price (USD)" outlined type="number" prefix="$" />
          <q-select v-model="newItem.priority" :options="['Must Have', 'Nice to Have', 'Low Priority']" label="Priority" outlined />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn color="pink-7" label="Add" @click="addItem" :disable="!newItem.name" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Log Gift Dialog -->
    <q-dialog v-model="showLogGift">
      <q-card style="min-width: 350px">
        <q-card-section class="bg-purple-7 text-white">
          <div class="text-h6">Log a Gift</div>
        </q-card-section>
        <q-card-section class="q-gutter-md">
          <q-select v-model="newLog.direction" :options="['given', 'received']" label="Direction" outlined />
          <q-input v-model="newLog.giftName" label="Gift Name *" outlined />
          <q-input v-model="newLog.person" :label="newLog.direction === 'given' ? 'Given to' : 'Received from'" outlined />
          <q-select v-model="newLog.occasion" :options="occasions" label="Occasion" outlined />
          <q-input v-model="newLog.date" label="Date" outlined type="date" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn color="purple-7" label="Log Gift" @click="logGift" :disable="!newLog.giftName" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

interface WishlistItem {
  id: string
  name: string
  url: string
  price: number | null
  priority: string
  claimed: boolean
  received: boolean
}

interface Wishlist {
  id: string
  name: string
  occasion: string
  date: string
  items: WishlistItem[]
}

interface GiftLogEntry {
  direction: 'given' | 'received'
  giftName: string
  person: string
  occasion: string
  date: string
}

const wishlists = ref<Wishlist[]>([])
const giftLog = ref<GiftLogEntry[]>([])
const sharedWishlist = ref<Wishlist | null>(null)
const browseLink = ref('')

const showCreateWishlist = ref(false)
const showAddItem = ref(false)
const showLogGift = ref(false)
const activeWishlist = ref<Wishlist | null>(null)

const occasions = ['Birthday', 'Christmas', 'Wedding', 'Baby Shower', 'Anniversary', 'Graduation', 'Holiday', 'Other']

const newWishlist = ref({ name: '', occasion: 'Birthday', date: '' })
const newItem = ref({ name: '', url: '', price: null as number | null, priority: 'Nice to Have' })
const newLog = ref({ direction: 'given' as 'given' | 'received', giftName: '', person: '', occasion: 'Birthday', date: '' })

function priorityColor(p: string) {
  if (p === 'Must Have') return 'negative'
  if (p === 'Nice to Have') return 'warning'
  return 'grey'
}

function saveData() {
  localStorage.setItem('gc_wishlists', JSON.stringify(wishlists.value))
  localStorage.setItem('gc_log', JSON.stringify(giftLog.value))
}

function createWishlist() {
  const wl: Wishlist = {
    id: Date.now().toString(),
    name: newWishlist.value.name,
    occasion: newWishlist.value.occasion,
    date: newWishlist.value.date,
    items: []
  }
  wishlists.value.push(wl)
  saveData()
  showCreateWishlist.value = false
  newWishlist.value = { name: '', occasion: 'Birthday', date: '' }
  $q.notify({ type: 'positive', message: 'Wishlist created!' })
}

function deleteWishlist(id: string) {
  wishlists.value = wishlists.value.filter(w => w.id !== id)
  saveData()
}

function openAddItem(wl: Wishlist) {
  activeWishlist.value = wl
  showAddItem.value = true
}

function addItem() {
  if (!activeWishlist.value) return
  activeWishlist.value.items.push({
    id: Date.now().toString(),
    name: newItem.value.name,
    url: newItem.value.url,
    price: newItem.value.price,
    priority: newItem.value.priority,
    claimed: false,
    received: false
  })
  saveData()
  showAddItem.value = false
  newItem.value = { name: '', url: '', price: null, priority: 'Nice to Have' }
  $q.notify({ type: 'positive', message: 'Item added!' })
}

function removeItem(wl: Wishlist, itemId: string) {
  wl.items = wl.items.filter(i => i.id !== itemId)
  saveData()
}

function shareWishlist(wl: Wishlist) {
  // In a real app this would be a server URL; here we encode in hash
  const data = btoa(JSON.stringify(wl))
  const shareUrl = `${window.location.origin}${window.location.pathname}#/shared?data=${data}`
  navigator.clipboard.writeText(shareUrl).then(() => {
    $q.notify({ type: 'positive', message: 'Wishlist link copied to clipboard!' })
  })
}

function loadSharedWishlist() {
  try {
    // Try to extract data param from link
    const url = new URL(browseLink.value)
    const hashPart = url.hash || ''
    const dataMatch = hashPart.match(/data=([^&]+)/)
    if (dataMatch) {
      sharedWishlist.value = JSON.parse(atob(dataMatch[1]))
      browseLink.value = ''
    } else {
      $q.notify({ type: 'warning', message: 'Invalid wishlist link' })
    }
  } catch {
    $q.notify({ type: 'negative', message: 'Could not load wishlist from link' })
  }
}

function previewWishlist(wl: Wishlist) {
  sharedWishlist.value = JSON.parse(JSON.stringify(wl))
}

function claimItem(item: WishlistItem) {
  item.claimed = true
  // Update in the actual wishlist if it's ours
  for (const wl of wishlists.value) {
    const found = wl.items.find(i => i.id === item.id)
    if (found) {
      found.claimed = true
      saveData()
      break
    }
  }
  $q.notify({ type: 'positive', message: `You claimed "${item.name}"! The recipient won't see who claimed it.` })
}

function unclaimItem(item: WishlistItem) {
  item.claimed = false
  for (const wl of wishlists.value) {
    const found = wl.items.find(i => i.id === item.id)
    if (found) {
      found.claimed = false
      saveData()
      break
    }
  }
  $q.notify({ type: 'info', message: 'Item unclaimed' })
}

function logGift() {
  giftLog.value.unshift({ ...newLog.value })
  saveData()
  showLogGift.value = false
  newLog.value = { direction: 'given', giftName: '', person: '', occasion: 'Birthday', date: '' }
  $q.notify({ type: 'positive', message: 'Gift logged!' })
}

onMounted(() => {
  const wls = localStorage.getItem('gc_wishlists')
  if (wls) wishlists.value = JSON.parse(wls)
  const log = localStorage.getItem('gc_log')
  if (log) giftLog.value = JSON.parse(log)
})
</script>
