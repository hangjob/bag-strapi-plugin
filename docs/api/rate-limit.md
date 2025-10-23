# 限流 API

API 限流管理相关的接口。

## GET /rate-limit/config

获取限流配置

**响应**
```json
{
  "success": true,
  "data": {
    "enabled": true,
    "points": 100,
    "duration": 60,
    "storage": "memory"
  }
}
```

## GET /rate-limit/check-ip

检查 IP 限流状态

**查询参数**
- `ip`: IP 地址

**响应**
```json
{
  "success": true,
  "data": {
    "ip": "192.168.1.1",
    "count": 15,
    "ttl": 45,
    "blocked": false
  }
}
```

详细说明请参考 [API 限流](/features/rate-limit)。

