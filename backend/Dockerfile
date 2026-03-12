# ========== Backend API Server with VPN ==========
FROM node:20-slim

# 安裝 openfortivpn 和相關工具
RUN apt-get update && apt-get install -y \
    openfortivpn \
    iproute2 \
    netcat-openbsd \
    iputils-ping \
    ppp \
    wget \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 複製 package 文件
COPY package*.json ./

# 安裝生產依賴
RUN npm ci --only=production

# 複製源代碼
COPY src ./src

# 複製 VPN 設定與啟動腳本
COPY vpn ./vpn
RUN chmod +x /app/vpn/entrypoint.sh /app/vpn/healthcheck.sh

# 暴露端口
EXPOSE 3000

# 健康檢查：檢查 VPN、DB、API 連線
HEALTHCHECK --interval=30s --timeout=15s --start-period=60s --retries=3 \
    CMD /app/vpn/healthcheck.sh

# 需要 NET_ADMIN 權限來建立 VPN 通道
# 在 docker-compose.yml 或 docker run 時加上 --cap-add=NET_ADMIN

# 使用自訂 entrypoint
ENTRYPOINT ["/app/vpn/entrypoint.sh"]
