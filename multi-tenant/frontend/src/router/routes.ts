import type { RouteRecordRaw } from 'vue-router'
import type { RouteMetaAuth } from 'src/types'

declare module 'vue-router' {
  interface RouteMeta extends RouteMetaAuth {}
}

const routes: RouteRecordRaw[] = [
  // Public routes
  {
    path: '/',
    component: () => import('layouts/PublicLayout.vue'),
    children: [
      { path: '', redirect: '/products' },
      { path: 'products', component: () => import('pages/public/ProductsPage.vue') },
      { path: 'book', component: () => import('pages/public/BookingPage.vue') },
    ],
  },

  // Auth routes (no layout nav, minimal)
  {
    path: '/auth',
    component: () => import('layouts/PublicLayout.vue'),
    children: [
      { path: 'login', component: () => import('pages/auth/LoginPage.vue') },
      { path: 'register', component: () => import('pages/auth/RegisterPage.vue') },
    ],
  },

  // Admin routes
  {
    path: '/admin',
    component: () => import('layouts/AdminLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/admin/dashboard' },
      { path: 'dashboard', component: () => import('pages/admin/DashboardPage.vue') },
      { path: 'users', component: () => import('pages/admin/UsersPage.vue'), meta: { requiresAuth: true, roles: ['tenant_owner'] } },
      { path: 'products', component: () => import('pages/admin/ProductsPage.vue'), meta: { requiresAuth: true, roles: ['tenant_owner'] } },
      { path: 'reservations', component: () => import('pages/admin/ReservationsPage.vue'), meta: { requiresAuth: true } },
      { path: 'orders', component: () => import('pages/admin/OrdersPage.vue'), meta: { requiresAuth: true } },
      { path: 'settings', component: () => import('pages/admin/SettingsPage.vue'), meta: { requiresAuth: true, roles: ['tenant_owner'] } },
    ],
  },

  // SuperAdmin routes
  {
    path: '/superadmin',
    component: () => import('layouts/SuperAdminLayout.vue'),
    meta: { requiresAuth: true, roles: ['superadmin'] },
    children: [
      { path: '', redirect: '/superadmin/tenants' },
      { path: 'tenants', component: () => import('pages/admin/superadmin/TenantsPage.vue') },
    ],
  },

  // Error pages
  {
    path: '/',
    component: () => import('layouts/PublicLayout.vue'),
    children: [
      { path: '403', component: () => import('pages/ErrorPage.vue') },
      { path: 'error/tenant-not-found', component: () => import('pages/ErrorPage.vue') },
      { path: ':catchAll(.*)*', component: () => import('pages/ErrorPage.vue') },
    ],
  },
]

export default routes
