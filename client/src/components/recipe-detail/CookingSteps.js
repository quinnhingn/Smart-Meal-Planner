// src/components/recipe-detail/CookingSteps.js
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Platform, LayoutAnimation } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

const CookingSteps = ({ steps }) => {
  const [checkedSteps, setCheckedSteps] = useState(new Set());

  const toggleStep = (order) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCheckedSteps(prev => {
      const next = new Set(prev);
      if (next.has(order)) next.delete(order);
      else next.add(order);
      return next;
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>🍳 Các bước thực hiện</Text>
      <View style={styles.stepsList}>
        {steps.map((step, idx) => {
          const isChecked = checkedSteps.has(step.order);
          return (
            <Pressable
              key={step.order}
              onPress={() => toggleStep(step.order)}
              style={[styles.stepCard, isChecked && styles.stepCardChecked]}
            >
              <View style={styles.stepHeader}>
                <View style={[styles.stepBadge, isChecked && styles.stepBadgeChecked]}>
                  <Text style={[styles.stepBadgeText, isChecked && styles.stepBadgeTextChecked]}>
                    {isChecked ? '✓' : step.order}
                  </Text>
                </View>
                <Text style={[styles.stepTitle, isChecked && styles.stepTitleChecked]}>
                  Bước {step.order}
                </Text>
                {isChecked && (
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.success} style={{ marginLeft: 'auto' }} />
                )}
              </View>
              <Text style={[styles.stepDesc, isChecked && styles.stepDescChecked]}>
                {step.description}
              </Text>
              {step.image && (
                <Image source={{ uri: step.image }} style={styles.stepImage} resizeMode="cover" />
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, marginTop: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#1A1D1E', marginBottom: 14 },
  stepsList: { gap: 12 },
  stepCard: {
    backgroundColor: '#FFF', borderRadius: 20, padding: 16,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)',
    ...Platform.select({ web: { boxShadow: '0 4px 24px rgba(0,0,0,0.04)' }, default: { elevation: 2 } }),
  },
  stepCardChecked: { backgroundColor: '#F8FFF8', borderColor: COLORS.success + '30' },
  stepHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  stepBadge: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: '#F0F0F0',
    justifyContent: 'center', alignItems: 'center',
  },
  stepBadgeChecked: { backgroundColor: COLORS.success + '20' },
  stepBadgeText: { fontSize: 13, fontWeight: '900', color: '#666' },
  stepBadgeTextChecked: { color: COLORS.success },
  stepTitle: { fontSize: 15, fontWeight: '800', color: '#1A1D1E' },
  stepTitleChecked: { color: '#888' },
  stepDesc: { fontSize: 14, fontWeight: '500', color: '#555', lineHeight: 20 },
  stepDescChecked: { color: '#999', textDecorationLine: 'line-through' },
  stepImage: { width: '100%', height: 160, borderRadius: 12, marginTop: 10 },
});

export default CookingSteps;
