// src/components/recipes/MyRecipesTab.js
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import RecipeCardGrid from './RecipeCardGrid';
import RecipeEmptyState from './RecipeEmptyState';

const MyRecipesTab = ({
  myRecipes, drafts, onRecipePress, onSaveToggle, savedIds, pantryItems,
  onCreate, onEdit, onDelete, onDeleteDraft, onShowReviews
}) => {
  const [activeSubTab, setActiveSubTab] = useState(
    myRecipes.length === 0 && drafts.length > 0 ? 'drafts' : 'published'
  );

  const hasContent = myRecipes.length > 0 || drafts.length > 0;

  return (
    <View style={styles.wrapper}>
      {!hasContent ? (
        <RecipeEmptyState tab="my" onCta={(action) => action === 'create' && onCreate?.()} />
      ) : (
        <View style={styles.container}>
          <View style={styles.subTabBar}>
            {/* Đã FIX lỗi thiếu ngoặc nhọn {} bao quanh chuỗi backtick */}
            <TabItem 
              label={`Đã đăng (${myRecipes.length})`} 
              active={activeSubTab === 'published'} 
              onPress={() => setActiveSubTab('published')} 
            />
            <TabItem 
              label={`Bản nháp (${drafts.length})`} 
              active={activeSubTab === 'drafts'} 
              onPress={() => setActiveSubTab('drafts')} 
            />
          </View>

          <View style={styles.contentArea}>
            <View style={[styles.gridWrapper, activeSubTab !== 'published' && styles.hidden]}>
              <RecipeCardGrid
                recipes={myRecipes}
                isOwner={true} // Kích hoạt giao diện Tab cá nhân
                onEdit={onEdit}
                onShowReviews={onShowReviews}
                pantryItems={pantryItems}
              />
            </View>

            <View style={[styles.gridWrapper, activeSubTab !== 'drafts' && styles.hidden]}>
              <RecipeCardGrid
                recipes={drafts}
                isOwner={true} // Kích hoạt giao diện Tab cá nhân
                onEdit={(r) => onEdit?.(r, true)}
                pantryItems={pantryItems}
              />
            </View>
          </View>
        </View>
      )}

      <Pressable onPress={onCreate} style={styles.fab}>
        <Ionicons name="add" size={28} color="#FFF" />
      </Pressable>
    </View>
  );
};

const TabItem = ({ label, active, onPress }) => (
  <Pressable onPress={onPress} style={styles.subTab}>
    <Text style={[styles.subTabText, active && styles.subTabTextActive]}>{label}</Text>
    {active && <View style={styles.activeUnderline} />}
  </Pressable>
);

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  container: { flex: 1 },
  subTabBar: { flexDirection: 'row', paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', marginBottom: 8 },
  subTab: { marginRight: 24, paddingVertical: 12 },
  subTabText: { fontSize: 15, fontWeight: '600', color: '#888' },
  subTabTextActive: { color: '#1A1D1E', fontWeight: '800' },
  activeUnderline: { position: 'absolute', bottom: -1, left: 0, right: 0, height: 3, backgroundColor: '#1A1D1E', borderRadius: 3 },
  contentArea: { flex: 1 },
  gridWrapper: { flex: 1 },
  hidden: { display: 'none' },
  fab: {
    position: 'absolute', bottom: Platform.OS === 'web' ? 32 : 100, right: 16, zIndex: 99,
    width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center', elevation: 8,
  },
});

export default MyRecipesTab;