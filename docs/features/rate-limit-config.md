# 限流配置详解

API 限流系统的详细配置说明。

## 完整配置

```javascript
module.exports = ({ env }) => ({
  'bag-strapi-plugin': {
    config: {
      rateLimit: {
        // 是否启用限流
        enabled: env.bool('RATE_LIMIT_ENABLED', true),
        
        // 时间窗口内允许的请求数
        points: env.int('RATE_LIMIT_POINTS', 100),
        
        // 时间窗口（秒）
        duration: env.int('RATE_LIMIT_DURATION', 60),
        
        // 阻止时长（秒），0 表示不阻止
        blockDuration: env.int('RATE_LIMIT_BLOCK_DURATION', 0),
        
        // 存储方式：'memory' | 'redis'
        storage: env('RATE_LIMIT_STORAGE', 'memory'),
        
        // IP 白名单
        whitelist: env.array('RATE_LIMIT_WHITELIST', ['127.0.0.1', '::1']),
        
        // 自定义错误消息
        message: '请求过于频繁，请稍后再试',
      },
    },
  },
});
```

## 配置项说明

### enabled

- **类型**: `Boolean`
- **默认值**: `false`
- **说明**: 是否启用限流

### points

- **类型**: `Number`
- **默认值**: `100`
- **说明**: 时间窗口内允许的请求数

### duration

- **类型**: `Number`
- **默认值**: `60`
- **说明**: 时间窗口（秒）

### blockDuration

- **类型**: `Number`
- **默认值**: `0`
- **说明**: 触发限流后的阻止时长（秒）

### storage

- **类型**: `String`
- **默认值**: `'memory'`
- **可选值**: `'memory'` | `'redis'`
- **说明**: 限流数据存储方式

### whitelist

- **类型**: `Array<String>`
- **默认值**: `[]`
- **说明**: IP 白名单

## 环境变量

```env
RATE_LIMIT_ENABLED=true
RATE_LIMIT_POINTS=100
RATE_LIMIT_DURATION=60
RATE_LIMIT_BLOCK_DURATION=0
RATE_LIMIT_STORAGE=memory
RATE_LIMIT_WHITELIST=127.0.0.1,::1

# Redis 配置（使用 Redis 时）
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

## 限流策略

### 登录接口（严格）

```javascript
{
  points: 5,
  duration: 900,        // 15分钟
  blockDuration: 1800,  // 30分钟
}
```

### 注册接口

```javascript
{
  points: 3,
  duration: 3600,       // 1小时
  blockDuration: 7200,  // 2小时
}
```

### API 接口（标准）

```javascript
{
  points: 100,
  duration: 60,  // 1分钟
}
```

## 相关链接

- [API 限流](/features/rate-limit)
- [配置指南](/guide/configuration)

