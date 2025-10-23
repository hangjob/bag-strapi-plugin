# 快速开始

本指南将帮助你在 5 分钟内快速上手 bag-strapi-plugin。

## 前置要求

- Strapi 5.x 项目
- Node.js 22.10.0+
- npm / yarn / pnpm

## 1. 安装插件

在你的 Strapi 项目中安装插件：

::: code-group

```bash [npm]
npm install bag-strapi-plugin
```

```bash [yarn]
yarn add bag-strapi-plugin
```

```bash [pnpm]
pnpm add bag-strapi-plugin
```

```bash [yalc (开发)]
yalc add bag-strapi-plugin
```

:::

## 2. 配置插件

创建或编辑 `config/plugins.js` 文件：

```javascript
module.exports = ({ env }) => ({
  'bag-strapi-plugin': {
    enabled: true,
    config: {
      // JWT 认证配置
      auth: {
        enableCaptcha: env.bool('ENABLE_CAPTCHA', true),
        jwt: {
          secret: env('JWT_SECRET'),
          expiresIn: '7d',
        },
      },
      
      // API 限流配置
      rateLimit: {
        enabled: env.bool('RATE_LIMIT_ENABLED', true),
        points: 100,      // 每分钟 100 个请求
        duration: 60,     // 时间窗口：60 秒
      },
      
      // 签名验证配置
      signVerify: {
        enabled: env.bool('SIGN_VERIFY_ENABLED', false),
        validSigns: [
          env('API_SIGN_KEY', 'your-sign-key-here'),
        ],
      },
      
      // 加密工具配置
      crypto: {
        aesKey: env('CRYPTO_AES_KEY'),
        hmacSecret: env('CRYPTO_HMAC_SECRET'),
        tokenSecret: env('CRYPTO_TOKEN_SECRET'),
      },
    },
  },
});
```

## 3. 配置环境变量

在项目根目录创建或编辑 `.env` 文件：

```env
# JWT 认证
JWT_SECRET=your-very-secure-secret-key-change-in-production
JWT_EXPIRES_IN=7d
ENABLE_CAPTCHA=true

# API 限流
RATE_LIMIT_ENABLED=true

# 签名验证（可选）
SIGN_VERIFY_ENABLED=false
API_SIGN_KEY=your-sign-key-here

# 加密工具
CRYPTO_AES_KEY=my-super-strong-aes-key-32-chars!!
CRYPTO_HMAC_SECRET=my-hmac-secret-key
CRYPTO_TOKEN_SECRET=my-token-secret-key

# 验证码配置
CAPTCHA_TYPE=image
CAPTCHA_LENGTH=4
CAPTCHA_EXPIRE_TIME=300000
```

::: tip 生成安全密钥
使用以下命令生成安全的随机密钥：

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
:::

## 4. 安装必要依赖

插件需要以下依赖包（如果你的项目中还没有安装）：

```bash
npm install bcrypt jsonwebtoken svg-captcha rate-limiter-flexible
```

## 5. 启动 Strapi

```bash
npm run develop
```

插件会自动：
- ✅ 创建菜单数据库表 (`bag_plugin_menus`)
- ✅ 创建用户数据库表 (`bag_users`)
- ✅ 注册认证、验证码、限流等路由
- ✅ 初始化加密工具全局对象

## 6. 测试功能

### 测试认证功能

**注册用户**

```bash
curl -X POST http://localhost:1337/bag-strapi-plugin/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "nickname": "测试用户"
  }'
```

**登录**

```bash
curl -X POST http://localhost:1337/bag-strapi-plugin/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "testuser",
    "password": "password123"
  }'
```

### 测试验证码

**获取验证码**

```bash
curl http://localhost:1337/bag-strapi-plugin/captcha/image
```

### 测试加密工具

在控制器中使用：

```javascript
module.exports = {
  async testCrypto(ctx) {
    // AES 加密
    const aesKey = strapi.crypto.config.getAesKey();
    const encrypted = strapi.crypto.aes.encryptSimple('敏感数据', aesKey);
    
    // 哈希
    const hash = strapi.crypto.hash.sha256('password123');
    
    // UUID
    const id = strapi.crypto.random.uuid();
    
    ctx.body = {
      encrypted,
      hash,
      id,
    };
  }
};
```

## 7. 前端集成示例

### React 示例

```jsx
import React, { useState } from 'react';

function LoginForm() {
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:1337/bag-strapi-plugin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        // 保存 Token
        localStorage.setItem('token', result.data.token);
        alert('登录成功！');
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('登录失败:', error);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="text"
        placeholder="用户名/邮箱"
        value={formData.identifier}
        onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
      />
      <input
        type="password"
        placeholder="密码"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
      />
      <button type="submit">登录</button>
    </form>
  );
}

export default LoginForm;
```

### 使用 Token 发送请求

```javascript
const token = localStorage.getItem('token');

const response = await fetch('http://localhost:1337/bag-strapi-plugin/auth/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const result = await response.json();
console.log('当前用户:', result.data);
```

## 常用配置场景

### 开发环境禁用验证码

```javascript
// config/env/development/plugins.js
module.exports = () => ({
  'bag-strapi-plugin': {
    config: {
      auth: {
        enableCaptcha: false,  // 开发时禁用验证码
      },
    },
  },
});
```

### 生产环境启用严格限流

```javascript
// config/env/production/plugins.js
module.exports = ({ env }) => ({
  'bag-strapi-plugin': {
    config: {
      rateLimit: {
        enabled: true,
        storage: 'redis',  // 使用 Redis
        points: 50,        // 更严格的限制
        duration: 60,
        blockDuration: 300, // 阻止 5 分钟
      },
    },
  },
});
```

## 下一步

恭喜！你已经成功安装并配置了 bag-strapi-plugin。接下来你可以：

- 📖 查看[完整配置说明](/guide/configuration)
- 🔐 了解 [JWT 认证系统](/features/auth)
- 🖼️ 使用[验证码系统](/features/captcha)
- ⚡ 配置 [API 限流](/features/rate-limit)
- 🔒 学习[加密工具](/features/crypto)
- 📋 管理[菜单系统](/features/menu)

## 获取帮助

遇到问题？

- 📖 查看[调试指南](/guide/debugging)
- 🐛 提交 [Issue](https://github.com/hangjob/bag-strapi-plugin/issues)
- 💬 参与 [讨论](https://github.com/hangjob/bag-strapi-plugin/discussions)

