import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import YoutubePlayer from '../components/YoutubePlayer';
import { useWorkoutStore } from '../store/useWorkoutStore';
import { useWorkoutPlanStore } from '../store/useWorkoutPlanStore';
import { useAppStore } from '../store/useAppStore';
import { COLORS, SHADOWS } from '../constants/theme';
import CustomButton from '../components/CustomButton';
import { workoutApi } from '../services/api';

const { width } = Dimensions.get('window');

// Helper to extract YouTube ID
const extractVideoId = (url) => {
  if (!url) return null;
  const match = url.match(/[?&]v=([^&]+)/);
  return match ? match[1] : null;
};

const WorkoutPlayerScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { token, addActivityLog } = useAppStore();
  const { completeDay } = useWorkoutPlanStore();
  const { 
    activeWorkout, flatExercises, currentExerciseIndex, currentExerciseTimeRemaining, 
    status, updateTimer, pauseWorkout, resumeWorkout, nextExercise, skipExercise, prevExercise, finishWorkout, quitEarly,
    savedVideoTimestamp
  } = useWorkoutStore();

  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [timerActive, setTimerActive] = useState(false);
  const playerRef = useRef(null);
  const isConfirmingQuitRef = useRef(false);
  const quitActionRef = useRef(null);

  // Reliable Back Interception
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      const currentState = useWorkoutStore.getState();
      
      // Allow exit if they haven't started or already confirmed
      if (currentState.timeElapsed === 0 || isConfirmingQuitRef.current) {
        if (currentState.timeElapsed === 0) quitEarly();
        return;
      }

      // Prevent default behavior of leaving the screen
      e.preventDefault();
      
      pauseWorkout();
      quitActionRef.current = e.data.action;
      setShowQuitConfirm(true);
    });

    return unsubscribe;
  }, [navigation, pauseWorkout, quitEarly]);

  // Sync Youtube Player state with Store state
  const onStateChange = useCallback((state) => {
    if (state === 'playing') {
      setPlaying(true);
      setTimerActive(true);
      resumeWorkout();
      
      const currentSaved = useWorkoutStore.getState().savedVideoTimestamp;
      if (currentSaved && currentSaved > 0) {
        playerRef.current?.seekTo(currentSaved, true);
        useWorkoutStore.setState({ savedVideoTimestamp: 0 });
      }
    } else if (state === 'paused') {
      setPlaying(false);
      setTimerActive(false);
      pauseWorkout();
    } else if (state === 'ended') {
      setPlaying(false);
      setTimerActive(false);
      pauseWorkout();
      nextExercise(); // Auto go to next
    }
  }, [resumeWorkout, pauseWorkout, nextExercise]);

  const onReady = useCallback(async () => {
    try {
      const duration = await playerRef.current?.getDuration();
      if (duration && duration > 0) {
        const state = useWorkoutStore.getState();
        const startTimestamp = state.savedVideoTimestamp || 0;
        const newRemaining = Math.max(0, Math.floor(duration - startTimestamp));
        
        // Cập nhật lại đồng hồ cho khớp chính xác với tổng thời lượng thực tế của video Youtube!
        useWorkoutStore.setState({ currentExerciseTimeRemaining: newRemaining });
      }
    } catch (e) {
      console.log("Lỗi lấy duration:", e);
    }
  }, []);

  // Timer Effect
  useEffect(() => {
    let interval;
    if (status === 'IN_PROGRESS' && timerActive) {
      interval = setInterval(() => {
        updateTimer();
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status, timerActive, updateTimer]);

  if (!activeWorkout || flatExercises.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#333' }}>Không tìm thấy giáo án. Vui lòng thử lại.</Text>
        <CustomButton title="Quay lại" onPress={() => navigation.goBack()} style={{ marginTop: 20 }} />
      </View>
    );
  }

  const isDone = status === 'DONE';
  const currentEx = flatExercises[currentExerciseIndex] || {};
  const videoId = extractVideoId(currentEx.videoUrl) || 'iSSAk4XCsZg'; // Fallback to Jumping Jacks
  const progressPercent = ((currentExerciseIndex + 1) / flatExercises.length) * 100;

  // Format seconds to mm:ss
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Render Completion Screen
  if (isDone) {
    return (
      <View style={[styles.container, styles.doneContainer, { paddingTop: insets.top }]}>
        <Ionicons name="trophy" size={100} color="#FFD700" style={{ marginBottom: 20 }} />
        <Text style={styles.doneTitle}>Tuyệt vời!</Text>
        <Text style={styles.doneSubtitle}>Bạn đã hoàn thành giáo án {activeWorkout.title}</Text>
        
        <View style={styles.doneCard}>
          <View style={styles.doneStat}>
            <Ionicons name="time" size={24} color={COLORS.primary} />
            <Text style={styles.doneStatValue}>{formatTime(useWorkoutStore.getState().timeElapsed)}</Text>
            <Text style={styles.doneStatLabel}>Tổng thời gian</Text>
          </View>
          <View style={styles.doneStatDivider} />
          <View style={styles.doneStat}>
            <Ionicons name="flame" size={24} color="#FF5722" />
            <Text style={styles.doneStatValue}>{activeWorkout.calories}</Text>
            <Text style={styles.doneStatLabel}>Kcal tiêu hao</Text>
          </View>
        </View>

        <CustomButton 
          title="HOÀN TẤT & LƯU LOG" 
          onPress={async () => {
            finishWorkout();
            if (token && activeWorkout?.id) {
              await completeDay(token, activeWorkout.id);
            }
            addActivityLog(activeWorkout.calories || 0);
            navigation.navigate('Fitness');
          }}
          style={{ width: '80%', height: 56, borderRadius: 28, marginTop: 40 }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Progress Bar (moved just under native header) */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>Bài {currentExerciseIndex + 1} / {flatExercises.length}</Text>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
        </View>
      </View>

      {/* Video Player Area */}
      <View style={styles.videoWrapper}>
        <YoutubePlayer
          ref={playerRef}
          height={220}
          play={playing}
          videoId={videoId}
          onChangeState={onStateChange}
          onReady={onReady}
          initialPlayerParams={{
            start: savedVideoTimestamp || 0
          }}
          webViewProps={{
            allowsInlineMediaPlayback: true,
            mediaPlaybackRequiresUserAction: false
          }}
        />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={[styles.contentArea, { paddingBottom: 140 }]}>
        {/* Title and Small Timer Header */}
        <View style={styles.infoRow}>
          <View style={styles.titleArea}>
            <Text style={styles.exerciseName}>{currentEx.name_vn || currentEx.name || 'Bài tập'}</Text>
            <Text style={styles.exerciseNext}>
              {currentExerciseIndex < flatExercises.length - 1 
                ? `Tiếp theo: ${flatExercises[currentExerciseIndex + 1].name_vn || flatExercises[currentExerciseIndex + 1].name || 'Bài tập'}`
                : 'Tiếp theo: Hoàn thành'}
            </Text>
          </View>
          
          {/* Small Timer in the corner */}
          <View style={styles.smallTimer}>
            <Ionicons name="timer-outline" size={20} color={COLORS.primary} />
            <Text style={styles.smallTimerText}>{formatTime(currentExerciseTimeRemaining)}</Text>
          </View>
        </View>

        <View style={styles.instructionCard}>
          <Text style={styles.instructionTitle}>Hướng dẫn thực hiện:</Text>
          {currentEx.instructions && currentEx.instructions.map((step, index) => (
             <Text key={index} style={styles.instructionText}>{index + 1}. {step}</Text>
          ))}
          {!currentEx.instructions && (
             <Text style={styles.instructionText}>Bấm nút Play trên video để xem hướng dẫn trực quan từ chuyên gia.</Text>
          )}
          
          {currentEx.tips && (
             <View style={styles.tipBox}>
               <Ionicons name="bulb-outline" size={20} color="#FF9800" />
               <Text style={styles.tipText}>{currentEx.tips}</Text>
             </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Controls Area */}
      <View style={[styles.bottomControls, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <Pressable onPress={() => prevExercise()} style={styles.secBtn}>
          <Ionicons name="play-skip-back" size={24} color="#555" />
        </Pressable>
        
        <Pressable onPress={() => setPlaying(!playing)} style={styles.mainPlayBtn}>
          <Ionicons name={playing ? "pause" : "play"} size={32} color="#FFF" />
        </Pressable>

        <Pressable onPress={() => skipExercise()} style={styles.secBtn}>
          <Ionicons name="play-skip-forward" size={24} color="#555" />
        </Pressable>
      </View>

      {/* Quit Confirm Modal */}
      {showQuitConfirm && (
        <View style={styles.quitOverlay}>
          <View style={styles.quitCard}>
            <Text style={styles.quitTitle}>Kết thúc sớm?</Text>
            <Text style={styles.quitDesc}>Dữ liệu tập luyện của bạn cho đến thời điểm này vẫn sẽ được ghi nhận. Bạn có chắc muốn thoát?</Text>
            
            <View style={{ gap: 12, marginTop: 24, width: '100%' }}>
              <CustomButton 
                title="LƯU & THOÁT" 
                onPress={async () => {
                  isConfirmingQuitRef.current = true;
                  const currentState = useWorkoutStore.getState();
                  
                  let currentVideoTime = 0;
                  try {
                    // Cầu nối WebYoutubePlayer giờ đã hoạt động hoàn hảo, ta có thể an tâm lấy time thật từ Youtube
                    currentVideoTime = await playerRef.current?.getCurrentTime() || 0;
                  } catch (e) {
                    console.log("Lỗi lấy time video:", e);
                  }
                  
                  // Lưu tiến độ lên server
                  if (token && activeWorkout?.id) {
                    const newProgressMap = { ...currentState.exerciseProgressMap };
                    newProgressMap[currentState.currentExerciseIndex] = {
                      videoTimestamp: currentVideoTime > 0 ? currentVideoTime : 0,
                      exerciseTimeRemaining: currentState.currentExerciseTimeRemaining
                    };
                    
                    const { saveProgress } = useWorkoutPlanStore.getState();
                    await saveProgress(token, activeWorkout.id, {
                      currentExerciseIndex: currentState.currentExerciseIndex, // fallback
                      lastPlayedIndex: currentState.currentExerciseIndex,
                      completedIndexes: currentState.completedIndexes,
                      exerciseProgressMap: newProgressMap
                    });
                  }
                  
                  const data = quitEarly();
                  console.log("Logged early workout:", data);
                  if (data?.burnedCalories && data.burnedCalories > 0) {
                    addActivityLog(data.burnedCalories);
                    // Lưu lên backend ActivityLog
                    try {
                      await workoutApi.logActivity({
                        activity_name: `Tập dở dang: ${activeWorkout?.title || 'Chưa rõ'}`,
                        duration_minutes: Math.round(data.timeElapsed / 60) || 1,
                        calories_burned: Math.round(data.burnedCalories),
                        source: 'app_workout',
                        daily_workout_id: activeWorkout?.id
                      });
                    } catch (err) {
                      console.log("Lỗi lưu activity", err);
                    }
                  }
                  setShowQuitConfirm(false);
                  if (quitActionRef.current) {
                    navigation.dispatch(quitActionRef.current);
                  } else {
                    navigation.navigate('Fitness');
                  }
                }} 
                style={{ backgroundColor: '#FF4444', height: 48, borderRadius: 12 }} 
              />
              <CustomButton 
                title="Tiếp tục tập" 
                onPress={() => {
                  setShowQuitConfirm(false);
                  setPlaying(true);
                  resumeWorkout();
                }} 
                style={{ backgroundColor: '#F0F0F0', height: 48, borderRadius: 12 }}
                textStyle={{ color: '#333' }}
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  
  progressContainer: {
    paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#FFF',
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0', ...SHADOWS.small
  },
  progressText: { color: '#333', fontSize: 13, fontWeight: '800', marginBottom: 6, textAlign: 'center' },
  progressBarBg: { width: '100%', height: 6, backgroundColor: '#E0E0E0', borderRadius: 3 },
  progressBarFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 3 },
  
  videoWrapper: { width: '100%', height: 220, backgroundColor: '#000' },
  
  contentArea: { padding: 20 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  titleArea: { flex: 1, marginRight: 16 },
  exerciseName: { fontSize: 24, fontWeight: '900', color: '#1A1D1E', marginBottom: 4 },
  exerciseNext: { fontSize: 14, color: '#888', fontWeight: '600' },
  
  smallTimer: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#E8F5E9', paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 24, borderWidth: 1, borderColor: '#C8E6C9'
  },
  smallTimerText: { fontSize: 20, fontWeight: '900', color: COLORS.primary },

  instructionCard: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: '#F0F0F0', ...SHADOWS.small
  },
  instructionTitle: { fontSize: 16, fontWeight: '800', color: '#333', marginBottom: 12 },
  instructionText: { fontSize: 15, color: '#555', lineHeight: 24, marginBottom: 4 },
  tipBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 16,
    backgroundColor: '#FFF3E0', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#FFE0B2'
  },
  tipText: { flex: 1, fontSize: 14, color: '#E65100', lineHeight: 20, fontStyle: 'italic' },

  bottomControls: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 32,
    backgroundColor: '#FFF', paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F0F0F0',
    ...SHADOWS.premium
  },
  mainPlayBtn: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center', ...SHADOWS.green
  },
  secBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center' },

  // Done Screen
  doneContainer: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#1A1D1E', paddingHorizontal: 20 },
  doneTitle: { fontSize: 36, fontWeight: '900', color: '#FFF', marginBottom: 8 },
  doneSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.8)', marginBottom: 40, textAlign: 'center' },
  doneCard: { width: '100%', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 24, padding: 24, flexDirection: 'row', alignItems: 'center' },
  doneStat: { flex: 1, alignItems: 'center' },
  doneStatValue: { fontSize: 28, fontWeight: '900', color: '#FFF', marginTop: 8 },
  doneStatLabel: { fontSize: 14, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
  doneStatDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.2)' },

  // Quit Overlay
  quitOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  quitCard: { width: '85%', backgroundColor: '#FFF', borderRadius: 24, padding: 24, alignItems: 'center' },
  quitTitle: { fontSize: 22, fontWeight: '900', color: '#1A1D1E', marginBottom: 12 },
  quitDesc: { fontSize: 15, color: '#666', textAlign: 'center', lineHeight: 22 }
});

export default WorkoutPlayerScreen;
