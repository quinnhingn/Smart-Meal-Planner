import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { COLORS, SHADOWS, FONTS } from '../../constants/theme';

const WorkoutPlanCard = ({ item, index, onPlay }) => {
  const kcalEst = item.kcal_est || Math.round(item.met_value * 65 * (item.duration_seconds / 3600));
  const mins = Math.ceil(item.duration_seconds / 60);

  return (
    <View style={styles.card}>
      {/* Thumbnail */}
      <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{item.name_vn}</Text>
        <Text style={styles.muscle} numberOfLines={1}>{item.target_muscle}</Text>

        {/* Bottom row: pills + play button */}
        <View style={styles.bottomRow}>
          <View style={styles.pillsRow}>
            <View style={[styles.pill, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="flame" size={12} color="#FF9800" />
              <Text style={[styles.pillText, { color: '#E65100' }]}>{kcalEst} kcal</Text>
            </View>
            <View style={[styles.pill, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="time" size={12} color="#1976D2" />
              <Text style={[styles.pillText, { color: '#0D47A1' }]}>{mins} phút</Text>
            </View>
          </View>

          {onPlay && (
            <Pressable
              onPress={() => onPlay(index)}
              style={({ pressed }) => [styles.playBtn, pressed && { opacity: 0.7, transform: [{ scale: 0.9 }] }]}
            >
              <Ionicons name="play" size={18} color="#FFF" />
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
    elevation: 1,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#E8F5E9',
    marginRight: 14,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1D1E',
    letterSpacing: -0.3,
  },
  muscle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
    marginTop: 2,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  playBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.green,
  },
});

export default WorkoutPlanCard;
