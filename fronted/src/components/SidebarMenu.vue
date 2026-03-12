<!-- 側欄選單：依 i18n 顯示中/英 -->
<template>
  <div class="sidebar-menu">
    <div class="sidebar-header">
      <div class="welcome-section">
        <h2>{{ t('common.welcome') }}</h2>
        <div class="ice-badge">
          <span class="ice-text">{{ t('common.ice') }}</span>
        </div>
      </div>
      <div class="header-divider"></div>
    </div>
    
    <div class="menu-content">
      <div class="menu-section">
        <h3 class="section-title">{{ t('menu.sectionCustomerBom') }}</h3>
        <div class="menu-items">
          <div 
            class="menu-item" 
            :class="{ active: activeMenu === '/bom-search' }"
            @click="navigateTo('/bom-search')"
          >
            <el-icon class="folder-icon"><Folder /></el-icon>
            <span>{{ t('menu.bomSearch') }}</span>
          </div>
        </div>
      </div>

      <div class="menu-section">
        <h3 class="section-title">{{ t('menu.sectionPartNumberService') }}</h3>
        <div class="menu-items">
          <div 
            class="menu-item" 
            :class="{ active: activeMenu === '/part-number-mapping' }"
            @click="navigateTo('/part-number-mapping')"
          >
            <el-icon class="folder-icon"><Folder /></el-icon>
            <span>{{ t('menu.partNumberMapping') }}</span>
          </div>
          <div 
            class="menu-item" 
            :class="{ active: activeMenu === '/attribute-group-maintenance' }"
            @click="navigateTo('/attribute-group-maintenance')"
          >
            <el-icon class="folder-icon"><Folder /></el-icon>
            <span>{{ t('menu.attributeGroupMaintenance') }}</span>
          </div>
        </div>
      </div>

      <div class="menu-section">
        <h3 class="section-title">{{ t('menu.sectionSupplierPo') }}</h3>
        <div class="menu-items">
          <div 
            class="menu-item" 
            :class="{ active: activeMenu === '/purchase-orders' }"
            @click="navigateTo('/purchase-orders')"
          >
            <el-icon class="folder-icon"><Folder /></el-icon>
            <span>{{ t('menu.purchaseOrders') }}</span>
          </div>
          <div 
            class="menu-item" 
            :class="{ active: activeMenu === '/carton-information' }"
            @click="navigateTo('/carton-information')"
          >
            <el-icon class="folder-icon"><Folder /></el-icon>
            <span>{{ t('menu.cartonInformation') }}</span>
          </div>
          <div 
            class="menu-item" 
            :class="{ active: activeMenu === '/label-generation' }"
            @click="navigateTo('/label-generation')"
          >
            <el-icon class="folder-icon"><Folder /></el-icon>
            <span>{{ t('menu.labelGeneration') }}</span>
          </div>
        </div>
      </div>

      <div class="menu-section">
        <h3 class="section-title">{{ t('menu.sectionAccount') }}</h3>
        <div class="menu-items">
          <div 
            class="menu-item" 
            :class="{ active: activeMenu === '/user-management' }"
            @click="navigateTo('/user-management')"
          >
            <el-icon class="folder-icon"><Folder /></el-icon>
            <span>{{ t('menu.userManagement') }}</span>
          </div>
          <div 
            class="menu-item" 
            :class="{ active: activeMenu === '/role-management' }"
            @click="navigateTo('/role-management')"
          >
            <el-icon class="folder-icon"><Folder /></el-icon>
            <span>{{ t('menu.roleManagement') }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Folder } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const activeMenu = computed(() => route.path)

const navigateTo = (path) => {
  router.push(path)
}
</script>

<style scoped>
.sidebar-menu {
  background-color: #1e3a5f;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 20px;
  color: #fff;
}

.welcome-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.welcome-section h2 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #fff;
}

.ice-badge {
  display: flex;
  align-items: center;
  gap: 4px;
}

.badge-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background-color: #ffd700;
  color: #000;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.ice-text {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
}

.header-divider {
  height: 1px;
  background-color: rgba(255, 255, 255, 0.1);
  margin-top: 10px;
}

.menu-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.menu-section {
  margin-bottom: 30px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 12px;
  padding-left: 0;
}

.menu-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  color: #fff;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.menu-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.menu-item.active {
  background-color: rgba(64, 158, 255, 0.2);
  color: #409eff;
}

.folder-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.menu-item span {
  font-size: 14px;
}
</style>
