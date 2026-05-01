import { createRouter, createWebHistory } from 'vue-router'
import AdminLayout from '../layouts/AdminLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/Auth/Login.vue')
    },
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
          path: 'inventory/add',
          name: 'ingredient-add',
          component: () => import('../views/Inventory/pages/AddIngredient.vue')
        },
        {
          path: 'inventory/:id',
          name: 'category-detail',
          component: () => import('../views/Inventory/pages/CategoryDetail.vue'),
          props: true
        },
        {
          path: 'inventory/:id/:ingredientId',
          name: 'ingredient-detail',
          component: () => import('../views/Inventory/pages/IngredientDetail.vue'),
          props: true
        },
        {
          path: 'recipes',
          name: 'recipes',
          component: () => import('../views/Recipes/index.vue')
        },
        {
          path: 'recipes/add',
          name: 'recipe-add',
          component: () => import('../views/Recipes/modals/AddRecipe.vue')
        },
        {
          path: 'recipes/:category',
          name: 'recipe-list',
          component: () => import('../views/Recipes/components/RecipeList.vue'),
          props: true
        },
        {
          path: 'recipes/:category/:id',
          name: 'recipe-detail',
          component: () => import('../views/Recipes/pages/RecipeDetail.vue'),
          props: true
        },
        {
          path: 'market-insights',
          name: 'market-insights',
          component: () => import('../views/MarketInsights/index.vue')
        },
        {
          path: 'users',
          name: 'users',
          component: () => import('../views/Users/index.vue')
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
