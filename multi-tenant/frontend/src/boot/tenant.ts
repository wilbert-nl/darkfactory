import { boot } from 'quasar/wrappers'
import { useTenant } from 'src/composables/useTenant'

export default boot(async () => {
  const { resolve } = useTenant()
  await resolve()
})
