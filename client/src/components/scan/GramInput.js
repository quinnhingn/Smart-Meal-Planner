// src/components/scan/GramInput.js
import React from 'react';
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

const GramInput = ({ value, onChange, onMinus, onPlus }) => {
  return (
    <View style={styles.container}>
      <Pressable onPress={onMinus} style={styles.btn}>
        <Ionicons name="remove" size={18} color="#555" />
      </Pressable>
      
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={value.toString()}
          onChangeText={onChange}
          maxLength={4}
        />
        <Text style={styles.unit}>g</Text>
      </View>

      <Pressable onPress={onPlus} style={styles.btn}>
        <Ionicons name="add" size={18} color="#555" />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 4,
  },
  btn: {
    width: 32,
    height: 32,
    backgroundColor: '#FFF',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EEE',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    minWidth: 60,
    justifyContent: 'center',
  },
  input: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111',
    textAlign: 'center',
  },
  unit: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
    marginLeft: 2,
  }
});

export default GramInput;
