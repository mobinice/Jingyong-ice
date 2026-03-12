# ========== Frontend 構建階段 ==========
FROM node:20-alpine AS builder

WORKDIR /app

# 複製 fronted 目錄的 package 文件
COPY fronted/package*.json ./

# 安裝所有依賴（包含 devDependencies，因為構建需要）
RUN npm ci

# 複製 fronted 源代碼
COPY fronted/ .

# 構建生產版本
RUN npm run build

# ========== 生產階段 ==========
FROM nginx:alpine

# 複製自定義 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 從構建階段複製構建好的文件到 nginx 目錄
COPY --from=builder /app/dist /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 啟動 nginx
CMD ["nginx", "-g", "daemon off;"]
