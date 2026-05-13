<template>
  <q-page padding>
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h5 text-weight-bold">Settings</div>
      <q-btn
        color="primary"
        label="Save Settings"
        icon="save"
        :loading="saving"
        :disable="!isDirty"
        @click="saveSettings"
      />
    </div>

    <q-tabs
      v-model="activeTab"
      dense
      class="text-grey"
      active-color="primary"
      indicator-color="primary"
      align="left"
    >
      <q-tab name="branding" label="Branding" />
      <q-tab name="general" label="General" />
    </q-tabs>

    <q-separator />

    <q-tab-panels v-model="activeTab" animated>
      <!-- Branding Tab -->
      <q-tab-panel name="branding">
        <div class="row q-col-gutter-lg" style="max-width: 640px">
          <!-- Primary Color -->
          <div class="col-12 col-sm-6">
            <div class="text-subtitle2 q-mb-xs">Primary Color</div>
            <div class="row items-center q-gutter-sm">
              <div
                :style="{ width: '36px', height: '36px', borderRadius: '6px', background: form.primaryColor, border: '1px solid rgba(0,0,0,0.15)', cursor: 'pointer', flexShrink: 0 }"
              >
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-color v-model="form.primaryColor" no-header-tabs />
                </q-popup-proxy>
              </div>
              <q-input
                v-model="form.primaryColor"
                dense
                outlined
                class="col"
                placeholder="#000000"
              />
            </div>
          </div>

          <!-- Accent Color -->
          <div class="col-12 col-sm-6">
            <div class="text-subtitle2 q-mb-xs">Accent Color</div>
            <div class="row items-center q-gutter-sm">
              <div
                :style="{ width: '36px', height: '36px', borderRadius: '6px', background: form.accentColor, border: '1px solid rgba(0,0,0,0.15)', cursor: 'pointer', flexShrink: 0 }"
              >
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-color v-model="form.accentColor" no-header-tabs />
                </q-popup-proxy>
              </div>
              <q-input
                v-model="form.accentColor"
                dense
                outlined
                class="col"
                placeholder="#000000"
              />
            </div>
          </div>

          <!-- Font Family -->
          <div class="col-12">
            <q-select
              v-model="form.fontFamily"
              :options="fontOptions"
              label="Font Family"
              outlined
              dense
              emit-value
              map-options
            />
          </div>

          <!-- Logo Upload -->
          <div class="col-12">
            <div class="text-subtitle2 q-mb-xs">Logo</div>
            <div class="row items-center q-gutter-md">
              <q-avatar v-if="form.logoUrl" size="64px" square>
                <img :src="form.logoUrl" alt="Logo preview" />
              </q-avatar>
              <q-file
                v-model="logoFile"
                label="Upload Logo"
                accept="image/*"
                dense
                outlined
                clearable
                style="max-width: 280px"
                @update:model-value="onLogoChange"
              >
                <template #prepend>
                  <q-icon name="image" />
                </template>
              </q-file>
              <q-spinner v-if="uploadingLogo" color="primary" size="24px" />
            </div>
          </div>

          <!-- Preview Strip -->
          <div class="col-12">
            <div class="text-subtitle2 q-mb-xs">Preview</div>
            <div
              :style="{
                background: form.primaryColor,
                color: '#fff',
                fontFamily: form.fontFamily,
                padding: '12px 16px',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: 500,
              }"
            >
              {{ form.tenantName || 'Your Tenant' }} Preview
            </div>
          </div>
        </div>
      </q-tab-panel>

      <!-- General Tab -->
      <q-tab-panel name="general">
        <div class="column q-gutter-md" style="max-width: 480px">
          <q-input
            v-model="form.tenantName"
            label="Tenant Name"
            outlined
            dense
          />

          <q-input
            v-model="form.contactEmail"
            label="Contact Email"
            outlined
            dense
            type="email"
          />

          <q-input
            v-model="form.supportPhone"
            label="Support Phone"
            outlined
            dense
          />

          <q-input
            v-model="form.timezone"
            label="Timezone"
            outlined
            dense
          />
        </div>
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { useQuasar } from 'quasar'
import { tenantService } from 'src/services/tenant.service'
import { useTenantStore } from 'src/stores/tenant-store'
import type { TenantSettings } from 'src/types'

const $q = useQuasar()
const tenantStore = useTenantStore()

// State
const activeTab = ref('branding')
const saving = ref(false)
const uploadingLogo = ref(false)
const logoFile = ref<File | null>(null)

const defaultForm = (): TenantSettings => ({
  tenantName: '',
  primaryColor: '#1976D2',
  accentColor: '#26A69A',
  fontFamily: 'Roboto, sans-serif',
  logoUrl: '',
  contactEmail: '',
  supportPhone: '',
  timezone: 'UTC',
})

const form = ref<TenantSettings>(defaultForm())
const originalForm = ref<TenantSettings>(defaultForm())

const fontOptions = [
  { label: 'Roboto', value: 'Roboto, sans-serif' },
  { label: 'Inter', value: 'Inter, sans-serif' },
  { label: 'Lato', value: 'Lato, sans-serif' },
  { label: 'Open Sans', value: 'Open Sans, sans-serif' },
  { label: 'Montserrat', value: 'Montserrat, sans-serif' },
]

// Dirty tracking
const isDirty = computed(() => {
  return JSON.stringify(form.value) !== JSON.stringify(originalForm.value)
})

// Load settings
async function loadSettings() {
  try {
    const settings = await tenantService.getTenantSettings()
    form.value = { ...defaultForm(), ...settings }
    originalForm.value = { ...form.value }
  } catch {
    $q.notify({ type: 'negative', message: 'Failed to load settings' })
  }
}

// Logo upload
async function onLogoChange(file: File | null) {
  if (!file) return
  uploadingLogo.value = true
  try {
    const result = await tenantService.uploadLogo(file)
    form.value.logoUrl = result.url
    $q.notify({ type: 'positive', message: 'Logo uploaded' })
  } catch {
    $q.notify({ type: 'negative', message: 'Failed to upload logo' })
    logoFile.value = null
  } finally {
    uploadingLogo.value = false
  }
}

// Save settings
async function saveSettings() {
  saving.value = true
  try {
    const result = await tenantService.updateTenantSettings(form.value)
    originalForm.value = { ...form.value }
    tenantStore.setTenant({ ...tenantStore.tenant, ...result })
    $q.notify({ type: 'positive', message: 'Settings saved' })
  } catch {
    $q.notify({ type: 'negative', message: 'Failed to save settings' })
  } finally {
    saving.value = false
  }
}

// Warn on unsaved changes
onBeforeRouteLeave((_to, _from, next) => {
  if (!isDirty.value) {
    next()
    return
  }
  $q.dialog({
    title: 'Unsaved Changes',
    message: 'You have unsaved changes. Are you sure you want to leave?',
    cancel: { label: 'Stay', flat: true },
    ok: { label: 'Leave', color: 'negative' },
    persistent: true,
  })
    .onOk(() => next())
    .onCancel(() => next(false))
})

onMounted(() => {
  void loadSettings()
})
</script>
