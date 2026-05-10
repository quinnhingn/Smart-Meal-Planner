// src/components/recipe-form/FormImagePicker.js
import React from 'react';
import { View, Image, Pressable, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

const FormImagePicker = ({ image, onPick, onClear, label }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      {image ? (
        <View style={styles.previewWrap}>
          <Image source={{ uri: image }} style={styles.preview} />
          <Pressable onPress={onClear} style={styles.clearBtn}>
            <Ionicons name="close-circle" size={24} color="#FFF" />
          </Pressable>
        </View>
      ) : (
        <Pressable onPress={onPick} style={styles.placeholder}>
          <Ionicons name="camera-outline" size={32} color="#BBB" />
          <Text style={styles.placeholderText}>Chọn ảnh</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '800', color: '#666', marginBottom: 8 },
  previewWrap: { position: 'relative', borderRadius: 16, overflow: 'hidden' },
  preview: { width: '100%', height: 180, borderRadius: 16 },
  clearBtn: {
    position: 'absolute', top: 8, right: 8,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center',
  },
  placeholder: {
    width: '100%', height: 180, borderRadius: 16,
    backgroundColor: '#F5F5F5', borderWidth: 2, borderColor: '#E0E0E0', borderStyle: 'dashed',
    justifyContent: 'center', alignItems: 'center', gap: 8,
  },
  placeholderText: { fontSize: 14, fontWeight: '700', color: '#AAA' },
});

export default FormImagePicker;
