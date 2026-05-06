<template>
  <div class="login-wrapper">
    <!-- Background Image with Dark/Green Overlay -->
    <div class="bg-image"></div>
    <div class="bg-overlay"></div>

    <div class="login-content">
      <!-- Left side text (Branding) -->
      <div class="branding">
        <h1>Smart Meal<br>Planner</h1>
        <p>Hệ thống quản lý thông minh giúp lên thực đơn, theo dõi dinh dưỡng và tối ưu hoá kho nguyên liệu chuẩn xác.</p>
      </div>

      <!-- Glassmorphism Card -->
      <div class="login-card">
        <div class="login-header">
          <div class="logo-box">
            <i class="fa-solid fa-leaf"></i>
          </div>
          <h2>Đăng nhập Admin</h2>
          <p>Chào mừng trở lại! Vui lòng đăng nhập.</p>
        </div>
        
        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label>Email</label>
            <div class="input-glass">
              <i class="fa-regular fa-envelope"></i>
              <input type="email" v-model="email" placeholder="admin@smartmeal.com" required>
            </div>
          </div>
          
          <div class="form-group">
            <label>Mật khẩu</label>
            <div class="input-glass">
              <i class="fa-solid fa-lock"></i>
              <input :type="showPassword ? 'text' : 'password'" v-model="password" placeholder="••••••••" required>
              <button type="button" class="btn-eye" @click="showPassword = !showPassword">
                <i :class="showPassword ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'"></i>
              </button>
            </div>
          </div>
          
          <div class="form-actions">
            <label class="custom-checkbox">
              <input type="checkbox" v-model="rememberMe">
              <span class="checkmark"></span>
              <span class="text">Ghi nhớ tôi</span>
            </label>
            <a href="#" class="forgot-link">Quên mật khẩu?</a>
          </div>
          
          <button type="submit" class="btn-primary" :disabled="isLoading">
            <span v-if="!isLoading">Đăng nhập</span>
            <i v-else class="fa-solid fa-circle-notch fa-spin"></i>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const email = ref('');
const password = ref('');
const showPassword = ref(false);
const rememberMe = ref(false);
const isLoading = ref(false);

const handleLogin = async () => {
  if (!email.value || !password.value) return;
  isLoading.value = true;
  
  try {
    const response = await fetch('http://localhost:5000/api/auth/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email.value,
        password: password.value
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Lưu token vào localStorage để giữ phiên đăng nhập
      localStorage.setItem('admin_token', data.data.token);
      localStorage.setItem('admin_user', JSON.stringify(data.data.user));
      
      // Chuyển thẳng vào Dashboard
      router.push('/');
    } else {
      // Hiển thị lỗi từ backend (ví dụ: Sai pass, không phải admin)
      alert(data.message || 'Đăng nhập thất bại!');
    }
  } catch (error) {
    console.error(error);
    alert('Lỗi kết nối đến máy chủ Backend (Port 5000). Đảm bảo Backend đang chạy!');
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.login-wrapper {
  position: relative;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Inter', sans-serif;
  overflow: hidden;
  margin: 0;
  padding: 0;
}

/* Background Setup */
.bg-image {
  position: absolute;
  inset: 0;
  background-image: url('/assets/image.png');
  background-size: cover;
  background-position: center;
  transform: scale(1.05); /* Slight zoom out animation feel */
}

.bg-overlay {
  position: absolute;
  inset: 0;
  /* Premium dark green gradient */
  background: linear-gradient(135deg, rgba(16, 40, 24, 0.95) 0%, rgba(20, 50, 30, 0.7) 50%, rgba(0, 0, 0, 0.5) 100%);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

.login-content {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 1100px;
  padding: 0 40px;
  gap: 60px;
}

/* Left Branding */
.branding {
  flex: 1;
  color: white;
}
.branding h1 {
  font-size: 56px;
  font-weight: 900;
  line-height: 1.1;
  margin: 0 0 24px 0;
  text-shadow: 0 4px 20px rgba(0,0,0,0.3);
  letter-spacing: -1px;
}
.branding p {
  font-size: 18px;
  line-height: 1.6;
  opacity: 0.9;
  max-width: 450px;
  text-shadow: 0 2px 10px rgba(0,0,0,0.2);
}

/* Right Glass Card */
.login-card {
  width: 100%;
  max-width: 420px;
  background: rgba(255, 255, 255, 0.95); /* Milky glass */
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 32px;
  padding: 48px 40px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255,255,255,0.2) inset;
}

.login-header {
  text-align: center;
  margin-bottom: 36px;
}
.logo-box {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #4CAF50, #2E7D32);
  color: white;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin: 0 auto 20px auto;
  box-shadow: 0 10px 20px rgba(76, 175, 80, 0.3);
}
.login-header h2 {
  font-size: 26px;
  font-weight: 800;
  color: #1e293b;
  margin: 0 0 8px 0;
}
.login-header p {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

/* Form Styles */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group label {
  display: block;
  font-size: 12px;
  font-weight: 800;
  color: #475569;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.input-glass {
  position: relative;
  display: flex;
  align-items: center;
}
.input-glass i:first-child {
  position: absolute;
  left: 18px;
  color: #94a3b8;
  font-size: 16px;
}
.input-glass input {
  width: 100%;
  height: 54px;
  padding: 0 16px 0 48px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  font-size: 15px;
  color: #0f172a;
  font-weight: 600;
  transition: all 0.3s ease;
}
.input-glass input:focus {
  outline: none;
  background: white;
  border-color: #4CAF50;
  box-shadow: 0 0 0 4px rgba(76, 175, 80, 0.15);
}
.input-glass input::placeholder {
  color: #cbd5e1;
  font-weight: 500;
}

.btn-eye {
  position: absolute;
  right: 14px;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 8px;
  transition: 0.2s;
}
.btn-eye:hover { color: #475569; }

/* Custom Checkbox */
.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.custom-checkbox {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
}
.custom-checkbox input {
  display: none;
}
.checkmark {
  width: 22px;
  height: 22px;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.2s;
}
.custom-checkbox input:checked ~ .checkmark {
  background: #4CAF50;
  border-color: #4CAF50;
}
.custom-checkbox input:checked ~ .checkmark::after {
  content: '\f00c';
  font-family: 'Font Awesome 6 Free';
  font-weight: 900;
  color: white;
  font-size: 12px;
}
.custom-checkbox .text {
  font-size: 14px;
  font-weight: 600;
  color: #475569;
}

.forgot-link {
  font-size: 14px;
  font-weight: 700;
  color: #4CAF50;
  text-decoration: none;
  transition: 0.2s;
}
.forgot-link:hover {
  color: #2E7D32;
  text-decoration: underline;
}

.btn-primary {
  height: 56px;
  background: linear-gradient(135deg, #4CAF50, #388E3C);
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(76, 175, 80, 0.3);
  transition: all 0.3s ease;
  margin-top: 8px;
}
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(76, 175, 80, 0.4);
}
.btn-primary:active {
  transform: translateY(0);
}

/* Responsive */
@media (max-width: 900px) {
  .login-content {
    justify-content: center;
  }
  .branding {
    display: none;
  }
}
</style>
