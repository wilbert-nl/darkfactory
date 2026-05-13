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
        <div v-else class="text-h5 text-weight-bold">{{ tenant?.name || 'Create Account' }}</div>
      </div>

      <q-form @submit="onSubmit">
        <div class="row q-col-gutter-sm q-mb-sm">
          <div class="col-6">
            <q-input
              v-model="firstName"
              label="First Name"
              outlined
              :rules="[v => !!v || 'Required']"
            />
          </div>
          <div class="col-6">
            <q-input
              v-model="lastName"
              label="Last Name"
              outlined
              :rules="[v => !!v || 'Required']"
            />
          </div>
        </div>

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
          :rules="[v => !!v || 'Required', v => v.length >= 8 || 'At least 8 characters']"
        >
          <template #append>
            <q-icon
              :name="showPass ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="showPass = !showPass"
            />
          </template>
        </q-input>

        <q-input
          v-model="confirmPassword"
          :type="showConfirmPass ? 'text' : 'password'"
          label="Confirm Password"
          outlined
          class="q-mb-sm"
          :rules="[v => !!v || 'Required', v => v === password || 'Passwords must match']"
        >
          <template #append>
            <q-icon
              :name="showConfirmPass ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="showConfirmPass = !showConfirmPass"
            />
          </template>
        </q-input>

        <div v-if="errorMsg" class="text-negative text-caption q-mb-sm">{{ errorMsg }}</div>

        <q-btn
          type="submit"
          color="primary"
          class="full-width q-mt-sm"
          label="Create Account"
          :loading="loading"
        />
      </q-form>

      <div class="text-center q-mt-md text-caption">
        Already have an account?
        <router-link to="/auth/login">Login</router-link>
      </div>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useTenant } from 'src/composables/useTenant'
import { useAuth } from 'src/composables/useAuth'

const { tenant } = useTenant()
const { register } = useAuth()
const router = useRouter()
const $q = useQuasar()

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPass = ref(false)
const showConfirmPass = ref(false)
const loading = ref(false)
const errorMsg = ref('')

async function onSubmit() {
  loading.value = true
  errorMsg.value = ''
  try {
    await register({
      firstName: firstName.value,
      lastName: lastName.value,
      email: email.value,
      password: password.value,
    })
    $q.notify({ type: 'positive', message: 'Account created!' })
    await router.push('/auth/login')
  } catch {
    errorMsg.value = 'Registration failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>
