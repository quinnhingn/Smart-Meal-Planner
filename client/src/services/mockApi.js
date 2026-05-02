// src/services/mockApi.js

// Hàm giả lập độ trễ mạng
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const authApi = {
  login: async (email, password) => {
    await delay(1000); // Giả lập mạng chậm 1 giây
    
    // Giả lập tài khoản test
    if (email === "test@gmail.com" && password === "123456") {
      return {
        success: true,
        data: {
          access_token: "mock-jwt-token-new-user",
          has_profile: false, // Chưa khảo sát -> Sẽ bị ép vào màn Onboarding
          user: { id: 1, email: "test@gmail.com" }
        }
      };
    }
    
    if (email === "old@gmail.com" && password === "123456") {
      return {
        success: true,
        data: {
          access_token: "mock-jwt-token-old-user",
          has_profile: true, // Đã khảo sát -> Vào thẳng Dashboard
          user: { id: 2, email: "old@gmail.com" },
          profile: { tdee: 2000, target_calories: 1500, goal: 'lose_weight' }
        }
      };
    }

    return { success: false, message: "Email hoặc mật khẩu không chính xác!" };
  },

  register: async (email, password) => {
    await delay(1000);
    if (!email || !password) return { success: false, message: "Vui lòng nhập đủ thông tin!" };
    return { success: true, message: "Đăng ký thành công!" };
  },

  setupProfile: async (profileData) => {
    await delay(1500); // Giả lập Backend đang tính toán

    // Logic tính TDEE chuẩn Mifflin-St Jeor (Giả lập việc Backend làm)
    const { gender, age, height, weight, activity, goal } = profileData;
    let bmr = (10 * weight) + (6.25 * height) - (5 * age);
    bmr = gender === 'male' ? bmr + 5 : bmr - 161;

    const activityMultipliers = { sedentary: 1.2, light: 1.375, active: 1.55 };
    const tdee = Math.round(bmr * (activityMultipliers[activity] || 1.2));

    let targetCalories = tdee;
    if (goal === 'lose_weight') targetCalories -= 500;
    if (goal === 'gain_muscle') targetCalories += 300;

    return {
      success: true,
      data: {
        tdee,
        target_calories: targetCalories,
        bmi: (weight / ((height/100) * (height/100))).toFixed(1),
        ...profileData
      }
    };
  }
};