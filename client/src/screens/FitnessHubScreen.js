import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, Pressable, TextInput,
  Animated, Dimensions, Image, ScrollView, ActivityIndicator, Modal, Platform, Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useKeepAwake } from 'expo-keep-awake';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import YoutubePlayer from '../components/YoutubePlayer';
import { COLORS, SHADOWS } from '../constants/theme';
import { useAppStore } from '../store/useAppStore';
import { useWorkoutStore } from '../store/useWorkoutStore';
import { useWorkoutPlanStore } from '../store/useWorkoutPlanStore';
import { communityApi, workoutApi, BASE_URL } from '../services/api';
import ResponsiveContainer from '../components/ResponsiveContainer';
import WorkoutPlanCard from '../components/fitness/WorkoutPlanCard';
import WorkoutTimer from '../components/fitness/WorkoutTimer';
import CustomButton from '../components/CustomButton';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const formatTimeAgo = (dateString) => {
  if (!dateString) return 'Vừa xong';
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return 'Vừa xong';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ngày trước`;
  return date.toLocaleDateString('vi-VN');
};

const extractVideoId = (url) => {
  if (!url) return null;
  try {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    return match ? match[1] : null;
  } catch (e) { return null; }
};

const EXPLORE_CATEGORIES = ['Tất cả', 'Cardio', 'Strength', 'Yoga', 'HIIT'];

const REST_DURATION = 10;

const PLAN_BG_IMAGES = [
  'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?w=800&q=80',
  'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80',
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
  'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&q=80'
];

const FitnessHubScreen = ({ navigation }) => {
  const { userProfile, token, addActivityLog, setTabBarVisible } = useAppStore();
  const { activeWorkout, status, timeElapsed, currentExerciseIndex } = useWorkoutStore();
  const { plans, isLoading: isPlanLoading, fetchCurrentPlan, generateNewPlan } = useWorkoutPlanStore();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (token) {
      fetchCurrentPlan(token);
    }
    fetchPresetPrograms();
  }, [token]);

  const fetchPresetPrograms = async () => {
    setIsLoadingPresets(true);
    try {
      const res = await workoutApi.getPresetPrograms();
      if (res.success && res.data?.data) {
        setDbPresetPrograms(res.data.data);
      }
    } catch (e) {
      console.log('Error fetching presets:', e);
    } finally {
      setIsLoadingPresets(false);
    }
  };

  const [activeTab, setActiveTab] = useState(0); 
  const [exploreTab, setExploreTab] = useState(0); 
  const [selectedDays, setSelectedDays] = useState({}); 
  const [expandedPreviewDay, setExpandedPreviewDay] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');

  const [feedPosts, setFeedPosts] = useState([]);
  const [isFeedLoading, setIsFeedLoading] = useState(false);
  const [dbPresetPrograms, setDbPresetPrograms] = useState([]);
  const [isLoadingPresets, setIsLoadingPresets] = useState(false);
  const [isCreatePostModalVisible, setCreatePostModalVisible] = useState(false);
  const [isAISearchVisible, setIsAISearchVisible] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [postCaption, setPostCaption] = useState('');
  const [postKcal, setPostKcal] = useState('');
  const [postDuration, setPostDuration] = useState('');
  const [postProgram, setPostProgram] = useState(''); // Used for Title
  const [postYoutubeUrl, setPostYoutubeUrl] = useState('');
  const [postImageUri, setPostImageUri] = useState(null);
  const [selectedTag, setSelectedTag] = useState('Giảm mỡ');
  const [isPosting, setIsPosting] = useState(false);
  const [playingPostId, setPlayingPostId] = useState(null);
  
  // States for Manual Activity Log
  const [isLogActivityModalVisible, setIsLogActivityModalVisible] = useState(false);
  const [logActivityTab, setLogActivityTab] = useState(0); // 0 = Auto, 1 = Manual
  const [logActivityType, setLogActivityType] = useState('Chạy bộ');
  const [logActivityDuration, setLogActivityDuration] = useState('');
  const [logActivityCalories, setLogActivityCalories] = useState('');
  const [isLoggingActivity, setIsLoggingActivity] = useState(false);

  const MET_VALUES = {
    'Chạy bộ': 8.3,
    'Đạp xe': 7.5,
    'Gym (Weightlifting)': 3.5,
    'Bơi lội': 6.0,
    'Yoga': 2.5,
    'Nhảy dây': 10.0,
    'Khác': 5.0
  };

  const handleLogActivitySubmit = async () => {
    if (!logActivityDuration) return alert("Vui lòng nhập thời gian tập!");
    
    let burned = parseFloat(logActivityCalories);
    if (logActivityTab === 0 || !burned) {
      const weight = parseFloat(userProfile?.weight_kg || userProfile?.weight || 65);
      const met = MET_VALUES[logActivityType] || 5.0;
      burned = (met * weight * (parseFloat(logActivityDuration) / 60));
    }
    
    setIsLoggingActivity(true);
    try {
      const res = await workoutApi.logActivity({
        activity_name: logActivityType,
        duration_minutes: parseInt(logActivityDuration),
        calories_burned: Math.round(burned),
        source: logActivityTab === 0 ? 'manual_mets' : 'external_device'
      });
      if (res.success) {
        addActivityLog(burned);
        setIsLogActivityModalVisible(false);
        setLogActivityDuration('');
        setLogActivityCalories('');
      } else {
        alert(res.message || "Lỗi khi lưu bài tập");
      }
    } catch (e) {
      alert("Lỗi kết nối");
    } finally {
      setIsLoggingActivity(false);
    }
  };
  
  const communityTags = ['Giảm mỡ', 'Tăng cơ', 'Duy trì', 'Yoga', 'Cardio'];

  const fetchPosts = async () => {
    setIsFeedLoading(true);
    const res = await communityApi.getPosts();
    if (res.success) {
      setFeedPosts(res.data.data);
    }
    setIsFeedLoading(false);
  };

  useEffect(() => {
    if (activeTab === 1 && exploreTab === 1) {
      fetchPosts();
    }
  }, [activeTab, exploreTab]);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled) {
      setPostImageUri(result.assets[0].uri);
    }
  };

  const handleCreatePost = async () => {
    if (!postProgram) return alert('Vui lòng nhập tên bài tập!');
    if (!postYoutubeUrl) return alert('Vui lòng nhập link YouTube!');
    setIsPosting(true);
    
    let youtubeThumb = null;
    try {
      const match = postYoutubeUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
      if (match && match[1]) {
        youtubeThumb = `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
      }
    } catch (e) {}

    const formData = new FormData();
    formData.append('caption', postCaption);
    formData.append('program_title', postProgram);
    formData.append('kcal', postKcal || '0');
    formData.append('duration_minutes', postDuration || '0');
    
    const workoutData = {
      title: postProgram,
      goal: selectedTag,
      exercises: [
        {
          name: postProgram,
          duration: postDuration ? `${postDuration} phút` : '15 phút',
          videoUrl: postYoutubeUrl,
          thumb: youtubeThumb || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500'
        }
      ]
    };
    formData.append('workout_data', JSON.stringify(workoutData));
    
    if (youtubeThumb) {
      formData.append('image_url', youtubeThumb); 
    }
    
    if (postImageUri) {
      if (Platform.OS === 'web') {
        const response = await fetch(postImageUri);
        const blob = await response.blob();
        formData.append('image', blob, 'upload.jpg');
      } else {
        const filename = postImageUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;
        formData.append('image', { uri: postImageUri, name: filename, type });
      }
    }

    const res = await communityApi.createPost(formData);
    if (res.success) {
      setCreatePostModalVisible(false);
      setPostCaption(''); setPostKcal(''); setPostDuration(''); setPostProgram(''); setPostImageUri(null); setPostYoutubeUrl('');
      fetchPosts();
    } else {
      alert(res.error || 'Đăng bài thất bại');
    }
    setIsPosting(false);
  };

  const handleLike = async (postId) => {
    try {
      const res = await communityApi.toggleLike(postId);
      if (res.success) {
        setFeedPosts(posts => posts.map(p => {
          if (p.id === postId) {
            return { ...p, is_liked: !p.is_liked, likes: p.is_liked ? p.likes - 1 : p.likes + 1 };
          }
          return p;
        }));
      }
    } catch (e) { console.error(e); }
  };

  const handleSavePost = async (postId) => {
    setOptionsPostId(null);
    try {
      const res = await communityApi.savePost(postId);
      if (res.success) {
        Alert.alert('Thành công', 'Đã lưu bài tập vào danh sách Cá nhân của bạn!');
        fetchCurrentPlan();
      } else {
        Alert.alert('Lỗi', res.message || 'Không thể lưu bài viết');
      }
    } catch (e) {
      Alert.alert('Lỗi', 'Có lỗi xảy ra');
    }
  };

  const [optionsPostId, setOptionsPostId] = useState(null);

  const handleOptions = (post) => {
    setOptionsPostId(optionsPostId === post.id ? null : post.id);
  };

  const [isCommentsModalVisible, setIsCommentsModalVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [commentImageUri, setCommentImageUri] = useState(null);
  const [isPostingComment, setIsPostingComment] = useState(false);
  
  const openComments = async (postId) => {
    setSelectedPostId(postId);
    setIsCommentsModalVisible(true);
    setComments([]);
    setCommentImageUri(null);
    setCommentText('');
    try {
      const res = await communityApi.getComments(postId);
      if (res.success && res.data.status === 'success') {
        setComments(res.data.data);
      }
    } catch (e) { console.log(e); }
  };
  
  const pickCommentImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.8 });
    if (!result.canceled) setCommentImageUri(result.assets[0].uri);
  };

  const postComment = async () => {
    if ((!commentText.trim() && !commentImageUri) || !selectedPostId) return;
    setIsPostingComment(true);
    try {
      const formData = new FormData();
      formData.append('content', commentText);
      
      if (commentImageUri) {
        if (Platform.OS === 'web') {
          const resImg = await fetch(commentImageUri);
          const blob = await resImg.blob();
          formData.append('image', blob, 'comment_image.jpg');
        } else {
          formData.append('image', { uri: commentImageUri, name: 'comment_image.jpg', type: 'image/jpeg' });
        }
      }
      
      const res = await communityApi.addComment(selectedPostId, formData);
      if (res.success && res.data.status === 'success') {
        setComments([...comments, res.data.data]);
        setCommentText('');
        setCommentImageUri(null);
        fetchPosts();
      } else {
        Alert.alert("Lỗi", "Gửi bình luận thất bại.");
      }
    } catch (e) { console.log(e); }
    setIsPostingComment(false);
  };

  const [workoutState, setWorkoutState] = useState('PLAN');
  const [workoutExercises, setWorkoutExercises] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [completedExercises, setCompletedExercises] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);

  useEffect(() => {
    setTabBarVisible(workoutState === 'PLAN');
    return () => setTabBarVisible(true);
  }, [workoutState]);

  useKeepAwake(workoutState === 'ACTIVE' || workoutState === 'REST' ? 'fitness-hub' : undefined);

  const handleTimerComplete = () => {
    if (workoutState === 'ACTIVE') {
      setCompletedExercises(prev => [...prev, workoutExercises[currentIndex]]);
      if (currentIndex < workoutExercises.length - 1) setWorkoutState('REST');
      else setWorkoutState('DONE');
    } else if (workoutState === 'REST') {
      setCurrentIndex(prev => prev + 1);
      setWorkoutState('ACTIVE');
    }
  };

  const handleSkip = () => {
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
    return completedExercises.reduce((sum, ex) => sum + (ex.met_value * weight * (ex.duration_seconds / 3600)), 0);
  };

  const handleLogAndExit = () => {
    const burned = calculateBurnedKcal();
    setTimeout(() => {
      addActivityLog(burned);
      setWorkoutState('PLAN');
    }, 1500);
  };

  if (workoutState === 'PLAN') {
    return (
      <ResponsiveContainer useImageBg={false}>
        <View style={styles.planHeader}>
          <Text style={styles.planTitle}>Lộ trình của bạn</Text>
        </View>

        {activeWorkout && status !== 'IDLE' && (
          <Pressable style={styles.resumeBanner} onPress={() => navigation.navigate('WorkoutDetail', { dailyWorkout: activeWorkout })}>
            <LinearGradient colors={['#FF9800', '#F57C00']} style={styles.resumeBannerGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <View style={styles.resumeBannerIcon}>
                <Ionicons name="play" size={20} color="#FF9800" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.resumeBannerTitle}>Đang tập dở: {activeWorkout.title}</Text>
                <Text style={styles.resumeBannerSub}>Tiến độ: Bài {currentExerciseIndex + 1} • Đã tập {Math.floor(timeElapsed / 60)} phút</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#FFF" />
            </LinearGradient>
          </Pressable>
        )}

        <View style={styles.tabContainer}>
          <Pressable style={[styles.tabButton, activeTab === 0 && styles.tabButtonActive]} onPress={() => setActiveTab(0)}>
            <Text style={[styles.tabText, activeTab === 0 && styles.tabTextActive]}>Cá nhân</Text>
          </Pressable>
          <Pressable style={[styles.tabButton, activeTab === 1 && styles.tabButtonActive]} onPress={() => setActiveTab(1)}>
            <Text style={[styles.tabText, activeTab === 1 && styles.tabTextActive]}>Khám phá</Text>
          </Pressable>
        </View>

        <View style={{ flex: 1 }}>
          {activeTab === 0 ? (
            (!plans || plans.length === 0) ? (
              <View style={{ padding: 20, alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                <Ionicons name="sparkles" size={64} color={COLORS.primary} style={{ marginBottom: 16 }} />
                <Text style={{ fontSize: 20, fontWeight: '800', color: '#333', textAlign: 'center', marginBottom: 8 }}>Chưa có lộ trình</Text>
                <CustomButton title="ĐI TỚI KHÁM PHÁ" onPress={() => setActiveTab(1)} style={{ width: '100%', height: 56, borderRadius: 16 }} />
              </View>
            ) : (
              <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                {plans.map((p, index) => {
                  const dailyDataList = p.daily_workouts || [];
                  const activeDay = selectedDays[p.id] || 1;
                  const activeDaily = dailyDataList.find(d => d.day_number === activeDay);
                  const completedDaysCount = dailyDataList.filter(d => d.is_completed).length;
                  const bgImage = p.preset_image || PLAN_BG_IMAGES[index % PLAN_BG_IMAGES.length];
                  return (
                    <View key={p.id} style={styles.compactPlanCardContainer}>
                      <Pressable style={styles.compactPlanCard} onPress={() => navigation.navigate('WorkoutDetail', { dailyWorkout: activeDaily, presetImage: bgImage })}>
                        <Image source={{ uri: bgImage }} style={styles.compactPlanImage} />
                        <LinearGradient colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)', 'rgba(0,0,0,0.95)']} style={styles.compactPlanOverlay}>
                          <View style={styles.compactPlanHeader}>
                            <View style={styles.compactPlanTitleBadge}><Text style={styles.compactPlanTitleText}>{p.preset_title || `Khóa: ${p.goal || "Tăng cường sức khỏe"}`}</Text></View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                              <View style={styles.compactPlanProgressBadge}><Text style={styles.compactPlanProgressText}>{completedDaysCount}/{p.total_days} ngày</Text></View>
                              <Pressable 
                                style={{ backgroundColor: 'rgba(255,59,48,0.2)', padding: 6, borderRadius: 12 }} 
                                onPress={(e) => {
                                  e.stopPropagation();
                                  Alert.alert(
                                    "Huỷ Lộ Trình",
                                    "Bạn có chắc muốn xoá lộ trình này không? Lịch sử tập luyện của lộ trình này cũng sẽ bị xoá.",
                                    [
                                      { text: "Đóng", style: "cancel" },
                                      { text: "Xoá", style: "destructive", onPress: async () => {
                                          const res = await useWorkoutPlanStore.getState().deletePlan(p.id);
                                          if (res.success) {
                                            // Do nothing, list will refresh
                                          } else {
                                            Alert.alert("Lỗi", res.error || "Không thể xoá lộ trình.");
                                          }
                                      }}
                                    ]
                                  );
                                }}
                              >
                                <Ionicons name="trash-outline" size={16} color="#FF3B30" />
                              </Pressable>
                            </View>
                          </View>
                          <View style={{ flex: 1 }} />
                          <View style={styles.compactPlanBody}>
                            <Text style={styles.compactPlanSubtitle}>Hôm nay • Ngày {activeDaily?.day_number} • {activeDaily?.duration_minutes} phút</Text>
                            <Text style={styles.compactPlanActiveTitle} numberOfLines={2}>{activeDaily?.title}</Text>
                            {activeDaily?.progress_data && typeof activeDaily.progress_data.currentExerciseIndex === 'number' && !activeDaily.is_completed && (
                              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                                <View style={{ backgroundColor: 'rgba(255, 193, 7, 0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, flexDirection: 'row', alignItems: 'center' }}>
                                  <Ionicons name="play-circle" size={14} color="#FFD700" style={{ marginRight: 4 }} />
                                  <Text style={{ color: '#FFD700', fontSize: 12, fontWeight: '700' }}>
                                    Tiếp tục bài {activeDaily.progress_data.currentExerciseIndex + 1}
                                  </Text>
                                </View>
                              </View>
                            )}
                          </View>
                          <View style={styles.compactPlanFooter}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                              {dailyDataList.map(d => (
                                <Pressable key={d.day_number} onPress={(e) => { e.stopPropagation(); setSelectedDays(prev => ({ ...prev, [p.id]: d.day_number })); }} style={[styles.miniDayCircle, activeDay === d.day_number && styles.miniDayCircleActive, !d.is_unlocked && { opacity: 0.5 }]}>
                                  {d.is_completed ? <Ionicons name="checkmark" size={16} color={activeDay === d.day_number ? "#000" : COLORS.primary} /> : d.is_unlocked ? <Text style={[styles.miniDayText, activeDay === d.day_number && styles.miniDayTextActive]}>{d.day_number}</Text> : <Ionicons name="lock-closed" size={12} color="#FFF" />}
                                </Pressable>
                              ))}
                            </ScrollView>
                          </View>
                        </LinearGradient>
                      </Pressable>
                    </View>
                  );
                })}
              </ScrollView>
            )
          ) : (
            <View style={{ flex: 1 }}>
              <View style={styles.subTabContainer}>
                <Pressable style={[styles.subTab, exploreTab === 0 && styles.subTabActive]} onPress={() => setExploreTab(0)}><Text style={[styles.subTabText, exploreTab === 0 && styles.subTabTextActive]}>Khoá dài hạn</Text></Pressable>
                <Pressable style={[styles.subTab, exploreTab === 1 && styles.subTabActive]} onPress={() => setExploreTab(1)}><Text style={[styles.subTabText, exploreTab === 1 && styles.subTabTextActive]}>Cộng đồng</Text></Pressable>
              </View>
              
              {exploreTab === 0 ? (
                <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                  <View style={{ paddingHorizontal: 20, paddingTop: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 12, paddingHorizontal: 12, marginBottom: 12 }}>
                      <Ionicons name="search" size={20} color="#888" />
                      <TextInput 
                        style={{ flex: 1, height: 44, marginLeft: 8, fontSize: 14, color: '#333' }} 
                        placeholder="Tìm kiếm bài tập, lộ trình..." 
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                      />
                      {searchQuery !== '' && (
                        <Pressable onPress={() => setSearchQuery('')}>
                          <Ionicons name="close-circle" size={20} color="#888" />
                        </Pressable>
                      )}
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                      {EXPLORE_CATEGORIES.map(cat => (
                        <Pressable 
                          key={cat} 
                          style={{ paddingHorizontal: 16, paddingVertical: 8, backgroundColor: selectedCategory === cat ? COLORS.primary : '#F0F0F0', borderRadius: 20, marginRight: 8 }}
                          onPress={() => setSelectedCategory(cat)}
                        >
                          <Text style={{ color: selectedCategory === cat ? '#FFF' : '#666', fontWeight: '600', fontSize: 13 }}>{cat}</Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                  <View style={{ padding: 20, paddingTop: 0 }}>
                    {isLoadingPresets ? (
                      <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
                    ) : (
                      dbPresetPrograms.filter(prog => {
                        const matchesSearch = prog.title.toLowerCase().includes(searchQuery.toLowerCase());
                        const matchesCat = selectedCategory === 'Tất cả' || prog.goal === selectedCategory || prog.title.includes(selectedCategory);
                        return matchesSearch && matchesCat;
                      }).map(prog => (
                      <Pressable key={prog.id} style={styles.programCard} onPress={() => { setSelectedProgram(prog); setExpandedPreviewDay(0); }}>
                        <Image source={{ uri: prog.image }} style={styles.programImage} />
                        <LinearGradient colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.9)']} style={styles.programOverlay}>
                          <View style={styles.programBadge}><Text style={styles.programBadgeText}>{prog.duration_days} NGÀY</Text></View>
                          <Text style={styles.programTitle}>{prog.title}</Text>
                        </LinearGradient>
                      </Pressable>
                    )))}
                  </View>
                </ScrollView>
              ) : (
                <View style={{ flex: 1 }}>
                  {isFeedLoading ? <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} /> : (
                    <FlatList
                      ListHeaderComponent={() => (
                        <View style={{ paddingHorizontal: 20, paddingTop: 10 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 12, paddingHorizontal: 12, marginBottom: 12 }}>
                            <Ionicons name="search" size={20} color="#888" />
                            <TextInput 
                              style={{ flex: 1, height: 44, marginLeft: 8, fontSize: 14, color: '#333' }} 
                              placeholder="Tìm kiếm bài tập, lộ trình..." 
                              value={searchQuery}
                              onChangeText={setSearchQuery}
                            />
                            {searchQuery !== '' && (
                              <Pressable onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={20} color="#888" />
                              </Pressable>
                            )}
                          </View>
                          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                            {EXPLORE_CATEGORIES.map(cat => (
                              <Pressable 
                                key={cat} 
                                style={{ paddingHorizontal: 16, paddingVertical: 8, backgroundColor: selectedCategory === cat ? COLORS.primary : '#F0F0F0', borderRadius: 20, marginRight: 8 }}
                                onPress={() => setSelectedCategory(cat)}
                              >
                                <Text style={{ color: selectedCategory === cat ? '#FFF' : '#666', fontWeight: '600', fontSize: 13 }}>{cat}</Text>
                              </Pressable>
                            ))}
                          </ScrollView>
                        </View>
                      )}
                      data={feedPosts.filter(post => {
                        const matchesSearch = (post.caption || '').toLowerCase().includes(searchQuery.toLowerCase()) || (post.program_title || '').toLowerCase().includes(searchQuery.toLowerCase());
                        const matchesCat = selectedCategory === 'Tất cả' || (post.workout_data && post.workout_data.goal === selectedCategory) || (post.program_title || '').includes(selectedCategory);
                        return matchesSearch && matchesCat;
                      })}
                      keyExtractor={item => item.id}
                      contentContainerStyle={{ paddingBottom: 100 }}
                      showsVerticalScrollIndicator={false}
                      ItemSeparatorComponent={() => <View style={{ height: 24, paddingHorizontal: 20 }} />}
                      renderItem={({ item }) => {
                        let imageUrl = item.image_url?.startsWith('/uploads') ? BASE_URL.replace('/api', '') + item.image_url : item.image_url;
                        if (!imageUrl && item.workout_data && item.workout_data.exercises && item.workout_data.exercises[0]?.thumb) {
                          imageUrl = item.workout_data.exercises[0].thumb;
                        }
                        
                        return (
                          <View style={{ paddingHorizontal: 20 }}>
                            <View style={[styles.feedCard, { zIndex: optionsPostId === item.id ? 100 : 1 }]}>
                            <View style={[styles.feedHeader, { zIndex: optionsPostId === item.id ? 100 : 1 }]}>
                              <Image source={{ uri: item.avatar || 'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Lucky' }} style={styles.feedAvatar} />
                              <View style={{ flex: 1 }}>
                                <Text style={styles.feedUser}>{item.user_name}</Text>
                                <Text style={styles.feedTime}>{formatTimeAgo(item.created_at)}</Text>
                              </View>
                              <View style={{ position: 'relative', zIndex: optionsPostId === item.id ? 100 : 1 }}>
                                <Pressable onPress={() => handleOptions(item)} style={{ padding: 4 }}>
                                  <Ionicons name="ellipsis-horizontal" size={20} color="#888" />
                                </Pressable>
                                
                                {optionsPostId === item.id && (
                                  <View style={{ position: 'absolute', top: 30, right: 0, backgroundColor: '#FFF', borderRadius: 12, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, width: 180, zIndex: 100, overflow: 'hidden' }}>
                                    {(userProfile?.user_id || userProfile?.id) === item.user_id ? (
                                      <>
                                        <Pressable style={{ flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' }} onPress={() => setOptionsPostId(null)}>
                                          <Ionicons name="pencil-outline" size={18} color="#333" />
                                          <Text style={{ fontSize: 14, color: '#333', marginLeft: 10 }}>Chỉnh sửa bài</Text>
                                        </Pressable>
                                        <Pressable style={{ flexDirection: 'row', alignItems: 'center', padding: 12 }} onPress={async () => {
                                          setOptionsPostId(null);
                                          try {
                                            const res = await communityApi.deletePost(item.id);
                                            if (res.success) fetchPosts();
                                          } catch (e) {}
                                        }}>
                                          <Ionicons name="trash-outline" size={18} color="#FF4B4B" />
                                          <Text style={{ fontSize: 14, color: '#FF4B4B', marginLeft: 10 }}>Xoá bài viết</Text>
                                        </Pressable>
                                      </>
                                    ) : (
                                      <>
                                        {item.user_id !== userProfile?.id && !plans.some(p => p.preset_id === item.id) ? (
                                          <Pressable style={{ flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' }} onPress={() => handleSavePost(item.id)}>
                                            <Ionicons name="bookmark-outline" size={18} color="#333" />
                                            <Text style={{ fontSize: 14, color: '#333', marginLeft: 10 }}>Lưu bài viết</Text>
                                          </Pressable>
                                        ) : item.user_id !== userProfile?.id && plans.some(p => p.preset_id === item.id) ? (
                                          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' }}>
                                            <Ionicons name="checkmark-circle" size={18} color="#4ECDC4" />
                                            <Text style={{ fontSize: 14, color: '#4ECDC4', marginLeft: 10 }}>Đã lưu</Text>
                                          </View>
                                        ) : null}
                                        <Pressable style={{ flexDirection: 'row', alignItems: 'center', padding: 12 }} onPress={() => { setOptionsPostId(null); Alert.alert('Đã báo cáo', 'Cảm ơn bạn đã báo cáo. Chúng tôi sẽ xem xét bài viết này.'); }}>
                                          <Ionicons name="flag-outline" size={18} color="#FF4B4B" />
                                          <Text style={{ fontSize: 14, color: '#FF4B4B', marginLeft: 10 }}>Báo cáo bài viết</Text>
                                        </Pressable>
                                      </>
                                    )}
                                  </View>
                                )}
                              </View>
                            </View>
                            
                            <Text style={styles.feedCaption}>{item.caption}</Text>
                            
                            {(item.kcal > 0 || item.duration_minutes > 0) && (
                              <View style={styles.feedStatsBox}>
                                {item.kcal > 0 && (
                                  <View style={styles.feedStatItem}>
                                    <Ionicons name="flame" size={16} color="#FF6B6B" />
                                    <Text style={styles.feedStatText}>Đốt {item.kcal} kcal</Text>
                                  </View>
                                )}
                                {item.kcal > 0 && item.duration_minutes > 0 && <View style={styles.feedStatDivider} />}
                                {item.duration_minutes > 0 && (
                                  <View style={styles.feedStatItem}>
                                    <Ionicons name="time" size={16} color="#4ECDC4" />
                                    <Text style={styles.feedStatText}>{item.duration_minutes} phút</Text>
                                  </View>
                                )}
                              </View>
                            )}

                            {playingPostId === item.id && item.workout_data?.exercises?.[0]?.videoUrl ? (
                              <View style={[styles.feedImageContainer, { backgroundColor: '#000', height: 220, justifyContent: 'center' }]}>
                                <YoutubePlayer
                                  height={220}
                                  play={true}
                                  videoId={extractVideoId(item.workout_data.exercises[0].videoUrl)}
                                />
                              </View>
                            ) : (
                              <Pressable 
                                style={styles.feedImageContainer}
                                onPress={() => {
                                  if (item.workout_data?.exercises?.[0]?.videoUrl) {
                                    setPlayingPostId(item.id);
                                  }
                                }}
                              >
                                {imageUrl ? (
                                  <Image source={{ uri: imageUrl }} style={styles.feedImage} />
                                ) : (
                                  <View style={[styles.feedImage, { backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center' }]}>
                                    <Ionicons name="videocam" size={48} color="#CCC" />
                                  </View>
                                )}
                                {item.workout_data && item.workout_data.exercises && item.workout_data.exercises[0]?.videoUrl && (
                                  <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' }}>
                                    <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' }}>
                                      <Ionicons name="play" size={28} color="#FFF" style={{ marginLeft: 4 }} />
                                    </View>
                                  </View>
                                )}
                                {item.program_title ? (
                                  <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.feedImageOverlay}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                      <Ionicons name="document-text" size={16} color="#FFF" style={{ marginRight: 6 }} />
                                      <Text style={styles.feedProgramTitle}>{item.program_title}</Text>
                                    </View>
                                  </LinearGradient>
                                ) : null}
                              </Pressable>
                            )}

                            <View style={styles.feedFooter}>
                              <View style={styles.feedFooterLeft}>
                                <Pressable style={styles.feedActionBtn} onPress={() => handleLike(item.id)}>
                                  <Ionicons name={item.is_liked ? "heart" : "heart-outline"} size={24} color={item.is_liked ? "#FF4B4B" : "#333"} />
                                  <Text style={styles.feedActionText}>{item.likes || 0}</Text>
                                </Pressable>
                                <Pressable style={styles.feedActionBtn} onPress={() => openComments(item.id)}>
                                  <Ionicons name="chatbubble-outline" size={22} color="#333" />
                                  <Text style={styles.feedActionText}>{item.comments || 0}</Text>
                                </Pressable>
                              </View>
                              {item.program_title ? (
                                <Pressable 
                                  style={[styles.feedSaveBtn, { backgroundColor: plans.some(p => p.preset_id === item.id) ? '#4ECDC4' : COLORS.primary }]} 
                                  onPress={() => !plans.some(p => p.preset_id === item.id) && handleSavePost(item.id)}
                                >
                                  <Ionicons name={plans.some(p => p.preset_id === item.id) ? "checkmark-circle" : "bookmark"} size={16} color="#FFF" />
                                  <Text style={styles.feedSaveText}>{plans.some(p => p.preset_id === item.id) ? "ĐÃ LƯU" : "LƯU"}</Text>
                                </Pressable>
                              ) : null}
                            </View>
                          </View>
                          </View>
                        );
                      }}
                    />
                  )}
                  <Pressable style={[styles.fab, { bottom: insets.bottom + 80, right: 20 }]} onPress={() => setCreatePostModalVisible(true)}>
                    <Ionicons name="add" size={32} color="#FFF" />
                  </Pressable>
                  <Pressable style={[styles.fab, { bottom: insets.bottom + 150, right: 20, backgroundColor: '#8A2BE2' }]} onPress={() => {setIsAISearchVisible(true); setAiResult(null); setAiQuery('');}}>
                    <Ionicons name="color-wand" size={24} color="#FFF" />
                  </Pressable>
                </View>
              )}
            </View>
          )}
        </View>

        <Modal visible={isAISearchVisible} animationType="fade" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { flex: 0.8 }]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>🪄 Trợ lý AI Tìm Bài Tập</Text>
                <Pressable onPress={() => setIsAISearchVisible(false)} style={styles.modalCloseBtn}>
                  <Ionicons name="close" size={24} color="#333" />
                </Pressable>
              </View>
              <ScrollView contentContainerStyle={{ padding: 20 }}>
                <Text style={styles.inputLabel}>Bạn muốn tập gì hôm nay?</Text>
                <TextInput 
                  style={styles.inputField} 
                  placeholder="VD: Tập bụng 15 phút không dụng cụ..." 
                  value={aiQuery} 
                  onChangeText={setAiQuery} 
                  multiline
                />
                <CustomButton 
                  title={isAILoading ? "ĐANG TÌM..." : "TÌM BÀI TẬP"} 
                  onPress={async () => {
                    if (!aiQuery.trim()) return;
                    setIsAILoading(true);
                    try {
                      const res = await workoutApi.searchWorkoutByAI(aiQuery);
                      if (res.success && res.data?.data) {
                        setAiResult(res.data.data);
                      } else {
                        Alert.alert("Lỗi", res.data?.message || "Không tìm thấy bài tập phù hợp");
                      }
                    } catch (e) {
                      Alert.alert("Lỗi", "Đã có lỗi xảy ra");
                    } finally {
                      setIsAILoading(false);
                    }
                  }} 
                  disabled={isAILoading} 
                  style={{ marginTop: 16, backgroundColor: '#8A2BE2' }} 
                />

                {aiResult && Array.isArray(aiResult) && (
                  <View style={{ marginTop: 32 }}>
                    <Text style={{ fontSize: 16, fontWeight: '800', marginBottom: 12 }}>Kết quả AI đề xuất:</Text>
                    {aiResult.map((res, idx) => (
                      <View key={idx} style={[styles.feedCard, { marginBottom: 16 }]}>
                        <Image source={{ uri: `https://img.youtube.com/vi/${extractVideoId(res.url)}/hqdefault.jpg` }} style={{ width: '100%', height: 180, borderRadius: 12, backgroundColor: '#EEE' }} />
                        <Text style={{ fontSize: 16, fontWeight: '700', marginTop: 12, color: '#333' }}>{res.title}</Text>
                        <CustomButton 
                          title="THÊM VÀO LỘ TRÌNH" 
                          onPress={async () => { 
                            const videoId = extractVideoId(res.url);
                            const thumbUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                            const previewSchedule = [
                              {
                                day: 1,
                                exercises: [
                                  {
                                    name: res.title,
                                    duration: 15, // Mặc định 15p vì AI ko trả về thời gian
                                    youtube_url: res.url,
                                    thumb: thumbUrl
                                  }
                                ]
                              }
                            ];
                            await generateNewPlan(token, 'AI Tìm Kiếm', 'Mọi cấp độ', 1, previewSchedule, 'ai_custom', res.title, thumbUrl);
                            setIsAISearchVisible(false);
                            setExploreTab(0); // Switch back to explore or personal tab logic if needed
                          }} 
                          style={{ marginTop: 16, backgroundColor: COLORS.primary }} 
                          disabled={isPlanLoading} 
                        />
                      </View>
                    ))}
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>

        <Modal visible={isCreatePostModalVisible} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { marginTop: insets.top + 40, paddingBottom: insets.bottom + 20 }]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Tạo bài đăng mới</Text>
                <Pressable onPress={() => setCreatePostModalVisible(false)}><Ionicons name="close" size={24} color="#333" /></Pressable>
              </View>
              <ScrollView contentContainerStyle={{ padding: 20 }}>
                <Text style={styles.inputLabel}>Tên bài tập</Text>
                <TextInput style={styles.inputField} placeholder="Ví dụ: Bài tập HIIT 15 phút giảm mỡ..." value={postProgram} onChangeText={setPostProgram} />

                <Text style={styles.inputLabel}>Link YouTube (Bắt buộc để lưu bài)</Text>
                <TextInput style={styles.inputField} placeholder="https://youtube.com/watch?v=..." value={postYoutubeUrl} onChangeText={setPostYoutubeUrl} />

                <Text style={styles.inputLabel}>Mục tiêu / Thể loại</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                  {communityTags.map(tag => (
                    <Pressable 
                      key={tag} 
                      onPress={() => setSelectedTag(tag)}
                      style={{
                        marginRight: 10,
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: 20,
                        backgroundColor: selectedTag === tag ? COLORS.primary : '#F5F5F5',
                        alignItems: 'center',
                      }}
                    >
                      <Text style={{ fontSize: 13, fontWeight: '600', color: selectedTag === tag ? '#FFF' : '#333' }}>{tag}</Text>
                    </Pressable>
                  ))}
                </ScrollView>

                <Text style={styles.inputLabel}>Cảm nghĩ của bạn (Tuỳ chọn)</Text>
                <TextInput style={[styles.inputField, { height: 80, textAlignVertical: 'top' }]} placeholder="Chia sẻ cảm nhận về bài tập này..." multiline value={postCaption} onChangeText={setPostCaption} />
                
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>Kcal (Tuỳ chọn)</Text>
                    <TextInput style={styles.inputField} placeholder="Ví dụ: 300" keyboardType="numeric" value={postKcal} onChangeText={setPostKcal} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>Phút tập (Tuỳ chọn)</Text>
                    <TextInput style={styles.inputField} placeholder="Ví dụ: 45" keyboardType="numeric" value={postDuration} onChangeText={setPostDuration} />
                  </View>
                </View>

                <Text style={styles.inputLabel}>Ảnh đại diện bài tập (Tuỳ chọn)</Text>
                <Text style={{ fontSize: 12, color: '#666', marginBottom: 8, fontStyle: 'italic' }}>*Nếu không chọn, hệ thống sẽ tự lấy ảnh từ YouTube</Text>
                <Pressable style={styles.imagePickerBtn} onPress={handlePickImage}>
                  {postImageUri ? (
                    <Image source={{ uri: postImageUri }} style={styles.imagePreview} />
                  ) : (
                    <>
                      <Ionicons name="camera" size={32} color="#888" />
                      <Text style={styles.imagePickerText}>Chọn ảnh</Text>
                    </>
                  )}
                </Pressable>
                <CustomButton title={isPosting ? "ĐANG ĐĂNG..." : "ĐĂNG BÀI"} onPress={handleCreatePost} disabled={isPosting} style={{ marginTop: 24 }} />
              </ScrollView>
            </View>
          </View>
        </Modal>

        {selectedProgram && (
          <Modal visible={!!selectedProgram} animationType="slide" transparent={false}>
            <View style={{ flex: 1, backgroundColor: '#FFF' }}>
              <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
                <Image source={{ uri: selectedProgram.image }} style={{ width: '100%', height: SCREEN_H * 0.4 }} />
                <LinearGradient colors={['rgba(0,0,0,0.5)', 'transparent']} style={{ position: 'absolute', top: 0, width: '100%', height: 100 }} />
                <Pressable style={[styles.closeModalBtn, { top: Platform.OS === 'ios' ? 50 : 20 }]} onPress={() => setSelectedProgram(null)}>
                  <Ionicons name="close" size={24} color="#FFF" />
                </Pressable>

                <View style={styles.programModalContent}>
                  <Text style={styles.programModalTitle}>{selectedProgram.title}</Text>
                  <Text style={styles.programModalDesc}>{selectedProgram.description}</Text>

                  <View style={styles.programStatsRow}>
                    <View style={styles.programStatBox}>
                      <Ionicons name="flame" size={24} color="#FF6B6B" />
                      <Text style={styles.programStatText}>{selectedProgram.goal}</Text>
                    </View>
                    <View style={styles.programStatBox}>
                      <Ionicons name="bar-chart" size={24} color={COLORS.primary} />
                      <Text style={styles.programStatText}>{selectedProgram.difficulty}</Text>
                    </View>
                    <View style={styles.programStatBox}>
                      <Ionicons name="time" size={24} color="#FF9800" />
                      <Text style={styles.programStatText}>{selectedProgram.duration_days} ngày</Text>
                    </View>
                  </View>

                  <View style={styles.programDetailsContainer}>
                    <Text style={styles.detailSectionTitle}>Chi tiết lộ trình</Text>
                    
                    <View style={styles.detailItem}>
                      <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} style={{ marginRight: 12, marginTop: 2 }} />
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 13, fontWeight: '700', color: '#666', marginBottom: 4 }}>VÙNG CƠ TẬP TRUNG</Text>
                        <View style={styles.focusAreaRow}>
                          {selectedProgram.focus_areas?.map((area, idx) => (
                            <View key={idx} style={styles.focusAreaChip}>
                              <Text style={styles.focusAreaChipText}>{area}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    </View>

                    <View style={styles.detailItem}>
                      <Ionicons name="time" size={20} color="#FF9800" style={{ marginRight: 12, marginTop: 2 }} />
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 13, fontWeight: '700', color: '#666', marginBottom: 4 }}>THỜI GIAN TẬP TRUNG BÌNH</Text>
                        <Text style={styles.detailItemText}>{selectedProgram.daily_avg_duration}</Text>
                      </View>
                    </View>

                    <View style={styles.detailItem}>
                      <Ionicons name="partly-sunny" size={20} color="#4ECDC4" style={{ marginRight: 12, marginTop: 2 }} />
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 13, fontWeight: '700', color: '#666', marginBottom: 4 }}>THỜI ĐIỂM TẬP PHÙ HỢP</Text>
                        <Text style={styles.detailItemText}>{selectedProgram.suitable_time}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={{ marginBottom: 40 }}>
                    <Text style={styles.detailSectionTitle}>Nội dung lộ trình (Mẫu)</Text>
                    {selectedProgram.preview_schedule?.map((day, idx) => (
                      <View key={idx} style={{ marginBottom: 12 }}>
                        <Pressable 
                          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F8F9FA', padding: 12, borderRadius: 12 }}
                          onPress={() => setExpandedPreviewDay(expandedPreviewDay === idx ? null : idx)}
                        >
                          <Text style={{ fontSize: 14, fontWeight: '800', color: COLORS.primary, marginLeft: 4 }}>{day.title.toUpperCase()}</Text>
                          <Ionicons name={expandedPreviewDay === idx ? "chevron-up" : "chevron-down"} size={20} color={COLORS.primary} />
                        </Pressable>
                        {expandedPreviewDay === idx && (
                          <View style={{ marginTop: 12, paddingHorizontal: 4 }}>
                            {day.exercises?.length > 0 ? day.exercises.map((ex, i) => (
                              <View key={i} style={styles.previewExCard}>
                                <View style={styles.previewExThumbContainer}>
                                  <Image source={{ uri: ex.thumb || 'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Lucky' }} style={styles.previewExThumb} />
                                  <View style={styles.previewExPlay}><Ionicons name="play" size={12} color="#FFF" /></View>
                                </View>
                                <View style={{ flex: 1 }}>
                                  <Text style={styles.previewExName}>{ex.name}</Text>
                                  <Text style={styles.previewExDuration}>{ex.duration}</Text>
                                </View>
                              </View>
                            )) : (
                              <Text style={styles.previewMoreText}>Ngày phục hồi / Giãn cơ</Text>
                            )}
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                  <CustomButton 
                    title={plans.some(p => p.preset_id === selectedProgram.id) ? "ĐÃ THÊM VÀO CÁ NHÂN" : "THÊM VÀO LỘ TRÌNH"} 
                    onPress={async () => { 
                      if (plans.some(p => p.preset_id === selectedProgram.id)) return;
                      await generateNewPlan(token, selectedProgram.goal, selectedProgram.difficulty, selectedProgram.duration_days, selectedProgram.preview_schedule, selectedProgram.id, selectedProgram.title, selectedProgram.image); 
                      setSelectedProgram(null); 
                    }} 
                    style={{ width: '100%', height: 56, borderRadius: 16, marginBottom: 40, backgroundColor: plans.some(p => p.preset_id === selectedProgram.id) ? '#4ECDC4' : COLORS.primary }} 
                    disabled={isPlanLoading || plans.some(p => p.preset_id === selectedProgram.id)} 
                  />
                </View>
              </ScrollView>
            </View>
          </Modal>
        )}

        <Modal visible={isCommentsModalVisible} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { flex: 0.8, width: '100%', maxWidth: 480, alignSelf: 'center', borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Bình luận</Text>
                <Pressable onPress={() => setIsCommentsModalVisible(false)} style={styles.modalCloseBtn}>
                  <Ionicons name="close" size={24} color="#333" />
                </Pressable>
              </View>
              
              <FlatList
                data={comments}
                keyExtractor={item => item.id}
                contentContainerStyle={{ padding: 20 }}
                renderItem={({ item }) => {
                  const commentImageUrl = item.image_url?.startsWith('/uploads') ? BASE_URL.replace('/api', '') + item.image_url : item.image_url;
                  return (
                    <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                      <Image source={{ uri: item.avatar || 'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Peanut' }} style={{ width: 36, height: 36, borderRadius: 18, marginRight: 12 }} />
                      <View style={{ flex: 1, backgroundColor: '#F5F5F5', padding: 12, borderRadius: 12 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <Text style={{ fontWeight: '700', color: '#333' }}>{item.user_name}</Text>
                          <Text style={{ fontSize: 11, color: '#888' }}>{formatTimeAgo(item.created_at)}</Text>
                        </View>
                        {!!item.content && <Text style={{ color: '#555', lineHeight: 20 }}>{item.content}</Text>}
                        {commentImageUrl ? (
                          <Image source={{ uri: commentImageUrl }} style={{ width: '100%', height: 150, borderRadius: 8, marginTop: 8 }} resizeMode="cover" />
                        ) : null}
                      </View>
                    </View>
                  );
                }}
                ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#888', marginTop: 40 }}>Chưa có bình luận nào. Hãy là người đầu tiên!</Text>}
              />
              
              <View style={{ borderTopWidth: 1, borderTopColor: '#EEE', padding: 16, paddingBottom: Platform.OS === 'ios' ? 32 : 16 }}>
                {commentImageUri && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <Image source={{ uri: commentImageUri }} style={{ width: 60, height: 60, borderRadius: 8, marginRight: 8 }} />
                    <Pressable onPress={() => setCommentImageUri(null)} style={{ padding: 4, backgroundColor: '#FFF', borderRadius: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2 }}>
                      <Ionicons name="close" size={16} color="#FF4B4B" />
                    </Pressable>
                  </View>
                )}
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Pressable onPress={pickCommentImage} style={{ marginRight: 12 }}>
                    <Ionicons name="image-outline" size={24} color="#888" />
                  </Pressable>
                  <TextInput
                    style={{ flex: 1, backgroundColor: '#F5F5F5', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: '#333' }}
                    placeholder="Thêm bình luận..."
                    value={commentText}
                    onChangeText={setCommentText}
                  />
                  <Pressable onPress={postComment} disabled={isPostingComment} style={{ marginLeft: 12, opacity: (commentText.trim() || commentImageUri) && !isPostingComment ? 1 : 0.5 }}>
                    <Ionicons name="send" size={24} color={COLORS.primary} />
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        </Modal>

        {/* LOG ACTIVITY MODAL */}
        <Modal visible={isLogActivityModalVisible} animationType="fade" transparent={true}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            <View style={{ backgroundColor: '#FFF', width: '100%', borderRadius: 24, padding: 20, maxHeight: '80%' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ fontSize: 18, fontWeight: '800', color: '#1A1D1E' }}>Ghi nhận bài tập ngoài</Text>
                <Pressable onPress={() => setIsLogActivityModalVisible(false)} style={{ padding: 4, marginRight: -4 }}>
                  <Ionicons name="close" size={24} color="#333" />
                </Pressable>
              </View>

              <View style={{ flexDirection: 'row', marginBottom: 16, backgroundColor: '#F0F0F0', borderRadius: 12, padding: 4 }}>
                <Pressable 
                  style={{ flex: 1, paddingVertical: 8, alignItems: 'center', backgroundColor: logActivityTab === 0 ? '#FFF' : 'transparent', borderRadius: 8, elevation: logActivityTab === 0 ? 2 : 0 }}
                  onPress={() => setLogActivityTab(0)}
                >
                  <Text style={{ fontWeight: '600', color: logActivityTab === 0 ? COLORS.primary : '#888' }}>Tính tự động</Text>
                </Pressable>
                <Pressable 
                  style={{ flex: 1, paddingVertical: 8, alignItems: 'center', backgroundColor: logActivityTab === 1 ? '#FFF' : 'transparent', borderRadius: 8, elevation: logActivityTab === 1 ? 2 : 0 }}
                  onPress={() => setLogActivityTab(1)}
                >
                  <Text style={{ fontWeight: '600', color: logActivityTab === 1 ? COLORS.primary : '#888' }}>Nhập thủ công</Text>
                </Pressable>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#555', marginBottom: 8 }}>Môn thể thao</Text>
                  {logActivityTab === 0 ? (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {Object.keys(MET_VALUES).map(act => (
                        <Pressable 
                          key={act} 
                          onPress={() => setLogActivityType(act)}
                          style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: logActivityType === act ? COLORS.primary : '#F5F5F5' }}
                        >
                          <Text style={{ color: logActivityType === act ? '#FFF' : '#555', fontWeight: '600', fontSize: 13 }}>{act}</Text>
                        </Pressable>
                      ))}
                    </View>
                  ) : (
                    <TextInput
                      style={{ backgroundColor: '#F5F5F5', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, fontSize: 15 }}
                      placeholder="VD: Đạp xe công viên"
                      value={logActivityType}
                      onChangeText={setLogActivityType}
                    />
                  )}
                </View>

                <View style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#555', marginBottom: 8 }}>Thời gian (phút)</Text>
                  <TextInput
                    style={{ backgroundColor: '#F5F5F5', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, fontSize: 15 }}
                    placeholder="Nhập số phút tập"
                    keyboardType="numeric"
                    value={logActivityDuration}
                    onChangeText={setLogActivityDuration}
                  />
                  {logActivityType === 'Gym (Weightlifting)' && logActivityTab === 0 && (
                    <Text style={{ fontSize: 11, color: '#888', marginTop: 6, fontStyle: 'italic' }}>* Nhập tổng thời gian buổi tập (bao gồm cả lúc nghỉ)</Text>
                  )}
                </View>

                {logActivityTab === 1 && (
                  <View style={{ marginBottom: 16 }}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: '#555', marginBottom: 8 }}>Số Calo tiêu hao (kcal)</Text>
                    <TextInput
                      style={{ backgroundColor: '#F5F5F5', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, fontSize: 15 }}
                      placeholder="Nhập số Calo từ đồng hồ"
                      keyboardType="numeric"
                      value={logActivityCalories}
                      onChangeText={setLogActivityCalories}
                    />
                  </View>
                )}

                <CustomButton 
                  title={isLoggingActivity ? "ĐANG LƯU..." : "LƯU KẾT QUẢ"} 
                  onPress={handleLogActivitySubmit} 
                  disabled={isLoggingActivity}
                  style={{ borderRadius: 16, height: 48, marginTop: 12, width: '100%' }}
                />
              </ScrollView>
            </View>
          </View>
        </Modal>

        {activeTab === 0 && (
          <Pressable 
            style={{ position: 'absolute', right: 20, bottom: 80, backgroundColor: COLORS.primary, width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3 }}
            onPress={() => setIsLogActivityModalVisible(true)}
          >
            <Ionicons name="add" size={32} color="#FFF" />
          </Pressable>
        )}

      </ResponsiveContainer>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  const isRest = workoutState === 'REST';
  const isDone = workoutState === 'DONE';
  const previewExercise = isRest ? nextExercise : currentExercise;
  const burned = calculateBurnedKcal();

  return (
    <View style={styles.emeraldContainer}>
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
          <View style={[styles.counterBadge, { top: insets.top + 12 }]}>
            <Text style={styles.counterText}>{currentIndex + 1} / {workoutExercises.length}</Text>
          </View>
        </View>
      )}

      <View style={[styles.bottomArea, isDone && { flex: 1, justifyContent: 'center' }]}>
        {isDone ? (
          <View style={styles.doneWrapper}>
            <Ionicons name="trophy" size={72} color="#FFD700" />
            <Text style={styles.doneTitle}>Hoàn thành!</Text>
            <View style={styles.doneCardRow}>
              <View style={[styles.doneStatCard, { borderColor: COLORS.emerald?.accent || '#4ade80' }]}>
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
                <Text style={{ color: COLORS.emerald?.accent || '#4ade80', fontWeight: '800' }}>{burned.toFixed(0)} kcal</Text>.
              </Text>
            </View>
            <View style={{ width: '100%', paddingHorizontal: 20, marginTop: 20 }}>
              <CustomButton title={`Lưu ${burned.toFixed(0)} kcal vào quỹ`} onPress={handleLogAndExit} />
            </View>
          </View>
        ) : (
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
            <View style={styles.glassControls}>
              <Pressable onPress={handleStop} style={styles.glassBtn}>
                <Ionicons name="stop" size={24} color="#FFF" />
                <Text style={styles.glassBtnLabel}>Dừng</Text>
              </Pressable>
              <Pressable onPress={() => setIsPaused(!isPaused)} style={styles.glassMainBtn}>
                <Ionicons name={isPaused ? 'play' : 'pause'} size={32} color={COLORS.emerald?.bg || '#1B4332'} />
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

const styles = StyleSheet.create({
  planHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },
  planTitle: { fontSize: 28, fontWeight: '900', color: '#1A1D1E' },
  resumeBanner: { marginHorizontal: 20, marginBottom: 16, borderRadius: 16, overflow: 'hidden', ...SHADOWS.small },
  resumeBannerGradient: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  resumeBannerIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center' },
  resumeBannerTitle: { fontSize: 15, fontWeight: '800', color: '#FFF', marginBottom: 2 },
  resumeBannerSub: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.9)' },
  tabContainer: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: 24, padding: 4, marginHorizontal: 20, marginBottom: 16 },
  tabButton: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 20 },
  tabButtonActive: { backgroundColor: '#FFFFFF', ...SHADOWS.small },
  tabText: { fontSize: 14, fontWeight: '700', color: '#888' },
  tabTextActive: { color: COLORS.primary },
  
  subTabContainer: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#EEE', marginHorizontal: 20, marginBottom: 12 },
  subTab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  subTabActive: { borderBottomColor: COLORS.primary },
  subTabText: { fontSize: 14, fontWeight: '600', color: '#888' },
  subTabTextActive: { color: COLORS.primary, fontWeight: '700' },

  aiCreationCard: { backgroundColor: '#F8FAF8', borderRadius: 20, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: '#E8F5E9' },
  aiCreationTitle: { fontSize: 18, fontWeight: '800', color: '#333', marginBottom: 8 },
  aiCreationDesc: { fontSize: 14, color: '#666', lineHeight: 22, marginBottom: 16 },

  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F7FA', marginHorizontal: 20, borderRadius: 16, paddingHorizontal: 16, height: 48, marginBottom: 12 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, fontWeight: '500', color: '#1A1D1E' },
  categoryStrip: { paddingHorizontal: 20, paddingBottom: 12, gap: 8 },
  categoryChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F5F7FA', borderWidth: 1, borderColor: 'transparent' },
  categoryChipActive: { backgroundColor: '#E8F5E9', borderColor: COLORS.primary },
  categoryChipText: { fontSize: 13, fontWeight: '700', color: '#666' },
  categoryChipTextActive: { color: COLORS.primary },
  dailyCardContainer: { paddingHorizontal: 20, paddingTop: 16 },
  dailyHeroCard: { width: '100%', height: 380, borderRadius: 32, overflow: 'hidden', backgroundColor: '#000', ...SHADOWS.premium },
  dailyHeroImage: { width: '100%', height: '100%', resizeMode: 'cover', opacity: 0.8 },
  dailyHeroOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', padding: 24 },
  dailyHeroBadge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginBottom: 8 },
  dailyHeroBadgeText: { fontSize: 12, fontWeight: '800', color: '#FFF' },
  dailyHeroTitle: { fontSize: 32, fontWeight: '900', color: '#FFF', marginBottom: 4, letterSpacing: -0.5 },
  dailyHeroSubtitle: { fontSize: 15, fontWeight: '600', color: 'rgba(255,255,255,0.8)' },
  dayStrip: { paddingHorizontal: 20, paddingVertical: 8, gap: 12 },
  dayChip: { width: 56, height: 76, justifyContent: 'center', alignItems: 'center', borderRadius: 28, backgroundColor: '#F5F7FA', borderWidth: 1, borderColor: 'transparent' },
  dayChipActive: { backgroundColor: COLORS.primary, ...SHADOWS.green },
  dayChipSubText: { fontSize: 11, fontWeight: '600', color: '#888', marginBottom: 2 },
  dayChipText: { fontSize: 20, fontWeight: '800', color: '#1A1D1E' },
  dayChipTextActive: { color: '#FFF' },
  activeDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#FFF', marginTop: 4 },
  programCard: { width: '100%', height: 220, borderRadius: 28, overflow: 'hidden', marginBottom: 20, ...SHADOWS.premium },
  programImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  programOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'space-between', padding: 20 },
  programBadge: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  programBadgeText: { color: '#FFF', fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
  programTitle: { color: '#FFF', fontSize: 28, fontWeight: '900', marginBottom: 6, letterSpacing: -0.5 },
  programSubtitle: { color: '#FFD700', fontSize: 14, fontWeight: '700' },
  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end', zIndex: 100 },
  programModalContainer: { backgroundColor: '#FFF', borderTopLeftRadius: 40, borderTopRightRadius: 40, overflow: 'hidden', height: '85%' },
  programModalImage: { width: '100%', height: 300, resizeMode: 'cover' },
  closeModalBtn: { position: 'absolute', top: 20, right: 20, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  programModalContent: { padding: 24, marginTop: -32, backgroundColor: '#FFF', borderTopLeftRadius: 32, borderTopRightRadius: 32 },
  programModalTitle: { fontSize: 28, fontWeight: '900', color: '#1A1D1E', marginBottom: 12 },
  programModalDesc: { fontSize: 15, color: '#666', lineHeight: 24, marginBottom: 24 },
  programStatsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, backgroundColor: '#F8FAF8', padding: 20, borderRadius: 24, ...SHADOWS.small },
  programStatBox: { flex: 1, alignItems: 'center' },
  programStatText: { marginTop: 8, fontSize: 13, fontWeight: '700', color: '#444', textAlign: 'center' },
  programDetailsContainer: { marginBottom: 32, paddingHorizontal: 4 },
  detailSectionTitle: { fontSize: 18, fontWeight: '800', color: '#1A1D1E', marginBottom: 16 },
  detailItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  detailItemText: { fontSize: 15, color: '#444', lineHeight: 22 },
  focusAreaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  focusAreaChip: { backgroundColor: '#F0F5F2', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(74, 222, 128, 0.3)' },
  focusAreaChipText: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  previewExCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 16, padding: 10, marginBottom: 12, borderWidth: 1, borderColor: '#F0F0F0', marginLeft: 16 },
  previewExThumbContainer: { width: 64, height: 48, borderRadius: 12, overflow: 'hidden', marginRight: 14, justifyContent: 'center', alignItems: 'center' },
  previewExThumb: { width: '100%', height: '100%', position: 'absolute' },
  previewExPlay: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  previewExName: { fontSize: 15, fontWeight: '700', color: '#1A1D1E', marginBottom: 4 },
  previewExDuration: { fontSize: 13, color: '#666', fontWeight: '500' },
  previewMoreText: { fontSize: 13, color: '#999', fontStyle: 'italic', marginTop: 8, marginLeft: 16 },
  emeraldContainer: { flex: 1, backgroundColor: COLORS.emerald?.bg || '#1B4332' },
  videoArea: { height: SCREEN_H * 0.38, width: '100%', overflow: 'hidden', borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  videoImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  videoOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', padding: 20 },
  videoMeta: { gap: 4 },
  restLabel: { fontSize: 12, fontWeight: '800', color: '#FFB74D', letterSpacing: 1 },
  videoTitle: { fontSize: 24, fontWeight: '900', color: '#FFF' },
  videoSubtitle: { fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.7)' },
  counterBadge: { position: 'absolute', right: 16, backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  counterText: { color: '#FFF', fontWeight: '800', fontSize: 13 },
  bottomArea: { flex: 1, alignItems: 'center', paddingTop: 16 },
  exerciseName: { fontSize: 20, fontWeight: '800', color: '#FFF', textAlign: 'center', marginBottom: 4 },
  glassControls: { flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', width: '100%', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 24, marginHorizontal: 20, paddingVertical: 16, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  glassBtn: { alignItems: 'center', gap: 4 },
  glassBtnLabel: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.7)' },
  glassMainBtn: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', ...SHADOWS.green },
  doneWrapper: { alignItems: 'center', paddingHorizontal: 20 },
  doneTitle: { fontSize: 32, fontWeight: '900', color: '#FFF', marginTop: 12, marginBottom: 20 },
  doneCardRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  doneStatCard: { flex: 1, alignItems: 'center', borderRadius: 16, borderWidth: 1, paddingVertical: 12, backgroundColor: 'rgba(255,255,255,0.08)' },
  doneStatValue: { fontSize: 15, fontWeight: '800', color: '#FFF' },
  doneStatLabel: { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 4, fontWeight: '600' },
  doneExplainBox: { backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', width: '100%' },
  doneExplainTitle: { fontSize: 14, fontWeight: '800', color: '#FFD700', marginBottom: 6 },
  doneExplainText: { fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 20 },

  compactPlanCardContainer: { paddingHorizontal: 20, marginBottom: 24 },
  compactPlanCard: { width: '100%', height: 260, borderRadius: 24, overflow: 'hidden', backgroundColor: '#000', ...SHADOWS.premium },
  compactPlanImage: { width: '100%', height: '100%', resizeMode: 'cover', opacity: 0.8 },
  compactPlanOverlay: { ...StyleSheet.absoluteFillObject, padding: 16, paddingBottom: 12 },
  compactPlanHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  compactPlanTitleBadge: { backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  compactPlanTitleText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  compactPlanProgressBadge: { backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  compactPlanProgressText: { color: '#FFD700', fontSize: 12, fontWeight: '800' },
  compactPlanBody: { marginBottom: 16 },
  compactPlanSubtitle: { color: '#FFD700', fontSize: 13, fontWeight: '700', marginBottom: 4 },
  compactPlanActiveTitle: { color: '#FFF', fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  compactPlanMiniProgress: { marginTop: 8 },
  compactPlanMiniProgressText: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginBottom: 4 },
  compactPlanProgressBarBg: { width: '100%', height: 4, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 2 },
  compactPlanProgressBarFill: { height: '100%', backgroundColor: '#FFD700', borderRadius: 2 },
  compactPlanFooter: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.15)', paddingTop: 12 },
  miniDayCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  miniDayCircleActive: { backgroundColor: '#FFD700', borderColor: '#FFD700' },
  miniDayText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  miniDayTextActive: { color: '#000' },

  // FEED STYLES
  feedCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 16, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12 },
  feedHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  feedAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12, backgroundColor: '#EEE' },
  feedUser: { fontSize: 15, fontWeight: '700', color: '#1A1D1E' },
  feedTime: { fontSize: 12, color: '#888', marginTop: 2 },
  feedCaption: { fontSize: 14, color: '#444', lineHeight: 22, marginBottom: 12 },
  feedStatsBox: { flexDirection: 'row', backgroundColor: '#F8FAF8', borderRadius: 12, padding: 12, marginBottom: 16, alignItems: 'center', borderWidth: 1, borderColor: '#E8F5E9' },
  feedStatItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  feedStatText: { fontSize: 13, fontWeight: '700', color: '#333', marginLeft: 6 },
  feedStatDivider: { width: 1, height: 20, backgroundColor: '#E0E0E0' },
  feedImageContainer: { width: '100%', height: 200, borderRadius: 16, overflow: 'hidden', marginBottom: 16, backgroundColor: '#EEE' },
  feedImage: { width: '100%', height: '100%' },
  feedImageOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 12, flexDirection: 'row', alignItems: 'center' },
  feedProgramTitle: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  feedFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 12 },
  feedFooterLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  feedActionBtn: { flexDirection: 'row', alignItems: 'center' },
  feedActionText: { fontSize: 14, fontWeight: '600', color: '#555', marginLeft: 4 },
  feedSaveBtn: { backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  feedSaveText: { color: '#FFF', fontSize: 12, fontWeight: '700', marginLeft: 6 },

  // FAB
  fab: { position: 'absolute', right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', maxHeight: '90%', borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#1A1D1E' },
  modalCloseBtn: { padding: 4 },
  inputLabel: { fontSize: 14, fontWeight: '700', color: '#333', marginTop: 16, marginBottom: 8 },
  inputField: { backgroundColor: '#F5F5F5', borderRadius: 12, padding: 16, fontSize: 15, color: '#333' },
  imagePickerBtn: { backgroundColor: '#F5F5F5', height: 160, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#E0E0E0', borderStyle: 'dashed', overflow: 'hidden' },
  imagePickerText: { color: '#888', marginTop: 8, fontSize: 14, fontWeight: '500' },
  imagePreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  optionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  optionText: { fontSize: 16, fontWeight: '500', color: '#333', marginLeft: 16 }
});

export default FitnessHubScreen;
