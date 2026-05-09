// src/components/recipe-detail/RecipeHeroSection.js
import React from 'react';
import { View, Text, Image, Pressable, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

const RecipeHeroSection = ({ recipe, onBack, onSave, isSaved }) => {
  return (
    <View style={styles.container}>
      <Image source={{ uri: recipe.image }} style={styles.image} resizeMode="cover" />
      <View style={styles.overlay} />

      {/* Top buttons */}
      <View style={styles.topBar}>
        <Pressable onPress={onBack} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} color="#FFF" />
        </Pressable>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Pressable onPress={onSave} style={styles.iconBtn}>
            <Ionicons name={isSaved ? 'heart' : 'heart-outline'} size={22} color={isSaved ? COLORS.danger : '#FFF'} />
          </Pressable>
          <Pressable style={styles.iconBtn}>
            <Ionicons name="share-outline" size={22} color="#FFF" />
          </Pressable>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.labelRow}>
          {recipe.labels.map((label, idx) => (
            <View key={idx} style={styles.labelPill}>
              <Text style={styles.labelText}>{label}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.title}>{recipe.title}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { height: 320, position: 'relative' },
  image: { width: '100%', height: '100%' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: Platform.OS === 'ios' ? 50 : 16,
    zIndex: 10,
  },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center', alignItems: 'center',
  },
  content: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, zIndex: 5 },
  labelRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  labelPill: {
    backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  labelText: { fontSize: 11, fontWeight: '800', color: '#FFF' },
  title: { fontSize: 28, fontWeight: '900', color: '#FFF', textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
});

export default RecipeHeroSection;
