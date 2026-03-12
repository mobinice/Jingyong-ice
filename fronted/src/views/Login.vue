<template>
  <div class="login-container">
    <div class="login-card">
      <!-- 左側背景區 -->
      <div class="login-left">
        <div class="logo-container">
          <div class="background-image">
            <img src="/ride400x300.jpg" alt="A&J Service System">
          </div>
          <img class="company-logo" src="/logo.png" alt="Company Logo">
          <p class="company-text">A&J Service System</p>
        </div>
      </div>

      <!-- 右側登入表單 -->
      <form class="login-box" @submit.prevent="handleLogin">
        <h2>A&J Service System</h2>
        <div class="login-item">
          <label for="inputUsername" class="sr-only">UserName</label>
          <div>
            <el-icon class="icon"><User /></el-icon>
            <input
              type="text"
              id="inputUsername"
              v-model="loginForm.username"
              class="form-control"
              placeholder="UserName"
              required
              autofocus
            >
          </div>
        </div>
        <div class="login-item">
          <label for="inputPassword" class="sr-only">Password</label>
          <div>
            <el-icon class="icon"><Lock /></el-icon>
            <input
              type="password"
              id="inputPassword"
              v-model="loginForm.password"
              class="form-control"
              placeholder="Password"
              required
            >
          </div>
        </div>
        <button
          class="btn btn-lg btn-primary btn-block login-button"
          type="submit"
          :disabled="loading"
        >
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)

const loginForm = reactive({
  username: 'admin',
  password: '1234'
})


const handleLogin = async () => {
  const username = loginForm.username.trim()
  const password = loginForm.password.trim()

  if (username === '') {
    window.alert('Please Input UserName!!')
    return false
  }

  if (password === '') {
    window.alert('Please Input Password!!')
    return false
  }

  loading.value = true
  // 模擬登入請求
  setTimeout(() => {
    const success = authStore.login(username, password)
    if (success) {
      ElMessage.success('Login successful')
      router.push('/')
    } else {
      ElMessage.error('Login failed, please check username and password')
    }
    loading.value = false
  }, 500)
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.login-card {
  display: flex;
  align-items: center;
  gap: 20px;
}

.login-left {
  width: 400px;
  height: 300px;
  position: relative;
}

.logo-container {
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
}

.background-image {
  position: relative;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.background-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Add an overlay to the background image */
.background-image::before {
  content: "";
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 255, 0.2);
  z-index: 2;
}

.company-logo {
  position: absolute;
  top: calc(30% + 10px);
  left: 50%;
  transform: translateX(-50%);
  max-width: 100px;
  max-height: 60px;
  z-index: 3;
}

.company-text {
  position: absolute;
  top: calc(50% + 10px);
  left: 50%;
  transform: translateX(-50%);
  font-size: 20px;
  z-index: 3;
  color: white;
  margin: 0;
  white-space: nowrap;
}

.login-box {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 300px;
  height: 300px;
  padding: 20px;
  border: 1px solid #ddd;
  background-color: #fff;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
}

.login-box h2 {
  font-size: 26px;
  text-align: center;
  margin-bottom: 25px;
  margin-top: 0;
}

.login-item {
  margin-bottom: 20px;
  width: 100%;
}

.login-item > div {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  color: #606266;
}

.form-control {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-control:focus {
  outline: none;
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.login-button {
  width: calc(100% - 2px);
  margin-top: 30px;
  padding: 12px;
  font-size: 16px;
  border: none;
  border-radius: 4px;
  background-color: #409eff;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s;
}

.login-button:hover:not(:disabled) {
  background-color: #66b1ff;
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

@media (max-width: 768px) {
  .login-card {
    flex-direction: column;
    gap: 20px;
  }
  
  .login-left {
    width: 100%;
    max-width: 400px;
    height: auto;
    aspect-ratio: 400 / 300;
  }
  
  .login-box {
    width: 100%;
    max-width: 300px;
    height: auto;
    min-height: 300px;
  }
}
</style>

