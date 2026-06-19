import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, Platform, useWindowDimensions, ScrollView, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ResponsiveContainer from '../components/ResponsiveContainer';
import DailyHeader from '../components/diary/DailyHeader';
import WeekSelector from '../components/diary/WeekSelector';
import CalendarModal from '../components/diary/CalendarModal';
import MacroSummary from '../components/diary/MacroSummary';
import MealSection from '../components/diary/MealSection';
import DiaryItemModal from '../components/diary/DiaryItemModal';
import WorkoutHistoryList from '../components/diary/WorkoutHistoryList';
import { useAppStore } from '../store/useAppStore';
import { useWorkoutPlanStore } from '../store/useWorkoutPlanStore';
import { TouchableOpacity, Text } from 'react-native';

const MEAL_TYPES = ['Sáng', 'Trưa', 'Tối', 'Bữa phụ'];

const isSameDay = (d1, d2) => d1.toDateString() === d2.toDateString();

const DiaryScreen = () => {
  const { width: windowWidth } = useWindowDimensions();

  const {
    userProfile, diaryItems, fetchDiaryItems,
    addDiaryItem, updateDiaryItem, deleteDiaryItem
  } = useAppStore();

  const { workoutHistory, fetchWorkoutHistory } = useWorkoutPlanStore();

  // TỰ ĐỘNG LOAD DỮ LIỆU
  useFocusEffect(
    useCallback(() => {
      if (fetchDiaryItems) fetchDiaryItems();
      if (fetchWorkoutHistory) fetchWorkoutHistory();
    }, [fetchDiaryItems, fetchWorkoutHistory])
  );

  const [activeTab, setActiveTab] = useState('nutrition'); // 'nutrition' | 'workout'
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    'Sáng': true, 'Trưa': true, 'Tối': true, 'Bữa phụ': true
  });

  // Modal state
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [defaultMealType, setDefaultMealType] = useState('Trưa');

  // Lọc items theo ngày đã chọn
  const dayItems = useMemo(() => {
    if (!Array.isArray(diaryItems)) return [];
    return diaryItems.filter(item => {
      const itemDate = item.date ? new Date(item.date) : new Date();
      return isSameDay(itemDate, selectedDate);
    });
  }, [diaryItems, selectedDate]);

  const targetCalo = Math.round(userProfile?.target_calories || userProfile?.tdee || 2000);
  const stats = useMemo(() => {
    const raw = dayItems.reduce((acc, item) => {
      acc.calo += (item.calo || 0);
      acc.protein += (item.protein || 0);
      acc.carbs += (item.carbs || 0);
      acc.fat += (item.fat || 0);
      return acc;
    }, { calo: 0, protein: 0, carbs: 0, fat: 0 });

    return {
      calo: parseFloat(raw.calo.toFixed(1)),
      protein: parseFloat(raw.protein.toFixed(1)),
      carbs: parseFloat(raw.carbs.toFixed(1)),
      fat: parseFloat(raw.fat.toFixed(1))
    };
  }, [dayItems]);

  const mealGroups = useMemo(() => {
    return MEAL_TYPES.map(type => {
      const items = dayItems.filter(item => {
        const mType = (item.mealType || '').toLowerCase();
        const searchType = type.toLowerCase();
        if (searchType === 'sáng') return mType === 'sáng' || mType === 'breakfast';
        if (searchType === 'trưa') return mType === 'trưa' || mType === 'lunch';
        if (searchType === 'tối') return mType === 'tối' || mType === 'dinner';
        return mType === 'bữa phụ' || mType === 'snack' || mType === 'bữa bữa phụ';
      });
      const totalCalo = items.reduce((sum, i) => sum + (i.calo || 0), 0);
      return { type, items, totalCalo };
    });
  }, [dayItems]);

  const toggleExpand = (type) => {
    setExpandedSections(prev => ({ ...prev, [type]: !prev[type] }));
  };

  // ===== CRUD HANDLERS =====
  const handleAddItem = (mealType) => {
    setEditingItem(null);
    setDefaultMealType(mealType || 'Trưa');
    setShowItemModal(true);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setDefaultMealType(item.mealType || 'Trưa');
    setShowItemModal(true);
  };

  const handleDeleteItem = (id) => {
    Alert.alert(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn xóa món này khỏi nhật ký?",
      [
        { text: "Hủy", style: "cancel" },
        { text: "Xóa", style: "destructive", onPress: () => deleteDiaryItem?.(id) }
      ]
    );
  };

  const handleSaveItem = (payload) => {
    if (editingItem) {
      updateDiaryItem?.(payload);
    } else {
      addDiaryItem?.(payload);
    }
  };

  return (
    <ResponsiveContainer useImageBg={false}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.layout}>

          <View style={styles.leftCol}>
            <DailyHeader date={selectedDate} onOpenCalendar={() => setShowCalendar(true)} />
            <WeekSelector selectedDate={selectedDate} onSelectDate={setSelectedDate} />
            
            <View style={styles.tabContainer}>
              <TouchableOpacity 
                style={[styles.tabButton, activeTab === 'nutrition' && styles.tabActive]}
                onPress={() => setActiveTab('nutrition')}
              >
                <Text style={[styles.tabText, activeTab === 'nutrition' && styles.tabTextActive]}>Dinh dưỡng</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tabButton, activeTab === 'workout' && styles.tabActive]}
                onPress={() => setActiveTab('workout')}
              >
                <Text style={[styles.tabText, activeTab === 'workout' && styles.tabTextActive]}>Tập luyện</Text>
              </TouchableOpacity>
            </View>

            {activeTab === 'nutrition' && (
              <View style={styles.summaryWrap}>
                <MacroSummary stats={stats} targetCalo={targetCalo} />
              </View>
            )}
          </View>

          <View style={styles.rightCol}>
            {activeTab === 'nutrition' ? (
              mealGroups.map((group) => (
                <MealSection
                  key={group.type}
                  type={group.type}
                  items={group.items}
                  totalCalo={group.totalCalo}
                  isExpanded={expandedSections[group.type]}
                  onToggle={toggleExpand}
                  onEditItem={handleEditItem}
                  onDeleteItem={handleDeleteItem}
                  onAddItem={handleAddItem}
                />
              ))
            ) : (
              <WorkoutHistoryList date={selectedDate} historyItems={workoutHistory} />
            )}
          </View>
        </View>
      </ScrollView>

      <CalendarModal
        visible={showCalendar}
        selectedDate={selectedDate}
        onSelect={(d) => { setSelectedDate(d); setShowCalendar(false); }}
        onClose={() => setShowCalendar(false)}
      />

      <DiaryItemModal
        visible={showItemModal}
        onClose={() => setShowItemModal(false)}
        onSave={handleSaveItem}
        onDelete={editingItem ? handleDeleteItem : null}
        initialData={editingItem ? { ...editingItem, mealType: editingItem.mealType || defaultMealType } : null}
        selectedDate={selectedDate}
      />
    </ResponsiveContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 100 },
  layout: {
    flex: 1, flexDirection: 'column', padding: 16, paddingTop: 8,
    gap: 20, maxWidth: 1200, alignSelf: 'center', width: '100%'
  },
  leftCol: { width: '100%' },
  rightCol: { width: '100%' },
  summaryWrap: { marginTop: 10 },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    padding: 4,
    marginTop: 20,
    marginBottom: 10,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#718096',
  },
  tabTextActive: {
    color: '#2D3748',
  }
});

export default DiaryScreen;