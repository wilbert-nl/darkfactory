<template>
  <q-page class="q-pa-md">
    <!-- Header -->
    <div class="q-mb-lg">
      <div class="text-h4 text-weight-bold q-mb-xs">{{ tenant?.name }} — Products</div>
      <div class="text-subtitle1 text-grey-6">Browse and book available products</div>
    </div>

    <!-- Search -->
    <q-input
      v-model="searchQuery"
      outlined
      dense
      placeholder="Search products..."
      class="q-mb-md"
      clearable
      style="max-width: 400px"
    >
      <template #prepend>
        <q-icon name="search" />
      </template>
    </q-input>

    <!-- Category filter chips -->
    <div class="q-mb-lg q-gutter-sm">
      <q-chip
        :selected="selectedCategory === null"
        clickable
        color="primary"
        text-color="white"
        @click="selectedCategory = null"
      >
        All
      </q-chip>
      <q-chip
        v-for="category in categories"
        :key="category"
        :selected="selectedCategory === category"
        clickable
        color="primary"
        text-color="white"
        @click="selectedCategory = category"
      >
        {{ category }}
      </q-chip>
    </div>

    <!-- Skeleton loading state -->
    <div v-if="loading" class="row q-col-gutter-md">
      <div
        v-for="n in 6"
        :key="n"
        class="col-12 col-sm-6 col-md-4"
      >
        <q-card>
          <q-skeleton height="180px" square />
          <q-card-section>
            <q-skeleton type="text" class="text-h6" />
            <q-skeleton type="text" width="60%" />
            <q-skeleton type="text" width="40%" />
          </q-card-section>
          <q-card-actions>
            <q-skeleton type="QBtn" />
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <!-- Product grid -->
    <div v-else-if="filteredProducts.length > 0" class="row q-col-gutter-md">
      <div
        v-for="product in filteredProducts"
        :key="product.id"
        class="col-12 col-sm-6 col-md-4"
      >
        <q-card class="full-height column">
          <!-- Product image -->
          <q-img
            v-if="product.imageUrl"
            :src="product.imageUrl"
            :ratio="16 / 9"
          >
            <template #error>
              <div class="absolute-full flex flex-center bg-grey-3">
                <q-icon name="image_not_supported" size="48px" color="grey-5" />
              </div>
            </template>
          </q-img>
          <div v-else class="bg-grey-3 flex flex-center" style="height: 180px">
            <q-icon name="image" size="48px" color="grey-5" />
          </div>

          <q-card-section class="col">
            <div class="row items-center q-mb-xs">
              <div class="text-h6 col">{{ product.name }}</div>
            </div>
            <q-badge
              v-if="product.category"
              color="secondary"
              class="q-mb-sm"
              :label="product.category"
            />
            <div class="text-h6 text-primary text-weight-bold">
              ${{ (product.price / 100).toFixed(2) }}
            </div>
            <div v-if="product.description" class="text-body2 text-grey-7 q-mt-xs ellipsis-2-lines">
              {{ product.description }}
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn
              color="primary"
              label="Book Now"
              unelevated
              @click="router.push('/book?productId=' + product.id)"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="column items-center justify-center q-py-xl text-center">
      <q-icon name="inventory_2" size="64px" color="grey-4" />
      <div class="text-h6 text-grey-6 q-mt-md">No products found</div>
      <div class="text-body2 text-grey-5 q-mt-xs">
        {{ searchQuery || selectedCategory ? 'Try adjusting your search or filters.' : 'No products are available at this time.' }}
      </div>
      <q-btn
        v-if="searchQuery || selectedCategory"
        flat
        color="primary"
        label="Clear filters"
        class="q-mt-md"
        @click="clearFilters"
      />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMeta } from 'quasar'
import { useRouter } from 'vue-router'
import { productsService } from 'src/services/products.service'
import { useTenant } from 'src/composables/useTenant'
import type { Product } from 'src/types'

const router = useRouter()
const { tenant } = useTenant()

const products = ref<Product[]>([])
const loading = ref(false)
const searchQuery = ref('')
const selectedCategory = ref<string | null>(null)

useMeta(() => ({
  title: tenant.value ? `${tenant.value.name} — Products` : 'Products',
}))

const categories = computed<string[]>(() => {
  const cats = products.value
    .map((p) => p.category)
    .filter((c): c is string => Boolean(c))
  return [...new Set(cats)].sort()
})

const filteredProducts = computed(() => {
  let result = products.value

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter((p) => p.name.toLowerCase().includes(q))
  }

  if (selectedCategory.value) {
    result = result.filter((p) => p.category === selectedCategory.value)
  }

  return result
})

function clearFilters() {
  searchQuery.value = ''
  selectedCategory.value = null
}

async function loadProducts() {
  loading.value = true
  try {
    const response = await productsService.listPublic({ limit: 100 })
    products.value = response.data ?? response
  } catch (err) {
    console.error('Failed to load products:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void loadProducts()
})
</script>
