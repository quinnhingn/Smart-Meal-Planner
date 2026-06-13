// src/services/api.js
import axios from 'axios';
import { Platform } from 'react-native';

const BASE_URL = 'http://192.168.1.6:5001/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 60000, // Tăng lên 60 giây cho các vụ Upload ảnh
});

// Interceptor tự động nhét Token vào Header
apiClient.interceptors.request.use(
  (config) => {
    try {
      const { useAppStore } = require('../store/useAppStore');
      const token = useAppStore.getState().token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // Ignore
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Wrapper chuẩn hóa việc gọi API
export const fetchApi = async (method, endpoint, data = null) => {
  try {
    const response = await apiClient({
      method,
      url: endpoint,
      data,
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error(`[API Error] ${method} ${endpoint}:`, error.message);
    return {
      success: false,
      error: error.response?.data?.message || 'Có lỗi kết nối máy chủ.'
    };
  }
};

export const authApi = {
  register: (name, email, password) => axios.post(`${BASE_URL}/auth/register`, { name, email, password }).then(r => r.data),
  login: (email, password) => axios.post(`${BASE_URL}/auth/login`, { email, password }).then(r => r.data),
  getProfile: () => fetchApi('GET', '/user/profile'),
  setupProfile: (data) => fetchApi('POST', '/user/profile', data)
};

export const aiApi = {
  predict: (formData) => fetchApi('POST', '/ai/predict', formData),
  getNutritionInsight: () => fetchApi('GET', '/ai/nutrition-insight'),
  suggestRecipesByPantry: () => fetchApi('GET', '/ai/suggest-recipes-pantry'),
  logExternalRecipe: (recipeData) => fetchApi('POST', '/ai/log-external-recipe', recipeData)
};

export const recipeApi = {
  lookup: (name) => fetchApi('GET', `/recipes/lookup?name=${encodeURIComponent(name)}`),
  logMeal: (mealData) => fetchApi('POST', '/recipes/log', mealData),
  getDailySummary: () => fetchApi('GET', '/recipes/daily-summary'),
  importToPantry: (items) => fetchApi('POST', '/recipes/pantry/import', { items }),
  getPantry: () => fetchApi('GET', '/recipes/pantry'),
  getSuggestions: () => fetchApi('GET', '/recipes/suggestions'),
  getAll: () => fetchApi('GET', '/recipes'),
  toggleFavorite: (recipeId) => fetchApi('POST', '/recipes/favorites/toggle', { recipeId }),
  getFavoriteIds: () => fetchApi('GET', '/recipes/favorites/ids'),
  addReview: (reviewData) => fetchApi('POST', '/recipes/reviews', reviewData),
  getReviews: (recipeId) => fetchApi('GET', `/recipes/${recipeId}/reviews`),
  logRecipeMeal: (recipeId, servings) => fetchApi('POST', '/recipes/log-recipe', { recipeId, servings }),
  getPantryHistory: () => fetchApi('GET', '/recipes/pantry/history'),

  // Shopping List
  getShoppingList: () => fetchApi('GET', '/recipes/shopping-list'),
  addToShoppingList: (recipeId, servings) => fetchApi('POST', '/recipes/shopping-list/add', { recipeId, servings }),
  updateShoppingItem: (itemId, updates) => fetchApi('PUT', `/recipes/shopping-list/${itemId}`, updates),
  saveShoppingToPantry: () => fetchApi('POST', '/recipes/shopping-list/save'),
  clearShoppingList: () => fetchApi('DELETE', '/recipes/shopping-list'),
  addManualShoppingItem: (name, quantity, unit) => fetchApi('POST', '/recipes/shopping-list/manual', { name, quantity, unit }),
  toggleAllShoppingItems: (isBought) => fetchApi('PUT', '/recipes/shopping-list/toggle-all', { isBought }),

  // Diary
  getDiary: () => fetchApi('GET', '/recipes/diary'),
  deleteDiaryItem: (logId) => fetchApi('DELETE', `/recipes/diary/${logId}`),
  updateDiaryItem: (logId, updates) => fetchApi('PUT', `/recipes/diary/${logId}`, updates),

  // Recipe Management
  create: (recipeData) => fetchApi('POST', '/recipes/create', recipeData),
  update: (id, recipeData) => fetchApi('PUT', `/recipes/update/${id}`, recipeData),

  uploadImage: async (uri) => {
    try {
      const formData = new FormData();
      const filename = uri.split('/').pop() || 'upload.jpg';

      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;
      formData.append('file', { uri, name: filename, type });
      return await fetchApi('POST', '/recipes/upload-image', formData);
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};

export default apiClient;