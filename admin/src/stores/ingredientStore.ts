import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useIngredientStore = defineStore('ingredient', () => {
  const ingredients = ref<any[]>([]);
  const isLoading = ref(false);
  const isLoaded = ref(false);
  const error = ref<string | null>(null);

  const fetchIngredients = async (force = false) => {
    // Nếu đã có dữ liệu và không bắt buộc load lại thì trả về luôn cho nhanh
    if (isLoaded.value && !force && ingredients.value.length > 0) {
      return ingredients.value;
    }

    isLoading.value = true;
    error.value = null;

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('http://localhost:5000/api/ingredients', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        ingredients.value = data.data;
        isLoaded.value = true;
        return data.data;
      } else {
        throw new Error(data.message || 'Lỗi khi tải danh sách nguyên liệu');
      }
    } catch (err: any) {
      error.value = err.message;
      console.error('IngredientStore Error:', err);
    } finally {
      isLoading.value = false;
    }
  };

  const clearCache = () => {
    ingredients.value = [];
    isLoaded.value = false;
  };

  return {
    ingredients,
    isLoading,
    isLoaded,
    error,
    fetchIngredients,
    clearCache
  };
});
