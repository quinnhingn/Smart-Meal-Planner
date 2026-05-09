// src/components/recipe-detail/RecipeMetaInfo.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatCookTime } from '../../utils/recipeHelpers';

const MetaItem = ({ icon, label, value }) => (
  <View style={styles.item}>
    <Ionicons name={icon} size={18} color="#888" />
    <View style={{ marginLeft: 8 }}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  </View>
);

const RecipeMetaInfo = ({ cookTime, servings, difficulty, author }) => {
  const diffColor = difficulty === 'Dễ' ? '#4CAF50' : difficulty === 'Trung bình' ? '#FF9800' : '#F44336';

  return (
    <View style={styles.container}>
      <MetaItem icon="time-outline" label="Thờigian" value={formatCookTime(cookTime)} />
      <MetaItem icon="people-outline" label="Khẩu phần" value={`${servings} ngườii`} />
      <View style={styles.item}>
        <Ionicons name="flame-outline" size={18} color={diffColor} />
        <View style={{ marginLeft: 8 }}>
          <Text style={[styles.value, { color: diffColor }]}>{difficulty}</Text>
          <Text style={styles.label}>Độ khó</Text>
        </View>
      </View>
      <MetaItem icon="person-outline" label="Tác giả" value={author.name} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 12,
    backgroundColor: '#FFF', borderRadius: 24, padding: 16, marginHorizontal: 16, marginTop: 16,
  },
  item: { flexDirection: 'row', alignItems: 'center', minWidth: 140, flex: 1 },
  value: { fontSize: 14, fontWeight: '800', color: '#1A1D1E' },
  label: { fontSize: 11, fontWeight: '600', color: '#AAA', marginTop: 1 },
});

export default RecipeMetaInfo;
