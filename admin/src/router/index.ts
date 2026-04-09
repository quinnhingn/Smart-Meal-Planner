import { createRouter, createWebHistory } from 'vue-router'
import AdminLayout from '../layouts/AdminLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: AdminLayout,
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('../views/Dashboard/index.vue')
        },
        {
          path: 'inventory',
          name: 'inventory',
          component: () => import('../views/Inventory/index.vue')
        },
        {
          path: 'inventory/:id',
          name: 'category-detail',
          component: () => import('../views/Inventory/CategoryDetail.vue'),
          props: true
        },
        {
          path: 'recipes',
          name: 'recipes',
          component: () => import('../views/Recipes/index.vue')
        },
        {
          path: 'users',
          name: 'users',
          component: () => import('../views/Users/index.vue')
        },
        {
          path: 'analytics',
          name: 'analytics',
          component: () => import('../views/Analytics/index.vue')
        },
        {
          path: 'api-models',
          name: 'api-models',
          component: () => import('../views/ApiModels/index.vue')
        },
        {
          path: 'subscriptions',
          name: 'subscriptions',
          component: () => import('../views/Subscriptions/index.vue')
        }
      ]
    }
  ],
})

export default router
