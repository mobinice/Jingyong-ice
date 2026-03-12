#!/bin/bash

echo "========== MES Backend with VPN =========="

# VPN 連線函數
connect_vpn() {
    echo "[VPN] 正在連接..."

    # 如果已有 openfortivpn 進程，先終止
    pkill -9 openfortivpn 2>/dev/null || true
    sleep 1

    # 啟動 openfortivpn（背景執行）
    openfortivpn -c /app/vpn/vpn.conf &
    VPN_PID=$!

    # 等待 VPN 連線建立
    MAX_WAIT=30
    COUNTER=0
    while [ $COUNTER -lt $MAX_WAIT ]; do
        if ip link show ppp0 > /dev/null 2>&1; then
            echo "[VPN] ✓ 介面 ppp0 已建立"
            break
        fi
        sleep 1
        COUNTER=$((COUNTER + 1))
    done

    if [ $COUNTER -eq $MAX_WAIT ]; then
        echo "[VPN] ✗ 連線超時"
        return 1
    fi

    # 啟動 ppp0 介面
    ip link set ppp0 up 2>/dev/null || true
    sleep 3

    # 等待取得 IP
    MAX_WAIT=15
    COUNTER=0
    while [ $COUNTER -lt $MAX_WAIT ]; do
        PPP_IP=$(ip addr show ppp0 2>/dev/null | grep 'inet ' | awk '{print $2}' | cut -d'/' -f1)
        if [ -n "$PPP_IP" ]; then
            echo "[VPN] ✓ IP: $PPP_IP"
            break
        fi
        sleep 1
        COUNTER=$((COUNTER + 1))
    done

    # 設定路由
    if ! ip route | grep -q "172.16.0.0/16"; then
        ip route add 172.16.0.0/16 dev ppp0 2>/dev/null || true
    fi

    # 測試 DB 連線
    if nc -z 172.16.1.20 1433 -w 5 2>/dev/null; then
        echo "[VPN] ✓ DB 連線正常 (172.16.1.20:1433)"
        return 0
    else
        echo "[VPN] ⚠ 無法連接 DB，但繼續啟動..."
        return 0
    fi
}

# VPN 監控函數（背景執行）
monitor_vpn() {
    while true; do
        sleep 30

        # 檢查 ppp0 介面
        if ! ip link show ppp0 > /dev/null 2>&1; then
            echo "[VPN Monitor] ⚠ ppp0 介面消失，重新連線..."
            connect_vpn
            continue
        fi

        # 檢查 DB 連線
        if ! nc -z 172.16.1.20 1433 -w 5 2>/dev/null; then
            echo "[VPN Monitor] ⚠ DB 連線失敗，重新連線..."
            connect_vpn
        fi
    done
}

# 主程序
echo "[1/3] 初始化 VPN 連線..."
connect_vpn
if [ $? -ne 0 ]; then
    echo "[ERROR] VPN 連線失敗，退出"
    exit 1
fi

echo "[2/3] 啟動 VPN 監控（背景）..."
monitor_vpn &
MONITOR_PID=$!

echo "[3/3] 啟動 Node.js 應用程式..."
echo "=========================================="

# 捕捉終止信號
cleanup() {
    echo "[Shutdown] 正在關閉..."
    kill $MONITOR_PID 2>/dev/null
    pkill -9 openfortivpn 2>/dev/null
    exit 0
}
trap cleanup SIGTERM SIGINT

# 啟動 Node.js（前景執行）
exec node src/server.js
