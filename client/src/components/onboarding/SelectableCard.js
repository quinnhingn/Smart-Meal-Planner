// src/components/onboarding/SelectableCard.js
import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { COLORS } from '../../constants/theme';

const SelectableCard = ({ title, description, isSelected, onPress, icon }) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        isSelected && styles.cardSelected,
        Platform.OS === 'web' && { cursor: 'pointer' },
        pressed && styles.cardPressed
      ]}
    >
      <View style={styles.contentContainer}>
        {icon && <Text style={styles.icon}>{icon}</Text>}
        <View style={styles.textContainer}>
          <Text style={[styles.title, isSelected && styles.textSelected]}>
            {title}
          </Text>
          {description && (
            <Text style={styles.description}>{description}</Text>
          )}
        </View>
      </View>
      
      {/* Vòng tròn Radio / Checkbox giả lập */}
      <View style={[styles.radio, isSelected && styles.radioSelected]}>
        {isSelected && <View style={styles.radioInner} />}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    marginBottom: 12,
    width: '100%',
  },
  cardSelected: {
    borderColor: COLORS?.primary || '#4CAF50',
    backgroundColor: '#F0FDF4', // Xanh nhạt
  },
  cardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: '#666',
  },
  textSelected: {
    color: COLORS?.primary || '#4CAF50',
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CCC',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  radioSelected: {
    borderColor: COLORS?.primary || '#4CAF50',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS?.primary || '#4CAF50',
  },
});

export default SelectableCard;