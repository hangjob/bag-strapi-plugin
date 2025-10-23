# 最佳实践

本指南提供使用 bag-strapi-plugin 的最佳实践和推荐做法。

## 安全最佳实践

### 1. 使用强密钥

✅ **推荐做法**：

```bash
# 生成强随机密钥
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

```env
JWT_SECRET=a7f8d9e6c4b3a2f1e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6
CRYPTO_AES_KEY=f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5
```

❌ **不推荐**：

```env
JWT_SECRET=123456
CRYPTO_AES_KEY=password
```

### 2. 不要在代码中硬编码密钥

✅ **推荐做法**：

```javascript
config: {
  jwt: {
    secret: env('JWT_SECRET'),  // 从环境变量读取
  },
}
```

❌ **不推荐**：

```javascript
config: {
  jwt: {
    secret: 'my-secret-key',  // 硬编码
  },
}
```

### 3. 定期轮换密钥

建议轮换周期：

| 密钥类型 | 轮换周期 |
|---------|---------|
| JWT Secret | 每 3-6 个月 |
| AES Key | 每 6-12 个月 |
| API Sign Keys | 根据需要 |
| HMAC Secret | 每年 |

### 4. 生产环境使用 HTTPS

```javascript
// config/server.js
module.exports = ({ env }) => ({
  url: env('PUBLIC_URL', 'https://your-domain.com'),
  proxy: true,
});
```

### 5. 启用所有安全功能

```javascript
// 生产环境配置
config: {
  auth: {
    enableCaptcha: true,  // 启用验证码
  },
  rateLimit: {
    enabled: true,  // 启用限流
    storage: 'redis',
  },
  signVerify: {
    enabled: true,  // 启用签名验证
    mode: 'encrypted',
  },
}
```

## 性能最佳实践

### 1. 使用 Redis 存储限流数据

✅ **推荐**（生产环境）：

```javascript
rateLimit: {
  storage: 'redis',
}
```

❌ **不推荐**（生产环境）：

```javascript
rateLimit: {
  storage: 'memory',  // 内存存储不适合多实例部署
}
```

### 2. 合理配置限流参数

```javascript
// 不同场景使用不同策略

// 登录接口（严格）
{
  points: 5,
  duration: 900,  // 15 分钟
  blockDuration: 1800,  // 30 分钟
}

// 查询接口（宽松）
{
  points: 1000,
  duration: 60,
}

// 验证码接口（中等）
{
  points: 10,
  duration: 60,
}
```

### 3. 使用连接池

```javascript
// config/database.js
module.exports = ({ env }) => ({
  connection: {
    pool: {
      min: 2,
      max: 10,
    },
  },
});
```

### 4. 启用缓存

```javascript
// 在控制器中缓存结果
const cacheKey = `menu:${userId}`;
let menus = await strapi.cache.get(cacheKey);

if (!menus) {
  menus = await strapi.entityService.findMany('plugin::bag-strapi-plugin.menu');
  await strapi.cache.set(cacheKey, menus, { ttl: 3600 });
}
```

## 代码组织最佳实践

### 1. 环境特定配置

```
config/
  ├── plugins.js          # 通用配置
  └── env/
      ├── development/
      │   └── plugins.js  # 开发环境
      ├── staging/
      │   └── plugins.js  # 预发布环境
      └── production/
          └── plugins.js  # 生产环境
```

### 2. 使用配置模板

创建 `.env.example`：

```env
# JWT 认证
JWT_SECRET=
JWT_EXPIRES_IN=7d

# 验证码
ENABLE_CAPTCHA=true

# 限流
RATE_LIMIT_ENABLED=true
```

### 3. 集中错误处理

```javascript
// utils/error-handler.js
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

module.exports = {
  AppError,
  handleError: (error, ctx) => {
    strapi.log.error(error);
    
    ctx.status = error.statusCode || 500;
    ctx.body = {
      success: false,
      message: error.message,
    };
  },
};
```

## 认证最佳实践

### 1. Token 过期时间

```javascript
// 短期 Token + 刷新机制
jwt: {
  expiresIn: '1h',      // 访问 Token：1小时
  refreshExpiresIn: '7d', // 刷新 Token：7天
}
```

### 2. 保护敏感接口

```javascript
// routes/custom.js
export default [
  {
    method: 'GET',
    path: '/sensitive-data',
    handler: 'custom.getSensitiveData',
    config: {
      middlewares: [
        'plugin::bag-strapi-plugin.jwt-auth',  // 需要登录
        'plugin::bag-strapi-plugin.rate-limit', // 限流保护
      ],
    },
  },
];
```

### 3. 密码策略

```javascript
// 验证密码强度
function validatePassword(password) {
  const minLength = 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*]/.test(password);
  
  return (
    password.length >= minLength &&
    hasUpper &&
    hasLower &&
    hasNumber &&
    hasSpecial
  );
}
```

## 验证码最佳实践

### 1. 开发环境禁用

```javascript
// config/env/development/plugins.js
module.exports = () => ({
  'bag-strapi-plugin': {
    config: {
      auth: {
        enableCaptcha: false,  // 开发时禁用
      },
    },
  },
});
```

### 2. 生产环境启用

```javascript
// config/env/production/plugins.js
module.exports = () => ({
  'bag-strapi-plugin': {
    config: {
      auth: {
        enableCaptcha: true,  // 生产环境启用
        captchaType: 'image',
        captchaMaxAttempts: 3,
      },
    },
  },
});
```

### 3. 前端优化

```javascript
// 预加载下一个验证码
const preloadNextCaptcha = async () => {
  try {
    const response = await fetch('/bag-strapi-plugin/captcha/image');
    const result = await response.json();
    // 缓存验证码
    return result.data;
  } catch (error) {
    console.error('预加载验证码失败:', error);
  }
};
```

## 限流最佳实践

### 1. 分级限流策略

```javascript
const rateLimitStrategies = {
  // 登录（严格）
  login: {
    points: 5,
    duration: 900,
    blockDuration: 1800,
  },
  
  // 注册（中等）
  register: {
    points: 3,
    duration: 3600,
    blockDuration: 7200,
  },
  
  // API（宽松）
  api: {
    points: 100,
    duration: 60,
  },
};
```

### 2. 使用白名单

```javascript
rateLimit: {
  whitelist: [
    '127.0.0.1',        // 本地
    '::1',              // IPv6 本地
    '10.0.0.*',         // 内网
    env('ADMIN_IP'),    // 管理员 IP
  ],
}
```

### 3. 监控限流触发

```javascript
// 记录限流事件
if (rateLimitTriggered) {
  strapi.log.warn('Rate limit triggered:', {
    ip: ctx.ip,
    path: ctx.path,
    timestamp: new Date(),
  });
  
  // 可选：发送告警
  await sendAlert({
    type: 'rate_limit',
    ip: ctx.ip,
  });
}
```

## 加密最佳实践

### 1. 选择合适的加密方式

| 场景 | 推荐方式 |
|------|---------|
| 数据加密 | AES-256 |
| 密钥交换 | RSA |
| 密码存储 | bcrypt |
| 数据签名 | HMAC-SHA256 |
| 唯一标识 | UUID v4 |

### 2. 不要加密所有数据

✅ **需要加密**：
- 密码
- 身份证号
- 银行卡号
- 私密信息

❌ **不需要加密**：
- 用户名
- 邮箱（可能需要查询）
- 非敏感的业务数据

### 3. 使用不同的密钥

```javascript
crypto: {
  aesKey: env('DATA_AES_KEY'),        // 数据加密
  signKey: env('SIGN_AES_KEY'),        // 签名加密
  tokenSecret: env('TOKEN_SECRET'),    // Token 生成
}
```

## 数据库最佳实践

### 1. 使用索引

```javascript
// content-types/bag-user.js
attributes: {
  email: {
    type: 'string',
    unique: true,
    index: true,  // 添加索引
  },
  username: {
    type: 'string',
    unique: true,
    index: true,
  },
}
```

### 2. 软删除

```javascript
attributes: {
  deletedAt: {
    type: 'datetime',
    default: null,
  },
}

// 查询时过滤已删除
const users = await strapi.entityService.findMany('plugin::bag-strapi-plugin.user', {
  filters: {
    deletedAt: {
      $null: true,
    },
  },
});
```

### 3. 数据验证

```javascript
attributes: {
  email: {
    type: 'string',
    required: true,
    validate: {
      isEmail: true,
    },
  },
  age: {
    type: 'integer',
    validate: {
      min: 0,
      max: 150,
    },
  },
}
```

## 日志最佳实践

### 1. 结构化日志

```javascript
strapi.log.info('User login', {
  userId: user.id,
  username: user.username,
  ip: ctx.ip,
  timestamp: new Date(),
});
```

### 2. 不记录敏感信息

❌ **不要记录**：
```javascript
strapi.log.info('Login attempt', {
  password: user.password,  // 危险！
  token: user.token,        // 危险！
});
```

✅ **推荐做法**：
```javascript
strapi.log.info('Login attempt', {
  userId: user.id,
  ip: ctx.ip,
});
```

### 3. 使用不同日志级别

```javascript
strapi.log.debug('Debug info');    // 开发调试
strapi.log.info('Normal info');    // 一般信息
strapi.log.warn('Warning');        // 警告
strapi.log.error('Error', error);  // 错误
```

## 测试最佳实践

### 1. 编写单元测试

```javascript
// tests/auth.test.js
const { setupStrapi, cleanupStrapi } = require('./helpers/strapi');

describe('Authentication', () => {
  beforeAll(async () => {
    await setupStrapi();
  });

  afterAll(async () => {
    await cleanupStrapi();
  });

  it('should register a new user', async () => {
    const data = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
    };

    const response = await request(strapi.server)
      .post('/bag-strapi-plugin/auth/register')
      .send(data)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.token).toBeDefined();
  });
});
```

### 2. 集成测试

```javascript
// 测试完整流程
it('should complete registration and login flow', async () => {
  // 1. 获取验证码
  const captchaRes = await getCaptcha();
  
  // 2. 注册
  const registerRes = await register({
    ...userData,
    captchaId: captchaRes.data.captchaId,
    captchaCode: captchaRes.data.code,
  });
  
  // 3. 登录
  const loginRes = await login({
    identifier: userData.username,
    password: userData.password,
  });
  
  // 4. 验证
  expect(loginRes.data.token).toBeDefined();
});
```

## 监控最佳实践

### 1. 性能监控

```javascript
// 记录响应时间
const start = Date.now();
await someOperation();
const duration = Date.now() - start;

if (duration > 1000) {
  strapi.log.warn('Slow operation', {
    operation: 'someOperation',
    duration: `${duration}ms`,
  });
}
```

### 2. 错误监控

```javascript
// 使用 Sentry 或类似服务
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: env('SENTRY_DSN'),
});

// 捕获错误
try {
  await riskyOperation();
} catch (error) {
  Sentry.captureException(error);
  throw error;
}
```

## 部署最佳实践

### 1. 使用 PM2

```bash
npm install -g pm2

# 启动
pm2 start npm --name "strapi" -- start

# 监控
pm2 monit

# 日志
pm2 logs strapi
```

### 2. 环境变量管理

```bash
# 使用 .env 文件
pm2 start npm --name "strapi" -- start --env production

# 或使用 ecosystem 文件
# ecosystem.config.js
module.exports = {
  apps: [{
    name: 'strapi',
    script: 'npm',
    args: 'start',
    env_production: {
      NODE_ENV: 'production',
      JWT_SECRET: process.env.JWT_SECRET,
    },
  }],
};
```

### 3. 数据库备份

```bash
# 定期备份
0 2 * * * /usr/bin/mysqldump -u user -p password database > backup.sql
```

## 相关链接

- [配置指南](/guide/configuration)
- [环境变量](/guide/environment)
- [调试指南](/guide/debugging)

