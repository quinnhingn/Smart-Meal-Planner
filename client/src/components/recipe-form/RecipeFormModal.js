// src/components/recipe-form/RecipeFormModal.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, Modal, TextInput, ScrollView, Pressable,
  StyleSheet, Platform, KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker'; // THÊM IMPORT NÀY
import { COLORS } from '../../constants/theme';
import FormImagePicker from './FormImagePicker';
import FormIngredients from './FormIngredients';
import FormSteps from './FormSteps';

const DIFFICULTIES = ['Dễ', 'Trung bình', 'Khó'];
const INITIAL_LABELS = ['Giữ dáng', 'Tăng cơ', 'Bữa sáng', 'Bữa trưa', 'Bữa tối', 'Bữa phụ', 'Gia đình', 'Nhanh gọn', 'Keto', 'Low Carb', 'High Protein', 'Trẻ em', 'Dễ tiêu'];

const EMPTY_RECIPE = {
  title: '',
  image: '',
  videoUrl: '',
  labels: [],
  macros: { protein: 0, carbs: 0, fat: 0, calories: 0 },
  cookTime: '',
  servings: '',
  difficulty: 'Dễ',
  ingredients: [],
  steps: [],
};

const RecipeFormModal = ({ visible, onClose, onSave, onDraft, initialData = null }) => {
  const isEdit = !!initialData;
  const [data, setData] = useState(EMPTY_RECIPE);
  const [errors, setErrors] = useState({});

  // State cho tính năng thêm nhãn "Khác"
  const [dynamicLabels, setDynamicLabels] = useState(INITIAL_LABELS);
  const [showCustomLabel, setShowCustomLabel] = useState(false);
  const [customLabelText, setCustomLabelText] = useState('');

  useEffect(() => {
    if (visible) {
      if (initialData) {
        setData({ ...EMPTY_RECIPE, ...initialData });
        const newLabels = initialData.labels?.filter(l => !INITIAL_LABELS.includes(l)) || [];
        setDynamicLabels([...INITIAL_LABELS, ...newLabels]);
      } else {
        setData({ ...EMPTY_RECIPE, ingredients: [], steps: [] });
        setDynamicLabels(INITIAL_LABELS);
      }
      setErrors({});
      setShowCustomLabel(false);
      setCustomLabelText('');
    }
  }, [visible, initialData]);

  // Lắng nghe thay đổi của nguyên liệu để cộng dồn Macro tổng
  useEffect(() => {
    if (!data.ingredients || data.ingredients.length === 0) return;

    const totals = data.ingredients.reduce((acc, curr) => {
      return {
        calories: acc.calories + (Number(curr.calories) || 0),
        protein: acc.protein + (Number(curr.protein) || 0),
        carbs: acc.carbs + (Number(curr.carbs) || 0),
        fat: acc.fat + (Number(curr.fat) || 0),
      };
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

    // Làm tròn 1 chữ số thập phân
    totals.protein = Math.round(totals.protein * 10) / 10;
    totals.carbs = Math.round(totals.carbs * 10) / 10;
    totals.fat = Math.round(totals.fat * 10) / 10;

    // Tránh re-render vô tận bằng cách so sánh trước khi set state
    if (
      totals.calories !== data.macros.calories ||
      totals.protein !== data.macros.protein ||
      totals.carbs !== data.macros.carbs ||
      totals.fat !== data.macros.fat
    ) {
      setData(prev => ({ ...prev, macros: totals }));
    }
  }, [data.ingredients]);

  // HÀM 1: Xử lý chọn ảnh đa nền tảng
  const handlePickImage = async () => {
    // Yêu cầu quyền truy cập thư viện ảnh (tự động xử lý trên Mobile, Web sẽ bỏ qua)
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Cần cấp quyền truy cập ảnh để tải ảnh lên!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setData(prev => ({ ...prev, image: result.assets[0].uri }));
    }
  };

  const validate = () => {
    const errs = {};
    if (!data.title.trim()) errs.title = 'Vui lòng nhập tên món';
    if (!data.image) errs.image = 'Vui lòng chọn ảnh đại diện';
    if (!data.cookTime || isNaN(Number(data.cookTime))) errs.cookTime = 'Nhập thời gian hợp lệ';
    if (!data.servings || isNaN(Number(data.servings))) errs.servings = 'Nhập khẩu phần hợp lệ';
    if (data.ingredients.length === 0) errs.ingredients = 'Thêm ít nhất 1 nguyên liệu';
    if (data.ingredients.some(i => !i.name.trim())) errs.ingredients = 'Nguyên liệu phải có tên';
    if (data.steps.length === 0) errs.steps = 'Thêm ít nhất 1 bước';
    if (data.steps.some(s => !s.description.trim())) errs.steps = 'Bước phải có mô tả';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const payload = {
      ...data,
      cookTime: Number(data.cookTime),
      servings: Number(data.servings),
      macros: {
        protein: Number(data.macros.protein) || 0,
        carbs: Number(data.macros.carbs) || 0,
        fat: Number(data.macros.fat) || 0,
        calories: Number(data.macros.calories) || 0,
      },
    };
    onSave?.(payload);
  };

  const handleDraft = () => {
    const hasContent = data.title.trim() || data.image || data.ingredients.length > 0 || data.steps.length > 0;
    if (!hasContent) {
      setErrors({ title: 'Nhập ít nhất thông tin cơ bản để lưu nháp' });
      return;
    }
    onDraft?.({ ...data, isDraft: true });
  };

  const toggleLabel = (label) => {
    setData(prev => ({
      ...prev,
      labels: prev.labels.includes(label)
        ? prev.labels.filter(l => l !== label)
        : [...prev.labels, label],
    }));
  };

  // HÀM 2: Thêm nhãn custom
  const handleAddCustomLabel = () => {
    const trimmed = customLabelText.trim();
    if (trimmed && !dynamicLabels.includes(trimmed)) {
      setDynamicLabels(prev => [...prev, trimmed]);
      toggleLabel(trimmed); // Tự động chọn luôn nhãn vừa tạo
    }
    setCustomLabelText('');
    setShowCustomLabel(false);
  };

  const updateMacro = (field, value) => {
    setData(prev => ({
      ...prev,
      macros: { ...prev.macros, [field]: parseFloat(value) || 0 },
    }));
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#888" />
            </Pressable>
            <Text style={styles.headerTitle}>
              {isEdit ? 'Chỉnh sửa công thức' : 'Tạo công thức mới'}
            </Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            {/* Ảnh đại diện */}
            <FormImagePicker
              image={data.image}
              onPick={handlePickImage} // ĐÃ CẬP NHẬT GỌI HÀM
              onClear={() => setData(p => ({ ...p, image: '' }))}
              label="Ảnh đại diện *"
            />
            {errors.image && <Text style={styles.error}>{errors.image}</Text>}

            {/* Tên món */}
            <Text style={styles.label}>Tên món *</Text>
            <TextInput
              value={data.title}
              onChangeText={(t) => setData(p => ({ ...p, title: t }))}
              placeholder="Ví dụ: Salad Gà Áp Chảo"
              placeholderTextColor="#BBB"
              style={[styles.input, errors.title && styles.inputError]}
            />
            {errors.title && <Text style={styles.error}>{errors.title}</Text>}

            {/* Labels với tính năng thêm nhãn Khác */}
            <Text style={styles.label}>Nhãn phân loại</Text>
            <View style={styles.labelWrap}>
              {dynamicLabels.map(label => (
                <Pressable
                  key={label}
                  onPress={() => toggleLabel(label)}
                  style={[styles.labelChip, data.labels.includes(label) && styles.labelChipActive]}
                >
                  <Text style={[styles.labelChipText, data.labels.includes(label) && styles.labelChipTextActive]}>
                    {label}
                  </Text>
                </Pressable>
              ))}

              {/* Nút Khác hoặc Ô nhập liệu */}
              {showCustomLabel ? (
                <View style={styles.customLabelWrap}>
                  <TextInput
                    value={customLabelText}
                    onChangeText={setCustomLabelText}
                    placeholder="Nhập nhãn..."
                    style={styles.customLabelInput}
                    autoFocus
                    onSubmitEditing={handleAddCustomLabel}
                  />
                  <Pressable onPress={handleAddCustomLabel} style={styles.customLabelBtn}>
                    <Ionicons name="checkmark" size={16} color="#FFF" />
                  </Pressable>
                  <Pressable onPress={() => setShowCustomLabel(false)} style={styles.customLabelBtnClose}>
                    <Ionicons name="close" size={16} color="#888" />
                  </Pressable>
                </View>
              ) : (
                <Pressable onPress={() => setShowCustomLabel(true)} style={[styles.labelChip, styles.labelChipDashed]}>
                  <Ionicons name="add" size={14} color="#888" />
                  <Text style={styles.labelChipText}>Khác</Text>
                </Pressable>
              )}
            </View>

            {/* Meta */}
            <View style={styles.metaRow}>
              <View style={styles.metaField}>
                <Text style={styles.label}>Thời gian (phút) *</Text>
                <TextInput
                  value={data.cookTime ? String(data.cookTime) : ''}
                  onChangeText={(t) => setData(p => ({ ...p, cookTime: t }))}
                  placeholder="20"
                  placeholderTextColor="#BBB"
                  keyboardType="numeric"
                  style={[styles.input, errors.cookTime && styles.inputError]}
                />
                {errors.cookTime && <Text style={styles.error}>{errors.cookTime}</Text>}
              </View>
              <View style={styles.metaField}>
                <Text style={styles.label}>Khẩu phần (người) *</Text>
                <TextInput
                  value={data.servings ? String(data.servings) : ''}
                  onChangeText={(t) => setData(p => ({ ...p, servings: t }))}
                  placeholder="2"
                  placeholderTextColor="#BBB"
                  keyboardType="numeric"
                  style={[styles.input, errors.servings && styles.inputError]}
                />
                {errors.servings && <Text style={styles.error}>{errors.servings}</Text>}
              </View>
            </View>

            {/* Difficulty */}
            <Text style={styles.label}>Độ khó *</Text>
            <View style={styles.diffRow}>
              {DIFFICULTIES.map(d => (
                <Pressable
                  key={d}
                  onPress={() => setData(p => ({ ...p, difficulty: d }))}
                  style={[styles.diffBtn, data.difficulty === d && styles.diffBtnActive]}
                >
                  <Text style={[styles.diffText, data.difficulty === d && styles.diffTextActive]}>{d}</Text>
                </Pressable>
              ))}
            </View>

            {/* Video hướng dẫn */}
            <Text style={styles.label}>Video hướng dẫn</Text>
            <TextInput
              value={data.videoUrl}
              onChangeText={(t) => setData(p => ({ ...p, videoUrl: t }))}
              placeholder="Dán link YouTube (không bắt buộc)"
              placeholderTextColor="#BBB"
              style={styles.input}
              autoCapitalize="none"
              keyboardType="url"
            />
            <View style={{ marginBottom: 16 }} />

            {/* CẤU TRÚC LẠI: Nguyên liệu nằm trên */}
            <FormIngredients
              ingredients={data.ingredients}
              onChange={(ings) => setData(p => ({ ...p, ingredients: ings }))}
            />
            {errors.ingredients && <Text style={styles.error}>{errors.ingredients}</Text>}

            {/* CẤU TRÚC LẠI: Dinh dưỡng chuyển xuống dưới Nguyên liệu */}
            <Text style={[styles.label, { marginTop: 16 }]}>Dinh dưỡng tổng (g / kcal)</Text>
            <View style={styles.macroRow}>
              <MacroField label="Protein" value={data.macros.protein} onChange={(v) => updateMacro('protein', v)} />
              <MacroField label="Carbs" value={data.macros.carbs} onChange={(v) => updateMacro('carbs', v)} />
              <MacroField label="Fat" value={data.macros.fat} onChange={(v) => updateMacro('fat', v)} />
              <MacroField label="Calories" value={data.macros.calories} onChange={(v) => updateMacro('calories', v)} />
            </View>
            <View style={{ marginBottom: 16 }} />

            {/* Các bước */}
            <FormSteps
              steps={data.steps}
              onChange={(sts) => setData(p => ({ ...p, steps: sts }))}
            />
            {errors.steps && <Text style={styles.error}>{errors.steps}</Text>}

            <View style={{ height: 100 }} />
          </ScrollView>

          {/* Action buttons */}
          <View style={styles.footer}>
            <Pressable onPress={handleDraft} style={styles.draftBtn}>
              <Ionicons name="document-outline" size={16} color={COLORS.primary} />
              <Text style={styles.draftText}>Lưu nháp</Text>
            </Pressable>
            <Pressable onPress={handleSave} style={styles.submitBtn}>
              <Text style={styles.submitText}>{isEdit ? 'CẬP NHẬT' : 'ĐĂNG BÀI'}</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const MacroField = ({ label, value }) => (
  <View style={styles.macroField}>
    <Text style={styles.macroLabel}>{label}</Text>
    <View style={[styles.macroInput, { backgroundColor: '#F0F0F0', justifyContent: 'center' }]}>
      <Text style={{ fontSize: 14, fontWeight: '700', color: '#555', textAlign: 'center' }}>
        {value || 0}
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: '#FFF', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    maxHeight: '92%', flex: 1,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8,
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  closeBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '900', color: '#1A1D1E' },
  scroll: { padding: 16 },
  label: { fontSize: 13, fontWeight: '800', color: '#666', marginBottom: 8, marginTop: 4 },
  input: {
    backgroundColor: '#F8F9FA', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, fontWeight: '600', color: '#1A1D1E',
    borderWidth: 1, borderColor: '#E8E8E8',
  },
  inputError: { borderColor: COLORS.danger, backgroundColor: '#FFEBEE' },
  error: { fontSize: 12, fontWeight: '700', color: COLORS.danger, marginTop: 4, marginBottom: 4 },
  
  // Style cho Label Chips
  labelWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  labelChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16,
    backgroundColor: '#F5F5F5', borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)',
  },
  labelChipDashed: { borderStyle: 'dashed', borderColor: '#AAA' },
  labelChipActive: { backgroundColor: COLORS.primary + '15', borderColor: COLORS.primary },
  labelChipText: { fontSize: 12, fontWeight: '700', color: '#888' },
  labelChipTextActive: { color: COLORS.primary },
  
  // Style cho Custom Label Input
  customLabelWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#F8F9FA', borderRadius: 16, borderWidth: 1, borderColor: '#E8E8E8',
    paddingLeft: 10, paddingRight: 4, paddingVertical: 4,
  },
  customLabelInput: {
    fontSize: 12, fontWeight: '700', color: '#1A1D1E', width: 80, paddingVertical: 0,
    outlineStyle: 'none',
  },
  customLabelBtn: {
    backgroundColor: COLORS.primary, width: 24, height: 24, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  customLabelBtnClose: {
    backgroundColor: '#EEE', width: 24, height: 24, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },

  metaRow: { flexDirection: 'row', gap: 12, marginBottom: 4 },
  metaField: { flex: 1 },
  diffRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  diffBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 12,
    backgroundColor: '#F5F5F5', borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)',
  },
  diffBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  diffText: { fontSize: 13, fontWeight: '700', color: '#888' },
  diffTextActive: { color: '#FFF' },
  macroRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  macroField: { flex: 1 },
  macroLabel: { fontSize: 10, fontWeight: '800', color: '#AAA', marginBottom: 4, textAlign: 'center' },
  macroInput: {
    backgroundColor: '#F8F9FA', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 10,
    fontSize: 14, fontWeight: '700', color: '#1A1D1E', textAlign: 'center',
    borderWidth: 1, borderColor: '#E8E8E8',
  },
  footer: {
    flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
    borderTopWidth: 1, borderTopColor: '#F0F0F0', backgroundColor: '#FFF',
  },
  draftBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: COLORS.primary + '10', borderRadius: 16, paddingVertical: 14,
    borderWidth: 1.5, borderColor: COLORS.primary + '30',
  },
  draftText: { fontSize: 14, fontWeight: '800', color: COLORS.primary },
  submitBtn: {
    flex: 2, alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.primary, borderRadius: 16, paddingVertical: 14,
  },
  submitText: { fontSize: 15, fontWeight: '900', color: '#FFF', letterSpacing: 0.5 },
});

export default RecipeFormModal;