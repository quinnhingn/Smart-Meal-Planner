import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Pressable, Animated, Linking, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import { COLORS, SHADOWS } from '../constants/theme';
import CustomButton from '../components/CustomButton';
import { useWorkoutStore } from '../store/useWorkoutStore';
import { useWorkoutPlanStore } from '../store/useWorkoutPlanStore';

// Mock Data (In real app, passed via route.params)
const ROUTINE_DATA = {
  id: 'r1',
  title: 'Đốt mỡ toàn thân',
  duration_minutes: 25,
  calories: 320,
  level: 'Người mới',
  thumbnail: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800',
  sections: [
    {
      id: 's1',
      title: 'Phần 1: Khởi động',
      data: [
        { 
          id: 'e1', 
          name_vn: 'Nhảy dây tại chỗ (Jumping Jacks)', 
          duration_seconds: 60, 
          reps: null, 
          thumbnail: 'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExdzBxMjN5MTkwcXZxaDhxaDZwbHQzbTNmNjN5MjV3ZXFqYThmZXFwZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TkmtA9TExoX2Z7W/giphy.gif', 
          videoUrl: 'https://www.youtube.com/watch?v=iSSAk4XCsZg',
          instructions: [
            'Đứng thẳng, hai chân khép lại, tay để hai bên.',
            'Nhảy lên, đồng thời dang rộng hai chân và giơ hai tay lên cao qua đầu.',
            'Nhảy trở lại tư thế ban đầu.'
          ],
          tips: 'Nhớ tiếp đất nhẹ nhàng bằng mũi chân. Thở đều theo nhịp nhảy.'
        },
        { 
          id: 'e2', 
          name_vn: 'Xoay khớp vai', 
          duration_seconds: 45, 
          reps: null, 
          thumbnail: 'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExdzBxMjN5MTkwcXZxaDhxaDZwbHQzbTNmNjN5MjV3ZXFqYThmZXFwZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TkmtA9TExoX2Z7W/giphy.gif', 
          videoUrl: 'https://www.youtube.com/watch?v=W0nL9347RLE',
          instructions: [
            'Đứng thẳng, dang rộng hai tay ngang vai.',
            'Xoay tay theo vòng tròn nhỏ về phía trước.',
            'Đổi chiều xoay về phía sau.'
          ],
          tips: 'Giữ lưng thẳng, chỉ xoay phần khớp vai.'
        }
      ]
    },
    {
      id: 's2',
      title: 'Phần 2: Tập chính',
      data: [
        { 
          id: 'e3', 
          name_vn: 'Ngồi xổm (Squats)', 
          duration_seconds: 60, 
          reps: 15, 
          thumbnail: 'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExdzBxMjN5MTkwcXZxaDhxaDZwbHQzbTNmNjN5MjV3ZXFqYThmZXFwZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TkmtA9TExoX2Z7W/giphy.gif', 
          videoUrl: 'https://www.youtube.com/watch?v=YaXPRqUwItQ',
          instructions: [
            'Đứng rộng bằng vai, mũi chân hơi hướng ra ngoài.',
            'Từ từ hạ hông xuống như đang ngồi vào ghế ảo.',
            'Giữ ngực cao, lưng thẳng. Gối không vượt quá mũi chân.',
            'Đẩy gót chân để đứng lên tư thế ban đầu.'
          ],
          tips: 'Gồng chặt cơ bụng khi tập. Hít vào khi hạ xuống, thở ra khi đứng lên.'
        },
        { 
          id: 'e4', 
          name_vn: 'Chống đẩy (Push-ups)', 
          duration_seconds: 60, 
          reps: 10, 
          thumbnail: 'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExdzBxMjN5MTkwcXZxaDhxaDZwbHQzbTNmNjN5MjV3ZXFqYThmZXFwZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TkmtA9TExoX2Z7W/giphy.gif', 
          videoUrl: 'https://www.youtube.com/watch?v=IODxDxX7oi4',
          instructions: [
            'Nằm sấp, hai tay chống xuống sàn rộng hơn vai một chút.',
            'Giữ thân người thẳng từ đầu đến gót chân.',
            'Hạ người xuống đến khi ngực gần chạm sàn.',
            'Đẩy mạnh tay để nâng người lên.'
          ],
          tips: 'Nếu quá sức, bạn có thể chống đầu gối xuống sàn (Knee Push-ups).'
        },
        { 
          id: 'e5', 
          name_vn: 'Burpees', 
          duration_seconds: 45, 
          reps: null, 
          thumbnail: 'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExdzBxMjN5MTkwcXZxaDhxaDZwbHQzbTNmNjN5MjV3ZXFqYThmZXFwZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TkmtA9TExoX2Z7W/giphy.gif', 
          videoUrl: 'https://www.youtube.com/watch?v=dZgVxmf6jkA',
          instructions: [
            'Từ tư thế đứng, hạ người xuống thành tư thế squat.',
            'Bật nhảy hai chân về sau để thành tư thế plank.',
            'Thực hiện một nhịp chống đẩy.',
            'Bật nhảy thu chân về và nhảy cao lên khỏi mặt đất.'
          ],
          tips: 'Đây là bài tập cường độ cao. Hãy làm chậm nếu bạn thấy mệt, quan trọng là đúng form.'
        },
        { 
          id: 'e6', 
          name_vn: 'Plank', 
          duration_seconds: 60, 
          reps: null, 
          thumbnail: 'https://i.giphy.com/media/v1.Y2lkPTc5MGI3NjExdzBxMjN5MTkwcXZxaDhxaDZwbHQzbTNmNjN5MjV3ZXFqYThmZXFwZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TkmtA9TExoX2Z7W/giphy.gif', 
          videoUrl: 'https://www.youtube.com/watch?v=pSHjTRCQxIw',
          instructions: [
            'Tựa người trên cẳng tay và mũi chân.',
            'Giữ thân người tạo thành một đường thẳng từ đầu đến gót chân.',
            'Siết chặt cơ bụng và cơ mông.',
            'Giữ đều nhịp thở.'
          ],
          tips: 'Đừng để võng lưng hoặc nhô mông lên cao. Cố gắng nhìn xuống sàn.'
        }
      ]
    },
    {
      id: 's3',
      title: 'Phần 3: Giãn cơ',
      data: [
        { id: 'e6', name_vn: 'Giãn cơ đùi trước', duration_seconds: 60, reps: null, thumbnail: 'https://img.youtube.com/vi/3d12z8P0a8U/hqdefault.jpg', videoUrl: 'https://www.youtube.com/watch?v=3d12z8P0a8U' }
      ]
    }
  ]
};

const WorkoutDetailScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const scrollY = React.useRef(new Animated.Value(0)).current;
  const { activeWorkout, status, startWorkout, resumeWorkout } = useWorkoutStore();
  const { plan } = useWorkoutPlanStore();
  const [selectedExercise, setSelectedExercise] = React.useState(null);

  // Lấy data mới nhất từ store, fallback về route.params
  const routeDailyWorkout = route.params?.dailyWorkout;
  const storeDailyWorkout = plan?.daily_workouts?.find(d => d.id === routeDailyWorkout?.id);
  const dailyWorkoutData = storeDailyWorkout || routeDailyWorkout;
  
  const currentData = dailyWorkoutData ? {
    id: dailyWorkoutData.id || `day_${dailyWorkoutData.day_number}`,
    title: dailyWorkoutData.title || `Ngày ${dailyWorkoutData.day_number}`,
    duration_minutes: dailyWorkoutData.duration_minutes || 20,
    calories: dailyWorkoutData.calories || 200,
    level: 'Người mới',
    target_muscle: 'Toàn thân', // Backend có thể thêm sau
    thumbnail: route.params?.presetImage || dailyWorkoutData?.preset_image || 'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?w=800&q=80',
    sections: dailyWorkoutData.exercises_data?.sections || []
  } : ROUTINE_DATA;

  const progressData = dailyWorkoutData?.progress_data || null;
  const hasProgress = progressData && typeof progressData.currentExerciseIndex === 'number';

  // Is this the currently active workout?
  const isCurrentWorkoutActive = activeWorkout?.id === currentData.id && status !== 'IDLE';

  // Header animation logic
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [280, 100 + insets.top],
    extrapolate: 'clamp'
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [150, 250],
    outputRange: [0, 1],
    extrapolate: 'clamp'
  });

  const renderExerciseItem = (exercise, globalIndex) => {
    let progressState = 'not_started'; // 'done', 'in_progress', 'not_started'
    let progressPercent = 0;

    if (dailyWorkoutData?.is_completed) {
      progressState = 'done';
    } else if (hasProgress) {
      const completedIndexes = progressData.completedIndexes;
      const progressMap = progressData.exerciseProgressMap;
      
      if (completedIndexes) {
         if (completedIndexes.includes(globalIndex)) {
            progressState = 'done';
         } else if (progressMap && progressMap[globalIndex]) {
            progressState = 'in_progress';
            const vidTime = progressMap[globalIndex].videoTimestamp || 0;
            const remaining = progressMap[globalIndex].exerciseTimeRemaining || 0;
            const total = vidTime + remaining;
            
            if (total > 0) {
               progressPercent = Math.max(0, Math.min(100, (vidTime / total) * 100));
            } else {
               progressPercent = 0;
            }
         }
      } else {
         // OLD LOGIC FALLBACK
         const savedIndex = progressData.currentExerciseIndex;
         if (globalIndex < savedIndex) {
            progressState = 'done';
         } else if (globalIndex === savedIndex) {
            progressState = 'in_progress';
            const vidTime = progressData.videoTimestamp || 0;
            const remaining = progressData.exerciseTimeRemaining || 0;
            const exDuration = parseInt(exercise.duration_seconds) || parseInt(exercise.duration) || 60;
            const total = vidTime + remaining > 0 ? vidTime + remaining : exDuration;
            
            if (total > 0) {
               progressPercent = Math.max(0, Math.min(100, (vidTime / total) * 100));
            } else {
               progressPercent = 0;
            }
         }
      }
    }

    return (
      <Pressable 
        style={styles.exerciseRow} 
        key={globalIndex}
        onPress={() => setSelectedExercise(exercise)}
      >
        <View style={styles.exerciseThumbnailContainer}>
          <Image source={{ uri: exercise.thumbnail || exercise.thumb }} style={styles.exerciseAvatar} />
          <View style={[styles.playIconOverlay, { backgroundColor: 'rgba(0,0,0,0.4)' }]}>
            <Ionicons name="play" size={14} color="#FFF" />
          </View>
        </View>
        <View style={styles.exerciseInfo}>
          <Text style={styles.exerciseName} numberOfLines={1}>{exercise.name_vn || exercise.name || 'Bài tập'}</Text>
          <Text style={styles.exerciseDuration}>
            {exercise.reps ? `x${exercise.reps} reps` : (typeof exercise.duration_seconds === 'number' ? `${exercise.duration_seconds} giây` : (typeof exercise.duration === 'string' && (exercise.duration.includes('giây') || exercise.duration.includes('phút')) ? exercise.duration : `${exercise.duration_seconds || exercise.duration || 60} giây`))}
          </Text>
        </View>
        <View style={{ justifyContent: 'center', alignItems: 'center', width: 32, height: 32 }}>
          {progressState === 'done' ? (
            <Ionicons name="checkmark-circle" size={28} color="#4CAF50" />
          ) : progressState === 'in_progress' ? (
            <View style={{ width: 28, height: 28, justifyContent: 'center', alignItems: 'center' }}>
              <Svg height="28" width="28" viewBox="0 0 28 28" style={{ position: 'absolute' }}>
                <Circle cx="14" cy="14" r="11" stroke="#E0E0E0" strokeWidth="3.5" fill="none" />
                <Circle cx="14" cy="14" r="11" stroke="#FFC107" strokeWidth="3.5" fill="none" 
                  strokeDasharray={`${2 * Math.PI * 11}`} 
                  strokeDashoffset={`${2 * Math.PI * 11 * (1 - progressPercent / 100)}`}
                  strokeLinecap="round"
                  rotation="-90" origin="14, 14"
                />
              </Svg>
            </View>
          ) : (
            <Svg height="28" width="28" viewBox="0 0 28 28">
              <Circle cx="14" cy="14" r="11" stroke="#EEEEEE" strokeWidth="3" fill="none" />
            </Svg>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      {/* Animated Hero Header */}
      <Animated.View style={[styles.heroContainer, { height: headerHeight }]}>
        <Image source={{ uri: currentData.thumbnail }} style={styles.heroImage} />
        <LinearGradient colors={['rgba(0,0,0,0.6)', 'transparent', 'rgba(0,0,0,0.8)']} style={styles.heroOverlay} />
        
        {/* Top Navbar */}
        <View style={[styles.topNavbar, { top: insets.top }]}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color="#FFF" />
          </Pressable>
          <Animated.Text style={[styles.navTitle, { opacity: headerOpacity }]}>
            {currentData.title}
          </Animated.Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Floating Stats at the bottom of the hero */}
        <Animated.View style={styles.heroStatsContainer}>
          <Text style={styles.heroTitle}>{currentData.title}</Text>
          <Text style={styles.heroMuscle}>{currentData.target_muscle}</Text>
          
          <View style={styles.badgesRow}>
            <View style={[styles.badge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Ionicons name="time" size={14} color="#FFF" />
              <Text style={styles.badgeText}>{currentData.duration_minutes} phút</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: 'rgba(255,152,0,0.8)' }]}>
              <Ionicons name="flame" size={14} color="#FFF" />
              <Text style={styles.badgeText}>{currentData.calories} kcal</Text>
            </View>
          </View>
        </Animated.View>
      </Animated.View>

      {/* Content */}
      <Animated.ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: 280, paddingBottom: 120 }]}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
      >
        <View style={styles.sheetContainer}>
          <Text style={styles.sectionHeaderTitle}>Lộ trình tập luyện</Text>
          <Text style={styles.sectionHeaderSubtitle}>Hoàn thành các bài tập dưới đây theo thứ tự.</Text>

          {currentData.sections.map((section, s_idx) => {
            const offset = currentData.sections.slice(0, s_idx).reduce((sum, s) => sum + s.data.length, 0);
            return (
              <View key={section.id || `sec_${s_idx}`} style={styles.sectionBlock}>
                <View style={styles.sectionTitleRow}>
                  <View style={styles.sectionTitleDot} />
                  <Text style={styles.sectionTitleText}>{section.title}</Text>
                </View>
                <View style={styles.sectionContent}>
                  {section.data.map((ex, idx) => renderExerciseItem(ex, offset + idx))}
                </View>
              </View>
            );
          })}
        </View>
      </Animated.ScrollView>

      {/* Floating Bottom Button */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <CustomButton
          title={isCurrentWorkoutActive ? "TIẾP TỤC TẬP" : (hasProgress ? `TIẾP TỤC BÀI ${progressData.currentExerciseIndex + 1}` : (dailyWorkoutData?.is_completed ? "LUYỆN TẬP LẠI" : "BẮT ĐẦU TẬP"))}
          icon="play"
          onPress={() => {
            if (!isCurrentWorkoutActive) {
              const completed = hasProgress ? (progressData.completedIndexes || []) : [];
              const progressMap = hasProgress ? (progressData.exerciseProgressMap || {}) : {};
              
              let startIdx = 0;
              let startVidTime = 0;
              let startTimer = undefined;
              
              if (hasProgress) {
                 if (progressData.lastPlayedIndex !== undefined) {
                    startIdx = progressData.lastPlayedIndex;
                    if (progressMap[startIdx]) {
                       startVidTime = progressMap[startIdx].videoTimestamp || 0;
                       startTimer = progressMap[startIdx].exerciseTimeRemaining;
                    }
                 } else {
                    // Fallback for old progress data
                    startIdx = progressData.currentExerciseIndex || 0;
                    startVidTime = progressData.videoTimestamp || 0;
                    startTimer = progressData.exerciseTimeRemaining;
                 }
              }

              startWorkout(currentData, startIdx, startVidTime, startTimer, completed, progressMap);
            } else if (status === 'PAUSED' || status === 'IDLE') {
              resumeWorkout();
            }
            navigation.navigate('WorkoutPlayer');
          }}
          style={{ width: '100%', height: 56, borderRadius: 28 }}
          textStyle={{ fontSize: 16, fontWeight: '800' }}
        />
      </View>

      {/* Exercise Detail Modal */}
      <Modal visible={!!selectedExercise} animationType="slide" transparent={true} onRequestClose={() => setSelectedExercise(null)}>
        <View style={styles.modalBackdrop}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setSelectedExercise(null)} activeOpacity={1} />
          <View style={[styles.modalContent, { paddingBottom: Math.max(insets.bottom, 24) }]}>
            <View style={styles.modalHandle} />
            {selectedExercise && (
              <>
                <View style={styles.modalHeroContainer}>
                  <Image source={{ uri: selectedExercise.thumbnail || selectedExercise.thumb }} style={styles.modalHero} />
                  <View style={styles.modalPlayOverlay}>
                    <Ionicons name="play" size={32} color="#FFF" />
                  </View>
                </View>
                <Text style={styles.modalTitle}>{selectedExercise.name_vn || selectedExercise.name || 'Bài tập'}</Text>
                <Text style={styles.modalDuration}>
                  <Ionicons name="time-outline" size={16} /> {selectedExercise.reps ? ` ${selectedExercise.reps} reps` : (typeof selectedExercise.duration_seconds === 'number' ? ` ${selectedExercise.duration_seconds} giây` : (typeof selectedExercise.duration === 'string' && (selectedExercise.duration.includes('giây') || selectedExercise.duration.includes('phút')) ? ` ${selectedExercise.duration}` : ` ${selectedExercise.duration_seconds || selectedExercise.duration || 60} giây`))}
                </Text>
                
                <Text style={styles.modalSectionTitle}>Hướng dẫn thực hiện:</Text>
                <Text style={styles.modalDesc}>
                  1. Giữ tư thế chuẩn bị, lưng thẳng, mắt nhìn về phía trước.{'\n'}
                  2. Siết chặt cơ cốt lõi (core) và kiểm soát nhịp thở.{'\n'}
                  3. Thực hiện động tác nhịp nhàng, không dùng quán tính quá nhiều.
                </Text>

                <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
                  <CustomButton 
                    title="Đóng" 
                    onPress={() => setSelectedExercise(null)} 
                    style={{ flex: 1, backgroundColor: '#F0F0F0', height: 50, borderRadius: 16 }} 
                    textStyle={{ color: '#333' }}
                  />
                  <CustomButton 
                    title="Bắt đầu bài này" 
                    icon="play"
                    onPress={() => {
                      const flatEx = currentData.sections.flatMap(s => s.data);
                      const idx = Math.max(0, flatEx.findIndex(e => e.id === selectedExercise.id));
                      
                      const completed = hasProgress ? (progressData.completedIndexes || []) : [];
                      const progressMap = hasProgress ? (progressData.exerciseProgressMap || {}) : {};
                      
                      let startVidTime = 0;
                      let startTimer = undefined;
                      if (progressMap[idx]) {
                          startVidTime = progressMap[idx].videoTimestamp || 0;
                          startTimer = progressMap[idx].exerciseTimeRemaining;
                      }

                      startWorkout(currentData, idx, startVidTime, startTimer, completed, progressMap);
                      setSelectedExercise(null);
                      navigation.navigate('WorkoutPlayer');
                    }} 
                    style={{ flex: 2, backgroundColor: COLORS.primary, height: 50, borderRadius: 16 }} 
                  />
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  heroContainer: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    zIndex: 10,
    overflow: 'hidden',
  },
  heroImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'space-between' },
  topNavbar: {
    position: 'absolute', left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, height: 56,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center', alignItems: 'center',
    backdropFilter: 'blur(10px)',
  },
  navTitle: { fontSize: 18, fontWeight: '800', color: '#FFF' },
  heroStatsContainer: {
    position: 'absolute', bottom: 24, left: 20, right: 20,
  },
  heroTitle: { fontSize: 32, fontWeight: '900', color: '#FFF', marginBottom: 4, letterSpacing: -0.5 },
  heroMuscle: { fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.8)', marginBottom: 12 },
  badgesRow: { flexDirection: 'row', gap: 8 },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 4 },
  badgeText: { fontSize: 13, fontWeight: '800', color: '#FFF' },

  scrollContent: {},
  sheetContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    minHeight: 800,
    padding: 24,
    paddingTop: 32,
    marginTop: -32, // overlap the image
  },
  sectionHeaderTitle: { fontSize: 20, fontWeight: '800', color: '#1A1D1E', marginBottom: 4 },
  sectionHeaderSubtitle: { fontSize: 14, color: '#888', marginBottom: 24 },

  sectionBlock: { marginBottom: 24 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  sectionTitleDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary, marginRight: 8 },
  sectionTitleText: { fontSize: 16, fontWeight: '800', color: '#333' },
  sectionContent: { gap: 12, paddingLeft: 8, borderLeftWidth: 2, borderLeftColor: '#F0F0F0', marginLeft: 4 },

  exerciseRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFF', borderRadius: 16,
    borderWidth: 1, borderColor: '#F5F5F5', padding: 10,
    ...SHADOWS.small,
  },
  exerciseThumbnailContainer: {
    width: 90, height: 60, borderRadius: 12, overflow: 'hidden',
    backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center',
  },
  exerciseAvatar: { width: '100%', height: '100%', resizeMode: 'cover' },
  playIconOverlay: {
    position: 'absolute', width: 24, height: 24, borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center',
    backdropFilter: 'blur(4px)',
  },
  exerciseInfo: { flex: 1, marginLeft: 14, justifyContent: 'center' },
  exerciseName: { fontSize: 15, fontWeight: '800', color: '#1A1D1E', marginBottom: 4 },
  exerciseDuration: { fontSize: 13, color: '#888', fontWeight: '600' },

  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#FFF', paddingHorizontal: 20, paddingTop: 16,
    borderTopWidth: 1, borderTopColor: '#F0F0F0',
    ...SHADOWS.premium,
  },

  // Modal Styles
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 32, borderTopRightRadius: 32,
    padding: 24, paddingBottom: 40,
    ...SHADOWS.premium,
  },
  modalHandle: {
    width: 40, height: 5, borderRadius: 3, backgroundColor: '#DDD',
    alignSelf: 'center', marginBottom: 24, marginTop: -8
  },
  modalHeroContainer: { width: '100%', height: 200, borderRadius: 20, overflow: 'hidden', marginBottom: 20, backgroundColor: '#F5F5F5' },
  modalHero: { width: '100%', height: '100%', resizeMode: 'cover' },
  modalPlayOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center', alignItems: 'center'
  },
  modalTitle: { fontSize: 24, fontWeight: '900', color: '#1A1D1E', marginBottom: 8 },
  modalDuration: { fontSize: 15, color: COLORS.primary, fontWeight: '800', marginBottom: 16 },
  modalSectionTitle: { fontSize: 16, fontWeight: '800', color: '#333', marginBottom: 8 },
  modalDesc: { fontSize: 15, color: '#555', lineHeight: 24, marginBottom: 20 },
});

export default WorkoutDetailScreen;
