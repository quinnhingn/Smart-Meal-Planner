import React, { useState, useMemo } from 'react';
import { View, StyleSheet, Platform, useWindowDimensions, ScrollView } from 'react-native';
import ResponsiveContainer from '../components/ResponsiveContainer';
import DailyHeader from '../components/diary/DailyHeader';
import WeekSelector from '../components/diary/WeekSelector';
import CalendarModal from '../components/diary/CalendarModal';
import MacroSummary from '../components/diary/MacroSummary';
import MealSection from '../components/diary/MealSection';
import DiaryItemModal from '../components/diary/DiaryItemModal';
import { useAppStore } from '../store/useAppStore';

const MEAL_TYPES = ['Sáng', 'Trưa', 'Tối', 'Bữa phụ'];

const isSameDay = (d1, d2) => d1.toDateString() === d2.toDateString();

const DiaryScreen = () => {
  const { width: windowWidth } = useWindowDimensions();
  const isWebLarge = Platform.OS === 'web' && windowWidth > 768;

  const { userProfile, diaryItems, addDiaryItem, updateDiaryItem, deleteDiaryItem } = useAppStore();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    'Sáng': true, 'Trưa': true, 'Tối': false, 'Bữa phụ': false
  });

  // Modal state
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [defaultMealType, setDefaultMealType] = useState('Trưa');

  // Lọc items theo ngày đã chọn
  const dayItems = useMemo(() => {
    return diaryItems.filter(item => {
      if (!item.date) return isSameDay(new Date(), selectedDate);
      return isSameDay(new Date(item.date), selectedDate);
    });
  }, [diaryItems, selectedDate]);

  const targetCalo = Math.round(userProfile?.targetCalories || userProfile?.tdee || 2000);
  const stats = useMemo(() => {
    return dayItems.reduce((acc, item) => {
      acc.calo += (item.calo || 0);
      acc.protein += (item.protein || 0);
      acc.carbs += (item.carbs || 0);
      acc.fat += (item.fat || 0);
      return acc;
    }, { calo: 0, protein: 0, carbs: 0, fat: 0 });
  }, [dayItems]);

  const mealGroups = useMemo(() => {
    return MEAL_TYPES.map(type => {
      const items = dayItems.filter(item => item.mealType === type);
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
    deleteDiaryItem?.(id);
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
        <View style={[styles.layout, isWebLarge && styles.layoutWeb]}>
          
          <View style={[styles.leftCol, isWebLarge && styles.leftColWeb]}>
            <DailyHeader date={selectedDate} onOpenCalendar={() => setShowCalendar(true)} />
            <WeekSelector selectedDate={selectedDate} onSelectDate={setSelectedDate} />
            <View style={styles.summaryWrap}>
              <MacroSummary stats={stats} targetCalo={targetCalo} />
            </View>
          </View>

          <View style={[styles.rightCol, isWebLarge && styles.rightColWeb]}>
            {mealGroups.map((group) => (
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
            ))}
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
  layoutWeb: { flexDirection: 'row', alignItems: 'flex-start', gap: 28, padding: 24 },
  leftCol: { width: '100%' },
  leftColWeb: { flex: 4, position: 'sticky', top: 24 },
  rightCol: { width: '100%' },
  rightColWeb: { flex: 6 },
  summaryWrap: { marginTop: 20 },
});

export default DiaryScreen;