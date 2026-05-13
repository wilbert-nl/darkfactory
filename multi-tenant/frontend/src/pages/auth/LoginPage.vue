<template>
  <q-page class="flex flex-center bg-grey-2">
    <q-card class="q-pa-lg shadow-4" style="min-width: 340px; max-width: 420px; width: 100%">
      <!-- Tenant logo/name -->
      <div class="text-center q-mb-lg">
        <q-img
          v-if="tenant?.logoUrl"
          :src="tenant.logoUrl"
          style="height: 48px; width: auto; max-width: 160px"
          fit="contain"
          class="q-mx-auto"
        />
        <div v-else class="text-h5 text-weight-bold">{{ tenant?.name || 'Login' }}</div>
      </div>

      <q-form @submit="onSubmit">
        <q-input
          v-model="email"
          type="email"
          label="Email"
          outlined
          class="q-mb-sm"
          :rules="[v => !!v || 'Required', v => /.+@.+/.test(v) || 'Valid email required']"
        />
        <q-input
          v-model="password"
          :type="showPass ? 'text' : 'password'"
          label="Password"
          outlined
          class="q-mb-sm"
          :rules="[v => !!v || 'Required']"
        >
          <template #append>
            <q-icon
              :name="showPass ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="showPass = !showPass"
            />
          </template>
        </q-input>

        <div v-if="errorMsg" class="text-negative text-caption q-mb-sm">{{ errorMsg }}</div>

        <q-btn
          type="submit"
          color="primary"
          class="full-width q-mt-sm"
          label="Login"
          :loading="loading"
        />
      </q-form>

      <div class="text-center q-mt-md text-caption">
        Don't have an account?
        <router-link to="/auth/register">Register</router-link>
      </div>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTenant } from 'src/composables/useTenant'
import { useAuth } from 'src/composables/useAuth'

const { tenant } = useTenant()
const { login } = useAuth()
const router = useRouter()

const email = ref('')
const password = ref('')
const showPass = ref(false)
const loading = ref(false)
const errorMsg = ref('')

async function onSubmit() {
  loading.value = true
  errorMsg.value = ''
  try {
    await login(email.value, password.value)
    await router.push('/admin/dashboard')
  } catch {
    errorMsg.value = 'Invalid email or password'
  } finally {
    loading.value = false
  }
}
</script>
