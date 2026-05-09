// src/components/recipe-detail/ReviewBottomSheet.js
import React, { useState } from 'react';
import {
  View, Text, Modal, Pressable, TextInput, ScrollView,
  StyleSheet, Platform, KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { REVIEW_TAGS } from '../../utils/mockRecipes';
import StarRating from '../common/StarRating';

const ReviewBottomSheet = ({ visible, onClose, onSubmit, recipeTitle }) => {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [selectedTags, setSelectedTags] = useState(new Set());
  const [images, setImages] = useState([]);

  const toggleTag = (tag) => {
    setSelectedTags(prev => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  };

  const handleSubmit = () => {
    if (rating === 0) return;
    onSubmit?.({ rating, text, tags: Array.from(selectedTags), images });
    setRating(0);
    setText('');
    setSelectedTags(new Set());
    setImages([]);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            <Text style={styles.desc}>
              Nếu bạn đã nấu theo công thức này, hãy đánh giá nó ngay nào!
            </Text>

            {/* Star Rating */}
            <View style={styles.center}>
              <StarRating rating={rating} onRate={setRating} size={36} />
              <Text style={styles.ratingLabel}>
                {rating > 0 ? `${rating}/5 sao` : 'Chạm để đánh giá'}
              </Text>
            </View>

            {/* Quick Tags */}
            <View style={styles.tagsWrap}>
              {REVIEW_TAGS.map(tag => (
                <Pressable
                  key={tag}
                  onPress={() => toggleTag(tag)}
                  style={[styles.tagChip, selectedTags.has(tag) && styles.tagChipActive]}
                >
                  <Text style={[styles.tagText, selectedTags.has(tag) && styles.tagTextActive]}>{tag}</Text>
                </Pressable>
              ))}
            </View>

            {/* Text Input */}
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Viết đánh giá của bạn..."
              placeholderTextColor="#AAA"
              multiline
              numberOfLines={4}
              style={styles.textInput}
              textAlignVertical="top"
            />

            {/* Image picker placeholder */}
            <View style={styles.mediaRow}>
              <Pressable style={styles.mediaBtn}>
                <Ionicons name="camera-outline" size={22} color="#888" />
                <Text style={styles.mediaText}>Thêm ảnh</Text>
              </Pressable>
              <Pressable style={styles.mediaBtn}>
                <Ionicons name="videocam-outline" size={22} color="#888" />
                <Text style={styles.mediaText}>Thêm video</Text>
              </Pressable>
            </View>
          </ScrollView>

          {/* Submit */}
          <Pressable
            onPress={handleSubmit}
            disabled={rating === 0}
            style={({ pressed }) => [
              styles.submitBtn,
              rating === 0 && styles.submitBtnDisabled,
              pressed && rating > 0 && styles.submitBtnPressed,
            ]}
          >
            <Text style={styles.submitText}>GỬI ĐÁNH GIÁ</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: '#FFF', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: Platform.OS === 'ios' ? 32 : 20,
    maxHeight: '85%',
  },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#DDD', alignSelf: 'center', marginBottom: 12 },
  scroll: { paddingBottom: 16 },
  desc: { fontSize: 15, fontWeight: '700', color: '#666', textAlign: 'center', marginBottom: 16 },
  center: { alignItems: 'center', marginBottom: 16 },
  ratingLabel: { fontSize: 13, fontWeight: '700', color: '#999', marginTop: 8 },
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  tagChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#F5F5F5', borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)',
  },
  tagChipActive: { backgroundColor: COLORS.primary + '15', borderColor: COLORS.primary },
  tagText: { fontSize: 12, fontWeight: '700', color: '#666' },
  tagTextActive: { color: COLORS.primary },
  textInput: {
    backgroundColor: '#F8F9FA', borderRadius: 16, padding: 14,
    fontSize: 14, fontWeight: '600', color: '#1A1D1E', minHeight: 100,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)',
  },
  mediaRow: { flexDirection: 'row', gap: 12, marginTop: 14 },
  mediaBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: '#F5F5F5', borderRadius: 16, paddingVertical: 14, borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)',
    borderStyle: 'dashed',
  },
  mediaText: { fontSize: 13, fontWeight: '700', color: '#888' },
  submitBtn: {
    backgroundColor: COLORS.primary, borderRadius: 16, paddingVertical: 16,
    alignItems: 'center', marginTop: 8,
  },
  submitBtnDisabled: { backgroundColor: '#E0E0E0' },
  submitBtnPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  submitText: { fontSize: 15, fontWeight: '900', color: '#FFF', letterSpacing: 1 },
});

export default ReviewBottomSheet;
