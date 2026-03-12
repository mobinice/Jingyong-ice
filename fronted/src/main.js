/**
 * 應用程式入口：掛載 Vue、Pinia、Router、i18n、Element Plus。
 * Element Plus 語系改由 MainLayout 內 el-config-provider 依 i18n 當前語系動態切換。
 */
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import i18n from './i18n'

const app = createApp(App)
const pinia = createPinia()

// 註冊所有 Element Plus 圖標
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(pinia)
app.use(router)
app.use(i18n)
// 不在此處傳入 locale，改由 MainLayout 的 el-config-provider 依 i18n.locale 動態切換
app.use(ElementPlus)

app.mount('#app')

