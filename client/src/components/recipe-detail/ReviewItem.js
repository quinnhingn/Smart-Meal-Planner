import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

const ReviewItem = ({ review, currentUserId }) => {
  const isMe = String(review.userId) === String(currentUserId);
  const displayName = isMe ? 'Bạn' : (review.userName || 'Người dùng ẩn danh');
  
  // Debug log để kiểm tra tại sao ảnh không hiện
  if (review.images && review.images.length > 0) {
    console.log(`[ReviewItem] Review by ${displayName} has ${review.images.length} images. First URI:`, review.images[0]?.substring(0, 50) + '...');
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={{ uri: review.userAvatar || 'https://i.pravatar.cc/150?u=' + review.userId }} 
          style={styles.avatar} 
        />
        <View style={styles.userInfo}>
          <Text style={[styles.userName, isMe && styles.userNameMe]}>{displayName}</Text>
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map(star => (
              <Ionicons 
                key={star}
                name={star <= review.rating ? 'star' : 'star-outline'} 
                size={12} 
                color="#FFD700" 
              />
            ))}
            <Text style={styles.date}>{new Date(review.createdAt).toLocaleDateString('vi-VN')}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.comment}>{review.text}</Text>

      {/* Danh sách ảnh/video đánh giá */}
      {review.images && review.images.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
          {review.images.map((uri, index) => (
            <Image 
              key={index} 
              source={{ uri }} 
              style={styles.reviewImage} 
              resizeMode="cover"
            />
          ))}
        </ScrollView>
      )}

      {review.tags && review.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {review.tags.map(tag => (
            <View key={tag} style={styles.tagBadge}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  header: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  userInfo: { flex: 1, justifyContent: 'center' },
  userName: { fontSize: 14, fontWeight: '800', color: '#1A1D1E' },
  userNameMe: { color: COLORS.primary },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  date: { fontSize: 11, color: '#999', marginLeft: 4 },
  comment: { fontSize: 14, color: '#444', lineHeight: 20, marginBottom: 10 },
  imageScroll: { marginBottom: 12 },
  reviewImage: { width: 100, height: 100, borderRadius: 12, marginRight: 8 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tagBadge: { backgroundColor: '#F5F5F5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  tagText: { fontSize: 10, fontWeight: '700', color: '#888' },
});

export default ReviewItem;
