export const categories = [
  { id: 'meat', name: 'Thịt & Hải sản', count: 68, completeness: 92, bgColor: '#FEE2E2', image: 'https://images.immediate.co.uk/production/volatile/sites/30/2024/06/Red-meat440-980233e.jpg?quality=90&webp=true&resize=440,400' },
  { id: 'vegetables', name: 'Rau củ quả', count: 95, completeness: 85, bgColor: '#DCFCE7', image: 'https://cdn.britannica.com/17/196817-050-6A15DAC3/vegetables.jpg?w=300' },
  { id: 'milks', name: 'Sữa & Trứng', count: 34, completeness: 78, bgColor: '#DBEAFE', image: 'https://emi.parkview.com/media/Image/Dashboard_952_Plant-Milk_10_22.jpg' },
  { id: 'grains', name: 'Ngũ cốc & Tinh bột', count: 42, completeness: 96, bgColor: '#FEF9C3', image: 'https://upload.wikimedia.org/wikipedia/commons/c/c2/Ngu-coc-granola-vua-hat-ngon.jpg' },
  { id: 'fruits', name: 'Trái cây', count: 51, completeness: 70, bgColor: '#FFF7ED', image: 'https://cdn.tgdd.vn/Files/2019/12/03/1224621/trai-cay-tot-nhung-nen-tranh-an-vao-cac-thoi-diem-nay-neu-khong-muon-tang-can-202112271556593399.jpg' },
  { id: 'spices', name: 'Gia vị', count: 12, completeness: 85, bgColor: '#F3E8FF', image: '/assets/spices.png' },
];

export const aiDetected = [
  { name: 'Bơ Sáp Đắk Lắk', scans: 240, date: '3h trước', category: 'Trái cây' },
  { name: 'Hạt Diêm Mạch (Quinoa)', scans: 154, date: '2h trước', category: 'Ngũ cốc' },
  { name: 'Hạt Chia Úc', scans: 128, date: '6h trước', category: 'Ngũ cốc' },
  { name: 'Cá Tuyết Fillet', scans: 98, date: '5h trước', category: 'Hải sản' },
  { name: 'Cải Kale', scans: 76, date: 'Hôm qua', category: 'Rau củ' },
  { name: 'Tảo bẹ Kombu', scans: 45, date: '1 ngày trước', category: 'Hải sản' },
  { name: 'Nấm Linh Chi', scans: 32, date: '2 ngày trước', category: 'Nấm' },
  { name: 'Saffron', scans: 12, date: '3 ngày trước', category: 'Gia vị' },
];

export const initialUnitConversions = [
  { from: '1 quả Táo', to: '150g' },
  { from: '1 bát Cơm', to: '180g' },
  { from: '1 quả Trứng', to: '60g' },
];

export const initialSubstitutions = [
  { item1: 'Cải Kale', item2: 'Cải bó xôi' },
  { item1: 'Hạt Chia', item2: 'Hạt Lanh' },
  { item1: 'Dầu Ô-liu', item2: 'Dầu quả bơ' },
];
