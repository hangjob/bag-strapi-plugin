# 配置指南

本指南详细介绍 bag-strapi-plugin 的所有配置选项。

## 配置文件位置

在 Strapi 项目中创建或编辑 `config/plugins.js`：

```javascript
// config/plugins.js
module.exports = ({ env }) => ({
  'bag-strapi-plugin': {
    enabled: true,
    config: {
      // 配置项
    },
  },
});
```

## 完整配置示例

```javascript
module.exports = ({ env }) => ({
  'bag-strapi-plugin': {
    enabled: true,
    config: {
      // ==================== 认证配置 ====================
      auth: {
        // 是否启用验证码
        enableCaptcha: env.bool('ENABLE_CAPTCHA', true),
        
        // 验证码类型：'image' | 'math'
        captchaType: env('CAPTCHA_TYPE', 'image'),
        
        // 验证码长度
        captchaLength: env.int('CAPTCHA_LENGTH', 4),
        
        // 验证码过期时间（毫秒）
        captchaExpireTime: env.int('CAPTCHA_EXPIRE_TIME', 300000),
        
        // 验证码最大尝试次数
        captchaMaxAttempts: env.int('CAPTCHA_MAX_ATTEMPTS', 3),
        
        // JWT 配置
        jwt: {
          secret: env('JWT_SECRET'),
          expiresIn: env('JWT_EXPIRES_IN', '7d'),
        },
      },

      // ==================== 限流配置 ====================
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

      // ==================== 签名验证配置 ====================
      signVerify: {
        // 是否启用签名验证
        enabled: env.bool('SIGN_VERIFY_ENABLED', false),
        
        // 验证模式：'simple' | 'encrypted' | 'both'
        mode: env('SIGN_VERIFY_MODE', 'simple'),
        
        // 简单签名列表
        validSigns: env.array('API_SIGN_KEYS', [
          'your-sign-key-here',
        ]),
        
        // 加密签名配置
        encryptedSign: {
          enabled: env.bool('ENCRYPTED_SIGN_ENABLED', false),
          aesKey: env('ENCRYPTED_SIGN_AES_KEY'),
          verifyContent: 'bag',
        },
        
        // 一次性签名配置
        onceSign: {
          enabled: env.bool('ONCE_SIGN_ENABLED', false),
          expireTime: env.int('ONCE_SIGN_EXPIRE_TIME', 300000),
        },
        
        // 白名单路径（不需要验证的接口）
        whitelist: [
          '/bag-strapi-plugin/health',
          '/bag-strapi-plugin/version',
        ],
      },

      // ==================== 加密工具配置 ====================
      crypto: {
        // AES 密钥（至少 32 字符）
        aesKey: env('CRYPTO_AES_KEY'),
        
        // HMAC 密钥
        hmacSecret: env('CRYPTO_HMAC_SECRET'),
        
        // Token 密钥
        tokenSecret: env('CRYPTO_TOKEN_SECRET'),
        
        // RSA 密钥长度
        rsaKeyLength: env.int('CRYPTO_RSA_KEY_LENGTH', 2048),
        
        // 固定 RSA 密钥对（可选）
        rsa: {
          publicKey: env('CRYPTO_RSA_PUBLIC_KEY'),
          privateKey: env('CRYPTO_RSA_PRIVATE_KEY'),
        },
      },
    },
  },
});
```

## 配置项详解

### 认证配置（auth）

#### enableCaptcha

- **类型**: `Boolean`
- **默认值**: `true`
- **说明**: 是否在注册和登录时启用验证码

#### captchaType

- **类型**: `String`
- **默认值**: `'image'`
- **可选值**: `'image'` | `'math'`
- **说明**: 验证码类型

#### captchaLength

- **类型**: `Number`
- **默认值**: `4`
- **说明**: 验证码长度

#### captchaExpireTime

- **类型**: `Number`
- **默认值**: `300000`（5 分钟）
- **说明**: 验证码过期时间（毫秒）

#### captchaMaxAttempts

- **类型**: `Number`
- **默认值**: `3`
- **说明**: 验证码最大尝试次数

#### jwt.secret

- **类型**: `String`
- **必填**: ✅
- **说明**: JWT 签名密钥
- **建议**: 使用至少 32 字符的随机字符串

#### jwt.expiresIn

- **类型**: `String`
- **默认值**: `'7d'`
- **说明**: Token 过期时间
- **格式**: `'60'`（秒）、`'2 days'`、`'10h'`、`'7d'`

### 限流配置（rateLimit）

#### enabled

- **类型**: `Boolean`
- **默认值**: `false`
- **说明**: 是否启用限流

#### points

- **类型**: `Number`
- **默认值**: `100`
- **说明**: 时间窗口内允许的请求数

#### duration

- **类型**: `Number`
- **默认值**: `60`
- **说明**: 时间窗口（秒）

#### blockDuration

- **类型**: `Number`
- **默认值**: `0`
- **说明**: 触发限流后的阻止时长（秒），0 表示不阻止

#### storage

- **类型**: `String`
- **默认值**: `'memory'`
- **可选值**: `'memory'` | `'redis'`
- **说明**: 存储方式

#### whitelist

- **类型**: `Array<String>`
- **默认值**: `[]`
- **说明**: IP 白名单

### 签名验证配置（signVerify）

#### enabled

- **类型**: `Boolean`
- **默认值**: `false`
- **说明**: 是否启用签名验证

#### mode

- **类型**: `String`
- **默认值**: `'simple'`
- **可选值**: `'simple'` | `'encrypted'` | `'both'`
- **说明**: 验证模式

#### validSigns

- **类型**: `Array<String>`
- **默认值**: `[]`
- **说明**: 有效的简单签名列表

#### encryptedSign.enabled

- **类型**: `Boolean`
- **默认值**: `false`
- **说明**: 是否启用加密签名

#### encryptedSign.aesKey

- **类型**: `String`
- **说明**: 加密签名的 AES 密钥

#### onceSign.enabled

- **类型**: `Boolean`
- **默认值**: `false`
- **说明**: 是否启用一次性签名

#### onceSign.expireTime

- **类型**: `Number`
- **默认值**: `300000`（5 分钟）
- **说明**: 一次性签名过期时间（毫秒）

#### whitelist

- **类型**: `Array<String>`
- **默认值**: `[]`
- **说明**: 不需要签名验证的路径（支持正则）

### 加密工具配置（crypto）

#### aesKey

- **类型**: `String`
- **最小长度**: 32 字符
- **说明**: AES-256 加密密钥

#### hmacSecret

- **类型**: `String`
- **说明**: HMAC 签名密钥

#### tokenSecret

- **类型**: `String`
- **说明**: Token 生成密钥

#### rsaKeyLength

- **类型**: `Number`
- **默认值**: `2048`
- **说明**: RSA 密钥长度

#### rsa.publicKey

- **类型**: `String`
- **说明**: 固定的 RSA 公钥（可选）

#### rsa.privateKey

- **类型**: `String`
- **说明**: 固定的 RSA 私钥（可选）

## 环境相关配置

### 开发环境配置

创建 `config/env/development/plugins.js`：

```javascript
module.exports = () => ({
  'bag-strapi-plugin': {
    config: {
      auth: {
        enableCaptcha: false,  // 开发环境禁用验证码
      },
      rateLimit: {
        enabled: false,  // 开发环境禁用限流
      },
      signVerify: {
        enabled: false,  // 开发环境禁用签名验证
      },
    },
  },
});
```

### 生产环境配置

创建 `config/env/production/plugins.js`：

```javascript
module.exports = ({ env }) => ({
  'bag-strapi-plugin': {
    config: {
      auth: {
        enableCaptcha: true,  // 生产环境启用验证码
        jwt: {
          secret: env('JWT_SECRET'),  // 必须使用环境变量
          expiresIn: '7d',
        },
      },
      rateLimit: {
        enabled: true,  // 生产环境启用限流
        storage: 'redis',  // 使用 Redis 存储
        points: 50,
        duration: 60,
        blockDuration: 300,
      },
      signVerify: {
        enabled: true,  // 生产环境启用签名验证
        mode: 'encrypted',
        encryptedSign: {
          enabled: true,
          aesKey: env('ENCRYPTED_SIGN_AES_KEY'),
        },
        onceSign: {
          enabled: true,
        },
      },
    },
  },
});
```

## 配置验证

### 检查配置是否生效

创建一个测试控制器：

```javascript
module.exports = {
  async checkConfig(ctx) {
    const pluginConfig = strapi.config.get('plugin.bag-strapi-plugin');
    
    ctx.body = {
      success: true,
      config: {
        auth: pluginConfig.auth,
        rateLimit: pluginConfig.rateLimit,
        signVerify: pluginConfig.signVerify,
        crypto: {
          hasAesKey: !!pluginConfig.crypto?.aesKey,
          hasHmacSecret: !!pluginConfig.crypto?.hmacSecret,
        },
      },
    };
  },
};
```

## 最佳实践

### 1. 使用环境变量

❌ **不推荐**：在代码中硬编码密钥

```javascript
config: {
  jwt: {
    secret: 'my-secret-key',  // 不安全！
  },
}
```

✅ **推荐**：使用环境变量

```javascript
config: {
  jwt: {
    secret: env('JWT_SECRET'),  // 安全！
  },
}
```

### 2. 不同环境使用不同配置

使用环境特定的配置文件：
- `config/env/development/plugins.js`
- `config/env/production/plugins.js`
- `config/env/staging/plugins.js`

### 3. 生产环境安全配置

```javascript
// 生产环境必须：
- ✅ 使用强随机密钥
- ✅ 启用 HTTPS
- ✅ 启用限流
- ✅ 启用验证码
- ✅ 使用 Redis 存储
- ✅ 配置适当的过期时间
```

### 4. 定期轮换密钥

建议定期更新：
- JWT Secret
- AES 密钥
- HMAC 密钥
- API 签名密钥

## 下一步

- [环境变量配置](/guide/environment)
- [调试指南](/guide/debugging)
- [最佳实践](/guide/best-practices)

## 相关链接

- [JWT 认证配置](/features/auth-config)
- [限流配置详解](/features/rate-limit-config)
- [加密配置详解](/features/crypto-config)

