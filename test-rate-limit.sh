#!/bin/bash

# 限流测试脚本
# 用法: ./test-rate-limit.sh

BASE_URL="http://localhost:1337/bag-strapi-plugin"

echo "======================================"
echo "🧪 限流功能测试"
echo "======================================"
echo ""

echo "📍 测试接口：验证码接口（2次/分钟）"
echo "URL: $BASE_URL/captcha/image"
echo ""

for i in {1..5}; do
  echo "第 $i 次请求:"
  
  RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/captcha/image")
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | head -n-1)
  
  echo "  HTTP 状态码: $HTTP_CODE"
  
  if [ "$HTTP_CODE" = "200" ]; then
    echo "  ✅ 请求成功"
  elif [ "$HTTP_CODE" = "429" ]; then
    echo "  🚫 请求被限流"
    MESSAGE=$(echo "$BODY" | grep -o '"message":"[^"]*"' | cut -d'"' -f4)
    RETRY=$(echo "$BODY" | grep -o '"retryAfter":[0-9]*' | cut -d':' -f2)
    echo "  消息: $MESSAGE"
    echo "  重试等待: $RETRY 秒"
  else
    echo "  ❌ 未知状态"
  fi
  
  echo "  --------------------------------"
  sleep 0.3
done

echo ""
echo "======================================"
echo "📊 测试结果说明："
echo "======================================"
echo "前2次请求应该成功（200）"
echo "第3-5次请求应该被限流（429）"
echo ""
echo "如果看到限流，说明功能正常！"
echo "======================================"

