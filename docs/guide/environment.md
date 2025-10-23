# 环境变量配置

本指南详细介绍 bag-strapi-plugin 所需的环境变量配置。

## 环境变量文件

在 Strapi 项目根目录创建 `.env` 文件：

```env
# ==================== JWT 认证 ====================
JWT_SECRET=your-very-secure-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# ==================== 验证码 ====================
ENABLE_CAPTCHA=true
CAPTCHA_TYPE=image
CAPTCHA_LENGTH=4
CAPTCHA_EXPIRE_TIME=300000
CAPTCHA_MAX_ATTEMPTS=3

# ==================== API 限流 ====================
RATE_LIMIT_ENABLED=true
RATE_LIMIT_POINTS=100
RATE_LIMIT_DURATION=60
RATE_LIMIT_BLOCK_DURATION=0
RATE_LIMIT_STORAGE=memory
RATE_LIMIT_WHITELIST=127.0.0.1,::1

# ==================== 签名验证 ====================
SIGN_VERIFY_ENABLED=false
SIGN_VERIFY_MODE=simple
API_SIGN_KEYS=your-sign-key-here

# 加密签名
ENCRYPTED_SIGN_ENABLED=false
ENCRYPTED_SIGN_AES_KEY=your-encrypted-sign-aes-key-32ch

# 一次性签名
ONCE_SIGN_ENABLED=false
ONCE_SIGN_EXPIRE_TIME=300000

# ==================== 加密工具 ====================
CRYPTO_AES_KEY=my-super-strong-aes-key-32-chars!!
CRYPTO_HMAC_SECRET=my-hmac-secret-key
CRYPTO_TOKEN_SECRET=my-token-secret-key
CRYPTO_RSA_KEY_LENGTH=2048

# ==================== Redis（可选） ====================
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

## 环境变量详解

### JWT 认证

#### JWT_SECRET

- **必需**: ✅
- **说明**: JWT 签名密钥
- **建议**: 至少 32 字符的随机字符串

生成方法：

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### JWT_EXPIRES_IN

- **必需**: ❌
- **默认值**: `7d`
- **说明**: Token 过期时间
- **格式**: 
  - `60` - 60 秒
  - `2 days` - 2 天
  - `10h` - 10 小时
  - `7d` - 7 天

### 验证码

#### ENABLE_CAPTCHA

- **必需**: ❌
- **默认值**: `true`
- **类型**: `boolean`
- **说明**: 是否启用验证码

#### CAPTCHA_TYPE

- **必需**: ❌
- **默认值**: `image`
- **可选值**: `image` | `math`
- **说明**: 验证码类型

#### CAPTCHA_LENGTH

- **必需**: ❌
- **默认值**: `4`
- **类型**: `number`
- **说明**: 验证码长度

#### CAPTCHA_EXPIRE_TIME

- **必需**: ❌
- **默认值**: `300000`（5 分钟）
- **类型**: `number`
- **说明**: 验证码过期时间（毫秒）

#### CAPTCHA_MAX_ATTEMPTS

- **必需**: ❌
- **默认值**: `3`
- **类型**: `number`
- **说明**: 验证码最大尝试次数

### API 限流

#### RATE_LIMIT_ENABLED

- **必需**: ❌
- **默认值**: `false`
- **类型**: `boolean`
- **说明**: 是否启用 API 限流

#### RATE_LIMIT_POINTS

- **必需**: ❌
- **默认值**: `100`
- **类型**: `number`
- **说明**: 时间窗口内允许的请求数

#### RATE_LIMIT_DURATION

- **必需**: ❌
- **默认值**: `60`
- **类型**: `number`
- **说明**: 时间窗口（秒）

#### RATE_LIMIT_BLOCK_DURATION

- **必需**: ❌
- **默认值**: `0`
- **类型**: `number`
- **说明**: 触发限流后的阻止时长（秒）

#### RATE_LIMIT_STORAGE

- **必需**: ❌
- **默认值**: `memory`
- **可选值**: `memory` | `redis`
- **说明**: 限流数据存储方式

#### RATE_LIMIT_WHITELIST

- **必需**: ❌
- **默认值**: `127.0.0.1,::1`
- **类型**: 逗号分隔的字符串
- **说明**: IP 白名单

### 签名验证

#### SIGN_VERIFY_ENABLED

- **必需**: ❌
- **默认值**: `false`
- **类型**: `boolean`
- **说明**: 是否启用签名验证

#### SIGN_VERIFY_MODE

- **必需**: ❌
- **默认值**: `simple`
- **可选值**: `simple` | `encrypted` | `both`
- **说明**: 签名验证模式

#### API_SIGN_KEYS

- **必需**: ❌（启用签名验证时必需）
- **类型**: 逗号分隔的字符串
- **说明**: 有效的签名密钥列表

示例：

```env
API_SIGN_KEYS=frontend-key,mobile-key,admin-key
```

### 加密工具

#### CRYPTO_AES_KEY

- **必需**: ❌（使用 AES 加密时必需）
- **最小长度**: 32 字符
- **说明**: AES-256 加密密钥

生成方法：

```bash
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

#### CRYPTO_HMAC_SECRET

- **必需**: ❌（使用 HMAC 时必需）
- **说明**: HMAC 签名密钥

#### CRYPTO_TOKEN_SECRET

- **必需**: ❌
- **说明**: Token 生成密钥

### Redis

#### REDIS_HOST

- **必需**: ❌（使用 Redis 时必需）
- **默认值**: `127.0.0.1`
- **说明**: Redis 服务器地址

#### REDIS_PORT

- **必需**: ❌
- **默认值**: `6379`
- **说明**: Redis 端口

#### REDIS_PASSWORD

- **必需**: ❌
- **说明**: Redis 密码

#### REDIS_DB

- **必需**: ❌
- **默认值**: `0`
- **说明**: Redis 数据库索引

## 不同环境配置

### 开发环境 (.env.development)

```env
NODE_ENV=development

# JWT
JWT_SECRET=dev-secret-key-not-for-production
JWT_EXPIRES_IN=30d

# 验证码（开发环境禁用）
ENABLE_CAPTCHA=false

# 限流（开发环境禁用）
RATE_LIMIT_ENABLED=false

# 签名验证（开发环境禁用）
SIGN_VERIFY_ENABLED=false

# 加密工具
CRYPTO_AES_KEY=dev-aes-key-at-least-32-chars!!!
CRYPTO_HMAC_SECRET=dev-hmac-secret
```

### 生产环境 (.env.production)

```env
NODE_ENV=production

# JWT（使用强密钥）
JWT_SECRET=<使用 crypto.randomBytes(32).toString('hex') 生成>
JWT_EXPIRES_IN=7d

# 验证码（启用）
ENABLE_CAPTCHA=true
CAPTCHA_TYPE=image
CAPTCHA_LENGTH=4
CAPTCHA_EXPIRE_TIME=300000

# 限流（启用，使用 Redis）
RATE_LIMIT_ENABLED=true
RATE_LIMIT_STORAGE=redis
RATE_LIMIT_POINTS=50
RATE_LIMIT_DURATION=60
RATE_LIMIT_BLOCK_DURATION=300

# Redis
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=<你的 Redis 密码>

# 签名验证（启用）
SIGN_VERIFY_ENABLED=true
SIGN_VERIFY_MODE=encrypted
ENCRYPTED_SIGN_ENABLED=true
ENCRYPTED_SIGN_AES_KEY=<使用强密钥>
ONCE_SIGN_ENABLED=true

# 加密工具（使用强密钥）
CRYPTO_AES_KEY=<使用强密钥>
CRYPTO_HMAC_SECRET=<使用强密钥>
CRYPTO_TOKEN_SECRET=<使用强密钥>
```

## 安全最佳实践

### 1. 不要在代码中硬编码密钥

❌ **错误做法**：

```javascript
config: {
  jwt: {
    secret: 'my-secret-key',
  },
}
```

✅ **正确做法**：

```javascript
config: {
  jwt: {
    secret: env('JWT_SECRET'),
  },
}
```

### 2. 使用强密钥

生成强密钥：

```bash
# 生成 32 字节（64 个十六进制字符）的密钥
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 生成 16 字节（32 个十六进制字符）的密钥
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"

# 生成 Base64 格式的密钥
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 3. 不要提交 .env 文件到版本控制

在 `.gitignore` 中添加：

```
.env
.env.*
!.env.example
```

### 4. 使用 .env.example 作为模板

创建 `.env.example` 文件作为模板：

```env
# JWT 认证
JWT_SECRET=
JWT_EXPIRES_IN=7d

# 验证码
ENABLE_CAPTCHA=true

# API 限流
RATE_LIMIT_ENABLED=true
RATE_LIMIT_POINTS=100

# 加密工具
CRYPTO_AES_KEY=
CRYPTO_HMAC_SECRET=
```

### 5. 定期轮换密钥

建议：
- JWT Secret: 每 3-6 个月
- AES Key: 每 6-12 个月
- API Sign Keys: 根据需要

## 在配置文件中使用环境变量

### 基本用法

```javascript
module.exports = ({ env }) => ({
  'bag-strapi-plugin': {
    config: {
      auth: {
        jwt: {
          secret: env('JWT_SECRET'),
        },
      },
    },
  },
});
```

### 使用默认值

```javascript
env('JWT_SECRET', 'default-value')
```

### 类型转换

```javascript
env.bool('ENABLE_CAPTCHA', true)     // 布尔值
env.int('CAPTCHA_LENGTH', 4)         // 整数
env.float('SOME_VALUE', 1.5)         // 浮点数
env.array('WHITELIST', [])           // 数组（逗号分隔）
env.json('CONFIG', {})               // JSON 对象
```

### 数组类型环境变量

```env
RATE_LIMIT_WHITELIST=127.0.0.1,::1,192.168.1.1
```

```javascript
whitelist: env.array('RATE_LIMIT_WHITELIST', [])
// 结果：['127.0.0.1', '::1', '192.168.1.1']
```

## 验证环境变量

创建一个验证脚本 `scripts/validate-env.js`：

```javascript
const requiredEnvVars = [
  'JWT_SECRET',
  'CRYPTO_AES_KEY',
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ 缺少必需的环境变量:');
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  process.exit(1);
}

console.log('✅ 所有必需的环境变量已配置');
```

在 `package.json` 中添加脚本：

```json
{
  "scripts": {
    "validate:env": "node scripts/validate-env.js",
    "develop": "npm run validate:env && strapi develop"
  }
}
```

## 下一步

- [配置指南](/guide/configuration)
- [调试指南](/guide/debugging)
- [最佳实践](/guide/best-practices)

