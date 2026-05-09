// src/components/common/StarRating.js
import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const StarRating = ({ rating = 0, maxStars = 5, size = 24, onRate, readonly = false, color = '#FFC107' }) => {
  const stars = Array.from({ length: maxStars }, (_, i) => i + 1);

  return (
    <View style={styles.container}>
      {stars.map((star) => (
        <Pressable
          key={star}
          onPress={() => !readonly && onRate?.(star)}
          style={styles.starBtn}
          disabled={readonly}
        >
          <Ionicons
            name={star <= rating ? 'star' : 'star-outline'}
            size={size}
            color={star <= rating ? color : '#DDD'}
          />
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center' },
  starBtn: { padding: 2 },
});

export default StarRating;