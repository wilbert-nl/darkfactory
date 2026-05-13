<template>
  <q-page padding>
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h5 text-weight-bold">Products</div>
      <q-btn
        color="primary"
        icon="add"
        label="New Product"
        @click="openCreateDialog"
      />
    </div>

    <q-tabs v-model="activeTab" dense class="text-grey" active-color="primary" indicator-color="primary" align="left">
      <q-tab name="products" label="Products" />
      <q-tab name="categories" label="Categories" />
    </q-tabs>

    <q-separator />

    <q-tab-panels v-model="activeTab" animated>
      <!-- Products Panel -->
      <q-tab-panel name="products" class="q-pa-none q-pt-md">
        <q-table
          :rows="products"
          :columns="columns"
          row-key="id"
          :loading="loading"
          v-model:pagination="pagination"
          @request="onRequest"
          binary-state-sort
        >
          <template #body-cell-category="props">
            <q-td :props="props">
              {{ getCategoryName(props.row.categoryId) }}
            </q-td>
          </template>

          <template #body-cell-price="props">
            <q-td :props="props">
              ${{ (props.row.price / 100).toFixed(2) }}
            </q-td>
          </template>

          <template #body-cell-status="props">
            <q-td :props="props">
              <q-toggle
                :model-value="props.row.isActive"
                @update:model-value="toggleStatus(props.row)"
                color="positive"
                dense
              />
            </q-td>
          </template>

          <template #body-cell-actions="props">
            <q-td :props="props">
              <q-btn
                flat
                round
                dense
                icon="edit"
                color="primary"
                class="q-mr-xs"
                @click="openEditDialog(props.row)"
              >
                <q-tooltip>Edit</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                dense
                icon="delete"
                color="negative"
                @click="confirmDelete(props.row)"
              >
                <q-tooltip>Delete</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-tab-panel>

      <!-- Categories Panel -->
      <q-tab-panel name="categories" class="q-pa-none q-pt-md">
        <div class="row items-center q-mb-md" style="max-width: 480px">
          <q-input
            v-model="newCategoryName"
            label="Category name"
            dense
            outlined
            class="col"
            @keyup.enter="addCategory"
          />
          <q-btn
            color="primary"
            icon="add"
            label="Add"
            class="q-ml-sm"
            :loading="addingCategory"
            @click="addCategory"
          />
        </div>

        <q-list bordered separator style="max-width: 480px">
          <q-item v-if="categories.length === 0">
            <q-item-section>
              <q-item-label class="text-grey">No categories yet</q-item-label>
            </q-item-section>
          </q-item>
          <q-item v-for="cat in categories" :key="cat.id">
            <q-item-section>
              <q-item-label>{{ cat.name }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn
                flat
                round
                dense
                icon="delete"
                color="negative"
                @click="confirmDeleteCategory(cat)"
              />
            </q-item-section>
          </q-item>
        </q-list>
      </q-tab-panel>
    </q-tab-panels>

    <!-- Create / Edit Dialog -->
    <q-dialog v-model="dialogOpen" persistent>
      <q-card style="min-width: 480px; max-width: 600px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ editingProduct ? 'Edit Product' : 'New Product' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form ref="productForm" @submit.prevent="submitProduct" class="q-gutter-md">
            <q-input
              v-model="form.name"
              label="Name *"
              outlined
              dense
              :rules="[val => !!val || 'Name is required']"
              lazy-rules
            />

            <q-input
              v-model="form.description"
              label="Description"
              outlined
              dense
              type="textarea"
              rows="3"
            />

            <q-input
              v-model="form.priceDisplay"
              label="Price"
              outlined
              dense
              type="number"
              step="0.01"
              min="0"
              prefix="$"
            />

            <q-select
              v-model="form.categoryId"
              :options="categoryOptions"
              label="Category"
              outlined
              dense
              clearable
              emit-value
              map-options
            />

            <div class="row items-center">
              <span class="text-body2 q-mr-sm">Active</span>
              <q-toggle v-model="form.isActive" color="positive" />
            </div>

            <q-input
              v-model="form.metadataRaw"
              label="Metadata (JSON)"
              outlined
              dense
              type="textarea"
              rows="4"
              :rules="[validateJson]"
              lazy-rules
              hint="Must be valid JSON"
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right" class="q-px-md q-pb-md">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn
            color="primary"
            :label="editingProduct ? 'Save Changes' : 'Create'"
            :loading="saving"
            @click="submitProduct"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuasar, QTableProps } from 'quasar'
import { productsService } from 'src/services/products.service'
import type { Product, ProductCategory, CreateProductDto } from 'src/types'

const $q = useQuasar()

// State
const products = ref<Product[]>([])
const categories = ref<ProductCategory[]>([])
const loading = ref(false)
const saving = ref(false)
const dialogOpen = ref(false)
const editingProduct = ref<Product | null>(null)
const activeTab = ref('products')
const newCategoryName = ref('')
const addingCategory = ref(false)

const pagination = ref({
  page: 1,
  rowsPerPage: 15,
  rowsNumber: 0,
  sortBy: 'name',
  descending: false,
})

const form = ref({
  name: '',
  description: '',
  priceDisplay: '0.00',
  categoryId: null as string | null,
  isActive: true,
  metadataRaw: '{}',
})

// Table columns
const columns: QTableProps['columns'] = [
  { name: 'name', label: 'Name', field: 'name', sortable: true, align: 'left' },
  { name: 'category', label: 'Category', field: 'categoryId', align: 'left' },
  { name: 'price', label: 'Price', field: 'price', sortable: true, align: 'right' },
  { name: 'status', label: 'Active', field: 'isActive', align: 'center' },
  { name: 'actions', label: 'Actions', field: 'id', align: 'center' },
]

// Computed
const categoryOptions = computed(() =>
  categories.value.map(c => ({ label: c.name, value: c.id }))
)

function getCategoryName(categoryId: string | null | undefined): string {
  if (!categoryId) return '—'
  return categories.value.find(c => c.id === categoryId)?.name ?? '—'
}

// Data fetching
async function loadCategories() {
  try {
    categories.value = await productsService.getCategories()
  } catch {
    $q.notify({ type: 'negative', message: 'Failed to load categories' })
  }
}

async function loadProducts(page = 1, rowsPerPage = 15, sortBy = 'name', descending = false) {
  loading.value = true
  try {
    const result = await productsService.findAll({ page, limit: rowsPerPage, sortBy, descending })
    products.value = result.data
    pagination.value.rowsNumber = result.total
  } catch {
    $q.notify({ type: 'negative', message: 'Failed to load products' })
  } finally {
    loading.value = false
  }
}

function onRequest(props: { pagination: typeof pagination.value }) {
  const { page, rowsPerPage, sortBy, descending } = props.pagination
  pagination.value = { ...pagination.value, page, rowsPerPage, sortBy, descending }
  void loadProducts(page, rowsPerPage, sortBy, descending)
}

// Dialog helpers
function resetForm() {
  form.value = {
    name: '',
    description: '',
    priceDisplay: '0.00',
    categoryId: null,
    isActive: true,
    metadataRaw: '{}',
  }
}

function openCreateDialog() {
  editingProduct.value = null
  resetForm()
  dialogOpen.value = true
}

function openEditDialog(product: Product) {
  editingProduct.value = product
  form.value = {
    name: product.name,
    description: product.description ?? '',
    priceDisplay: (product.price / 100).toFixed(2),
    categoryId: product.categoryId ?? null,
    isActive: product.isActive,
    metadataRaw: product.metadata ? JSON.stringify(product.metadata, null, 2) : '{}',
  }
  dialogOpen.value = true
}

function validateJson(val: string): true | string {
  if (!val || val.trim() === '') return true
  try {
    JSON.parse(val)
    return true
  } catch {
    return 'Must be valid JSON'
  }
}

// Submit product
async function submitProduct() {
  const jsonError = validateJson(form.value.metadataRaw)
  if (jsonError !== true) {
    $q.notify({ type: 'negative', message: jsonError })
    return
  }

  saving.value = true
  try {
    const dto: CreateProductDto = {
      name: form.value.name,
      description: form.value.description || undefined,
      price: Math.round(parseFloat(form.value.priceDisplay) * 100),
      categoryId: form.value.categoryId ?? undefined,
      isActive: form.value.isActive,
      metadata: form.value.metadataRaw ? JSON.parse(form.value.metadataRaw) : undefined,
    }

    if (editingProduct.value) {
      await productsService.update(editingProduct.value.id, dto)
      $q.notify({ type: 'positive', message: 'Product updated' })
    } else {
      await productsService.create(dto)
      $q.notify({ type: 'positive', message: 'Product created' })
    }

    dialogOpen.value = false
    void loadProducts(pagination.value.page, pagination.value.rowsPerPage)
  } catch {
    $q.notify({ type: 'negative', message: 'Failed to save product' })
  } finally {
    saving.value = false
  }
}

// Delete product
function confirmDelete(product: Product) {
  $q.dialog({
    title: 'Delete Product',
    message: `Are you sure you want to delete "${product.name}"? This cannot be undone.`,
    cancel: true,
    persistent: true,
    ok: { color: 'negative', label: 'Delete' },
  }).onOk(async () => {
    try {
      await productsService.remove(product.id)
      $q.notify({ type: 'positive', message: 'Product deleted' })
      void loadProducts(pagination.value.page, pagination.value.rowsPerPage)
    } catch {
      $q.notify({ type: 'negative', message: 'Failed to delete product' })
    }
  })
}

// Toggle status
async function toggleStatus(product: Product) {
  try {
    await productsService.update(product.id, { isActive: !product.isActive })
    product.isActive = !product.isActive
  } catch {
    $q.notify({ type: 'negative', message: 'Failed to update status' })
  }
}

// Category management
async function addCategory() {
  const name = newCategoryName.value.trim()
  if (!name) return
  addingCategory.value = true
  try {
    const created = await productsService.createCategory(name)
    categories.value.push(created)
    newCategoryName.value = ''
    $q.notify({ type: 'positive', message: 'Category added' })
  } catch {
    $q.notify({ type: 'negative', message: 'Failed to add category' })
  } finally {
    addingCategory.value = false
  }
}

function confirmDeleteCategory(cat: ProductCategory) {
  $q.dialog({
    title: 'Delete Category',
    message: `Delete category "${cat.name}"? Products in this category will become uncategorized.`,
    cancel: true,
    persistent: true,
    ok: { color: 'negative', label: 'Delete' },
  }).onOk(async () => {
    try {
      await productsService.deleteCategory(cat.id)
      categories.value = categories.value.filter(c => c.id !== cat.id)
      $q.notify({ type: 'positive', message: 'Category deleted' })
    } catch {
      $q.notify({ type: 'negative', message: 'Failed to delete category' })
    }
  })
}

// Mount
onMounted(async () => {
  await loadCategories()
  await loadProducts()
})
</script>
