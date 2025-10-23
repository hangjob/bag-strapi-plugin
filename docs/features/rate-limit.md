# API 限流

基于 `rate-limiter-flexible` 的强大限流系统，支持多种限流策略和存储方式。

## 功能特性

- ✅ 支持基于 IP、用户、接口等多种限流策略
- ✅ 支持内存和 Redis 存储
- ✅ 可自定义限流规则
- ✅ 提供预定义的限流策略
- ✅ IP 白名单支持
- ✅ 详细的限流响应头

## 快速开始

### 1. 安装依赖

```bash
npm install rate-limiter-flexible
# 如果使用 Redis（推荐生产环境）
npm install ioredis
```

### 2. 配置限流

```javascript
// config/plugins.js
module.exports = ({ env }) => ({
  'bag-strapi-plugin': {
    config: {
      rateLimit: {
        enabled: env.bool('RATE_LIMIT_ENABLED', true),
        points: 100,      // 每分钟100个请求
        duration: 60,     // 时间窗口：60秒
        storage: 'memory', // 'memory' 或 'redis'
        whitelist: ['127.0.0.1', '::1'],
      },
    },
  },
});
```

### 3. 环境变量

```env
RATE_LIMIT_ENABLED=true
RATE_LIMIT_POINTS=100
RATE_LIMIT_DURATION=60
RATE_LIMIT_STORAGE=memory
```

## 使用方法

### 在路由中应用限流

```javascript
// routes/custom.js
export default [
  {
    method: 'GET',
    path: '/api/data',
    handler: 'custom.getData',
    config: {
      middlewares: ['plugin::bag-strapi-plugin.rate-limit'],
    },
  },
];
```

### 自定义限流配置

```javascript
export default [
  {
    method: 'POST',
    path: '/api/sensitive',
    handler: 'custom.sensitive',
    config: {
      middlewares: [
        {
          name: 'plugin::bag-strapi-plugin.rate-limit',
          config: {
            points: 10,       // 每分钟只允许10个请求
            duration: 60,
            message: '请求过于频繁，请1分钟后再试',
          },
        },
      ],
    },
  },
];
```

## 限流策略

### 登录接口（严格限流）

```javascript
{
  points: 5,                // 每15分钟只允许5次尝试
  duration: 900,            // 15分钟
  blockDuration: 1800,      // 失败后阻止30分钟
  type: 'ip',
  message: '登录尝试次数过多，请30分钟后再试',
}
```

### 注册接口

```javascript
{
  points: 3,                // 每小时只允许3次注册
  duration: 3600,
  blockDuration: 7200,      // 阻止2小时
  type: 'ip',
}
```

### 验证码接口

```javascript
{
  points: 10,               // 每分钟10次
  duration: 60,
  type: 'ip',
}
```

### 查询接口（宽松限流）

```javascript
{
  points: 1000,             // 每分钟1000次
  duration: 60,
  type: 'user',             // 按用户限流
}
```

## Redis 配置

### 1. 配置 Redis 连接

```javascript
// config/plugins.js
module.exports = ({ env }) => ({
  'bag-strapi-plugin': {
    config: {
      rateLimit: {
        enabled: true,
        storage: 'redis',
        points: 100,
        duration: 60,
      },
    },
  },
});
```

### 2. 环境变量

```env
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=your_password
REDIS_DB=0
```

## 响应头

限流中间件会添加以下响应头：

| 响应头 | 说明 |
|--------|------|
| `X-RateLimit-Limit` | 限流上限 |
| `X-RateLimit-Remaining` | 剩余请求数 |
| `X-RateLimit-Reset` | 重置时间（ISO 8601） |
| `Retry-After` | 重试等待时间（秒） |

示例：

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 2024-01-01T12:01:00.000Z
```

触发限流时：

```
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
Retry-After: 45
```

## 前端处理

### JavaScript / Fetch

```javascript
async function makeRequest(url) {
  try {
    const response = await fetch(url);
    
    const limit = response.headers.get('X-RateLimit-Limit');
    const remaining = response.headers.get('X-RateLimit-Remaining');
    
    console.log(`剩余请求数：${remaining}/${limit}`);
    
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      alert(`请求过于频繁，请等待 ${retryAfter} 秒后重试`);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('请求失败：', error);
  }
}
```

### Axios

```javascript
import axios from 'axios';

axios.interceptors.response.use(
  response => {
    const remaining = response.headers['x-ratelimit-remaining'];
    if (remaining !== undefined) {
      console.log(`剩余请求数：${remaining}`);
    }
    return response;
  },
  error => {
    if (error.response && error.response.status === 429) {
      const retryAfter = error.response.headers['retry-after'];
      alert(`请求过于频繁，请等待 ${retryAfter} 秒后重试`);
    }
    return Promise.reject(error);
  }
);
```

## 白名单配置

```javascript
rateLimit: {
  whitelist: [
    '127.0.0.1',      // 本地
    '::1',            // IPv6 本地
    '192.168.1.100',  // 特定 IP
    '10.0.0.*',       // 通配符
  ],
}
```

## 管理 API

### 获取限流配置

```bash
GET /bag-strapi-plugin/rate-limit/config
```

### 检查 IP 限流状态

```bash
GET /bag-strapi-plugin/rate-limit/check-ip?ip=192.168.1.1
```

### 重置限流

```bash
POST /bag-strapi-plugin/rate-limit/reset
Content-Type: application/json

{
  "key": "ip:192.168.1.1"
}
```

### 清除所有限流记录

```bash
POST /bag-strapi-plugin/rate-limit/clear-all
```

## 配置详解

更多配置选项请参考 [限流配置详解](/features/rate-limit-config)。

## 相关链接

- [JWT 认证系统](/features/auth)
- [验证码系统](/features/captcha)
- [限流配置详解](/features/rate-limit-config)
- [限流 API 参考](/api/rate-limit)

