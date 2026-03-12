import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // 從 localStorage 讀取登入狀態（測試用，預設為已登入）
  const isAuthenticated = ref(localStorage.getItem('isAuthenticated') === 'true' || true)
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null') || { username: 'Test User' })

  // 初始化時自動登入（測試用）
  if (!localStorage.getItem('isAuthenticated')) {
    isAuthenticated.value = true
    user.value = { username: 'Test User' }
    localStorage.setItem('isAuthenticated', 'true')
    localStorage.setItem('user', JSON.stringify(user.value))
  }

  function login(username, password) {
    // Mock 登入邏輯
    if (username && password) {
      isAuthenticated.value = true
      user.value = { username }
      // 持久化到 localStorage
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('user', JSON.stringify(user.value))
      return true
    }
    return false
  }

  function logout() {
    isAuthenticated.value = false
    user.value = null
    // 清除 localStorage
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('user')
  }

  return {
    isAuthenticated,
    user,
    login,
    logout
  }
})

