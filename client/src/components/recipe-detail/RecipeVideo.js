// src/components/recipe-detail/RecipeVideo.js
import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

const RecipeVideo = ({ videoUrl }) => {
  if (!videoUrl) return null;

  // Trích xuất YouTube ID
  const getYoutubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYoutubeId(videoUrl);

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>▶ Video hướng dẫn</Text>
        {videoId ? (
          <iframe
            width="100%"
            height="300"
            src={`https://www.youtube.com/embed/${videoId}`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ borderRadius: 20, marginTop: 10 }}
          />
        ) : (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>Link video không hợp lệ</Text>
          </View>
        )}
      </View>
    );
  }

  // Trên Mobile nếu chưa cài thư viện WebView thì hiện placeholder đẹp
  return (
    <View style={styles.container}>
      <Text style={styles.title}>▶ Video hướng dẫn</Text>
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>Chạm để xem trên YouTube</Text>
        <Text style={styles.urlText}>{videoUrl}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, marginTop: 20 },
  title: { fontSize: 18, fontWeight: '900', color: '#1A1D1E', marginBottom: 12 },
  placeholder: {
    height: 200, backgroundColor: '#1A1D1E', borderRadius: 20,
    justifyContent: 'center', alignItems: 'center', gap: 8,
  },
  placeholderText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
  urlText: { color: '#888', fontSize: 12 },
  errorBox: { height: 100, backgroundColor: '#FFF0F0', borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#FF4444', fontWeight: '700' },
});

export default RecipeVideo;
