# 加密工具使用示例

## 🚀 快速开始

### 第一步：配置密钥

在 `.env` 文件中添加：

```env
CRYPTO_AES_KEY=my-super-strong-aes-key-32-chars!!
CRYPTO_HMAC_SECRET=my-hmac-secret-key
CRYPTO_TOKEN_SECRET=my-token-secret-key
```

在 `config/plugins.js` 中配置：

```javascript
module.exports = ({ env }) => ({
  'bag-strapi-plugin': {
    enabled: true,
    config: {
      crypto: {
        aesKey: env('CRYPTO_AES_KEY'),
        hmacSecret: env('CRYPTO_HMAC_SECRET'),
        tokenSecret: env('CRYPTO_TOKEN_SECRET'),
      },
    },
  },
});
```

---

## 💡 常用示例

### 1. 加密用户手机号

```javascript
// api/user/controllers/user.js
module.exports = {
  async create(ctx) {
    const { phone } = ctx.request.body;
    
    // 获取配置的密钥
    const aesKey = strapi.crypto.config.getAesKey();
    
    // 加密手机号
    const encryptedPhone = strapi.crypto.aes.encryptSimple(phone, aesKey);
    
    // 保存到数据库
    const user = await strapi.entityService.create('api::user.user', {
      data: { phone: encryptedPhone },
    });
    
    ctx.body = user;
  },
  
  async findOne(ctx) {
    const user = await strapi.entityService.findOne('api::user.user', ctx.params.id);
    const aesKey = strapi.crypto.config.getAesKey();
    
    // 解密手机号
    user.phone = strapi.crypto.aes.decryptSimple(user.phone, aesKey);
    
    ctx.body = user;
  },
};
```

### 2. 生成重置密码 Token

```javascript
// api/auth/controllers/auth.js
module.exports = {
  async forgotPassword(ctx) {
    const { email } = ctx.request.body;
    const tokenSecret = strapi.crypto.config.getTokenSecret();
    
    // 生成 Token
    const tokenData = {
      email,
      expires: Date.now() + 3600000,
      nonce: strapi.crypto.random.uuid(),
    };
    
    const token = strapi.crypto.base64.urlEncode(JSON.stringify(tokenData));
    const signature = strapi.crypto.hash.hmac(token, tokenSecret);
    
    const resetLink = `https://example.com/reset?token=${token}&sig=${signature}`;
    
    // 发送邮件...
    
    ctx.body = { message: '重置邮件已发送' };
  },
};
```

### 3. API 请求签名

```javascript
// api/payment/services/payment.js
module.exports = {
  async callThirdPartyAPI(orderData) {
    const hmacSecret = strapi.crypto.config.getHmacSecret();
    
    const timestamp = Date.now();
    const nonce = strapi.crypto.random.string(16);
    
    // 生成签名
    const signString = `${timestamp}${nonce}${JSON.stringify(orderData)}`;
    const signature = strapi.crypto.hash.hmac(signString, hmacSecret);
    
    // 调用 API
    const response = await fetch('https://api.example.com/pay', {
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

### 4. 密码哈希

```javascript
// api/auth/controllers/auth.js
module.exports = {
  async register(ctx) {
    const { email, password } = ctx.request.body;
    
    // 哈希密码
    const passwordHash = strapi.crypto.hash.sha256(password);
    
    // 创建用户
    const user = await strapi.entityService.create('api::user.user', {
      data: { email, password: passwordHash },
    });
    
    ctx.body = user;
  },
  
  async login(ctx) {
    const { email, password } = ctx.request.body;
    
    // 查找用户
    const user = await strapi.db.query('api::user.user').findOne({ where: { email } });
    
    // 验证密码
    const passwordHash = strapi.crypto.hash.sha256(password);
    if (user.password !== passwordHash) {
      return ctx.badRequest('密码错误');
    }
    
    // 生成 Token...
    ctx.body = { message: '登录成功' };
  },
};
```

### 5. 生成 API Key

```javascript
// api/api-key/controllers/api-key.js
module.exports = {
  async generate(ctx) {
    // 生成 API Key
    const apiKey = strapi.crypto.random.string(32);
    const apiSecret = strapi.crypto.random.string(64);
    
    // 哈希 Secret（只存储哈希）
    const secretHash = strapi.crypto.hash.sha256(apiSecret);
    
    // 保存到数据库
    await strapi.entityService.create('api::api-key.api-key', {
      data: {
        key: apiKey,
        secretHash: secretHash,
        user: ctx.state.user.id,
      },
    });
    
    // 只返回一次明文 Secret
    ctx.body = {
      apiKey,
      apiSecret, // 用户需要保存，之后无法再次查看
      message: '请妥善保管 API Secret，它只会显示一次',
    };
  },
};
```

### 6. 文件加密上传

```javascript
// api/file/controllers/file.js
const fs = require('fs').promises;

module.exports = {
  async uploadEncrypted(ctx) {
    const { files } = ctx.request;
    const file = files.file;
    const aesKey = strapi.crypto.config.getAesKey();
    
    // 读取文件
    const content = await fs.readFile(file.path, 'utf8');
    
    // 加密
    const encrypted = strapi.crypto.aes.encryptSimple(content, aesKey);
    
    // 保存
    const filename = `${strapi.crypto.random.uuid()}.enc`;
    await fs.writeFile(`./encrypted/${filename}`, encrypted);
    
    ctx.body = { filename };
  },
};
```

### 7. 数据签名验证

```javascript
// api/webhook/controllers/webhook.js
module.exports = {
  async receive(ctx) {
    const data = ctx.request.body;
    const receivedSignature = ctx.request.headers['x-signature'];
    const hmacSecret = strapi.crypto.config.getHmacSecret();
    
    // 验证签名
    const expectedSignature = strapi.crypto.hash.hmac(
      JSON.stringify(data),
      hmacSecret
    );
    
    if (receivedSignature !== expectedSignature) {
      return ctx.badRequest('签名验证失败');
    }
    
    // 处理数据...
    ctx.body = { message: '接收成功' };
  },
};
```

---

## 🔐 完整示例：用户系统

```javascript
// api/user/controllers/user.js
module.exports = {
  /**
   * 注册用户
   */
  async register(ctx) {
    const { email, password, phone, idCard } = ctx.request.body;
    
    const aesKey = strapi.crypto.config.getAesKey();
    
    // 1. 哈希密码
    const passwordHash = strapi.crypto.hash.sha256(password);
    
    // 2. 加密敏感信息
    const encryptedPhone = strapi.crypto.aes.encryptSimple(phone, aesKey);
    const encryptedIdCard = strapi.crypto.aes.encryptSimple(idCard, aesKey);
    
    // 3. 生成用户 UUID
    const userId = strapi.crypto.random.uuid();
    
    // 4. 创建用户
    const user = await strapi.entityService.create('api::user.user', {
      data: {
        userId,
        email,
        password: passwordHash,
        phone: encryptedPhone,
        idCard: encryptedIdCard,
      },
    });
    
    // 5. 生成登录 Token
    const tokenSecret = strapi.crypto.config.getTokenSecret();
    const tokenData = {
      userId: user.userId,
      email: user.email,
      expires: Date.now() + 86400000, // 24小时
    };
    
    const token = strapi.crypto.base64.urlEncode(JSON.stringify(tokenData));
    const signature = strapi.crypto.hash.hmac(token, tokenSecret);
    
    ctx.body = {
      user: {
        id: user.userId,
        email: user.email,
      },
      token: `${token}.${signature}`,
    };
  },
  
  /**
   * 获取用户信息
   */
  async me(ctx) {
    const user = await strapi.entityService.findOne(
      'api::user.user',
      ctx.state.user.id
    );
    
    const aesKey = strapi.crypto.config.getAesKey();
    
    // 解密敏感信息
    user.phone = strapi.crypto.aes.decryptSimple(user.phone, aesKey);
    user.idCard = strapi.crypto.aes.decryptSimple(user.idCard, aesKey);
    
    ctx.body = user;
  },
};
```

---

## 📖 更多文档

- [加密工具配置指南](./CRYPTO_CONFIG_GUIDE.md)
- [加密工具完整指南](./CRYPTO_UTILS_GUIDE.md)
- [快速参考](./CRYPTO_QUICK_REFERENCE.md)

---

**提示**：所有示例都使用 `strapi.crypto.config.getXXX()` 方法获取配置的密钥，确保密钥可以通过配置文件或环境变量灵活设置。

