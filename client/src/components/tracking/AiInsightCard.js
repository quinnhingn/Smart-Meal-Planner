// src/components/tracking/AiInsightCard.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

const AiInsightCard = ({ metric, data }) => {
  const [displayText, setDisplayText] = useState('');
  const [isThinking, setIsThinking] = useState(true);

  useEffect(() => {
    // 1. Giả lập AI đang suy nghĩ (Shimmer Effect)
    setIsThinking(true);
    setDisplayText('');
    
    const thinkingTimer = setTimeout(() => {
      setIsThinking(false);
    }, 1500);

    return () => clearTimeout(thinkingTimer);
  }, [metric]);

  useEffect(() => {
    // 2. Hiệu ứng gõ chữ (Typewriter)
    if (!isThinking) {
      let index = 0;
      const fullText = data.content;
      const typingInterval = setInterval(() => {
        setDisplayText(fullText.slice(0, index));
        index++;
        if (index > fullText.length) clearInterval(typingInterval);
      }, 30); // Tốc độ gõ 30ms/chữ
      return () => clearInterval(typingInterval);
    }
  }, [isThinking, data]);

  if (isThinking) {
    return (
      <View style={styles.thinkingBox}>
        <Text style={styles.thinkingText}>✨ SmartMeal AI đang phân tích biểu đồ...</Text>
      </View>
    );
  }

  return (
    <View style={styles.insightCard}>
      <View style={styles.header}>
        <Ionicons name="sparkles" size={20} color="#8E24AA" />
        <Text style={styles.insightTitle}>{data.title}</Text>
      </View>
      <Text style={styles.insightContent}>{displayText}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  thinkingBox: { padding: 20, backgroundColor: 'rgba(142, 36, 170, 0.05)', borderRadius: 16, borderStyle: 'dashed', borderWidth: 1, borderColor: '#CE93D8', alignItems: 'center' },
  thinkingText: { color: '#8E24AA', fontWeight: '600', fontSize: 14 },
  insightCard: { padding: 20, backgroundColor: '#F3E5F5', borderRadius: 16, borderLeftWidth: 5, borderLeftColor: '#8E24AA' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  insightTitle: { fontSize: 15, fontWeight: '800', color: '#8E24AA' },
  insightContent: { fontSize: 14, color: '#4A148C', lineHeight: 22, fontWeight: '500' }
});

export default AiInsightCard;