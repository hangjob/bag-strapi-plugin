# 加密工具配置指南

## 📋 配置说明

bag-strapi-plugin 的加密工具支持通过配置文件和环境变量来自定义密钥。

---

## 🚀 快速开始

### 方式一：使用环境变量（推荐）

#### 1. 在项目的 `.env` 文件中添加：

```env
# 加密工具配置
CRYPTO_AES_KEY=my-super-strong-aes-key-32-chars!!
CRYPTO_HMAC_SECRET=my-hmac-secret-key
CRYPTO_TOKEN_SECRET=my-token-secret-key
```

#### 2. 在 `config/plugins.js` 中配置：

```javascript
module.exports = ({ env }) => ({
  'bag-strapi-plugin': {
    enabled: true,
    config: {
      crypto: {
        aesKey: env('CRYPTO_AES_KEY'),
        hmacSecret: env('CRYPTO_HMAC_SECRET'),
        tokenSecret: env('CRYPTO_TOKEN_SECRET'),
        rsaKeyLength: 2048,
      },
    },
  },
});
```

#### 3. 在代码中使用：

```javascript
// 在控制器、服务或中间件中
module.exports = {
  async myMethod(ctx) {
    // 获取配置的密钥
    const aesKey = strapi.crypto.config.getAesKey();
    
    // 使用 AES 加密
    const encrypted = strapi.crypto.aes.encryptSimple('敏感数据', aesKey);
    
    // 使用 HMAC 签名
    const hmacSecret = strapi.crypto.config.getHmacSecret();
    const signature = strapi.crypto.hash.hmac('数据', hmacSecret);
    
    ctx.body = { encrypted, signature };
  }
};
```

---

### 方式二：直接在配置文件中设置

```javascript
// config/plugins.js
module.exports = ({ env }) => ({
  'bag-strapi-plugin': {
    enabled: true,
    config: {
      crypto: {
        aesKey: 'your-aes-key-at-least-32-chars!!',
        hmacSecret: 'your-hmac-secret-key',
        tokenSecret: 'your-token-secret-key',
        rsaKeyLength: 2048,
      },
    },
  },
});
```

**⚠️ 注意**：生产环境不建议在代码中硬编码密钥，请使用环境变量。

---

## 📚 配置项说明

### 1. `crypto.aesKey`

- **类型**：`String`
- **必填**：是（使用 AES 加密时）
- **最小长度**：32 字符
- **说明**：AES-256 对称加密的密钥

```javascript
crypto: {
  aesKey: env('CRYPTO_AES_KEY', 'default-32-chars-key-change-it!'),
}
```

### 2. `crypto.hmacSecret`

- **类型**：`String`
- **必填**：是（使用 HMAC 时）
- **说明**：HMAC 签名的密钥

```javascript
crypto: {
  hmacSecret: env('CRYPTO_HMAC_SECRET', 'your-hmac-secret'),
}
```

### 3. `crypto.tokenSecret`

- **类型**：`String`
- **必填**：是（生成 Token 时）
- **说明**：Token 生成和验证的密钥

```javascript
crypto: {
  tokenSecret: env('CRYPTO_TOKEN_SECRET', 'your-token-secret'),
}
```

### 4. `crypto.rsaKeyLength`

- **类型**：`Number`
- **默认值**：`2048`
- **可选值**：`2048`, `4096`
- **说明**：RSA 密钥长度

```javascript
crypto: {
  rsaKeyLength: 4096, // 更安全，但生成较慢
}
```

---

## 💡 使用示例

### 示例 1：加密用户敏感信息

```javascript
// api/user/controllers/user.js
module.exports = {
  async create(ctx) {
    const { email, phone, idCard } = ctx.request.body;
    
    // 获取配置的 AES 密钥
    const aesKey = strapi.crypto.config.getAesKey();
    
    // 加密敏感信息
    const encryptedPhone = strapi.crypto.aes.encryptSimple(phone, aesKey);
    const encryptedIdCard = strapi.crypto.aes.encryptSimple(idCard, aesKey);
    
    // 保存到数据库
    const user = await strapi.entityService.create('api::user.user', {
      data: {
        email,
        phone: encryptedPhone,
        idCard: encryptedIdCard,
      },
    });
    
    ctx.body = user;
  },
  
  async findOne(ctx) {
    const { id } = ctx.params;
    const aesKey = strapi.crypto.config.getAesKey();
    
    const user = await strapi.entityService.findOne('api::user.user', id);
    
    // 解密敏感信息
    user.phone = strapi.crypto.aes.decryptSimple(user.phone, aesKey);
    user.idCard = strapi.crypto.aes.decryptSimple(user.idCard, aesKey);
    
    ctx.body = user;
  },
};
```

### 示例 2：生成和验证 Token

```javascript
// api/auth/controllers/auth.js
module.exports = {
  async forgotPassword(ctx) {
    const { email } = ctx.request.body;
    const tokenSecret = strapi.crypto.config.getTokenSecret();
    
    // 生成重置 Token
    const tokenData = {
      email,
      expires: Date.now() + 3600000, // 1小时
      nonce: strapi.crypto.random.uuid(),
    };
    
    const token = strapi.crypto.base64.urlEncode(JSON.stringify(tokenData));
    const signature = strapi.crypto.hash.hmac(token, tokenSecret);
    
    const resetLink = `https://example.com/reset?token=${token}&sig=${signature}`;
    
    // 发送邮件...
    
    ctx.body = { message: '重置邮件已发送' };
  },
  
  async resetPassword(ctx) {
    const { token, sig } = ctx.query;
    const tokenSecret = strapi.crypto.config.getTokenSecret();
    
    // 验证签名
    const expectedSig = strapi.crypto.hash.hmac(token, tokenSecret);
    if (sig !== expectedSig) {
      return ctx.badRequest('无效的 token');
    }
    
    // 解析和验证 token
    const tokenData = JSON.parse(strapi.crypto.base64.urlDecode(token));
    if (Date.now() > tokenData.expires) {
      return ctx.badRequest('token 已过期');
    }
    
    // 继续重置密码...
    ctx.body = { message: 'Token 验证成功' };
  },
};
```

### 示例 3：API 签名

```javascript
// api/payment/services/payment.js
module.exports = {
  async callPaymentAPI(orderData) {
    const hmacSecret = strapi.crypto.config.getHmacSecret();
    
    const timestamp = Date.now();
    const nonce = strapi.crypto.random.string(16);
    
    // 生成签名
    const signString = `${timestamp}${nonce}${JSON.stringify(orderData)}`;
    const signature = strapi.crypto.hash.hmac(signString, hmacSecret);
    
    // 调用第三方 API
    const response = await fetch('https://payment-api.example.com/pay', {
      method: 'POST',
      headers: {
        'X-Timestamp': timestamp,
        'X-Nonce': nonce,
        'X-Signature': signature,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });
    
    return response.json();
  },
};
```

### 示例 4：文件加密

```javascript
// api/file/controllers/file.js
const fs = require('fs').promises;

module.exports = {
  async uploadEncrypted(ctx) {
    const { files } = ctx.request;
    const file = files.file;
    const aesKey = strapi.crypto.config.getAesKey();
    
    // 读取文件内容
    const content = await fs.readFile(file.path, 'utf8');
    
    // 加密
    const encrypted = strapi.crypto.aes.encryptSimple(content, aesKey);
    
    // 保存加密文件
    const filename = `${strapi.crypto.random.uuid()}.enc`;
    await fs.writeFile(`./encrypted/${filename}`, encrypted);
    
    ctx.body = { filename, message: '文件已加密上传' };
  },
  
  async downloadEncrypted(ctx) {
    const { filename } = ctx.params;
    const aesKey = strapi.crypto.config.getAesKey();
    
    // 读取加密文件
    const encrypted = await fs.readFile(`./encrypted/${filename}`, 'utf8');
    
    // 解密
    const decrypted = strapi.crypto.aes.decryptSimple(encrypted, aesKey);
    
    ctx.body = decrypted;
  },
};
```

---

## 🔐 辅助方法

插件提供了以下辅助方法来获取配置：

```javascript
// 获取 AES 密钥
const aesKey = strapi.crypto.config.getAesKey();

// 获取 HMAC 密钥
const hmacSecret = strapi.crypto.config.getHmacSecret();

// 获取 Token 密钥
const tokenSecret = strapi.crypto.config.getTokenSecret();

// 获取 RSA 密钥长度
const rsaKeyLength = strapi.crypto.config.getRsaKeyLength();
```

这些方法会按以下优先级读取配置：

1. `config/plugins.js` 中的配置
2. 环境变量
3. 空字符串（如果都未配置）

---

## 🌍 不同环境的配置

### 开发环境

```javascript
// config/env/development/plugins.js
module.exports = ({ env }) => ({
  'bag-strapi-plugin': {
    config: {
      crypto: {
        aesKey: 'dev-aes-key-32-chars-for-testing!!',
        hmacSecret: 'dev-hmac-secret',
        tokenSecret: 'dev-token-secret',
      },
    },
  },
});
```

### 生产环境

```javascript
// config/env/production/plugins.js
module.exports = ({ env }) => ({
  'bag-strapi-plugin': {
    config: {
      crypto: {
        // 生产环境使用环境变量
        aesKey: env('CRYPTO_AES_KEY'),
        hmacSecret: env('CRYPTO_HMAC_SECRET'),
        tokenSecret: env('CRYPTO_TOKEN_SECRET'),
        rsaKeyLength: 4096, // 生产环境使用更长的密钥
      },
    },
  },
});
```

---

## ⚠️ 安全建议

### 1. 使用强密钥

```javascript
// ❌ 不要使用弱密钥
aesKey: '12345'

// ✅ 使用强随机密钥
aesKey: 'xK9#mP2$vB7@wN4!qR6*tY8&uI1^aS5%'
```

### 2. 密钥长度

```javascript
// AES 密钥至少 32 字符
aesKey: 'at-least-32-characters-long-key!!'

// RSA 生产环境建议 4096 位
rsaKeyLength: 4096
```

### 3. 使用环境变量

```javascript
// ✅ 推荐
aesKey: env('CRYPTO_AES_KEY')

// ❌ 不推荐
aesKey: 'hardcoded-key-in-source-code'
```

### 4. 定期更换密钥

建立密钥轮换机制，定期更换加密密钥。

### 5. 不同用途使用不同密钥

```javascript
crypto: {
  aesKey: env('CRYPTO_AES_KEY'),        // 用于数据加密
  hmacSecret: env('CRYPTO_HMAC_SECRET'), // 用于 HMAC 签名
  tokenSecret: env('CRYPTO_TOKEN_SECRET'), // 用于 Token
}
```

---

## 🧪 测试配置

### 检查配置是否生效

```javascript
// 创建测试脚本 scripts/test-crypto-config.js
const strapi = require('@strapi/strapi');

(async () => {
  const app = await strapi().load();
  
  console.log('加密配置:');
  console.log('AES Key:', app.crypto.config.getAesKey());
  console.log('HMAC Secret:', app.crypto.config.getHmacSecret());
  console.log('Token Secret:', app.crypto.config.getTokenSecret());
  console.log('RSA Key Length:', app.crypto.config.getRsaKeyLength());
  
  await app.destroy();
})();
```

运行测试：

```bash
node scripts/test-crypto-config.js
```

---

## ❓ 常见问题

### Q1: 密钥未配置会怎样？

如果密钥未配置，调用加密方法时会抛出错误：

```javascript
const aesKey = strapi.crypto.config.getAesKey();
if (!aesKey) {
  throw new Error('AES 密钥未配置');
}
```

### Q2: 如何生成强密钥？

使用插件提供的随机数生成：

```javascript
// 生成 AES 密钥（32字符）
const aesKey = strapi.crypto.random.string(32);
console.log('AES Key:', aesKey);

// 生成 HMAC 密钥
const hmacSecret = strapi.crypto.random.string(32);
console.log('HMAC Secret:', hmacSecret);
```

或使用 Node.js：

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Q3: 可以在运行时修改配置吗？

不建议在运行时修改配置。如需更换密钥，应该：

1. 更新环境变量或配置文件
2. 重启 Strapi 应用

### Q4: 如何迁移已加密的数据？

如果需要更换密钥：

```javascript
// 1. 用旧密钥解密
const oldKey = 'old-aes-key-32-chars!!';
const decrypted = strapi.crypto.aes.decryptSimple(encrypted, oldKey);

// 2. 用新密钥加密
const newKey = strapi.crypto.config.getAesKey();
const reencrypted = strapi.crypto.aes.encryptSimple(decrypted, newKey);
```

---

## 📚 相关文档

- [加密工具完整指南](./CRYPTO_UTILS_GUIDE.md)
- [快速参考](./CRYPTO_QUICK_REFERENCE.md)
- [用户配置指南](./USER_CONFIG_GUIDE.md)

---

**版本**: 0.0.4  
**作者**: yanghang <470193837@qq.com>

