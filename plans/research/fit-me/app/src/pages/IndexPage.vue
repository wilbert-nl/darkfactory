<template>
  <q-page class="q-pa-md">
    <!-- Hero -->
    <div class="text-center q-mb-lg">
      <div class="text-h4 text-weight-bold text-primary q-mb-sm">Try Before You Buy</div>
      <div class="text-subtitle1 text-grey-7">Upload your photo and virtually try on any clothing item instantly</div>
    </div>

    <div class="row q-col-gutter-md">
      <!-- Left: Selfie Upload + Try-On Panel -->
      <div class="col-12 col-md-5">
        <!-- Selfie Upload -->
        <q-card flat bordered class="q-mb-md">
          <q-card-section>
            <div class="text-h6 q-mb-sm"><q-icon name="person" class="q-mr-sm text-primary" />Your Photo</div>
            <div class="upload-zone" @click="fileInput?.click()" :class="{'has-photo': selfieFile}">
              <div v-if="!selfieFile" class="text-center q-pa-lg">
                <q-icon name="add_photo_alternate" size="3rem" color="grey-4" />
                <div class="text-grey-6 q-mt-sm text-caption">Upload full-body photo</div>
              </div>
              <img v-else :src="selfiePreview" class="selfie-img" />
            </div>
            <input ref="fileInput" type="file" accept="image/*" style="display:none" @change="onFileChange" />
            <q-btn v-if="selfieFile" flat color="negative" icon="delete" label="Remove" @click="selfieFile=null;selfiePreview=''" size="sm" class="q-mt-sm" />
          </q-card-section>
        </q-card>

        <!-- Try-On Result -->
        <q-card v-if="tryOnResult" flat bordered class="q-mb-md">
          <q-card-section>
            <div class="text-h6 q-mb-sm"><q-icon name="auto_awesome" class="q-mr-sm text-accent" />Try-On Result</div>
            <div class="row q-gutter-sm">
              <div class="col">
                <div class="text-caption text-grey-6 text-center q-mb-xs">Your Photo</div>
                <div class="result-placeholder" style="background:#f5f5f5">
                  <q-icon name="person" size="4rem" color="grey-4" />
                </div>
              </div>
              <div class="col">
                <div class="text-caption text-grey-6 text-center q-mb-xs">With Item</div>
                <q-img :src="tryOnResult" style="border-radius:8px" />
              </div>
            </div>
            <div class="row q-gutter-xs q-mt-sm">
              <q-btn flat icon="favorite_border" color="primary" size="sm" @click="saveToWishlist" label="Wishlist" />
              <q-btn flat icon="share" color="secondary" size="sm" label="Share" @click="$q.notify({type:'info',message:'Share link copied!'})" />
              <q-btn flat icon="download" color="positive" size="sm" label="Save" />
            </div>
          </q-card-section>
        </q-card>

        <!-- Wishlist -->
        <q-card v-if="wardrobe.items.length" flat bordered>
          <q-card-section>
            <div class="text-h6 q-mb-sm"><q-icon name="favorite" class="q-mr-sm text-negative" />Wishlist ({{ wardrobe.items.length }})</div>
            <q-list dense>
              <q-item v-for="item in wardrobe.items.slice(0,5)" :key="item.id">
                <q-item-section avatar>
                  <q-avatar>
                    <img :src="item.productImage" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ item.productName }}</q-item-label>
                  <q-item-label caption>Size: {{ item.size }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn flat round icon="close" size="xs" @click="wardrobe.removeItem(item.id)" />
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <!-- Right: Product Catalog -->
      <div class="col-12 col-md-7">
        <q-card flat bordered>
          <q-card-section>
            <div class="row items-center q-mb-md">
              <div class="text-h6"><q-icon name="storefront" class="q-mr-sm text-secondary" />Product Catalog</div>
              <q-space />
              <q-select
                v-model="filterCategory"
                :options="['All', 'Tops', 'Bottoms', 'Dresses', 'Outerwear', 'Shoes']"
                outlined
                dense
                style="min-width:120px"
              />
            </div>

            <div class="row q-gutter-md">
              <q-card
                v-for="product in filteredProducts"
                :key="product.id"
                class="col-5 col-sm-3 product-card"
                flat
                bordered
                :class="{ 'product-selected': selectedProduct === product.id }"
              >
                <q-img :src="product.image" :ratio="3/4" />
                <q-card-section class="q-pa-sm">
                  <div class="text-weight-bold text-caption">{{ product.name }}</div>
                  <div class="text-caption text-grey-7">{{ product.brand }}</div>
                  <div class="row items-center q-mt-xs">
                    <div class="text-primary text-weight-bold">${{ product.price }}</div>
                    <q-space />
                    <q-chip :color="categoryColor(product.category)" text-color="white" size="xs">{{ product.category }}</q-chip>
                  </div>
                </q-card-section>
                <q-card-actions class="q-pa-xs">
                  <q-select
                    v-model="product.selectedSize"
                    :options="product.sizes"
                    outlined
                    dense
                    style="width:70px;font-size:12px"
                  />
                  <q-space />
                  <q-btn
                    color="primary"
                    icon="checkroom"
                    label="Try On"
                    size="xs"
                    unelevated
                    :disable="!selfieFile"
                    :loading="tryingOn === product.id"
                    @click="tryOn(product)"
                  />
                </q-card-actions>
              </q-card>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useWardrobeStore } from 'src/stores/wardrobe.store'

const $q = useQuasar()
const wardrobe = useWardrobeStore()

const selfieFile = ref<File | null>(null)
const selfiePreview = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const selectedProduct = ref('')
const tryOnResult = ref('')
const tryingOn = ref('')
const filterCategory = ref('All')

interface Product {
  id: string
  name: string
  brand: string
  price: number
  category: string
  image: string
  sizes: string[]
  selectedSize: string
}

const products = ref<Product[]>([
  { id: '1', name: 'Classic White Tee', brand: 'Essentials', price: 29, category: 'Tops', image: 'https://picsum.photos/seed/top1/200/270', sizes: ['XS','S','M','L','XL'], selectedSize: 'M' },
  { id: '2', name: 'Slim Fit Jeans', brand: 'Denim Co.', price: 79, category: 'Bottoms', image: 'https://picsum.photos/seed/bot1/200/270', sizes: ['28','30','32','34','36'], selectedSize: '32' },
  { id: '3', name: 'Floral Sundress', brand: 'Bloom', price: 59, category: 'Dresses', image: 'https://picsum.photos/seed/dress1/200/270', sizes: ['XS','S','M','L'], selectedSize: 'S' },
  { id: '4', name: 'Leather Jacket', brand: 'UrbanEdge', price: 149, category: 'Outerwear', image: 'https://picsum.photos/seed/jack1/200/270', sizes: ['S','M','L','XL'], selectedSize: 'M' },
  { id: '5', name: 'Striped Blouse', brand: 'Moderno', price: 45, category: 'Tops', image: 'https://picsum.photos/seed/top2/200/270', sizes: ['XS','S','M','L'], selectedSize: 'M' },
  { id: '6', name: 'High-waist Skirt', brand: 'Chic Lab', price: 55, category: 'Bottoms', image: 'https://picsum.photos/seed/bot2/200/270', sizes: ['XS','S','M','L','XL'], selectedSize: 'S' },
  { id: '7', name: 'Wool Overcoat', brand: 'Nordic', price: 199, category: 'Outerwear', image: 'https://picsum.photos/seed/coat1/200/270', sizes: ['S','M','L'], selectedSize: 'M' },
  { id: '8', name: 'Mini Wrap Dress', brand: 'Bloom', price: 69, category: 'Dresses', image: 'https://picsum.photos/seed/dress2/200/270', sizes: ['XS','S','M','L'], selectedSize: 'M' },
  { id: '9', name: 'Sneakers', brand: 'StepUp', price: 89, category: 'Shoes', image: 'https://picsum.photos/seed/shoe1/200/270', sizes: ['36','37','38','39','40','41','42'], selectedSize: '39' },
])

const filteredProducts = computed(() =>
  filterCategory.value === 'All' ? products.value : products.value.filter(p => p.category === filterCategory.value)
)

function categoryColor(cat: string) {
  const map: Record<string, string> = { Tops: 'blue', Bottoms: 'indigo', Dresses: 'pink', Outerwear: 'brown', Shoes: 'teal' }
  return map[cat] || 'grey'
}

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) { selfieFile.value = file; selfiePreview.value = URL.createObjectURL(file) }
}

async function tryOn(product: Product) {
  if (!selfieFile.value) {
    $q.notify({ type: 'warning', message: 'Please upload your photo first!' })
    return
  }
  tryingOn.value = product.id
  selectedProduct.value = product.id
  await new Promise(r => setTimeout(r, 2500))
  tryOnResult.value = `https://picsum.photos/seed/${product.id}${Date.now()}/300/400`
  tryingOn.value = ''
  $q.notify({ type: 'positive', message: `Try-on complete for "${product.name}"!` })
}

function saveToWishlist() {
  const product = products.value.find(p => p.id === selectedProduct.value)
  if (!product) return
  wardrobe.addItem({
    productName: product.name,
    productImage: product.image,
    resultImage: tryOnResult.value,
    size: product.selectedSize
  })
  $q.notify({ type: 'positive', message: 'Added to wishlist!' })
}
</script>

<style scoped>
.upload-zone {
  border: 2px dashed #ccc;
  border-radius: 12px;
  cursor: pointer;
  min-height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: border-color 0.2s;
}
.upload-zone:hover { border-color: var(--q-primary); }
.upload-zone.has-photo { border-style: solid; border-color: var(--q-positive); }
.selfie-img { width: 100%; object-fit: cover; max-height: 240px; }
.product-card { cursor: pointer; transition: all 0.2s; }
.product-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.12); }
.product-selected { border: 2px solid var(--q-primary) !important; }
.result-placeholder { height: 160px; display: flex; align-items: center; justify-content: center; border-radius: 8px; }
</style>
