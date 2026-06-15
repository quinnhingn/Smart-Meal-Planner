// src/components/dashboard/RecommendationsSheet.js
import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import InteractiveBottomSheet from '../common/InteractiveBottomSheet';
import { COLORS } from '../../constants/theme';
import Svg, { Circle } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';

const MatchRing = ({ percentage, size = 48 }) => {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;
  
  const color = percentage >= 90 ? COLORS.macroThreshold.onTarget : 
                percentage >= 80 ? COLORS.macroThreshold.under : 
                COLORS.macroThreshold.over;

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(0,0,0,0.05)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          rotation="-90"
          originX={size / 2}
          originY={size / 2}
        />
      </Svg>
      <Text style={[styles.ringText, { color }]}>{percentage}%</Text>
    </View>
  );
};

const MiniMacroBar = ({ label, percentage, color, absoluteValue }) => {
  const safePercentage = Math.min(percentage, 100);
  return (
    <View style={styles.miniBarContainer}>
      <View style={styles.miniBarHeader}>
        <Text style={styles.miniBarLabel}>{label}</Text>
        <Text style={styles.miniBarAbsolute}>{absoluteValue}g</Text>
      </View>
      <View style={styles.miniBarBg}>
        <View style={[styles.miniBarFill, { width: `${safePercentage}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
};

const RecommendationsSheet = ({ visible, onClose, data = [] }) => {
  const navigation = useNavigation();

  const renderItem = ({ item }) => {
    return (
      <View style={styles.cardWrapper}>
        <View style={styles.shadowBlock} />
        <Pressable 
          style={styles.card}
          onPress={() => {
            onClose();
            // navigation.navigate('RecipeDetail', { recipeId: item.id });
          }}
        >
          <View style={styles.cardTop}>
            <Image source={{ uri: item.image }} style={styles.recipeImage} />
            <View style={styles.recipeInfo}>
              <Text style={styles.recipeName}>{item.name}</Text>
              <Text style={styles.recipeMeta}>
                <Ionicons name="time-outline" size={14} /> {item.time}  •  {item.calories} kcal
              </Text>
            </View>
            <MatchRing percentage={item.match_percent} />
          </View>

          <View style={styles.macroGaps}>
            <MiniMacroBar label="Pro" percentage={item.fill_percent?.protein} color="#E53935" absoluteValue={item.macros?.protein || 0} />
            <MiniMacroBar label="Carb" percentage={item.fill_percent?.carbs} color="#29B6F6" absoluteValue={item.macros?.carbs || 0} />
            <MiniMacroBar label="Fat" percentage={item.fill_percent?.fat} color="#FBC02D" absoluteValue={item.macros?.fat || 0} />
          </View>
        </Pressable>
      </View>
    );
  };

  return (
    <InteractiveBottomSheet 
      isVisible={visible} 
      onClose={onClose}
      snapPoints={[0.6, 0.9]}
      initialSnapIndex={0}
    >
      <View style={styles.container}>
        {/* Drag Handle Instruction */}
        <View style={styles.dragIndicatorWrapper}>
          <Text style={styles.dragText}>Kéo lên để mở rộng</Text>
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>Gợi ý món ăn</Text>
          <Text style={styles.subtitle}>Top 5 món phù hợp nhất với quỹ Calo hiện tại</Text>
        </View>

        <FlatList
          data={data}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </InteractiveBottomSheet>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  dragIndicatorWrapper: {
    alignItems: 'center',
    paddingBottom: 8,
  },
  dragText: {
    fontSize: 12,
    color: '#AAA',
    fontWeight: '600',
    marginTop: -8, // Kéo nhẹ lên gần thanh handle của BottomSheet
  },
  header: { paddingHorizontal: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  title: { fontSize: 24, fontWeight: '900', color: '#1A1D1E' },
  subtitle: { fontSize: 14, color: '#666', marginTop: 4 },
  
  listContent: { padding: 24, gap: 16, paddingBottom: 100 },
  
  // Neo-brutalism Card Style
  cardWrapper: {
    position: 'relative',
    marginBottom: 8,
  },
  shadowBlock: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    backgroundColor: '#1A1D1E',
    borderRadius: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#1A1D1E',
    borderRadius: 16,
    padding: 16,
  },
  
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  recipeImage: { width: 60, height: 60, borderRadius: 12, borderWidth: 1, borderColor: '#1A1D1E' },
  recipeInfo: { flex: 1, marginHorizontal: 12 },
  recipeName: { fontSize: 16, fontWeight: '800', color: '#1A1D1E', marginBottom: 4 },
  recipeMeta: { fontSize: 13, color: '#666', fontWeight: '500' },
  
  ringText: { fontSize: 13, fontWeight: '800', position: 'absolute' },
  
  macroGaps: { flexDirection: 'row', gap: 12, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  miniBarContainer: { flex: 1 },
  miniBarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  miniBarLabel: { fontSize: 11, fontWeight: '700', color: '#888', textTransform: 'uppercase' },
  miniBarAbsolute: { fontSize: 11, fontWeight: '800', color: '#1A1D1E' },
  miniBarBg: { height: 6, backgroundColor: '#F0F0F0', borderRadius: 3, overflow: 'hidden' },
  miniBarFill: { height: '100%', borderRadius: 3 },
});

export default RecommendationsSheet;
