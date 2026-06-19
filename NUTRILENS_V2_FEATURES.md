## **ĐẶC TẢ HỆ THỐNG: NUTRILENS (SMART MEAL & FITNESS PLANNER) — v2**

### **1\. TỔNG QUAN & TRIẾT LÝ THIẾT KẾ**

**Đối tượng cốt lõi**: Người tập luyện thể thao (Nhóm B), quan tâm chỉ số Macro (Protein/Carbs/Fat) để Tăng cơ / Giảm mỡ / Duy trì.

**Triết lý "Automation-First"**: Giảm thao tác gõ phím — AI Computer Vision nhận diện ảnh món ăn, Rule-based Engine lên giáo án tập, Recommendation Engine gợi ý món bù macro.

**Vòng lặp trải nghiệm**:

* Sáng: mở Dashboard xem Net Budget & Macro còn lại trong ngày.  
* Tập luyện: mở Fitness Hub → Auto-Timer theo giáo án → log calo đốt tự động → Net Budget tăng.  
* Ăn: chụp ảnh mâm cơm → AI nhận diện từng món → xác nhận → log → Net Budget giảm.  
* Đói/bí ý tưởng: bấm "Gợi ý" → AI tính Macro Gap → gợi ý món bù đắp.  
* Cuối ngày: nếu đủ điều kiện ngày hợp lệ → cộng Streak.

---

### **2\. DATABASE SCHEMA (PostgreSQL / Neon DB)**

#### **2.1 Bảng chính**

| Bảng | Cột chính | Ghi chú |
| ----- | ----- | ----- |
| `users` | `id (PK)`, `email`, `password_hash`, `created_at` | Định danh người dùng |
| `user_profiles` | `user_id (FK)`, `gender`, `age`, `height_cm`, `weight_kg`, `activity_level`, `goal`, `target_calories`, `target_protein_g`, `target_carbs_g`, `target_fat_g`, `updated_at` | Hồ sơ \+ hạn mức macro tính từ Onboarding |
| `recipes` | `id (PK)`, `title`, `instructions`, `image_url`, `serving_size_g`, `calories_per_100g`, `protein_per_100g`, `carbs_per_100g`, `fat_per_100g` | Master data món ăn, chuẩn theo 100g |
| `recipe_meal_types` | `recipe_id (FK)`, `meal_type` (enum: breakfast/lunch/dinner/snack) | Bảng phụ N-N: 1 món có thể thuộc nhiều bữa |
| `meal_logs` | `id (PK)`, `user_id`, `recipe_id`, `meal_session_id` (nullable UUID), `meal_type`, `gram_input`, `calories_consumed`, `protein_g`, `carbs_g`, `fat_g`, `log_method` (enum: ai\_scan/manual\_search), `eaten_at` | `meal_session_id` dùng để gom các món được log từ **cùng 1 lần chụp ảnh mâm cơm** |
| `exercises` | `id (PK)`, `name_vn`, `met_value`, `category`, `target_muscle`, `goal_type` (cut/bulk/maintain/all), `default_duration_min` | Master data bài tập |
| `workout_logs` | `id (PK)`, `user_id`, `exercise_id`, `duration_min`, `calories_burned`, `logged_at` | Calo đốt \= MET × cân nặng × (phút/60) |
| `user_streaks` | `user_id (PK/FK)`, `current_streak`, `last_valid_date` | Cache streak, cập nhật mỗi khi có log mới hoặc qua ngày mới |

#### **2.2 Bảng cấu hình (mới, để tránh hard-code trong code)**

**`activity_level_factors`** — mapping hệ số TDEE:

| activity\_level (enum) | factor |
| ----- | ----- |
| `sedentary` (ít vận động, ngồi văn phòng) | 1.2 |
| `light` (vận động nhẹ, 1-3 buổi/tuần) | 1.375 |
| `moderate` (3-5 buổi/tuần) | 1.55 |
| `active` (6-7 buổi/tuần) | 1.725 |
| `very_active` (vận động viên, lao động nặng) | 1.9 |

**`macro_ratio_by_goal`** — tỷ lệ % calo cho từng macro theo mục tiêu (3 số luôn cộng \= 100%):

| goal | Protein % | Carb % | Fat % | Lý do |
| ----- | ----- | ----- | ----- | ----- |
| `lose_weight` (Giảm mỡ) | 35% | 35% | 30% | Protein cao giữ cơ \+ no lâu khi cắt calo |
| `gain_muscle` (Tăng cơ) | 30% | 45% | 25% | Carb cao hỗ trợ năng lượng tập nặng |
| `maintain` (Duy trì) | 25% | 50% | 25% | Cân bằng theo khuyến nghị chung |

Bảng này nên để ở dạng config (JSON/table), không hard-code trong logic — vì sau này có thể cho user chỉnh tay tỷ lệ riêng (advanced mode).

---

### **3\. LUỒNG 1: SMART ONBOARDING**

#### **3.1 UI/UX**

* 3 màn hình nối tiếp, có Progress Bar, font Plus Jakarta Sans.  
* Màn 1: gender, age, height\_cm, weight\_kg — nhập bằng Numpad.  
* Màn 2: chọn `activity_level` bằng Tap Cards (5 card tương ứng 5 mức ở bảng `activity_level_factors`, mỗi card có mô tả ngắn dễ hiểu, ví dụ "Ít vận động — Dân văn phòng, ít tập").  
* Màn 3: chọn `goal` bằng Tap Cards (3 card: Giảm mỡ / Tăng cơ / Duy trì).

#### **3.2 Validation input (bắt buộc)**

* `age`: 13–100 (số nguyên).  
* `height_cm`: 100–250.  
* `weight_kg`: 30–250, cho phép 1 số lẻ (vd 65.5).  
* Nếu input ngoài range → trả lỗi 400, không tính toán.

#### **3.3 Công thức tính toán (Backend)**

**Bước 1 — BMR (Mifflin-St Jeor):**

BMRnam=10×weight\_kg+6.25×height\_cm−5×age+5BMR\_{nam} \= 10 \\times weight\\\_kg \+ 6.25 \\times height\\\_cm \- 5 \\times age \+ 5BMRnam​=10×weight\_kg+6.25×height\_cm−5×age+5 BMRnu=10×weight\_kg+6.25×height\_cm−5×age−161BMR\_{nu} \= 10 \\times weight\\\_kg \+ 6.25 \\times height\\\_cm \- 5 \\times age \- 161BMRnu​=10×weight\_kg+6.25×height\_cm−5×age−161

**Bước 2 — TDEE:**

TDEE=BMR×factor(activity\_level)TDEE \= BMR \\times factor(activity\\\_level)TDEE=BMR×factor(activity\_level)

(factor lấy từ bảng `activity_level_factors`)

**Bước 3 — Target Calories theo goal:**

| goal | Công thức |
| ----- | ----- |
| `lose_weight` | TargetCal=TDEE−500TargetCal \= TDEE \- 500 TargetCal=TDEE−500 |
| `gain_muscle` | TargetCal=TDEE+300TargetCal \= TDEE \+ 300 TargetCal=TDEE+300 |
| `maintain` | TargetCal=TDEETargetCal \= TDEE TargetCal=TDEE |

Ràng buộc an toàn: nếu TargetCal\<1200TargetCal \< 1200 TargetCal\<1200 (nữ) hoặc \<1500\< 1500 \<1500 (nam) → clamp về mức sàn này và hiển thị cảnh báo "Mục tiêu calo quá thấp, đã điều chỉnh về mức an toàn".

**Bước 4 — Quy đổi Macro (g), dùng `macro_ratio_by_goal`:**

Protein\_g=TargetCal×Protein%4,Carb\_g=TargetCal×Carb%4,Fat\_g=TargetCal×Fat%9Protein\\\_g \= \\frac{TargetCal \\times Protein\\%}{4}, \\quad Carb\\\_g \= \\frac{TargetCal \\times Carb\\%}{4}, \\quad Fat\\\_g \= \\frac{TargetCal \\times Fat\\%}{9}Protein\_g=4TargetCal×Protein%​,Carb\_g=4TargetCal×Carb%​,Fat\_g=9TargetCal×Fat%​

(Protein và Carb: 4 kcal/g; Fat: 9 kcal/g — lưu ý chỗ này dev hay nhầm dùng chung số 4 cho cả 3.)

Kết quả `target_calories`, `target_protein_g`, `target_carbs_g`, `target_fat_g` được lưu vào `user_profiles`.

---

### **4\. LUỒNG 2: AI MEAL LOGGER (multi-item)**

#### **4.1 UI/UX**

* FAB (+) → 2 lựa chọn: **Camera Scan** hoặc **Search** (thanh search auto-focus).  
* **Camera Scan**: chụp 1 ảnh mâm cơm → AI trả về **danh sách các vùng món ăn phát hiện được** (mỗi vùng \= 1 item), mỗi item hiển thị thành 1 Card riêng kèm Top 3 gợi ý recipe \+ confidence.  
* User xác nhận từng Card (chọn đúng món trong Top 3, hoặc bấm "Tìm món khác" nếu sai hết) → mỗi Card có ô nhập Gram, Protein/Carb/Fat nhảy số real-time theo Gram.  
* Bấm "Lưu tất cả" → tất cả item trong ảnh được log cùng 1 `meal_session_id` (UUID tạo phía backend khi nhận ảnh).  
* **Search**: flow cũ — tìm món, nhập gram, log (1 món, `meal_session_id = null`).

#### **4.2 Xử lý AI (Computer Vision)**

* Ảnh Base64 gửi lên Flask.  
* Mô hình Xception fine-tune trên ảnh món Việt thực hiện **object detection/segmentation** trước (phát hiện N vùng món ăn trên mâm), sau đó **classification** từng vùng → Top 3 `recipe_id` \+ `confidence_score`.  
* Với mỗi item: nếu `confidence_score` của ứng viên đầu tiên `< 0.40` → đánh dấu item là "low\_confidence", FE hiển thị item này ở dạng "Chưa nhận diện được, vui lòng tìm tay" thay vì hiện Top 3 sai.

#### **4.3 Tính toán Macro thực tế**

Macro\_thuc\_te=Macro\_per\_100g×gram\_input100Macro\\\_thuc\\\_te \= \\frac{Macro\\\_per\\\_100g \\times gram\\\_input}{100}Macro\_thuc\_te=100Macro\_per\_100g×gram\_input​

Áp dụng cho cả 4 chỉ số: calories, protein, carbs, fat.

---

### **5\. LUỒNG 3 & 6: SMART FITNESS PLANNER & AUTO-LOG WORKOUT**

#### **5.1 UI/UX**

* Tab "Fitness Hub" hiển thị thẻ "Giáo án hôm nay (\~30 phút)" — list các bài tập kèm thời gian từng bài.  
* Bấm "BẮT ĐẦU" → Dark Mode, Timer đếm ngược to giữa màn hình, nút Play/Pause/Skip.  
* Hết timer của bài cuối → CTA "Lưu & Cộng quỹ Calo" → gọi `POST /api/workout-logs`.

#### **5.2 Rule-based Engine — đầy đủ cho 3 goal**

Engine query `exercises` theo `goal_type` của user, **và xoay vòng theo ngày trong tuần** để tránh lặp bài/nhóm cơ liên tục:

| goal | Tiêu chí lọc bài tập | Logic xoay vòng |
| ----- | ----- | ----- |
| `lose_weight` | `goal_type IN ('cut','all')` và ưu tiên `met_value > 6.0` (Cardio/HIIT) | Không cần xoay nhóm cơ — random/seed theo ngày từ pool Cardio/HIIT, tổng `default_duration_min` ≈ 30 phút |
| `gain_muscle` | `goal_type IN ('bulk','all')`, `met_value` 3.0–6.0 (Strength) | Chia chu kỳ 3 ngày theo `target_muscle`: Đẩy (ngực/vai/tay sau) → Kéo (lưng/tay trước) → Chân/core, dựa vào `target_muscle` của bài tập user đã log gần nhất trong `workout_logs` 1-2 ngày trước để chọn nhóm tiếp theo |
| `maintain` | `goal_type IN ('all')`, trộn 60% Strength \+ 40% Cardio | Xoay nhóm cơ tương tự `gain_muscle` nhưng tổng thời gian Cardio cố định \~10 phút mỗi buổi |

Lưu ý: nếu user không tập đủ 2 ngày liên tiếp (không có `workout_logs` gần đây), engine fallback về bài Full-body cơ bản để tránh lỗi logic xoay vòng.

#### **5.3 Tính calo tiêu hao**

Calories\_Burned=∑i(METi×weight\_kg×duration\_mini60)Calories\\\_Burned \= \\sum\_{i} \\left( MET\_i \\times weight\\\_kg \\times \\frac{duration\\\_min\_i}{60} \\right)Calories\_Burned=i∑​(METi​×weight\_kg×60duration\_mini​​)

`weight_kg` lấy từ `user_profiles` (cân nặng cập nhật gần nhất, không phải cân nặng lúc onboarding nếu user đã update).

#### **5.4 Validation khi log**

* `duration_min` gửi lên phải khớp (hoặc ≤) tổng `default_duration_min` của giáo án trả về từ `/api/fitness/plan` trong cùng ngày — tránh user gửi số liệu khống để "ăn gian" Net Budget. Nếu lệch quá nhiều (vd \> 150% giáo án), log vẫn được lưu nhưng FE hiển thị nhãn "Tự ghi" để minh bạch.

---

### **6\. LUỒNG 4: RECOMMENDATION ENGINE (Gợi ý bù Macro)**

#### **6.1 Vấn đề của Cosine Similarity thuần**

Cosine similarity chỉ đo **hướng**, không đo **độ lớn** — một món chỉ có vài gram protein/carb/fat vẫn có thể ra similarity \= 1.0 nếu tỷ lệ giữa 3 chỉ số giống với tỷ lệ macro đang thiếu, dù món đó gần như không bù được gì. Vì vậy cần kết hợp thêm **Coverage Score**.

#### **6.2 Công thức đầy đủ**

**Bước 1 — Tính Macro Gap** (clamp âm về 0, vì macro đã vượt thì không tính là "thiếu"):

gapp=max⁡(0,target\_protein−consumed\_protein)gap\_p \= \\max(0, target\\\_protein \- consumed\\\_protein)gapp​=max(0,target\_protein−consumed\_protein) gapc=max⁡(0,target\_carbs−consumed\_carbs)gap\_c \= \\max(0, target\\\_carbs \- consumed\\\_carbs)gapc​=max(0,target\_carbs−consumed\_carbs) gapf=max⁡(0,target\_fat−consumed\_fat)gap\_f \= \\max(0, target\\\_fat \- consumed\\\_fat)gapf​=max(0,target\_fat−consumed\_fat) Vgap=(gapp,gapc,gapf)V\_{gap} \= (gap\_p, gap\_c, gap\_f)Vgap​=(gapp​,gapc​,gapf​)

Nếu Vgap=(0,0,0)V\_{gap} \= (0,0,0) Vgap​=(0,0,0) (đã đủ/vượt hết cả 3\) → không gọi recommendation, trả message "Bạn đã đạt mục tiêu macro hôm nay 🎉".

**Bước 2 — Vector món ăn** (tính theo 1 serving chuẩn `serving_size_g`, không phải per 100g, để so sánh thực tế):

Vfood=(protein100g×serving100,carbs100g×serving100,fat100g×serving100)V\_{food} \= \\left(\\frac{protein\_{100g} \\times serving}{100}, \\frac{carbs\_{100g} \\times serving}{100}, \\frac{fat\_{100g} \\times serving}{100}\\right)Vfood​=(100protein100g​×serving​,100carbs100g​×serving​,100fat100g​×serving​)

**Bước 3 — Cosine Similarity** (đo độ khớp tỷ lệ):

CosSim=Vgap⋅Vfood∥Vgap∥∥Vfood∥CosSim \= \\frac{V\_{gap} \\cdot V\_{food}}{\\|V\_{gap}\\| \\|V\_{food}\\|}CosSim=∥Vgap​∥∥Vfood​∥Vgap​⋅Vfood​​

**Bước 4 — Coverage Score** (đo mức độ món ăn lấp được gap, cap tại 1.0 mỗi chỉ số):

Coverage=13∑i∈{p,c,f}min⁡(Vfood,igapi+ϵ,1)Coverage \= \\frac{1}{3}\\sum\_{i \\in \\{p,c,f\\}} \\min\\left(\\frac{V\_{food,i}}{gap\_i \+ \\epsilon}, 1\\right)Coverage=31​i∈{p,c,f}∑​min(gapi​+ϵVfood,i​​,1)

(ε nhỏ, vd 1, để tránh chia 0 khi 1 trong 3 gap \= 0\)

**Bước 5 — Điểm tổng hợp:**

Score=0.6×CosSim+0.4×CoverageScore \= 0.6 \\times CosSim \+ 0.4 \\times CoverageScore=0.6×CosSim+0.4×Coverage

**Bước 6 — Filter & Sort**:

* Loại các món có `Coverage < 0.05` (quá nhỏ, không đáng kể).  
* Sort theo `Score` giảm dần, lấy Top 5\.  
* Lọc theo `meal_type` (qua bảng `recipe_meal_types`) trùng với param `meal_type` truyền vào.

#### **6.3 Explain API**

`GET /api/recommendations/:recipe_id/explain?meal_type=dinner` trả về breakdown:

json  
{  
  "match\_percent": 92,  
  "breakdown": {  
    "protein": { "gap\_g": 35, "food\_g": 32, "fill\_percent": 91 },  
    "carbs": { "gap\_g": 50, "food\_g": 45, "fill\_percent": 90 },  
    "fat": { "gap\_g": 10, "food\_g": 9, "fill\_percent": 90 }  
  }  
}

FE hiển thị `match_percent` \= `round(Score × 100)` và 3 progress bar theo `fill_percent`.

---

### **7\. LUỒNG 5: DASHBOARD & BÁO CÁO TUẦN**

#### **7.1 Net Budget**

Net\_Budget=TargetCalories+CaloriesBurned−CaloriesConsumedNet\\\_Budget \= TargetCalories \+ CaloriesBurned \- CaloriesConsumedNet\_Budget=TargetCalories+CaloriesBurned−CaloriesConsumed

Hiển thị bằng vòng tròn (ring), % fill \= `CaloriesConsumed / (TargetCalories + CaloriesBurned)`.

#### **7.2 Hero Component — 3 thanh Macro, định nghĩa ngưỡng màu rõ ràng**

Với mỗi macro, tính `% = consumed / target × 100`:

| Khoảng % | Màu | Ý nghĩa |
| ----- | ----- | ----- |
| 0% – 89% | 🟠 Cam | Đang ăn, chưa đủ |
| 90% – 110% | 🟢 Xanh lá | Đủ / trong ngưỡng tốt |
| \> 110% | 🔴 Đỏ | Vượt ngưỡng |

#### **7.3 Streak — định nghĩa cụ thể**

Một **ngày hợp lệ** (valid day) \= ngày có:

* Ít nhất 1 `meal_log` cho **mỗi** `meal_type` trong (`breakfast`, `lunch`, `dinner`) — tức log đủ 3 bữa chính, VÀ  
* Tổng `calories_consumed` trong khoảng `target_calories ± 15%`.

Logic cập nhật `user_streaks`:

* Job chạy lúc 00:00 (theo timezone user) kiểm tra ngày hôm trước: nếu hợp lệ → `current_streak += 1`, `last_valid_date = hôm qua`; nếu không hợp lệ → `current_streak = 0`.

#### **7.4 Bar Chart 7 ngày**

Lấy tổng `calories_consumed` và `calories_burned` theo từng ngày trong 7 ngày gần nhất (group by `date(eaten_at)` / `date(logged_at)`), trả về cho FE vẽ chart.

---

### **8\. API CONTRACT ĐẦY ĐỦ**

| Method | Endpoint | Input | Output | Ghi chú |
| ----- | ----- | ----- | ----- | ----- |
| POST | `/api/auth/register` | `email`, `password` | `{ user_id, token }` |  |
| POST | `/api/auth/login` | `email`, `password` | `{ user_id, token }` | **Mới — bị thiếu ở bản gốc** |
| GET | `/api/user/profile` | JWT | Toàn bộ `user_profiles` của user | **Mới** — để FE load lại profile khi cần |
| POST | `/api/user/profile` | Dữ liệu sinh trắc học \+ goal | `{ target_calories, target_protein_g, target_carbs_g, target_fat_g }` | Tính theo công thức Mục 3.3 |
| GET | `/api/dashboard/today` | JWT | `net_budget`, 3 mốc macro (target+consumed+%), `meals[]`, `workouts[]`, `streak` |  |
| GET | `/api/dashboard/weekly` | JWT | Array 7 ngày: `{ date, calories_consumed, calories_burned }` | **Mới** — cho Bar Chart |
| POST | `/api/ai/recognize` | `image_base64` | `[{ session_id, items: [{ item_index, candidates: [{name_vn, confidence, recipe_id}] }] }]` | Sửa lại để hỗ trợ multi-item |
| POST | `/api/meal-logs` | `recipe_id`, `gram_input`, `meal_type`, `meal_session_id` (optional) | Tạo log, trigger FE refetch dashboard |  |
| PATCH | `/api/meal-logs/:id` | `gram_input` (và/hoặc `recipe_id`) | Updated log | **Mới — cho phép sửa log nhầm** |
| DELETE | `/api/meal-logs/:id` | – | 204 | **Mới** |
| GET | `/api/fitness/plan` | JWT | List bài tập auto-gen theo goal \+ ngày xoay vòng |  |
| POST | `/api/workout-logs` | `exercise_id_list`, `duration_min` mỗi bài | Tính calo theo Mục 5.3, tăng Net Budget |  |
| PATCH/DELETE | `/api/workout-logs/:id` | – | – | **Mới — sửa/xoá log tập** |
| GET | `/api/recommendations` | `meal_type` | Top 5 món \+ `match_percent` (Mục 6\) |  |
| GET | `/api/recommendations/:recipe_id/explain` | `meal_type` | Breakdown chi tiết (Mục 6.3) | **Mới — đưa vào bảng tổng hợp** |

#### **8.1 Quy ước response chung**

* Thành công: `{ "success": true, "data": {...} }`, HTTP 200/201.  
* Lỗi: `{ "success": false, "error": { "code": "...", "message": "..." } }`, HTTP 400/401/404/500.  
* Timezone: tất cả `eaten_at`, `logged_at` lưu UTC; "hôm nay" của Dashboard được tính theo `timezone` truyền kèm JWT/header (mặc định `Asia/Ho_Chi_Minh` nếu không có).

---

### **9\. PHÂN CÔNG KỸ THUẬT (giữ nguyên, bổ sung nhỏ)**

**Người A (AI & Algorithm – Python/Flask)**

* Train/fine-tune Xception cho food detection \+ classification món Việt (cần xử lý multi-object trên 1 ảnh mâm cơm — xem Mục 4.2), export TFLite.  
* Backend Flask \+ SQLAlchemy \+ Neon DB, đảm bảo toàn bộ 14 endpoint ở Mục 8\.  
* Implement Recommendation Engine theo công thức Mục 6 (cosine \+ coverage), endpoint `/explain`.  
* Cron job tính `user_streaks` (Mục 7.3).

**Người B (Frontend Mobile – React Native & Zustand)**

* UI Expo Router, font Plus Jakarta Sans, `react-native-svg` cho progress bar (3 màu theo ngưỡng Mục 7.2).  
* Zustand `dashboardStore`: tự refetch `/api/dashboard/today` sau mọi POST/PATCH/DELETE liên quan log.  
* UI multi-item confirm sau khi chụp ảnh mâm cơm (Mục 4.1).  
* Timer Workout (setInterval / react-native-reanimated).

