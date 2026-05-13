import { createRouter, createWebHashHistory } from 'vue-router'
import MainLayout from 'src/layouts/MainLayout.vue'
export default createRouter({
  history: createWebHashHistory(),
  routes: [{
    path: '/',
    component: MainLayout,
    children: [{ path: '', component: () => import('src/pages/IndexPage.vue') }]
  }]
})
