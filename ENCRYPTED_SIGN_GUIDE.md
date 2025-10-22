# 加密签名与一次性签名使用指南

## 📋 概述

bag-strapi-plugin 支持三种签名验证模式：
1. **简单模式** - 签名列表验证
2. **加密模式** - 解密签名，验证是否包含 'bag'
3. **混合模式** - 同时支持简单和加密两种方式

另外还支持**一次性签名**功能，确保每个签名只能使用一次。

---

## 🚀 快速开始

### 1. 配置签名验证模式

在 `config/plugins.js` 中配置：

```javascript
module.exports = ({ env }) => ({
  'bag-strapi-plugin': {
    config: {
      signVerify: {
        enabled: true,
        
        // 验证模式：'simple' | 'encrypted' | 'both'
        mode: 'encrypted',  // 使用加密模式
        
        // 加密密钥（如果为空则使用 crypto.aesKey）
        encryptionKey: env('SIGN_ENCRYPTION_KEY', '5AEY5nFZ+Rd6lO+Eyk+9QkI5QPyQdHcq'),
        
        // 是否启用一次性签名
        enableOnceOnly: false,
      },
    },
  },
});
```

### 2. 生成加密签名

```bash
# 运行生成工具
node server/generate-encrypted-sign.js
```

输出示例：
```
========================================
   加密签名生成工具
========================================

密钥: 5AEY5nFZ+Rd6lO+Eyk+9QkI5QPyQdHcq
密钥长度: 32 字符

示例 1:
原文: bag
加密签名: eyJlIjoiNGYxMzJhZGY4ZjA5...

示例 2:
原文: bag-token
加密签名: eyJlIjoiODJhMzRiY2Y2YTEx...
```

### 3. 使用加密签名

```bash
curl -H "sign: eyJlIjoiNGYxMzJhZGY4ZjA5..." http://localhost:1337/bag-strapi-plugin
```

---

## 🔐 验证模式详解

### 模式 1：简单模式 (simple)

**配置**：
```javascript
signVerify: {
  mode: 'simple',
  validSigns: ['test-sign-123', 'prod-sign-456'],
}
```

**使用**：
```bash
curl -H "sign: test-sign-123" http://localhost:1337/bag-strapi-plugin
```

**特点**：
- ✅ 简单直接
- ✅ 性能高
- ❌ 安全性低（签名明文传输）

---

### 模式 2：加密模式 (encrypted)

**配置**：
```javascript
signVerify: {
  mode: 'encrypted',
  encryptionKey: '5AEY5nFZ+Rd6lO+Eyk+9QkI5QPyQdHcq',
}
```

**工作流程**：
1. 客户端：加密包含 'bag' 的字符串
2. 发送：将加密结果作为签名
3. 服务器：解密签名
4. 验证：检查解密后的内容是否包含 'bag'

**生成加密签名**：
```javascript
const crypto = require('crypto');

// 使用插件提供的加密函数
const strapi = await require('@strapi/strapi')().load();

const text = 'bag-token-' + Date.now();
const key = '5AEY5nFZ+Rd6lO+Eyk+9QkI5QPyQdHcq';
const encrypted = strapi.crypto.aes.encryptSimple(text, key);

console.log('加密签名:', encrypted);
```

**使用**：
```bash
curl -H "sign: 加密后的签名" http://localhost:1337/bag-strapi-plugin
```

**特点**：
- ✅ 安全性高
- ✅ 签名加密传输
- ✅ 可携带额外信息
- ❌ 性能略低

---

### 模式 3：混合模式 (both)

**配置**：
```javascript
signVerify: {
  mode: 'both',
  validSigns: ['test-sign-123'],  // 简单签名
  encryptionKey: '5AEY5nFZ+Rd6lO+Eyk+9QkI5QPyQdHcq',  // 加密密钥
}
```

**特点**：
- ✅ 灵活性高
- ✅ 同时支持两种模式
- ✅ 向后兼容

---

## 🔒 一次性签名

### 启用一次性签名

```javascript
signVerify: {
  mode: 'encrypted',
  encryptionKey: '5AEY5nFZ+Rd6lO+Eyk+9QkI5QPyQdHcq',
  
  // 启用一次性签名
  enableOnceOnly: true,
  
  // 签名过期时间（毫秒）
  signExpiration: 3600000,  // 1小时后自动清理
}
```

### 工作原理

1. **首次使用**：签名验证通过，标记为已使用
2. **再次使用**：直接返回 401（签名已使用）
3. **自动清理**：过期签名会自动清理，释放内存

### 使用场景

```javascript
// 场景 1：一次性操作 API
// 例如：重置密码、确认邮箱等
const resetToken = strapi.crypto.aes.encryptSimple(
  `bag-reset-${userId}-${Date.now()}`,
  key
);

// 只能使用一次，用完即失效

// 场景 2：防止重放攻击
// 每次请求生成新的签名
const requestSign = strapi.crypto.aes.encryptSimple(
  `bag-request-${nonce}-${timestamp}`,
  key
);
```

---

## 💡 实际应用示例

### 示例 1：生成带时间戳的加密签名

```javascript
// server/utils/generate-sign.js
module.exports = {
  generateTimedSign(userId) {
    const text = `bag-user-${userId}-${Date.now()}`;
    const key = process.env.SIGN_ENCRYPTION_KEY;
    return strapi.crypto.aes.encryptSimple(text, key);
  },
};
```

### 示例 2：客户端生成加密签名

```javascript
// 前端使用 crypto-js
const CryptoJS = require('crypto-js');

function generateSign(data) {
  const text = `bag-${data}`;
  const key = 'your-encryption-key';
  
  // 注意：需要与服务端加密算法一致
  const encrypted = CryptoJS.AES.encrypt(text, key).toString();
  return encrypted;
}

// 使用
const sign = generateSign('user-123');
fetch('/api/endpoint', {
  headers: {
    'sign': sign,
  },
});
```

### 示例 3：API 密钥管理

```javascript
// api/api-key/controllers/api-key.js
module.exports = {
  async createApiKey(ctx) {
    const userId = ctx.state.user.id;
    
    // 生成加密签名作为 API Key
    const apiKey = strapi.crypto.aes.encryptSimple(
      `bag-api-${userId}-${Date.now()}`,
      process.env.SIGN_ENCRYPTION_KEY
    );
    
    // 保存到数据库
    await strapi.entityService.create('api::api-key.api-key', {
      data: {
        user: userId,
        key: apiKey,
        createdAt: new Date(),
      },
    });
    
    ctx.body = { apiKey };
  },
};
```

---

## 🧪 测试

### 测试简单签名

```bash
curl -H "sign: test-sign-123" http://localhost:1337/bag-strapi-plugin
```

### 测试加密签名

```bash
# 1. 生成加密签名
node server/generate-encrypted-sign.js

# 2. 使用生成的签名
curl -H "sign: eyJlIjoiNGYxMzJhZGY..." http://localhost:1337/bag-strapi-plugin
```

### 测试一次性签名

```bash
# 第一次请求 - 成功
curl -H "sign: 加密签名" http://localhost:1337/bag-strapi-plugin

# 第二次使用同样的签名 - 失败（401）
curl -H "sign: 加密签名" http://localhost:1337/bag-strapi-plugin
```

---

## ⚙️ 配置参考

### 完整配置示例

```javascript
signVerify: {
  // 基础配置
  enabled: true,
  
  // 验证模式
  mode: 'both',  // 'simple' | 'encrypted' | 'both'
  
  // 简单签名
  validSigns: [
    env('API_SIGN_KEY'),
  ],
  
  // 加密签名
  encryptionKey: env('SIGN_ENCRYPTION_KEY'),
  
  // 一次性签名
  enableOnceOnly: env.bool('SIGN_ONCE_ONLY', false),
  onceOnlyStorage: 'memory',  // 'memory' | 'database'
  signExpiration: 3600000,  // 1小时
  
  // 白名单
  whitelist: [
    '/bag-strapi-plugin/health',
  ],
}
```

### 环境变量

```env
# 验证模式
SIGN_VERIFY_MODE=encrypted

# 加密密钥
SIGN_ENCRYPTION_KEY=5AEY5nFZ+Rd6lO+Eyk+9QkI5QPyQdHcq

# 一次性签名
SIGN_ONCE_ONLY=true
SIGN_EXPIRATION=3600000
```

---

## 🔍 调试

### 查看验证日志

启用调试模式后，你会看到详细的日志：

```
🔍 [verifySign] 开始验证签名
🔍 [verifySign] 验证模式: encrypted
🔍 [verifySign] 检查一次性签名
🔐 [verifyEncryptedSign] 开始解密签名
🔐 [verifyEncryptedSign] 使用密钥长度: 32
🔐 [verifyEncryptedSign] 解密结果: bag-token-1234567890
🔐 [verifyEncryptedSign] 是否包含 "bag": true
✅ [verifySign] 签名已标记为使用
🔍 [verifySign] 最终验证结果: true
```

### 常见问题

**Q1: 解密失败**
```
❌ [verifyEncryptedSign] 解密失败: Invalid key length
```
解决：确保加密密钥至少 32 字符

**Q2: 签名已使用**
```
❌ [verifySign] 签名已使用过（一次性签名验证失败）
```
解决：生成新的签名或关闭一次性验证

**Q3: 未包含 'bag'**
```
🔐 [verifyEncryptedSign] 是否包含 "bag": false
```
解决：确保加密的原文包含 'bag' 字符串

---

## 📊 性能考虑

### 简单签名
- **性能**：⭐⭐⭐⭐⭐
- **安全性**：⭐⭐
- **适用场景**：内部API、开发环境

### 加密签名
- **性能**：⭐⭐⭐⭐
- **安全性**：⭐⭐⭐⭐⭐
- **适用场景**：生产环境、公开API

### 一次性签名
- **内存占用**：每个签名约 100 bytes
- **清理机制**：自动清理过期签名
- **存储方式**：内存（未来支持数据库）

---

## 🔐 安全建议

1. ✅ **生产环境使用加密模式**
2. ✅ **定期更换加密密钥**
3. ✅ **使用环境变量存储密钥**
4. ✅ **启用 HTTPS**
5. ✅ **敏感操作启用一次性签名**
6. ✅ **记录失败的验证尝试**

---

## 📚 相关文档

- [用户配置指南](./USER_CONFIG_GUIDE.md)
- [全局中间件文档](./server/GLOBAL_MIDDLEWARE.md)
- [加密工具指南](./CRYPTO_UTILS_GUIDE.md)

---

**版本**: 0.0.4  
**作者**: yanghang <470193837@qq.com>

