// src/utils/mockPantryData.js

export const MOCK_PANTRY_ITEMS = [
  {
    id: '1',
    name: 'Bông cải xanh',
    quantity: 2,
    unit: 'bó',
    expiryDays: 5,
    addedAt: '2026-05-01T10:00:00Z',
    category: 'vegetable',
    icon: '🥦',
  },
  {
    id: '2',
    name: 'Cà chua',
    quantity: 5,
    unit: 'quả',
    expiryDays: 1,
    addedAt: '2026-05-04T08:00:00Z',
    category: 'vegetable',
    icon: '🍅',
  },
  {
    id: '3',
    name: 'Ức gà',
    quantity: 300,
    unit: 'g',
    expiryDays: 0,
    addedAt: '2026-04-28T15:00:00Z',
    category: 'meat',
    icon: '🥩',
  },
  {
    id: '4',
    name: 'Sữa tươi',
    quantity: 1,
    unit: 'l',
    expiryDays: 7,
    addedAt: '2026-05-05T09:00:00Z',
    category: 'dairy',
    icon: '🥛',
  },
  {
    id: '5',
    name: 'Trứng gà',
    quantity: 10,
    unit: 'quả',
    expiryDays: 12,
    addedAt: '2026-04-25T07:00:00Z',
    category: 'dairy',
    icon: '🥚',
  },
  {
    id: '6',
    name: 'Cà rốt',
    quantity: 3,
    unit: 'củ',
    expiryDays: -2,
    addedAt: '2026-04-20T11:00:00Z',
    category: 'vegetable',
    icon: '🥕',
  },
  {
    id: '7',
    name: 'Dầu ăn',
    quantity: 500,
    unit: 'ml',
    expiryDays: 30,
    addedAt: '2026-01-15T10:00:00Z',
    category: 'condiment',
    icon: '🛢️',
  },
  {
    id: '8',
    name: 'Hành lá',
    quantity: 1,
    unit: 'bó',
    expiryDays: 3,
    addedAt: '2026-05-03T16:00:00Z',
    category: 'vegetable',
    icon: '🌿',
  },
];

export const CATEGORIES = [
  { id: 'all', name: 'Tất cả', icon: '📦' },
  { id: 'vegetable', name: 'Rau củ', icon: '🥬' },
  { id: 'meat', name: 'Thịt/Cá', icon: '🥩' },
  { id: 'dairy', name: 'Sữa/Trứng', icon: '🥛' },
  { id: 'grain', name: 'Ngũ cốc', icon: '🌾' },
  { id: 'condiment', name: 'Gia vị', icon: '🧂' },
  { id: 'other', name: 'Khác', icon: '📦' },
];

// Helper functions
export const getDaysUntilExpiry = (item) => {
  const addedDate = new Date(item.addedAt);
  const expiryDate = new Date(addedDate);
  expiryDate.setDate(addedDate.getDate() + parseInt(item.expiryDays));
  
  const today = new Date();
  const diffTime = expiryDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

export const getUrgencyLevel = (daysLeft) => {
  if (daysLeft < 0) return 'expired';
  if (daysLeft <= 2) return 'urgent';
  if (daysLeft <= 5) return 'warning';
  return 'safe';
};

export const getUrgencyColor = (level) => {
  switch (level) {
    case 'expired': return '#9E9E9E';
    case 'urgent': return '#FF5722';
    case 'warning': return '#FFC107';
    case 'safe': return '#4CAF50';
    default: return '#4CAF50';
  }
};

export const getUrgencyLabel = (level) => {
  switch (level) {
    case 'expired': return 'Đã hết hạn';
    case 'urgent': return 'Sắp hết hạn';
    case 'warning': return 'Cần chú ý';
    case 'safe': return 'Còn tốt';
    default: return 'Còn tốt';
  }
};