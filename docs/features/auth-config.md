# 认证配置详解

JWT 认证系统的详细配置说明。

## 完整配置

```javascript
module.exports = ({ env }) => ({
  'bag-strapi-plugin': {
    config: {
      auth: {
        // 验证码配置
        enableCaptcha: env.bool('ENABLE_CAPTCHA', true),
        captchaType: env('CAPTCHA_TYPE', 'image'),  // 'image' | 'math'
        captchaLength: env.int('CAPTCHA_LENGTH', 4),
        captchaExpireTime: env.int('CAPTCHA_EXPIRE_TIME', 300000),
        captchaMaxAttempts: env.int('CAPTCHA_MAX_ATTEMPTS', 3),
        
        // JWT 配置
        jwt: {
          secret: env('JWT_SECRET'),  // 必需
          expiresIn: env('JWT_EXPIRES_IN', '7d'),
        },
      },
    },
  },
});
```

## 配置项说明

### enableCaptcha

- **类型**: `Boolean`
- **默认值**: `true`
- **说明**: 是否启用验证码

### captchaType

- **类型**: `String`
- **默认值**: `'image'`
- **可选值**: `'image'` | `'math'`
- **说明**: 验证码类型

### captchaLength

- **类型**: `Number`
- **默认值**: `4`
- **说明**: 验证码长度

### captchaExpireTime

- **类型**: `Number`
- **默认值**: `300000`（5 分钟）
- **说明**: 验证码过期时间（毫秒）

### captchaMaxAttempts

- **类型**: `Number`
- **默认值**: `3`
- **说明**: 验证码最大尝试次数

### jwt.secret

- **类型**: `String`
- **必需**: ✅
- **说明**: JWT 签名密钥
- **建议**: 使用至少 32 字符的随机字符串

### jwt.expiresIn

- **类型**: `String`
- **默认值**: `'7d'`
- **说明**: Token 过期时间
- **格式**: 
  - `'60'` - 60 秒
  - `'2 days'` - 2 天
  - `'10h'` - 10 小时
  - `'7d'` - 7 天

## 环境变量

```env
# JWT
JWT_SECRET=your-very-secure-secret-key
JWT_EXPIRES_IN=7d

# 验证码
ENABLE_CAPTCHA=true
CAPTCHA_TYPE=image
CAPTCHA_LENGTH=4
CAPTCHA_EXPIRE_TIME=300000
CAPTCHA_MAX_ATTEMPTS=3
```

## 相关链接

- [JWT 认证系统](/features/auth)
- [验证码系统](/features/captcha)
- [配置指南](/guide/configuration)

