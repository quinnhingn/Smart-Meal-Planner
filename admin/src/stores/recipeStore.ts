import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useRecipeStore = defineStore('recipe', () => {
  const recipes = ref<any[]>([]);
  const recipeDetails = ref<Record<string, any>>({});
  
  const isLoading = ref(false);
  const isLoaded = ref(false);
  const error = ref<string | null>(null);

  const fetchRecipes = async (force = false) => {
    // Nếu đã có dữ liệu và không bắt buộc load lại thì trả về luôn cho nhanh
    if (isLoaded.value && !force && recipes.value.length > 0) {
      return recipes.value;
    }

    isLoading.value = true;
    error.value = null;

    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/recipes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        recipes.value = data.data;
        isLoaded.value = true;
        return data.data;
      } else {
        throw new Error(data.message || 'Lỗi khi tải danh sách công thức');
      }
    } catch (err: any) {
      error.value = err.message;
      console.error('RecipeStore Error:', err);
    } finally {
      isLoading.value = false;
    }
  };

  const fetchRecipeDetail = async (id: string, force = false) => {
    if (recipeDetails.value[id] && !force) {
      return recipeDetails.value[id];
    }

    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/recipes/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        recipeDetails.value[id] = data.data;
        return data.data;
      }
    } catch (err) {
      console.error('Lỗi tải chi tiết món ăn:', err);
    }
    return null;
  };

  const clearCache = () => {
    recipes.value = [];
    recipeDetails.value = {};
    isLoaded.value = false;
  };

  return {
    recipes,
    recipeDetails,
    isLoading,
    isLoaded,
    error,
    fetchRecipes,
    fetchRecipeDetail,
    clearCache
  };
});
