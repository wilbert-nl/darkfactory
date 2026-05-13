<template>
  <q-page class="q-pa-md">
    <div class="row justify-center">
      <div class="col-12 col-md-10 col-lg-8">
        <q-card class="q-mb-md">
          <q-card-section class="bg-primary text-white">
            <div class="text-h6">Philippines Bureau of Customs — CF4 Form Preparation</div>
            <div class="text-caption">Prepare and autofill your customs declaration form</div>
          </q-card-section>
        </q-card>

        <!-- Stepper -->
        <q-stepper v-model="step" vertical color="primary" animated>
          <!-- Step 1: Importer Details -->
          <q-step :name="1" title="Importer Details" icon="person" :done="step > 1">
            <div class="q-gutter-md">
              <q-select
                v-model="selectedProfile"
                :options="profileOptions"
                label="Load saved profile"
                outlined
                clearable
                @update:model-value="loadProfile"
              />
              <q-input v-model="form.importerName" label="Importer Name / Company *" outlined />
              <q-input v-model="form.tin" label="TIN (Tax Identification Number) *" outlined mask="###-###-###" />
              <q-input v-model="form.cprsNumber" label="CPRS Accreditation Number" outlined />
              <q-input v-model="form.address" label="Business Address *" outlined type="textarea" rows="2" />
              <q-input v-model="form.contactNumber" label="Contact Number" outlined />
              <q-input v-model="form.email" label="Email Address" outlined />
              <q-btn flat color="secondary" icon="save" label="Save as Profile" @click="saveProfile" />
            </div>
            <q-stepper-navigation>
              <q-btn @click="step = 2" color="primary" label="Continue" :disable="!form.importerName || !form.tin" />
            </q-stepper-navigation>
          </q-step>

          <!-- Step 2: Shipment Info -->
          <q-step :name="2" title="Shipment Information" icon="local_shipping" :done="step > 2">
            <div class="q-gutter-md">
              <q-input v-model="form.awbNumber" label="AWB / BL Number *" outlined />
              <q-select
                v-model="form.originCountry"
                :options="countriesList"
                label="Country of Origin *"
                outlined
                use-input
                @filter="filterCountries"
              />
              <q-input v-model="form.arrivalDate" label="Arrival Date *" outlined type="date" />
              <q-input v-model="form.grossWeight" label="Gross Weight (kg) *" outlined type="number" />
              <q-input v-model="form.vessel" label="Vessel / Flight Number" outlined />
              <q-select
                v-model="form.portOfEntry"
                :options="ports"
                label="Port of Entry"
                outlined
              />
              <q-select
                v-model="form.entryType"
                :options="entryTypes"
                label="Entry Type"
                outlined
              />
            </div>
            <q-stepper-navigation>
              <q-btn @click="step = 3" color="primary" label="Continue" :disable="!form.awbNumber || !form.originCountry || !form.arrivalDate" />
              <q-btn flat @click="step = 1" label="Back" class="q-ml-sm" />
            </q-stepper-navigation>
          </q-step>

          <!-- Step 3: Item List -->
          <q-step :name="3" title="Item List" icon="inventory_2" :done="step > 3">
            <div class="q-mb-md">
              <q-btn color="positive" icon="add" label="Add Item" @click="addItem" />
            </div>
            <div v-for="(item, index) in form.items" :key="index" class="q-mb-md">
              <q-card bordered>
                <q-card-section>
                  <div class="row items-center q-mb-sm">
                    <div class="text-subtitle2">Item {{ index + 1 }}</div>
                    <q-space />
                    <q-btn flat round icon="delete" color="negative" size="sm" @click="removeItem(index)" />
                  </div>
                  <div class="q-gutter-sm">
                    <q-input v-model="item.description" label="Description of Goods *" outlined dense />
                    <div class="row q-gutter-sm">
                      <q-input v-model="item.quantity" label="Quantity *" outlined dense type="number" class="col" />
                      <q-select v-model="item.unit" :options="units" label="Unit" outlined dense class="col" />
                    </div>
                    <div class="row q-gutter-sm">
                      <q-input v-model="item.value" label="Customs Value (USD) *" outlined dense type="number" class="col" prefix="$" />
                      <q-select v-model="item.currency" :options="currencies" label="Currency" outlined dense class="col" />
                    </div>
                    <div class="row items-center q-gutter-sm">
                      <q-input v-model="item.hsCode" label="HS Code" outlined dense class="col" placeholder="e.g. 8471.30" />
                      <q-btn
                        color="accent"
                        size="sm"
                        icon="psychology"
                        label="AI Suggest"
                        @click="suggestHsCode(index)"
                        :loading="item.loadingHs"
                      />
                    </div>
                    <q-banner v-if="item.hsSuggestion" class="bg-purple-1 text-purple-9 rounded-borders">
                      <template #avatar>
                        <q-icon name="tips_and_updates" color="accent" />
                      </template>
                      <div class="text-caption text-bold">AI Suggested HS Code: {{ item.hsSuggestion.code }}</div>
                      <div class="text-caption">{{ item.hsSuggestion.description }}</div>
                      <div class="text-caption text-negative q-mt-xs">
                        DISCLAIMER: This is an AI-assisted suggestion only. A licensed customs broker must verify the correct HS code before filing.
                      </div>
                      <template #action>
                        <q-btn flat color="accent" label="Use This Code" @click="applyHsCode(index)" />
                      </template>
                    </q-banner>
                    <q-input v-model="item.countryOfOrigin" label="Country of Origin" outlined dense />
                  </div>
                </q-card-section>
              </q-card>
            </div>
            <q-stepper-navigation>
              <q-btn @click="step = 4" color="primary" label="Review & Export" :disable="form.items.length === 0" />
              <q-btn flat @click="step = 2" label="Back" class="q-ml-sm" />
            </q-stepper-navigation>
          </q-step>

          <!-- Step 4: Review & Print -->
          <q-step :name="4" title="Review & Export" icon="print">
            <q-card bordered class="q-mb-md">
              <q-card-section class="bg-blue-1">
                <div class="text-h6 text-primary">CF4 — Informal Import Entry</div>
                <div class="text-caption text-grey">Republic of the Philippines — Bureau of Customs</div>
              </q-card-section>
              <q-card-section>
                <div class="text-subtitle2 q-mb-sm">Importer Information</div>
                <q-list dense>
                  <q-item>
                    <q-item-section>
                      <q-item-label caption>Importer Name</q-item-label>
                      <q-item-label>{{ form.importerName || '—' }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section>
                      <q-item-label caption>TIN</q-item-label>
                      <q-item-label>{{ form.tin || '—' }}</q-item-label>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label caption>CPRS No.</q-item-label>
                      <q-item-label>{{ form.cprsNumber || '—' }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section>
                      <q-item-label caption>Address</q-item-label>
                      <q-item-label>{{ form.address || '—' }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>

                <q-separator class="q-my-md" />
                <div class="text-subtitle2 q-mb-sm">Shipment Details</div>
                <q-list dense>
                  <q-item>
                    <q-item-section>
                      <q-item-label caption>AWB / BL Number</q-item-label>
                      <q-item-label>{{ form.awbNumber || '—' }}</q-item-label>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label caption>Country of Origin</q-item-label>
                      <q-item-label>{{ form.originCountry || '—' }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section>
                      <q-item-label caption>Arrival Date</q-item-label>
                      <q-item-label>{{ form.arrivalDate || '—' }}</q-item-label>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label caption>Gross Weight</q-item-label>
                      <q-item-label>{{ form.grossWeight ? form.grossWeight + ' kg' : '—' }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section>
                      <q-item-label caption>Port of Entry</q-item-label>
                      <q-item-label>{{ form.portOfEntry || '—' }}</q-item-label>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label caption>Entry Type</q-item-label>
                      <q-item-label>{{ form.entryType || '—' }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>

                <q-separator class="q-my-md" />
                <div class="text-subtitle2 q-mb-sm">Line Items</div>
                <q-table
                  :rows="form.items"
                  :columns="itemColumns"
                  row-key="description"
                  flat
                  bordered
                  dense
                />

                <q-separator class="q-my-md" />
                <div class="row justify-end">
                  <div class="text-h6">Total Customs Value: ${{ totalValue.toFixed(2) }}</div>
                </div>
              </q-card-section>
            </q-card>

            <q-banner class="bg-warning text-white q-mb-md rounded-borders">
              <template #avatar><q-icon name="warning" /></template>
              This form is prepared for reference only. A licensed customs broker must review and submit the official CF4 to the BOC e2m/VASP system.
            </q-banner>

            <div class="row q-gutter-sm">
              <q-btn color="primary" icon="print" label="Print Form" @click="printForm" />
              <q-btn color="secondary" icon="save" label="Save as Template" @click="saveTemplate" />
              <q-btn flat @click="step = 3" label="Back" />
              <q-btn flat color="negative" icon="restart_alt" label="New Form" @click="resetForm" />
            </div>
          </q-step>
        </q-stepper>

        <!-- Saved Templates -->
        <q-card class="q-mt-md" v-if="templates.length > 0">
          <q-card-section>
            <div class="text-h6">Saved Templates</div>
          </q-card-section>
          <q-list>
            <q-item v-for="(tpl, i) in templates" :key="i" clickable v-ripple @click="loadTemplate(tpl)">
              <q-item-section avatar>
                <q-avatar color="primary" text-color="white" icon="description" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ tpl.importerName }} — {{ tpl.awbNumber }}</q-item-label>
                <q-item-label caption>{{ tpl.arrivalDate }} | {{ tpl.items.length }} items</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn flat round icon="delete" color="negative" size="sm" @click.stop="deleteTemplate(i)" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const step = ref(1)

interface LineItem {
  description: string
  quantity: number | null
  unit: string
  value: number | null
  currency: string
  hsCode: string
  countryOfOrigin: string
  hsSuggestion: { code: string; description: string } | null
  loadingHs: boolean
}

interface FormData {
  importerName: string
  tin: string
  cprsNumber: string
  address: string
  contactNumber: string
  email: string
  awbNumber: string
  originCountry: string
  arrivalDate: string
  grossWeight: number | null
  vessel: string
  portOfEntry: string
  entryType: string
  items: LineItem[]
}

const form = ref<FormData>({
  importerName: '',
  tin: '',
  cprsNumber: '',
  address: '',
  contactNumber: '',
  email: '',
  awbNumber: '',
  originCountry: '',
  arrivalDate: '',
  grossWeight: null,
  vessel: '',
  portOfEntry: '',
  entryType: '',
  items: []
})

const selectedProfile = ref(null)
const profiles = ref<any[]>([])
const templates = ref<any[]>([])

const profileOptions = computed(() => profiles.value.map((p, i) => ({ label: p.importerName, value: i })))

const countriesAll = [
  'China', 'United States', 'Japan', 'South Korea', 'Hong Kong',
  'Singapore', 'Taiwan', 'Germany', 'United Kingdom', 'Australia',
  'Thailand', 'Malaysia', 'Indonesia', 'Vietnam', 'India', 'France',
  'Italy', 'Netherlands', 'Canada', 'Mexico', 'Brazil', 'UAE'
]
const filteredCountries = ref([...countriesAll])

function filterCountries(val: string, update: Function) {
  update(() => {
    filteredCountries.value = countriesAll.filter(c => c.toLowerCase().includes(val.toLowerCase()))
  })
}

const countriesList = computed(() => filteredCountries.value)

const ports = ['NAIA (Ninoy Aquino)', 'Manila International Container Port', 'Port of Manila', 'Cebu Port', 'Clark Freeport', 'Subic Bay Freeport']
const entryTypes = ['Informal Entry (Form CF4)', 'Formal Entry', 'Balikbayan Box', 'De Minimis', 'Parcel Post']
const units = ['pcs', 'kgs', 'lbs', 'boxes', 'sets', 'pairs', 'meters', 'liters', 'cartons']
const currencies = ['USD', 'EUR', 'CNY', 'JPY', 'GBP', 'SGD', 'KRW']

const itemColumns = [
  { name: 'description', label: 'Description', field: 'description', align: 'left' as const },
  { name: 'quantity', label: 'Qty', field: 'quantity', align: 'center' as const },
  { name: 'unit', label: 'Unit', field: 'unit', align: 'center' as const },
  { name: 'value', label: 'Value', field: 'value', align: 'right' as const, format: (v: number) => `$${v || 0}` },
  { name: 'hsCode', label: 'HS Code', field: 'hsCode', align: 'center' as const },
  { name: 'countryOfOrigin', label: 'Origin', field: 'countryOfOrigin', align: 'center' as const }
]

const totalValue = computed(() => form.value.items.reduce((sum, item) => sum + (Number(item.value) || 0), 0))

function addItem() {
  form.value.items.push({
    description: '',
    quantity: null,
    unit: 'pcs',
    value: null,
    currency: 'USD',
    hsCode: '',
    countryOfOrigin: '',
    hsSuggestion: null,
    loadingHs: false
  })
}

function removeItem(index: number) {
  form.value.items.splice(index, 1)
}

// Mock AI HS code suggestion
const hsMockData: Record<string, { code: string; description: string }> = {
  default: { code: '9999.99', description: 'Miscellaneous goods — please verify classification with BOC tariff schedule' }
}

const hsCodeDatabase = [
  { keywords: ['laptop', 'computer', 'notebook'], code: '8471.30', desc: 'Portable digital ADP machines weighing not more than 10 kg' },
  { keywords: ['phone', 'mobile', 'smartphone'], code: '8517.12', desc: 'Telephones for cellular networks or wireless networks' },
  { keywords: ['shirt', 'clothing', 'apparel', 'blouse'], code: '6205.20', desc: 'Men\'s or boys\' shirts of cotton' },
  { keywords: ['shoe', 'footwear', 'sneaker'], code: '6403.91', desc: 'Footwear with outer soles of rubber or plastics' },
  { keywords: ['toy', 'doll', 'game'], code: '9503.00', desc: 'Tricycles, scooters, dolls, and other toys' },
  { keywords: ['watch', 'clock'], code: '9102.11', desc: 'Wrist-watches, battery or accumulator powered' },
  { keywords: ['food', 'snack', 'candy'], code: '1704.90', desc: 'Sugar confectionery not containing cocoa' },
  { keywords: ['cosmetic', 'makeup', 'lipstick', 'cream'], code: '3304.10', desc: 'Lip make-up preparations' }
]

async function suggestHsCode(index: number) {
  const item = form.value.items[index]
  if (!item.description) {
    $q.notify({ type: 'warning', message: 'Please enter a description first' })
    return
  }
  item.loadingHs = true
  // Simulate AI delay
  await new Promise(resolve => setTimeout(resolve, 1500))
  const desc = item.description.toLowerCase()
  const match = hsCodeDatabase.find(entry => entry.keywords.some(k => desc.includes(k)))
  item.hsSuggestion = match
    ? { code: match.code, description: match.desc }
    : { code: '9999.99', description: 'Classification requires manual review. Please consult BOC Tariff and Customs Code of the Philippines.' }
  item.loadingHs = false
}

function applyHsCode(index: number) {
  const item = form.value.items[index]
  if (item.hsSuggestion) {
    item.hsCode = item.hsSuggestion.code
    item.hsSuggestion = null
    $q.notify({ type: 'positive', message: 'HS Code applied. Remember to verify with your customs broker.' })
  }
}

function saveProfile() {
  if (!form.value.importerName || !form.value.tin) {
    $q.notify({ type: 'warning', message: 'Name and TIN required to save profile' })
    return
  }
  const profile = {
    importerName: form.value.importerName,
    tin: form.value.tin,
    cprsNumber: form.value.cprsNumber,
    address: form.value.address,
    contactNumber: form.value.contactNumber,
    email: form.value.email
  }
  const idx = profiles.value.findIndex(p => p.tin === profile.tin)
  if (idx >= 0) {
    profiles.value[idx] = profile
  } else {
    profiles.value.push(profile)
  }
  localStorage.setItem('cf4_profiles', JSON.stringify(profiles.value))
  $q.notify({ type: 'positive', message: 'Profile saved!' })
}

function loadProfile(option: any) {
  if (!option) return
  const p = profiles.value[option.value]
  if (p) {
    form.value.importerName = p.importerName
    form.value.tin = p.tin
    form.value.cprsNumber = p.cprsNumber
    form.value.address = p.address
    form.value.contactNumber = p.contactNumber
    form.value.email = p.email
    $q.notify({ type: 'info', message: 'Profile loaded!' })
  }
}

function saveTemplate() {
  templates.value.push(JSON.parse(JSON.stringify(form.value)))
  localStorage.setItem('cf4_templates', JSON.stringify(templates.value))
  $q.notify({ type: 'positive', message: 'Template saved!' })
}

function loadTemplate(tpl: any) {
  Object.assign(form.value, JSON.parse(JSON.stringify(tpl)))
  step.value = 1
  $q.notify({ type: 'info', message: 'Template loaded!' })
}

function deleteTemplate(i: number) {
  templates.value.splice(i, 1)
  localStorage.setItem('cf4_templates', JSON.stringify(templates.value))
}

function printForm() {
  window.print()
}

function resetForm() {
  form.value = {
    importerName: '', tin: '', cprsNumber: '', address: '',
    contactNumber: '', email: '', awbNumber: '', originCountry: '',
    arrivalDate: '', grossWeight: null, vessel: '', portOfEntry: '',
    entryType: '', items: []
  }
  step.value = 1
}

onMounted(() => {
  const savedProfiles = localStorage.getItem('cf4_profiles')
  if (savedProfiles) profiles.value = JSON.parse(savedProfiles)
  const savedTemplates = localStorage.getItem('cf4_templates')
  if (savedTemplates) templates.value = JSON.parse(savedTemplates)
})
</script>
