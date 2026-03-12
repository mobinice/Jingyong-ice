import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    redirect: '/bom-search',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '/bom-search',
        name: 'BOMSearch',
        component: () => import('@/views/BOM.vue')
      },
      {
        path: '/part-number-mapping',
        name: 'PartNumberMapping',
        component: () => import('@/views/NewPartNumber.vue')
      },
      {
        path: '/attribute-group-maintenance',
        name: 'AttributeGroupMaintenance',
        component: () => import('@/views/AttributeGroupMaintenance.vue')
      },
      {
        path: '/purchase-orders',
        name: 'PurchaseOrders',
        component: () => import('@/views/VendorQuery.vue')
      },
      {
        path: '/carton-information',
        name: 'CartonInformation',
        component: () => import('@/views/CartonInformation.vue')
      },
      {
        path: '/label-generation',
        name: 'LabelGeneration',
        component: () => import('@/views/LabelGeneration.vue')
      },
      {
        path: '/user-management',
        name: 'UserManagement',
        component: () => import('@/views/UserManagement.vue')
      },
      {
        path: '/role-management',
        name: 'RoleManagement',
        component: () => import('@/views/RoleManagement.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  // 暫時關閉登入驗證（測試用）
  // const authStore = useAuthStore()
  // if (to.meta.requiresAuth && !authStore.isAuthenticated) {
  //   next('/login')
  // } else if (to.path === '/login' && authStore.isAuthenticated) {
  //   next('/')
  // } else {
  //   next()
  // }
  next()
})

export default router

