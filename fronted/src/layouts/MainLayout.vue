<!--
  MainLayout：主版面（側欄、頂部、內容區）。
  提供全站語言切換與 Element Plus 語系連動（el-config-provider）。
-->
<template>
  <el-config-provider :locale="elementLocale">
    <div class="main-layout">
      <!-- 響應式提示畫面：小螢幕時顯示 -->
      <div v-if="showResponsiveWarning" class="responsive-warning">
        <div class="warning-content">
          <el-icon class="warning-icon"><Monitor /></el-icon>
          <h2>{{ t('common.responsiveTitle') }}</h2>
          <p>{{ t('common.responsiveDesc') }}</p>
        </div>
      </div>

      <el-container v-show="!showResponsiveWarning">
        <el-aside width="250px" class="sidebar">
          <SidebarMenu />
        </el-aside>

        <el-container>
          <el-header class="header">
            <div class="header-left">
              <h3>AnJ SERVICE SYSTEM</h3>
            </div>
            <div class="header-right">
              <!-- 全站語言切換：繁體中文 / English -->
              <div class="lang-switcher">
                <span
                  :class="['lang-option', { active: locale === 'zh-TW' }]"
                  @click="setLocale('zh-TW')"
                >中</span>
                <span class="lang-divider">|</span>
                <span
                  :class="['lang-option', { active: locale === 'en' }]"
                  @click="setLocale('en')"
                >EN</span>
              </div>
              <el-dropdown>
                <span class="user-info">
                  <el-icon><User /></el-icon>
                  {{ t('common.user') }}
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="handleLogout">{{ t('common.logout') }}</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </el-header>

          <el-main class="main-content">
            <router-view />
          </el-main>
        </el-container>
      </el-container>
    </div>
  </el-config-provider>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { User, Monitor } from '@element-plus/icons-vue'
import zhTw from 'element-plus/dist/locale/zh-tw.mjs'
import en from 'element-plus/dist/locale/en.mjs'
import SidebarMenu from '@/components/SidebarMenu.vue'

const router = useRouter()
const authStore = useAuthStore()
const { locale, t } = useI18n()

// 依 i18n 語系回傳對應的 Element Plus locale，供 el-config-provider 使用
const elementLocale = computed(() => (locale.value === 'zh-TW' ? zhTw : en))

const screenWidth = ref(window.innerWidth)
const showResponsiveWarning = computed(() => screenWidth.value < 960)

/** 切換全站語系 */
function setLocale(lang) {
  locale.value = lang
}

const handleResize = () => {
  screenWidth.value = window.innerWidth
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  handleResize()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.main-layout {
  height: 100vh;
  overflow: hidden;
}

.main-layout :deep(.el-container) {
  height: 100vh;
}

.sidebar {
  background-color: #1e3a5f;
  height: 100vh;
}

.header {
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  flex-shrink: 0;
}

.header-left h3 {
  margin: 0;
  color: #303133;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

/* 語言切換：中 | EN */
.lang-switcher {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #606266;
}
.lang-option {
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
}
.lang-option:hover,
.lang-option.active {
  color: #409eff;
}
.lang-option.active {
  font-weight: 600;
}
.lang-divider {
  color: #c0c4cc;
  user-select: none;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #606266;
}

.main-content {
  background-color: #f5f7fa;
  padding: 20px;
  overflow-y: auto;
  height: 0;
  flex: 1;
}

.responsive-warning {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.warning-content {
  text-align: center;
  color: #303133;
  padding: 40px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  max-width: 500px;
}

.warning-icon {
  font-size: 80px;
  margin-bottom: 20px;
  color: #909399;
}

.warning-content h2 {
  font-size: 32px;
  margin: 0 0 20px 0;
  font-weight: 600;
  color: #303133;
}

.warning-content p {
  font-size: 18px;
  margin: 10px 0;
  line-height: 1.6;
  color: #606266;
}
</style>

