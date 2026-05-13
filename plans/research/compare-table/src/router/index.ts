import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      component: () => import('src/layouts/MainLayout.vue'),
      children: [
        { path: '', component: () => import('src/pages/IndexPage.vue') },
        { path: 'comparison/:id', component: () => import('src/pages/ComparisonPage.vue') },
        { path: 'templates', component: () => import('src/pages/TemplatesPage.vue') },
        { path: 'shared', component: () => import('src/pages/SharedPage.vue') },
      ],
    },
    {
      path: '/:catchAll(.*)*',
      redirect: '/',
    },
  ],
})

export default router
