import React, { useState, useMemo } from 'react';
import { 
  View, ScrollView, StyleSheet, Platform, Alert, ActivityIndicator 
} from 'react-native';
import ResponsiveContainer from '../components/ResponsiveContainer';
import RecipeHeroSection from '../components/recipe-detail/RecipeHeroSection';
import MacroChips from '../components/recipe-detail/MacroChips';
import RecipeMetaInfo from '../components/recipe-detail/RecipeMetaInfo';
import RecipeVideo from '../components/recipe-detail/RecipeVideo';
import IngredientTable from '../components/recipe-detail/IngredientTable';
import CookingSteps from '../components/recipe-detail/CookingSteps';
import RecipeActionBar from '../components/recipe-detail/RecipeActionBar';
import { COLORS } from '../constants/theme';
import { aiApi } from '../services/api';
import { useAppStore } from '../store/useAppStore';

const AISuggestedRecipeDetailScreen = ({ route, navigation }) => {
  const { recipe: rawRecipe } = route.params;
  const { pantryItems, fetchSummary } = useAppStore();
  const [logging, setLogging] = useState(false);

  // Bộ chuyển đổi dữ liệu từ JSON sang chuẩn UI của Ngân
  const recipe = useMemo(() => {
    // 1. Tách nguyên liệu từ chuỗi
    const ingrParts = (rawRecipe.ingredients || "").split(/[,.]/);
    const ingredients = ingrParts
      .map(p => p.trim())
      .filter(p => p.includes(':'))
      .map(p => {
        const parts = p.split(':');
        return {
          name: parts[0].replace('Chính', '').replace('Rau', '').replace('Gia vị', '').trim(),
          amount: parts[1]?.trim() || "Vừa đủ",
          calories: 120, protein: 10, carbs: 5, fat: 2
        };
      });

    // 2. Tách các bước nấu
    const steps = (rawRecipe.steps || "").split('|').map((s, idx) => ({
      order: idx + 1,
      description: s.replace(/^\d+\.\s*/, '').trim()
    }));

    return {
      ...rawRecipe,
      id: 'ai-' + Date.now(),
      title: rawRecipe.name,
      image: rawRecipe.image,
      videoUrl: rawRecipe.video, // Link video săn từ Tavily
      cookTime: parseInt(rawRecipe.time) || 30, // Tránh NaN
      difficulty: rawRecipe.difficulty,
      servings: 1,
      author: { name: "SmartMeal AI" },
      labels: ['AI Gợi ý', rawRecipe.difficulty || 'Dễ', 'Tủ lạnh'],
      macros: { calories: 450, protein: 32, carbs: 45, fat: 12 },
      ingredients,
      steps
    };
  }, [rawRecipe]);

  const handleLog = async () => {
    setLogging(true);
    try {
      const res = await aiApi.logExternalRecipe({
        name: recipe.title,
        image: recipe.image,
        time: recipe.cookTime,
        difficulty: recipe.difficulty,
        steps: rawRecipe.steps,
        ingredients: rawRecipe.ingredients,
        calories: recipe.macros.calories,
        protein: recipe.macros.protein,
        carbs: recipe.macros.carbs,
        fat: recipe.macros.fat,
        meal_type: 'Bữa tối',
        selected_servings: 1
      });

      if (res.success) {
        Alert.alert("Thành công! 🎉", res.message);
        // 1. Cập nhật số liệu Dashboard
        await fetchSummary();
        // 2. Quay về trang Tổng quan (Dashboard)
        navigation.navigate('MainTabs', { screen: 'Dashboard' });
      }
    } catch (error) {
      console.error("Lỗi log món ăn AI:", error);
      Alert.alert("Lỗi", "Không thể ghi nhận món ăn này.");
    } finally {
      setLogging(false);
    }
  };

  return (
    <ResponsiveContainer useImageBg={false}>
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <RecipeHeroSection
            recipe={recipe}
            onBack={() => navigation.goBack()}
            onSave={() => {}}
            isSaved={false}
          />

          <View style={styles.content}>
            <MacroChips macros={recipe.macros} />
            <RecipeMetaInfo
              cookTime={recipe.cookTime}
              servings={recipe.servings}
              difficulty={recipe.difficulty}
              author={recipe.author}
            />

            <RecipeVideo videoUrl={recipe.videoUrl} />

            <IngredientTable ingredients={recipe.ingredients} pantryItems={pantryItems} />
            <CookingSteps steps={recipe.steps} />

            <View style={{ height: 120 }} />
          </View>
        </ScrollView>

        <RecipeActionBar
          onLog={handleLog}
          onSave={() => {}}
          showShopping={false}
          isSaved={false}
          onReview={() => {}}
          onShopping={() => {}}
        />
        
        {logging && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        )}
      </View>
    </ResponsiveContainer>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  content: { paddingTop: 16 },
  loadingOverlay: { 
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: 'rgba(255,255,255,0.7)', 
    justifyContent: 'center', 
    alignItems: 'center',
    zIndex: 999
  }
});

export default AISuggestedRecipeDetailScreen;
