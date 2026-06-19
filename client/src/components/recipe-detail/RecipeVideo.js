// src/components/recipe-detail/RecipeVideo.js
import React from 'react';
import { View, Text, StyleSheet, Pressable, ImageBackground, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

const RecipeVideo = ({ videoUrl }) => {
  if (!videoUrl) return null;

  // Trích xuất YouTube ID
  const getYoutubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYoutubeId(videoUrl);

  const handlePress = async () => {
    try {
      const supported = await Linking.canOpenURL(videoUrl);
      if (supported) {
        await Linking.openURL(videoUrl);
      } else {
        alert('Không thể mở đường dẫn này!');
      }
    } catch (error) {
      console.error('Error opening video:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>▶ Video hướng dẫn</Text>
      
      <Pressable onPress={handlePress} style={({ pressed }) => [
        styles.videoContainer,
        pressed && { transform: [{ scale: 0.98 }] }
      ]}>
        {videoId ? (
          <ImageBackground 
            source={{ uri: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` }}
            style={styles.thumbnail}
            imageStyle={{ borderRadius: 20 }}
          >
            <View style={styles.overlay}>
              <Ionicons name="play-circle" size={64} color="rgba(255,255,255,0.9)" />
              <Text style={styles.thumbnailText}>Xem trên YouTube</Text>
            </View>
          </ImageBackground>
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="play-circle-outline" size={48} color="#FFF" />
            <Text style={styles.placeholderText}>Chạm để xem Video</Text>
            <Text style={styles.urlText}>{videoUrl}</Text>
          </View>
        )}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, marginTop: 20 },
  title: { fontSize: 18, fontWeight: '900', color: '#1A1D1E', marginBottom: 12 },
  videoContainer: {
    height: 200,
    borderRadius: 20,
    backgroundColor: '#1A1D1E',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailText: { color: '#FFF', fontWeight: '800', fontSize: 14, marginTop: 8, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },
  placeholder: {
    flex: 1, backgroundColor: '#1A1D1E', borderRadius: 20,
    justifyContent: 'center', alignItems: 'center', gap: 8, padding: 16,
  },
  placeholderText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
  urlText: { color: '#888', fontSize: 12, textAlign: 'center' },
});

export default RecipeVideo;
