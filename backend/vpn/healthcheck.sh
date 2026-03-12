#!/bin/bash
# 健康檢查腳本：檢查 VPN、DB、API 連線狀態

# 1. 檢查 VPN 介面是否存在且啟動
if ! ip link show ppp0 > /dev/null 2>&1; then
    echo "FAIL: VPN interface ppp0 not found"
    exit 1
fi

PPP_STATE=$(ip link show ppp0 | grep -o 'state [A-Z]*' | awk '{print $2}')
if [ "$PPP_STATE" = "DOWN" ]; then
    echo "FAIL: VPN interface ppp0 is DOWN"
    exit 1
fi

# 2. 檢查能否連到 DB 伺服器
if ! nc -z 172.16.1.20 1433 -w 5 > /dev/null 2>&1; then
    echo "FAIL: Cannot reach DB server 172.16.1.20:1433"
    exit 1
fi

# 3. 檢查 Node.js API 是否回應
if ! wget --no-verbose --tries=1 --spider http://localhost:3000/ > /dev/null 2>&1; then
    echo "FAIL: Node.js API not responding"
    exit 1
fi

echo "OK: VPN, DB, API all healthy"
exit 0
