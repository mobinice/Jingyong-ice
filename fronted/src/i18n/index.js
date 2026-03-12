/**
 * 前端 i18n 入口：建立 vue-i18n 實例，支援繁體中文與英文全站雙語。
 * 供 main.js 掛載，並由各元件透過 useI18n() 或 $t 使用。
 */
import { createI18n } from 'vue-i18n'
import zhTW from './locales/zh-TW.js'
import en from './locales/en.js'

const i18n = createI18n({
  legacy: false, // 使用 Composition API 模式
  locale: 'zh-TW',
  fallbackLocale: 'en',
  messages: {
    'zh-TW': zhTW,
    en
  }
})

export default i18n
