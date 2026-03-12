# MES 後台管理系統

Vue3 + Vite + Element Plus 後台管理系統

## 功能頁面

1. **登入頁面** - 使用者登入系統
2. **BOM 查詢** - BOM 物料清單查詢
3. **供應商採單查詢平台** - 供應商採購單查詢與管理
4. **新料號取號** - 產生新的料號

## 技術棧

- Vue 3
- Vite
- Vue Router
- Pinia
- Element Plus
- Element Plus Icons

## 安裝與運行

```bash
# 安裝依賴
npm install

# 開發模式
npm run dev

# 建置生產版本
npm run build

# 預覽生產版本
npm run preview
```

## 專案結構

```
src/
├── layouts/          # 佈局組件
├── views/            # 頁面組件
├── router/           # 路由配置
├── stores/           # Pinia 狀態管理
├── mock/             # Mock 資料
└── main.js           # 入口文件
```

## Mock 資料

Mock 資料存放在 `src/mock/` 目錄下，包含：
- `bom.js` - BOM 查詢資料
- `vendorQuery.js` - 供應商查詢資料
- `partNumber.js` - 料號產生邏輯

