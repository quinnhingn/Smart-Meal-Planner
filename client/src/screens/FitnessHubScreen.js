import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, Pressable, TextInput,
  Animated, Dimensions, Image, ScrollView,
} from 'react-native';
import { useKeepAwake } from 'expo-keep-awake';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SHADOWS } from '../constants/theme';
import { useAppStore } from '../store/useAppStore';
import ResponsiveContainer from '../components/ResponsiveContainer';
import WorkoutPlanCard from '../components/fitness/WorkoutPlanCard';
import WorkoutTimer from '../components/fitness/WorkoutTimer';
import CustomButton from '../components/CustomButton';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ─── MOCK DATA ──────────────────────────────────────────────────────
const WEEKLY_PLAN = {
  1: [
    { id: 'w1e1', name_vn: 'Chống đẩy', target_muscle: 'Ngực, Tay sau', duration_seconds: 15, met_value: 8.0, thumbnail: 'https://images.unsplash.com/photo-1598971639058-a580be8e9cd2?w=200&q=80' },
    { id: 'w1e2', name_vn: 'Squats', target_muscle: 'Đùi, Mông', duration_seconds: 15, met_value: 5.0, thumbnail: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=200&q=80' },
    { id: 'w1e3', name_vn: 'Plank', target_muscle: 'Bụng', duration_seconds: 15, met_value: 3.5, thumbnail: 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=200&q=80' },
  ],
  2: [
    { id: 'w2e1', name_vn: 'Burpees', target_muscle: 'Toàn thân', duration_seconds: 15, met_value: 9.0, thumbnail: 'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?w=200&q=80' },
    { id: 'w2e2', name_vn: 'Lunges', target_muscle: 'Đùi, Mông', duration_seconds: 15, met_value: 6.0, thumbnail: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=200&q=80' },
  ],
  3: [
    { id: 'w3e1', name_vn: 'Mountain Climbers', target_muscle: 'Bụng, Cardio', duration_seconds: 15, met_value: 8.0, thumbnail: 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=200&q=80' },
    { id: 'w3e2', name_vn: 'Jumping Jacks', target_muscle: 'Cardio', duration_seconds: 15, met_value: 7.0, thumbnail: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=200&q=80' },
    { id: 'w3e3', name_vn: 'Plank nghiêng', target_muscle: 'Bụng, Hông', duration_seconds: 15, met_value: 4.0, thumbnail: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=200&q=80' },
  ],
  4: [
    { id: 'w4e1', name_vn: 'Chống đẩy kim cương', target_muscle: 'Tay sau', duration_seconds: 15, met_value: 8.5, thumbnail: 'https://images.unsplash.com/photo-1598971639058-a580be8e9cd2?w=200&q=80' },
    { id: 'w4e2', name_vn: 'Squat nhảy', target_muscle: 'Đùi, Cardio', duration_seconds: 15, met_value: 9.0, thumbnail: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=200&q=80' },
  ],
  5: [
    { id: 'w5e1', name_vn: 'Yoga Warrior', target_muscle: 'Toàn thân', duration_seconds: 15, met_value: 3.0, thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=200&q=80' },
    { id: 'w5e2', name_vn: 'Bridge Pose', target_muscle: 'Lưng, Mông', duration_seconds: 15, met_value: 3.5, thumbnail: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=200&q=80' },
  ],
  6: [
    { id: 'w6e1', name_vn: 'HIIT Sprint', target_muscle: 'Cardio', duration_seconds: 15, met_value: 11.0, thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&q=80' },
    { id: 'w6e2', name_vn: 'Box Jump', target_muscle: 'Đùi, Bắp chân', duration_seconds: 15, met_value: 8.0, thumbnail: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=200&q=80' },
    { id: 'w6e3', name_vn: 'Plank', target_muscle: 'Bụng', duration_seconds: 15, met_value: 3.5, thumbnail: 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=200&q=80' },
  ],
  7: [
    { id: 'w7e1', name_vn: 'Nghỉ ngơi & Kéo giãn', target_muscle: 'Toàn thân', duration_seconds: 15, met_value: 2.0, thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=200&q=80' },
  ],
};

const EXPLORE_CATEGORIES = ['Tất cả', 'Cardio', 'Strength', 'Yoga', 'HIIT'];

const REST_DURATION = 10;

// ─── MAIN COMPONENT ─────────────────────────────────────────────────
const FitnessHubScreen = ({ navigation }) => {
  const { userProfile, addActivityLog, setTabBarVisible } = useAppStore();
  const insets = useSafeAreaInsets();

  // Plan view state
  const [activeTab, setActiveTab] = useState(0); // 0=Weekly, 1=Explore
  const [selectedDay, setSelectedDay] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const tabAnim = useRef(new Animated.Value(0)).current;

  // Workout state
  const [workoutState, setWorkoutState] = useState('PLAN');
  const [workoutExercises, setWorkoutExercises] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [completedExercises, setCompletedExercises] = useState([]);

  // Tab bar visibility
  useEffect(() => {
    setTabBarVisible(workoutState === 'PLAN');
    return () => setTabBarVisible(true);
  }, [workoutState]);

  useKeepAwake(workoutState === 'ACTIVE' || workoutState === 'REST' ? 'fitness-hub' : undefined);

  // Start workout from a list
  const handleStartWorkout = (exercises, startIdx = 0) => {
    setWorkoutExercises(exercises);
    setCurrentIndex(startIdx);
    setCompletedExercises([]);
    setIsPaused(false);
    setWorkoutState('ACTIVE');
  };

  const currentExercise = workoutExercises[currentIndex] ?? null;
  const nextExercise = workoutExercises[currentIndex + 1] ?? null;

  const handleTimerComplete = () => {
    if (workoutState === 'ACTIVE') {
      // Natural completion → push to completed
      setCompletedExercises(prev => [...prev, workoutExercises[currentIndex]]);
      if (currentIndex < workoutExercises.length - 1) {
        setWorkoutState('REST');
      } else {
        setWorkoutState('DONE');
      }
    } else if (workoutState === 'REST') {
      setCurrentIndex(prev => prev + 1);
      setWorkoutState('ACTIVE');
    }
  };

  const handleSkip = () => {
    // Skip does NOT add to completedExercises
    if (currentIndex < workoutExercises.length - 1) {
      if (workoutState === 'REST') {
        setCurrentIndex(prev => prev + 1);
        setWorkoutState('ACTIVE');
      } else {
        setWorkoutState('REST');
      }
    } else {
      setWorkoutState('DONE');
    }
  };

  const handleStop = () => setWorkoutState('DONE');

  const calculateBurnedKcal = () => {
    const weight = parseFloat(userProfile?.weight_kg || userProfile?.weight || 65);
    return completedExercises.reduce((sum, ex) => {
      return sum + (ex.met_value * weight * (ex.duration_seconds / 3600));
    }, 0);
  };

  const handleLogAndExit = () => {
    const burned = calculateBurnedKcal();
    setTimeout(() => {
      addActivityLog(burned);
      setWorkoutState('PLAN');
    }, 1500);
  };

  // ══════════════════════════════════════════════════════════════════
  // PLAN VIEW
  // ══════════════════════════════════════════════════════════════════
  if (workoutState === 'PLAN') {
    const dayExercises = WEEKLY_PLAN[selectedDay] || [];
    return (
      <ResponsiveContainer useImageBg={false}>
        {/* Header */}
        <View style={styles.planHeader}>
          <Text style={styles.planTitle}>Giáo án tuần</Text>
          <Pressable style={styles.exploreBtn} onPress={() => navigation.navigate('ExploreFitness')}>
            <Text style={styles.exploreBtnText}>Khám phá</Text>
            <Ionicons name="compass" size={18} color="#FFF" />
          </Pressable>
        </View>

        <View style={{ flex: 1 }}>
          {/* Day Strip */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={styles.dayStrip}>
            {[1, 2, 3, 4, 5, 6, 7].map(d => (
              <Pressable key={d} onPress={() => setSelectedDay(d)}
                style={[styles.dayChip, selectedDay === d && styles.dayChipActive]}>
                <Text style={[styles.dayChipText, selectedDay === d && styles.dayChipTextActive]}>Ngày {d}</Text>
              </Pressable>
            ))}
          </ScrollView>
          <FlatList
            style={{ flex: 1 }}
            data={dayExercises}
            keyExtractor={item => item.id}
            contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 120 }}
            renderItem={({ item, index }) => (
              <WorkoutPlanCard item={item} index={index}
                onPlay={() => handleStartWorkout(dayExercises, index)} />
            )}
            ListEmptyComponent={<Text style={styles.emptyText}>Không có bài tập cho ngày này</Text>}
          />
        </View>
      </ResponsiveContainer>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // ACTIVE WORKOUT (Deep Emerald + Split Layout)
  // ══════════════════════════════════════════════════════════════════
  const isRest = workoutState === 'REST';
  const isDone = workoutState === 'DONE';
  const previewExercise = isRest ? nextExercise : currentExercise;
  const burned = calculateBurnedKcal();

  return (
    <View style={styles.emeraldContainer}>
      {/* Top 40% — Mock Video Area */}
      {!isDone && (
        <View style={styles.videoArea}>
          <Image
            source={{ uri: previewExercise?.thumbnail }}
            style={styles.videoImage}
            blurRadius={isRest ? 3 : 0}
          />
          <LinearGradient colors={['transparent', 'rgba(27,67,50,0.9)']} style={styles.videoOverlay}>
            <View style={styles.videoMeta}>
              {isRest && <Text style={styles.restLabel}>TIẾP THEO</Text>}
              <Text style={styles.videoTitle}>{previewExercise?.name_vn}</Text>
              <Text style={styles.videoSubtitle}>{previewExercise?.target_muscle}</Text>
            </View>
          </LinearGradient>
          {/* Exercise counter badge */}
          <View style={[styles.counterBadge, { top: insets.top + 12 }]}>
            <Text style={styles.counterText}>{currentIndex + 1} / {workoutExercises.length}</Text>
          </View>
        </View>
      )}

      {/* Bottom 60% — Timer + Controls */}
      <View style={[styles.bottomArea, isDone && { flex: 1, justifyContent: 'center' }]}>
        {isDone ? (
          /* ── DONE STATE ── */
          <View style={styles.doneWrapper}>
            <Ionicons name="trophy" size={72} color="#FFD700" />
            <Text style={styles.doneTitle}>Hoàn thành!</Text>
            <View style={styles.doneCardRow}>
              <View style={[styles.doneStatCard, { borderColor: COLORS.emerald.accent }]}>
                <Text style={styles.doneStatValue}>{burned.toFixed(0)}</Text>
                <Text style={styles.doneStatLabel}>kcal tiêu hao</Text>
              </View>
              <View style={[styles.doneStatCard, { borderColor: '#FFB74D' }]}>
                <Text style={styles.doneStatValue}>{completedExercises.length}</Text>
                <Text style={styles.doneStatLabel}>hoàn thành</Text>
              </View>
              <View style={[styles.doneStatCard, { borderColor: '#EF5350' }]}>
                <Text style={styles.doneStatValue}>⏭ {workoutExercises.length - completedExercises.length}</Text>
                <Text style={styles.doneStatLabel}>đã bỏ qua</Text>
              </View>
            </View>
            <View style={styles.doneExplainBox}>
              <Text style={styles.doneExplainTitle}>💡 Chỉ tính bài hoàn thành</Text>
              <Text style={styles.doneExplainText}>
                Những bài bạn bỏ qua sẽ không được tính vào lượng Calo tiêu hao. Quỹ Calo của bạn sẽ được cộng thêm{' '}
                <Text style={{ color: COLORS.emerald.accent, fontWeight: '800' }}>{burned.toFixed(0)} kcal</Text>.
              </Text>
            </View>
            <View style={{ width: '100%', paddingHorizontal: 20, marginTop: 20 }}>
              <CustomButton title={`Lưu ${burned.toFixed(0)} kcal vào quỹ`} onPress={handleLogAndExit} />
            </View>
          </View>
        ) : (
          /* ── ACTIVE / REST ── */
          <>
            <Text style={styles.exerciseName}>
              {isRest ? 'Nghỉ ngơi' : currentExercise?.name_vn}
            </Text>
            <WorkoutTimer
              duration={isRest ? REST_DURATION : currentExercise?.duration_seconds}
              isPaused={isPaused}
              onComplete={handleTimerComplete}
              isRestMode={isRest}
            />
            {/* Glass Controls */}
            <View style={styles.glassControls}>
              <Pressable onPress={handleStop} style={styles.glassBtn}>
                <Ionicons name="stop" size={24} color="#FFF" />
                <Text style={styles.glassBtnLabel}>Dừng</Text>
              </Pressable>
              <Pressable onPress={() => setIsPaused(!isPaused)} style={styles.glassMainBtn}>
                <Ionicons name={isPaused ? 'play' : 'pause'} size={32} color={COLORS.emerald.bg} />
              </Pressable>
              <Pressable onPress={handleSkip} style={styles.glassBtn}>
                <Ionicons name="play-skip-forward" size={24} color="#FFF" />
                <Text style={styles.glassBtnLabel}>Bỏ qua</Text>
              </Pressable>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

// ─── STYLES ─────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Plan View
  planHeader: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  planTitle: { fontSize: 28, fontWeight: '900', color: '#1A1D1E', marginBottom: 16 },

  // Plan View
  planHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  planTitle: { fontSize: 28, fontWeight: '900', color: '#1A1D1E' },
  exploreBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, gap: 6 },
  exploreBtnText: { fontSize: 14, fontWeight: '800', color: '#FFF' },

  // Day Strip
  dayStrip: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  dayChip: {
    width: 64, height: 64, justifyContent: 'center', alignItems: 'center', borderRadius: 16, backgroundColor: '#FFF',
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)',
    ...SHADOWS.premium,
  },
  dayChipActive: { backgroundColor: COLORS.primary, borderWidth: 2, borderColor: COLORS.primary, ...SHADOWS.green },
  dayChipText: { fontSize: 13, fontWeight: '700', color: '#666' },
  dayChipTextActive: { color: '#FFF' },

  emptyText: { textAlign: 'center', color: '#aaa', marginTop: 40, fontWeight: '600' },

  // ═══ ACTIVE WORKOUT (Emerald) ═══
  emeraldContainer: { flex: 1, backgroundColor: COLORS.emerald?.bg || '#1B4332' },

  // Video Area (Top 40%)
  videoArea: { height: SCREEN_H * 0.38, width: '100%', overflow: 'hidden', borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  videoImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  videoOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', padding: 20 },
  videoMeta: { gap: 4 },
  restLabel: { fontSize: 12, fontWeight: '800', color: '#FFB74D', letterSpacing: 1 },
  videoTitle: { fontSize: 24, fontWeight: '900', color: '#FFF' },
  videoSubtitle: { fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.7)' },
  counterBadge: {
    position: 'absolute', right: 16, backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10,
  },
  counterText: { color: '#FFF', fontWeight: '800', fontSize: 13 },

  // Bottom Area (60%)
  bottomArea: { flex: 1, alignItems: 'center', paddingTop: 16 },
  exerciseName: { fontSize: 20, fontWeight: '800', color: '#FFF', textAlign: 'center', marginBottom: 4 },

  // Glass Controls
  glassControls: {
    flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', width: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 24, marginHorizontal: 20,
    paddingVertical: 16, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  glassBtn: { alignItems: 'center', gap: 4 },
  glassBtnLabel: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.7)' },
  glassMainBtn: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: '#FFF',
    justifyContent: 'center', alignItems: 'center', ...SHADOWS.green,
  },

  // Done
  doneWrapper: { alignItems: 'center', paddingHorizontal: 20 },
  doneTitle: { fontSize: 32, fontWeight: '900', color: '#FFF', marginTop: 12, marginBottom: 20 },
  doneCardRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  doneStatCard: {
    flex: 1, alignItems: 'center', borderRadius: 16, borderWidth: 1,
    paddingVertical: 12, backgroundColor: 'rgba(255,255,255,0.08)',
  },
  doneStatValue: { fontSize: 15, fontWeight: '800', color: '#FFF' },
  doneStatLabel: { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 4, fontWeight: '600' },
  doneExplainBox: {
    backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', width: '100%',
  },
  doneExplainTitle: { fontSize: 14, fontWeight: '800', color: '#FFD700', marginBottom: 6 },
  doneExplainText: { fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 20 },
});

export default FitnessHubScreen;
